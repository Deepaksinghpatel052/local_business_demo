"""allauth emails (confirm email, password reset, ...) in the branded layout of templates/emails/base.html."""
import re

from allauth.account.adapter import DefaultAccountAdapter
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
