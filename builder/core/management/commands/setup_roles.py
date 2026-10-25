from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand
from django.db.models import Q

from accounts.models import TEAM_ROLES, User
from accounts.signals import trust_team_email
from core.models import PlatformSettings


class Command(BaseCommand):
    help = "Create the team roles (Admin, Sales, Verifier) and the settings row"

    def handle(self, *args, **opts):
        for name in TEAM_ROLES:
            Group.objects.get_or_create(name=name)
        PlatformSettings.load()
        # existing team logins: their email counts as confirmed (ACCOUNT_EMAIL_VERIFICATION=mandatory)
        for user in User.objects.filter(Q(is_staff=True) | Q(is_superuser=True) | Q(groups__name__in=TEAM_ROLES)).distinct():
            trust_team_email(user)
        self.stdout.write(self.style.SUCCESS("Roles ready: %s" % ", ".join(TEAM_ROLES)))
