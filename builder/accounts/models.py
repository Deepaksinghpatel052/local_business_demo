from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone

ROLE_ADMIN, ROLE_SALES, ROLE_VERIFIER = "Admin", "Sales", "Verifier"
TEAM_ROLES = (ROLE_ADMIN, ROLE_SALES, ROLE_VERIFIER)


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create(self, email, password, **extra):
        if not email:
            raise ValueError("Email is required")
        user = self.model(email=self.normalize_email(email).lower(), **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra):
        extra.setdefault("is_staff", False)
        extra.setdefault("is_superuser", False)
        return self._create(email, password, **extra)

    def create_superuser(self, email, password=None, **extra):
        extra.update(is_staff=True, is_superuser=True, onboarded=True, contact_consent=True)
        return self._create(email, password, **extra)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=120, blank=True)
    mobile = models.CharField(max_length=10, blank=True, db_index=True, help_text="10-digit Indian mobile")
    mobile_verified = models.BooleanField(default=False)
    whatsapp = models.CharField(max_length=15, blank=True, help_text="Defaults to the mobile number")
    city = models.CharField(max_length=80, blank=True)
    # The business, asked at signup so the sales team can follow up before any website exists
    business_name = models.CharField(max_length=80, blank=True)
    business_category = models.CharField(max_length=40, blank=True, help_text="A category key from themes.js")
    business_area = models.CharField("Area / locality", max_length=120, blank=True)
    business_maps_link = models.URLField("Google Maps listing", max_length=500, blank=True)
    contact_consent = models.BooleanField(
        "Service updates", default=False,
        help_text="Agreed to be contacted by call/WhatsApp/email about their website and account.")
    marketing_consent = models.BooleanField("Offers and tips", default=False)
    signup_source = models.CharField(max_length=80, blank=True)
    onboarded = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()
    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        ordering = ["-date_joined"]

    def __str__(self):
        return self.name or self.email

    def save(self, *args, **kwargs):
        if self.mobile and not self.whatsapp:
            self.whatsapp = "91" + self.mobile
        super().save(*args, **kwargs)

    @property
    def business_category_title(self):
        from templates_lib.categories import categories
        cat = categories().get(self.business_category)
        return cat["title"] if cat else ""

    @property
    def first_name(self):
        return (self.name or self.email.split("@")[0]).split()[0]

    # --- team roles (Django groups "Admin", "Sales", "Verifier") ---------
    def has_role(self, *roles):
        if not self.is_authenticated or not self.is_active:
            return False
        if self.is_superuser:
            return True
        names = getattr(self, "_role_cache", None)
        if names is None:
            names = set(self.groups.values_list("name", flat=True))
            self._role_cache = names
        return bool(names.intersection(roles))

    @property
    def is_team(self):
        return self.has_role(*TEAM_ROLES)

    @property
    def roles(self):
        if self.is_superuser:
            return [ROLE_ADMIN]
        return [r for r in TEAM_ROLES if self.has_role(r)]
