# Local Business Demo Websites

A reusable system for building **demo presentation websites** for local businesses
(found on Google Maps with good ratings but no website), hosting each one on its own
subdomain (`sharma-sweets.mydomain.com`), and sending the link to the owner as a pitch.

One command creates a folder. You fill in one data file and add photos, and you get a
complete, mobile-friendly one-page site with WhatsApp, Google Maps, live opening hours,
a gallery, reviews, FAQs, a Hindi toggle and SEO tags.

- **Static only:** HTML, CSS, Bootstrap 5, jQuery, Bootstrap Icons, AOS, ColorThief, all from CDNs.
- **No backend, no build step, no database, no ports, no `.env`.** Open `index.html` directly, or serve it
  from Nginx/Apache, cPanel, Netlify or Cloudflare Pages.
- **Every demo folder is self-contained** and uses only relative paths, so it can be the root of any subdomain.

---

## Contents

1. [Folder structure](#1-folder-structure)
2. [One-time setup](#2-one-time-setup)
3. [Create a demo (5 minutes)](#3-create-a-demo-5-minutes)
4. [Filling in data.js from your Google Maps notes](#4-filling-in-datajs-from-your-google-maps-notes)
5. [Images](#5-images)
6. [Colours, fonts and the theme preview tool](#6-colours-fonts-and-the-theme-preview-tool)
7. [Demo mode, pitch mode and going live](#7-demo-mode-pitch-mode-and-going-live)
8. [Hosting: one subdomain per business](#8-hosting-one-subdomain-per-business)
9. [new_demo.py command reference](#9-new_demopy-command-reference)
10. [Testing a demo before you send it](#10-testing-a-demo-before-you-send-it)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Folder structure

```
local_business_demo/
├── template/                    # master template: never edit per business
│   ├── index.html               # page shell (meta tags, CDN links, empty containers)
│   ├── css/style.css            # all styling, driven by CSS variables
│   ├── js/main.js               # reads data.js and renders the whole page (CONFIG block at the top)
│   ├── js/themes.js             # category presets: palettes, fonts, labels, default copy
│   └── placeholders/            # category photos, used when a business has none (each < 200 KB)
│       ├── food/ beauty/ fitness/ medical/ education/
│       └── industrial/ luxury/ hospitality/ general/    (hero.jpg + 1-4.jpg each)
├── demos/
│   ├── sample-restaurant/       # manual theme, tabbed menu, local + https images
│   ├── sample-salon/            # theme: "auto" (colours from the logo)
│   └── sample-clinic/           # default preset, no logo, no photos
│       ├── index.html  css/  js/  placeholders/     # copied from template/
│       ├── data.js              # the ONLY file you edit per business
│       └── images/              # this business's photos
├── tools/
│   └── theme-preview.html       # logo -> colour palette -> `theme` object for data.js
├── deploy/
│   └── nginx-wildcard.conf      # one Nginx config for all demos (+ SSL, redirects)
├── dist/                        # ZIP files ready to upload (created by --zip)
├── new_demo.py                  # create / zip / launch / update demos (standard library only)
└── README.md
```

`venv/` is only used for optional development tooling. `new_demo.py` needs nothing but Python 3.8+.

---

## 2. One-time setup

1. Open `new_demo.py` and fill in **your** details at the top:

   ```python
   BASE_DOMAIN = "mydomain.com"
   DEVELOPER = {
       "name": "Your Name",
       "phone": "+91 90000 00000",
       "whatsapp": "919000000000",     # digits only, with country code
       "portfolio": "https://mydomain.com",
   }
   ```

   These are written into every new `data.js`. They power the demo ribbon, the
   "Website by …" footer credit and the pitch panel's WhatsApp button.

2. *(Optional)* Change `DEFAULT_DEVELOPER` in `template/js/main.js` to the same values.
   It is only used when a `data.js` has no `developer` block.

3. Set up hosting once (see [section 8](#8-hosting-one-subdomain-per-business)).

---

## 3. Create a demo (5 minutes)

```bash
# 1. create the folder (slug = subdomain, generated from the name)
python new_demo.py "Sharma Sweets" restaurant
#    -> demos/sharma-sweets/   (use --slug to choose a different subdomain)

# 2. fill in demos/sharma-sweets/data.js   (see section 4)
# 3. add photos to demos/sharma-sweets/images/   (see section 5)

# 4. preview it
#    a) double-click demos/sharma-sweets/index.html, or
#    b) serve it exactly like a subdomain root:
cd demos/sharma-sweets
python -m http.server 8000          # open http://localhost:8000
cd ../..

# 5. deploy (pick one)
scp -r demos/sharma-sweets user@SERVER_IP:/var/www/demos/   # VPS + Nginx wildcard
python new_demo.py --zip sharma-sweets                      # cPanel / Hostinger -> dist/sharma-sweets.zip

# 6. send the owner:  https://sharma-sweets.mydomain.com/
#    or with the pitch panel:  https://sharma-sweets.mydomain.com/?pitch=1
```

Categories: `restaurant` `cafe` `bakery` `salon` `spa` `boutique` `gym` `clinic` `dentist` `hospital`
`school` `coaching` `hotel` `car-service` `electronics` `hardware` `jewellery` `real-estate` `general`.

---

## 4. Filling in data.js from your Google Maps notes

Only **`name`, `category`, `phone` and `address`** are required. Anything still marked
`"TODO"` or left empty is ignored. The section is hidden or falls back to category defaults,
so a half-filled demo still looks complete (try opening a fresh demo to see).

| Field | Where to get it on Google Maps | Notes |
|---|---|---|
| `name` | Business title | |
| `category` | Category under the title | One of the categories above |
| `tagline` | Their signboard, or the "From the business" text | One short line. Default: a category line |
| `about` | Description, reviews and photos | 2–3 sentences. Default: category text |
| `established` | "Opened in…", signboard, reviews | Year. Shows "Since 1998" and the years counter |
| `owner` | Reviews ("the owner Mr. Sharma…") | For clinics, use `doctor` instead |
| `phone` | Phone row | e.g. `"+91 98765 43210"` |
| `whatsapp` | Usually the same mobile number | Digits with country code `"919876543210"`. Defaults to `phone` |
| `address` | Address row | City and PIN are read from it automatically (or set `city`) |
| `mapQuery` | What you typed to find them | Used for the map embed, "Directions" and "Read reviews" links |
| `hours` | Hours table | `"9:00-22:00"`, `"10:00-14:00, 17:00-21:00"`, `"18:00-02:00"` (overnight), `"closed"`, `"24h"` |
| `rating`, `reviewCount` | Stars and number of reviews | Shown in the hero badge, counters, review summary and JSON-LD |
| `highlights` | "About" tab (Delivery, Parking, Pure veg…) | Icons are picked automatically from the words |
| `services` | Menu photos, "Services" or "Products" tab | `{ title, desc, price, image, icon }`. Gyms: add `features: []` and `popular: true` for plan cards |
| `menuCategories` | Menu photos (restaurants, cafés, bakeries) | Tabbed menu. `{ name, icon, items: [{ title, desc, price, veg, tag }] }` |
| `gallery` | Photos tab | Paths, https URLs, or `{ src, caption }` |
| `testimonials` | Copy 2–4 of their best Google reviews | `{ name, text, rating }` |
| `faqs` | Q&A section, or common review questions | Default: category FAQs |
| `social` | Website/social links on the profile | `instagram`, `facebook`, `youtube` (also `twitter`, `linkedin`) |
| `doctor` | (clinics) Doctor's name and qualification | Shows the "Meet the Doctor" card with an appointment button |
| `results` | (coaching/school) Toppers, pass rates | `[{ value: "95%", label: "Board pass rate" }]` |
| `languages` | | `["en", "hi"]` shows the हिंदी toggle. `["en"]` hides it |
| `theme` | | See [section 6](#6-colours-fonts-and-the-theme-preview-tool) |
| `sections` | | Optional order. Leave out a key to hide that section (below) |
| `happyCustomers` | | Optional. Otherwise estimated as about reviewCount × 10 |

**Section keys** (default order):
`hero, highlights, about, services, why, doctor, results, gallery, testimonials, cta, hours, faq, contact`.
Example: `sections: ["hero", "about", "services", "gallery", "testimonials", "contact"]`.

The services heading changes by category: *Our Menu, Our Services, Treatments, Membership Plans,
Departments, Courses, Rooms & Stays, Our Products, Our Collections, Properties*.

---

## 5. Images

- Any image field accepts **a relative path** (`"images/hero.jpg"`) **or a full https URL**
  (Unsplash, Pexels, the business's own Instagram CDN link, …).
- **Compress every photo before adding it:** use [squoosh.app](https://squoosh.app) or
  [tinypng.com](https://tinypng.com). Aim for: hero ≈ 1600×900 under 200 KB, others ≈ 800×600 under 100 KB.
  This is the biggest factor in how fast the site loads on a phone.
- If an image is missing or fails to load, it automatically falls back to the category
  placeholder, then to a brand-coloured gradient. A demo never shows a broken image.
- Empty `heroImage`, `gallery` or service images use the category placeholders in `placeholders/`.
- The logo can be PNG/JPG/SVG. With no logo, a text logo is generated from the initials.
- All images are lazy-loaded (except the hero) and get descriptive `alt` text
  (`"Sharma Sweets, restaurant in Agra: Fresh samosas"`).

---

## 6. Colours, fonts and the theme preview tool

Every category maps to a **preset** in `template/js/themes.js`. Presets differ in layout
details as well as colour:

| Preset | Categories | Look |
|---|---|---|
| `food` | restaurant, cafe, bakery | warm red, saffron, cream · Playfair Display · pill buttons · tabbed menu |
| `beauty` | salon, spa, boutique | rose, nude, gold · Cormorant Garamond serif · airy, italic kickers |
| `fitness` | gym | black + neon lime/orange · Oswald condensed uppercase · plan cards |
| `medical` | clinic, dentist, hospital | blue, teal, white · Poppins · doctor card + appointment CTA |
| `education` | school, coaching | navy + yellow · Montserrat · highlighter headings · results section |
| `industrial` | car-service, hardware, electronics | steel grey + red · Rajdhani uppercase · dark navbar, stripes |
| `luxury` | jewellery | maroon, gold, ivory · Cinzel · thin gold lines, wide tracking |
| `hospitality` | hotel | warm wood + sea teal · DM Serif Display |
| `general` | real-estate, general | neutral indigo · Plus Jakarta Sans |

**Three ways to theme a business** (`theme` in data.js):

```js
theme: {},          // 1. category preset as-is

theme: "auto",      // 2. primary + accent extracted from the logo with ColorThief
                    //    (falls back to the preset if there is no logo or extraction fails)

theme: {            // 3. manual: any subset of these overrides the preset
  primary: "#A3154A",
  primaryDark: "#7A0F37",       // optional: generated by darkening primary
  accent: "#F2A900",
  background: "#FFF9F0",
  surface: "#FFFFFF",
  text: "#2D1B14",
  headingFont: "Yeseva One",    // any Google Font (loaded automatically)
  bodyFont: "Nunito",
  buttonStyle: "rounded",       // "rounded" | "pill" | "square"
  borderRadius: "12px"
}
```

Everything is applied as CSS variables on `:root`. Button text automatically turns white or
dark for contrast, and links and icons are darkened or lightened when they would be hard to read.

> **Auto mode needs http(s).** Browsers block reading image pixels from pages opened
> directly from disk (`file://`), so `"auto"` uses the preset there and logs an info message.
> It works on `python -m http.server` and on every real host.

### tools/theme-preview.html

Open `tools/theme-preview.html` in a browser (double-click works):

1. Drop the business logo in. Its colours are extracted and the best primary + accent are picked.
2. Choose the category preset to start from.
3. Adjust any colour with the pickers, or click an extracted swatch to assign it.
4. Pick heading/body fonts, button style and card radius.
5. Watch the live preview: navbar, hero, buttons, cards and CTA band, using the real template CSS,
   with contrast checks.
6. Click **Copy theme** and paste it over the `theme:` line in the demo's `data.js`.

---

## 7. Demo mode, pitch mode and going live

While `DEMO_MODE = true` (top of `js/main.js`), every demo has:

- a slim, dismissible **top ribbon**: *"This is a demo website concept prepared for [Business] by
  [You]. Like it? Let's make it yours."* with a WhatsApp button that messages you
  *"Hi, I saw the demo website for [Business]"*;
- a **theme switcher** (palette button, bottom-left): "Brand colors" + 2 alternative palettes,
  so the owner can see options. Turn it off with `SHOW_THEME_SWITCHER = false`;
- **pitch mode**: add `?pitch=1` to the link to show a floating panel listing what the owner gets
  (mobile-friendly site, WhatsApp & Maps, fast loading, own domain, Google visibility, basic SEO);
- `<meta name="robots" content="noindex, nofollow">` so concept pages never appear on Google
  (the Nginx config also sends an `X-Robots-Tag` header).

Title, description, Open Graph tags and **LocalBusiness JSON-LD** (with opening hours and rating)
are generated from data.js and stay in place while noindex is on, so they are ready at launch.
`new_demo.py` also writes the title and Open Graph tags into the HTML itself, because WhatsApp
and Facebook link previews don't run JavaScript.

### When a client pays

```bash
python new_demo.py --launch sharma-sweets
```

This sets `DEMO_MODE = false` **and** removes the noindex meta tag in one go. The ribbon,
theme switcher and pitch mode disappear. (Setting `DEMO_MODE = false` by hand also hides them
and removes the tag at runtime, but `--launch` removes it from the HTML, which is what Google sees first.)

Then:
1. Re-upload the folder (or `--zip` it again).
2. On the Nginx wildcard, remove the `X-Robots-Tag` header for that site (block 4 in
   `deploy/nginx-wildcard.conf`), or better, move the client to their own domain.
3. Add the site to Google Search Console and to their Google Business Profile.

---

## 8. Hosting: one subdomain per business

### A) VPS with Nginx: one config for all demos (main setup)

**1. DNS** (at your domain registrar or Cloudflare):

| Type | Name | Value |
|---|---|---|
| A | `@` | your server IP |
| A | `www` | your server IP |
| A | `*` | your server IP |

The wildcard `*` record means *every* subdomain points at your server. You never touch DNS again.

**2. Nginx**: copy `deploy/nginx-wildcard.conf`, replace `mydomain.com` (and `mydomain\.com` in
the regex) with your domain:

```bash
sudo cp nginx-wildcard.conf /etc/nginx/sites-available/demos.conf
sudo ln -s /etc/nginx/sites-available/demos.conf /etc/nginx/sites-enabled/
sudo mkdir -p /var/www/demos /var/www/main
sudo nginx -t && sudo systemctl reload nginx
```

The core of it maps the subdomain to a folder automatically:

```nginx
server_name ~^(?<sub>[a-z0-9-]+)\.mydomain\.com$;
root /var/www/demos/$sub;
```

**Important:** your main site and `www` have their **own explicit `server` blocks** in the file.
Exact `server_name` matches always win over the regex, so `mydomain.com` and `www.mydomain.com`
are never caught by the wildcard. The regex only allows `a-z 0-9 -`, so a subdomain can never
escape `/var/www/demos`.

**3. Wildcard SSL** for `mydomain.com` + `*.mydomain.com` with Certbot. Wildcards **require the
DNS challenge**.

*Recommended: automatic renewal with your DNS provider's plugin (Cloudflare shown):*

```bash
sudo apt install certbot python3-certbot-dns-cloudflare
# API token with Zone:DNS:Edit permission for your domain
echo "dns_cloudflare_api_token = YOUR_TOKEN" | sudo tee /root/.cloudflare.ini
sudo chmod 600 /root/.cloudflare.ini
sudo certbot certonly --dns-cloudflare --dns-cloudflare-credentials /root/.cloudflare.ini \
     -d mydomain.com -d "*.mydomain.com"
sudo systemctl reload nginx
```

*Without a plugin (manual TXT record; renew by hand every 90 days):*

```bash
sudo certbot certonly --manual --preferred-challenges dns -d mydomain.com -d "*.mydomain.com"
# Certbot shows a TXT value -> add it as _acme-challenge.mydomain.com in DNS -> wait a minute -> Enter
```

Both store the certificate in `/etc/letsencrypt/live/mydomain.com/`, which is the path the config
already uses. The config includes the HTTPS server blocks and an **HTTP → HTTPS redirect** for every
subdomain.

**4. Deploy a new demo**: that's it:

```bash
scp -r demos/sharma-sweets user@SERVER_IP:/var/www/demos/
# later updates (only changed files):
rsync -av demos/sharma-sweets/ user@SERVER_IP:/var/www/demos/sharma-sweets/
```

`https://sharma-sweets.mydomain.com` works immediately. **No new port, no `.env`, no Nginx reload.**

> Only future client sites that need a **backend** (e.g. Django) use separate ports, `.env`
> files and `proxy_pass` (see block 5 at the bottom of the config). Static demos never do.

### B) cPanel / Hostinger shared hosting

1. `python new_demo.py --zip sharma-sweets` creates `dist/sharma-sweets.zip`.
2. cPanel → **Domains / Subdomains** → create `sharma-sweets.mydomain.com`.
   Set the **document root** to e.g. `public_html/sharma-sweets`.
   (Hostinger: *Websites → Domains → Subdomains*.)
3. **File Manager** → open that folder → **Upload** the ZIP → right-click → **Extract**.
   `index.html` must sit directly in the document root (the ZIP is built that way).
   Delete the ZIP afterwards.
4. **SSL/TLS Status** → *Run AutoSSL* (Hostinger: *SSL* → install free SSL) for the subdomain.
5. Open `https://sharma-sweets.mydomain.com`.

### C) Netlify or Cloudflare Pages

1. **Netlify:** app.netlify.com → *Add new site → Deploy manually* → drag the
   `demos/sharma-sweets` **folder** onto the page.
   **Cloudflare Pages:** *Workers & Pages → Create → Pages → Upload assets* → name the project →
   drag the folder (or the ZIP).
2. Add a custom domain: *Domain management → Add domain* (Netlify) or *Custom domains* (Pages)
   → `sharma-sweets.mydomain.com`.
3. In your DNS add the **CNAME** record they show you:
   `sharma-sweets` → `your-site.netlify.app` (or `your-project.pages.dev`).
4. HTTPS is issued automatically within a few minutes.

---

## 9. new_demo.py command reference

| Command | What it does |
|---|---|
| `python new_demo.py "Name" category` | Create `demos/<slug>/` (template copy + pre-filled data.js + empty images/) |
| `python new_demo.py "Name" category --slug my-slug` | Same, with a custom subdomain slug |
| `python new_demo.py --zip <slug>` | Create `dist/<slug>.zip` with the files at the ZIP root (cPanel-ready) |
| `python new_demo.py --launch <slug>` | Client paid: `DEMO_MODE = false` + remove the noindex tag |
| `python new_demo.py --update <slug>` / `--update all` | Copy the latest `template/` code (index.html, css, js, placeholders) into existing demos. `data.js` and `images/` are untouched; launched demos stay launched |
| `python new_demo.py --meta <slug>` | Rewrite the static `<title>` / Open Graph tags from data.js (also done by create, `--zip`, `--launch`, `--update`) |
| `python new_demo.py --list` | List demos with category and demo/live status |

Improve the template once, run `--update all`, re-deploy, and every demo gets the fix.

---

## 10. Testing a demo before you send it

- Open `index.html` directly **and** run `python -m http.server` from **inside the demo folder**.
  The second one behaves exactly like the subdomain root.
- Check it at **360 px, 768 px and 1280 px** (browser dev tools → device toolbar). There should be
  no sideways scrolling.
- Open the browser console. It should show no errors.
- Tap **Call**, **WhatsApp** and the enquiry form on a real phone. The form opens WhatsApp with a
  pre-filled message to the business.
- Check that the "Open now / Closed now" badge is right. It always uses India time (Asia/Kolkata),
  wherever the visitor is.
- Paste the live link into WhatsApp to check the link preview (title + hero image).
- Try `?pitch=1`, the theme switcher and the हिंदी toggle.

---

## 11. Troubleshooting

| Problem | Fix |
|---|---|
| `theme: "auto"` shows the preset colours | You opened the file directly. Use `python -m http.server` or the live site. Also check that `logo` is set and loads. For https logos, the host must allow CORS (most CDNs do); otherwise download the logo into `images/`. |
| WhatsApp link preview shows the old title/image | Run `python new_demo.py --meta <slug>` and re-upload. WhatsApp caches previews, so test with `?v=2` appended. |
| Changes to data.js don't show on the server | Hard refresh (Ctrl+F5). The Nginx config already marks `data.js` as no-cache. |
| A photo doesn't show | Check the path is relative (`images/x.jpg`, no leading `/`) and the file name's capitalisation matches (Linux servers are case-sensitive). |
| The map shows the wrong place | Make `mapQuery` more specific: the business name + area + city, exactly as you'd search it. |
| Subdomain shows the main site / 404 | Check the DNS `*` record, that the folder name equals the subdomain, and `index.html` is directly inside `/var/www/demos/<slug>/`. |
| Hindi toggle missing | `languages` must include `"hi"`. |

---

Placeholder photos are from [Unsplash](https://unsplash.com/license) (free to use). See
`template/placeholders/CREDITS.md`.
