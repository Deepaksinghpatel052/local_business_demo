from django.conf import settings
from django.core.cache import cache
from django.db import models


class PlatformSettings(models.Model):
    """One row of business settings the team can change in /manage/settings/ (never hard-code prices)."""

    price_hosting_new = models.PositiveIntegerField("Hosting, first year (₹)", default=1999)
    price_hosting_renewal = models.PositiveIntegerField("Hosting renewal per year (₹)", default=999)
    price_download = models.PositiveIntegerField("Download for own server (₹)", default=50)
    gst_rate = models.DecimalField("GST rate % (used only when GST is enabled)", max_digits=5, decimal_places=2, default=18)

    renewal_reminder_days = models.CharField(
        "Renewal reminders (days before expiry)", max_length=50, default="30,7,1,0",
        help_text="Comma separated. 0 = on the expiry date.")
    unpaid_reminder_days = models.CharField(
        "Go-live reminders (days after creating a site)", max_length=50, default="1,3,7")
    grace_period_days = models.PositiveIntegerField("Grace period after expiry (days)", default=15)
    preview_expiry_days = models.PositiveIntegerField("Unpublish unused previews after (days)", default=60)

    max_projects_per_user = models.PositiveIntegerField(default=3)
    storage_limit_mb = models.PositiveIntegerField("Image storage per user (MB)", default=50)
    require_verification_hosted = models.BooleanField(default=True)
    require_verification_download = models.BooleanField(default=True)
    sensitive_words = models.TextField(
        default="bank, government, police, rbi, sbi, loan, lottery, crypto",
        help_text="Comma separated. Projects using these words are flagged for priority review.")

    support_whatsapp = models.CharField("Support WhatsApp (digits with country code)", max_length=15, default="919183559191")
    support_phone = models.CharField(max_length=20, default="+91 91835 59191")
    support_email = models.EmailField(default="hello@devnixplus.com")

    updated_at = models.DateTimeField(auto_now=True)

    CACHE_KEY = "platform-settings"

    class Meta:
        verbose_name = verbose_name_plural = "Platform settings"

    def __str__(self):
        return "Platform settings"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)
        cache.delete(self.CACHE_KEY)

    @classmethod
    def load(cls):
        obj = cache.get(cls.CACHE_KEY)
        if obj is None:
            obj, _ = cls.objects.get_or_create(pk=1)
            cache.set(cls.CACHE_KEY, obj, 60)
        return obj

    @staticmethod
    def _days(value):
        out = []
        for part in str(value).split(","):
            part = part.strip()
            if part.isdigit():
                out.append(int(part))
        return sorted(set(out), reverse=True)

    @property
    def renewal_days(self):
        return self._days(self.renewal_reminder_days)

    @property
    def unpaid_days(self):
        return self._days(self.unpaid_reminder_days)

    @property
    def sensitive_word_list(self):
        return [w.strip().lower() for w in self.sensitive_words.replace("\n", ",").split(",") if w.strip()]

    def price_for(self, order_type):
        return {
            "hosting_new": self.price_hosting_new,
            "hosting_renewal": self.price_hosting_renewal,
            "download": self.price_download,
        }[order_type]


class AuditLog(models.Model):
    """Every action the team takes in /manage/ (approve, reject, go live, suspend, restore…)."""

    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    action = models.CharField(max_length=60)
    target_type = models.CharField(max_length=40, blank=True)
    target_id = models.CharField(max_length=40, blank=True)
    target_label = models.CharField(max_length=200, blank=True)
    details = models.JSONField(default=dict, blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return "%s %s %s" % (self.actor, self.action, self.target_label)


class OutgoingMessage(models.Model):
    """Log of SMS / WhatsApp messages (the mock providers only write here)."""

    channel = models.CharField(max_length=20)           # sms | whatsapp
    provider = models.CharField(max_length=20)
    to = models.CharField(max_length=20)
    body = models.TextField()
    status = models.CharField(max_length=20, default="sent")
    error = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
