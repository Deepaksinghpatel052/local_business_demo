from django.conf import settings
from django.core.management.base import BaseCommand

from projects.publish import sync_shared


class Command(BaseCommand):
    help = "Copy template/css, js and placeholders to SITES_ROOT/_shared/<SHARED_VERSION>/"

    def add_arguments(self, parser):
        parser.add_argument("--force", action="store_true", help="overwrite an existing version folder")

    def handle(self, *args, **opts):
        dest = sync_shared(force=opts["force"])
        self.stdout.write(self.style.SUCCESS("Shared assets %s ready at %s" % (settings.SHARED_VERSION, dest)))
