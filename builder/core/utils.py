import re
from urllib.parse import quote

from django.conf import settings

MOBILE_RE = re.compile(r"^[6-9]\d{9}$")


def client_ip(request):
    fwd = request.META.get("HTTP_X_FORWARDED_FOR", "")
    ip = fwd.split(",")[0].strip() if fwd else request.META.get("REMOTE_ADDR", "")
    return ip or None


def normalize_mobile(value):
    """Indian mobile in any common format -> 10 digits, or "" if it isn't one."""
    d = re.sub(r"\D", "", str(value or ""))
    if len(d) == 12 and d.startswith("91"):
        d = d[2:]
    elif len(d) == 11 and d.startswith("0"):
        d = d[1:]
    return d if MOBILE_RE.match(d) else ""


MAPS_HOSTS = ("google.com", "google.co.in", "goo.gl", "g.page", "g.co", "maps.app.goo.gl")


def is_maps_link(url):
    """True for a Google Maps listing/share link (maps.app.goo.gl, google.com/maps, g.page…)."""
    from urllib.parse import urlparse
    p = urlparse(str(url or "").strip())
    host = (p.hostname or "").lower()
    return p.scheme in ("http", "https") and any(host == h or host.endswith("." + h) for h in MAPS_HOSTS)


def wa_number(value):
    """Mobile/phone -> WhatsApp digits with country code (919876543210)."""
    m = normalize_mobile(value)
    if m:
        return "91" + m
    return re.sub(r"\D", "", str(value or ""))


def wa_link(number, text=""):
    n = wa_number(number)
    if not n:
        return ""
    return "https://wa.me/%s%s" % (n, ("?text=" + quote(text)) if text else "")


def format_mobile(value):
    m = normalize_mobile(value)
    return "+91 %s %s" % (m[:5], m[5:]) if m else str(value or "")


def site_url(slug):
    """Public URL of a published site, in the configured style (DEMO_URL_STYLE)."""
    if settings.DEMO_URL_STYLE == "subdomain":
        return "%s://%s.%s/" % (settings.DEMO_SCHEME, slug, settings.DEMO_DOMAIN)
    return "%s/%s/" % (settings.DEMO_BASE_URL, slug)


def app_url(path):
    return settings.APP_URL + path


def shared_path():
    """Root-relative URL of the versioned shared template assets."""
    return "/_shared/%s/" % settings.SHARED_VERSION


def rupees(amount):
    """1999 -> "₹1,999" (Indian grouping)."""
    n = int(amount)
    s = str(abs(n))
    if len(s) > 3:
        head, tail = s[:-3], s[-3:]
        groups = []
        while len(head) > 2:
            groups.insert(0, head[-2:])
            head = head[:-2]
        if head:
            groups.insert(0, head)
        s = ",".join(groups + [tail])
    return ("-" if n < 0 else "") + "₹" + s
