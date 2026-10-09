# Final Prompt for Claude Code: Reusable Demo Website System for Local Businesses

Copy everything below this line into Claude Code.

---

You are a senior front-end developer and web designer. I run a small web design service. I find local businesses on Google Maps that have good ratings but no website, build a **demo presentation website** for each one, host it on its own subdomain of my domain (for example `sharma-sweets.mydomain.com`), and send the link to the owner to pitch my services.

Build me a **reusable demo website system**. I should only need to create a folder with one command, fill in one data file, add images, and upload the folder to get a complete, beautiful, mobile-friendly one-page website for that business.

## 1. Tech stack (strict)

- HTML5, CSS3, **Bootstrap 5**, JavaScript, **jQuery**
- Bootstrap Icons, Google Fonts, AOS (animate on scroll) or simple jQuery animations, ColorThief (for logo color extraction)
- All libraries from CDN (cdnjs / jsdelivr)
- **No backend, no database, no build tools, no frameworks, no ports, no .env files.** Every demo is a static site. It must work by opening `index.html` directly and when served by Nginx/Apache, cPanel, Netlify or Cloudflare Pages.
- One helper Python script using only the standard library (section 9).

## 2. Folder structure

```
local-business-demos/
├── template/                  # master template, never edited per business
│   ├── index.html
│   ├── css/style.css
│   ├── js/main.js             # reads data.js and renders the whole page
│   ├── js/themes.js           # category presets
│   └── placeholders/          # placeholder images per category
├── demos/
│   ├── sample-restaurant/     # self-contained demo, uploaded as a subdomain root
│   │   ├── index.html
│   │   ├── css/  js/  placeholders/   # copied from template
│   │   ├── data.js            # ONLY file I edit per business
│   │   └── images/            # business images
│   ├── sample-salon/
│   └── sample-clinic/
├── tools/
│   └── theme-preview.html     # logo → color palette helper
├── deploy/
│   └── nginx-wildcard.conf    # example Nginx config
├── dist/                      # ZIP files ready to upload
├── new_demo.py
└── README.md
```

**Every demo folder must be fully self-contained** (all CSS, JS and placeholders copied inside) and use **only relative paths** (never paths starting with `/`), so the folder can be uploaded as the root of its own subdomain.

## 3. The data file (`data.js`)

Use `window.BUSINESS = { ... }` (not a JSON fetch, so it works when opened from the file system).

```js
window.BUSINESS = {
  name: "Sharma Sweets & Restaurant",
  slug: "sharma-sweets",
  category: "restaurant",   // restaurant | cafe | bakery | salon | spa | gym | clinic | dentist | hospital | school | coaching | hotel | car-service | electronics | hardware | boutique | jewellery | real-estate | general
  tagline: "Pure veg sweets and meals since 1998",
  about: "Short paragraph about the business...",
  established: "1998",
  owner: "",
  phone: "+91 98XXXXXXXX",
  whatsapp: "9198XXXXXXXX",
  email: "",
  address: "Shop 12, Main Market, Kamla Nagar, Agra, UP 282005",
  mapQuery: "Sharma Sweets Kamla Nagar Agra",
  hours: { mon: "9:00-22:00", tue: "9:00-22:00", wed: "9:00-22:00", thu: "9:00-22:00", fri: "9:00-22:00", sat: "9:00-23:00", sun: "closed" },
  rating: 4.6,
  reviewCount: 312,
  highlights: ["Pure Veg", "Home Delivery", "Family Seating", "Parking"],
  services: [ { title: "Thali", desc: "...", price: "₹180", image: "", icon: "" } ],
  menuCategories: [],
  heroImage: "",            // "images/hero.jpg" or a full https URL
  logo: "",                 // "images/logo.png" or a full https URL
  gallery: [],              // mix of relative paths and https URLs
  testimonials: [ { name: "Customer", text: "...", rating: 5 } ],
  faqs: [ { q: "...", a: "..." } ],
  social: { instagram: "", facebook: "", youtube: "" },
  languages: ["en", "hi"],
  theme: {},                // see section 6; can also be the string "auto"
  sections: [],             // optional custom order / hide sections
  developer: { name: "[YOUR NAME]", phone: "[YOUR PHONE]", whatsapp: "[YOUR WHATSAPP]", portfolio: "[YOUR URL]" }
};
```

Only `name`, `category`, `phone` and `address` are required. When optional fields are empty, the page must still look complete (hide the section or use category defaults).

## 4. Website sections (one-page, presentation style)

1. **Sticky navbar:** logo (or a generated text logo from initials), section links, "Call Now" button
2. **Hero:** full-width image with overlay, name, tagline, rating badge ("4.6 ★ from 312 Google reviews"), CTAs "Call Now" and "WhatsApp Us"
3. **Highlights strip:** icon badges
4. **About:** story, established year, animated counters (years in business, rating, happy customers)
5. **Services / Menu / Treatments / Plans:** cards or a tabbed menu; the label changes by category (e.g. "Our Menu", "Our Services", "Treatments", "Membership Plans", "Courses")
6. **Why Choose Us:** 4 points from highlights plus category defaults
7. **Gallery:** responsive grid with a lightbox (Bootstrap modal + jQuery)
8. **Testimonials:** carousel with stars
9. **Opening hours:** weekly table with a live **"Open now / Closed now"** badge computed in JS using Asia/Kolkata time, with today highlighted
10. **FAQ:** accordion (category default FAQs if none given)
11. **Contact:** address, click-to-call, WhatsApp, email, Google Maps embed (`https://www.google.com/maps?q=<mapQuery>&output=embed`), and an enquiry form that opens WhatsApp with a pre-filled message
12. **Footer:** name, quick links, social icons, copyright, "Website by [Developer]" credit
13. **Floating buttons:** WhatsApp, Call (mobile), back-to-top
14. **Hindi toggle** (if `languages` includes "hi"): translate key labels and CTAs (navbar, section headings, buttons) using a small dictionary

## 5. Demo / pitch features

- Slim, dismissible **top ribbon**: "This is a demo website concept prepared for [Business Name] by [Developer Name]. Like it? Let's make it yours." with a WhatsApp button that messages me with: "Hi, I saw the demo website for [Business Name]".
- `<meta name="robots" content="noindex, nofollow">` on every demo, so concept pages don't appear on Google before the owner approves.
- **Theme switcher** (small button, bottom-left). The first option is always "Brand colors", followed by 2 alternative palettes. A flag `SHOW_THEME_SWITCHER` controls it.
- **Pitch mode** (`?pitch=1` in the URL): a floating panel listing what the owner gets (mobile-friendly site, WhatsApp and Maps integration, fast loading, own domain, Google visibility, basic SEO).
- One config block at the top of `main.js` (`DEMO_MODE = true`) that, when set to false, removes the ribbon, the theme switcher, pitch mode and `noindex` in one go, for when a client pays.

## 6. Theme and color customization

**Category presets (`themes.js`):** each preset sets a palette, heading/body fonts, icons, section labels, default "Why Choose Us" points, default FAQs and placeholder images. Presets must look clearly different, not just a color swap:
- Restaurant / cafe / bakery: warm reds, oranges, cream; menu tabs
- Salon / spa / boutique: soft rose, nude, gold; elegant serif headings
- Gym: black with neon green or orange; bold condensed headings; plan cards
- Clinic / dentist / hospital: blue, teal, white; doctor card and appointment CTA
- Coaching / school: navy and yellow; courses and results section
- Car service / hardware / electronics: dark grey with red or blue; industrial feel
- Jewellery: maroon, gold, ivory; luxury feel
- General: neutral modern palette

**Per-business override in data.js:** the `theme` object supports `primary`, `primaryDark`, `accent`, `background`, `surface`, `text`, `headingFont`, `bodyFont`, `buttonStyle` ("rounded" | "pill" | "square") and `borderRadius`. All are optional and override the preset. Apply everything through CSS variables on `:root`.
- If `primaryDark` or hover shades are missing, generate them by darkening the primary color.
- Automatically pick white or dark button text based on contrast, so text is always readable.
- Load the chosen Google Fonts dynamically.

**Auto mode:** `theme: "auto"` extracts the dominant colors from the logo with ColorThief and uses them as primary and accent. If there is no logo or extraction fails, it falls back to the category preset.

**`tools/theme-preview.html`:** I upload a logo, see the extracted colors, adjust them with color pickers and font dropdowns, preview the navbar, buttons, cards and hero live, then click "Copy theme" to get the `theme` object to paste into data.js.

## 7. Images

- Every image field accepts **either a relative path** (`images/hero.jpg`) **or a full https URL** (e.g. Unsplash/Pexels).
- If any image fails to load, fall back to the category placeholder automatically (`onerror` handler).
- Placeholders: royalty-free category images stored locally in `template/placeholders/` (download from Unsplash/Pexels during setup, or generate tasteful gradient placeholders if offline), each under 200 KB.
- All images lazy-loaded with meaningful `alt` text built from the business name and category.
- README must recommend compressing business photos with squoosh.app or tinypng.com before adding them.

## 8. Quality and SEO

- Mobile-first; check at 360px, 768px and 1280px widths; no horizontal scroll
- Deferred scripts, compressed images, minimal custom CSS, no console errors
- Title, meta description, Open Graph tags and **LocalBusiness JSON-LD** generated from data.js (kept in place while `noindex` is on, so they're ready at launch)
- Accessible: contrast, focus states, aria labels on icon buttons
- Subtle animations that stay smooth on cheap phones

## 9. `new_demo.py`

`python new_demo.py "Business Name" category` should:
1. Create `demos/<slug>/` by copying the template, CSS, JS and placeholders
2. Create a pre-filled `data.js` with the name, slug and category, and every other field marked `TODO`
3. Create an empty `images/` folder

`python new_demo.py --zip <slug>` should create `dist/<slug>.zip`, ready to upload through cPanel File Manager.

Print the folder path and next steps after each command.

## 10. Hosting: one subdomain per business

Write a clear `README.md` with step-by-step guides for each option.

**A) VPS with Nginx (my main setup), one config for all demos:**
- DNS: wildcard A record `*` → server IP
- `deploy/nginx-wildcard.conf` that maps the subdomain to a folder automatically:
  ```nginx
  server {
      listen 80;
      server_name ~^(?<sub>[a-z0-9-]+)\.mydomain\.com$;
      root /var/www/demos/$sub;
      index index.html;
      location / { try_files $uri $uri/ =404; }
  }
  ```
- Explain that the main site and `www` must have their own explicit server blocks so they aren't caught by the wildcard.
- Wildcard SSL for `*.mydomain.com` with Certbot using the DNS challenge, plus the HTTPS server block and an HTTP → HTTPS redirect.
- Deploying a new demo is just: `scp -r demos/<slug> user@server:/var/www/demos/`. No new port, no .env, no Nginx reload.
- Note that only future client sites that need a backend (Django) would use separate ports, `.env` files and `proxy_pass`.

**B) cPanel / Hostinger shared hosting:** create a subdomain → set its document root → upload and extract the ZIP → enable free SSL.

**C) Netlify or Cloudflare Pages:** create a project per demo by drag-and-drop → add a custom subdomain → add the CNAME record in DNS.

The README must also cover: how to create a demo, which data.js fields to fill from my Google Maps notes, using `theme-preview.html`, and how to switch `DEMO_MODE` off when a client pays.

## 11. Deliverables

1. Template, `themes.js` with all category presets, and `main.js`
2. Three complete sample demos with dummy data: a restaurant (manual theme), a salon (`theme: "auto"` with a sample logo) and a clinic (default preset)
3. `tools/theme-preview.html`
4. `new_demo.py` with ZIP support
5. `deploy/nginx-wildcard.conf`
6. `README.md`

## 12. How to work

1. First show me a short plan (structure, sections, presets, theme system) and wait for my "go".
2. Build in this order: template and rendering → themes and color system → three sample demos → theme-preview tool → script → deploy config and README.
3. Verify each sample demo works when opened directly as a file and when served with `python -m http.server`, from inside its own folder (to confirm relative paths work as a subdomain root). Fix all layout and console issues.
4. At the end, give me exact steps to create, fill in and deploy my first real business demo on `<slug>.mydomain.com`.
