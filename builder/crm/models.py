from django.conf import settings
from django.db import models

EVENTS = [
    ("signed_up", "Signed up"),
    ("mobile_verified", "Mobile verified"),
    ("project_created", "Project created"),
    ("data_step_completed", "Data step completed"),
    ("preview_opened", "Preview opened"),
    ("go_live_clicked", "Go live clicked"),
    ("paid", "Paid"),
    ("verification_submitted", "Verification submitted"),
    ("approved", "Approved"),
    ("rejected", "Rejected"),
    ("live", "Went live"),
    ("downloaded", "Downloaded"),
    ("renewed", "Renewed"),
    ("reminder_sent", "Reminder sent"),
]

# The sales funnel, in order. A user's stage is the furthest step they reached.
FUNNEL = [
    ("signed_up", "Signed up"),
    ("project_created", "Project created"),
    ("data_step_completed", "Data filled"),
    ("preview_opened", "Preview opened"),
    ("paid", "Paid"),
    ("live", "Live"),
]


class ActivityLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="activities")
    project = models.ForeignKey("projects.Project", null=True, blank=True, on_delete=models.SET_NULL, related_name="activities")
    event = models.CharField(max_length=40, choices=EVENTS, db_index=True)
    detail = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return "%s %s" % (self.user, self.event)


class LeadNote(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="lead_notes")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="+")
    note = models.TextField()
    follow_up_date = models.DateField(null=True, blank=True, db_index=True)
    done = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class ReminderLog(models.Model):
    """One row per reminder sent, so the daily cron never sends the same reminder twice."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    project = models.ForeignKey("projects.Project", on_delete=models.CASCADE)
    key = models.CharField(max_length=80)        # e.g. "renewal:30:2027-10-20" or "unpaid:3"
    channels = models.CharField(max_length=40, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["project", "key"], name="unique_reminder")]


def log_activity(user, event, project=None, detail="", once=False):
    """Record a funnel/CRM event. once=True skips it if this user+project already has the event."""
    if user is None or not getattr(user, "pk", None):
        return None
    if once and ActivityLog.objects.filter(user=user, project=project, event=event).exists():
        return None
    return ActivityLog.objects.create(user=user, project=project, event=event, detail=str(detail)[:200])


class EarlyAccess(models.Model):
    """Sign-ups on the coming soon page. The first EARLY_OFFER_SPOTS get a free website (free_offer=True)."""
    SOURCES = [("page", "Page form"), ("popup", "Popup")]
    name = models.CharField(max_length=120)
    email = models.EmailField(unique=True, null=True, blank=True)       # the short popup form doesn't ask for it
    mobile = models.CharField(max_length=10, unique=True)
    business_name = models.CharField(max_length=80, blank=True)
    business_category = models.CharField(max_length=40)
    city = models.CharField(max_length=80)
    source = models.CharField(max_length=10, choices=SOURCES, default="page", db_default="page")   # db default: older code can still insert
    free_offer = models.BooleanField(default=False, db_index=True)
    contacted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        verbose_name_plural = "early access sign-ups"

    def __str__(self):
        return "%s (%s)" % (self.business_name, self.name)
