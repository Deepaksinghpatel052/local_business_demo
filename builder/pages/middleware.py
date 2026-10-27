from django.shortcuts import redirect

from .launch import before_launch

# Still reachable before launch: the page itself, files, team login + panels, payment webhook, legal pages
OPEN_PREFIXES = ("/coming-soon/", "/static/", "/media/", "/sites/", "/_shared/", "/accounts/", "/manage/",
                 "/django-admin/", "/billing/webhook/", "/terms/", "/privacy/", "/refund-policy/", "/contact/")
CLOSED_PREFIXES = ("/accounts/signup/",)        # new accounts open on launch day


class ComingSoonMiddleware:
    """Before LAUNCH_AT visitors see /coming-soon/; team members (and staff) use the real site."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if before_launch():
            user = getattr(request, "user", None)
            team = user is not None and user.is_authenticated and (user.is_staff or user.is_team)
            path = request.path
            if not team and (path.startswith(CLOSED_PREFIXES) or not path.startswith(OPEN_PREFIXES)):
                return redirect("coming_soon")
        return self.get_response(request)
