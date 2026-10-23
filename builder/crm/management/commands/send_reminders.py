"""
Daily reminders (email + WhatsApp), each sent at most once per project:
  - hosting renewal: N days before expiry (PlatformSettings.renewal_reminder_days, e.g. 30,7,1,0)
  - not live yet: N days after creating a site that isn't paid (unpaid_reminder_days, e.g. 1,3,7)
Only owners who gave contact consent get reminders.
"""
from django.core.management.base import BaseCommand
from django.db import IntegrityError, transaction
from django.utils import timezone

from core.models import PlatformSettings
from core.notify import notify_owner
from core.utils import app_url, rupees
from crm.models import ReminderLog, log_activity
from projects.models import Project


def _send_once(project, key, subject, text):
    try:
        with transaction.atomic():
            log = ReminderLog.objects.create(user=project.owner, project=project, key=key)
    except IntegrityError:
        return False
    channels = notify_owner(project.owner, subject, text)
    log.channels = ",".join(channels)
    log.save(update_fields=["channels"])
    log_activity(project.owner, "reminder_sent", project, detail=key)
    return True


def renewal_reminders(today, ps):
    sent = 0
    days = sorted(ps.renewal_days)
    qs = Project.objects.filter(plan=Project.PLAN_HOSTED, status__in=[Project.LIVE], hosting_expires_at__isnull=False,
                                owner__contact_consent=True).select_related("owner")
    for p in qs:
        expiry = timezone.localtime(p.hosting_expires_at).date()
        left = (expiry - today).days
        due = [d for d in days if 0 <= left <= d]
        if not due:
            continue
        d = min(due)
        when = "today" if left == 0 else "in %d day%s" % (left, "" if left == 1 else "s")
        text = ("Namaste %s, hosting for %s expires %s (%s). Renew for %s/year to keep it online: %s"
                % (p.owner.first_name, p.business_name, when, expiry.strftime("%d %b %Y"),
                   rupees(ps.price_hosting_renewal), app_url("/dashboard/?renew=%d" % p.pk)))
        sent += _send_once(p, "renewal:%d:%s" % (d, expiry.isoformat()), "Renew your website", text)
    return sent


def unpaid_reminders(today, ps):
    sent = 0
    days = sorted(ps.unpaid_days)
    qs = Project.objects.filter(status__in=[Project.DRAFT, Project.PREVIEW, Project.PENDING_PAYMENT],
                                owner__contact_consent=True).select_related("owner")
    for p in qs:
        age = (today - timezone.localtime(p.created_at).date()).days
        due = [d for d in days if d <= age]
        if not due:
            continue
        d = max(due)
        text = ("Namaste %s, your website for %s is ready. Take it live in 2 minutes: %s"
                % (p.owner.first_name, p.business_name, app_url("/projects/%d/go-live/" % p.pk)))
        sent += _send_once(p, "unpaid:%d" % d, "Your website is ready to go live", text)
    return sent


class Command(BaseCommand):
    help = "Send renewal and go-live reminders"

    def handle(self, *args, **opts):
        ps = PlatformSettings.load()
        today = timezone.localdate()
        r = renewal_reminders(today, ps)
        u = unpaid_reminders(today, ps)
        self.stdout.write("Sent %d renewal and %d go-live reminder(s)" % (r, u))
