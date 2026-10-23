from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand

from accounts.models import TEAM_ROLES
from core.models import PlatformSettings


class Command(BaseCommand):
    help = "Create the team roles (Admin, Sales, Verifier) and the settings row"

    def handle(self, *args, **opts):
        for name in TEAM_ROLES:
            Group.objects.get_or_create(name=name)
        PlatformSettings.load()
        self.stdout.write(self.style.SUCCESS("Roles ready: %s" % ", ".join(TEAM_ROLES)))
