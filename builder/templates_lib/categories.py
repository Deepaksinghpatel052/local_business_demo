"""
Category facts for the platform, read from the renderer's own template/js/themes.js
so the two can never drift apart: key, label, schema.org type, services heading,
stock-photo folder, preset family, colour presets and Google Fonts.
"""
import functools
import re

from django.conf import settings

# Heading of the services section per `services` key in themes.js (English / Hindi),
# used as the label of editor step 3.
SERVICE_LABELS = {
    "menu": ("Menu", "मेन्यू"), "services": ("Services", "सेवाएँ"), "treatments": ("Treatments", "ट्रीटमेंट"),
    "therapies": ("Therapies", "थेरेपी"), "collections": ("Collections", "कलेक्शन"), "plans": ("Plans", "प्लान"),
    "departments": ("Departments", "विभाग"), "programs": ("Programs", "प्रोग्राम"), "courses": ("Courses", "कोर्स"),
    "rooms": ("Rooms", "कमरे"), "products": ("Products", "प्रोडक्ट"), "properties": ("Properties", "प्रॉपर्टी"),
    "packages": ("Packages", "पैकेज"), "rides": ("Rides & fares", "सवारी और किराया"),
    "petcare": ("Products & care", "प्रोडक्ट और केयर"),
    "financial": ("Policies & investments", "पॉलिसी और निवेश"),
}

_CAT_RE = re.compile(
    r"^\s{4}'?([a-z-]+)'?:\s*\{\s*\n"
    r"\s*preset:\s*'(\w+)',\s*label:\s*'([^']+)',\s*schema:\s*'(\w+)',\s*services:\s*'(\w+)',\s*style:\s*'(\w+)',\s*icon:\s*'([\w-]+)',\s*\n"
    r"\s*hero:\s*'(\w+)',\s*photos:\s*'([\w-]+)'",
    re.M)
_PRESET_RE = re.compile(
    r"^\s{4}(\w+):\s*\{\s*\n\s*label:\s*'([^']+)',\s*\n\s*palette:\s*\{\s*primary:\s*'(#\w+)',\s*accent:\s*'(#\w+)',"
    r"\s*background:\s*'(#\w+)',\s*surface:\s*'(#\w+)',\s*text:\s*'(#\w+)'\s*\}",
    re.M)
_FONTS_RE = re.compile(r"^\s{4}'([^']+)':\s*'[\d;]+'", re.M)


@functools.lru_cache(maxsize=1)
def _themes_js():
    return (settings.TEMPLATE_DIR / "js" / "themes.js").read_text(encoding="utf-8")


@functools.lru_cache(maxsize=1)
def categories():
    """{key: {...}} in the order of themes.js."""
    out = {}
    for m in _CAT_RE.finditer(_themes_js()):
        key, preset, label, schema, services, style, icon, hero, photos = m.groups()
        out[key] = {
            # title: same as CAT_TITLE in main.js ("tour & travel agency" -> "Tour & Travel Agency")
            "key": key, "preset": preset, "label": label, "title": re.sub(r"\b\w", lambda x: x.group(0).upper(), label),
            "schema": schema, "services": services, "style": style, "icon": icon, "hero": hero, "photos": photos,
            "services_label": SERVICE_LABELS.get(services, ("Services", "सेवाएँ")),
        }
    if "general" not in out:
        raise RuntimeError("Could not read categories from template/js/themes.js")
    return out


def category(key):
    cats = categories()
    return cats.get(key) or cats["general"]


def category_choices():
    return [(k, c["title"]) for k, c in categories().items()]


@functools.lru_cache(maxsize=1)
def colour_presets():
    """Family palettes from themes.js, offered as one-click colour presets in the editor."""
    out = []
    for m in _PRESET_RE.finditer(_themes_js()):
        key, label, primary, accent, background, surface, text = m.groups()
        out.append({"key": key, "label": label, "primary": primary, "accent": accent,
                    "background": background, "surface": surface, "text": text})
    return out


@functools.lru_cache(maxsize=1)
def fonts():
    return sorted(set(_FONTS_RE.findall(_themes_js())) - {"Noto Sans Devanagari"})
