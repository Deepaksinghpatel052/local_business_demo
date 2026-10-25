"""Team logins are created by the admin (createsuperuser, /django-admin/), not by sign-up, so their email
counts as confirmed. Without this, ACCOUNT_EMAIL_VERIFICATION=mandatory would lock the team out."""
from django.db.models.signals import m2m_changed, post_save
from django.dispatch import receiver

from .models import User


def trust_team_email(user):
    from allauth.account.models import EmailAddress
    if not user.email or not (user.is_staff or user.is_superuser or user.is_team):
        return
    addr = EmailAddress.objects.filter(user=user, email__iexact=user.email).first()
    if addr is None:
        EmailAddress.objects.create(user=user, email=user.email, verified=True,
                                    primary=not EmailAddress.objects.filter(user=user, primary=True).exists())
    elif not addr.verified:
        addr.verified = True
        addr.save(update_fields=["verified"])


@receiver(post_save, sender=User)
def on_user_saved(sender, instance, **kwargs):
    trust_team_email(instance)


@receiver(m2m_changed, sender=User.groups.through)
def on_groups_changed(sender, instance, action, **kwargs):
    if action == "post_add" and isinstance(instance, User):
        trust_team_email(instance)
