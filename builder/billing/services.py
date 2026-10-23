"""
Razorpay: orders, signature checks, idempotent activation, refunds, invoice numbers.

With DEMO_PAYMENTS=True (default when no Razorpay keys are set) orders get a local
"order_demo_…" id and the Demo Payment Simulator stands in for Razorpay Checkout.
"""
import hashlib
import hmac
import logging
import secrets
from decimal import ROUND_HALF_UP, Decimal

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from core.models import PlatformSettings
from core.notify import notify_owner
from crm.models import log_activity
from projects.models import Project
from projects.workflow import after_payment, extend_hosting

from .models import InvoiceCounter, Order

log = logging.getLogger(__name__)


class PaymentError(Exception):
    pass


def client():
    import razorpay
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


# ---------------------------------------------------------------------------
# Amounts (always computed here, never taken from the browser)
# ---------------------------------------------------------------------------
def amount_for(order_type):
    """(total, base, gst) in paise. Prices in settings are what the customer pays."""
    ps = PlatformSettings.load()
    total = Decimal(ps.price_for(order_type)) * 100
    if settings.GST_ENABLED and settings.COMPANY.get("gstin"):
        rate = Decimal(ps.gst_rate)
        base = (total * 100 / (100 + rate)).quantize(Decimal("1"), ROUND_HALF_UP)
        return int(total), int(base), int(total - base)
    return int(total), int(total), 0


def allowed_order_types(project):
    """What the owner may buy for this project right now."""
    types = []
    if project.status in (Project.SUSPENDED, Project.REJECTED):
        return types
    if project.plan_choosable:
        types += [Order.HOSTING_NEW, Order.DOWNLOAD]
    if project.can_renew:
        types.append(Order.HOSTING_RENEWAL)
    return types


@transaction.atomic
def create_order(user, project, order_type):
    if project.owner_id != user.pk:
        raise PaymentError("Not your project.")
    if order_type not in allowed_order_types(project):
        raise PaymentError("This option is not available for this website right now.")
    total, base, gst = amount_for(order_type)
    receipt = "p%d-%s" % (project.pk, secrets.token_hex(4))
    if settings.DEMO_PAYMENTS:
        rp_id, demo = "order_demo_%s" % secrets.token_hex(8), True
    else:
        try:
            rp = client().order.create({"amount": total, "currency": "INR", "receipt": receipt,
                                        "notes": {"project": str(project.pk), "type": order_type}})
        except Exception as e:
            log.exception("Razorpay order create failed")
            raise PaymentError("Payment service is not reachable. Please try again.") from e
        rp_id, demo = rp["id"], False
    order = Order.objects.create(user=user, project=project, type=order_type, amount=total, base_amount=base,
                                 gst_amount=gst, razorpay_order_id=rp_id, is_demo=demo)
    if order_type in (Order.HOSTING_NEW, Order.DOWNLOAD) and project.status in (Project.DRAFT, Project.PREVIEW):
        project.status = Project.PENDING_PAYMENT
        project.save(update_fields=["status"])
    return order


# ---------------------------------------------------------------------------
# Signatures
# ---------------------------------------------------------------------------
def _hmac(secret, msg):
    return hmac.new(secret.encode(), msg.encode() if isinstance(msg, str) else msg, hashlib.sha256).hexdigest()


def verify_payment_signature(order_id, payment_id, signature):
    if not settings.RAZORPAY_KEY_SECRET or not signature:
        return False
    return hmac.compare_digest(_hmac(settings.RAZORPAY_KEY_SECRET, "%s|%s" % (order_id, payment_id)), signature)


def verify_webhook_signature(body, signature):
    if not settings.RAZORPAY_WEBHOOK_SECRET or not signature:
        return False
    return hmac.compare_digest(_hmac(settings.RAZORPAY_WEBHOOK_SECRET, body), signature)


# ---------------------------------------------------------------------------
# Payment results (idempotent: callback, webhook and retries may all arrive)
# ---------------------------------------------------------------------------
def mark_paid(order_id, payment_id, signature="", raw=None):
    """Apply a successful payment exactly once. Returns the order."""
    with transaction.atomic():
        order = Order.objects.select_for_update().get(pk=order_id)
        if raw is not None:
            order.raw_webhook = order.raw_webhook + [raw]
        if order.applied:
            order.save(update_fields=["raw_webhook"])
            return order
        if order.status == Order.REFUNDED:
            order.save(update_fields=["raw_webhook"])
            return order
        order.status = Order.PAID
        order.razorpay_payment_id = payment_id or order.razorpay_payment_id
        order.razorpay_signature = signature or order.razorpay_signature
        order.paid_at = timezone.now()
        order.invoice_number = next_invoice_number(order.paid_at)
        order.applied = True
        order.save()
        project = Project.objects.select_for_update().get(pk=order.project_id)
        if order.type == Order.HOSTING_RENEWAL:
            expiry = extend_hosting(project)
            log_activity(order.user, "renewed", project, detail=expiry.date().isoformat())
            text = "Thank you! Hosting for %s is renewed until %s." % (
                project.business_name, timezone.localtime(expiry).strftime("%d %b %Y"))
        else:
            after_payment(project, order.type)
            log_activity(order.user, "paid", project, detail=order.type)
            text = ("Thank you for your payment of %s for %s. Our team will verify your business and call you "
                    "within 24 hours." % (order.amount_display, project.business_name))
            if project.status not in (Project.PENDING_VERIFICATION,):
                text = "Thank you for your payment of %s for %s." % (order.amount_display, project.business_name)
        transaction.on_commit(lambda: notify_owner(order.user, "Payment received", text))
    return order


def mark_failed(order_id, payment_id="", raw=None, reason=""):
    with transaction.atomic():
        order = Order.objects.select_for_update().get(pk=order_id)
        if raw is not None:
            order.raw_webhook = order.raw_webhook + [raw]
        if order.status == Order.CREATED:
            order.status = Order.FAILED
            order.razorpay_payment_id = payment_id or order.razorpay_payment_id
        order.save()
    return order


def refund_order(order, reason):
    """Full refund through the Razorpay API (or instantly for demo payments)."""
    with transaction.atomic():
        order = Order.objects.select_for_update().get(pk=order.pk)
        if order.status != Order.PAID or order.refund_status in (Order.REFUND_PENDING, Order.REFUND_PROCESSED):
            return order
        order.refund_reason = reason[:300]
        if order.is_demo:
            order.refund_id = "rfnd_demo_%s" % secrets.token_hex(6)
            order.refund_status = Order.REFUND_PROCESSED
            order.status = Order.REFUNDED
        else:
            try:
                rf = client().payment.refund(order.razorpay_payment_id, {
                    "amount": order.amount, "notes": {"reason": reason[:200]}, "speed": "normal"})
                order.refund_id = rf.get("id", "")
                order.refund_status = Order.REFUND_PROCESSED if rf.get("status") == "processed" else Order.REFUND_PENDING
                if order.refund_status == Order.REFUND_PROCESSED:
                    order.status = Order.REFUNDED
            except Exception as e:
                log.exception("Razorpay refund failed for %s", order.razorpay_order_id)
                order.refund_status = Order.REFUND_FAILED
                order.refund_reason = ("%s | API error: %s" % (reason, e))[:300]
        order.save()
    return order


def mark_refund_processed(payment_id, refund_id, raw=None):
    with transaction.atomic():
        order = Order.objects.select_for_update().filter(razorpay_payment_id=payment_id).first()
        if order is None:
            return None
        if raw is not None:
            order.raw_webhook = order.raw_webhook + [raw]
        order.refund_id = refund_id or order.refund_id
        order.refund_status = Order.REFUND_PROCESSED
        order.status = Order.REFUNDED
        order.save()
    return order


# ---------------------------------------------------------------------------
# Invoices
# ---------------------------------------------------------------------------
def financial_year(dt):
    d = timezone.localtime(dt)
    start = d.year if d.month >= 4 else d.year - 1
    return "%d-%02d" % (start, (start + 1) % 100)


def next_invoice_number(dt=None):
    fy = financial_year(dt or timezone.now())
    counter, _ = InvoiceCounter.objects.select_for_update().get_or_create(financial_year=fy)
    counter.last_number += 1
    counter.save()
    return "%s/%s/%04d" % (settings.COMPANY["invoice_prefix"], fy, counter.last_number)
