"""Business rules for projects: slugs, creating from a template, saving data, versions."""
import copy
import re
import uuid
from datetime import timedelta

from django.conf import settings
from django.core.files import File
from django.db import transaction
from django.utils import timezone

from core.models import PlatformSettings
from crm.models import log_activity

from .models import Project, ProjectImage, ProjectVersion
from .publish import publish_project
from .schema import clean_data

VERSION_COALESCE = timedelta(minutes=2)   # autosaves within 2 minutes update the newest version

# Fields of a sample that describe the *sample* business, not the owner's: cleared on create
# so no one's site starts with someone else's phone, address, reviews or rating.
PERSONAL_FIELDS = {
    "phone": "", "whatsapp": "", "email": "", "address": "", "mapQuery": "", "city": "", "owner": "",
    "established": "", "rating": 0, "reviewCount": 0, "googleUrl": "", "testimonials": [], "results": [],
    "logo": "", "logoWidth": 0, "happyCustomers": 0,
}


# ---------------------------------------------------------------------------
# Slugs
# ---------------------------------------------------------------------------
def slugify_name(name):
    """Same rule as new_demo.py: "Sharma Sweets & Co." -> "sharma-sweets-and-co"."""
    s = str(name).lower().replace("&", " and ")
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    s = re.sub(r"-{2,}", "-", s)
    return s[:50].rstrip("-") or "business"


def reserved_slugs():
    from templates_lib.models import Template
    names = set(settings.RESERVED_SLUGS)
    if settings.DEMOS_DIR.exists():
        names.update(p.name for p in settings.DEMOS_DIR.iterdir() if p.is_dir())
    names.update(Template.objects.values_list("source_folder", flat=True))
    return names


def is_slug_available(slug, project=None):
    if not re.match(r"^[a-z0-9][a-z0-9-]{0,59}$", slug) or slug in reserved_slugs():
        return False
    qs = Project.objects.filter(slug=slug)
    if project is not None and project.pk:
        qs = qs.exclude(pk=project.pk)
    if qs.exists():
        return False
    # a folder on disk that no project owns (e.g. a hand-made demo on the server)
    folder = settings.SITES_ROOT / slug
    return not folder.exists() or (project is not None and project.slug == slug)


def unique_slug(name, project=None):
    base = slugify_name(name)
    if is_slug_available(base, project):
        return base
    for i in range(2, 1000):
        cand = "%s-%d" % (base[:46], i)
        if is_slug_available(cand, project):
            return cand
    return "%s-%s" % (base[:40], uuid.uuid4().hex[:6])


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------
class LimitReached(Exception):
    pass


def starting_data(template, business_name, category):
    data = copy.deepcopy(template.default_data) if template else {}
    data.update(copy.deepcopy(PERSONAL_FIELDS))
    if isinstance(data.get("doctor"), dict):
        data["doctor"] = {}
    if data.get("theme") == "auto":
        data["theme"] = {}          # the sample's logo colours don't belong to this business
    for k in ("slug", "developer"):
        data.pop(k, None)
    data["social"] = {"instagram": "", "facebook": "", "youtube": ""}
    data["name"] = business_name
    data["category"] = category
    data.setdefault("languages", ["en", "hi"])
    data.setdefault("hours", {d: "" for d in ("mon", "tue", "wed", "thu", "fri", "sat", "sun")})
    return data


@transaction.atomic
def create_project(user, template, business_name, category):
    ps = PlatformSettings.load()
    if not user.is_team and Project.objects.filter(owner=user).count() >= ps.max_projects_per_user:
        raise LimitReached("You can create up to %d websites." % ps.max_projects_per_user)
    business_name = business_name.strip()[:80]
    project = Project(owner=user, template=template, business_name=business_name, category=category)
    project.slug = unique_slug(business_name)
    raw = starting_data(template, business_name, category)
    data, errors = clean_data(raw)
    if errors:   # a sample with unusual data: keep what validates
        data = {k: v for k, v in raw.items() if k not in {e["field"].split(".")[0] for e in errors}}
        data, _ = clean_data(data)
    project.data = data or {"name": business_name, "category": category}
    project.check_sensitive(ps.sensitive_word_list)
    project.save()
    _copy_template_images(project, template)
    ProjectVersion.objects.create(project=project, data=project.data, created_by=user, note="Created from template")
    log_activity(user, "project_created", project, detail=template.slug if template else "")
    transaction.on_commit(lambda: publish_project(project, "preview"))
    return project


def _copy_template_images(project, template):
    """Sample photos referenced as images/<file> in the template data (logos are cleared)."""
    if not template:
        return
    used = set(re.findall(r"images/([A-Za-z0-9._-]+)", str(project.data)))
    src_dir = template.images_dir
    for name in used:
        src = src_dir / name
        if src.is_file():
            with src.open("rb") as fh:
                im = ProjectImage(project=project, kind="other", size=src.stat().st_size)
                im.file.save(name, File(fh), save=False)
                im.save()
            # Django may rename on clash; keep data pointing at the stored name
            if im.filename != name:
                project.data = _replace_path(project.data, "images/" + name, im.data_path)
                project.save(update_fields=["data"])


def _replace_path(value, old, new):
    if isinstance(value, str):
        return new if value == old else value
    if isinstance(value, list):
        return [_replace_path(v, old, new) for v in value]
    if isinstance(value, dict):
        return {k: _replace_path(v, old, new) for k, v in value.items()}
    return value


# ---------------------------------------------------------------------------
# Save (editor autosave, admin restore)
# ---------------------------------------------------------------------------
STEP_KEYS = ["basics", "about", "services", "photos", "hours", "reviews", "look", "seo"]


def save_project_data(project, raw, user=None, step=None, note=""):
    """Validate, store, version and publish. Returns (ok, errors)."""
    data, errors = clean_data(raw)
    if errors:
        return False, errors
    ps = PlatformSettings.load()
    with transaction.atomic():
        project = Project.objects.select_for_update().get(pk=project.pk)
        changed = data != project.data
        project.data = data
        project.business_name = data.get("name", project.business_name)[:80]
        project.category = data.get("category", project.category)
        if step in STEP_KEYS and step not in project.steps_done:
            project.steps_done = project.steps_done + [step]
            log_activity(project.owner, "data_step_completed", project, detail=step)
        if project.status == Project.DRAFT and not project.required_missing:
            project.status = Project.PREVIEW
        project.check_sensitive(ps.sensitive_word_list)
        project.last_edited_at = timezone.now()
        project.save()
        if changed:
            _snapshot(project, user, note)
        if changed or not project.published_mode:
            publish_project(project)
    return True, []


def _snapshot(project, user, note=""):
    latest = project.versions.first()
    if (latest and not note and not latest.note and latest.created_by_id == getattr(user, "pk", None)
            and timezone.now() - latest.created_at < VERSION_COALESCE):
        latest.data = project.data
        latest.save(update_fields=["data", "updated_at"])
    else:
        ProjectVersion.objects.create(project=project, data=project.data, created_by=user, note=note[:120])
    keep = list(project.versions.values_list("pk", flat=True)[:ProjectVersion.KEEP])
    project.versions.exclude(pk__in=keep).delete()


def restore_version(project, version, user):
    ok, errors = save_project_data(project, version.data, user=user, note="Restored version from %s" % (
        timezone.localtime(version.created_at).strftime("%d %b %Y %H:%M")))
    return ok, errors


def storage_used(user):
    from django.db.models import Sum
    return ProjectImage.objects.filter(project__owner=user).aggregate(s=Sum("size"))["s"] or 0
