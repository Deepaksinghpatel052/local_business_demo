import io
import json
import os
import re
import zipfile
from datetime import timedelta
from unittest import mock

from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from PIL import Image

from billing.models import Order
from billing.services import create_order, mark_paid
from core.models import PlatformSettings
from core.testing import SAMPLE_DATA, BaseTestCase
from projects import publish, services, workflow
from projects.management.commands.expire_hosting import expire_due
from projects.management.commands.expire_previews import unpublish_stale
from projects.models import Download, Project, ProjectVersion, VerificationRequest
from projects.schema import clean_data


def png_upload(name="photo.png", size=(2400, 1200), color="red"):
    buf = io.BytesIO()
    Image.new("RGB", size, color).save(buf, "PNG")
    return SimpleUploadedFile(name, buf.getvalue(), content_type="image/png")


class SlugTests(BaseTestCase):
    def test_slugify_like_new_demo(self):
        self.assertEqual(services.slugify_name("Sharma Sweets & Co."), "sharma-sweets-and-co")
        self.assertEqual(services.slugify_name("  ***  "), "business")
        self.assertEqual(len(services.slugify_name("x" * 120)), 50)

    def test_unique_and_numbered(self):
        owner = self.make_owner()
        a = services.create_project(owner, self.template, "Glow Salon", "salon")
        b = services.create_project(owner, self.template, "Glow Salon", "salon")
        self.assertEqual(a.slug, "glow-salon")
        self.assertEqual(b.slug, "glow-salon-2")

    def test_reserved_slugs_are_never_used(self):
        for name in ["app", "www", "api", "admin", "static", "media", "manage"]:
            self.assertNotEqual(services.unique_slug(name), name)
            self.assertFalse(services.is_slug_available(name))
        self.assertFalse(services.is_slug_available("_shared"))

    def test_existing_demo_folders_are_reserved(self):
        existing = [p.name for p in settings.DEMOS_DIR.iterdir() if p.is_dir()]
        self.assertIn("seasons-salon", existing)
        self.assertEqual(services.unique_slug("Seasons Salon"), "seasons-salon-2")
        self.assertFalse(services.is_slug_available("sample-salon"))


class SchemaTests(BaseTestCase):
    def test_valid_sample(self):
        data, errors = clean_data(dict(SAMPLE_DATA))
        self.assertEqual(errors, [])
        self.assertEqual(data["name"], "Glow Salon")

    def test_unknown_keys_rejected(self):
        _, errors = clean_data(dict(SAMPLE_DATA, hacker="x"))
        self.assertTrue(any(e["field"] == "data" or "Unknown" in e["message"] for e in errors))
        _, errors = clean_data(dict(SAMPLE_DATA, services=[{"title": "x", "onclick": "y"}]))
        self.assertTrue(errors)

    def test_script_injection_stripped_in_every_text_field(self):
        evil = '<script>alert(1)</script><img src=x onerror=alert(2)>Bad</b>'
        raw = json.loads(json.dumps(SAMPLE_DATA))
        for key in ["name", "tagline", "about", "address", "owner", "city", "mapQuery"]:
            raw[key] = evil
        raw["services"] = [{"title": evil, "desc": evil, "price": evil}]
        raw["highlights"] = [evil]
        raw["faqs"] = [{"q": evil, "a": evil}]
        raw["testimonials"] = [{"name": evil, "text": evil, "rating": 5}]
        raw["menuCategories"] = [{"name": evil, "items": [{"title": evil, "desc": evil, "price": "1", "tag": "x"}]}]
        raw["doctor"] = {"name": evil, "about": evil, "specialities": [evil]}
        raw["seo"] = {"title": "<b>t</b>", "description": evil}
        data, errors = clean_data(raw)
        self.assertEqual(errors, [])
        blob = json.dumps(data)
        self.assertNotIn("<script", blob.lower())
        self.assertNotIn("<img", blob.lower())
        self.assertNotIn("onerror=", blob.lower())
        self.assertNotIn("<", blob)

    def test_tricky_nested_tag(self):
        data, _ = clean_data(dict(SAMPLE_DATA, name="<scr<script>ipt>alert(1)</script>Shop"))
        self.assertNotIn("<scr", data["name"].lower())

    def test_urls_must_be_http(self):
        for bad in ["javascript:alert(1)", "data:text/html,hi", "ftp://x.com", "//evil.com"]:
            _, errors = clean_data(dict(SAMPLE_DATA, social={"instagram": bad}))
            self.assertTrue(errors, bad)
        _, errors = clean_data(dict(SAMPLE_DATA, heroImage="javascript:alert(1)"))
        self.assertTrue(errors)
        _, errors = clean_data(dict(SAMPLE_DATA, heroImage="http://insecure.com/x.jpg"))
        self.assertTrue(errors)
        data, errors = clean_data(dict(SAMPLE_DATA, heroImage="images/abc.jpg", social={"instagram": "https://instagram.com/x"}))
        self.assertEqual(errors, [])

    def test_phone_and_colour_validation(self):
        _, errors = clean_data(dict(SAMPLE_DATA, phone="abc"))
        self.assertTrue(errors)
        _, errors = clean_data(dict(SAMPLE_DATA, theme={"primary": "red;background:url(x)"}))
        self.assertTrue(errors)
        _, errors = clean_data(dict(SAMPLE_DATA, theme={"primary": "#A3154A", "headingFont": "Comic Sans"}))
        self.assertTrue(errors)
        _, errors = clean_data(dict(SAMPLE_DATA, theme={"primary": "#A3154A", "headingFont": "Poppins"}))
        self.assertEqual(errors, [])

    def test_rating_needs_google_link(self):
        _, errors = clean_data(dict(SAMPLE_DATA, googleUrl=""))
        self.assertEqual(errors[0]["field"], "googleUrl")
        _, errors = clean_data(dict(SAMPLE_DATA, googleUrl="", rating=0))
        self.assertEqual(errors, [])

    def test_every_imported_sample_starts_valid(self):
        from django.core.management import call_command
        call_command("import_templates", verbosity=0)
        from templates_lib.models import Template
        self.assertGreaterEqual(Template.objects.count(), 23)
        for t in Template.objects.all():
            _, errors = clean_data(services.starting_data(t, "Test Biz", t.category))
            self.assertEqual(errors, [], t.slug)


class PublishTests(BaseTestCase):
    def setUp(self):
        super().setUp()
        self.owner = self.make_owner()
        self.project = services.create_project(self.owner, self.template, "Glow Salon", "salon")

    def test_data_js_escapes_script_breakout(self):
        data = {"name": "</script><script>alert(1)</script>", "about": "<!-- x", "tagline": "a b c"}
        text = publish.data_js_text(data)
        self.assertNotIn("</script>", text)
        self.assertNotIn("<!--", text)
        self.assertNotIn(" ", text)
        self.assertNotIn(" ", text)
        body = text.split("window.BUSINESS = ", 1)[1].rstrip().rstrip(";")
        self.assertEqual(json.loads(body), data)          # still exactly the same data

    def test_business_name_with_script_does_not_break_index(self):
        self.project.data = dict(self.project.data, name="</script><script>alert(1)</script>")
        self.project.save()
        page = publish.render_index(publish.site_data(self.project), mode="editor", page_url="https://x.test/",
                                    asset_base="/_shared/v1/", inline_data=True)
        self.assertEqual(page.lower().count("<script>alert(1)"), 0)
        self.assertIn("&lt;/script&gt;", page)        # escaped inside <title>
        live = publish.render_index(publish.site_data(self.project), mode="live", page_url="https://x.test/",
                                    asset_base="/_shared/v1/")
        self.assertNotIn("<script>alert(1)", live)

    def test_preview_and_live_modes(self):
        publish.publish_project(self.project, "preview")
        folder = settings.SITES_ROOT / self.project.slug
        html = (folder / "index.html").read_text(encoding="utf-8")
        self.assertIn('content="noindex, nofollow"', html)
        self.assertIn('"demoMode": true', html)
        self.assertIn('"mode": "preview"', html)
        self.assertIn("/_shared/v1/js/main.js", html)
        self.assertIn('application/ld+json', html)
        self.assertTrue((folder / "data.js").exists())
        self.assertFalse((folder / "js").exists())          # shared assets are not copied per site
        publish.publish_project(self.project, "live")
        html = (folder / "index.html").read_text(encoding="utf-8")
        self.assertNotIn("noindex", html)
        self.assertIn('"demoMode": false', html)
        self.assertIn("/report/%s/" % self.project.slug, html)
        self.assertTrue((settings.SITES_ROOT / "_shared" / "v1" / "js" / "main.js").exists())

    def test_seo_rendered_server_side(self):
        self.project.data = dict(SAMPLE_DATA)
        self.project.save()
        html = publish.render_index(publish.site_data(self.project), mode="live",
                                    page_url="https://demo.example.com/glow-salon/", asset_base="/_shared/v1/")
        self.assertIn("<title>Glow Salon | Salon in Indore</title>", html)
        self.assertIn('property="og:title"', html)
        ld = json.loads(re.search(r'<script type="application/ld\+json" id="ld-business">(.*?)</script>', html).group(1))
        self.assertEqual(ld["@type"], "BeautySalon")
        self.assertEqual(ld["aggregateRating"]["ratingValue"], 4.8)
        days = [s["dayOfWeek"] for s in ld["openingHoursSpecification"]]
        self.assertIn("Wednesday", days)
        self.assertEqual(days.count("Thursday"), 2)        # split shift
        self.assertNotIn("Tuesday", days)                    # closed

    def test_atomic_publish_leaves_no_partial_folder(self):
        publish.publish_project(self.project, "preview")
        folder = settings.SITES_ROOT / self.project.slug
        before = (folder / "index.html").read_text(encoding="utf-8")
        with mock.patch("projects.publish.data_js_text", side_effect=RuntimeError("disk full")):
            with self.assertRaises(RuntimeError):
                publish.publish_project(self.project, "live")
        self.assertEqual((folder / "index.html").read_text(encoding="utf-8"), before)   # old site still served
        leftovers = [p.name for p in settings.SITES_ROOT.iterdir() if p.name.startswith((".tmp-", ".old-"))]
        self.assertEqual(leftovers, [])

    def test_swap_replaces_whole_folder(self):
        publish.publish_project(self.project, "preview")
        folder = settings.SITES_ROOT / self.project.slug
        (folder / "stale.txt").write_text("old")
        publish.publish_project(self.project, "preview")
        self.assertFalse((folder / "stale.txt").exists())

    def test_unavailable_and_unpublish(self):
        publish.publish_project(self.project, "unavailable")
        folder = settings.SITES_ROOT / self.project.slug
        self.assertIn("temporarily unavailable", (folder / "index.html").read_text(encoding="utf-8"))
        self.assertFalse((folder / "data.js").exists())
        self.project.refresh_from_db()
        self.assertTrue(self.project.data["name"])          # data kept
        publish.publish_project(self.project, "unpublish")
        self.assertFalse(folder.exists())


class ProjectFlowTests(BaseTestCase):
    def setUp(self):
        super().setUp()
        self.owner = self.make_owner()
        self.login(self.owner)

    def test_create_clears_sample_personal_data(self):
        with self.captureOnCommitCallbacks(execute=True):      # the first publish runs after the commit
            self.client.post(reverse("create_project"), {"business_name": "My Salon", "category": "salon", "template": "salon"})
        p = Project.objects.get(owner=self.owner)
        self.assertEqual(p.data["name"], "My Salon")
        self.assertEqual(p.data["phone"], "")
        self.assertEqual(p.data["rating"], 0)
        self.assertEqual(p.data["testimonials"], [])
        self.assertEqual(p.data["services"][0]["title"], "Haircut")   # sample content kept
        self.assertEqual(p.status, Project.DRAFT)
        self.assertTrue((settings.SITES_ROOT / p.slug / "index.html").exists())

    def test_project_limit_per_user(self):
        ps = PlatformSettings.load()
        ps.max_projects_per_user = 2
        ps.save()
        for i in range(3):
            self.client.post(reverse("create_project"), {"business_name": "Shop %d" % i, "category": "salon"})
        self.assertEqual(Project.objects.filter(owner=self.owner).count(), 2)
        with self.assertRaises(services.LimitReached):
            services.create_project(self.owner, self.template, "Shop X", "salon")

    def test_autosave_validates_versions_and_publishes(self):
        p = services.create_project(self.owner, self.template, "Glow Salon", "salon")
        url = reverse("autosave", args=[p.pk])
        d = dict(p.data, phone="+91 98765 43210", address="1 MG Road, Indore")
        r = self.client.post(url, json.dumps({"data": d, "step": "basics", "complete": True}), content_type="application/json")
        self.assertEqual(r.status_code, 200)
        p.refresh_from_db()
        self.assertEqual(p.status, Project.PREVIEW)
        self.assertIn("basics", p.steps_done)
        self.assertIn("+91 98765 43210", (settings.SITES_ROOT / p.slug / "data.js").read_text(encoding="utf-8"))
        r = self.client.post(url, json.dumps({"data": dict(d, email="not-an-email")}), content_type="application/json")
        self.assertEqual(r.status_code, 422)
        self.assertEqual(r.json()["errors"][0]["field"], "email")

    def test_versions_keep_last_30(self):
        p = services.create_project(self.owner, self.template, "Glow Salon", "salon")
        for i in range(40):
            services.save_project_data(p, dict(p.data, tagline="v%d" % i), user=self.owner, note="n%d" % i)
        self.assertEqual(ProjectVersion.objects.filter(project=p).count(), 30)
        self.assertEqual(p.versions.first().data["tagline"], "v39")

    def test_autosaves_within_two_minutes_share_one_version(self):
        p = services.create_project(self.owner, self.template, "Glow Salon", "salon")
        before = p.versions.count()
        services.save_project_data(p, dict(p.data, tagline="a"), user=self.owner)
        services.save_project_data(p, dict(p.data, tagline="b"), user=self.owner)
        self.assertEqual(p.versions.count(), before + 1)
        self.assertEqual(p.versions.first().data["tagline"], "b")

    def test_upload_resizes_and_compresses(self):
        p = services.create_project(self.owner, self.template, "Glow Salon", "salon")
        r = self.client.post(reverse("upload_image", args=[p.pk]), {"file": png_upload(), "kind": "hero"})
        self.assertEqual(r.status_code, 200, r.content)
        img = r.json()["image"]
        self.assertEqual(max(img["w"], img["h"]), 1600)
        self.assertTrue(img["path"].startswith("images/") and img["path"].endswith(".jpg"))

    def test_upload_rejects_non_images(self):
        p = services.create_project(self.owner, self.template, "Glow Salon", "salon")
        fake = SimpleUploadedFile("x.png", b"<?php echo 1; ?>", content_type="image/png")
        r = self.client.post(reverse("upload_image", args=[p.pk]), {"file": fake})
        self.assertEqual(r.status_code, 400)
        gif = io.BytesIO()
        Image.new("RGB", (10, 10)).save(gif, "GIF")
        r = self.client.post(reverse("upload_image", args=[p.pk]), {"file": SimpleUploadedFile("a.gif", gif.getvalue())})
        self.assertEqual(r.status_code, 400)

    def test_user_cannot_see_or_edit_another_users_project(self):
        other = self.make_owner(email="other@test.local", mobile="9123456780")
        theirs = services.create_project(other, self.template, "Their Shop", "salon")
        for name in ["editor", "editor_frame", "open_preview", "go_live", "verify"]:
            self.assertEqual(self.client.get(reverse(name, args=[theirs.pk])).status_code, 404, name)
        r = self.client.post(reverse("autosave", args=[theirs.pk]), json.dumps({"data": theirs.data}),
                             content_type="application/json")
        self.assertEqual(r.status_code, 404)
        self.assertEqual(self.client.post(reverse("upload_image", args=[theirs.pk]), {"file": png_upload()}).status_code, 404)
        self.assertEqual(self.client.post(reverse("request_download", args=[theirs.pk])).status_code, 404)
        self.assertEqual(self.client.post(reverse("delete_project", args=[theirs.pk])).status_code, 404)
        with self.assertRaises(Exception):
            create_order(self.owner, theirs, Order.HOSTING_NEW)
        self.assertEqual(self.client.post(reverse("checkout", args=[theirs.pk, "hosting_new"]),
                                          {"accept_terms": "on"}).status_code, 404)

    def test_sensitive_words_flag_but_do_not_block(self):
        p = services.create_project(self.owner, self.template, "SBI Loan Point", "salon")
        self.assertTrue(p.flagged)
        self.assertIn("loan", p.flag_reason)
        self.assertIn("sbi", p.flag_reason)


class DownloadTests(BaseTestCase):
    def setUp(self):
        super().setUp()
        self.owner = self.make_owner()
        self.login(self.owner)
        self.project = services.create_project(self.owner, self.template, "Glow Salon", "salon")
        services.save_project_data(self.project, dict(self.project.data, phone="+91 98765 43210", address="1 MG Road, Indore"))

    def pay_download(self):
        order = create_order(self.owner, self.project, Order.DOWNLOAD)
        mark_paid(order.pk, "pay_demo_1", "demo")
        self.project.refresh_from_db()
        return order

    def approve(self):
        VerificationRequest.objects.create(project=self.project, maps_link="https://maps.app.goo.gl/a")
        workflow.approve(self.project, self.make_team("Verifier"))
        self.project.refresh_from_db()

    def test_download_needs_payment_and_approval(self):
        self.assertFalse(self.project.can_download)
        self.assertEqual(self.client.post(reverse("request_download", args=[self.project.pk])).status_code, 302)
        self.assertEqual(Download.objects.count(), 0)
        self.pay_download()
        self.assertEqual(self.project.status, Project.PENDING_VERIFICATION)
        self.assertFalse(self.project.can_download)            # paid but not approved
        self.approve()
        self.assertEqual(self.project.status, Project.DOWNLOAD_READY)
        self.assertTrue(self.project.can_download)

    def test_zip_is_self_contained_and_redownload_is_free(self):
        self.pay_download()
        self.approve()
        for i in range(3):
            r = self.client.post(reverse("request_download", args=[self.project.pk]))
            self.assertEqual(r.status_code, 302)
            z = self.client.get(r["Location"])
            self.assertEqual(z.status_code, 200)
            self.assertEqual(z["Content-Type"], "application/zip")
        self.assertEqual(Download.objects.filter(project=self.project).count(), 3)
        self.assertEqual(Order.objects.filter(project=self.project, type="download").count(), 1)  # no new charge
        zf = zipfile.ZipFile(io.BytesIO(z.content))
        names = set(zf.namelist())
        for n in ["index.html", "data.js", "css/style.css", "js/main.js", "js/themes.js", "README.txt", "LICENSE.txt"]:
            self.assertIn(n, names)
        self.assertTrue(any(n.startswith("placeholders/beauty/") for n in names))
        html = zf.read("index.html").decode()
        self.assertNotIn("_shared", html)
        self.assertNotIn("noindex", html)
        self.assertIn('href="css/style.css"', html)
        self.assertIn('"demoMode": false', html)
        self.assertIn("Devnixplus", zf.read("data.js").decode())

    def test_latest_data_in_every_zip(self):
        self.pay_download()
        self.approve()
        services.save_project_data(self.project, dict(self.project.data, tagline="Fresh tagline 123"))
        r = self.client.post(reverse("request_download", args=[self.project.pk]))
        z = zipfile.ZipFile(io.BytesIO(self.client.get(r["Location"]).content))
        self.assertIn("Fresh tagline 123", z.read("data.js").decode())

    def test_signed_link_expires(self):
        self.pay_download()
        self.approve()
        r = self.client.post(reverse("request_download", args=[self.project.pk]))
        url = r["Location"]
        later = timezone.now().timestamp() + 11 * 60
        with mock.patch("django.core.signing.time.time", return_value=later):
            self.assertEqual(self.client.get(url).status_code, 410)
        self.assertEqual(self.client.get(url[:-3] + "xx/").status_code, 410)


class ExpiryTests(BaseTestCase):
    def setUp(self):
        super().setUp()
        self.owner = self.make_owner()
        self.project = services.create_project(self.owner, self.template, "Glow Salon", "salon")
        self.project.plan = Project.PLAN_HOSTED
        self.project.status = Project.LIVE
        self.project.save()

    def test_grace_period_then_expired(self):
        ps = PlatformSettings.load()
        now = timezone.now()
        self.project.hosting_expires_at = now - timedelta(days=ps.grace_period_days - 1)
        self.project.save()
        self.assertEqual(expire_due(now), [])
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, Project.LIVE)
        self.project.hosting_expires_at = now - timedelta(days=ps.grace_period_days + 1)
        self.project.save()
        self.assertEqual(len(expire_due(now)), 1)
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, Project.EXPIRED)
        html = (settings.SITES_ROOT / self.project.slug / "index.html").read_text(encoding="utf-8")
        self.assertIn("temporarily unavailable", html)

    def test_renewal_after_expiry_republishes(self):
        self.project.status = Project.EXPIRED
        self.project.hosting_expires_at = timezone.now() - timedelta(days=20)
        self.project.save()
        order = create_order(self.owner, self.project, Order.HOSTING_RENEWAL)
        mark_paid(order.pk, "pay_x", "demo")
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, Project.LIVE)
        self.assertEqual(self.project.published_mode, "live")

    def test_stale_previews_unpublished(self):
        p = services.create_project(self.owner, self.template, "Old Draft", "salon")
        publish.publish_project(p, "preview")
        Project.objects.filter(pk=p.pk).update(last_edited_at=timezone.now() - timedelta(days=90),
                                               created_at=timezone.now() - timedelta(days=90))
        done = unpublish_stale()
        self.assertEqual([x.pk for x in done], [p.pk])
        self.assertFalse((settings.SITES_ROOT / p.slug).exists())
        p.refresh_from_db()
        self.assertEqual(p.published_mode, "")
        self.assertTrue(p.data["name"])


class HeroStyleTests(BaseTestCase):
    def test_hero_style_is_optional_and_checked(self):
        for v in ["", "full", "split", "center"]:
            _, errors = clean_data(dict(SAMPLE_DATA, heroStyle=v))
            self.assertEqual(errors, [], v)
        _, errors = clean_data(dict(SAMPLE_DATA, heroStyle="sideways"))
        self.assertTrue(errors)

    def test_second_design_for_a_category_gets_its_own_template(self):
        from django.core.management import call_command
        from templates_lib.models import Template
        call_command("import_templates", verbosity=0)
        a, b = Template.objects.get(slug="pet-shop"), Template.objects.get(slug="pet-shop-studio")
        self.assertEqual((a.category, b.category), ("pet-shop", "pet-shop"))
        self.assertEqual(a.name, "Pet Shop design")
        self.assertEqual(b.name, "Pet Shop design (Studio)")
        self.assertEqual(b.default_data["heroStyle"], "full")


class ReferralLinkTests(BaseTestCase):
    def test_service_link_must_be_https(self):
        ok = dict(SAMPLE_DATA, services=[{"title": "Term plan", "link": "https://example.com/ref?id=42", "linkLabel": "Get a quote"}],
                  disclaimer="Mutual fund investments are subject to market risks.")
        _, errors = clean_data(ok)
        self.assertEqual(errors, [])
        for bad in ["http://example.com/ref", "javascript:alert(1)", "data:text/html,x", "//evil.com"]:
            _, errors = clean_data(dict(SAMPLE_DATA, services=[{"title": "x", "link": bad}]))
            self.assertTrue(errors, bad)
            self.assertIn("https://", errors[0]["message"])

    def test_insurance_sample_starts_valid_with_links(self):
        from django.core.management import call_command
        from templates_lib.models import Template
        call_command("import_templates", verbosity=0)
        t = Template.objects.get(slug="insurance")
        data, errors = clean_data(services.starting_data(t, "My Advisory", "insurance"))
        self.assertEqual(errors, [])
        self.assertTrue(data["services"][0]["link"].startswith("https://"))
