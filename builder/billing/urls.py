from django.urls import path

from . import views

urlpatterns = [
    path("checkout/<int:pk>/<str:order_type>/", views.checkout, name="checkout"),
    path("pay/<int:order_id>/", views.pay, name="pay"),
    path("callback/", views.callback, name="payment_callback"),
    path("failed/<int:order_id>/", views.failed, name="payment_failed"),
    path("simulate/<int:order_id>/", views.simulate, name="payment_simulate"),
    path("webhook/", views.webhook, name="razorpay_webhook"),
    path("payments/", views.payments, name="payments"),
    path("invoices/<int:pk>/", views.invoice, name="invoice_pdf"),
]
