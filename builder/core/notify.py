"""Tell an owner something by email and WhatsApp (pluggable provider)."""
import logging

from django.conf import settings
from django.core.mail import send_mail

from . import messaging

log = logging.getLogger(__name__)


def notify_owner(user, subject, text, whatsapp=True):
    channels = []
    try:
        send_mail(subject, text + "\n\n- Team Devnixplus\n" + settings.APP_URL + "/dashboard/",
                  settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)
        channels.append("email")
    except Exception as e:   # never break a payment/approval because email is down
        log.warning("email to %s failed: %s", user.email, e)
    if whatsapp and user.contact_consent and (user.whatsapp or user.mobile):
        if messaging.whatsapp().send(user.whatsapp or user.mobile, "%s\n\n%s" % (subject, text)):
            channels.append("whatsapp")
    return channels
