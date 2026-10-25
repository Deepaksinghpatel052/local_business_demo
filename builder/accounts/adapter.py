"""allauth hooks: emails (confirm email, password reset, ...) in the branded layout of templates/emails/base.html,
and Google sign-up filling our single `name` field."""
import re

from allauth.account.adapter import DefaultAccountAdapter
from allauth.account.utils import valid_email_or_none
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

from core.emails import brand_context, html_from_text


class AccountAdapter(DefaultAccountAdapter):
    def render_mail(self, template_prefix, email, context, headers=None):
        context = dict(brand_context(), **context)
        msg = super().render_mail(template_prefix, email, context, headers)
        # emails without their own account/email/*_message.html get the text wrapped in the same layout
        if isinstance(msg, EmailMultiAlternatives) and not msg.alternatives:
            msg.attach_alternative(render_to_string("emails/fallback.html", dict(
                context, body_html=html_from_text(msg.body),
                heading=re.sub(r"^\[[^\]]*\]\s*", "", msg.subject))), "text/html")
        return msg


class SocialAccountAdapter(DefaultSocialAccountAdapter):
    def populate_user(self, request, sociallogin, data):
        """Google gives first/last name; our User keeps one `name` (first_name is a read-only property)."""
        user = sociallogin.user
        user.email = valid_email_or_none(data.get("email")) or ""
        full = data.get("name") or " ".join(p for p in (data.get("first_name"), data.get("last_name")) if p)
        user.name = (full or "")[:120]
        return user
