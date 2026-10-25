"""Tell an owner something by email and WhatsApp (pluggable provider)."""
import logging

from django.conf import settings

from . import messaging
from .emails import send_branded

log = logging.getLogger(__name__)


def notify_owner(user, subject, text, whatsapp=True):
    channels = []
    try:
        dashboard = settings.APP_URL + "/dashboard/"
        hello = "Hi %s,\n\n%s" % (user.first_name, text)
        send_branded([user.email], subject, "%s\n\n- Team Devnixplus\n%s" % (hello, dashboard), html_text=hello,
                     button_label="Open my dashboard", button_url=dashboard, preheader=text[:120])
        channels.append("email")
    except Exception as e:   # never break a payment/approval because email is down
        log.warning("email to %s failed: %s", user.email, e)
    if whatsapp and user.contact_consent and (user.whatsapp or user.mobile):
        if messaging.whatsapp().send(user.whatsapp or user.mobile, "%s\n\n%s" % (subject, text)):
            channels.append("whatsapp")
    return channels
