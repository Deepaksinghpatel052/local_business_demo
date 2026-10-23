"""Daily: unpublish previews nobody has opened or edited for N days (data is kept)."""
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db.models import Q
from django.utils import timezone

from core.models import PlatformSettings
from projects.models import Project
from projects.publish import publish_project

PREVIEW_STATUSES = (Project.DRAFT, Project.PREVIEW, Project.PENDING_PAYMENT, Project.REJECTED)


def unpublish_stale(now=None):
    now = now or timezone.now()
    cutoff = now - timedelta(days=PlatformSettings.load().preview_expiry_days)
    qs = (Project.objects.filter(status__in=PREVIEW_STATUSES).exclude(published_mode="")
          .filter(last_edited_at__lt=cutoff)
          .filter(Q(last_preview_at__isnull=True) | Q(last_preview_at__lt=cutoff)))
    done = []
    for p in qs:
        publish_project(p, "unpublish")
        done.append(p)
    return done


class Command(BaseCommand):
    help = "Unpublish stale previews"

    def handle(self, *args, **opts):
        done = unpublish_stale()
        self.stdout.write("Unpublished %d preview(s)" % len(done))
