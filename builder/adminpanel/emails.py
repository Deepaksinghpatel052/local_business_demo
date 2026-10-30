"""Sample of every email, for the team's email test page (/manage/emails/): preview in the browser or send to yourself."""
import re

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags

from core.emails import brand_context, html_from_text

# key: (label, allauth template prefix or None, extra context)
ACCOUNT = {
    "welcome": ("Welcome: confirm email", "account/email/email_confirmation_signup", {"activate_url": "/accounts/confirm-email/sample/"}),
    "login-code": ("Sign-in code", "account/email/login_code", {"code": "482913"}),
    "password-reset": ("Password reset link", "account/email/password_reset_key", {"password_reset_url": "/accounts/password/reset/key/sample/"}),
    "password-changed": ("Password changed", "account/email/password_changed", {}),
    "email-changed": ("Email address changed", "account/email/email_changed", {"from_email": "old@example.com", "to_email": "new@example.com"}),
}


def _early_access(user):
    launch = timezone.localtime(settings.LAUNCH_AT).strftime("%d %B %Y") if settings.LAUNCH_AT else "launch day"
    return ("You're on the list for Sharma Sweets", "You're on the list!",
            "Hi %s,\n\nYou are one of the first %d businesses, so your website for Sharma Sweets is free.\n\n"
            "We launch on %s. Our team will call or WhatsApp you on 9876543210 to set it up."
            % (user.first_name or "there", settings.EARLY_OFFER_SPOTS, launch), "", "")


def _website_live(user):
    return ("Your website is live", "Your website is live!",
            "Hi %s,\n\nGood news: your website Sharma Sweets is now live. Share the link with your customers "
            "on WhatsApp, Instagram and your visiting card." % (user.first_name or "there"),
            "Open my website", settings.DEMO_BASE_URL + "/sample-bakery/")


NOTIFICATION = {
    "early-access": ("Early access confirmation", _early_access),
    "notification": ("Notification with a button", _website_live),
}


def samples():
    return [(k, v[0]) for k, v in list(ACCOUNT.items()) + list(NOTIFICATION.items())]


def render(key, user):
    """(subject, text, html) for one sample, built exactly like the real email."""
    ctx = dict(brand_context(), user=user, email=user.email)
    if key in ACCOUNT:
        _, prefix, extra = ACCOUNT[key]
        ctx.update({k: settings.APP_URL + v if v.startswith("/") else v for k, v in extra.items()})
        subject = render_to_string(prefix + "_subject.txt", ctx).strip()
        html = render_to_string(prefix + "_message.html", ctx)
        text = re.sub(r"\n\s*\n+", "\n\n", strip_tags(html.split("<body", 1)[-1])).strip()
        return subject, text, html
    if key in NOTIFICATION:
        subject, heading, text, label, url = NOTIFICATION[key][1](user)
        html = render_to_string("emails/notification.html", dict(
            ctx, heading=heading, body_html=html_from_text(text), button_label=label, button_url=url,
            preheader=text.strip()[:120]))
        return subject, text, html
    raise KeyError(key)


def send(key, user, to):
    subject, text, html = render(key, user)
    msg = EmailMultiAlternatives("[Test] " + subject, text, settings.DEFAULT_FROM_EMAIL, [to])
    msg.attach_alternative(html, "text/html")
    msg.send(fail_silently=False)
