from django.shortcuts import redirect

# Pages that need a finished profile (mobile + consent + verified mobile).
GUARDED_PREFIXES = ("/dashboard/", "/projects/", "/billing/payments/", "/billing/checkout/", "/account/", "/start/")


class OnboardingMiddleware:
    """Logged-in owners who haven't given their mobile number yet are sent to /onboarding/ first."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = getattr(request, "user", None)
        if (user is not None and user.is_authenticated and not user.onboarded
                and request.path.startswith(GUARDED_PREFIXES) and not user.is_team):
            request.session["after_onboarding"] = request.get_full_path()
            return redirect("onboarding")
        return self.get_response(request)
