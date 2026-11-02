import csv

from django.contrib import admin
from django.http import HttpResponse

from .models import ActivityLog, EarlyAccess, LeadNote, ReminderLog


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ["created_at", "user", "project", "event", "detail"]
    list_filter = ["event"]
    search_fields = ["user__email", "user__mobile"]


admin.site.register(LeadNote)
admin.site.register(ReminderLog)


@admin.register(EarlyAccess)
class EarlyAccessAdmin(admin.ModelAdmin):
    list_display = ["created_at", "business_name", "business_category", "city", "name", "mobile", "email",
                    "source", "free_offer", "contacted"]
    list_filter = ["free_offer", "contacted", "source", "business_category"]
    list_editable = ["contacted"]
    search_fields = ["business_name", "name", "email", "mobile", "city"]
    actions = ["export_csv"]

    @admin.action(description="Download selected as CSV")
    def export_csv(self, request, queryset):
        fields = ["created_at", "business_name", "business_category", "city", "name", "mobile", "email", "source", "free_offer"]
        resp = HttpResponse(content_type="text/csv")
        resp["Content-Disposition"] = 'attachment; filename="early-access.csv"'
        w = csv.writer(resp)
        w.writerow(fields)
        for e in queryset:
            w.writerow([getattr(e, f) for f in fields])
        return resp
