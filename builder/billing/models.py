from django.conf import settings
from django.db import models
from django.urls import reverse

from core.utils import rupees


class Order(models.Model):
    HOSTING_NEW, HOSTING_RENEWAL, DOWNLOAD = "hosting_new", "hosting_renewal", "download"
    TYPES = [(HOSTING_NEW, "Hosting, first year"), (HOSTING_RENEWAL, "Hosting renewal (1 year)"),
             (DOWNLOAD, "Website download")]
    CREATED, PAID, FAILED, REFUNDED = "created", "paid", "failed", "refunded"
    STATUSES = [(CREATED, "Created"), (PAID, "Paid"), (FAILED, "Failed"), (REFUNDED, "Refunded")]
    REFUND_NONE, REFUND_PENDING, REFUND_PROCESSED, REFUND_FAILED = "none", "pending", "processed", "failed"
    REFUND_STATUSES = [(REFUND_NONE, "-"), (REFUND_PENDING, "Refund pending"),
                       (REFUND_PROCESSED, "Refunded"), (REFUND_FAILED, "Refund failed")]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="orders")
    project = models.ForeignKey("projects.Project", on_delete=models.PROTECT, related_name="orders")
    type = models.CharField(max_length=20, choices=TYPES)
    amount = models.PositiveIntegerField(help_text="Total in paise (₹1 = 100)")
    base_amount = models.PositiveIntegerField(default=0, help_text="Before GST, in paise")
    gst_amount = models.PositiveIntegerField(default=0, help_text="GST in paise (0 when GST is off)")
    currency = models.CharField(max_length=3, default="INR")
    razorpay_order_id = models.CharField(max_length=64, unique=True)
    razorpay_payment_id = models.CharField(max_length=64, blank=True, db_index=True)
    razorpay_signature = models.CharField(max_length=256, blank=True)
    status = models.CharField(max_length=10, choices=STATUSES, default=CREATED, db_index=True)
    refund_status = models.CharField(max_length=10, choices=REFUND_STATUSES, default=REFUND_NONE)
    refund_id = models.CharField(max_length=64, blank=True)
    refund_reason = models.CharField(max_length=300, blank=True)
    invoice_number = models.CharField(max_length=40, blank=True, unique=True, null=True)
    raw_webhook = models.JSONField(default=list, blank=True, help_text="Every webhook payload received for this order")
    is_demo = models.BooleanField(default=False, help_text="Paid with the demo simulator (no real money)")
    applied = models.BooleanField(default=False, help_text="Effects (activation/extension) already applied")
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return "%s %s (%s)" % (self.get_type_display(), self.project, self.razorpay_order_id)

    @property
    def amount_rupees(self):
        return self.amount / 100

    @property
    def amount_display(self):
        r = self.amount / 100
        return rupees(r) if r == int(r) else "₹%.2f" % r

    def get_invoice_url(self):
        return reverse("invoice_pdf", args=[self.pk])


class InvoiceCounter(models.Model):
    """Invoice series per Indian financial year (April-March): DNX/2026-27/0001."""
    financial_year = models.CharField(max_length=7, unique=True)    # "2026-27"
    last_number = models.PositiveIntegerField(default=0)


class WebhookEvent(models.Model):
    """Every webhook delivery, de-duplicated by Razorpay's event id."""
    event_id = models.CharField(max_length=80, unique=True)
    event = models.CharField(max_length=60)
    payload = models.JSONField()
    processed = models.BooleanField(default=False)
    received_at = models.DateTimeField(auto_now_add=True)
