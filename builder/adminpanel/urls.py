from django.urls import path

from . import views

urlpatterns = [
    path("", views.overview, name="manage"),
    path("leads/", views.leads, name="manage_leads"),
    path("leads/export.csv", views.leads_export, name="manage_leads_export"),
    path("leads/<int:pk>/", views.lead_detail, name="manage_lead"),
    path("notes/<int:pk>/done/", views.note_done, name="manage_note_done"),
    path("verification/", views.verification_queue, name="manage_verification"),
    path("verification/<int:pk>/decide/", views.verification_decide, name="manage_verification_decide"),
    path("verification/file/<int:pk>/<str:field>/", views.verification_file, name="manage_verification_file"),
    path("projects/", views.projects, name="manage_projects"),
    path("projects/<int:pk>/", views.project_detail, name="manage_project"),
    path("projects/<int:pk>/go-live/", views.project_go_live, name="manage_project_go_live"),
    path("projects/<int:pk>/suspend/", views.project_suspend, name="manage_project_suspend"),
    path("projects/<int:pk>/republish/", views.project_republish, name="manage_project_republish"),
    path("projects/<int:pk>/restore/<int:version_id>/", views.project_restore, name="manage_project_restore"),
    path("payments/", views.payments, name="manage_payments"),
    path("payments/<int:pk>/refund/", views.payment_refund, name="manage_payment_refund"),
    path("templates/", views.templates, name="manage_templates"),
    path("abuse/", views.abuse, name="manage_abuse"),
    path("settings/", views.settings_view, name="manage_settings"),
    path("audit/", views.audit_log, name="manage_audit"),
]
