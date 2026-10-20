"""
Local demo logins (never run this on the server):

    python manage.py seed_demo
"""
from django.conf import settings
from django.contrib.auth.models import Group
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError

from accounts.models import User

PASSWORD = "Demo@12345"
TEAM = [
    ("admin@demo.local", "Asha Admin", "Admin"),
    ("sales@demo.local", "Sunil Sales", "Sales"),
    ("verifier@demo.local", "Vidya Verifier", "Verifier"),
]


class Command(BaseCommand):
    help = "Create demo team logins and one demo owner (development only)"

    def handle(self, *args, **opts):
        if not settings.DEBUG:
            raise CommandError("seed_demo only runs with DEBUG=True")
        call_command("setup_roles")
        for email, name, role in TEAM:
            u, _ = User.objects.get_or_create(email=email, defaults={"name": name})
            u.name, u.is_staff, u.onboarded, u.contact_consent = name, True, True, True
            u.is_superuser = role == "Admin"
            u.set_password(PASSWORD)
            u.save()
            u.groups.set([Group.objects.get(name=role)])
        owner, _ = User.objects.get_or_create(email="owner@demo.local", defaults={"name": "Ravi Sharma"})
        owner.name, owner.mobile, owner.whatsapp, owner.city = "Ravi Sharma", "9876543210", "919876543210", "Gwalior"
        owner.business_name, owner.business_category, owner.business_area = "Sharma Sweets", "bakery", "Lashkar"
        owner.contact_consent = owner.onboarded = owner.mobile_verified = True
        owner.set_password(PASSWORD)
        owner.save()
        self.stdout.write(self.style.SUCCESS("Demo logins (password %s):" % PASSWORD))
        for email, _, role in TEAM:
            self.stdout.write("  %-22s %s" % (email, role))
        self.stdout.write("  %-22s %s" % ("owner@demo.local", "Business owner"))
