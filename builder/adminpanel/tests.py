from datetime import timedelta

from django.urls import reverse
from django.utils import timezone

from billing import services as billing
from billing.models import Order
from core.models import AuditLog, PlatformSettings
from core.testing import BaseTestCase
from crm.management.commands.send_reminders import renewal_reminders, unpaid_reminders
from crm.models import ReminderLog
from projects import services
from projects.models import Project, VerificationRequest


class TeamPermissionTests(BaseTestCase):
    def setUp(self):
        super().setUp()
        self.owner = self.make_owner()
        self.project = services.create_project(self.owner, self.template, "Glow Salon", "salon")
        order = billing.create_order(self.owner, self.project, Order.HOSTING_NEW)
        billing.mark_paid(order.pk, "pay_1", "s")
        VerificationRequest.objects.create(project=self.project, maps_link="https://maps.app.goo.gl/a")
        self.project.refresh_from_db()

    def test_owners_cannot_open_the_panel(self):
        self.login(self.owner)
        self.assertEqual(self.client.get(reverse("manage")).status_code, 403)

    def test_sales_cannot_approve_verification(self):
        self.login(self.make_team("Sales"))
        self.assertEqual(self.client.get(reverse("manage_leads")).status_code, 200)
        self.assertEqual(self.client.get(reverse("manage_verification")).status_code, 403)
        r = self.client.post(reverse("manage_verification_decide", args=[self.project.pk]), {"decision": "approve"})
        self.assertEqual(r.status_code, 403)
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, Project.PENDING_VERIFICATION)
        self.assertEqual(self.client.post(reverse("manage_project_go_live", args=[self.project.pk])).status_code, 403)
        self.assertEqual(self.client.get(reverse("manage_settings")).status_code, 403)

    def test_verifier_approves_and_goes_live_with_audit(self):
        self.login(self.make_team("Verifier"))
        self.assertEqual(self.client.get(reverse("manage_leads")).status_code, 403)
        self.client.post(reverse("manage_verification_decide", args=[self.project.pk]), {"decision": "approve"})
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, Project.APPROVED)
        self.client.post(reverse("manage_project_go_live", args=[self.project.pk]))
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, Project.LIVE)
        self.assertEqual(self.project.published_mode, "live")
        self.assertIsNotNone(self.project.hosting_expires_at)
        self.assertEqual(set(AuditLog.objects.values_list("action", flat=True)), {"verification_approved", "go_live"})
        # verifiers can't suspend (admin only)
        self.assertEqual(self.client.post(reverse("manage_project_suspend", args=[self.project.pk])).status_code, 403)

    def test_admin_suspend_reactivate_and_restore(self):
        self.login(self.make_team("Admin"))
        self.client.post(reverse("manage_project_suspend", args=[self.project.pk]), {"reason": "Fake"})
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, Project.SUSPENDED)
        self.assertEqual(self.project.published_mode, "unavailable")
        self.client.post(reverse("manage_project_suspend", args=[self.project.pk]), {"action": "reactivate"})
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, Project.PENDING_VERIFICATION)
        first = self.project.versions.last()
        services.save_project_data(self.project, dict(self.project.data, tagline="Changed"), note="edit")
        self.client.post(reverse("manage_project_restore", args=[self.project.pk, first.pk]))
        self.project.refresh_from_db()
        self.assertEqual(self.project.data.get("tagline"), first.data.get("tagline"))

    def test_reject_requires_reason(self):
        self.login(self.make_team("Verifier"))
        self.client.post(reverse("manage_verification_decide", args=[self.project.pk]), {"decision": "reject", "reason": ""})
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, Project.PENDING_VERIFICATION)

    def test_every_panel_page_renders_for_admin(self):
        self.login(self.make_team("Admin"))
        for name in ["manage", "manage_leads", "manage_verification", "manage_projects", "manage_payments",
                     "manage_templates", "manage_abuse", "manage_settings", "manage_audit"]:
            self.assertEqual(self.client.get(reverse(name)).status_code, 200, name)
        self.assertEqual(self.client.get(reverse("manage_project", args=[self.project.pk])).status_code, 200)
        self.assertEqual(self.client.get(reverse("manage_lead", args=[self.owner.pk])).status_code, 200)

    def test_domain_checklist_generates_server_block(self):
        self.login(self.make_team("Admin"))
        self.client.post(reverse("manage_project", args=[self.project.pk]),
                         {"dom-custom_domain": "https://www.GlowSalon.in/", "dom-dns_pointed": "on"})
        self.project.refresh_from_db()
        self.assertEqual(self.project.custom_domain, "glowsalon.in")
        r = self.client.get(reverse("manage_project", args=[self.project.pk]))
        self.assertContains(r, "server_name glowsalon.in www.glowsalon.in;")
        self.assertContains(r, "certbot certonly --webroot")

    def test_leads_show_business_before_any_website(self):
        lead = self.make_owner(email="newlead@test.local", mobile="9000000003")
        lead.business_name, lead.business_category, lead.business_area = "Gupta Hardware", "hardware", "Naya Bazar"
        lead.business_maps_link = "https://maps.app.goo.gl/gupta"
        lead.save()
        self.login(self.make_team("Sales"))
        r = self.client.get(reverse("manage_leads") + "?q=Gupta")
        self.assertContains(r, "Gupta Hardware")
        self.assertContains(r, "no website yet")
        self.assertContains(self.client.get(reverse("manage_leads") + "?category=hardware"), "Gupta Hardware")
        r = self.client.get(reverse("manage_lead", args=[lead.pk]))
        self.assertContains(r, "https://maps.app.goo.gl/gupta")
        self.assertContains(r, "website%20for%20Gupta%20Hardware")  # WhatsApp message names the business
        csv_text = self.client.get(reverse("manage_leads_export")).content.decode("utf-8")
        self.assertIn("Gupta Hardware,Hardware Store,Naya Bazar,https://maps.app.goo.gl/gupta,0", csv_text)

    def test_marketing_export_excludes_people_without_consent(self):
        self.make_owner(email="noconsent@test.local", mobile="9000000002")
        from accounts.models import User
        User.objects.filter(email="noconsent@test.local").update(contact_consent=False)
        User.objects.filter(email=self.owner.email).update(marketing_consent=True)
        self.login(self.make_team("Sales"))
        all_csv = self.client.get(reverse("manage_leads_export")).content.decode("utf-8")
        self.assertIn("noconsent@test.local", all_csv)
        self.assertIn("NO", all_csv)
        mk = self.client.get(reverse("manage_leads_export") + "?marketing=1").content.decode("utf-8")
        self.assertNotIn("noconsent@test.local", mk)
        self.assertIn(self.owner.email, mk)


class ReminderTests(BaseTestCase):
    def test_renewal_reminder_sent_once(self):
        owner = self.make_owner()
        p = services.create_project(owner, self.template, "Glow Salon", "salon")
        Project.objects.filter(pk=p.pk).update(plan="hosted", status="live",
                                               hosting_expires_at=timezone.now() + timedelta(days=6))
        ps = PlatformSettings.load()
        today = timezone.localdate()
        self.assertEqual(renewal_reminders(today, ps), 1)
        self.assertEqual(renewal_reminders(today, ps), 0)
        self.assertTrue(ReminderLog.objects.filter(key__startswith="renewal:7:").exists())

    def test_unpaid_reminder_respects_consent(self):
        owner = self.make_owner()
        p = services.create_project(owner, self.template, "Glow Salon", "salon")
        Project.objects.filter(pk=p.pk).update(created_at=timezone.now() - timedelta(days=3, hours=1))
        ps = PlatformSettings.load()
        today = timezone.localdate()
        owner.contact_consent = False
        owner.save()
        self.assertEqual(unpaid_reminders(today, ps), 0)
        owner.contact_consent = True
        owner.save()
        self.assertEqual(unpaid_reminders(today, ps), 1)
        self.assertTrue(ReminderLog.objects.filter(key="unpaid:3").exists())
