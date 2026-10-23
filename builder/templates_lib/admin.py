from django.contrib import admin

from .models import Template


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "category", "city_label", "is_active", "sort_order"]
    list_editable = ["is_active", "sort_order"]
    list_filter = ["is_active", "category"]
    search_fields = ["name", "slug", "sample_name"]
