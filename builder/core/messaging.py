"""
Pluggable SMS and WhatsApp providers.

  SMS_PROVIDER=mock       the OTP is shown on screen (development)
  SMS_PROVIDER=msg91      MSG91 OTP API (MSG91_AUTH_KEY, MSG91_TEMPLATE_ID)
  SMS_PROVIDER=fast2sms   Fast2SMS bulkV2 API (FAST2SMS_API_KEY; FAST2SMS_ROUTE=otp, or dlt with
                          FAST2SMS_SENDER_ID + FAST2SMS_TEMPLATE_ID)
  WHATSAPP_PROVIDER=mock  messages are only logged (OutgoingMessage)
  WHATSAPP_PROVIDER=cloud WhatsApp Cloud API (WHATSAPP_TOKEN, WHATSAPP_PHONE_ID)
"""
import logging

import requests
from django.conf import settings

from .models import OutgoingMessage
from .utils import wa_number

log = logging.getLogger(__name__)


class MockSMS:
    name = "mock"
    shows_code_on_screen = True

    def send_otp(self, mobile, code):
        OutgoingMessage.objects.create(channel="sms", provider=self.name, to=mobile,
                                       body="Your Devnixplus code is %s" % code)
        log.info("MockSMS OTP for %s: %s", mobile, code)
        return True


class MSG91SMS:
    name = "msg91"
    shows_code_on_screen = False
    URL = "https://control.msg91.com/api/v5/otp"

    def send_otp(self, mobile, code):
        try:
            r = requests.post(self.URL, timeout=10, headers={"authkey": settings.MSG91_AUTH_KEY}, json={
                "template_id": settings.MSG91_TEMPLATE_ID, "mobile": "91" + mobile, "otp": code,
            })
            ok = r.status_code == 200 and r.json().get("type") == "success"
        except (requests.RequestException, ValueError) as e:
            log.warning("MSG91 failed: %s", e)
            ok = False
        OutgoingMessage.objects.create(channel="sms", provider=self.name, to=mobile, body="OTP",
                                       status="sent" if ok else "failed")
        return ok


class Fast2SMS:
    """Fast2SMS (https://www.fast2sms.com/dashboard/dev-api).
    route "otp": Fast2SMS's own OTP message ("... is your verification code"), no DLT needed.
    route "dlt": your DLT-approved template; its single variable is the code."""
    name = "fast2sms"
    shows_code_on_screen = False
    URL = "https://www.fast2sms.com/dev/bulkV2"

    def payload(self, mobile, code):
        if settings.FAST2SMS_ROUTE == "dlt":
            return {"route": "dlt", "sender_id": settings.FAST2SMS_SENDER_ID, "message": settings.FAST2SMS_TEMPLATE_ID,
                    "variables_values": code, "flash": 0, "numbers": mobile}
        return {"route": "otp", "variables_values": code, "numbers": mobile}

    def send_otp(self, mobile, code):
        error = ""
        try:
            r = requests.post(self.URL, timeout=10, json=self.payload(mobile, code),
                              headers={"authorization": settings.FAST2SMS_API_KEY})
            body = r.json()
            ok = r.status_code == 200 and body.get("return") is True
            if not ok:
                error = str(body.get("message") or r.text)[:500]
        except (requests.RequestException, ValueError) as e:
            ok, error = False, str(e)[:500]
        if not ok:
            log.warning("Fast2SMS failed for %s: %s", mobile, error)
        OutgoingMessage.objects.create(channel="sms", provider=self.name, to=mobile, body="OTP",
                                       status="sent" if ok else "failed", error=error)
        return ok


class MockWhatsApp:
    name = "mock"

    def send(self, to, text):
        OutgoingMessage.objects.create(channel="whatsapp", provider=self.name, to=wa_number(to), body=text)
        log.info("MockWhatsApp to %s: %s", to, text[:80])
        return True


class CloudWhatsApp:
    """WhatsApp Cloud API. Free-form text only works inside the 24 h customer window;
    for reminders outside it, switch `send` to an approved template message."""
    name = "cloud"

    def send(self, to, text):
        url = "https://graph.facebook.com/v20.0/%s/messages" % settings.WHATSAPP_PHONE_ID
        status, error = "sent", ""
        try:
            r = requests.post(url, timeout=10, headers={"Authorization": "Bearer " + settings.WHATSAPP_TOKEN}, json={
                "messaging_product": "whatsapp", "to": wa_number(to), "type": "text", "text": {"body": text},
            })
            if r.status_code >= 300:
                status, error = "failed", r.text[:500]
        except requests.RequestException as e:
            status, error = "failed", str(e)
        OutgoingMessage.objects.create(channel="whatsapp", provider=self.name, to=wa_number(to), body=text,
                                       status=status, error=error)
        return status == "sent"


SMS_PROVIDERS = {"msg91": MSG91SMS, "fast2sms": Fast2SMS}


def sms():
    return SMS_PROVIDERS.get(settings.SMS_PROVIDER, MockSMS)()


def whatsapp():
    return CloudWhatsApp() if settings.WHATSAPP_PROVIDER == "cloud" else MockWhatsApp()
