import re

from django.core import mail
from django.test import override_settings
from django.urls import reverse

from accounts.models import User
from core.testing import BaseTestCase
from core.utils import normalize_mobile, site_url


class SignupTests(BaseTestCase):
    def test_email_signup_then_otp_onboarding(self):
        r = self.client.post(reverse("account_signup"), {
            "name": "Ravi", "email": "ravi@test.local", "mobile": "+91 98765-43210", "city": "Gwalior",
            "business_name": "Ravi Sweets", "business_category": "bakery", "business_area": "Lashkar",
            "business_maps_link": "https://maps.app.goo.gl/abc", "password1": "Zx!93kdLqp", "contact_consent": "on"})
        self.assertEqual(r.status_code, 302)
        u = User.objects.get(email="ravi@test.local")
        self.assertEqual(u.mobile, "9876543210")
        self.assertEqual(u.whatsapp, "919876543210")
        self.assertTrue(u.contact_consent)
        self.assertEqual((u.business_name, u.business_category, u.business_area), ("Ravi Sweets", "bakery", "Lashkar"))
        self.assertEqual(u.business_maps_link, "https://maps.app.goo.gl/abc")
        self.assertFalse(u.onboarded)
        self.assertRedirects(self.client.get(reverse("dashboard")), reverse("onboarding"))
        page = self.client.get(reverse("onboarding")).content.decode()
        code = re.search(r"your code is <strong[^>]*>(\d{6})", page).group(1)
        self.client.post(reverse("onboarding"), {"code": "000000" if code != "000000" else "111111"})
        u.refresh_from_db()
        self.assertFalse(u.onboarded)
        self.client.post(reverse("onboarding"), {"code": code})
        u.refresh_from_db()
        self.assertTrue(u.onboarded and u.mobile_verified)
        self.assertEqual(self.client.get(reverse("dashboard")).status_code, 200)

    def test_contact_consent_required(self):
        self.client.post(reverse("account_signup"), {
            "name": "Ravi", "email": "r2@test.local", "mobile": "9876543210", "city": "Gwalior", "password1": "Zx!93kdLqp",
            "business_name": "Ravi Sweets", "business_category": "bakery"})
        self.assertFalse(User.objects.filter(email="r2@test.local").exists())

    def test_business_details_required_and_maps_link_checked(self):
        base = {"name": "Ravi", "email": "r3@test.local", "mobile": "9876543210", "city": "Gwalior",
                "password1": "Zx!93kdLqp", "contact_consent": "on"}
        r = self.client.post(reverse("account_signup"), base)                       # no business info
        self.assertFalse(User.objects.filter(email="r3@test.local").exists())
        self.assertContains(r, "Business name")
        r = self.client.post(reverse("account_signup"), dict(base, business_name="Ravi Sweets", business_category="bakery",
                                                             business_maps_link="https://evil.example.com/x"))
        self.assertContains(r, "Google Maps link")
        self.assertFalse(User.objects.filter(email="r3@test.local").exists())
        self.client.post(reverse("account_signup"), dict(base, business_name="Ravi Sweets", business_category="bakery"))
        self.assertTrue(User.objects.filter(email="r3@test.local", business_name="Ravi Sweets").exists())

    def test_create_popup_prefilled_from_signup(self):
        u = self.make_owner()
        u.business_name, u.business_category = "Ravi Sweets", "bakery"
        u.save()
        self.client.force_login(u)
        r = self.client.get(reverse("dashboard"))
        self.assertContains(r, 'value="Ravi Sweets"')
        self.assertContains(r, '<option value="bakery" selected>')

    def test_social_user_must_finish_onboarding(self):
        u = User.objects.create_user(email="g@test.local", name="G User")      # as after Google login
        self.client.force_login(u)
        self.assertRedirects(self.client.get(reverse("dashboard")), reverse("onboarding"))
        biz = {"business_name": "G Garage", "business_category": "garage"}
        r = self.client.post(reverse("onboarding"), dict(biz, name="G User", mobile="12345", city="Indore",
                                                         contact_consent="on"))
        self.assertContains(r, "valid 10-digit")
        r = self.client.post(reverse("onboarding"), {"name": "G User", "mobile": "9123456789", "city": "Indore",
                                                     "contact_consent": "on"})
        self.assertContains(r, "This field is required")                # business details are required too
        self.client.post(reverse("onboarding"), dict(biz, name="G User", mobile="9123456789", city="Indore",
                                                     contact_consent="on"))
        u.refresh_from_db()
        self.assertEqual((u.mobile, u.business_name, u.business_category), ("9123456789", "G Garage", "garage"))

    def test_google_name_goes_into_name_field(self):
        from allauth.socialaccount.models import SocialAccount, SocialLogin
        from accounts.adapter import SocialAccountAdapter
        login = SocialLogin(user=User(), account=SocialAccount(provider="google", uid="1"))
        u = SocialAccountAdapter().populate_user(None, login, {
            "email": "asha@gmail.com", "first_name": "Asha", "last_name": "Verma", "name": "Asha Verma"})
        self.assertEqual((u.email, u.name, u.first_name), ("asha@gmail.com", "Asha Verma", "Asha"))
        u = SocialAccountAdapter().populate_user(None, SocialLogin(user=User(), account=login.account),
                                                 {"email": "x@gmail.com", "first_name": "Ravi", "last_name": "Jain"})
        self.assertEqual(u.name, "Ravi Jain")

    @override_settings(PHONE_OTP_REQUIRED=False)
    def test_phone_otp_off_skips_the_code(self):
        u = User.objects.create_user(email="g2@test.local", name="G User")
        self.client.force_login(u)
        r = self.client.get(reverse("onboarding"))
        self.assertNotContains(r, "Verify mobile")
        self.client.post(reverse("onboarding"), {"name": "G User", "mobile": "9123456789", "city": "Indore",
                                                 "business_name": "G Garage", "business_category": "garage",
                                                 "contact_consent": "on"})
        u.refresh_from_db()
        self.assertTrue(u.onboarded)
        self.assertFalse(u.mobile_verified)
        self.assertEqual(self.client.get(reverse("dashboard")).status_code, 200)

    @override_settings(ACCOUNT_EMAIL_VERIFICATION="mandatory", PHONE_OTP_REQUIRED=False)
    def test_mandatory_email_confirmation(self):
        self.client.post(reverse("account_signup"), {
            "name": "Ravi", "email": "r5@test.local", "mobile": "9876543210", "city": "Gwalior",
            "business_name": "Ravi Sweets", "business_category": "bakery", "password1": "Zx!93kdLqp",
            "contact_consent": "on"})
        self.assertNotEqual(self.client.get(reverse("dashboard")).status_code, 200)    # not logged in yet
        self.assertEqual(len(mail.outbox), 1)
        msg = mail.outbox[0]
        self.assertIn("confirm your email", msg.subject)
        self.assertIn("Confirm my email", msg.alternatives[0][0])                         # branded HTML part
        login = {"login": "r5@test.local", "password": "Zx!93kdLqp"}
        r = self.client.post(reverse("account_login"), login)
        self.assertIn("confirm-email", r["Location"])                                    # blocked until confirmed
        link = re.search(r"https?://\S+/accounts/confirm-email/\S+/", msg.body).group(0)
        self.client.post(link.split("testserver", 1)[-1])
        r = self.client.post(reverse("account_login"), login)
        self.assertNotIn("confirm-email", r["Location"])
        r = self.client.get(reverse("dashboard"), follow=True)                             # via /onboarding/, no code
        self.assertEqual(r.redirect_chain[-1][0], reverse("dashboard"))
        self.assertTrue(User.objects.get(email="r5@test.local").onboarded)

    @override_settings(ACCOUNT_EMAIL_VERIFICATION="mandatory")
    def test_team_login_needs_no_email_confirmation(self):
        self.make_team("Admin", email="boss@team.local")
        r = self.client.post(reverse("account_login"), {"login": "boss@team.local", "password": "pw-Secret-123"})
        self.assertEqual(r.status_code, 302)
        self.assertNotIn("confirm-email", r["Location"])
        self.assertEqual(len(mail.outbox), 0)

    def test_use_this_design_sends_new_visitors_to_signup(self):
        r = self.client.get(reverse("start", args=["salon"]))
        self.assertIn(reverse("account_signup"), r["Location"])
        self.assertEqual(self.client.session["signup_source"], "design:salon")
        self.assertEqual(self.client.session["signup_category"], "salon")
        self.client.force_login(self.make_owner())
        r = self.client.get(reverse("start", args=["salon"]))
        self.assertEqual(r["Location"], reverse("dashboard") + "?template=salon")


class UtilTests(BaseTestCase):
    def test_mobile_normalisation(self):
        self.assertEqual(normalize_mobile("+91 98765 43210"), "9876543210")
        self.assertEqual(normalize_mobile("09876543210"), "9876543210")
        self.assertEqual(normalize_mobile("5876543210"), "")
        self.assertEqual(normalize_mobile("98765"), "")

    def test_url_styles(self):
        with self.settings(DEMO_URL_STYLE="path", DEMO_BASE_URL="https://demo.devnixplus.com"):
            self.assertEqual(site_url("glow"), "https://demo.devnixplus.com/glow/")
        with self.settings(DEMO_URL_STYLE="subdomain", DEMO_DOMAIN="demo.devnixplus.com", DEMO_SCHEME="https"):
            self.assertEqual(site_url("glow"), "https://glow.demo.devnixplus.com/")

    def test_public_pages(self):
        for name in ["home", "templates", "pricing", "how_it_works", "faq", "terms", "privacy", "refund_policy", "contact"]:
            self.assertEqual(self.client.get(reverse(name)).status_code, 200, name)
        self.assertContains(self.client.get(reverse("pricing")), "₹1,999")


    def test_legal_pages_public_and_in_footer(self):
        r = self.client.get(reverse("privacy"))
        self.assertContains(r, "Sign in with Google")                   # needed for the Google consent screen
        self.assertContains(r, "Limited Use")
        home = self.client.get(reverse("home"))
        self.assertContains(home, 'href="%s"' % reverse("privacy"))
        self.assertContains(home, 'href="%s"' % reverse("terms"))
        self.client.force_login(self.make_team("Admin", email="legal@team.local"))
        for name in ["privacy", "terms", "refund_policy", "contact"]:   # no notes, company email shown
            r = self.client.get(reverse(name))
            self.assertNotContains(r, "legal-note", msg_prefix=name)
            self.assertContains(r, "info@devnixplus.com", msg_prefix=name)

class DesignCountTests(BaseTestCase):
    def test_design_count_follows_the_templates(self):
        from templates_lib.models import Template
        self.assertContains(self.client.get(reverse("pricing")), "<li>1 designs made")       # setUp creates one
        Template.objects.create(slug="salon-luxe", name="Salon design (Luxe)", category="salon",
                                source_folder="sample-salon-luxe", default_data={"name": "x", "category": "salon"})
        Template.objects.create(slug="gym", name="Gym design", category="gym",
                                source_folder="sample-gym", default_data={"name": "x", "category": "gym"})
        r = self.client.get(reverse("home"))
        self.assertContains(r, "3 designs for 2 types of business")
        self.assertContains(self.client.get(reverse("templates")), "3 designs</span>")
        Template.objects.filter(slug="gym").update(is_active=False)                     # switched off in /manage/templates/
        self.assertContains(self.client.get(reverse("home")), "2 designs for 1 types of business")


class PasswordChangeTests(BaseTestCase):
    def test_errors_and_success_are_shown(self):
        self.client.force_login(self.make_owner())
        url = reverse("account_change_password")
        r = self.client.post(url, {"oldpassword": "wrong", "password1": "Abc!12345xyz", "password2": "Different!999"})
        self.assertContains(r, "Password not changed")
        self.assertContains(r, "Please type your current password.")
        self.assertContains(r, "You must type the same password each time.")
        self.assertContains(r, "is-invalid")
        r = self.client.post(url, {"oldpassword": "pw-Secret-123", "password1": "Abc!12345xyz", "password2": "Abc!12345xyz"}, follow=True)
        self.assertContains(r, "alert-success")
        self.assertContains(r, "Password successfully changed.")

    def test_reset_from_email_link_shows_errors_and_success(self):
        self.make_owner()
        r = self.client.post(reverse("account_reset_password"), {"email": "owner@test.local"}, follow=True)
        self.assertContains(r, "Check your email")
        link = re.search(r"http://\S+/accounts/password/reset/key/\S+/", mail.outbox[-1].body).group(0)
        r = self.client.get(link, follow=True)
        url = r.redirect_chain[-1][0] if r.redirect_chain else link
        r = self.client.post(url, {"password1": "Abc!12345xyz", "password2": "Different!999"})
        self.assertContains(r, "Password not changed")
        self.assertContains(r, "You must type the same password each time.")
        r = self.client.post(url, {"password1": "Abc!12345xyz", "password2": "Abc!12345xyz"}, follow=True)
        self.assertContains(r, "Password changed")
        self.assertContains(r, "alert-success")
        self.assertContains(self.client.get(link, follow=True), "This reset link doesn")   # used once: link is dead
