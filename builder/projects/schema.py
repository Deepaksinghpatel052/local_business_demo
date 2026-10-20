"""
JSON Schema of the data.js shape (window.BUSINESS) and the server-side cleaning
that runs before every save.

clean_data(raw) -> (data, errors)
  1. strips HTML from every string (so "<script>" can never be stored),
  2. validates the result against SCHEMA (unknown keys are rejected),
  3. applies the rules a schema can't express (a Google rating needs a Google link…).
"""
import functools
import re

import jsonschema
from django.utils.html import strip_tags

from templates_lib.categories import categories, fonts

SECTION_KEYS = ["hero", "highlights", "about", "services", "fleet", "why", "doctor", "results",
                "gallery", "testimonials", "cta", "hours", "faq", "contact"]
DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
SOCIAL_KEYS = ["instagram", "facebook", "youtube", "twitter", "linkedin"]

HEX = r"^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$"
URL = r"^https?://[^\s<>\"']+$"
URL_OR_EMPTY = r"^(?:|https?://[^\s<>\"']+)$"
IMAGE = r"^(?:|images/[A-Za-z0-9._-]+|https://[^\s<>\"']+)$"
ICON = r"^(?:|bi-[a-z0-9-]+)$"
PHONE = r"^[0-9+()\s-]{0,20}$"


def text(n=200):
    return {"type": "string", "maxLength": n}


def obj(props, required=()):
    return {"type": "object", "properties": props, "additionalProperties": False, "required": list(required)}


def arr(items, n=50):
    return {"type": "array", "items": items, "maxItems": n}


@functools.lru_cache(maxsize=1)
def schema():
    font = {"type": "string", "enum": [""] + fonts()}
    theme = obj({
        "mode": {"type": "string", "enum": ["auto"]},
        "primary": {"type": "string", "pattern": HEX}, "primaryDark": {"type": "string", "pattern": HEX},
        "accent": {"type": "string", "pattern": HEX}, "background": {"type": "string", "pattern": HEX},
        "surface": {"type": "string", "pattern": HEX}, "text": {"type": "string", "pattern": HEX},
        "headingFont": font, "bodyFont": font,
        "buttonStyle": {"type": "string", "enum": ["", "rounded", "pill", "square"]},
        "borderRadius": {"type": "string", "pattern": r"^(?:|\d{1,2}px)$"},
    })
    service = obj({
        "title": text(80), "desc": text(400), "price": text(40),
        "image": {"type": "string", "pattern": IMAGE}, "icon": {"type": "string", "pattern": ICON},
        "features": arr(text(80), 12), "popular": {"type": "boolean"},
        # e.g. an advisor's own referral link to buy a policy / start a SIP (https only)
        "link": {"type": "string", "maxLength": 500, "pattern": r"^(?:|https://[^\s<>\"']+)$"}, "linkLabel": text(30),
    })
    return obj({
        "name": {"type": "string", "minLength": 1, "maxLength": 80},
        "slug": {"type": "string", "pattern": r"^[a-z0-9-]{1,60}$"},
        "category": {"type": "string", "enum": list(categories())},
        "tagline": text(140), "about": text(1500), "established": {"type": "string", "pattern": r"^(?:|\d{4})$"},
        "owner": text(80), "phone": {"type": "string", "pattern": PHONE},
        "whatsapp": {"type": "string", "pattern": r"^\d{0,15}$"},
        "email": {"type": "string", "maxLength": 120, "pattern": r"^(?:|[^@\s<>]+@[^@\s<>]+\.[^@\s<>]+)$"},
        "address": text(300), "city": text(60), "mapQuery": text(200),
        "hours": obj({d: {"type": "string", "maxLength": 60, "pattern": r"^[0-9A-Za-z:.,;&\s–—-]*$"} for d in DAY_KEYS}),
        "rating": {"type": "number", "minimum": 0, "maximum": 5},
        "reviewCount": {"type": "integer", "minimum": 0, "maximum": 10000000},
        "googleUrl": {"type": "string", "maxLength": 500, "pattern": URL_OR_EMPTY},
        "happyCustomers": {"type": "integer", "minimum": 0, "maximum": 100000000},
        "highlights": arr(text(40), 12),
        "services": arr(service, 40),
        "menuCategories": arr(obj({
            "name": text(60), "icon": {"type": "string", "pattern": ICON},
            "items": arr(obj({"title": text(80), "desc": text(300), "price": text(40),
                              "veg": {"type": ["boolean", "null"]}, "tag": text(30)}), 60),
        }), 15),
        "heroImage": {"type": "string", "pattern": IMAGE},
        "aboutImage": {"type": "string", "pattern": IMAGE},
        "logo": {"type": "string", "pattern": IMAGE},
        "logoWidth": {"type": "integer", "minimum": 0, "maximum": 400},
        "gallery": arr({"anyOf": [
            {"type": "string", "pattern": IMAGE},
            obj({"src": {"type": "string", "pattern": IMAGE}, "caption": text(80)}),
        ]}, 24),
        "testimonials": arr(obj({"name": text(60), "text": text(600),
                                 "rating": {"type": "number", "minimum": 1, "maximum": 5}}), 12),
        "faqs": arr(obj({"q": text(200), "a": text(800)}), 20),
        "whyChooseUs": arr(obj({"icon": {"type": "string", "pattern": ICON}, "title": text(60), "text": text(200)}), 4),
        "doctor": obj({
            "name": text(80), "title": text(80), "qualification": text(120), "experience": text(60),
            "photo": {"type": "string", "pattern": IMAGE}, "about": text(800), "specialities": arr(text(60), 12),
        }),
        "results": arr(obj({"value": text(20), "label": text(60)}), 8),
        "vehicles": arr(obj({
            "name": text(60), "models": text(100), "seats": {"type": "integer", "minimum": 0, "maximum": 60},
            "bags": {"type": "integer", "minimum": 0, "maximum": 30}, "rate": text(40),
            "image": {"type": "string", "pattern": IMAGE}, "icon": {"type": "string", "pattern": ICON},
            "ac": {"type": "boolean"},
        }), 12),
        "social": obj({k: {"type": "string", "maxLength": 300, "pattern": URL_OR_EMPTY} for k in SOCIAL_KEYS}),
        "languages": {"type": "array", "items": {"type": "string", "enum": ["en", "hi"]}, "uniqueItems": True, "maxItems": 2},
        "theme": {"anyOf": [{"type": "string", "enum": ["auto"]}, theme]},
        "sections": {"type": "array", "items": {"type": "string", "enum": SECTION_KEYS}, "uniqueItems": True},
        "heroStyle": {"type": "string", "enum": ["", "full", "center", "split"]},
        "disclaimer": text(1000),
        "developer": obj({"name": text(60), "phone": text(20), "whatsapp": text(15), "portfolio": text(200)}),
        # Platform-only extras (main.js ignores keys it doesn't know)
        "seo": obj({"title": text(70), "description": text(170)}),
    }, required=["name", "category"])


def _strip(value):
    """Remove HTML tags from every string, recursively."""
    if isinstance(value, str):
        out = strip_tags(value)
        # strip_tags removes complete tags; also break any leftover tag opener ("<scr<b></b>ipt" tricks).
        # A plain "<" as in "under < 500" is kept: the renderer escapes all text anyway.
        out = re.sub(r"<(?=[A-Za-z/!?])", "", out)
        return out.replace("\x00", "").strip()
    if isinstance(value, list):
        return [_strip(v) for v in value]
    if isinstance(value, dict):
        return {str(k): _strip(v) for k, v in value.items()}
    return value


def _path(err):
    return ".".join(str(p) for p in err.absolute_path) or "data"


def clean_data(raw):
    """Return (clean_data, errors). errors is a list of {"field": "services.0.title", "message": "..."}."""
    if not isinstance(raw, dict):
        return None, [{"field": "data", "message": "Invalid data."}]
    data = _strip(raw)
    errors = []
    validator = jsonschema.Draft7Validator(schema())
    for err in sorted(validator.iter_errors(data), key=lambda e: list(e.absolute_path)):
        errors.append({"field": _path(err), "message": _friendly(err)})
    if errors:
        return None, errors
    if data.get("rating") and not data.get("googleUrl"):
        errors.append({"field": "googleUrl", "message": "Add your Google listing link to show a Google rating."})
    if errors:
        return None, errors
    return data, []


def _friendly(err):
    v = err.validator
    if v == "additionalProperties":
        return "Unknown field."
    if v == "pattern":
        field = str(err.absolute_path[-1]) if err.absolute_path else ""
        if field in SOCIAL_KEYS or field == "googleUrl" or field == "link":
            return "Enter a full link starting with https://"
        if field in ("primary", "accent", "background", "surface", "text", "primaryDark"):
            return "Pick a valid colour."
        if field == "phone":
            return "Enter a valid phone number."
        if field == "email":
            return "Enter a valid email address."
        if field in ("image", "heroImage", "logo", "photo", "src", "aboutImage"):
            return "Upload the photo again (only uploaded photos or https links are allowed)."
        return "This value is not allowed."
    if v == "maxLength":
        return "Too long (max %d characters)." % err.validator_value
    if v == "minLength":
        return "This field is required."
    if v == "enum":
        return "Choose one of the options."
    if v in ("maximum", "minimum"):
        return "Out of range."
    if v == "maxItems":
        return "Too many items (max %d)." % err.validator_value
    if v == "type":
        return "Invalid value."
    return err.message
