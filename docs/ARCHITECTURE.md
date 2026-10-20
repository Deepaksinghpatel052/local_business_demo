# Architecture: Devnixplus self-service website builder

## 1. What already existed (inspection summary)

| Piece | What it is | How the platform uses it |
|---|---|---|
| `template/index.html` | Empty page shell: meta block between `<!-- META:START … -->` and `<!-- META:END -->`, a `DEMO:NOINDEX` robots tag, CDN links (Bootstrap 5.3, Icons, AOS, jQuery), then `data.js`, `js/themes.js`, `js/main.js` (all `defer`). | Rendered server-side per site: meta/OG/JSON-LD baked in, assets pointed at `/_shared/v1/`, `window.LBD_CONFIG` inserted before `data.js`. |
| `template/js/main.js` | Renders the whole one-page site from `window.BUSINESS`. `DEMO_MODE` (ribbon, theme switcher, `?pitch=1`, noindex), `theme: {}` / `"auto"` (ColorThief logo colours) / manual colours, `sections` order, opening hours in Asia/Kolkata, Hindi toggle, SEO at runtime. | Reused as-is. Small backward-compatible hooks: `window.LBD_CONFIG` (`demoMode`, `mode`, `assetBase`, `themeSwitcher`, `reportUrl`), a "Preview" ribbon, a footer "Report this website" link, optional `seo.title/description`. Hand-made demos (no `LBD_CONFIG`) behave exactly as before. |
| `template/js/themes.js` | 14 preset families + 24 categories (label, schema.org type, services heading, hero layout, photo folder, section order, own look) + Google Fonts weights. | Python reads it (`templates_lib/categories.py`) so categories, fonts and colour presets never drift. The editor also loads it to know each category's default section order. |
| `data.js` format | `window.BUSINESS = { … }`: a JS object literal (unquoted keys, comments, single quotes). | Parsed without running JS (`templates_lib/jsdata.py`). The database stores the same shape as JSON; `data.js` is written with `json.dumps` + escaping. |
| `tools/theme-preview.html` | Logo → colours → `theme` snippet. | Its idea lives in editor step 7 ("Brand colours from logo" = `theme: "auto"`). |
| `demos/` | 3 business demos (`seasons-salon`, `primeride-taxi-gwalior`, `relief-physiotherapy-gwalior`) + 23 `sample-*` category samples. Each folder is self-contained (own `css/ js/ placeholders/`). | `import_templates` turns every `sample-*` into a Template. All demo folder names are reserved slugs. The folders are left untouched and keep working. |
| `showcase/` | Static gallery at `/` of the demo host (`demos.js` + `thumbs/`, built by `tools/build_showcase.py`). | Kept static. Sample cards got a **Use this design** button (→ `app…/start/<category>/`) and the hero a "Create your business website free in 5 minutes" button. |
| `new_demo.py` | Create / list / zip / launch / update hand-made demos (stdlib only). | Unchanged; still the tool for hand-made pitches. |
| How demos are served | `deploy/nginx-wildcard.conf` = **subdomain** style (`<slug>.mydomain.com`); the latest commit and `docker/nginx.conf` open them as **paths** (`/<slug>/`). | `DEMO_URL_STYLE = "path"` (default) or `"subdomain"`, plus `DEMO_BASE_URL` / `DEMO_DOMAIN`. |

## 2. Folder structure

```
local_business_demo/
├── template/                 renderer (unchanged API; small LBD_CONFIG hooks in js/main.js)
├── demos/                    hand-made demos + sample-* (= starting templates)
├── showcase/                 static demo gallery (now with "Use this design")
├── builder/                  Django project (app.devnixplus.com)
│   ├── manage.py
│   ├── config/               settings (django-environ), urls, wsgi
│   ├── core/                 PlatformSettings, AuditLog, OutgoingMessage, SMS/WhatsApp providers,
│   │                         rate limiter, notify, template tags, dev static-site server, seed/roles/sync_shared commands
│   ├── accounts/             custom User (email login, mobile, consents), signup extra fields, onboarding + OTP
│   ├── templates_lib/        Template model, data.js parser, themes.js reader, import_templates
│   ├── projects/             Project, ProjectImage, ProjectVersion, VerificationRequest, Download, AbuseReport,
│   │                         JSON Schema, publish_project, download ZIP, workflow, editor, cron commands
│   ├── billing/              Order, InvoiceCounter, WebhookEvent, Razorpay service, simulator, invoice PDF
│   ├── crm/                  ActivityLog, LeadNote, ReminderLog, send_reminders
│   ├── adminpanel/           /manage/ for Admin, Sales, Verifier (+ domain server-block generator)
│   ├── pages/                home, pricing, how it works, FAQ, legal pages, contact
│   ├── templates/            Django templates (Bootstrap 5)
│   └── static/               app.css, app.js, editor.css, editor.js, editor-bridge.js
├── deploy/                   Nginx (app, demos, customer domain, ACME default), systemd, cron, backup.sh
├── docs/                     this file, DEPLOYMENT.md, ADMIN_GUIDE.md, USER_FLOW.md
├── var/                      (git-ignored) local sites/, media/, logs/, static/
├── requirements.txt          everything for local dev (venv)
└── requirements-server.txt   server (no Playwright)
```

## 3. Data model (summary)

- **accounts.User**: email (login), name, mobile (10 digits, verified by OTP), whatsapp, city, contact_consent (required), marketing_consent, signup_source, onboarded.
- **templates_lib.Template**: slug, name, category, city_label, sample_name, thumbnail, source_folder, `default_data` (data.js shape), is_active, sort_order. `live_sample_url` is computed.
- **projects.Project**: owner, template, business_name, category, slug, `data` (source of truth), status, plan, preview_token, steps_done, hosting_expires_at, custom domain + checklist, flagged/flag_reason, published_mode/at, timestamps.
  Status flow: `draft → preview → pending_payment → pending_verification → approved → live` (or `download_ready`) and `expired / suspended / rejected`.
- **ProjectImage** (kind, file, width, height, size) · **ProjectVersion** (last 30; autosaves within 2 minutes update the newest version) · **VerificationRequest** · **Download** · **AbuseReport**.
- **billing.Order** (type, amount in paise, Razorpay ids, status, refund status, invoice number, raw webhooks, `applied` flag for idempotency) · **InvoiceCounter** (per financial year) · **WebhookEvent** (de-dup by event id).
- **crm.ActivityLog** (funnel events) · **LeadNote** (note + follow-up date) · **ReminderLog** (one row per reminder sent).
- **core.PlatformSettings** (singleton: prices, reminder days, grace period, limits, verification flags, sensitive words, support contacts) · **AuditLog** · **OutgoingMessage**.

## 4. URL map (app host)

| URL | What |
|---|---|
| `/` | Landing + design gallery |
| `/templates/` | Pick a design (category, city filters, search) |
| `/start/<template>/` | "Use this design" → signup → dashboard with the create popup open |
| `/accounts/…` | allauth: login, signup, Google, password reset |
| `/onboarding/` | Mobile, city, consent → OTP |
| `/dashboard/` | Project cards (Preview, Add data/Edit, Customize, Go live / Verify / Download / Renew) |
| `/projects/create/` (POST) | Create popup target |
| `/projects/<id>/edit/` | Step editor; `/frame/` live preview iframe; `/save/` autosave (JSON); `/images/` upload |
| `/projects/<id>/preview/` | Publishes if needed, logs, redirects to the preview URL |
| `/projects/<id>/go-live/` | Choose hosting or download |
| `/billing/checkout/<id>/<type>/` → `/billing/pay/<order>/` | Razorpay Checkout or Demo Payment Simulator |
| `/billing/callback/`, `/billing/webhook/` | Signature-verified payment results |
| `/projects/<id>/verify/` | Verification form (Maps link + optional proof) |
| `/projects/<id>/download/` → `/d/<signed>/` | Fresh ZIP; link valid 10 minutes |
| `/billing/payments/`, `/billing/invoices/<id>/` | Payments list, invoice PDF |
| `/report/<slug>/` | Public "Report this website" form |
| `/pricing/ /how-it-works/ /faq/ /terms/ /privacy/ /refund-policy/ /contact/` | Public pages |
| `/manage/…` | Team panel (overview, leads, verification, projects, payments, templates, abuse, settings, audit) |
| `/django-admin/` | Django's technical admin |
| `/sites/<slug>/`, `/_shared/…` | Dev only (`SERVE_SITES`): Django stands in for Nginx |

## 5. Publishing

`projects.publish.publish_project(project, mode)` with mode `preview | live | unavailable | unpublish` (or `auto` from the status):

1. builds `SITES_ROOT/.tmp-<slug>-<random>/` with `index.html` (server-rendered title, description, OG, canonical, LocalBusiness JSON-LD, robots by mode, `LBD_CONFIG`), `data.js` (`json.dumps(ensure_ascii=False)`, then `<`, `>`, `&`, U+2028, U+2029 escaped as `\uXXXX`) and `images/` (hard links to the uploads);
2. renames the live folder aside, renames the new one in, deletes the old one. A half-written site is never served; on any error the old site stays.

It runs on every save (preview until live, live after), on go-live, suspend (unavailable page, data kept), reactivate, expiry and renewal. CSS/JS/stock photos come from `SITES_ROOT/_shared/<SHARED_VERSION>/` (`manage.py sync_shared`).

## 6. Build phases (as delivered)

1. Inspection, shared assets, Django project, accounts + Google + onboarding, template import
2. Create popup, dashboard, `publish_project`, preview URLs
3. Step editor with live preview, uploads, autosave, JSON Schema, versions
4. Razorpay (hosting, download, renewal), simulator, invoices, refunds
5. Verification, go-live, download pack, suspend/restore, abuse reports
6. Team panel with CRM, funnel, domain checklist
7. Reminders and expiry commands, public/legal pages, "Use this design" on the showcase, docs, deploy configs, mobile check
