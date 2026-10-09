# Local Business Demo Websites

Build a **ready-to-send demo website** for a local business in about 5 minutes, host it on its
own subdomain (`seasons-salon.mydomain.com`) and send the link to the owner as a pitch.

The idea: find a well-rated business on Google Maps that has no website, create a demo for it
with one command, fill in its details, and send the owner the link on WhatsApp.

**What every demo includes:** a mobile-friendly one-page site with Call and WhatsApp buttons,
Google Maps, live "Open now / Closed now" hours, services or menu, gallery, Google rating and
reviews, FAQs, an enquiry form that opens WhatsApp, a Hindi toggle and SEO tags.

**Every category has its own design.** A spa, a garage and a coaching centre do not look alike:
each of the 23 categories has its own colours, fonts, photos, layout, wording and section order,
based on how that kind of business sells.

**How it is built**

- Static only: HTML, CSS, Bootstrap 5, jQuery, Bootstrap Icons, AOS and ColorThief, loaded from CDNs.
- No backend, no database, no build step, no `.env`. Each demo is one self-contained folder.
- `new_demo.py` creates and manages demos. It needs only Python 3.8+ (standard library, nothing to install).
- Docker (optional) serves all demos locally, each on its own subdomain, just like production.

---

## Contents

1. [Requirements](#1-requirements)
2. [Get the project](#2-get-the-project)
3. [Run the project](#3-run-the-project)
4. [One-time setup: your details](#4-one-time-setup-your-details)
5. [Create a new demo with new_demo.py (step by step)](#5-create-a-new-demo-with-new_demopy-step-by-step)
6. [Categories](#6-categories)
7. [data.js field reference](#7-datajs-field-reference)
8. [Images](#8-images)
9. [Design: colours, fonts and layouts](#9-design-colours-fonts-and-layouts)
10. [Demo mode, pitch mode and going live](#10-demo-mode-pitch-mode-and-going-live)
11. [Deploy: one subdomain per business](#11-deploy-one-subdomain-per-business)
12. [Command reference](#12-command-reference)
13. [Checklist before you send a demo](#13-checklist-before-you-send-a-demo)
14. [Troubleshooting](#14-troubleshooting)
15. [Folder structure](#15-folder-structure)
16. [Developer notes: changing the template](#16-developer-notes-changing-the-template)

---

## 1. Requirements

| Tool | Needed for | Check it is installed |
|---|---|---|
| **Python 3.8+** | `new_demo.py` (create, zip, launch demos) | `python --version` |
| **Git** | getting the code and saving changes | `git --version` |
| **Docker Desktop** *(optional)* | previewing all demos at `http://<slug>.localhost:8080/` | `docker --version` |
| A modern browser | previewing | Chrome or Edge recommended |

On Windows, if `python` is not found, try `py` instead (for example `py new_demo.py --list`).

You do **not** need Node.js, npm or any Python packages.

---

## 2. Get the project

```bash
git clone https://github.com/Deepaksinghpatel052/local_business_demo.git
cd local_business_demo
```

*(Optional)* A Python virtual environment is only used for development tools such as
browser testing. `new_demo.py` itself does not need it:

```bash
python -m venv venv
# Windows:      venv\Scripts\activate
# macOS/Linux:  source venv/bin/activate
```

---

## 3. Run the project

There are three ways to view the demos. Pick one.

### Option A: Docker (recommended, all demos at once)

Make sure **Docker Desktop is running**, then from the project folder:

```bash
docker compose up -d --build
```

Open in Chrome or Edge:

| What | URL |
|---|---|
| List of all demos | http://localhost:8080/ |
| A demo, subdomain style (same as production) | `http://<slug>.localhost:8080/` e.g. http://seasons-salon.localhost:8080/ |
| A demo, path style (works in any browser) | `http://localhost:8080/<slug>/` e.g. http://localhost:8080/seasons-salon/ |
| With the pitch panel | http://seasons-salon.localhost:8080/?pitch=1 |

- The `demos/` folder is mounted live: edit any `data.js` or image and just **refresh the browser**.
  No rebuild is needed. New demos appear immediately.
- Rebuild only after changing `Dockerfile` or `docker/nginx.conf`: `docker compose up -d --build`.
- Stop: `docker compose down`. Logs: `docker compose logs -f`.
- The container restarts automatically whenever Docker Desktop is running.

Docker files: `Dockerfile` (Nginx image), `docker-compose.yml` (port 8080, live mount),
`docker/nginx.conf` (maps `<slug>.localhost` to `demos/<slug>/`).

### Option B: Python (one demo, no Docker)

```bash
cd demos/seasons-salon
python -m http.server 8000
```

Open http://localhost:8000. This behaves exactly like the demo's subdomain root.
Press `Ctrl+C` to stop.

### Option C: Open the file directly

Double-click `demos/<slug>/index.html`. Everything works except `theme: "auto"`
(browsers block reading logo colours from `file://` pages, so the category colours are used).

---

## 4. One-time setup: your details

Open `new_demo.py` and fill in **your** details at the top:

```python
BASE_DOMAIN = "mydomain.com"          # demos live at https://<slug>.mydomain.com/
DEVELOPER = {
    "name": "Your Name",
    "phone": "+91 90000 00000",
    "whatsapp": "919000000000",       # digits only, with country code
    "portfolio": "https://mydomain.com",
}
```

These are written into every **new** `data.js` (existing demos keep what they have; edit their
`developer:` line by hand). They power the demo ribbon ("prepared for … by **Your Name**"),
the "Website by …" footer credit and the "Let's talk" WhatsApp button that messages **you**.

*(Optional)* Set the same values in `DEFAULT_DEVELOPER` near the top of `template/js/main.js`.
It is only used when a `data.js` has no `developer` block.

---

## 5. Create a new demo with new_demo.py (step by step)

Worked example: **Seasons Salon** in BTM Layout, Bengaluru (rated 4.9 from 1,030 Google reviews).

### Step 1: Collect the details from Google Maps

Open the business on Google Maps and note down:

- name, category, phone number, full address
- rating and number of reviews
- opening hours (the hours table)
- 2-4 good reviews (name, text, stars)
- services, menu or price list (from photos or the Services/Menu tab)
- a few photos (Photos tab), Instagram/Facebook links if listed

### Step 2: Create the demo folder

```bash
python new_demo.py "Seasons Salon" salon
```

Output:

```
Created demo: .../demos/seasons-salon
```

This creates `demos/seasons-salon/` with:

```
index.html  css/  js/            the template code (do not edit here)
placeholders/beauty/             stock photos for this category (used until you add real ones)
data.js                          <- the ONLY file you edit
images/                          <- put this business's photos here
```

- The **slug** (`seasons-salon`) becomes the subdomain. To choose your own:
  `python new_demo.py "Seasons Salon" salon --slug seasons-btm`
- The category must be one of the [23 categories](#6-categories). Run `python new_demo.py --help`
  to see the list.

### Step 3: Fill in data.js

Open `demos/seasons-salon/data.js`. It is pre-filled with `"TODO"` placeholders.
Replace what you know. **Anything left as `"TODO"` or empty is simply hidden** (or replaced by
sensible category text), so a half-filled demo still looks complete.

Only `name`, `category`, `phone` and `address` are required:

```js
window.BUSINESS = {
  name: "Seasons Salon",
  slug: "seasons-salon",
  category: "salon",
  tagline: "Rated 4.9★ by 1,000+ happy clients in BTM Layout",
  about: "Seasons Salon is a well-loved neighbourhood salon in BTM Layout 2nd Stage...",
  phone: "+91 76195 57803",
  whatsapp: "917619557803",            // digits with country code
  address: "No 119, Soujanya Enclave, 6th Cross, 29th Main Rd, ..., Bengaluru, Karnataka 560076",
  mapQuery: "Seasons Salon, 29th Main Rd, BTM Layout 2nd Stage, Bengaluru 560076",
  hours: { mon: "10:00-21:00", tue: "10:00-21:00", wed: "10:00-21:00", thu: "10:00-21:00",
           fri: "10:00-21:00", sat: "9:00-21:30", sun: "9:00-21:30" },
  rating: 4.9,
  reviewCount: 1030,
  highlights: ["4.9★ on Google", "1,000+ Reviews", "Experienced Stylists", "Card & UPI"],
  services: [
    { title: "Haircut & Styling", desc: "Precision cuts and blow-dry.", price: "from ₹399", icon: "bi-scissors" }
  ],
  testimonials: [
    { name: "Priya S.", text: "Copy a real Google review here.", rating: 5 }
  ],
  // ...
};
```

See the full [data.js field reference](#7-datajs-field-reference). Tips:

- Copy **real** reviews from Google. Never invent reviews or prices.
- `hours` formats: `"9:00-22:00"`, `"10:00-14:00, 17:00-21:00"` (split shift),
  `"18:00-02:00"` (past midnight), `"closed"`, `"24h"`.
- Services you don't know prices for: leave `price: ""`.

### Step 4: Add photos

Put compressed photos in `demos/seasons-salon/images/` and reference them in `data.js`:

```js
heroImage: "images/hero.jpg",
logo: "images/logo.png",
gallery: ["images/1.jpg", "images/2.jpg", { src: "images/3.jpg", caption: "Our studio" }],
```

No photos yet? Leave them empty: the category's stock photos are used automatically.
See [Images](#8-images) for sizes.

### Step 5: Preview

- **Docker running?** Just open http://seasons-salon.localhost:8080/ (refresh after every edit).
- Or: `cd demos/seasons-salon && python -m http.server 8000` and open http://localhost:8000.

Check the [checklist](#13-checklist-before-you-send-a-demo): phone width, Call/WhatsApp buttons,
open/closed badge, Hindi toggle.

### Step 6: Refresh the link-preview tags

WhatsApp and Facebook previews read the HTML directly, so bake the title/description/image into it:

```bash
python new_demo.py --meta seasons-salon
```

(`--zip`, `--launch` and `--update` also do this automatically.)

### Step 7: Deploy

Pick one (details in [Deploy](#11-deploy-one-subdomain-per-business)):

```bash
# VPS with the Nginx wildcard config:
scp -r demos/seasons-salon user@SERVER_IP:/var/www/demos/

# cPanel / Hostinger: creates dist/seasons-salon.zip, then upload + extract it
python new_demo.py --zip seasons-salon
```

### Step 8: Send it to the owner

```
https://seasons-salon.mydomain.com/
https://seasons-salon.mydomain.com/?pitch=1     <- shows a "what you get" panel
```

### Step 9: When the owner pays

```bash
python new_demo.py --launch seasons-salon
```

This removes the demo ribbon, theme switcher, pitch panel and the "noindex" tag so Google can
list the site. Re-upload the folder. See [Going live](#when-a-client-pays).

### Step 10: Save your work in Git

```bash
git add -A
git commit -m "Add Seasons Salon demo"
git push
```

---

## 6. Categories

Use the **key** in `new_demo.py "Name" <key>` and in `data.js`.
Every category has its own design and a sample demo to look at
(Docker: `http://sample-<key>.localhost:8080/`).

| Key | Use for | Hero layout | Main button | Sample demo |
|---|---|---|---|---|
| `restaurant` | Restaurants, dhabas, sweet shops | full photo | Order on WhatsApp | `sample-restaurant` |
| `cafe` | Cafés, coffee shops | split | Order on WhatsApp | `sample-cafe` |
| `bakery` | Bakeries, cake shops | centred | Order a Cake | `sample-bakery` |
| `bar` | Bars, pubs, lounges, breweries | centred, dark | Reserve a Table | `sample-bar` |
| `salon` | Hair and beauty salons | full photo | Book Your Slot | `sample-salon` |
| `spa` | Spas, massage centres | full photo | Book a Massage | `sample-spa` |
| `boutique` | Clothing and saree boutiques | centred | Enquire Now | `sample-boutique` |
| `gym` | Gyms, fitness studios | full photo, dark | Book Free Trial | `sample-gym` |
| `clinic` | Doctors, family clinics | split | Book Appointment | `sample-clinic` |
| `dentist` | Dental clinics | split | Book Appointment | `sample-dentist` |
| `hospital` | Hospitals, nursing homes | full photo | Book Appointment | `sample-hospital` |
| `school` | Schools, pre-schools | centred | Admission Enquiry | `sample-school` |
| `coaching` | Coaching centres, tuition, institutes | split | Book Free Demo Class | `sample-coaching` |
| `hotel` | Hotels, guest houses, resorts | full photo | Check Availability | `sample-hotel` |
| `travel` | Tours & travels, travel agents | centred | Plan My Trip | `sample-travel` |
| `car-service` | Authorised car service centres | full photo | Get a Quote | `sample-car-service` |
| `garage` | Local car garages & mechanics | full photo | Get a Quote | `sample-garage` |
| `electronics` | Mobile, TV, appliance stores | split | Check Price | `sample-electronics` |
| `hardware` | Hardware, paint and sanitary stores | split | Get a Quote | `sample-hardware` |
| `handyman` | Plumbers, electricians, carpenters, home repairs | split | Book a Visit | `sample-handyman` |
| `jewellery` | Jewellers | centred | Enquire Now | `sample-jewellery` |
| `real-estate` | Property dealers, real estate agents | split | Book a Site Visit | `sample-real-estate` |
| `general` | Anything else | full photo | WhatsApp Us | (no sample) |

The services heading also changes by category: *Our Menu, Our Services, Massages & Therapies,
Our Collections, Membership Plans, Treatments, Departments, Our Programs, Courses, Rooms & Stays,
Tour Packages, Our Products, Properties*.

---

## 7. data.js field reference

| Field | Where to find it on Google Maps | Notes |
|---|---|---|
| `name` | Business title | **Required** |
| `category` | Category under the title | **Required.** One of the [keys above](#6-categories) |
| `tagline` | Signboard, or "From the business" text | One short line. Default: a category line |
| `about` | Description, reviews and photos | 2-3 sentences. Default: category text |
| `established` | "Opened in…", signboard, reviews | Year. Shows "Since 1998" and a years counter |
| `owner` | Reviews ("the owner Mr. Sharma…") | For clinics use `doctor` instead |
| `phone` | Phone row | **Required.** e.g. `"+91 98765 43210"` |
| `whatsapp` | Usually the same mobile number | Digits with country code `"919876543210"`. Defaults to `phone` |
| `email` | Website / profile | Optional |
| `address` | Address row | **Required.** City and PIN are read from it (or set `city`) |
| `mapQuery` | What you searched to find them | Used for the map, "Directions" and "Read reviews" links |
| `hours` | Hours table | `"9:00-22:00"`, `"10:00-14:00, 17:00-21:00"`, `"18:00-02:00"`, `"closed"`, `"24h"`. Always India time |
| `rating`, `reviewCount` | Stars and number of reviews | Hero badge, counters, review summary, SEO data |
| `highlights` | "About" tab (Parking, AC, Pure veg…) | Icons are picked automatically from the words |
| `services` | Services/Products tab, price list photos | `{ title, desc, price, image, icon }`. Gyms: add `features: [...]` and `popular: true` for plan cards |
| `menuCategories` | Menu photos (restaurant, café, bakery, bar) | Tabbed menu: `{ name, icon, items: [{ title, desc, price, veg, tag }] }` |
| `heroImage` | Best cover photo | Path or https URL. Empty = category photo |
| `logo` | Profile picture | Empty = a text logo from the initials |
| `gallery` | Photos tab | Paths, https URLs, or `{ src, caption }`. Empty = category photos |
| `testimonials` | 2-4 of their best Google reviews | `{ name, text, rating }`. Empty = section shows the rating summary only |
| `faqs` | Q&A, common review questions | `{ q, a }`. Empty = category FAQs |
| `social` | Links on the profile | `instagram`, `facebook`, `youtube` (also `twitter`, `linkedin`) |
| `doctor` | (clinic, dentist, hospital) | `{ name, qualification, experience, photo, about, specialities: [] }`: "Meet the Doctor" card |
| `results` | (school, coaching) toppers, pass rates | `[{ value: "95%", label: "Board pass rate" }]` |
| `languages` | | `["en", "hi"]` shows the हिंदी toggle. `["en"]` hides it |
| `theme` | | `{}` (category design), `"auto"` or manual colours. See [Design](#9-design-colours-fonts-and-layouts) |
| `sections` | | Optional custom order. Leave out a key to hide that section |
| `happyCustomers` | | Optional. Otherwise about `reviewCount × 10` |
| `developer` | | Your details (filled in by `new_demo.py`) |

**Section keys:** `hero, highlights, about, services, why, doctor, results, gallery, testimonials, cta, hours, faq, contact`.
Each category already has its own default order (see [Design](#9-design-colours-fonts-and-layouts)).
Example to override: `sections: ["hero", "services", "gallery", "testimonials", "contact"]`.

**Icons:** any [Bootstrap Icons](https://icons.getbootstrap.com/) name, e.g. `"bi-scissors"`, `"bi-cup-hot"`.

---

## 8. Images

- Any image field accepts **a relative path** (`"images/hero.jpg"`) **or a full https URL**.
- **Compress every photo first** at [squoosh.app](https://squoosh.app) or [tinypng.com](https://tinypng.com):
  hero about 1600×900 and under 200 KB, others about 800×600 and under 100 KB.
  This is the biggest factor in how fast the site opens on a phone.
- Use relative paths without a leading `/`, and match the file name's capitals exactly
  (Linux servers are case-sensitive).
- Missing or broken images fall back to the category photo, then to a brand-coloured gradient.
  A demo never shows a broken image.
- Each demo only contains its own category's stock photos (`placeholders/<folder>/`), so
  demos stay small (about 0.3-0.5 MB plus your photos).

---

## 9. Design: colours, fonts and layouts

### Every category has its own design

Each category in `template/js/themes.js` defines:

| Key | What it controls |
|---|---|
| `look` | Its own palette, fonts, button shape, default tagline/about text, "Why choose us", FAQs and main button |
| `hero` | `full` (photo behind text), `center` (showcase, centred text) or `split` (text beside the photo; the photo stacks on top on phones) |
| `photos` | Its stock-photo folder in `placeholders/` |
| `order` | Default section order, following how that customer decides |

Examples of the section order: menu first for food, doctor first for clinics, results first for
coaching, collection photos first for boutiques and jewellers, plans first for gyms, packages
first for travel.

Categories also belong to a **family preset** that supplies anything the category does not set
(`food`, `beauty`, `wellness`, `fitness`, `medical`, `education`, `hospitality`, `travel`,
`industrial`, `trades`, `luxury`, `nightlife`, `general`).

### Three ways to theme one business (`theme` in data.js)

```js
theme: {},          // 1. the category's own design (recommended)

theme: "auto",      // 2. primary + accent colours taken from the logo (needs http/https, see below)

theme: {            // 3. manual: any of these override the category design
  primary: "#A3154A",
  primaryDark: "#7A0F37",       // optional
  accent: "#F2A900",
  background: "#FFF9F0",
  surface: "#FFFFFF",
  text: "#2D1B14",
  headingFont: "Yeseva One",    // any Google Font
  bodyFont: "Nunito",
  buttonStyle: "rounded",       // "rounded" | "pill" | "square"
  borderRadius: "12px"
}
```

Button text automatically switches between white and dark for contrast, and links and icons
are adjusted when they would be hard to read.

> **`"auto"` needs http(s).** Browsers block reading logo colours on pages opened from disk
> (`file://`), so the category colours are used there. It works with Docker,
> `python -m http.server` and every real host.

### Theme preview tool

Open `tools/theme-preview.html` (double-click works):

1. Drop the business logo in. Its colours are extracted.
2. Choose the category.
3. Adjust colours, fonts, button style and corner radius, and watch the live preview with contrast checks.
4. Click **Copy theme** and paste it over the `theme:` line in the demo's `data.js`.

---

## 10. Demo mode, pitch mode and going live

While `DEMO_MODE = true` (top of `js/main.js`), every demo shows:

- a dismissible **top ribbon**: *"This is a demo website concept prepared for [Business] by [You].
  Like it? Let's make it yours."* with a WhatsApp button to you;
- a **theme switcher** (palette button, bottom-left) with the brand colours + 2 alternatives
  (turn off with `SHOW_THEME_SWITCHER = false`);
- **pitch mode**: add `?pitch=1` to the link for a panel listing what the owner gets;
- a `noindex` tag so demos never appear on Google (the Nginx configs also send `X-Robots-Tag`).

Title, description, Open Graph tags and LocalBusiness structured data (hours, rating) are
generated from `data.js`, so SEO is ready the moment you launch.

### When a client pays

```bash
python new_demo.py --launch <slug>
```

This sets `DEMO_MODE = false` and removes the noindex tag. Then:

1. Re-upload the folder (or `--zip` it again).
2. On the Nginx wildcard, remove the `X-Robots-Tag` header for that site (block 4 in
   `deploy/nginx-wildcard.conf`), or better, move the client to their own domain.
3. Add the site to Google Search Console and to their Google Business Profile.

---

## 11. Deploy: one subdomain per business

### A) VPS with Nginx (main setup: one config serves every demo)

**1. DNS** at your registrar or Cloudflare:

| Type | Name | Value |
|---|---|---|
| A | `@` | your server IP |
| A | `www` | your server IP |
| A | `*` | your server IP |

The wildcard `*` record points every subdomain at your server. You never touch DNS again.

**2. Nginx:** copy `deploy/nginx-wildcard.conf` and replace `mydomain.com` (and `mydomain\.com`
in the regex) with your domain:

```bash
sudo cp nginx-wildcard.conf /etc/nginx/sites-available/demos.conf
sudo ln -s /etc/nginx/sites-available/demos.conf /etc/nginx/sites-enabled/
sudo mkdir -p /var/www/demos /var/www/main
sudo nginx -t && sudo systemctl reload nginx
```

It maps the subdomain to a folder automatically:

```nginx
server_name ~^(?<sub>[a-z0-9-]+)\.mydomain\.com$;
root /var/www/demos/$sub;
```

Your main site and `www` have their own exact `server_name` blocks, which always win over the
regex. The regex only allows `a-z 0-9 -`, so a subdomain can never escape `/var/www/demos`.

**3. Wildcard SSL** (needs the DNS challenge). Automatic renewal with Cloudflare:

```bash
sudo apt install certbot python3-certbot-dns-cloudflare
echo "dns_cloudflare_api_token = YOUR_TOKEN" | sudo tee /root/.cloudflare.ini   # token with Zone:DNS:Edit
sudo chmod 600 /root/.cloudflare.ini
sudo certbot certonly --dns-cloudflare --dns-cloudflare-credentials /root/.cloudflare.ini \
     -d mydomain.com -d "*.mydomain.com"
sudo systemctl reload nginx
```

Without a DNS plugin (renew by hand every 90 days):

```bash
sudo certbot certonly --manual --preferred-challenges dns -d mydomain.com -d "*.mydomain.com"
# add the TXT record it shows as _acme-challenge.mydomain.com, wait a minute, press Enter
```

**4. Deploy a demo:**

```bash
scp -r demos/seasons-salon user@SERVER_IP:/var/www/demos/
# later updates (only changed files):
rsync -av demos/seasons-salon/ user@SERVER_IP:/var/www/demos/seasons-salon/
```

`https://seasons-salon.mydomain.com` works immediately: no new port, no `.env`, no Nginx reload.

> Only future client sites with a **backend** (e.g. Django) need separate ports, `.env` files and
> `proxy_pass` (see block 5 at the bottom of the config). Static demos never do.

### B) cPanel / Hostinger shared hosting

1. `python new_demo.py --zip seasons-salon` creates `dist/seasons-salon.zip`.
2. cPanel → **Domains / Subdomains** → create `seasons-salon.mydomain.com` with the document root
   `public_html/seasons-salon` (Hostinger: *Websites → Domains → Subdomains*).
3. **File Manager** → open that folder → **Upload** the ZIP → right-click → **Extract**.
   `index.html` must sit directly in the document root (the ZIP is built that way). Delete the ZIP.
4. **SSL/TLS Status** → *Run AutoSSL* (Hostinger: *SSL* → install free SSL).
5. Open `https://seasons-salon.mydomain.com`.

### C) Netlify or Cloudflare Pages

1. **Netlify:** *Add new site → Deploy manually* → drag the `demos/seasons-salon` folder.
   **Cloudflare Pages:** *Workers & Pages → Create → Pages → Upload assets* → drag the folder or ZIP.
2. Add the custom domain `seasons-salon.mydomain.com`.
3. Add the **CNAME** record they show you (`seasons-salon` → `your-site.netlify.app` or `your-project.pages.dev`).
4. HTTPS is issued automatically within a few minutes.

---

## 12. Command reference

### new_demo.py

| Command | What it does |
|---|---|
| `python new_demo.py "Name" <category>` | Create `demos/<slug>/` (template + pre-filled `data.js` + empty `images/`) |
| `python new_demo.py "Name" <category> --slug my-slug` | Same, with a custom subdomain slug |
| `python new_demo.py --list` | List all demos with category and demo/live status |
| `python new_demo.py --meta <slug>` | Rewrite the static title / Open Graph tags from `data.js` (for WhatsApp previews) |
| `python new_demo.py --zip <slug>` | Create `dist/<slug>.zip`, ready for cPanel/Hostinger |
| `python new_demo.py --launch <slug>` | Client paid: turn off demo mode and remove noindex |
| `python new_demo.py --update <slug>` | Copy the latest template code + category photos into one demo. `data.js` and `images/` are never touched; launched demos stay launched |
| `python new_demo.py --update all` | Same for every demo |
| `python new_demo.py --help` | Show help and the category list |

### Docker

| Command | What it does |
|---|---|
| `docker compose up -d --build` | Build and start (http://localhost:8080) |
| `docker compose down` | Stop and remove the container |
| `docker compose restart` | Restart |
| `docker compose logs -f` | Follow the Nginx logs |
| `docker ps` | Check the `local-business-demos` container is running |

### Git

```bash
git pull                        # get the latest changes
git add -A                      # stage everything
git commit -m "Describe change"
git push                        # upload to GitHub
```

---

## 13. Checklist before you send a demo

- [ ] Name, phone, address, rating and review count are correct.
- [ ] Opening hours are filled in, and the "Open now / Closed now" badge is right (India time).
- [ ] Reviews are real, copied from Google. No made-up prices.
- [ ] Looks right at **360 px, 768 px and 1280 px** (browser dev tools → device toolbar), with no sideways scrolling.
- [ ] Browser console (F12) shows no errors.
- [ ] On a real phone: **Call**, **WhatsApp** and the enquiry form open the right number.
- [ ] `?pitch=1`, the theme switcher and the हिंदी toggle work.
- [ ] Your details are in the `developer:` line of `data.js` (not "Your Name").
- [ ] Ran `python new_demo.py --meta <slug>`; pasting the live link into WhatsApp shows the right title and photo.

---

## 14. Troubleshooting

| Problem | Fix |
|---|---|
| `docker: failed to connect to the docker API` | Docker Desktop is not running. Start it, wait until it says "running", then retry. |
| Port 8080 already in use | Change `"8080:80"` to e.g. `"8090:80"` in `docker-compose.yml`, then use port 8090. |
| `http://<slug>.localhost:8080` does not open | Use Chrome or Edge, or the path style `http://localhost:8080/<slug>/`. Check the folder name equals the slug. |
| `python` not found (Windows) | Use `py` instead, or reinstall Python with "Add to PATH" ticked. |
| `unknown category 'xyz'` | Use one of the [category keys](#6-categories) exactly, e.g. `real-estate`, `car-service`. |
| `theme: "auto"` shows the category colours | You opened the file directly. Use Docker, `python -m http.server` or the live site. Check `logo` is set and loads. |
| WhatsApp preview shows the old title/image | Run `python new_demo.py --meta <slug>` and re-upload. WhatsApp caches previews: test with `?v=2` appended. |
| Changes to data.js don't show | Hard refresh (`Ctrl+F5`). |
| A photo doesn't show | Path must be relative (`images/x.jpg`, no leading `/`) and the capitals must match. |
| The map shows the wrong place | Make `mapQuery` more specific: business name + area + city. |
| Subdomain shows the main site / 404 on the server | Check the DNS `*` record, that the folder name equals the subdomain, and that `index.html` is directly inside `/var/www/demos/<slug>/`. |
| Hindi toggle missing | `languages` must include `"hi"`. |
| A template fix doesn't appear in a demo | Run `python new_demo.py --update <slug>` (or `all`). |

---

## 15. Folder structure

```
local_business_demo/
├── template/                    # master template (edit here, then --update the demos)
│   ├── index.html               # page shell: meta tags, CDN links, empty containers
│   ├── css/style.css            # all styling: CSS variables, hero layouts, category touches
│   ├── js/main.js               # reads data.js and renders the page (DEMO_MODE etc. at the top)
│   ├── js/themes.js             # presets + every category's look, hero, photos, order, copy
│   └── placeholders/            # stock photos per category (hero.jpg + 1-4.jpg, each < 200 KB)
│       └── CREDITS.md           # Unsplash sources
├── demos/                       # one folder per business = one subdomain
│   ├── seasons-salon/
│   │   ├── index.html  css/  js/  placeholders/    # copied from template/ by new_demo.py
│   │   ├── data.js              # the ONLY file you edit per business
│   │   └── images/              # this business's photos
│   └── sample-<category>/       # one sample per category (dummy data) to compare designs
├── tools/theme-preview.html     # logo → colours → `theme` for data.js
├── deploy/nginx-wildcard.conf   # production Nginx config: every subdomain → its folder, SSL
├── docker/nginx.conf            # local Docker Nginx config (<slug>.localhost)
├── Dockerfile                   # Nginx image with all demos
├── docker-compose.yml           # runs it on port 8080, demos/ mounted live
├── dist/                        # ZIPs made by --zip (not committed)
├── new_demo.py                  # create / list / zip / launch / update demos
└── README.md
```

---

## 16. Developer notes: changing the template

- **Never edit the copies inside `demos/<slug>/css` or `js`.** Edit `template/`, then run
  `python new_demo.py --update all` to copy the change into every demo.
- **Add a new category:**
  1. `template/js/themes.js`: add an entry to `CATEGORIES` with `preset`, `label`, `schema`,
     `services`, `style`, `icon`, `hero`, `photos`, `order`, a `look` (palette, fonts, copy, FAQs, cta)
     and `defaultServices`. Make it look different from every existing category.
  2. Add 5 compressed photos to `template/placeholders/<folder>/` (`hero.jpg` 1600×900, `1-4.jpg` 800×600)
     and list them in `CREDITS.md`.
  3. `new_demo.py`: add the category to `CATEGORIES` and `PHOTOS`.
  4. If it uses a new button, add its label (English + Hindi) and WhatsApp message in `template/js/main.js`.
  5. Create a sample: `python new_demo.py "Sample X" <key> --slug sample-<key>` and fill its `data.js`.
- **New Google Fonts** must be added to `FONT_WEIGHTS` in `themes.js` (only weights the font really has).
- Placeholder photos are from [Unsplash](https://unsplash.com/license) (free to use).
