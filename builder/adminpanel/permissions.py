import functools

from django.contrib.auth.views import redirect_to_login
from django.core.exceptions import PermissionDenied

from accounts.models import ROLE_ADMIN, ROLE_SALES, ROLE_VERIFIER

ANY_TEAM = (ROLE_ADMIN, ROLE_SALES, ROLE_VERIFIER)

# what each role may do (checked on the server for every action)
CAN = {
    "view_overview": ANY_TEAM,
    "view_leads": (ROLE_ADMIN, ROLE_SALES),
    "edit_leads": (ROLE_ADMIN, ROLE_SALES),
    "export_leads": (ROLE_ADMIN, ROLE_SALES),
    "view_verification": (ROLE_ADMIN, ROLE_VERIFIER),
    "decide_verification": (ROLE_ADMIN, ROLE_VERIFIER),
    "view_projects": ANY_TEAM,
    "go_live": (ROLE_ADMIN, ROLE_VERIFIER),
    "suspend": (ROLE_ADMIN,),
    "restore_version": (ROLE_ADMIN,),
    "edit_domain": (ROLE_ADMIN, ROLE_VERIFIER),
    "view_payments": (ROLE_ADMIN, ROLE_SALES),
    "refund": (ROLE_ADMIN,),
    "manage_templates": (ROLE_ADMIN,),
    "view_abuse": (ROLE_ADMIN, ROLE_VERIFIER),
    "edit_settings": (ROLE_ADMIN,),
    "view_audit": (ROLE_ADMIN,),
}


def can(user, action):
    return user.is_authenticated and user.has_role(*CAN[action])


def team_required(action):
    def deco(view):
        @functools.wraps(view)
        def wrapped(request, *a, **kw):
            if not request.user.is_authenticated:
                return redirect_to_login(request.get_full_path())
            if not can(request.user, action):
                raise PermissionDenied
            return view(request, *a, **kw)
        return wrapped
    return deco


class Perms:
    """{{ perms_ui.go_live }} in templates."""
    def __init__(self, user):
        self.user = user

    def __getattr__(self, action):
        if action in CAN:
            return can(self.user, action)
        raise AttributeError(action)
