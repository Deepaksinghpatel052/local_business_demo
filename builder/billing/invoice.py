import io

from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone
from xhtml2pdf import pisa


def _rs(paise):
    # The built-in PDF fonts have no ₹ glyph, so invoices use "Rs."
    return "Rs. %s" % format(paise / 100, ",.2f")


def invoice_pdf(order):
    gst = settings.GST_ENABLED and bool(settings.COMPANY.get("gstin"))
    user = order.user
    html = render_to_string("billing/invoice.html", {
        "order": order, "company": settings.COMPANY, "gst": gst, "user": user,
        "date": timezone.localtime(order.paid_at or order.created_at),
        "base": _rs(order.base_amount or order.amount), "gst_amount": _rs(order.gst_amount),
        "total": _rs(order.amount), "gst_rate": _gst_rate(order),
        "refunded": order.status == order.REFUNDED,
    })
    out = io.BytesIO()
    result = pisa.CreatePDF(html, dest=out, encoding="utf-8")
    if result.err:
        raise RuntimeError("Invoice PDF could not be created")
    return out.getvalue()


def _gst_rate(order):
    if not order.gst_amount or not order.base_amount:
        return ""
    return "%g%%" % round(100.0 * order.gst_amount / order.base_amount, 2)
