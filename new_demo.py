#!/usr/bin/env python3
"""
new_demo.py: create, package and launch local-business demo websites.
Standard library only (Python 3.8+).

Usage
  python new_demo.py "Business Name" category      create demos/<slug>/
  python new_demo.py "Business Name" category --slug custom-slug
  python new_demo.py --zip <slug>                   build dist/<slug>.zip for cPanel
  python new_demo.py --launch <slug>                client paid: DEMO_MODE off + remove noindex
  python new_demo.py --update <slug|all>            copy the latest template code into a demo
  python new_demo.py --meta <slug>                  refresh <title>/Open Graph tags from data.js
  python new_demo.py --list                         list demos
  python new_demo.py --serve <slug>                 preview one demo at http://localhost:<SERVE_PORT>/

Ports live in .env (DOCKER_PORT for Docker, SERVE_PORT for --serve).

Categories: see CATEGORIES below (same list as template/js/themes.js).
"""
import argparse
import functools
import html
import http.server
import os
import json
import re
import shutil
import sys
import zipfile
from datetime import date
from pathlib import Path

# ---------------------------------------------------------------------------
# YOUR SETTINGS: fill these once. They are written into every new data.js.
# ---------------------------------------------------------------------------
BASE_DOMAIN = "mydomain.com"          # demos live at https://<slug>.<BASE_DOMAIN>/
DEVELOPER = {
    "name": "Your Name",
    "phone": "+91 90000 00000",
    "whatsapp": "919000000000",       # digits only, with country code
    "portfolio": "https://mydomain.com",
}
# ---------------------------------------------------------------------------

ROOT = Path(__file__).resolve().parent
TEMPLATE = ROOT / "template"
DEMOS = ROOT / "demos"
DIST = ROOT / "dist"
TEMPLATE_ITEMS = ["index.html", "css", "js", "placeholders"]   # copied into every demo (placeholders: own category only)

# category -> (preset, label). Keep in sync with template/js/themes.js
CATEGORIES = {
    "restaurant": ("food", "Restaurant"), "cafe": ("food", "Cafe"), "bakery": ("food", "Bakery"),
    "salon": ("beauty", "Salon"), "spa": ("wellness", "Spa"), "boutique": ("beauty", "Boutique"),
    "gym": ("fitness", "Gym"),
    "clinic": ("medical", "Clinic"), "dentist": ("medical", "Dental Clinic"), "hospital": ("medical", "Hospital"),
    "school": ("education", "School"), "coaching": ("education", "Coaching Institute"),
    "hotel": ("hospitality", "Hotel"),
    "car-service": ("industrial", "Car Service Centre"), "electronics": ("industrial", "Electronics Store"),
    "hardware": ("industrial", "Hardware Store"), "garage": ("industrial", "Car Garage"),
    "bar": ("nightlife", "Bar"),
    "travel": ("travel", "Tour & Travel Agency"),
    "handyman": ("trades", "Handyman Service"),
    "jewellery": ("luxury", "Jewellery Store"),
    "real-estate": ("general", "Real Estate Agency"), "general": ("general", "Local Business"),
}

# category -> placeholder photo folder in template/placeholders/. Keep in sync with `photos` in themes.js
PHOTOS = {
    "restaurant": "food", "cafe": "cafe", "bakery": "bakery", "bar": "nightlife",
    "salon": "beauty", "spa": "wellness", "boutique": "boutique", "gym": "fitness",
    "clinic": "medical", "dentist": "dentist", "hospital": "hospital",
    "school": "education", "coaching": "coaching", "hotel": "hospitality", "travel": "travel",
    "car-service": "industrial", "garage": "garage", "electronics": "electronics", "hardware": "hardware",
    "handyman": "trades", "jewellery": "luxury", "real-estate": "real-estate", "general": "general",
}

META_START, META_END = "<!-- META:START", "<!-- META:END -->"


# ---------------------------------------------------------------------------
# Ports: one place, the .env file next to this script
# ---------------------------------------------------------------------------
def read_env():
    """Read KEY=VALUE lines from .env (environment variables win over the file)."""
    env = {}
    path = ROOT / ".env"
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip("\"'")
    env.update({k: v for k, v in os.environ.items() if k in ("DOCKER_PORT", "SERVE_PORT")})
    return env


def port(key, default):
    value = read_env().get(key, "")
    if not value:
        return default
    if not value.isdigit() or not 1 <= int(value) <= 65535:
        die("%s=%s in .env is not a valid port (1-65535)." % (key, value))
    return int(value)


def die(msg):
    print("Error: " + msg)
    sys.exit(1)


def slugify(name):
    s = name.lower().replace("&", " and ")
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    s = re.sub(r"-{2,}", "-", s)
    return s[:50].rstrip("-") or "business"


def js(value):
    """Python value -> JS literal (JSON is valid JS)."""
    return json.dumps(value, ensure_ascii=False)


def demo_dir(slug):
    d = DEMOS / slug
    if not (d / "index.html").exists():
        die("demo '%s' not found in %s (run --list to see demos)" % (slug, DEMOS))
    return d


# ---------------------------------------------------------------------------
# data.js generation
# ---------------------------------------------------------------------------
def build_data_js(name, slug, category):
    preset = CATEGORIES[category][0]
    T = "TODO"
    extra = ""
    services = '[\n    { title: "TODO", desc: "TODO", price: "TODO", image: "", icon: "" },\n    { title: "TODO", desc: "TODO", price: "", image: "", icon: "" },\n    { title: "TODO", desc: "TODO", price: "", image: "", icon: "" }\n  ]'
    menu = "[]"
    if preset == "fitness":
        services = ('[\n    { title: "Monthly", price: "TODO", desc: "", features: ["TODO", "TODO"] },\n'
                    '    { title: "Quarterly", price: "TODO", desc: "", features: ["TODO", "TODO"], popular: true },\n'
                    '    { title: "Yearly", price: "TODO", desc: "", features: ["TODO", "TODO"] }\n  ]')
    if preset in ("food", "nightlife"):
        menu = ('[\n    // { name: "Starters", icon: "bi-fire", items: [ { title: "Paneer Tikka", desc: "", price: "Rs 220", veg: true, tag: "Bestseller" } ] },\n'
                '    { name: "TODO", items: [ { title: "TODO", desc: "", price: "TODO", veg: true } ] }\n  ]')
    if preset == "medical":
        extra += ('  doctor: {                  // shown in the "Meet the Doctor" card\n'
                  '    name: "TODO", qualification: "TODO", experience: "TODO",\n'
                  '    photo: "", about: "", specialities: []\n  },\n')
    if preset == "education":
        extra += '  results: [                 // e.g. { value: "95%", label: "Board pass rate" }\n    { value: "TODO", label: "TODO" }\n  ],\n'

    return f'''/*
 * data.js: the ONLY file you edit for this business.
 * Created {date.today().isoformat()} by new_demo.py.
 *
 * Required: name, category, phone, address. Anything left as "TODO" or ""
 * is ignored: that section is hidden or falls back to category defaults.
 * Images: a relative path ("images/hero.jpg") or a full https URL.
 * Hours: "9:00-22:00", "10:00-14:00, 17:00-21:00", "closed" or "24h".
 */
window.BUSINESS = {{
  name: {js(name)},
  slug: {js(slug)},
  category: {js(category)},   // restaurant | cafe | bakery | salon | spa | gym | clinic | dentist | hospital | school | coaching | hotel | car-service | garage | electronics | hardware | boutique | jewellery | real-estate | bar | travel | handyman | general
  tagline: "{T}",
  about: "{T}",
  established: "{T}",        // year, e.g. "1998"
  owner: "{T}",
  phone: "{T}",              // REQUIRED, e.g. "+91 98765 43210"
  whatsapp: "{T}",           // digits with country code, e.g. "919876543210" (defaults to phone)
  email: "{T}",
  address: "{T}",            // REQUIRED, full address as on Google Maps
  city: "",                  // optional, guessed from the address
  mapQuery: "{T}",           // what you would type into Google Maps to find them
  hours: {{ mon: "{T}", tue: "{T}", wed: "{T}", thu: "{T}", fri: "{T}", sat: "{T}", sun: "{T}" }},
  rating: 0,                 // Google rating, e.g. 4.6
  reviewCount: 0,            // number of Google reviews
  highlights: ["{T}", "{T}", "{T}"],
  services: {services},
  menuCategories: {menu},
{extra}  heroImage: "",             // "images/hero.jpg" or https URL (empty = category placeholder)
  logo: "",                  // "images/logo.png" (empty = text logo from initials)
  gallery: [],               // ["images/1.jpg", "https://...", {{ src: "images/2.jpg", caption: "Our kitchen" }}]
  testimonials: [            // copy 2-4 real Google reviews
    {{ name: "{T}", text: "{T}", rating: 5 }}
  ],
  faqs: [],                  // [{{ q: "...", a: "..." }}] (empty = category default FAQs)
  social: {{ instagram: "", facebook: "", youtube: "" }},
  languages: ["en", "hi"],   // remove "hi" to hide the Hindi toggle
  theme: {{}},                 // {{}} = category preset, "auto" = colours from logo, or {{ primary: "#...", accent: "#..." }}
  sections: [],              // optional order, e.g. ["hero","about","services","gallery","contact"]
  developer: {{ {", ".join("%s: %s" % (k, js(v)) for k, v in DEVELOPER.items())} }}
}};
'''


# ---------------------------------------------------------------------------
# Static <head> meta (WhatsApp/Facebook link previews don't run JavaScript)
# ---------------------------------------------------------------------------
def read_field(text, key):
    m = re.search(r'^\s{2}%s:\s*(["\'])((?:\\.|(?!\1).)*)\1' % re.escape(key), text, re.M)
    if not m:
        return ""
    raw = m.group(2)
    if m.group(1) == "'":
        raw = raw.replace("\\'", "'").replace('"', '\\"')
    try:
        val = json.loads('"' + raw + '"')
    except ValueError:
        val = raw
    return "" if re.match(r"\s*TODO\b", val, re.I) else val.strip()


def guess_city(address):
    parts = [p.strip() for p in address.split(",") if p.strip()]
    if not parts:
        return ""
    last = parts[-1]
    if (re.search(r"\d{6}", last) or re.match(r"^[A-Z]{2}\b", last)) and len(parts) > 1:
        return parts[-2]
    return re.sub(r"\s*\d{6}\s*$", "", last)


def bake_meta(folder):
    data = (folder / "data.js").read_text(encoding="utf-8")
    index_path = folder / "index.html"
    page = index_path.read_text(encoding="utf-8")
    if META_START not in page or META_END not in page:
        print("  ! META markers not found in index.html, skipped meta tags")
        return
    f = {k: read_field(data, k) for k in ("name", "slug", "category", "tagline", "about", "address", "phone", "heroImage", "city")}
    preset, label = CATEGORIES.get(f["category"], CATEGORIES["general"])
    city = f["city"] or guess_city(f["address"]) or ""
    name = f["name"] or "Local Business"
    title = "%s | %s%s" % (name, label, (" in " + city) if city else "")
    desc = ". ".join(x for x in [f["tagline"], f["address"], ("Call " + f["phone"]) if f["phone"] else ""] if x)
    desc = (desc + ".")[:160] if desc else title
    base = "https://%s.%s/" % (f["slug"] or folder.name, BASE_DOMAIN)
    hero = f["heroImage"] or "placeholders/%s/hero.jpg" % PHOTOS.get(f["category"], preset)
    image = hero if hero.startswith("http") else base + hero.lstrip("./")
    e = lambda s: html.escape(s, quote=True)
    block = (
        META_START + ": baked from data.js by new_demo.py so link previews work; main.js also sets these at runtime -->\n"
        "  <title>%s</title>\n"
        '  <meta name="description" content="%s">\n'
        '  <meta property="og:type" content="website">\n'
        '  <meta property="og:title" content="%s">\n'
        '  <meta property="og:description" content="%s">\n'
        '  <meta property="og:image" content="%s">\n'
        '  <meta property="og:url" content="%s">\n'
        '  <meta name="twitter:card" content="summary_large_image">\n'
        "  " + META_END
    ) % (e(title), e(desc), e(title), e(desc), e(image), e(base))
    start = page.index(META_START)
    end = page.index(META_END) + len(META_END)
    index_path.write_text(page[:start] + block + page[end:], encoding="utf-8")


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------
def copy_template(dest, category):
    """Copy the template code into a demo. Only this category's placeholder photos are copied."""
    for item in TEMPLATE_ITEMS:
        src, dst = TEMPLATE / item, dest / item
        if item == "placeholders":
            if dst.exists():
                shutil.rmtree(dst)
            dst.mkdir()
            folder = PHOTOS.get(category, "general")
            shutil.copytree(src / folder, dst / folder)
            shutil.copy2(src / "CREDITS.md", dst / "CREDITS.md")
        elif src.is_dir():
            if dst.exists():
                shutil.rmtree(dst)
            shutil.copytree(src, dst)
        else:
            shutil.copy2(src, dst)


def cmd_create(name, category, slug=None):
    category = category.lower()
    if category not in CATEGORIES:
        die("unknown category '%s'.\nChoose one of: %s" % (category, ", ".join(CATEGORIES)))
    slug = slugify(slug or name)
    dest = DEMOS / slug
    if dest.exists():
        die("demos/%s already exists. Pick another --slug or delete the folder." % slug)
    data_js = build_data_js(name, slug, category)
    dest.mkdir(parents=True)
    copy_template(dest, category)
    (dest / "data.js").write_text(data_js, encoding="utf-8")
    (dest / "images").mkdir()
    (dest / "images" / ".gitkeep").write_text("", encoding="utf-8")
    bake_meta(dest)
    print("Created demo: %s" % dest)
    print("""
Next steps
  1. Fill in  demos/{s}/data.js  (name, phone, address, hours, rating, reviews...)
  2. Add photos to  demos/{s}/images/  (compress first at squoosh.app or tinypng.com)
  3. Preview:  open demos/{s}/index.html in a browser
     or:       python new_demo.py --serve {s}   ->  http://localhost:{sp}/
     Docker:   http://{s}.localhost:{dp}/
  4. Deploy:   scp -r demos/{s} user@server:/var/www/demos/
     or ZIP:   python new_demo.py --zip {s}
  5. Send:     https://{s}.{d}/   (add ?pitch=1 to show the pitch panel)
""".format(s=slug, d=BASE_DOMAIN, sp=port("SERVE_PORT", 8000), dp=port("DOCKER_PORT", 8080)))


def cmd_zip(slug):
    folder = demo_dir(slug)
    bake_meta(folder)
    DIST.mkdir(exist_ok=True)
    out = DIST / ("%s.zip" % slug)
    skip = {".DS_Store", "Thumbs.db", ".gitkeep"}
    count = 0
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for p in sorted(folder.rglob("*")):
            if p.is_file() and p.name not in skip:
                z.write(p, p.relative_to(folder).as_posix())   # files at the ZIP root
                count += 1
    print("Created %s  (%d files, %.1f MB)" % (out, count, out.stat().st_size / 1e6))
    print("""
Next steps (cPanel / Hostinger)
  1. Domains -> Subdomains: create  {s}.{d}  (document root e.g. public_html/{s})
  2. File Manager -> open that folder -> Upload {s}.zip -> right-click -> Extract
     (index.html must sit directly inside the document root)
  3. SSL/TLS Status -> run AutoSSL for the subdomain
  4. Open https://{s}.{d}/
""".format(s=slug, d=BASE_DOMAIN))


def set_live(folder):
    """DEMO_MODE -> false in js/main.js and drop the noindex tag. Returns True if DEMO_MODE changed."""
    main_js = folder / "js" / "main.js"
    code, n = re.subn(r"var DEMO_MODE\s*=\s*true;", "var DEMO_MODE = false;", main_js.read_text(encoding="utf-8"), count=1)
    main_js.write_text(code, encoding="utf-8")
    index = folder / "index.html"
    page = index.read_text(encoding="utf-8")
    page = re.sub(r'[ \t]*<!-- DEMO:NOINDEX[^>]*-->\r?\n', "", page)
    page = re.sub(r'[ \t]*<meta name="robots" content="noindex, nofollow">\r?\n', "", page)
    index.write_text(page, encoding="utf-8")
    return n > 0


def cmd_launch(slug):
    folder = demo_dir(slug)
    changed = set_live(folder)
    bake_meta(folder)
    print("Launched %s: DEMO_MODE is %s, noindex removed." % (slug, "now false" if changed else "already false"))
    print("""
Next steps
  - Re-upload the folder (or: python new_demo.py --zip {s})
  - If it runs on your Nginx wildcard, remove the X-Robots-Tag header for this
    site (see deploy/nginx-wildcard.conf) or move it to the client's own domain.
  - Submit the site in Google Search Console and add the URL to their Google Business Profile.
""".format(s=slug))


def is_launched(folder):
    main_js = folder / "js" / "main.js"
    return main_js.exists() and re.search(r"var DEMO_MODE\s*=\s*false;", main_js.read_text(encoding="utf-8")) is not None


def cmd_update(target):
    folders = sorted(p for p in DEMOS.iterdir() if (p / "data.js").exists()) if target == "all" else [demo_dir(target)]
    for folder in folders:
        launched = is_launched(folder)
        copy_template(folder, read_field((folder / "data.js").read_text(encoding="utf-8"), "category"))
        if launched:
            set_live(folder)
        bake_meta(folder)
        print("Updated %s%s" % (folder.name, " (kept launched state)" if launched else ""))


def cmd_list():
    if not DEMOS.exists():
        print("No demos yet.")
        return
    rows = []
    for p in sorted(DEMOS.iterdir()):
        if (p / "data.js").exists():
            data = (p / "data.js").read_text(encoding="utf-8")
            rows.append((p.name, read_field(data, "category"), "live" if is_launched(p) else "demo", read_field(data, "name")))
    if not rows:
        print("No demos yet.")
    for r in rows:
        print("  %-32s %-12s %-5s %s" % r)


def cmd_serve(slug):
    """Serve one demo folder like its subdomain root, on SERVE_PORT from .env."""
    folder = demo_dir(slug)
    p = port("SERVE_PORT", 8000)
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(folder))

    class Server(http.server.ThreadingHTTPServer):
        # On Windows, address reuse lets two servers share one port silently; refuse instead.
        allow_reuse_address = sys.platform != "win32"

    try:
        server = Server(("", p), handler)
    except OSError:
        die("port %d is already in use. Change SERVE_PORT in .env (or stop the other program)." % p)
    print("Serving %s at http://localhost:%d/   (Ctrl+C to stop)" % (slug, p))
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


def main():
    ap = argparse.ArgumentParser(description="Create and package local business demo websites.")
    ap.add_argument("name", nargs="?", help='business name, e.g. "Sharma Sweets"')
    ap.add_argument("category", nargs="?", help="one of: " + ", ".join(CATEGORIES))
    ap.add_argument("--slug", help="custom subdomain slug (default: from the name)")
    ap.add_argument("--zip", metavar="SLUG", help="create dist/<slug>.zip")
    ap.add_argument("--launch", metavar="SLUG", help="turn DEMO_MODE off and remove noindex")
    ap.add_argument("--update", metavar="SLUG", help="copy latest template code into a demo (or 'all')")
    ap.add_argument("--meta", metavar="SLUG", help="refresh static <title>/Open Graph tags from data.js")
    ap.add_argument("--list", action="store_true", help="list demos")
    ap.add_argument("--serve", metavar="SLUG", help="preview a demo at http://localhost:<SERVE_PORT from .env>/")
    a = ap.parse_args()

    if a.zip:
        cmd_zip(a.zip)
    elif a.launch:
        cmd_launch(a.launch)
    elif a.update:
        cmd_update(a.update)
    elif a.meta:
        bake_meta(demo_dir(a.meta))
        print("Meta tags refreshed for %s" % a.meta)
    elif a.list:
        cmd_list()
    elif a.serve:
        cmd_serve(a.serve)
    elif a.name and a.category:
        cmd_create(a.name, a.category, a.slug)
    else:
        ap.print_help()


if __name__ == "__main__":
    main()
