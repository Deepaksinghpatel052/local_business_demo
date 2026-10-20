from django.contrib import admin

from .models import AbuseReport, Download, Project, ProjectImage, ProjectVersion, VerificationRequest


class ImageInline(admin.TabularInline):
    model = ProjectImage
    extra = 0
    readonly_fields = ["kind", "file", "width", "height", "size"]


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["business_name", "slug", "owner", "category", "status", "plan", "hosting_expires_at", "flagged"]
    list_filter = ["status", "plan", "flagged", "category"]
    search_fields = ["business_name", "slug", "owner__email", "owner__mobile"]
    inlines = [ImageInline]


admin.site.register(ProjectVersion)
admin.site.register(VerificationRequest)
admin.site.register(Download)
admin.site.register(AbuseReport)
