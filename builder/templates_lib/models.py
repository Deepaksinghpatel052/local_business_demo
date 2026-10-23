from django.conf import settings
from django.db import models

from core.utils import site_url

from .categories import category


class Template(models.Model):
    """A design owners can start from. Imported from demos/sample-*/ by `manage.py import_templates`."""

    slug = models.SlugField(unique=True)                       # "salon" (from demos/sample-salon)
    name = models.CharField(max_length=120)                    # "Salon design"
    category = models.CharField(max_length=40, db_index=True)
    city_label = models.CharField(max_length=80, blank=True)
    sample_name = models.CharField(max_length=160, blank=True)  # business name in the sample
    tagline = models.CharField(max_length=255, blank=True)
    thumbnail = models.ImageField(upload_to="templates/", blank=True)
    source_folder = models.CharField(max_length=120, help_text="Folder in demos/, e.g. sample-salon")
    default_data = models.JSONField(help_text="Exactly the data.js shape (window.BUSINESS)")
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=100)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name

    @property
    def category_info(self):
        return category(self.category)

    @property
    def live_sample_url(self):
        return site_url(self.source_folder)

    @property
    def images_dir(self):
        return settings.DEMOS_DIR / self.source_folder / "images"
