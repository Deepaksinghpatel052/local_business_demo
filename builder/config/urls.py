from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path

from accounts import views as account_views
from core import views as core_views
from pages import views as page_views

admin.site.site_header = "Devnixplus (technical admin)"

urlpatterns = [
    path("", page_views.home, name="home"),
    path("accounts/", include("allauth.urls")),
    path("onboarding/", account_views.onboarding, name="onboarding"),
    path("onboarding/resend/", account_views.resend_otp, name="resend_otp"),
    path("account/", account_views.profile, name="profile"),
    path("billing/", include("billing.urls")),
    path("manage/", include("adminpanel.urls")),
    path("django-admin/", admin.site.urls),
    path("", include("projects.urls")),
    path("", include("pages.urls")),
]

if settings.SERVE_FILES:
    urlpatterns += [
        re_path(r"^sites/(?P<path>.*)$", core_views.serve_site),
        re_path(r"^_shared/(?P<path>.*)$", core_views.serve_shared),
        re_path(r"^media/(?P<path>.*)$", core_views.serve_media),
    ]
    if not settings.DEBUG:      # with DEBUG=True runserver already serves /static/
        urlpatterns.append(re_path(r"^static/(?P<path>.*)$", core_views.serve_static))

handler404 = "pages.errors.not_found"
handler500 = "pages.errors.server_error"
