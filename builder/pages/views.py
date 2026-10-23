from django import forms
from django.conf import settings
from django.contrib import messages
from django.core.mail import send_mail
from django.shortcuts import redirect, render

from core.models import PlatformSettings
from core.ratelimit import ratelimit
from templates_lib.models import Template


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
