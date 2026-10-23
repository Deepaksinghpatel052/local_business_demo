import hashlib
import hmac
import json
from datetime import timedelta
from unittest import mock

from django.test import override_settings
from django.urls import reverse
from django.utils import timezone

from billing import services as billing
from billing.models import Order, WebhookEvent
from core.models import PlatformSettings
from core.testing import BaseTestCase
from projects import services, workflow
from projects.models import Project, VerificationRequest


def sign(secret, msg):
    return hmac.new(secret.encode(), msg if isinstance(msg, bytes) else msg.encode(), hashlib.sha256).hexdigest()


class PaymentTests(BaseTestCase):
    def setUp(self):
        super().setUp()
        self.owner = self.make_owner()
        self.login(self.owner)
        self.project = services.create_project(self.owner, self.template, "Glow Salon", "salon")
        services.save_project_data(self.project, dict(self.project.data, phone="+91 98765 43210", address="1 MG Road"))
        self.project.refresh_from_db()

    def test_amount_comes_from_settings_not_browser(self):
        ps = PlatformSettings.load()
        ps.price_hosting_new = 2499
        ps.save()
        r = self.client.post(reverse("checkout", args=[self.project.pk, "hosting_new"]),
                             {"accept_terms": "on", "amount": "1"})
        order = Order.objects.get()
        self.assertEqual(order.amount, 249900)
        self.assertRedirects(r, reverse("pay", args=[order.pk]))
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, Project.PENDING_PAYMENT)

    def test_terms_required(self):
        self.client.post(reverse("checkout", args=[self.project.pk, "hosting_new"]))
        self.assertEqual(Order.objects.count(), 0)

    @override_settings(GST_ENABLED=True, COMPANY={"name": "D", "address": "", "email": "", "phone": "", "gstin": "23ABCDE1234F1Z5", "state": "MP", "invoice_prefix": "DNX"})
    def test_gst_split_when_enabled(self):
        total, base, gst = billing.amount_for("hosting_new")
        self.assertEqual(total, 199900)
        self.assertEqual(base + gst, total)
        self.assertEqual(base, 169407)

    def test_payment_signature(self):
        sig = sign("test_secret", "order_1|pay_1")
        self.assertTrue(billing.verify_payment_signature("order_1", "pay_1", sig))
        self.assertFalse(billing.verify_payment_signature("order_1", "pay_2", sig))
        self.assertFalse(billing.verify_payment_signature("order_1", "pay_1", ""))

    @override_settings(DEMO_PAYMENTS=False, RAZORPAY_KEY_ID="rzp_test_x")
    def test_checkout_callback_with_real_signature(self):
        with mock.patch("billing.services.client") as cl:
            cl.return_value.order.create.return_value = {"id": "order_RP123"}
            order = billing.create_order(self.owner, self.project, Order.HOSTING_NEW)
        self.assertEqual(order.razorpay_order_id, "order_RP123")
        bad = self.client.post(reverse("payment_callback"), {"razorpay_order_id": "order_RP123",
                                                             "razorpay_payment_id": "pay_9", "razorpay_signature": "forged"})
        self.assertEqual(bad.status_code, 302)
        order.refresh_from_db()
        self.assertEqual(order.status, Order.CREATED)
        good = self.client.post(reverse("payment_callback"), {"razorpay_order_id": "order_RP123", "razorpay_payment_id": "pay_9",
                                                              "razorpay_signature": sign("test_secret", "order_RP123|pay_9")})
        self.assertRedirects(good, reverse("verify", args=[self.project.pk]))
        order.refresh_from_db()
        self.assertEqual(order.status, Order.PAID)
        self.assertTrue(order.invoice_number.startswith("DNX/"))

    def _webhook(self, payload, event_id="evt_1", secret="whsec_test"):
        body = json.dumps(payload).encode()
        return self.client.post(reverse("razorpay_webhook"), body, content_type="application/json",
                                HTTP_X_RAZORPAY_SIGNATURE=sign(secret, body), HTTP_X_RAZORPAY_EVENT_ID=event_id)

    def test_webhook_signature_required(self):
        order = billing.create_order(self.owner, self.project, Order.HOSTING_NEW)
        payload = {"event": "payment.captured", "payload": {"payment": {"entity": {
            "id": "pay_1", "order_id": order.razorpay_order_id, "amount": order.amount}}}}
        r = self._webhook(payload, secret="wrong")
        self.assertEqual(r.status_code, 400)
        order.refresh_from_db()
        self.assertEqual(order.status, Order.CREATED)

    def test_webhook_idempotent_never_double_activates(self):
        order = billing.create_order(self.owner, self.project, Order.HOSTING_NEW)
        payload = {"event": "payment.captured", "payload": {"payment": {"entity": {
            "id": "pay_1", "order_id": order.razorpay_order_id, "amount": order.amount}}}}
        self.assertEqual(self._webhook(payload).status_code, 200)
        self.assertEqual(self._webhook(payload).content, b"duplicate")            # same event id
        self.assertEqual(self._webhook(payload, event_id="evt_2").status_code, 200)  # new id, same payment
        billing.mark_paid(order.pk, "pay_1", "sig")                                # and the browser callback too
        order.refresh_from_db()
        self.assertEqual(order.status, Order.PAID)
        self.assertEqual(WebhookEvent.objects.count(), 2)
        from crm.models import ActivityLog
        self.assertEqual(ActivityLog.objects.filter(event="paid", project=self.project).count(), 1)
        self.assertEqual(Order.objects.exclude(invoice_number=None).count(), 1)

    def test_webhook_amount_mismatch_ignored(self):
        order = billing.create_order(self.owner, self.project, Order.HOSTING_NEW)
        payload = {"event": "payment.captured", "payload": {"payment": {"entity": {
            "id": "pay_1", "order_id": order.razorpay_order_id, "amount": 100}}}}
        self._webhook(payload)
        order.refresh_from_db()
        self.assertEqual(order.status, Order.CREATED)

    def test_renewal_extends_from_current_expiry_once(self):
        expiry = timezone.now() + timedelta(days=20)
        Project.objects.filter(pk=self.project.pk).update(plan="hosted", status="live", hosting_expires_at=expiry)
        self.project.refresh_from_db()
        order = billing.create_order(self.owner, self.project, Order.HOSTING_RENEWAL)
        billing.mark_paid(order.pk, "pay_r", "s")
        billing.mark_paid(order.pk, "pay_r", "s")        # repeated: must not extend twice
        self.project.refresh_from_db()
        self.assertEqual(self.project.hosting_expires_at, expiry + timedelta(days=365))

    def test_renewal_not_offered_far_from_expiry(self):
        Project.objects.filter(pk=self.project.pk).update(plan="hosted", status="live",
                                                          hosting_expires_at=timezone.now() + timedelta(days=200))
        self.project.refresh_from_db()
        with self.assertRaises(billing.PaymentError):
            billing.create_order(self.owner, self.project, Order.HOSTING_RENEWAL)

    def test_cannot_buy_hosting_twice(self):
        order = billing.create_order(self.owner, self.project, Order.HOSTING_NEW)
        billing.mark_paid(order.pk, "pay_1", "s")
        self.project.refresh_from_db()
        with self.assertRaises(billing.PaymentError):
            billing.create_order(self.owner, self.project, Order.HOSTING_NEW)

    def test_refund_on_rejection(self):
        order = billing.create_order(self.owner, self.project, Order.HOSTING_NEW)
        billing.mark_paid(order.pk, "pay_1", "s")
        self.project.refresh_from_db()
        VerificationRequest.objects.create(project=self.project, maps_link="https://maps.app.goo.gl/a")
        workflow.reject(self.project, self.make_team("Verifier"), "Business not found on Google Maps")
        order.refresh_from_db()
        self.project.refresh_from_db()
        self.assertEqual(order.status, Order.REFUNDED)
        self.assertEqual(order.refund_status, Order.REFUND_PROCESSED)
        self.assertEqual(self.project.status, Project.REJECTED)
        self.assertEqual(self.project.published_mode, "unavailable")

    @override_settings(DEMO_PAYMENTS=False, RAZORPAY_KEY_ID="rzp_test_x")
    def test_refund_calls_razorpay_api(self):
        with mock.patch("billing.services.client") as cl:
            cl.return_value.order.create.return_value = {"id": "order_RP1"}
            order = billing.create_order(self.owner, self.project, Order.DOWNLOAD)
            billing.mark_paid(order.pk, "pay_real", "sig")
            cl.return_value.payment.refund.return_value = {"id": "rfnd_1", "status": "pending"}
            self.project.refresh_from_db()
            workflow.reject(self.project, None, "Fake business")
            cl.return_value.payment.refund.assert_called_once()
            self.assertEqual(cl.return_value.payment.refund.call_args[0][0], "pay_real")
        order.refresh_from_db()
        self.assertEqual(order.refund_status, Order.REFUND_PENDING)
        body = json.dumps({"event": "refund.processed", "payload": {"refund": {"entity": {"id": "rfnd_1", "payment_id": "pay_real"}}}}).encode()
        self.client.post(reverse("razorpay_webhook"), body, content_type="application/json",
                         HTTP_X_RAZORPAY_SIGNATURE=sign("whsec_test", body), HTTP_X_RAZORPAY_EVENT_ID="evt_rf")
        order.refresh_from_db()
        self.assertEqual(order.status, Order.REFUNDED)

    def test_invoice_pdf_owner_only(self):
        order = billing.create_order(self.owner, self.project, Order.DOWNLOAD)
        billing.mark_paid(order.pk, "pay_1", "s")
        r = self.client.get(reverse("invoice_pdf", args=[order.pk]))
        self.assertEqual(r["Content-Type"], "application/pdf")
        self.assertTrue(r.content.startswith(b"%PDF"))
        self.client.force_login(self.make_owner(email="x@test.local", mobile="9000000001"))
        self.assertEqual(self.client.get(reverse("invoice_pdf", args=[order.pk])).status_code, 404)

    def test_invoice_series_per_financial_year(self):
        from billing.services import financial_year
        tz = timezone.get_current_timezone()
        self.assertEqual(financial_year(timezone.datetime(2027, 3, 31, 12, tzinfo=tz)), "2026-27")
        self.assertEqual(financial_year(timezone.datetime(2027, 4, 1, 12, tzinfo=tz)), "2027-28")

    def test_simulator_only_in_demo_mode(self):
        order = billing.create_order(self.owner, self.project, Order.HOSTING_NEW)
        with override_settings(DEMO_PAYMENTS=False):
            self.assertEqual(self.client.post(reverse("payment_simulate", args=[order.pk]), {"result": "success"}).status_code, 404)
        r = self.client.post(reverse("payment_simulate", args=[order.pk]), {"result": "success"})
        self.assertRedirects(r, reverse("verify", args=[self.project.pk]))
