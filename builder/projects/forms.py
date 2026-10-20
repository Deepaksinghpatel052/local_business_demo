import re

from django import forms

from core.utils import is_maps_link
from templates_lib.categories import category_choices
from templates_lib.models import Template

from .images import ImageRejected, process_upload
from .models import VerificationRequest


class CreateProjectForm(forms.Form):
    business_name = forms.CharField(label="Business name", max_length=80, widget=forms.TextInput(attrs={
        "placeholder": "e.g. Sharma Sweets", "autocomplete": "organization"}))
    category = forms.ChoiceField(label="Category", choices=())
    template = forms.CharField(widget=forms.HiddenInput, required=False)

    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)
        self.fields["category"].choices = category_choices()

    def clean_business_name(self):
        name = re.sub(r"\s+", " ", self.cleaned_data["business_name"]).strip()
        name = re.sub(r"[<>]", "", name)
        if len(name) < 2:
            raise forms.ValidationError("Please enter your business name.")
        return name

    def clean(self):
        d = super().clean()
        slug = d.get("template") or ""
        tpl = Template.objects.filter(slug=slug, is_active=True).first() if slug else None
        if tpl is None:
            tpl = (Template.objects.filter(category=d.get("category"), is_active=True).first()
                   or Template.objects.filter(category="general", is_active=True).first())
        d["template_obj"] = tpl
        return d


class VerificationForm(forms.ModelForm):
    class Meta:
        model = VerificationRequest
        fields = ["maps_link", "shop_photo", "visiting_card", "gst_or_udyam", "owner_notes"]
        labels = {
            "maps_link": "Your Google Maps listing link",
            "shop_photo": "Photo of your shop or signboard (optional)",
            "visiting_card": "Visiting card (optional)",
            "gst_or_udyam": "GST or Udyam number (optional)",
            "owner_notes": "Anything we should know? (optional)",
        }
        help_texts = {"maps_link": "Open your business on Google Maps, tap Share, Copy link, and paste it here."}
        widgets = {"owner_notes": forms.Textarea(attrs={"rows": 3}),
                   "maps_link": forms.URLInput(attrs={"placeholder": "https://maps.app.goo.gl/…"})}

    def clean_maps_link(self):
        url = self.cleaned_data["maps_link"].strip()
        if not is_maps_link(url):
            raise forms.ValidationError("Please paste a Google Maps link (maps.app.goo.gl or google.com/maps).")
        return url

    def clean_gst_or_udyam(self):
        v = re.sub(r"\s", "", self.cleaned_data.get("gst_or_udyam", "")).upper()
        if v and not (re.match(r"^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$", v) or re.match(r"^UDYAM-[A-Z]{2}-\d{2}-\d{7}$", v)):
            raise forms.ValidationError("Enter a valid GSTIN (15 characters) or Udyam number (UDYAM-XX-00-0000000).")
        return v

    def _image(self, name):
        f = self.cleaned_data.get(name)
        if not f or not hasattr(f, "content_type"):
            return f
        try:
            content, _, _ = process_upload(f)
        except ImageRejected as e:
            raise forms.ValidationError(str(e))
        return content

    def clean_shop_photo(self):
        return self._image("shop_photo")

    def clean_visiting_card(self):
        return self._image("visiting_card")


class AbuseReportForm(forms.Form):
    email = forms.EmailField(label="Your email")
    reason = forms.CharField(label="What is wrong with this website?", max_length=2000,
                             widget=forms.Textarea(attrs={"rows": 4}))
    website = forms.CharField(required=False, widget=forms.TextInput(attrs={"tabindex": "-1", "autocomplete": "off"}),
                              label="Leave this empty")

    def clean_website(self):
        if self.cleaned_data.get("website"):
            raise forms.ValidationError("Spam check failed.")
        return ""
