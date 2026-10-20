import hashlib
import hmac
import secrets
import time

from django.conf import settings
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.decorators.http import require_POST

from core import messaging
from core.ratelimit import hit, ratelimit
from crm.models import log_activity

from .forms import OnboardingForm, OtpForm, ProfileForm

OTP_TTL = 10 * 60
OTP_MAX_TRIES = 5


def _otp_hash(code, mobile):
    return hmac.new(settings.SECRET_KEY.encode(), ("%s:%s" % (mobile, code)).encode(), hashlib.sha256).hexdigest()


def _send_otp(request, user):
    """Send a fresh code. Returns the code only when the mock provider wants it shown on screen."""
    if not hit("otp-send:%s" % user.pk, 5, 3600):
        messages.error(request, "Too many codes sent. Please try again in an hour.")
        return None
    code = "%06d" % secrets.randbelow(1000000)
    request.session["otp"] = {"m": user.mobile, "h": _otp_hash(code, user.mobile), "t": time.time(), "n": 0}
    provider = messaging.sms()
    provider.send_otp(user.mobile, code)
    if provider.shows_code_on_screen:
        request.session["otp_demo_code"] = code
    return code


def _after_onboarding(request):
    nxt = request.session.pop("after_onboarding", "") or request.GET.get("next", "")
    if nxt and url_has_allowed_host_and_scheme(nxt, allowed_hosts={request.get_host()}):
        return redirect(nxt)
    return redirect("dashboard")


@login_required
def onboarding(request):
    """One screen after signup / Google login: mobile, city and consent, then the mobile OTP."""
    user = request.user
    changing = request.GET.get("change") == "1"
    if user.onboarded and not changing:
        return _after_onboarding(request)
    needs_details = not (user.mobile and user.contact_consent and user.city and user.business_name and user.business_category)

    if needs_details or changing:
        form = OnboardingForm(request.POST or None, instance=user, initial={"name": user.name})
        if request.method == "POST" and form.is_valid():
            user = form.save(commit=False)
            user.mobile_verified = False
            user.onboarded = False           # a new number must be verified again
            if not user.signup_source:
                user.signup_source = request.session.get("signup_source", "") or "google"
            user.save()
            _send_otp(request, user)
            return redirect("onboarding")
        return render(request, "accounts/onboarding.html", {"form": form, "step": 1})

    otp = request.session.get("otp")
    if not otp or otp.get("m") != user.mobile:
        _send_otp(request, user)
    form = OtpForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        otp = request.session.get("otp") or {}
        expired = time.time() - otp.get("t", 0) > OTP_TTL
        otp["n"] = otp.get("n", 0) + 1
        request.session["otp"] = otp
        if expired or otp["n"] > OTP_MAX_TRIES:
            form.add_error("code", "This code has expired. Tap “Send a new code”.")
        elif hmac.compare_digest(otp.get("h", ""), _otp_hash(form.cleaned_data["code"], user.mobile)):
            user.mobile_verified = True
            user.onboarded = True
            user.save(update_fields=["mobile_verified", "onboarded"])
            request.session.pop("otp", None)
            request.session.pop("otp_demo_code", None)
            log_activity(user, "mobile_verified")
            messages.success(request, "Welcome, %s! Your account is ready." % user.first_name)
            return _after_onboarding(request)
        else:
            form.add_error("code", "That code is not right. Please check and try again.")
    return render(request, "accounts/onboarding.html", {
        "form": form, "step": 2, "demo_code": request.session.get("otp_demo_code"),
    })


@login_required
@require_POST
@ratelimit("otp-resend", 5, 600)
def resend_otp(request):
    if _send_otp(request, request.user):
        messages.info(request, "We sent a new code to +91 %s." % request.user.mobile)
    return redirect("onboarding")


@login_required
def profile(request):
    form = ProfileForm(request.POST or None, instance=request.user,
                       initial={"whatsapp": request.user.whatsapp[-10:] if request.user.whatsapp else ""})
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Your details are saved.")
        return redirect("profile")
    return render(request, "accounts/profile.html", {"form": form})
