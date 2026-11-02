from datetime import timedelta

from django.core import mail
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone

from accounts.models import User
from core.testing import BaseTestCase
from crm.models import EarlyAccess

SOON = timezone.now() + timedelta(days=10)


def join(client, n, **extra):
    return client.post(reverse("coming_soon"), dict({
        "name": "Owner %d" % n, "business_name": "Shop %d" % n, "business_category": "bakery", "city": "Gwalior",
        "mobile": "98765%05d" % n, "email": "o%d@test.local" % n, "contact_consent": "on"}, **extra))


@override_settings(LAUNCH_AT=SOON, EARLY_OFFER_SPOTS=2)
class ComingSoonTests(BaseTestCase):
    def test_public_pages_go_to_coming_soon(self):
        for url in ["/", reverse("pricing"), reverse("templates"), reverse("account_signup"), reverse("dashboard")]:
            self.assertRedirects(self.client.get(url), reverse("coming_soon"), fetch_redirect_response=False, msg_prefix=url)
        for url in [reverse("privacy"), reverse("terms"), reverse("account_login")]:   # legal pages + team login stay open
            self.assertEqual(self.client.get(url).status_code, 200, url)
        r = self.client.get(reverse("coming_soon"))
        self.assertContains(r, "2 of 2 free spots left")
        self.assertContains(r, 'data-launch="%s' % timezone.localtime(SOON).isoformat()[:19])

    def test_team_sees_the_real_site(self):
        self.client.force_login(self.make_team("Admin"))
        self.assertEqual(self.client.get("/").status_code, 200)

    def test_owners_are_redirected_too(self):
        self.client.force_login(self.make_owner())
        self.assertRedirects(self.client.get("/"), reverse("coming_soon"), fetch_redirect_response=False)

    def test_counter_is_the_real_number_of_signups(self):
        join(self.client, 1)
        self.assertEqual(len(mail.outbox), 2)                           # owner confirmation + team alert
        self.assertIn("is free", mail.outbox[0].body)
        self.assertContains(self.client.get(reverse("coming_soon")), "website for <strong>Shop 1</strong> is <strong>free</strong>")
        self.client.session.flush()
        join(self.client, 1)                                            # repeat: not counted twice
        self.assertEqual(EarlyAccess.objects.count(), 1)
        self.client.session.flush()
        join(self.client, 2)
        self.client.session.flush()
        join(self.client, 3)                                            # spots full: still saved, no free offer
        self.assertEqual(list(EarlyAccess.objects.values_list("free_offer", flat=True)), [True, True, False])
        self.client.session.flush()
        self.assertContains(self.client.get(reverse("coming_soon")), "All 2 free spots are taken")

    def test_spam_and_bad_mobile_rejected(self):
        join(self.client, 4, website="http://spam.example")
        join(self.client, 5, mobile="12345")
        self.assertFalse(EarlyAccess.objects.exists())

    def test_popup_opens_after_5_seconds(self):
        r = self.client.get(reverse("coming_soon"))
        self.assertContains(r, 'id="join-popup"')
        self.assertContains(r, 'data-open="5000"')

    def test_popup_short_form(self):
        r = self.client.post(reverse("coming_soon"), {"popup": "1", "q-name": "Ravi Kumar", "q-mobile": "98765 11111",
                                                      "q-business_category": "bakery", "q-city": "Indore",
                                                      "q-contact_consent": "on"})
        self.assertRedirects(r, reverse("coming_soon") + "#join", fetch_redirect_response=False)
        e = EarlyAccess.objects.get()
        self.assertEqual((e.source, e.email, e.business_name, e.free_offer), ("popup", None, "", True))
        self.assertEqual(len(mail.outbox), 1)                           # team alert only: no email to confirm to
        r = self.client.get(reverse("coming_soon"))
        self.assertContains(r, "Your website is <strong>free</strong>")
        self.assertNotContains(r, 'id="join-popup"')                    # signed up: no popup
        join(self.client, 99, mobile="9876511111")                      # page form later fills in the rest
        e.refresh_from_db()
        self.assertEqual((e.business_name, e.email), ("Shop 99", "o99@test.local"))
        self.assertEqual(EarlyAccess.objects.count(), 1)

    def test_popup_errors_reopen_popup(self):
        r = self.client.post(reverse("coming_soon"), {"popup": "1", "q-name": "Ravi", "q-mobile": "123",
                                                      "q-business_category": "bakery", "q-city": "Indore"})
        self.assertContains(r, 'data-open="now"')
        self.assertFalse(EarlyAccess.objects.exists())

    def test_no_new_accounts_before_launch(self):
        self.client.post(reverse("account_signup"), {"email": "new@test.local", "password1": "Zx!93kdLqp"})
        self.assertFalse(User.objects.filter(email="new@test.local").exists())


class AfterLaunchTests(BaseTestCase):
    @override_settings(LAUNCH_AT=timezone.now() - timedelta(minutes=1))
    def test_after_launch_real_home_page(self):
        self.assertEqual(self.client.get("/").status_code, 200)
        self.assertRedirects(self.client.get(reverse("coming_soon")), reverse("home"), fetch_redirect_response=False)

    def test_empty_launch_setting_means_launched(self):
        self.assertEqual(self.client.get("/").status_code, 200)
