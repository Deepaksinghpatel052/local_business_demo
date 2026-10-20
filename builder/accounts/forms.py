import re

from django import forms

from core.utils import is_maps_link, normalize_mobile
from templates_lib.categories import category_choices

from .models import User

CONSENT_LABEL = "Contact me by call, WhatsApp or email about my website and account (required)"
MARKETING_LABEL = "Send me offers and website tips (optional)"


class MobileField(forms.CharField):
    def __init__(self, **kw):
        kw.setdefault("max_length", 16)
        kw.setdefault("label", "Mobile number")
        kw.setdefault("widget", forms.TextInput(attrs={
            "inputmode": "numeric", "autocomplete": "tel-national", "placeholder": "98765 43210"}))
        super().__init__(**kw)

    def clean(self, value):
        value = super().clean(value)
        if not value and not self.required:
            return ""
        mobile = normalize_mobile(value)
        if not mobile:
            raise forms.ValidationError("Enter a valid 10-digit Indian mobile number.")
        return mobile


def business_category_choices():
    return [("", "Choose your business type")] + category_choices()


class BusinessFieldsMixin(forms.Form):
    """About the business: asked up front so the team can follow up even before a website exists."""
    business_name = forms.CharField(label="Business name", max_length=80, widget=forms.TextInput(attrs={
        "placeholder": "e.g. Sharma Sweets", "autocomplete": "organization"}))
    business_category = forms.ChoiceField(label="Type of business", choices=business_category_choices)
    business_area = forms.CharField(label="Area / locality", max_length=120, required=False, widget=forms.TextInput(
        attrs={"placeholder": "e.g. Lashkar, near Jayendraganj"}))
    business_maps_link = forms.URLField(label="Google Maps link of your business", max_length=500, required=False,
                                        assume_scheme="https", help_text="Optional. On Google Maps: Share → Copy link.",
                                        widget=forms.URLInput(attrs={"placeholder": "https://maps.app.goo.gl/…"}))

    def clean_business_name(self):
        name = re.sub(r"\s+", " ", re.sub(r"[<>]", "", self.cleaned_data["business_name"])).strip()
        if len(name) < 2:
            raise forms.ValidationError("Please enter your business name.")
        return name

    def clean_business_maps_link(self):
        url = self.cleaned_data.get("business_maps_link", "").strip()
        if url and not is_maps_link(url):
            raise forms.ValidationError("Please paste a Google Maps link (maps.app.goo.gl or google.com/maps).")
        return url


class ContactFieldsMixin(BusinessFieldsMixin):
    name = forms.CharField(label="Your name", max_length=120)
    mobile = MobileField()
    city = forms.CharField(max_length=80)
    contact_consent = forms.BooleanField(label=CONSENT_LABEL, required=True)
    marketing_consent = forms.BooleanField(label=MARKETING_LABEL, required=False)


class SignupExtraForm(ContactFieldsMixin):
    """Extra fields on the allauth email signup form."""
    field_order = ["name", "email", "mobile", "business_name", "business_category", "city", "business_area",
                   "business_maps_link", "password1", "contact_consent", "marketing_consent"]

    def signup(self, request, user):
        d = self.cleaned_data
        user.name = d["name"].strip()
        user.mobile = d["mobile"]
        user.whatsapp = "91" + d["mobile"]
        user.city = d["city"].strip()
        user.business_name = d["business_name"]
        user.business_category = d["business_category"]
        user.business_area = d.get("business_area", "").strip()
        user.business_maps_link = d.get("business_maps_link", "")
        user.contact_consent = True
        user.marketing_consent = d.get("marketing_consent", False)
        user.signup_source = request.session.get("signup_source", "") or "email"
        user.save()


class OnboardingForm(ContactFieldsMixin, forms.ModelForm):
    whatsapp = MobileField(label="WhatsApp number", required=False,
                           help_text="Leave empty if it is the same as your mobile.")

    class Meta:
        model = User
        fields = ["name", "mobile", "whatsapp", "business_name", "business_category", "city", "business_area",
                  "business_maps_link", "contact_consent", "marketing_consent"]

    def save(self, commit=True):
        user = super().save(commit=False)
        wa = self.cleaned_data.get("whatsapp")
        user.whatsapp = "91" + (wa or user.mobile)
        if commit:
            user.save()
        return user


class OtpForm(forms.Form):
    code = forms.CharField(label="6-digit code", max_length=6, min_length=6, widget=forms.TextInput(attrs={
        "inputmode": "numeric", "autocomplete": "one-time-code", "pattern": "[0-9]{6}"}))


class ProfileForm(BusinessFieldsMixin, forms.ModelForm):
    whatsapp = forms.CharField(label="WhatsApp number", max_length=16, required=False)

    class Meta:
        model = User
        fields = ["name", "whatsapp", "city", "business_name", "business_category", "business_area",
                  "business_maps_link", "marketing_consent"]
        labels = {"marketing_consent": MARKETING_LABEL}

    def clean_whatsapp(self):
        v = self.cleaned_data.get("whatsapp")
        if not v:
            return "91" + self.instance.mobile if self.instance.mobile else ""
        m = normalize_mobile(v)
        if not m:
            raise forms.ValidationError("Enter a valid 10-digit Indian mobile number.")
        return "91" + m
