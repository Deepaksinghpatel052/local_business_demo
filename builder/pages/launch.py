"""Coming soon mode: before settings.LAUNCH_AT the public site is replaced by /coming-soon/."""
from django.conf import settings
from django.utils import timezone


def before_launch():
    return bool(settings.LAUNCH_AT) and timezone.now() < settings.LAUNCH_AT


def spots():
    """Real numbers from the database: (taken, left) of the EARLY_OFFER_SPOTS free websites."""
    from crm.models import EarlyAccess
    taken = min(EarlyAccess.objects.filter(free_offer=True).count(), settings.EARLY_OFFER_SPOTS)
    return taken, settings.EARLY_OFFER_SPOTS - taken
