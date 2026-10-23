from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ["-date_joined"]
    list_display = ["email", "name", "mobile", "city", "onboarded", "is_staff", "date_joined"]
    list_filter = ["is_staff", "is_superuser", "onboarded", "contact_consent", "groups"]
    search_fields = ["email", "name", "mobile", "city"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Details", {"fields": ("name", "mobile", "mobile_verified", "whatsapp", "city", "signup_source", "onboarded")}),
        ("Consent", {"fields": ("contact_consent", "marketing_consent")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = ((None, {"classes": ("wide",), "fields": ("email", "password1", "password2")}),)
