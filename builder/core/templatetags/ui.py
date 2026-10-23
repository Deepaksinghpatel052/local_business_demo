from django import template
from django.utils.html import format_html

from core.utils import format_mobile, rupees as _rupees

register = template.Library()

STATUS_BADGES = {
    "draft": "secondary", "preview": "info", "pending_payment": "warning", "pending_verification": "warning",
    "approved": "primary", "live": "success", "download_ready": "success", "expired": "danger",
    "suspended": "dark", "rejected": "danger",
    "created": "secondary", "paid": "success", "failed": "danger", "refunded": "info",
}


@register.filter
def add_class(field, css):
    """{{ form.email|add_class:"form-control" }}"""
    widget = field.field.widget
    attrs = dict(widget.attrs)
    kind = getattr(widget, "input_type", "")
    if kind == "checkbox":
        css = "form-check-input"
    elif widget.__class__.__name__ in ("Select", "SelectMultiple"):
        css = "form-select"
    if field.errors:
        css += " is-invalid"
    attrs["class"] = (attrs.get("class", "") + " " + css).strip()
    return field.as_widget(attrs=attrs)


@register.filter
def is_checkbox(field):
    return getattr(field.field.widget, "input_type", "") == "checkbox"


@register.filter
def badge(status):
    return STATUS_BADGES.get(status, "secondary")


@register.filter
def rupees(value):
    try:
        return _rupees(value)
    except (TypeError, ValueError):
        return value


@register.filter
def paise(value):
    try:
        r = int(value) / 100
    except (TypeError, ValueError):
        return value
    return _rupees(r) if r == int(r) else "₹%.2f" % r


@register.filter
def mobile(value):
    return format_mobile(value)


@register.simple_tag
def tr(en, hi):
    """Editor label in English with its Hindi text (the editor's हिंदी toggle swaps them)."""
    return format_html('<span class="tr" data-en="{}" data-hi="{}">{}</span>', en, hi, en)
