"""Daily: live sites past expiry + grace period become 'expired' and show the unavailable page."""
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from core.models import PlatformSettings
from core.notify import notify_owner
from core.utils import app_url
from projects.models import Project
from projects.publish import publish_project


def expire_due(now=None):
    now = now or timezone.now()
    ps = PlatformSettings.load()
    cutoff = now - timedelta(days=ps.grace_period_days)
    done = []
    for p in Project.objects.filter(status=Project.LIVE, plan=Project.PLAN_HOSTED, hosting_expires_at__lt=cutoff):
        p.status = Project.EXPIRED
        p.save(update_fields=["status"])
        publish_project(p, "unavailable")
        notify_owner(p.owner, "Your website is offline",
                     "Hosting for %s has expired, so the website now shows a 'temporarily unavailable' page. "
                     "All your details are safe. Renew now and it comes back instantly: %s"
                     % (p.business_name, app_url("/dashboard/")))
        done.append(p)
    return done


class Command(BaseCommand):
    help = "Expire hosting after the grace period"

    def handle(self, *args, **opts):
        done = expire_due()
        self.stdout.write("Expired %d site(s)" % len(done))
