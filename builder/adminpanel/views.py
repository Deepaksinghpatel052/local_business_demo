import csv
from datetime import timedelta

from django import forms
from django.conf import settings
from django.contrib import messages
from django.core.management import call_command
from django.core.paginator import Paginator
from django.db.models import Count, Max, Q, Sum
from django.http import FileResponse, Http404, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST

from accounts.models import User
from billing.models import Order
from billing.services import refund_order
from core.audit import audit
from core.models import AuditLog, PlatformSettings
from core.utils import format_mobile, wa_link
from crm.models import FUNNEL, ActivityLog, LeadNote
from projects import workflow
from projects.models import AbuseReport, Project, ProjectVersion, VerificationRequest
from projects.publish import publish_project
from projects.services import restore_version
from templates_lib.categories import categories
from templates_lib.models import Template

from . import emails
from .domain import clean_domain, install_commands, server_block
from .permissions import Perms, can, team_required


def ctx(request, **kw):
    kw["perms_ui"] = Perms(request.user)
    kw["counts"] = {
        "verification": Project.objects.filter(status=Project.PENDING_VERIFICATION).count(),
        "abuse": AbuseReport.objects.filter(status=AbuseReport.OPEN).count(),
        "followups": LeadNote.objects.filter(done=False, follow_up_date__lte=timezone.localdate()).count(),
    }
    return kw


def owners():
    return User.objects.filter(is_staff=False, is_superuser=False, groups__isnull=True)


# ---------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------
@team_required("view_overview")
def overview(request):
    now = timezone.now()
    today = timezone.localtime(now).replace(hour=0, minute=0, second=0, microsecond=0)
    week = today - timedelta(days=today.weekday())
    month = today.replace(day=1)
    next_month = (month + timedelta(days=32)).replace(day=1)
    users = owners()
    paid = Order.objects.filter(status=Order.PAID, is_demo=False)
    funnel = []
    for event, label in FUNNEL:
        if event == "signed_up":
            n = users.count()
        else:
            n = ActivityLog.objects.filter(event=event, user__in=users).values("user").distinct().count()
        funnel.append({"label": label, "n": n})
    stats = {
        "signups_today": users.filter(date_joined__gte=today).count(),
        "signups_week": users.filter(date_joined__gte=week).count(),
        "projects": Project.objects.count(),
        "projects_week": Project.objects.filter(created_at__gte=week).count(),
        "previews": ActivityLog.objects.filter(event="preview_opened").values("project").distinct().count(),
        "paid": Order.objects.filter(status=Order.PAID).values("project").distinct().count(),
        "live": Project.objects.filter(status=Project.LIVE).count(),
        "renewals_due": Project.objects.filter(plan=Project.PLAN_HOSTED, hosting_expires_at__gte=month,
                                               hosting_expires_at__lt=next_month).count(),
        "revenue_month": (paid.filter(paid_at__gte=month).aggregate(s=Sum("amount"))["s"] or 0) / 100,
        "pending_verification": Project.objects.filter(status=Project.PENDING_VERIFICATION).count(),
    }
    return render(request, "adminpanel/overview.html", ctx(request, stats=stats, funnel=funnel,
                  recent=ActivityLog.objects.select_related("user", "project")[:12]))


# ---------------------------------------------------------------------------
# Leads (CRM)
# ---------------------------------------------------------------------------
def lead_rows(users):
    """Attach funnel stage, business, last activity to each user."""
    users = list(users)
    ids = [u.pk for u in users]
    events = {}
    for uid, ev in ActivityLog.objects.filter(user_id__in=ids).values_list("user_id", "event").distinct():
        events.setdefault(uid, set()).add(ev)
    last = dict(ActivityLog.objects.filter(user_id__in=ids).values("user_id").annotate(m=Max("created_at"))
                .values_list("user_id", "m"))
    projects = {}
    for p in Project.objects.filter(owner_id__in=ids).order_by("created_at"):
        projects.setdefault(p.owner_id, []).append(p)
    order = [e for e, _ in FUNNEL]
    labels = dict(FUNNEL)
    for u in users:
        ev = events.get(u.pk, set()) | {"signed_up"}
        stage = max((order.index(e) for e in ev if e in order), default=0)
        u.stage_key, u.stage = order[stage], labels[order[stage]]
        u.last_activity = last.get(u.pk) or u.date_joined
        u.lead_projects = projects.get(u.pk, [])
        p = u.lead_projects[0] if u.lead_projects else None
        # the website's details once one exists, else what the owner told us at signup
        u.lead_business = p.business_name if p else u.business_name
        u.lead_category = p.category_info["title"] if p else u.business_category_title
        u.call_link = "tel:+91" + u.mobile if u.mobile else ""
        u.wa_link = wa_link(u.whatsapp or u.mobile, whatsapp_message(u, p))
        u.mobile_display = format_mobile(u.mobile)
    return users


def whatsapp_message(user, project):
    name = user.first_name
    if project is None:
        if user.business_name:
            return ("Namaste %s, this is Devnixplus. Can we help you create the website for %s?"
                    % (name, user.business_name))
        return "Namaste %s, this is Devnixplus. Can we help you create your business website?" % name
    if project.status == Project.LIVE:
        return "Namaste %s, this is Devnixplus. How is your website for %s working for you?" % (name, project.business_name)
    return ("Namaste %s, this is Devnixplus. Your website for %s is ready to go live. "
            "Can I help you with the next step?" % (name, project.business_name))


def filtered_leads(request):
    qs = owners()
    q = request.GET.get("q", "").strip()
    if q:
        qs = qs.filter(Q(name__icontains=q) | Q(email__icontains=q) | Q(mobile__icontains=q) | Q(city__icontains=q)
                       | Q(business_name__icontains=q) | Q(business_area__icontains=q)
                       | Q(projects__business_name__icontains=q)).distinct()
    if request.GET.get("city"):
        qs = qs.filter(city__iexact=request.GET["city"])
    if request.GET.get("category"):
        cat = request.GET["category"]
        qs = qs.filter(Q(business_category=cat) | Q(projects__category=cat)).distinct()
    if request.GET.get("consent") == "yes":
        qs = qs.filter(contact_consent=True)
    elif request.GET.get("consent") == "no":
        qs = qs.filter(contact_consent=False)
    if request.GET.get("followup") == "today":
        qs = qs.filter(lead_notes__done=False, lead_notes__follow_up_date__lte=timezone.localdate()).distinct()
    return qs.order_by("-date_joined")


@team_required("view_leads")
def leads(request):
    qs = filtered_leads(request)
    stage = request.GET.get("stage", "")
    if stage:
        rows = [u for u in lead_rows(qs) if u.stage_key == stage]
        page = Paginator(rows, 50).get_page(request.GET.get("page"))
    else:
        page = Paginator(qs, 50).get_page(request.GET.get("page"))
        page.object_list = lead_rows(page.object_list)
    followups = (LeadNote.objects.filter(done=False, follow_up_date__lte=timezone.localdate())
                 .select_related("user", "author").order_by("follow_up_date")[:20])
    return render(request, "adminpanel/leads.html", ctx(
        request, page=page, followups=followups, funnel=FUNNEL, f=request.GET,
        cities=sorted(set(owners().exclude(city="").values_list("city", flat=True))),
        category_options=[(k, c["title"]) for k, c in categories().items()]))


@team_required("export_leads")
def leads_export(request):
    marketing = request.GET.get("marketing") == "1"
    qs = filtered_leads(request)
    if marketing:   # never export people who didn't agree to marketing
        qs = qs.filter(contact_consent=True, marketing_consent=True)
    rows = lead_rows(qs)
    resp = HttpResponse(content_type="text/csv; charset=utf-8")
    resp["Content-Disposition"] = 'attachment; filename="%s-%s.csv"' % (
        "marketing" if marketing else "leads", timezone.localdate().isoformat())
    resp.write("﻿")
    w = csv.writer(resp)
    w.writerow(["Name", "Email", "Mobile", "WhatsApp", "City", "Business", "Category", "Area", "Google Maps",
                "Websites", "Stage", "Last activity", "Contact consent", "Marketing consent", "Signed up", "Source"])
    for u in rows:
        w.writerow([u.name, u.email, u.mobile, u.whatsapp, u.city, u.lead_business, u.lead_category, u.business_area,
                    u.business_maps_link, len(u.lead_projects), u.stage,
                    timezone.localtime(u.last_activity).strftime("%Y-%m-%d %H:%M"),
                    "yes" if u.contact_consent else "NO", "yes" if u.marketing_consent else "no",
                    timezone.localtime(u.date_joined).strftime("%Y-%m-%d"), u.signup_source])
    audit(request, "leads_exported", None, marketing=marketing, rows=len(rows))
    return resp


class NoteForm(forms.ModelForm):
    class Meta:
        model = LeadNote
        fields = ["note", "follow_up_date"]
        widgets = {"note": forms.Textarea(attrs={"rows": 2}), "follow_up_date": forms.DateInput(attrs={"type": "date"})}


@team_required("view_leads")
def lead_detail(request, pk):
    user = get_object_or_404(owners(), pk=pk)
    form = NoteForm(request.POST or None)
    if request.method == "POST":
        if not can(request.user, "edit_leads"):
            messages.error(request, "You can't add notes.")
        elif form.is_valid():
            note = form.save(commit=False)
            note.user, note.author = user, request.user
            note.save()
            messages.success(request, "Note saved.")
            return redirect("manage_lead", pk=pk)
    row = lead_rows([user])[0]
    return render(request, "adminpanel/lead_detail.html", ctx(
        request, lead=row, form=form, notes=user.lead_notes.select_related("author"),
        activities=user.activities.select_related("project")[:100],
        orders=Order.objects.filter(user=user).select_related("project")))


@team_required("edit_leads")
@require_POST
def note_done(request, pk):
    note = get_object_or_404(LeadNote, pk=pk)
    note.done = True
    note.save(update_fields=["done"])
    return redirect(request.POST.get("next") or "manage_leads")


# ---------------------------------------------------------------------------
# Verification
# ---------------------------------------------------------------------------
@team_required("view_verification")
def verification_queue(request):
    projects = (Project.objects.filter(status=Project.PENDING_VERIFICATION).select_related("owner")
                .prefetch_related("verifications").order_by("-flagged", "updated_at"))
    return render(request, "adminpanel/verification.html", ctx(request, projects=projects))


@team_required("view_verification")
def verification_file(request, pk, field):
    """Proof documents are never public: only the team can open them."""
    if field not in ("shop_photo", "visiting_card"):
        raise Http404
    vr = get_object_or_404(VerificationRequest, pk=pk)
    f = getattr(vr, field)
    if not f:
        raise Http404
    return FileResponse(f.open("rb"))


class RejectForm(forms.Form):
    reason = forms.CharField(max_length=300, widget=forms.Textarea(attrs={"rows": 2}))


@team_required("decide_verification")
@require_POST
def verification_decide(request, pk):
    project = get_object_or_404(Project, pk=pk, status=Project.PENDING_VERIFICATION)
    if request.POST.get("decision") == "approve":
        if not project.verifications.filter(decision=VerificationRequest.PENDING).exists():
            messages.error(request, "The owner hasn't sent the verification details yet.")
            return redirect("manage_project", pk=pk)
        workflow.approve(project, request.user)
        audit(request, "verification_approved", project)
        messages.success(request, "%s approved." % project)
    else:
        form = RejectForm(request.POST)
        if not form.is_valid():
            messages.error(request, "Please write the reason for rejecting.")
            return redirect("manage_project", pk=pk)
        refunds = workflow.reject(project, request.user, form.cleaned_data["reason"])
        audit(request, "verification_rejected", project, reason=form.cleaned_data["reason"],
              refunds=[o.refund_status for o in refunds])
        messages.warning(request, "%s rejected; %d payment(s) refunded." % (project, len(refunds)))
    return redirect("manage_verification")


# ---------------------------------------------------------------------------
# Projects
# ---------------------------------------------------------------------------
@team_required("view_projects")
def projects(request):
    qs = Project.objects.select_related("owner")
    f = request.GET
    if f.get("status"):
        qs = qs.filter(status=f["status"])
    if f.get("plan"):
        qs = qs.filter(plan=f["plan"])
    if f.get("flagged"):
        qs = qs.filter(flagged=True)
    if f.get("expiring"):
        qs = qs.filter(hosting_expires_at__lte=timezone.now() + timedelta(days=30)).order_by("hosting_expires_at")
    if f.get("q"):
        q = f["q"].strip()
        qs = qs.filter(Q(business_name__icontains=q) | Q(slug__icontains=q) | Q(owner__email__icontains=q)
                       | Q(owner__mobile__icontains=q) | Q(custom_domain__icontains=q))
    page = Paginator(qs, 50).get_page(f.get("page"))
    return render(request, "adminpanel/projects.html", ctx(request, page=page, f=f, statuses=Project.STATUS_CHOICES,
                                                            plans=Project.PLAN_CHOICES))


class DomainForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = ["custom_domain", "dns_pointed", "ssl_issued", "domain_checked"]
        labels = {"dns_pointed": "DNS points to our server", "ssl_issued": "SSL certificate issued",
                  "domain_checked": "Checked in a browser"}

    def clean_custom_domain(self):
        v = self.cleaned_data.get("custom_domain", "")
        if not v:
            return ""
        d = clean_domain(v)
        if not d:
            raise forms.ValidationError("Enter a domain like sharmasweets.com")
        return d


@team_required("view_projects")
def project_detail(request, pk):
    project = get_object_or_404(Project.objects.select_related("owner", "template"), pk=pk)
    domain_form = DomainForm(request.POST or None, instance=project, prefix="dom")
    if request.method == "POST" and "dom-custom_domain" in request.POST:
        if not can(request.user, "edit_domain"):
            messages.error(request, "You can't change domains.")
        elif domain_form.is_valid():
            domain_form.save()
            audit(request, "domain_updated", project, **{k: domain_form.cleaned_data[k] for k in domain_form.cleaned_data})
            if project.status == Project.LIVE:
                publish_project(project, "live")
            messages.success(request, "Domain details saved.")
            return redirect("manage_project", pk=pk)
    return render(request, "adminpanel/project_detail.html", ctx(
        request, p=project, domain_form=domain_form, reject_form=RejectForm(),
        versions=project.versions.select_related("created_by")[:30],
        verifications=project.verifications.select_related("reviewer"),
        orders=project.orders.all(), downloads=project.downloads.all()[:20],
        reports=project.abuse_reports.all(),
        nginx_block=server_block(project) if project.custom_domain else "",
        install=install_commands(project) if project.custom_domain else "",
        activities=project.activities.all()[:30],
        audit_log=AuditLog.objects.filter(target_type="project", target_id=str(project.pk))[:30]))


@team_required("go_live")
@require_POST
def project_go_live(request, pk):
    project = get_object_or_404(Project, pk=pk)
    try:
        workflow.go_live(project, request.user)
    except ValueError as e:
        messages.error(request, str(e))
        return redirect("manage_project", pk=pk)
    audit(request, "go_live", project)
    messages.success(request, "%s is live at %s" % (project, project.public_url))
    return redirect("manage_project", pk=pk)


@team_required("suspend")
@require_POST
def project_suspend(request, pk):
    project = get_object_or_404(Project, pk=pk)
    if request.POST.get("action") == "reactivate":
        workflow.reactivate(project)
        audit(request, "reactivated", project)
        messages.success(request, "%s reactivated." % project)
    else:
        reason = request.POST.get("reason", "").strip()[:300]
        workflow.suspend(project, reason)
        audit(request, "suspended", project, reason=reason)
        messages.warning(request, "%s suspended. The site shows a 'temporarily unavailable' page." % project)
    return redirect("manage_project", pk=pk)


@team_required("restore_version")
@require_POST
def project_restore(request, pk, version_id):
    project = get_object_or_404(Project, pk=pk)
    version = get_object_or_404(ProjectVersion, pk=version_id, project=project)
    ok, errors = restore_version(project, version, request.user)
    if ok:
        audit(request, "version_restored", project, version=version.pk)
        messages.success(request, "Version restored and published.")
    else:
        messages.error(request, "That version no longer passes validation: %s" % errors[0]["message"])
    return redirect("manage_project", pk=pk)


@team_required("view_projects")
@require_POST
def project_republish(request, pk):
    project = get_object_or_404(Project, pk=pk)
    publish_project(project)
    audit(request, "republished", project, mode=project.published_mode)
    messages.success(request, "Republished (%s)." % project.published_mode)
    return redirect("manage_project", pk=pk)


# ---------------------------------------------------------------------------
# Payments
# ---------------------------------------------------------------------------
@team_required("view_payments")
def payments(request):
    qs = Order.objects.select_related("user", "project")
    f = request.GET
    if f.get("status"):
        qs = qs.filter(status=f["status"])
    if f.get("type"):
        qs = qs.filter(type=f["type"])
    if f.get("q"):
        q = f["q"].strip()
        qs = qs.filter(Q(razorpay_order_id__icontains=q) | Q(razorpay_payment_id__icontains=q)
                       | Q(invoice_number__icontains=q) | Q(user__email__icontains=q) | Q(project__slug__icontains=q))
    totals = Order.objects.filter(status=Order.PAID, is_demo=False).aggregate(s=Sum("amount"), n=Count("pk"))
    page = Paginator(qs, 50).get_page(f.get("page"))
    return render(request, "adminpanel/payments.html", ctx(request, page=page, f=f, totals=totals,
                                                            statuses=Order.STATUSES, types=Order.TYPES))


@team_required("refund")
@require_POST
def payment_refund(request, pk):
    order = get_object_or_404(Order, pk=pk)
    reason = request.POST.get("reason", "").strip() or "Refund by Devnixplus team"
    order = refund_order(order, reason)
    audit(request, "refund", order, reason=reason, status=order.refund_status)
    if order.refund_status == Order.REFUND_FAILED:
        messages.error(request, "Refund failed: %s" % order.refund_reason)
    else:
        messages.success(request, "Refund %s." % order.get_refund_status_display().lower())
    return redirect("manage_payments")


# ---------------------------------------------------------------------------
# Templates, abuse reports, settings, audit
# ---------------------------------------------------------------------------
@team_required("manage_templates")
def templates(request):
    if request.method == "POST":
        action = request.POST.get("action")
        if action == "import":
            call_command("import_templates")
            audit(request, "templates_imported")
            messages.success(request, "Templates re-imported from demos/sample-*.")
        elif action == "save":
            for t in Template.objects.all():
                t.is_active = request.POST.get("active-%d" % t.pk) == "on"
                try:
                    t.sort_order = max(0, int(request.POST.get("order-%d" % t.pk, t.sort_order)))
                except ValueError:
                    pass
                t.save(update_fields=["is_active", "sort_order"])
            audit(request, "templates_updated")
            messages.success(request, "Templates saved.")
        return redirect("manage_templates")
    return render(request, "adminpanel/templates.html", ctx(
        request, templates=Template.objects.annotate(n=Count("project"))))


@team_required("view_abuse")
def abuse(request):
    if request.method == "POST":
        report = get_object_or_404(AbuseReport, pk=request.POST.get("report"))
        status = request.POST.get("status")
        if status in dict(AbuseReport.STATUSES):
            report.status = status
            report.save(update_fields=["status"])
            audit(request, "abuse_report_" + status, report.project, report=report.pk)
        return redirect("manage_abuse")
    reports = AbuseReport.objects.select_related("project")
    return render(request, "adminpanel/abuse.html", ctx(request, reports=reports, statuses=AbuseReport.STATUSES))


class SettingsForm(forms.ModelForm):
    class Meta:
        model = PlatformSettings
        exclude = ["updated_at"]
        widgets = {"sensitive_words": forms.Textarea(attrs={"rows": 3})}


@team_required("edit_settings")
def settings_view(request):
    ps = PlatformSettings.load()
    ps = PlatformSettings.objects.get(pk=ps.pk)
    form = SettingsForm(request.POST or None, instance=ps)
    if request.method == "POST" and form.is_valid():
        before = {f: getattr(ps, f) for f in form.changed_data}
        form.save()
        audit(request, "settings_changed", ps, changed={k: str(v) for k, v in before.items()})
        messages.success(request, "Settings saved.")
        return redirect("manage_settings")
    return render(request, "adminpanel/settings.html", ctx(request, form=form))


class TestEmailForm(forms.Form):
    to = forms.EmailField(label="Send to")
    sample = forms.ChoiceField(label="Email", choices=lambda: [("all", "All of them")] + emails.samples())


@team_required("edit_settings")
def email_test(request):
    """Preview every email and send test copies, to check the logo, branding and SMTP settings."""
    form = TestEmailForm(request.POST or None, initial={"to": request.user.email, "sample": "all"})
    if request.method == "POST" and form.is_valid():
        to, key = form.cleaned_data["to"], form.cleaned_data["sample"]
        keys = [k for k, _ in emails.samples()] if key == "all" else [key]
        try:
            for k in keys:
                emails.send(k, request.user, to)
        except Exception as e:
            messages.error(request, "Sending failed: %s" % e)
        else:
            audit(request, "test_email_sent", to=to, emails=keys)
            messages.success(request, "%d test email%s sent to %s. Check the inbox (and spam)." % (
                len(keys), "" if len(keys) == 1 else "s", to))
            return redirect("manage_emails")
    return render(request, "adminpanel/emails.html", ctx(
        request, form=form, samples=emails.samples(), shown=request.GET.get("show") or emails.samples()[0][0],
        logo_url=emails.brand_context()["logo_url"], brand_name=settings.EMAIL_BRAND_NAME,
        from_email=settings.DEFAULT_FROM_EMAIL, email_backend=settings.EMAIL_BACKEND.rsplit(".", 1)[-1],
        email_host=getattr(settings, "EMAIL_HOST", "")))


@team_required("edit_settings")
def email_preview(request, key):
    try:
        _, _, html = emails.render(key, request.user)
    except KeyError:
        raise Http404
    resp = HttpResponse(html)
    resp["X-Frame-Options"] = "SAMEORIGIN"
    return resp


@team_required("view_audit")
def audit_log(request):
    page = Paginator(AuditLog.objects.select_related("actor"), 100).get_page(request.GET.get("page"))
    return render(request, "adminpanel/audit.html", ctx(request, page=page))
