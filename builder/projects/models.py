import re
import secrets

from django.conf import settings
from django.db import models
from django.urls import reverse
from django.utils import timezone

from core.utils import site_url
from templates_lib.categories import category


def new_token():
    return secrets.token_urlsafe(16)


class Project(models.Model):
    DRAFT, PREVIEW, PENDING_PAYMENT, PENDING_VERIFICATION = "draft", "preview", "pending_payment", "pending_verification"
    APPROVED, LIVE, DOWNLOAD_READY = "approved", "live", "download_ready"
    EXPIRED, SUSPENDED, REJECTED = "expired", "suspended", "rejected"
    STATUS_CHOICES = [
        (DRAFT, "Draft"), (PREVIEW, "Preview"), (PENDING_PAYMENT, "Waiting for payment"),
        (PENDING_VERIFICATION, "Being verified"), (APPROVED, "Approved"), (LIVE, "Live"),
        (DOWNLOAD_READY, "Ready to download"), (EXPIRED, "Expired"), (SUSPENDED, "Suspended"), (REJECTED, "Rejected"),
    ]
    PLAN_NONE, PLAN_HOSTED, PLAN_DOWNLOAD = "none", "hosted", "download"
    PLAN_CHOICES = [(PLAN_NONE, "Not chosen"), (PLAN_HOSTED, "Hosted by Devnixplus"), (PLAN_DOWNLOAD, "Download")]

    # Statuses in which the owner may still change everything and pick a plan
    EDITABLE = (DRAFT, PREVIEW, PENDING_PAYMENT, PENDING_VERIFICATION, APPROVED, LIVE, DOWNLOAD_READY, EXPIRED, REJECTED)

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="projects")
    template = models.ForeignKey("templates_lib.Template", null=True, blank=True, on_delete=models.SET_NULL)
    business_name = models.CharField(max_length=80)
    category = models.CharField(max_length=40)
    slug = models.SlugField(max_length=60, unique=True)
    data = models.JSONField(default=dict)
    status = models.CharField(max_length=24, choices=STATUS_CHOICES, default=DRAFT, db_index=True)
    plan = models.CharField(max_length=10, choices=PLAN_CHOICES, default=PLAN_NONE)
    preview_token = models.CharField(max_length=40, default=new_token, unique=True)
    steps_done = models.JSONField(default=list, blank=True)

    hosting_expires_at = models.DateTimeField(null=True, blank=True, db_index=True)
    custom_domain = models.CharField(max_length=253, blank=True)
    dns_pointed = models.BooleanField(default=False)
    ssl_issued = models.BooleanField(default=False)
    domain_checked = models.BooleanField(default=False)

    flagged = models.BooleanField(default=False, help_text="Contains sensitive words: review first")
    flag_reason = models.CharField(max_length=200, blank=True)
    status_before_suspend = models.CharField(max_length=24, blank=True)
    status_note = models.CharField(max_length=300, blank=True, help_text="Shown to the owner (e.g. rejection reason)")

    published_mode = models.CharField(max_length=12, blank=True)    # preview | live | unavailable | "" (not published)
    published_at = models.DateTimeField(null=True, blank=True)
    last_preview_at = models.DateTimeField(null=True, blank=True)
    went_live_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_edited_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.business_name

    def get_absolute_url(self):
        return reverse("editor", args=[self.pk])

    # --- facts used by templates ----------------------------------------
    @property
    def site_url(self):
        return site_url(self.slug)

    @property
    def public_url(self):
        if self.custom_domain and self.status == self.LIVE and self.ssl_issued:
            return "https://%s/" % self.custom_domain
        return self.site_url

    @property
    def category_info(self):
        return category(self.category)

    @property
    def is_paid_for_hosting(self):
        return self.orders.filter(type="hosting_new", status="paid").exists()

    @property
    def is_paid_for_download(self):
        return self.orders.filter(type="download", status="paid").exists()

    @property
    def is_approved(self):
        return self.verifications.filter(decision=VerificationRequest.APPROVED).exists()

    @property
    def can_download(self):
        """Download pack: paid AND approved by the team (and not suspended)."""
        return (self.status != self.SUSPENDED and self.is_paid_for_download and self.is_approved)

    @property
    def can_go_live(self):
        return self.status in (self.DRAFT, self.PREVIEW, self.PENDING_PAYMENT) and self.plan_choosable

    @property
    def plan_choosable(self):
        return not self.orders.filter(type__in=["hosting_new", "download"], status="paid").exists()

    RENEW_WINDOW_DAYS = 60

    @property
    def can_renew(self):
        """Renewal opens 60 days before expiry (and stays open after it)."""
        if self.plan != self.PLAN_HOSTED or not self.hosting_expires_at:
            return False
        if self.status == self.EXPIRED:
            return True
        return self.status == self.LIVE and self.days_to_expiry <= self.RENEW_WINDOW_DAYS

    @property
    def needs_verification_form(self):
        return self.status == self.PENDING_VERIFICATION and not self.verifications.exists()

    @property
    def required_missing(self):
        d = self.data or {}
        return [k for k in ("name", "category", "phone", "address") if not str(d.get(k) or "").strip()]

    @property
    def progress(self):
        return int(round(100 * len(set(self.steps_done)) / 8.0))

    @property
    def is_live_mode(self):
        """Edits publish straight to the live site."""
        return self.status == self.LIVE

    @property
    def days_to_expiry(self):
        if not self.hosting_expires_at:
            return None
        return (self.hosting_expires_at - timezone.now()).days

    def check_sensitive(self, words):
        """Flag (never block) a project whose text uses a sensitive word."""
        blob = " ".join(_strings(self.data)).lower() + " " + self.business_name.lower()
        hits = sorted({w for w in words if re.search(r"\b%s\b" % re.escape(w), blob)})
        self.flagged = bool(hits)
        self.flag_reason = ("Sensitive words: " + ", ".join(hits))[:200] if hits else ""
        return hits


def _strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for v in value:
            yield from _strings(v)
    elif isinstance(value, dict):
        for v in value.values():
            yield from _strings(v)


def image_upload_to(instance, filename):
    return "projects/%d/images/%s" % (instance.project_id, filename)


class ProjectImage(models.Model):
    KIND_CHOICES = [("logo", "Logo"), ("hero", "Hero"), ("gallery", "Gallery"), ("service", "Service"),
                    ("doctor", "Doctor"), ("other", "Other")]
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="images")
    kind = models.CharField(max_length=10, choices=KIND_CHOICES, default="other")
    file = models.ImageField(upload_to=image_upload_to, max_length=255)
    width = models.PositiveIntegerField(default=0)
    height = models.PositiveIntegerField(default=0)
    size = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    @property
    def filename(self):
        return self.file.name.rsplit("/", 1)[-1]

    @property
    def data_path(self):
        """How data.js refers to it."""
        return "images/" + self.filename


class ProjectVersion(models.Model):
    KEEP = 30
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="versions")
    data = models.JSONField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="+")
    note = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at", "-pk"]


class VerificationRequest(models.Model):
    PENDING, APPROVED, REJECTED = "pending", "approved", "rejected"
    DECISIONS = [(PENDING, "Pending"), (APPROVED, "Approved"), (REJECTED, "Rejected")]
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="verifications")
    maps_link = models.URLField("Google Maps listing link", max_length=500)
    shop_photo = models.ImageField(upload_to="verification/", blank=True)
    visiting_card = models.ImageField(upload_to="verification/", blank=True)
    gst_or_udyam = models.CharField("GST or Udyam number", max_length=30, blank=True)
    owner_notes = models.TextField(blank=True)
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    decision = models.CharField(max_length=10, choices=DECISIONS, default=PENDING, db_index=True)
    reason = models.CharField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    decided_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]


class Download(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="downloads")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="+")
    created_at = models.DateTimeField(auto_now_add=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    file_size = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-created_at"]


class AbuseReport(models.Model):
    OPEN, REVIEWED, ACTIONED = "open", "reviewed", "actioned"
    STATUSES = [(OPEN, "Open"), (REVIEWED, "Reviewed, no action"), (ACTIONED, "Action taken")]
    project = models.ForeignKey(Project, null=True, blank=True, on_delete=models.SET_NULL, related_name="abuse_reports")
    site_slug = models.CharField(max_length=60)
    reporter_email = models.EmailField()
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUSES, default=OPEN, db_index=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
