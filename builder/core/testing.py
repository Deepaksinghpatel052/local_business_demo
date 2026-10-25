"""Shared test helpers: every test writes sites and media into its own temp folders."""
import shutil
import tempfile
from pathlib import Path

from django.contrib.auth.models import Group
from django.core.cache import cache
from django.test import TestCase, override_settings

from accounts.models import User
from templates_lib.models import Template

SAMPLE_DATA = {
    "name": "Glow Salon", "category": "salon", "tagline": "Hair and beauty", "about": "We cut hair.",
    "phone": "+91 98765 43210", "address": "1 MG Road, Indore, MP 452001",
    "hours": {"mon": "10:00-20:00", "tue": "closed", "wed": "24h", "thu": "10:00-14:00, 17:00-21:00",
              "fri": "", "sat": "", "sun": ""},
    "services": [{"title": "Haircut", "desc": "Any style", "price": "₹300", "icon": "bi-scissors"}],
    "highlights": ["AC", "Card & UPI"], "testimonials": [], "faqs": [], "gallery": [],
    "social": {"instagram": "", "facebook": "", "youtube": ""}, "languages": ["en", "hi"], "theme": {},
    "sections": [], "rating": 4.8, "reviewCount": 120, "googleUrl": "https://maps.app.goo.gl/x",
}


class BaseTestCase(TestCase):
    @classmethod
    def setUpClass(cls):
        cls._tmp = Path(tempfile.mkdtemp(prefix="lbd-test-"))
        cls._override = override_settings(
            SITES_ROOT=cls._tmp / "sites", MEDIA_ROOT=cls._tmp / "media", DEMO_PAYMENTS=True,
            DEMO_URL_STYLE="path", DEMO_BASE_URL="https://demo.example.com",
            EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
            RAZORPAY_KEY_SECRET="test_secret", RAZORPAY_WEBHOOK_SECRET="whsec_test",
            PHONE_OTP_REQUIRED=True, ACCOUNT_EMAIL_VERIFICATION="optional", SMS_PROVIDER="mock",
        )
        cls._override.enable()
        super().setUpClass()

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        cls._override.disable()
        shutil.rmtree(cls._tmp, ignore_errors=True)

    def setUp(self):
        cache.clear()
        self.template = Template.objects.create(slug="salon", name="Salon design", category="salon",
                                                source_folder="sample-salon", default_data=dict(SAMPLE_DATA))

    def make_owner(self, email="owner@test.local", mobile="9876543210"):
        return User.objects.create_user(email=email, password="pw-Secret-123", name="Owner Name", mobile=mobile,
                                        city="Indore", contact_consent=True, onboarded=True, mobile_verified=True)

    def make_team(self, role, email=None):
        u = User.objects.create_user(email=email or "%s@team.local" % role.lower(), password="pw-Secret-123",
                                     name=role, is_staff=True, onboarded=True)
        u.groups.add(Group.objects.get_or_create(name=role)[0])
        return u

    def login(self, user):
        self.client.force_login(user)
