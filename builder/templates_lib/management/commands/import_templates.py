"""
Create/update a Template for every demos/sample-*/data.js.

    python manage.py import_templates
    python manage.py import_templates --if-empty     only when no design exists yet (server start)
"""
import shutil

from django.conf import settings
from django.core.management.base import BaseCommand

from templates_lib.categories import categories, category
from templates_lib.jsdata import JSDataError, parse_data_js
from templates_lib.models import Template


class Command(BaseCommand):
    help = "Import demos/sample-*/data.js as starting templates"

    def add_arguments(self, parser):
        parser.add_argument("--if-empty", action="store_true",
                            help="do nothing when designs already exist (keeps the team's on/off and order)")

    def handle(self, *args, **opts):
        if opts["if_empty"] and Template.objects.exists():
            self.stdout.write("Templates: already imported, skipped (--if-empty)")
            return
        order = list(categories())
        thumbs_src = settings.REPO_DIR / "showcase" / "thumbs"
        thumbs_dst = settings.MEDIA_ROOT / "templates"
        thumbs_dst.mkdir(parents=True, exist_ok=True)
        created = updated = 0
        for folder in sorted(settings.DEMOS_DIR.glob("sample-*")):
            data_file = folder / "data.js"
            if not data_file.exists():
                continue
            try:
                data = parse_data_js(data_file.read_text(encoding="utf-8"))
            except JSDataError as e:
                self.stderr.write("  ! %s: %s" % (folder.name, e))
                continue
            key = data.get("category") or "general"
            cat = category(key)
            slug = folder.name[len("sample-"):]
            thumb = ""
            src = thumbs_src / ("%s.jpg" % folder.name)
            if src.exists():
                shutil.copy2(src, thumbs_dst / src.name)
                thumb = "templates/%s" % src.name
            city = data.get("city") or _guess_city(data.get("address", ""))
            # a second design for a category gets its folder suffix in the name:
            # sample-salon -> "Salon design", sample-salon-luxe -> "Salon design (Luxe)"
            suffix = slug[len(key) + 1:] if slug.startswith(key + "-") else ("" if slug == key else slug)
            name = "%s design" % cat["title"] + (" (%s)" % suffix.replace("-", " ").title() if suffix else "")
            obj, is_new = Template.objects.update_or_create(slug=slug, defaults={
                "name": name,
                "category": key,
                "city_label": city,
                "sample_name": data.get("name", ""),
                "tagline": (data.get("tagline") or "")[:255],
                "thumbnail": thumb,
                "source_folder": folder.name,
                "default_data": data,
                "sort_order": order.index(key) if key in order else 100,
            })
            created += is_new
            updated += not is_new
            self.stdout.write("  %s %s" % ("+" if is_new else "~", obj.slug))
        self.stdout.write(self.style.SUCCESS("Templates: %d created, %d updated" % (created, updated)))


def _guess_city(address):
    """Same rule as guessCity() in main.js."""
    import re
    parts = [p.strip() for p in str(address).split(",") if p.strip()]
    if not parts:
        return ""
    last = parts[-1]
    if (re.search(r"\d{6}", last) or re.match(r"^[A-Z]{2}\b", last)) and len(parts) > 1:
        return parts[-2]
    return re.sub(r"\s*\d{6}\s*$", "", last)
