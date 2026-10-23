from django.conf import settings

from templates_lib.models import Template

from .models import PlatformSettings
from .utils import rupees, wa_link


def platform(request):
    ps = PlatformSettings.load()
    active = Template.objects.filter(is_active=True)
    return {
        # live counts: they go up by themselves when a design is imported or switched on in /manage/templates/
        "design_count": active.count(),
        "design_category_count": active.values("category").distinct().count(),
        "ps": ps,
        "prices": {
            "hosting_new": rupees(ps.price_hosting_new),
            "hosting_renewal": rupees(ps.price_hosting_renewal),
            "download": rupees(ps.price_download),
        },
        "support_wa": wa_link(ps.support_whatsapp, "Hi Devnixplus, I need help with my website."),
        "google_login": settings.GOOGLE_LOGIN_ENABLED,
        "APP_URL": settings.APP_URL,
    }
