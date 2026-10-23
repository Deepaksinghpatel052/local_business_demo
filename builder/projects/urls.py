from django.urls import path

from . import views

urlpatterns = [
    path("templates/", views.template_gallery, name="templates"),
    path("start/<slug:slug>/", views.start_with_template, name="start"),
    path("dashboard/", views.dashboard, name="dashboard"),
    path("projects/create/", views.create, name="create_project"),
    path("projects/<int:pk>/delete/", views.delete, name="delete_project"),
    path("projects/<int:pk>/edit/", views.editor, name="editor"),
    path("projects/<int:pk>/frame/", views.editor_frame, name="editor_frame"),
    path("projects/<int:pk>/frame/images/<str:name>", views.frame_image, name="frame_image"),
    path("projects/<int:pk>/save/", views.autosave, name="autosave"),
    path("projects/<int:pk>/images/", views.upload_image, name="upload_image"),
    path("projects/<int:pk>/images/<int:image_id>/delete/", views.delete_image, name="delete_image"),
    path("projects/<int:pk>/preview/", views.open_preview, name="open_preview"),
    path("projects/<int:pk>/go-live/", views.go_live, name="go_live"),
    path("projects/<int:pk>/verify/", views.verify, name="verify"),
    path("projects/<int:pk>/download/", views.request_download, name="request_download"),
    path("d/<str:token>/", views.download_file, name="download_file"),
    path("report/<slug:slug>/", views.report_site, name="report_site"),
]
