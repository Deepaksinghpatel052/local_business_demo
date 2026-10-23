from django.contrib import admin

from .models import AuditLog, OutgoingMessage, PlatformSettings


@admin.register(PlatformSettings)
class PlatformSettingsAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return not PlatformSettings.objects.exists()


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ["created_at", "actor", "action", "target_type", "target_label"]
    list_filter = ["action", "target_type"]
    readonly_fields = [f.name for f in AuditLog._meta.fields]


@admin.register(OutgoingMessage)
class OutgoingMessageAdmin(admin.ModelAdmin):
    list_display = ["created_at", "channel", "provider", "to", "status"]
    list_filter = ["channel", "provider", "status"]
