# Prompt for Claude Code: Devnixplus Self-Service Website Builder (Django)

Copy everything below this line into Claude Code, from inside the existing **local-business-demos** project folder.

---

You are a senior Django architect and full-stack developer. Extend my existing **local business demo system** into a **self-service website builder**: a small business owner signs up, picks a design, creates a website for their business in about 5 minutes, previews it, and then either hosts it with us (one-time fee + yearly renewal) or downloads it for their own server (small one-time fee).

Business goals, in order:
1. **Collect as many business registrations (leads) as possible.** Even owners who never pay are valuable leads for my sales team to call.
2. **Make creating a site feel effortless:** a 5-minute flow, mostly prefilled, usable on a phone.
3. **Never publish a fake or harmful business.** Nothing goes live or gets downloaded without a manual check by my team.

## 0. First, inspect what already exists

Before writing any code, read the current project and give me a short summary of:
- The template system: `template/`, `js/main.js`, `js/themes.js`, the `data.js` format (`window.BUSINESS = {...}`), `DEMO_MODE`, the theme system (`theme`, `theme: "auto"`), `tools/theme-preview.html`
- All existing demos in `demos/` (business demos and the `sample-*` category samples) and the root `index.html` gallery that lists them
- `new_demo.py`, `deploy/nginx-wildcard.conf`, and how demos are currently served: **by path** (e.g. `demo.devnixplus.com/<slug>/`) or **by subdomain** (e.g. `<slug>.demo.devnixplus.com`). The new platform must use the same URL style; make it a setting (`DEMO_URL_STYLE = "path" | "subdomain"`).

**Reuse the existing renderer exactly as it is** (`template/` + `data.js`). Do not rewrite the templates in Django templates. The platform's job is to manage data, users, payments and publishing; the existing JavaScript keeps rendering the sites.

## 1. Tech stack (strict)

- Python 3.11+, Django 5.x
- Database: SQLite in development, **PostgreSQL in production** (payments and user data live here)
- Frontend: Django templates, HTML5, CSS3, **Bootstrap 5**, JavaScript, **jQuery** (no React/Vue/Tailwind)
- Packages: `django-allauth` (email + Google login), `django-environ`, `razorpay`, `Pillow`, `jsonschema`, `xhtml2pdf` (invoices), `requests`
- No Celery. Background jobs run as Django management commands from cron.
- All secrets in `.env`; provide `.env.example`.

## 2. Hosting layout (same server as the current demos)

```
app.devnixplus.com          → Django (Gunicorn) : signup, dashboard, editor, payments, admin
demo.devnixplus.com/<slug>/ → Nginx static     : previews and hosted sites (or <slug>.demo… if subdomain style)
customer-domain.com         → Nginx static     : hosted sites with the customer's own domain (set up manually by my team)
```

- **Nginx keeps serving every site as static files**, so sites stay fast and keep working even if Django is down.
- **Shared assets:** move the template's CSS/JS/placeholder images into one versioned shared folder, e.g. `/var/www/demos/_shared/v1/`, and expose it in every site server block as `location /_shared/ { alias /var/www/demos/_shared/; }`. Each project folder then contains only `index.html`, `data.js` and `images/`. Keep the existing demos working (migrate them or leave them self-contained; your choice, but nothing may break).
- Reserve slugs: `app`, `www`, `api`, `admin`, `_shared`, `static`, `media` and every existing demo folder name.
- Update `deploy/` with Nginx configs for `app.devnixplus.com`, the demo host (with `_shared`), and a **template server block for a customer domain**, plus a systemd unit for Gunicorn and the certbot commands.

## 3. Data model (main apps: `accounts`, `templates_lib`, `projects`, `billing`, `crm`, `adminpanel`)

- **User** (custom): email, name, **mobile (required)**, WhatsApp number (default = mobile), city, `contact_consent` (service updates, required), `marketing_consent` (optional), signup source, date joined.
- **Template**: slug, name, category, city label, thumbnail, live sample URL, `default_data` (JSON in the exact `data.js` shape), is_active, sort order. A management command `import_templates` reads every `demos/sample-*/data.js` and creates/updates Template records, so the 23 existing samples become the starting templates.
- **Project**: owner, template, business name, category, slug (unique, from the name), `data` (JSON, the single source of truth), `status`, `plan` (`none` | `hosted` | `download`), preview token, `hosting_expires_at`, custom domain, domain checklist (DNS pointed, SSL issued, checked), created/updated, last edited, published_at.
  - Status flow: `draft` → `preview` → `pending_payment` → `pending_verification` → `approved` → `live` (or `download_ready`) → `expired` / `suspended` / `rejected`.
- **ProjectImage**: project, kind (logo, hero, gallery, service), file, width, height, size.
- **ProjectVersion**: snapshot of `data` on every save (keep the last 30) so any change can be rolled back from the admin.
- **VerificationRequest**: project, Google Maps listing link, optional shop photo / visiting card / GST or Udyam number, owner notes, reviewer, decision, reason, timestamps.
- **Order / Payment**: user, project, type (`hosting_new`, `hosting_renewal`, `download`), amount, Razorpay order ID, payment ID, signature, status, refund status, invoice number, raw webhook JSON.
- **Download**: project, created at, IP, file size.
- **AbuseReport**: project, reporter email, reason, status.
- **CRM**: `LeadNote` (user, author, note, follow-up date) and `ActivityLog` (user, project, event such as `signed_up`, `project_created`, `data_step_completed`, `preview_opened`, `go_live_clicked`, `paid`, `downloaded`, timestamp).
- **PlatformSettings** (singleton, editable in the admin): prices, renewal reminder days, grace period days, max projects per user, preview expiry days, require-verification flags, support WhatsApp number.

## 4. Prices (configurable from the admin; start with these)

| Option | Price | Notes |
|---|---|---|
| Host with Devnixplus | **₹1,999** first year (setup + hosting) | Website design is free. Edits go live instantly. |
| Yearly renewal | **₹999** per year | Reminders before expiry; grace period after. |
| Download for your own server | **₹50** one-time | **Unlimited free re-downloads for the same project**, always with the latest data. Technical help from our team. |

Show prices on the dashboard and the pricing page from `PlatformSettings`, never hard-coded.

## 5. User flow

1. **Landing / gallery** (the existing root `index.html`, converted into a Django template or kept static with links into the app): every template card gets a **“Use this design”** button and the hero gets a clear call to action: “Create your business website free in 5 minutes”.
2. **Sign up / log in**: email + password or **Continue with Google**. After Google login, a one-screen onboarding asks for the mobile number (Indian format), city and the consent checkboxes. Mobile OTP verification is a pluggable provider (`MockSMS` in dev that shows the OTP on screen; MSG91 ready for later).
3. **Pick a template**: gallery with category and city filters and search. If the user came from “Use this design”, skip straight to step 4 with that template.
4. **Create popup** (Bootstrap modal): business name and category (prefilled from the template), and a **“Start creating”** button. On submit: create the Project with the template's `default_data`, the business name and category filled in, a unique slug, status `draft`; then redirect to the dashboard where the new project appears.
5. **Dashboard**: project cards with thumbnail, status badge and buttons **Preview**, **Add data / Edit**, **Customize**, and **Go live** (or **Renew** / **Download** depending on status). Also: payments and invoices, account, and a WhatsApp support button.
6. **Editor** (section 6). The user can leave and come back at any time.
7. **Preview**: opens the published preview URL in a new tab. Preview sites always have `DEMO_MODE` on, a visible “Preview” ribbon, and `noindex`.
8. **Go live**: the user chooses **Host with Devnixplus** or **Download for my own server**, sees the price and what's included, accepts the terms, pays with Razorpay, then fills the short verification form (Google Maps link + optional proof). Status moves to `pending_verification`, and the user sees “Our team will verify your business and call you within 24 hours”.
9. **After approval**:
   - Hosted: the team clicks **Go live** in the admin. The site is republished with `DEMO_MODE` off, the ribbon removed and `noindex` removed, on the subdomain; if the customer wants their own domain, the team follows the domain checklist. From then on **every edit is published immediately**.
   - Download: the **Download website** button unlocks on the dashboard (section 9).
10. **If rejected**: the payment is refunded automatically through the Razorpay refund API, and the user sees the reason.

## 6. Editor: step form with live preview

- Desktop layout: the step form on the left and a **live preview iframe** on the right (the real template rendering the unsaved data). Update the preview instantly as the user types by sending the data to the iframe with `postMessage` (add a small listener to the template that re-renders when it receives new data, only in preview/editor mode). On mobile: the form full screen with a floating “Preview” button.
- Steps (the user can jump between them; a progress bar shows completion):
  1. **Basics:** business name, category, tagline, phone, WhatsApp, email, address, map search text (required: name, category, phone, address)
  2. **About & highlights:** about text, year established, owner name, highlight chips
  3. **Services / menu:** repeater (title, description, optional price text, optional image); the label adapts to the category (Menu, Services, Treatments, Plans)
  4. **Photos:** logo, hero image, gallery (drag and drop, multiple). Validate type (JPG/PNG/WebP) and size (max 5 MB), resize to max 1600 px and compress with Pillow. Per-user storage limit from settings.
  5. **Opening hours:** a weekly grid with “closed” toggles and “open 24 hours”
  6. **Reviews & FAQ:** Google rating and review count with the **Google listing link (required if a rating is shown)**, testimonials, FAQs
  7. **Look & feel:** theme preset, “Brand colors from logo” (reuse the existing ColorThief/`theme: "auto"` logic), colour pickers, fonts, button style, show/hide and reorder sections
  8. **Social & SEO:** social links, page title and description (prefilled), language toggle (English/Hindi)
- **Autosave** every few seconds and on step change, with a “Saved” indicator. The template's sample data is already filled in, so a user who only completes step 1 still gets a complete-looking site.
- Validate all data server-side against a **JSON Schema** of the `data.js` shape before saving. Reject unknown keys; strip HTML from text fields; validate URLs (http/https only), phone numbers and colours.
- All editor labels in English with a Hindi toggle.

## 7. Publishing `data.js` safely

The database is the source of truth. A single service `publish_project(project, mode)` writes the project's folder:
- `data.js` = `window.BUSINESS = <json>;` produced with `json.dumps(..., ensure_ascii=False)` and then escaping `</`, `<!--`, U+2028 and U+2029, so user text can never break out of the script. **Never build `data.js` by string concatenation of user input.**
- `index.html` from the template, with the **title, meta description, Open Graph tags and LocalBusiness JSON-LD rendered server-side** (properly escaped) so search engines see them without running JavaScript, plus `noindex` and `DEMO_MODE` set by mode (`preview` or `live`).
- Images copied or linked into `images/`.
- Write to a temporary folder and swap atomically (rename), so a half-written site is never served.
- Called on every save (preview mode until live; live mode after go-live), on go-live, on suspension (replace with a “temporarily unavailable” page; keep all data) and on reactivation.

## 8. Payments (Razorpay)

- Orders API + Checkout.js; verify the payment signature on the server; **webhook endpoint** with signature verification for `payment.captured`, `payment.failed`, `refund.processed`; idempotent handling (a repeated webhook must never double-activate or double-extend).
- Amounts always calculated on the server from `PlatformSettings`.
- Invoice PDF for every successful payment (invoice series per financial year; GST fields shown only if `GST_ENABLED` and a GSTIN are set in settings).
- Refund through the API when the team rejects a paid project.
- **Renewal:** “Renew now” on the dashboard creates a new order for one year, extending `hosting_expires_at` from the current expiry (not from today). Razorpay Subscriptions can come later; keep the code ready for it.
- Test-mode keys in `.env`; a **Demo Payment Simulator** (success/failure buttons) when `DEMO_PAYMENTS=True`, so the whole flow can be tested without keys.

## 9. Download pack (₹50)

- Available only after payment **and** verification approval.
- Builds a fresh ZIP every time from the latest data: `index.html`, `data.js`, `css/`, `js/`, images and placeholders copied in with **relative paths** (fully self-contained, no `_shared` dependency), `DEMO_MODE` off, ribbon removed, `noindex` removed.
- Includes `README.txt` (upload to cPanel, Netlify, or any static host, in simple English and Hindi) and `LICENSE.txt` (licensed for this one business and one website only; reselling or reusing the design is not allowed; keep the “Website by Devnixplus” credit).
- **Unlimited free re-downloads for the same project**; each download is logged. Downloads use a signed URL that expires in 10 minutes.
- Make it clear in the editor that a downloaded copy does not update automatically: after editing, download again.

## 10. Verification, safety and limits

- Nothing goes live or becomes downloadable without approval in the admin. The verifier sees the project preview, the owner details, the Google Maps link and the uploaded proof, and clicks **Approve** or **Reject (with reason)**.
- Flag for priority review (but don't block) projects whose name or text contains sensitive words: bank, government, police, RBI, SBI, loan, lottery, crypto, and a list editable in settings.
- Max projects per user (default 3), rate limits on signup, login, project creation and uploads.
- **Report this website** link in the footer of every live site → AbuseReport.
- Admin **Suspend** / **Reactivate** buttons, and **Restore version** from ProjectVersion.
- Full audit log of admin actions.

## 11. Reminders and expiry (cron management commands)

- `send_reminders` (daily): hosting renewal reminders at 30, 7 and 1 days before expiry and on the expiry date; reminders for users with a draft or preview project who haven't paid (after 1, 3 and 7 days). Email through Django's email backend; WhatsApp through a pluggable provider (`MockWhatsApp` that just logs, ready for the WhatsApp Cloud API later). Each reminder includes a direct “Renew” or “Go live” link.
- `expire_hosting` (daily): after the grace period (default 15 days), set status `expired` and publish the “temporarily unavailable” page. Paying the renewal republishes the site automatically.
- `expire_previews` (daily): previews unused for N days (default 60) are unpublished (data kept; the user can republish from the dashboard).

## 12. Admin panel for my team (`app.devnixplus.com/manage/`, custom UI, role-based)

Roles: **Admin**, **Sales**, **Verifier**.
- **Overview:** signups today/this week, projects created, previews opened, paid, live, renewals due this month, revenue this month, and a funnel chart (Chart.js): Signed up → Project created → Data filled → Preview opened → Paid → Live.
- **Leads (CRM):** every registered user with business name, category, city, mobile, funnel stage, last activity, and consent flags. Filters, search, CSV export. One-click **Call** and **WhatsApp** buttons with a pre-filled message (e.g. “Namaste {name}, this is Devnixplus. Your website for {business} is ready to go live…”). Notes and follow-up dates; a “Follow-ups due today” list. Users without contact consent are clearly marked and excluded from marketing exports.
- **Verification queue:** pending projects with preview, proof and Approve/Reject.
- **Projects:** all projects with status, plan, expiry; open preview; restore versions; suspend/reactivate; go live; **domain checklist** with the generated Nginx server block and the certbot command to copy for that domain.
- **Payments:** orders, refunds, invoices.
- **Templates:** activate/deactivate, reorder, re-import from `demos/sample-*`.
- **Abuse reports** and **Platform settings** (prices, limits, reminder days).

## 13. Public pages

Pricing, How it works, FAQ, Terms of Service, Privacy Policy, Refund Policy, Contact (these pages are required for Razorpay activation). The Terms must state: verification before going live, refund if rejected, hosting renewal and grace period, the download licence, and that we may suspend sites that break the rules. Write clear placeholder text and add a note that the final legal text should be reviewed by a lawyer or CA.

## 14. Security and quality

- CSRF on all forms (webhooks exempt but signature-verified), owner-only access to every project, file upload validation, JSON Schema validation, secure cookies and HSTS in production, `ALLOWED_HOSTS` and CSRF trusted origins from `.env`.
- Never trust prices or project IDs from the browser.
- Logging to file; daily database and `/var/www/demos` backup script with 14-day retention (in `deploy/`).
- **Tests:** slug generation and reserved slugs; JSON Schema validation and rejection of script injection in every text field; `data.js` escaping (`</script>` in a business name must not break the page); atomic publish; project limit per user; Razorpay signature and webhook idempotency (mocked); refund on rejection; renewal extends from the current expiry; download only after payment + approval; re-download free for the same project; expiry and grace period; permissions (a user can't see or edit another user's project; Sales can't approve verification).

## 15. Docs

- `README.md`: local setup, `.env`, `import_templates`, demo logins, running the payment simulator, cron entries.
- `docs/DEPLOYMENT.md`: step-by-step for the existing server: Postgres, Gunicorn, Nginx (app + demo host + `_shared` + customer domain template), certbot, cron jobs, backups.
- `docs/ADMIN_GUIDE.md`: for my team, how to verify a business, go live, connect a customer domain, handle refunds, suspend a site, and follow up leads.
- `docs/USER_FLOW.md`: the full flow with a Mermaid diagram.

## 16. How to work

1. First give me the inspection summary from section 0, the final folder structure, models, URL map and the build phases. **Wait for my “go”.**
2. Build in phases. After each phase run `python manage.py check`, migrations and tests, and fix every error before moving on:
   - **Phase 1:** inspection, shared assets refactor (existing demos must keep working), Django project, accounts with Google login and onboarding, Template import
   - **Phase 2:** create-project popup, dashboard, `publish_project`, preview URLs
   - **Phase 3:** step editor with live preview, image uploads, autosave, JSON Schema validation, version history
   - **Phase 4:** Razorpay (hosted + download + renewal), simulator, invoices, refunds
   - **Phase 5:** verification flow, go-live, download pack, suspend/restore, abuse reports
   - **Phase 6:** admin panel with CRM, funnel, domain checklist
   - **Phase 7:** reminders and expiry commands, public/legal pages, “Use this design” buttons on the root gallery, docs, deployment configs, final mobile check
3. No TODOs or dead buttons in the final build.
4. At the end, give me the exact commands to run locally and to deploy on my server, plus the cron lines.
