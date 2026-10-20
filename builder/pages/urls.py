from django.urls import path

from . import views

urlpatterns = [
    path("pricing/", views.page("pricing"), name="pricing"),
    path("how-it-works/", views.page("how_it_works"), name="how_it_works"),
    path("faq/", views.page("faq"), name="faq"),
    path("terms/", views.page("terms"), name="terms"),
    path("privacy/", views.page("privacy"), name="privacy"),
    path("refund-policy/", views.page("refund"), name="refund_policy"),
    path("contact/", views.contact, name="contact"),
]
