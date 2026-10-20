import json
import logging
import secrets

from django.conf import settings
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError, transaction
from django.http import Http404, HttpResponse, HttpResponseBadRequest
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from core.ratelimit import ratelimit
from projects.models import Project

from . import services
from .invoice import invoice_pdf
from .models import Order, WebhookEvent

log = logging.getLogger(__name__)


@login_required
@require_POST
@ratelimit("checkout", 20, 3600)
def checkout(request, pk, order_type):
    project = get_object_or_404(Project, pk=pk, owner=request.user)
    if order_type not in dict(Order.TYPES):
        raise Http404
    if order_type != Order.HOSTING_RENEWAL and not request.POST.get("accept_terms"):
        messages.error(request, "Please accept the terms to continue.")
        return redirect("go_live", pk=pk)
    try:
        order = services.create_order(request.user, project, order_type)
    except services.PaymentError as e:
        messages.error(request, str(e))
        return redirect("dashboard")
    return redirect("pay", order_id=order.pk)


@login_required
def pay(request, order_id):
    order = get_object_or_404(Order, pk=order_id, user=request.user)
    if order.status == Order.PAID:
        return redirect("dashboard")
    return render(request, "billing/pay.html", {
        "order": order, "project": order.project, "demo": order.is_demo,
        "razorpay": {
            "key": settings.RAZORPAY_KEY_ID, "amount": order.amount, "currency": order.currency,
            "order_id": order.razorpay_order_id, "name": "Devnixplus", "description": order.get_type_display(),
            "prefill": {"name": request.user.name, "email": request.user.email,
                        "contact": "+91" + request.user.mobile if request.user.mobile else ""},
            "notes": {"project": order.project.business_name},
        },
    })


@login_required
@require_POST
def callback(request):
    """Razorpay Checkout success handler posts here; the signature proves the payment is real."""
    rp_order = request.POST.get("razorpay_order_id", "")
    payment_id = request.POST.get("razorpay_payment_id", "")
    signature = request.POST.get("razorpay_signature", "")
    order = get_object_or_404(Order, razorpay_order_id=rp_order, user=request.user)
    if not services.verify_payment_signature(rp_order, payment_id, signature):
        log.warning("bad payment signature for %s", rp_order)
        messages.error(request, "We could not confirm this payment. If money was deducted, it will be "
                                "confirmed automatically in a few minutes, or refunded.")
        return redirect("dashboard")
    services.mark_paid(order.pk, payment_id, signature)
    return _paid_redirect(request, order)


def _paid_redirect(request, order):
    order.project.refresh_from_db()
    if order.project.needs_verification_form:
        messages.success(request, "Payment received. One last step: help us verify your business.")
        return redirect("verify", pk=order.project_id)
    messages.success(request, "Payment received. Thank you!")
    return redirect("dashboard")


@login_required
@require_POST
def failed(request, order_id):
    order = get_object_or_404(Order, pk=order_id, user=request.user)
    services.mark_failed(order.pk, request.POST.get("payment_id", ""), reason=request.POST.get("reason", "")[:200])
    messages.error(request, "The payment did not go through. No money was taken. You can try again.")
    return redirect("dashboard")


@login_required
@require_POST
def simulate(request, order_id):
    """Demo Payment Simulator (DEMO_PAYMENTS=True): success/failure without real money."""
    if not settings.DEMO_PAYMENTS:
        raise Http404
    order = get_object_or_404(Order, pk=order_id, user=request.user, is_demo=True)
    if request.POST.get("result") == "success":
        services.mark_paid(order.pk, "pay_demo_%s" % secrets.token_hex(7), "demo")
        return _paid_redirect(request, order)
    services.mark_failed(order.pk, "pay_demo_failed", reason="Simulated failure")
    messages.error(request, "Simulated payment failure. No money was taken.")
    return redirect("dashboard")


@csrf_exempt
@require_POST
def webhook(request):
    """Razorpay webhooks: payment.captured, payment.failed, refund.processed (signature-verified, idempotent)."""
    body = request.body
    if not services.verify_webhook_signature(body, request.headers.get("X-Razorpay-Signature", "")):
        return HttpResponseBadRequest("bad signature")
    try:
        payload = json.loads(body.decode("utf-8"))
    except ValueError:
        return HttpResponseBadRequest("bad json")
    event = payload.get("event", "")
    event_id = request.headers.get("X-Razorpay-Event-Id") or "%s:%s" % (event, payload.get("created_at", ""))
    try:
        with transaction.atomic():
            ev = WebhookEvent.objects.create(event_id=event_id[:80], event=event[:60], payload=payload)
    except IntegrityError:
        return HttpResponse("duplicate")          # already handled: never apply twice

    entity = (payload.get("payload", {}).get("payment") or {}).get("entity") or {}
    if event == "payment.captured":
        order = Order.objects.filter(razorpay_order_id=entity.get("order_id", "")).first()
        if order and order.amount == entity.get("amount"):
            services.mark_paid(order.pk, entity.get("id", ""), raw=payload)
        elif order:
            log.error("webhook amount mismatch for %s", order.razorpay_order_id)
    elif event == "payment.failed":
        order = Order.objects.filter(razorpay_order_id=entity.get("order_id", "")).first()
        if order:
            services.mark_failed(order.pk, entity.get("id", ""), raw=payload)
    elif event == "refund.processed":
        refund = (payload.get("payload", {}).get("refund") or {}).get("entity") or {}
        services.mark_refund_processed(refund.get("payment_id", ""), refund.get("id", ""), raw=payload)
    ev.processed = True
    ev.save(update_fields=["processed"])
    return HttpResponse("ok")


@login_required
def payments(request):
    orders = Order.objects.filter(user=request.user).exclude(status=Order.CREATED).select_related("project")
    return render(request, "billing/payments.html", {"orders": orders})


@login_required
def invoice(request, pk):
    order = get_object_or_404(Order, pk=pk)
    if order.user_id != request.user.pk and not request.user.has_role("Admin", "Sales"):
        raise Http404
    if not order.invoice_number:
        raise Http404
    pdf = invoice_pdf(order)
    resp = HttpResponse(pdf, content_type="application/pdf")
    resp["Content-Disposition"] = 'inline; filename="invoice-%s.pdf"' % order.invoice_number.replace("/", "-")
    return resp
