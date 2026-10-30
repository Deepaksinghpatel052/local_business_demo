"""
Branded HTML emails. Every email (allauth's sign-up/password emails and our own notifications) uses
templates/emails/base.html, with the plain text kept as the fallback part.
"""
import re

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import escape

from .models import PlatformSettings
from .utils import wa_link

URL_RE = re.compile(r"(https?://[^\s<>\"']+)")


def brand_context():
    ps = PlatformSettings.load()
    return {
        "brand_name": settings.EMAIL_BRAND_NAME,          # product brand in subjects, text and sign-off
        "company_name": settings.COMPANY["name"],          # legal name in the footer
        "brand_address": settings.COMPANY["address"],
        "app_url": settings.APP_URL,
        "logo_url": settings.EMAIL_LOGO_URL or "%s%simg/email-logo-businessbuilder.png" % (settings.APP_URL, settings.STATIC_URL),
        "support_email": ps.support_email,
        "support_phone": ps.support_phone,
        "support_wa": wa_link(ps.support_whatsapp, "Hi Devnixplus, I need help with my website."),
        "year": timezone.now().year,
    }


def html_from_text(text):
    """Plain text -> paragraphs with clickable links (for emails that have no HTML template)."""
    out = []
    for para in re.split(r"\n\s*\n", text.strip()):
        html = URL_RE.sub(r'<a href="\1" style="color:#4436d6;word-break:break-all;">\1</a>', escape(para))
        out.append('<p style="margin:0 0 16px;">%s</p>' % html.replace("\n", "<br>"))
    return "".join(out)


def send_branded(to, subject, text, html_text="", heading="", button_label="", button_url="", preheader=""):
    """One email to `to` (list): `text` as the plain part, `html_text` (default: text) in the branded layout."""
    ctx = dict(brand_context(), heading=heading or subject, body_html=html_from_text(html_text or text),
               button_label=button_label, button_url=button_url, preheader=preheader or text.strip()[:120])
    msg = EmailMultiAlternatives(subject, text, settings.DEFAULT_FROM_EMAIL, to)
    msg.attach_alternative(render_to_string("emails/notification.html", ctx), "text/html")
    msg.send(fail_silently=False)
