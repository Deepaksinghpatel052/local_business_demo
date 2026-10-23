from django.core.management.base import BaseCommand

from projects.models import Project
from projects.publish import publish_project


class Command(BaseCommand):
    help = "Rewrite every published project folder (after a template change or a new SHARED_VERSION)"

    def handle(self, *args, **opts):
        n = 0
        for p in Project.objects.exclude(published_mode=""):
            publish_project(p)
            n += 1
        self.stdout.write(self.style.SUCCESS("Republished %d projects" % n))
