import json
import re

from django.conf import settings
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core import signing
from django.db import transaction
from django.http import FileResponse, Http404, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.clickjacking import xframe_options_sameorigin
from django.views.decorators.http import require_POST

from billing.models import Order
from core.models import PlatformSettings
from core.ratelimit import ratelimit
from core.utils import client_ip, shared_path
from crm.models import log_activity
from templates_lib.categories import categories, category, colour_presets, fonts
from templates_lib.models import Template

from . import services
from .forms import AbuseReportForm, CreateProjectForm, VerificationForm
from .images import ImageRejected, process_upload
from .models import AbuseReport, Download, Project, ProjectImage
from .publish import build_download_zip, publish_project, render_index, site_data

DOWNLOAD_LINK_SECONDS = 600


def owned(request, pk):
    return get_object_or_404(Project, pk=pk, owner=request.user)


# ---------------------------------------------------------------------------
# Template gallery and "Use this design"
# ---------------------------------------------------------------------------
def template_gallery(request):
    qs = Template.objects.filter(is_active=True)
    cat, city, q = request.GET.get("category", ""), request.GET.get("city", ""), request.GET.get("q", "").strip()
    if cat:
        qs = qs.filter(category=cat)
    if city:
        qs = qs.filter(city_label__iexact=city)
    if q:
        from django.db.models import Q
        qs = qs.filter(Q(name__icontains=q) | Q(category__icontains=q) | Q(sample_name__icontains=q)
                       | Q(tagline__icontains=q) | Q(city_label__icontains=q))
    all_active = Template.objects.filter(is_active=True)
    cats = categories()
    return render(request, "projects/templates.html", {
        "templates": qs,
        "category_options": [(k, cats[k]["title"]) for k in cats if all_active.filter(category=k).exists()],
        "city_options": sorted(set(all_active.exclude(city_label="").values_list("city_label", flat=True))),
        "f": {"category": cat, "city": city, "q": q},
    })


def start_with_template(request, slug):
    """Target of every "Use this design" button."""
    template = get_object_or_404(Template, slug=slug, is_active=True)
    if not request.user.is_authenticated:
        request.session["signup_source"] = "design:%s" % slug
        request.session["signup_category"] = template.category      # pre-selects "Type of business"
        return redirect("%s?next=%s" % (reverse("account_signup"), reverse("start", args=[slug])))
    return redirect("%s?template=%s" % (reverse("dashboard"), slug))


# ---------------------------------------------------------------------------
# Dashboard + create
# ---------------------------------------------------------------------------
@login_required
def dashboard(request):
    ps = PlatformSettings.load()
    projects = (Project.objects.filter(owner=request.user).select_related("template")
                .prefetch_related("orders", "verifications"))
    tpl = None
    slug = request.GET.get("template")
    if slug:
        tpl = Template.objects.filter(slug=slug, is_active=True).first()
    return render(request, "projects/dashboard.html", {
        "projects": projects,
        "open_template": tpl,
        # pre-filled from the business details given at signup
        "create_form": CreateProjectForm(initial={
            "template": tpl.slug if tpl else "",
            "category": tpl.category if tpl else request.user.business_category,
            "business_name": request.user.business_name if not projects.exists() else ""}),
        "can_create": request.user.is_team or projects.count() < ps.max_projects_per_user,
        "orders": Order.objects.filter(user=request.user, status__in=["paid", "refunded"])[:5],
    })


@login_required
@require_POST
@ratelimit("create-project", 10, 3600)
def create(request):
    form = CreateProjectForm(request.POST)
    if not form.is_valid():
        for errs in form.errors.values():
            messages.error(request, errs[0])
        return redirect("dashboard")
    tpl = form.cleaned_data["template_obj"]
    try:
        project = services.create_project(request.user, tpl, form.cleaned_data["business_name"],
                                          form.cleaned_data["category"])
    except services.LimitReached as e:
        messages.error(request, str(e))
        return redirect("dashboard")
    messages.success(request, "Your website for %s is ready. Add your details to make it yours." % project.business_name)
    return redirect("%s?new=%d" % (reverse("dashboard"), project.pk))


@login_required
@require_POST
def delete(request, pk):
    project = owned(request, pk)
    if project.orders.exists() or project.status not in (Project.DRAFT, Project.PREVIEW, Project.PENDING_PAYMENT):
        messages.error(request, "This website has a payment, so it can't be deleted. Please contact support.")
        return redirect("dashboard")
    name = project.business_name
    publish_project(project, "unpublish")
    for im in project.images.all():
        im.file.delete(save=False)
    project.delete()
    messages.success(request, "%s was deleted." % name)
    return redirect("dashboard")


# ---------------------------------------------------------------------------
# Editor
# ---------------------------------------------------------------------------
STEPS = [
    ("basics", "Basics", "बुनियादी जानकारी"),
    ("about", "About & highlights", "परिचय और खास बातें"),
    ("services", "Services", "सेवाएँ"),
    ("photos", "Photos", "फ़ोटो"),
    ("hours", "Opening hours", "खुलने का समय"),
    ("reviews", "Reviews & FAQ", "रिव्यू और सवाल"),
    ("look", "Look & feel", "रंग और डिज़ाइन"),
    ("seo", "Social & SEO", "सोशल और SEO"),
]


@login_required
def editor(request, pk):
    project = owned(request, pk)
    if project.status == Project.SUSPENDED:
        messages.error(request, "This website is suspended. Please contact support.")
        return redirect("dashboard")
    ps = PlatformSettings.load()
    cat = category(project.category)
    steps = []
    for key, en, hi in STEPS:
        if key == "services":
            en, hi = cat["services_label"]
        steps.append({"key": key, "en": en, "hi": hi})
    images = [{"id": im.pk, "path": im.data_path, "url": im.file.url, "kind": im.kind, "w": im.width, "h": im.height}
              for im in project.images.all()]
    return render(request, "projects/editor.html", {
        "project": project,
        "steps": steps,
        "step": request.GET.get("step", "basics"),
        "shared_assets": shared_path(),
        "editor_config": {
            "projectId": project.pk,
            "data": project.data,
            "saveUrl": reverse("autosave", args=[project.pk]),
            "uploadUrl": reverse("upload_image", args=[project.pk]),
            "deleteImageUrl": reverse("delete_image", args=[project.pk, 0]),
            "frameUrl": reverse("editor_frame", args=[project.pk]),
            "imagesBase": reverse("editor_frame", args=[project.pk]),
            "images": images,
            "steps": steps,
            "startStep": request.GET.get("step", "basics"),
            "stepsDone": project.steps_done,
            "categories": [{"key": k, "title": c["title"], "services": c["services_label"], "preset": c["preset"]}
                           for k, c in categories().items()],
            "fonts": fonts(),
            "presets": colour_presets(),
            "isLive": project.is_live_mode,
            "plan": project.plan,
            "storageUsed": services.storage_used(request.user),
            "storageLimit": ps.storage_limit_mb * 1024 * 1024,
        },
    })


@login_required
@xframe_options_sameorigin
def editor_frame(request, pk):
    """The real template rendering the project's data; the editor sends unsaved changes with postMessage."""
    project = owned(request, pk)
    data = site_data(project)
    page = render_index(data, mode="editor", page_url=project.site_url, asset_base=shared_path(), inline_data=True)
    bridge = '<script src="%s" defer></script>\n  <script src="%sjs/themes.js"' % (
        settings.STATIC_URL + "js/editor-bridge.js", shared_path())
    page = page.replace('<script src="%sjs/themes.js"' % shared_path(), bridge, 1)
    resp = HttpResponse(page)
    resp["Cache-Control"] = "no-store"
    return resp


@login_required
def frame_image(request, pk, name):
    project = owned(request, pk)
    im = next((i for i in project.images.all() if i.filename == name), None)
    if im is None:
        raise Http404
    return FileResponse(im.file.open("rb"))


@login_required
@require_POST
@ratelimit("autosave", 60, 60)
def autosave(request, pk):
    project = owned(request, pk)
    if project.status == Project.SUSPENDED:
        return JsonResponse({"ok": False, "error": "This website is suspended."}, status=403)
    try:
        body = json.loads(request.body.decode("utf-8"))
    except (ValueError, UnicodeDecodeError):
        return JsonResponse({"ok": False, "error": "Invalid request."}, status=400)
    step = body.get("step") if isinstance(body.get("step"), str) else None
    complete = bool(body.get("complete"))
    ok, errors = services.save_project_data(project, body.get("data"), user=request.user,
                                            step=step if complete else None)
    if not ok:
        return JsonResponse({"ok": False, "errors": errors}, status=422)
    project.refresh_from_db()
    return JsonResponse({"ok": True, "savedAt": timezone.localtime(project.last_edited_at).strftime("%H:%M:%S"),
                         "status": project.get_status_display(), "stepsDone": project.steps_done,
                         "live": project.is_live_mode})


@login_required
@require_POST
@ratelimit("upload", 40, 3600)
def upload_image(request, pk):
    project = owned(request, pk)
    ps = PlatformSettings.load()
    f = request.FILES.get("file")
    kind = request.POST.get("kind", "other")
    if kind not in dict(ProjectImage.KIND_CHOICES):
        kind = "other"
    if not f:
        return JsonResponse({"ok": False, "error": "No file received."}, status=400)
    if project.images.count() >= 60:
        return JsonResponse({"ok": False, "error": "This website already has 60 photos. Delete some first."}, status=400)
    try:
        content, w, h = process_upload(f, keep_transparency=(kind == "logo"))
    except ImageRejected as e:
        return JsonResponse({"ok": False, "error": str(e)}, status=400)
    limit = ps.storage_limit_mb * 1024 * 1024
    if services.storage_used(request.user) + content.size > limit:
        return JsonResponse({"ok": False, "error": "Your photo storage is full (%d MB). Delete some photos first."
                             % ps.storage_limit_mb}, status=400)
    im = ProjectImage(project=project, kind=kind, width=w, height=h, size=content.size)
    im.file.save(content.name, content, save=True)
    return JsonResponse({"ok": True, "image": {"id": im.pk, "path": im.data_path, "url": im.file.url,
                                               "kind": kind, "w": w, "h": h, "size": im.size}})


def _remove_refs(value, path):
    if isinstance(value, str):
        return "" if value == path else value
    if isinstance(value, list):
        out = []
        for v in value:
            if v == path or (isinstance(v, dict) and v.get("src") == path):
                continue
            out.append(_remove_refs(v, path))
        return out
    if isinstance(value, dict):
        return {k: _remove_refs(v, path) for k, v in value.items()}
    return value


@login_required
@require_POST
def delete_image(request, pk, image_id):
    project = owned(request, pk)
    im = get_object_or_404(ProjectImage, pk=image_id, project=project)
    path = im.data_path
    data = _remove_refs(project.data, path)
    if data != project.data:
        services.save_project_data(project, data, user=request.user, note="Photo deleted")
    im.file.delete(save=False)
    im.delete()
    project.refresh_from_db()
    publish_project(project)
    return JsonResponse({"ok": True, "data": project.data})


# ---------------------------------------------------------------------------
# Preview, go live, verification, download
# ---------------------------------------------------------------------------
@login_required
def open_preview(request, pk):
    project = owned(request, pk)
    if project.published_mode in ("", "unavailable") or project.published_mode != _expected_mode(project):
        publish_project(project)
    project.last_preview_at = timezone.now()
    project.save(update_fields=["last_preview_at"])
    log_activity(request.user, "preview_opened", project)
    return redirect(project.public_url)


def _expected_mode(project):
    from .publish import mode_for
    return mode_for(project)


@login_required
def go_live(request, pk):
    project = owned(request, pk)
    log_activity(request.user, "go_live_clicked", project)
    if project.required_missing:
        messages.warning(request, "Please fill in your phone number and address first (step 1).")
        return redirect("%s?step=basics" % reverse("editor", args=[pk]))
    if not project.plan_choosable:
        return redirect("dashboard")
    return render(request, "projects/go_live.html", {"project": project})


@login_required
def verify(request, pk):
    project = owned(request, pk)
    if project.status != Project.PENDING_VERIFICATION:
        return redirect("dashboard")
    existing = project.verifications.filter(decision="pending").first()
    form = VerificationForm(request.POST or None, request.FILES or None, instance=existing)
    if request.method == "POST" and form.is_valid():
        vr = form.save(commit=False)
        vr.project = project
        vr.save()
        log_activity(request.user, "verification_submitted", project)
        messages.success(request, "Thank you! Our team will verify your business and call you within 24 hours.")
        return redirect("dashboard")
    return render(request, "projects/verify.html", {"project": project, "form": form})


@login_required
@require_POST
@ratelimit("download", 20, 3600)
def request_download(request, pk):
    project = owned(request, pk)
    if not project.can_download:
        messages.error(request, "The download unlocks after payment and verification.")
        return redirect("dashboard")
    token = signing.TimestampSigner(salt="download").sign("%d:%d" % (project.pk, request.user.pk))
    return redirect("download_file", token=token)


def download_file(request, token):
    """Signed link, valid for 10 minutes. Builds a fresh ZIP from the latest data every time."""
    try:
        value = signing.TimestampSigner(salt="download").unsign(token, max_age=DOWNLOAD_LINK_SECONDS)
        pid, uid = (int(x) for x in value.split(":"))
    except (signing.BadSignature, ValueError):
        return render(request, "projects/link_expired.html", status=410)
    project = get_object_or_404(Project, pk=pid, owner_id=uid)
    if not project.can_download:
        raise Http404
    blob = build_download_zip(project)
    Download.objects.create(project=project, user_id=uid, ip=client_ip(request), file_size=len(blob))
    log_activity(project.owner, "downloaded", project)
    resp = HttpResponse(blob, content_type="application/zip")
    resp["Content-Disposition"] = 'attachment; filename="%s-website.zip"' % project.slug
    resp["Cache-Control"] = "no-store"
    return resp


# ---------------------------------------------------------------------------
# Public: report a website
# ---------------------------------------------------------------------------
@ratelimit("abuse", 5, 3600)
def report_site(request, slug):
    if not re.match(r"^[a-z0-9-]{1,60}$", slug):
        raise Http404
    project = Project.objects.filter(slug=slug).first()
    form = AbuseReportForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        with transaction.atomic():
            AbuseReport.objects.create(project=project, site_slug=slug, reporter_email=form.cleaned_data["email"],
                                       reason=form.cleaned_data["reason"], ip=client_ip(request))
        return render(request, "projects/report_done.html", {"slug": slug})
    return render(request, "projects/report.html", {"form": form, "slug": slug, "project": project})
