from allauth.account.signals import user_signed_up
from django.dispatch import receiver

from .models import log_activity


@receiver(user_signed_up)
def on_signed_up(request, user, **kwargs):
    source = request.session.get("signup_source", "") if request is not None else ""
    if kwargs.get("sociallogin"):
        source = source or "google"
    if source and not user.signup_source:
        user.signup_source = source[:80]
        user.save(update_fields=["signup_source"])
    log_activity(user, "signed_up", detail=user.signup_source or "email")
