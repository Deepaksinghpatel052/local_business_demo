from django.contrib import admin

from .models import InvoiceCounter, Order, WebhookEvent


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["razorpay_order_id", "project", "user", "type", "amount_display", "status", "refund_status",
                    "invoice_number", "created_at"]
    list_filter = ["status", "type", "refund_status", "is_demo"]
    search_fields = ["razorpay_order_id", "razorpay_payment_id", "invoice_number", "user__email", "project__slug"]
    readonly_fields = [f.name for f in Order._meta.fields]


admin.site.register(InvoiceCounter)


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = ["event_id", "event", "processed", "received_at"]
    readonly_fields = ["event_id", "event", "payload", "processed", "received_at"]
