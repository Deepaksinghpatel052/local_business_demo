import logging

from django import forms
from django.conf import settings
from django.contrib import messages
from django.core.mail import send_mail
from django.db import IntegrityError, transaction
from django.db.models import Q
from django.shortcuts import redirect, render
from django.urls import reverse
from django.utils import timezone

from accounts.forms import CONSENT_LABEL, MobileField, business_category_choices
from core.emails import send_branded
from core.models import PlatformSettings
from core.ratelimit import ratelimit
from crm.models import EarlyAccess
from templates_lib.categories import categories
from templates_lib.models import Template

from .launch import before_launch, spots

log = logging.getLogger(__name__)


def home(request):
    if request.GET.get("utm_source") and not request.user.is_authenticated:
        request.session["signup_source"] = ("utm:" + request.GET["utm_source"])[:80]
    return render(request, "pages/home.html", {
        "templates": Template.objects.filter(is_active=True),
    })


def page(name):
    def view(request):
        return render(request, "pages/%s.html" % name)
    view.__name__ = name
    return view


class ContactForm(forms.Form):
    name = forms.CharField(max_length=120)
    email = forms.EmailField()
    mobile = forms.CharField(max_length=16, required=False, label="Mobile (optional)")
    message = forms.CharField(max_length=3000, widget=forms.Textarea(attrs={"rows": 4}))
    website = forms.CharField(required=False, label="Leave this empty",
                              widget=forms.TextInput(attrs={"tabindex": "-1", "autocomplete": "off"}))

    def clean_website(self):
        if self.cleaned_data.get("website"):
            raise forms.ValidationError("Spam check failed.")
        return ""


@ratelimit("contact", 5, 3600)
def contact(request):
    form = ContactForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        d = form.cleaned_data
        ps = PlatformSettings.load()
        send_mail("Website contact: %s" % d["name"],
                  "From: %s <%s>\nMobile: %s\n\n%s" % (d["name"], d["email"], d["mobile"], d["message"]),
                  settings.DEFAULT_FROM_EMAIL, [ps.support_email], fail_silently=True)
        messages.success(request, "Thank you! We will get back to you within one working day.")
        return redirect("contact")
    return render(request, "pages/contact.html", {"form": form})


class EarlyAccessForm(forms.ModelForm):
    mobile = MobileField()
    business_category = forms.ChoiceField(label="Type of business", choices=business_category_choices)
    contact_consent = forms.BooleanField(label=CONSENT_LABEL, required=True)
    website = forms.CharField(required=False, label="Leave this empty",
                              widget=forms.TextInput(attrs={"tabindex": "-1", "autocomplete": "off"}))

    class Meta:
        model = EarlyAccess
        fields = ["name", "mobile", "business_name", "business_category", "city", "email"]
        labels = {"name": "Your name", "business_name": "Business name", "email": "Email"}
        widgets = {"business_name": forms.TextInput(attrs={"placeholder": "e.g. Sharma Sweets"})}

    def clean_website(self):
        if self.cleaned_data.get("website"):
            raise forms.ValidationError("Spam check failed.")
        return ""

    def __init__(self, *args, **kw):
        super().__init__(*args, **kw)
        for f in ("business_name", "email"):      # optional in the model for the popup, asked here
            self.fields[f].required = True

    def validate_unique(self):
        pass        # a repeat sign-up is answered in the view ("you're already on the list")


class QuickJoinForm(EarlyAccessForm):
    """The short form in the popup that opens 5 seconds after the page loads."""
    class Meta(EarlyAccessForm.Meta):
        fields = ["name", "mobile", "business_category", "city"]
        labels = {"name": "Your name", "city": "City"}
        widgets = {}

    def __init__(self, *args, **kw):
        forms.ModelForm.__init__(self, *args, prefix="q", **kw)
        self.fields["mobile"].label = "Mobile / WhatsApp number"
        self.fields["contact_consent"].label = "Call or WhatsApp me about my free website"


@ratelimit("early-access", 5, 3600)
def coming_soon(request):
    """Countdown to LAUNCH_AT and the early access forms (page + popup). After launch it sends visitors home."""
    if not before_launch():
        return redirect("home")
    popup = request.method == "POST" and "popup" in request.POST
    form = EarlyAccessForm(request.POST if request.method == "POST" and not popup else None)
    quick = QuickJoinForm(request.POST if popup else None)
    posted = quick if popup else form
    if request.method == "POST" and posted.is_valid():
        _join(request, posted, "popup" if popup else "page")
        return redirect(reverse("coming_soon") + "#join")
    entry = EarlyAccess.objects.filter(pk=request.session.get("early_access")).first()
    taken, left = spots()
    designs = _soon_designs()
    launch = timezone.localtime(settings.LAUNCH_AT).strftime("%d %B").lstrip("0")
    total = settings.EARLY_OFFER_SPOTS
    return render(request, "pages/coming_soon.html", {
        "form": form, "quick": quick, "popup_open": popup, "entry": entry, "taken": taken, "left": left, "total": total,
        "taken_pct": round(100 * taken / total) if total else 100,
        "launch_at": settings.LAUNCH_AT, "designs": designs, "hero_designs": _hero_designs(designs),
        "sites_base": settings.DEMO_BASE_URL.split("://", 1)[-1],
        "share_text": "Free website for local businesses! The first %d businesses get their website free. "
                      "Launching %s. Claim yours: %s" % (total, launch, request.build_absolute_uri(reverse("coming_soon"))),
        "faq": [
            ("Do I need a computer or any technical knowledge?",
             "No. Everything works from your phone. If you can use WhatsApp, you can edit your website."),
            ("What do the first %d businesses get?" % total,
             "Their website free. Our team calls you on launch day to explain everything and set it up with you. "
             "You don't pay anything to join."),
            ("What if all %d free spots are taken?" % total,
             "You stay on our launch list and we contact you on launch day with an early-bird offer."),
            ("Will my website work on mobile phones?",
             "Yes. Every design is made for phones first, because that's where your customers are."),
            ("Why do you check every business?",
             "So customers can trust every website made with Devnixplus. We confirm the business is real before it goes live."),
        ],
    })


def _join(request, form, source):
    """Save a sign-up once per mobile/email. A repeat fills in what the first form didn't ask."""
    d = form.cleaned_data
    match = Q(mobile=d["mobile"])
    if d.get("email"):
        match |= Q(email__iexact=d["email"])
    entry = EarlyAccess.objects.filter(match).first()
    if entry:
        changed = [f for f in ("email", "business_name") if d.get(f) and not getattr(entry, f)]
        for f in changed:
            setattr(entry, f, d[f])
        try:
            if changed:
                entry.save(update_fields=changed)
        except IntegrityError:      # that email belongs to another sign-up
            pass
        request.session["early_access"] = entry.pk
        messages.info(request, "You are already on the list, %s. We will contact you on launch day." % entry.name.split()[0])
        return
    with transaction.atomic():
        entry = form.save(commit=False)
        entry.email = entry.email or None
        entry.source = source
        entry.free_offer = spots()[1] > 0
        entry.save()
    request.session["early_access"] = entry.pk
    _early_access_emails(entry)


def _hero_designs(designs):
    """Three phones for the hero: the middle (front) one is shown last in the markup."""
    by_key = {d["key"]: d for d in designs}
    picks = [by_key[k] for k in ("restaurant", "gym", "salon") if k in by_key]
    return (picks + [d for d in designs if d not in picks])[:3]


def _soon_designs():
    """Business types with a phone screenshot in static/img/soon/<type>.jpg (made from the demo designs),
    plus three photos from that design's sample site for the live preview."""
    folder = settings.BASE_DIR / "static" / "img" / "soon"
    samples = {}
    for t in Template.objects.filter(is_active=True).order_by("pk"):
        samples.setdefault(t.category, t.source_folder)
    out = []
    for key, c in categories().items():
        if not (folder / ("%s.jpg" % key)).exists():
            continue
        src = samples.get(key, "")
        photos = settings.DEMOS_DIR / src / "placeholders" / c["photos"] if src else None
        out.append({"key": key, "title": c["title"], "icon": c["icon"], "img": "img/soon/%s.jpg" % key,
                    "photos": ["%s/%s/placeholders/%s/%d.jpg" % (settings.DEMO_BASE_URL, src, c["photos"], n) for n in (1, 2, 3)
                               if photos and (photos / ("%d.jpg" % n)).exists()]})
    return out


def _early_access_emails(entry):
    launch = timezone.localtime(settings.LAUNCH_AT).strftime("%d %B %Y")
    business = entry.business_name or "your business"
    if entry.free_offer:
        text = ("You are one of the first %d businesses, so your website for %s is free.\n\n"
                "We launch on %s. Our team will call or WhatsApp you on %s to set it up."
                % (settings.EARLY_OFFER_SPOTS, business, launch, entry.mobile))
    else:
        text = ("All %d free websites are taken, but you are on our launch list for %s.\n\n"
                "We launch on %s and will contact you on %s with a launch offer."
                % (settings.EARLY_OFFER_SPOTS, business, launch, entry.mobile))
    try:
        if entry.email:
            send_branded([entry.email], "You're on the list for %s" % business,
                         "Hi %s,\n\n%s" % (entry.name.split()[0], text), heading="You're on the list!")
        send_branded([PlatformSettings.load().support_email],
                     "Early access: %s (%s)" % (entry.business_name or entry.name, entry.city),
                     "%s\nType: %s\nName: %s\nMobile: %s\nEmail: %s\nCity: %s\nFrom: %s\nFree website: %s"
                     % (entry.business_name or "-", entry.business_category, entry.name, entry.mobile,
                        entry.email or "-", entry.city, entry.get_source_display(),
                        "yes" if entry.free_offer else "no (spots full)"))
    except Exception as e:   # the sign-up is saved; email is a bonus
        log.warning("early access email failed: %s", e)
