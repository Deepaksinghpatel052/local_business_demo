from django.contrib import admin

from .models import ActivityLog, LeadNote, ReminderLog


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ["created_at", "user", "project", "event", "detail"]
    list_filter = ["event"]
    search_fields = ["user__email", "user__mobile"]


admin.site.register(LeadNote)
admin.site.register(ReminderLog)
