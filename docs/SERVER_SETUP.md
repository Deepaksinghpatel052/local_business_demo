# Server setup, step by step

This guide takes you from an empty Ubuntu server to a running Devnixplus site builder.
Follow the steps in order. Every command is meant to be copied and pasted.

**How it works on the server**

```
Visitor ──https──> Nginx (already on your server)
                    ├── app.devnixplus.com   ──> Docker container (Django + Gunicorn) on 127.0.0.1:9002
                    │                            + /static/  /media/  /_shared/  served straight from folders
                    └── demo.devnixplus.com  ──> published websites, straight from the media folder
                        customer-domain.com  ──> one published website, straight from the media folder

Docker container  ──reads/writes──> /srv/local_business_demo/media   (MEDIA_DIR: every client file)
                  ──connects to──>  PostgreSQL                        (DATABASE_URL)
```

- There is **no Nginx inside Docker**. Your server's Nginx does all the web serving.
- Client files (uploaded photos, published websites) live in a **normal folder on the server**,
  mounted into the container. Restarting, rebuilding or deleting the container never deletes them.
- Published websites are plain files, so they keep working even when the container is stopped.

---

## 0. Before you start: what you need

| Item | Example used in this guide | Where you will use it |
|---|---|---|
| A server with Ubuntu 22.04 / 24.04 and `sudo` | `SERVER_IP` = your server's public IP | everywhere |
| Nginx already installed on the server | `nginx -v` | step 7 |
| A domain you control | `devnixplus.com` | step 1 |
| Address for the builder | `app.devnixplus.com` | DNS, `.env`, Nginx, certificates |
| Address for the websites | `demo.devnixplus.com` | DNS, `.env`, Nginx, certificates |
| PostgreSQL database (already created) | the `DATABASE_URL` in your `.env` | step 4 |
| The `.env.server` file from your computer | project folder on your PC | step 4 |
| Project folder on the server | `/srv/local_business_demo` | everywhere |

**Using other names?** Everywhere this guide shows `app.devnixplus.com`, `demo.devnixplus.com` or
`/srv/local_business_demo`, type your own instead. The table in [step 11](#11-where-every-value-lives)
lists every file and line that holds them.

---

## 1. DNS: point your domain at the server

Log in to the website where you bought the domain (GoDaddy, Hostinger, Cloudflare…) and open its
**DNS settings**. Add these records:

| Type | Name / Host | Value | Why |
|---|---|---|---|
| A | `app` | `SERVER_IP` | the site builder: `app.devnixplus.com` |
| A | `demo` | `SERVER_IP` | the published websites: `demo.devnixplus.com/<name>/` |

Wait 5–30 minutes, then check from your computer or the server:

```bash
dig +short app.devnixplus.com      # must print SERVER_IP
dig +short demo.devnixplus.com     # must print SERVER_IP
```

(On Windows without `dig`: `nslookup app.devnixplus.com`.) Don't continue until both show your server's IP:
the HTTPS certificates in step 7 need it.

---

## 2. Install Docker and the other tools

Log in to the server (`ssh user@SERVER_IP`) and run:

```bash
# Docker Engine + the Compose plugin (official script from docker.com)
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable --now docker
docker --version && docker compose version      # both must print a version

# git, certbot (HTTPS certificates) and the PostgreSQL client (for backups)
sudo apt update
sudo apt install -y git certbot postgresql-client

# India time for the cron jobs and logs
sudo timedatectl set-timezone Asia/Kolkata

# folders for certificate checks and backups
sudo mkdir -p /var/www/certbot /var/backups/devnix
```

Optional: run `docker` without `sudo`: `sudo usermod -aG docker $USER`, then log out and in again.
This guide always writes `sudo docker …`, which works either way.

**Firewall** (only if you use `ufw`): allow the web ports. Port 9002 does **not** need to be opened;
only Nginx on the server itself talks to it.

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'        # ports 80 and 443
sudo ufw status
```

---

## 3. Get the code

```bash
sudo git clone -b devnixplus_site_builder_prompt \
     https://github.com/Deepaksinghpatel052/local_business_demo.git /srv/local_business_demo
cd /srv/local_business_demo
ls          # you should see builder/ demos/ deploy/ docker/ docs/ docker-compose.yml …
```

- `-b devnixplus_site_builder_prompt` is the branch with the site builder. Once it is merged into `main`
  you can leave `-b …` out.
- If the GitHub repository is private, git asks for a username and a **personal access token**
  (GitHub → Settings → Developer settings → Personal access tokens) instead of your password.

---

## 4. Settings: the `.env` file

All settings live in one file: `/srv/local_business_demo/.env`. You already have a server version on
your computer: **`.env.server`** in the project folder. It is never on GitHub because it holds your
database password and secret key, so copy it yourself.

**On your computer** (in the project folder; Git Bash or PowerShell):

```bash
scp .env.server user@SERVER_IP:/tmp/.env
```

**On the server:**

```bash
sudo mv /tmp/.env /srv/local_business_demo/.env
sudo chmod 600 /srv/local_business_demo/.env       # only root can read it
sudo nano /srv/local_business_demo/.env            # check the values below; Ctrl+O Enter saves, Ctrl+X quits
```

(No `.env.server`? `sudo cp .env.example .env` and fill it in with the values below. Make a new secret key
with `python3 -c "import secrets; print(secrets.token_urlsafe(50))"`.)

Check these lines. Write each value **without spaces around `=`**, and put comments on their own line
(`KEY=value # note` would put the note inside the value).

### 4a. Your domain and allowed hosts

```ini
# the builder's address (no slash at the end)
APP_URL=https://app.devnixplus.com
# the hostnames Django answers to (comma separated). A request for any other name gets "400 Bad Request".
ALLOWED_HOSTS=app.devnixplus.com
# the same addresses with https://, so forms (login, signup, payments) are accepted
CSRF_TRUSTED_ORIGINS=https://app.devnixplus.com
# where the published websites are opened: <DEMO_BASE_URL>/<name>/
DEMO_URL_STYLE=path
DEMO_BASE_URL=https://demo.devnixplus.com
DEMO_DOMAIN=demo.devnixplus.com
```

- More than one name for the builder (e.g. also `www.app…`)? Add it to both lists:
  `ALLOWED_HOSTS=app.devnixplus.com,www.app.devnixplus.com` and
  `CSRF_TRUSTED_ORIGINS=https://app.devnixplus.com,https://www.app.devnixplus.com`.
- `ALLOWED_HOSTS` only lists the **builder's** names. The websites on `demo.devnixplus.com` and on
  customer domains are served by Nginx alone and never reach Django.

### 4b. Server mode

```ini
DEBUG=False
SECRET_KEY=<a long random value, different from your computer's>
SECURE_COOKIES=True
SECURE_SSL_REDIRECT=False
SECURE_HSTS_SECONDS=31536000
# Nginx serves the files on the server, so Django doesn't
SERVE_FILES=False
APP_DOCKER_PORT=9002
GUNICORN_WORKERS=3
CACHE_URL=filecache:///app/var/cache
```

- `SECURE_SSL_REDIRECT=False` is right: Nginx already redirects http to https.
- `GUNICORN_WORKERS`: 2 × CPU cores + 1 is a good start (`nproc` shows the cores). 3 is fine for 1 core.

### 4c. The database

```ini
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DATABASE
```

Your data is already in this PostgreSQL database, so nothing has to be imported. The only question is
which **HOST** the container can reach:

| Where PostgreSQL runs | HOST to use |
|---|---|
| Another server / a managed database | its address, as now |
| **This same server** | the server's own network IP (e.g. `192.168.1.2`, see `hostname -I`), **not** `127.0.0.1` |

`127.0.0.1` inside a container means the container itself, not the server. A server's public IP often
doesn't work from the same machine either (many routers block that). If PostgreSQL runs on this server,
also let containers in: see [step 6](#6-postgresql-on-the-same-server-only-then).

### 4d. Client files: the media folder

```ini
# the folder on the server that holds every client file (relative = inside the project folder)
MEDIA_DIR=./media
# the published websites as Nginx sees them, for the customer-domain blocks the team copies from /manage/
NGINX_SITES_ROOT=/srv/local_business_demo/media/sites
# keep these two as they are
MEDIA_ROOT=media/uploads
SITES_ROOT=media/sites
```

Details and other locations: [step 5](#5-the-media-folder-client-files).

### 4e. Services (fill in when you have them)

| Lines | Until filled in | When you have them |
|---|---|---|
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | `DEMO_PAYMENTS=True`: checkout uses the Demo Payment Simulator (no real money; the team still approves every site) | fill them in and set `DEMO_PAYMENTS=False` |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` | `EMAIL_BACKEND=…console…`: emails only appear in the logs | set `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend` |
| `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID` | `SMS_PROVIDER=mock`: the OTP code is shown on screen | set `SMS_PROVIDER=msg91` |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID` | `WHATSAPP_PROVIDER=mock`: messages only logged | set `WHATSAPP_PROVIDER=cloud` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | no "Continue with Google" button | the button appears ([step 10](#10-razorpay-google-login-email)) |
| `COMPANY_ADDRESS`, `COMPANY_GSTIN`, `COMPANY_STATE`, `GST_ENABLED` | placeholder address on invoices | your real details |

After any change to `.env`: `cd /srv/local_business_demo && sudo docker compose up -d` (step 8).

---

## 5. The media folder (client files)

Everything owners upload and every published website is stored in **`MEDIA_DIR`**. Docker mounts that
folder into the container (`docker-compose.yml`: `${MEDIA_DIR}:/app/media`), so the files live on the
server's disk, not inside the container:

```
/srv/local_business_demo/media/            = MEDIA_DIR=./media
├── uploads/                               photos owners upload        -> https://app.devnixplus.com/media/…
│   ├── projects/<id>/…                    website photos
│   ├── templates/…                        design thumbnails
│   └── verification/…                     shop photos / visiting cards: PRIVATE (Nginx denies them)
└── sites/                                 published websites          -> https://demo.devnixplus.com/<name>/
    ├── <name>/index.html, data.js, images/
    └── _shared/v1/…                       CSS / JS / stock photos used by every site
```

### 5a. Create it (default location)

```bash
cd /srv/local_business_demo
sudo mkdir -p media/uploads media/sites
```

The container also creates them on its first start, so this is only to be sure.

### 5b. Copy your existing files from your computer

The photos and the sample-design thumbnails are in the `media/` folder on your computer. Copy them once.
**On your computer** (project folder):

```bash
scp -r media user@SERVER_IP:/tmp/media
```

**On the server:**

```bash
sudo cp -a /tmp/media/. /srv/local_business_demo/media/
sudo rm -rf /tmp/media
ls /srv/local_business_demo/media          # uploads  sites
```

(`rsync -a media/ user@SERVER_IP:/tmp/media/` works too and can be re-run.)

### 5c. Another location or a separate disk (optional)

To keep client files outside the project, e.g. on a second disk mounted at `/data`:

```bash
sudo mkdir -p /data/devnix-media/uploads /data/devnix-media/sites
sudo cp -a /srv/local_business_demo/media/. /data/devnix-media/     # if you already have files
```

Then change **all** of these to the new path (then follow steps 7 and 8 again):

| File | Line(s) | New value |
|---|---|---|
| `.env` | `MEDIA_DIR=` | `/data/devnix-media` |
| `.env` | `NGINX_SITES_ROOT=` | `/data/devnix-media/sites` |
| `deploy/nginx-app.conf` | `/media/` and `/_shared/` `alias` lines | `/data/devnix-media/uploads/`, `/data/devnix-media/sites/_shared/` |
| `deploy/nginx-demos.conf` | `root …/media/sites;` and the `/_shared/` `alias` | `/data/devnix-media/sites` |

`MEDIA_ROOT` and `SITES_ROOT` stay as they are: inside the container the folder is always `/app/media`.

### 5d. Permissions

The container writes the files as `root` with normal read permissions, and Nginx (`www-data`) only needs
to read them. Nginx must be able to enter the folders on the way:

```bash
sudo chmod o+x /srv /srv/local_business_demo
sudo chmod -R o+rX /srv/local_business_demo/media
```

(For a separate disk: the same for `/data` and `/data/devnix-media`.)

---

## 6. PostgreSQL on the same server (only then)

Skip this step if the database runs somewhere else.

The container connects from Docker's private network (`172.16.0.0/12`), so PostgreSQL must listen on the
server's network IP and allow that network:

```bash
# find the config folder, e.g. /etc/postgresql/16/main
ls /etc/postgresql/*/main/

# 1) listen on all addresses (or: listen_addresses = 'localhost,192.168.1.2')
sudo nano /etc/postgresql/*/main/postgresql.conf
#    set:   listen_addresses = '*'

# 2) allow Docker containers, with a password
sudo nano /etc/postgresql/*/main/pg_hba.conf
#    add at the end:
#    host  all  all  172.16.0.0/12  scram-sha-256

sudo systemctl restart postgresql
```

In `.env`, `DATABASE_URL` must then use the server's network IP (`hostname -I` shows it), for example
`postgres://USER:PASSWORD@192.168.1.2:5432/DATABASE`. Port 5432 doesn't need to be open in the firewall
for this (it is the same machine).

---

## 7. Nginx and HTTPS certificates

Your Nginx is already running other sites, so these steps only **add** files; nothing existing is removed.
The config files are in the project's `deploy/` folder and use `app.devnixplus.com`, `demo.devnixplus.com`,
`/srv/local_business_demo` and port `9002`. Using other values? Edit them first (see
[step 11](#11-where-every-value-lives)):

```bash
cd /srv/local_business_demo/deploy
grep -n "devnixplus.com\|/srv/local_business_demo\|9002" nginx-app.conf nginx-demos.conf
```

### 7a. Answer certificate checks on port 80

Let's Encrypt checks your domain over `http://…/.well-known/acme-challenge/`. The file
`nginx-acme-default.conf` answers those checks for **any** domain pointed at the server (also customer
domains later).

```bash
sudo grep -rn "default_server" /etc/nginx/sites-enabled/
```

- **Nothing printed:** install it:
  ```bash
  sudo cp nginx-acme-default.conf /etc/nginx/sites-available/00-acme-default.conf
  sudo ln -s /etc/nginx/sites-available/00-acme-default.conf /etc/nginx/sites-enabled/
  ```
- **Something printed with `listen 80 default_server`:** you already have a default site. Don't install the
  file; instead add this line inside that existing `server { … listen 80 … }` block:
  `location /.well-known/acme-challenge/ { root /var/www/certbot; }`

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 7b. Get the certificates

```bash
sudo certbot certonly --webroot -w /var/www/certbot -d app.devnixplus.com
sudo certbot certonly --webroot -w /var/www/certbot -d demo.devnixplus.com
sudo ls /etc/letsencrypt/live/          # app.devnixplus.com  demo.devnixplus.com
```

Already have a wildcard certificate (`*.devnixplus.com`)? Then skip this and put its paths in the
`ssl_certificate` / `ssl_certificate_key` lines of the two config files.

Reload Nginx automatically after every renewal:

```bash
echo 'systemctl reload nginx' | sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
```

### 7c. Install the two site configs

```bash
cd /srv/local_business_demo/deploy
sudo cp nginx-app.conf   /etc/nginx/sites-available/devnix-app.conf
sudo cp nginx-demos.conf /etc/nginx/sites-available/devnix-demos.conf
sudo ln -s /etc/nginx/sites-available/devnix-app.conf   /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/devnix-demos.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

`nginx -t` must say **syntax is ok** and **test is successful**. What the two files do:

| File | Domain | What it serves |
|---|---|---|
| `devnix-app.conf` | `app.devnixplus.com` | `/static/` from `var/static/`, `/media/` from `media/uploads/` (but never `media/verification/`), `/_shared/` from `media/sites/_shared/`, everything else → the container on `127.0.0.1:9002` |
| `devnix-demos.conf` | `demo.devnixplus.com` | `/<name>/` from `media/sites/<name>/` (published websites), then from `demos/<name>/` (hand-made demos), the showcase grid at `/` |

Older Nginx (`nginx -v` lower than 1.25.1) doesn't know `http2 on;`. Then delete that line and write
`listen 443 ssl http2;` instead of `listen 443 ssl;` in both files.

---

## 8. Start the site builder

```bash
cd /srv/local_business_demo
sudo docker compose up -d --build
sudo docker compose logs -f          # watch the start; Ctrl+C leaves the logs (the container keeps running)
```

The first build downloads Python packages and takes a few minutes. When the logs show
`Listening at: http://0.0.0.0:8000` and `Booting worker`, it is ready. On every start the container
by itself:

1. applies database changes (`migrate`) and creates the Admin / Sales / Verifier roles,
2. copies the shared template files to `media/sites/_shared/`,
3. collects the CSS/JS into `var/static/` for Nginx,
4. writes `showcase/config.js` (the showcase's "Use this design" buttons point to `APP_URL`),
5. imports the 26 designs the first time only (later restarts keep the team's on/off and order),
6. starts Gunicorn on `127.0.0.1:9002`.

It also starts again by itself after a server reboot (`restart: unless-stopped`).

Check:

```bash
sudo docker compose ps                                         # STATUS: Up
curl -sI http://127.0.0.1:9002/ -H "Host: app.devnixplus.com" | head -1      # HTTP/1.1 200 OK
sudo docker compose exec -w /app/builder app python manage.py check --deploy
```

`check --deploy` shows 4 warnings that are expected (W005, W008, W019, W021: HTTPS redirect, HSTS and
frames are handled on purpose by Nginx and the editor preview). Anything marked **ERROR** must be fixed.

---

## 9. Your admin login, and remove the demo logins

```bash
cd /srv/local_business_demo
# your own Admin login (asks for email and password)
sudo docker compose exec -w /app/builder app python manage.py createsuperuser
```

The database you moved still contains the 4 local demo logins (`admin@`, `sales@`, `verifier@`,
`owner@demo.local`, password `Demo@12345`). **Delete them** so nobody can log in with the known password:

```bash
sudo docker compose exec -w /app/builder app python manage.py shell -c \
  "from accounts.models import User; print(User.objects.filter(email__endswith='@demo.local').delete())"
```

If it says `ProtectedError` (a demo login already has a payment), switch them off instead:
`… shell -c "from accounts.models import User; print(User.objects.filter(email__endswith='@demo.local').update(is_active=False))"`.

Give your team their roles: log in at `https://app.devnixplus.com/django-admin/` → **Users** → the person →
tick **Staff status**, add the group **Admin**, **Sales** or **Verifier** → Save. (See `docs/ADMIN_GUIDE.md`.)

### Test everything in the browser

- [ ] `https://app.devnixplus.com/` opens with a padlock (valid HTTPS).
- [ ] Log in with your new admin, open **Team panel** (`/manage/`).
- [ ] `https://app.devnixplus.com/templates/` shows the designs **with thumbnails** (if not: copy the files, step 5b,
      or run `sudo docker compose exec -w /app/builder app python manage.py import_templates` once).
- [ ] `https://demo.devnixplus.com/` shows the showcase; a card's **Use this design** opens `app.devnixplus.com`.
- [ ] Sign up as a test owner, create a website, upload a photo, open the preview
      (`https://demo.devnixplus.com/<name>/`), and the photo shows.
- [ ] `ls /srv/local_business_demo/media/uploads/projects/` shows the uploaded photo **on the server's disk**.
- [ ] `sudo docker compose restart`, then the preview and photo are still there.

---

## 10. Razorpay, Google login, email

**Razorpay** (live payments):

1. Razorpay Dashboard → Settings → API Keys: generate keys (test keys first, live keys after activation;
   activation needs the public pages: pricing, terms, privacy, refund, contact).
2. Webhooks → Add: URL `https://app.devnixplus.com/billing/webhook/`, a secret of your choice, events
   `payment.captured`, `payment.failed`, `refund.processed`.
3. In `.env`: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` (the webhook secret),
   and `DEMO_PAYMENTS=False`.

**Google login** (optional): Google Cloud Console → APIs & Services → OAuth consent screen, then
Credentials → Create OAuth client ID → Web application. Authorised redirect URI:
`https://app.devnixplus.com/accounts/google/login/callback/`. Put the ID and secret in `.env`
(`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).

**Email**: your mail provider's SMTP details in `EMAIL_HOST`, `EMAIL_PORT` (587), `EMAIL_HOST_USER`,
`EMAIL_HOST_PASSWORD`, `DEFAULT_FROM_EMAIL`, and `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend`.

After each: `cd /srv/local_business_demo && sudo docker compose up -d`.

---

## 11. Where every value lives

Change a value **everywhere it is listed**, then reload Nginx (`sudo nginx -t && sudo systemctl reload nginx`,
after copying the edited file to `/etc/nginx/sites-available/` again) and restart the container
(`sudo docker compose up -d`).

| Value | `.env` | Nginx files | Also |
|---|---|---|---|
| Builder domain (`app.devnixplus.com`) | `APP_URL`, `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS` | `nginx-app.conf`: `server_name` (2×), the `return 301` line, the 2 `ssl_certificate` paths | DNS record, `certbot -d`, Razorpay webhook URL, Google redirect URI |
| Websites domain (`demo.devnixplus.com`) | `DEMO_BASE_URL`, `DEMO_DOMAIN` | `nginx-demos.conf`: `server_name` (2×), the `return 301` line, the 2 `ssl_certificate` paths | DNS record, `certbot -d` |
| Port (`9002`) | `APP_DOCKER_PORT` | `nginx-app.conf`: `server 127.0.0.1:9002` | none |
| Project folder (`/srv/local_business_demo`) | `NGINX_SITES_ROOT` | every `alias`/`root` path in `nginx-app.conf`, `nginx-demos.conf` | `deploy/crontab.txt` (`APP=`), `deploy/backup.sh` (`APP=`) |
| Media folder (`./media`) | `MEDIA_DIR`, `NGINX_SITES_ROOT` | `/media/`, `/_shared/` and `root` paths | [step 5c](#5c-another-location-or-a-separate-disk-optional) |
| Database | `DATABASE_URL` | none | [step 6](#6-postgresql-on-the-same-server-only-then) if it is on this server |

---

## 12. Cron jobs and backups

```bash
sudo chmod +x /srv/local_business_demo/deploy/backup.sh
sudo crontab /srv/local_business_demo/deploy/crontab.txt       # installs for root (root may run docker)
sudo crontab -l                                                # shows the jobs
```

| Time | Job |
|---|---|
| 09:00 | renewal and go-live reminders (email + WhatsApp) |
| 01:00 | expire hosting after the grace period |
| 01:30 | unpublish previews unused for 60 days |
| 02:30 | `backup.sh`: PostgreSQL dump + the whole media folder → `/var/backups/devnix/` (14 days kept) |
| Sun 03:00 | clear old login sessions |

Test the backup once now:

```bash
sudo /srv/local_business_demo/deploy/backup.sh
ls -lh /var/backups/devnix/          # db_<date>.dump  media_<date>.tar.gz
```

Copy `/var/backups/devnix` to another machine or cloud storage regularly: a backup on the same disk doesn't
help if the server is lost. Restore commands are at the bottom of `deploy/backup.sh`.

---

## 13. Customer domains (later, per customer)

When a customer wants their own domain (e.g. `sharmasweets.in`) for their hosted site:

1. The customer adds at their registrar: `A @ → SERVER_IP` and `A www → SERVER_IP`.
2. In `https://app.devnixplus.com/manage/` → **Projects** → the project → **Custom domain**: enter the domain,
   tick the checks. The page shows the exact Nginx block and commands.
3. On the server: run the `certbot` command it shows, paste the block into
   `/etc/nginx/sites-available/<domain>.conf`, enable it, `sudo nginx -t && sudo systemctl reload nginx`.

Full details: `docs/ADMIN_GUIDE.md` → "Connect a customer's own domain".

---

## 14. Updating to a new version

```bash
cd /srv/local_business_demo
sudo git pull
sudo docker compose up -d --build        # database changes and static files run on start
```

- `git pull`, a rebuild and `docker compose down` never touch `media/` or `.env`.
- Changed a file in `deploy/`? Copy it to `/etc/nginx/sites-available/` again and reload Nginx.
- New design added (`demos/sample-*`)?
  `sudo docker compose exec -w /app/builder app python manage.py import_templates`
- Changed `template/` (the CSS/JS of the websites)? Set `SHARED_VERSION=v2` (then v3…) in `.env`, then
  `sudo docker compose up -d` and
  `sudo docker compose exec -w /app/builder app python manage.py republish_all`.

---

## 15. Everyday commands

Run them in `/srv/local_business_demo`:

| Task | Command |
|---|---|
| Status | `sudo docker compose ps` |
| Logs (live) | `sudo docker compose logs -f` (last 100 lines: `--tail 100`) |
| Restart | `sudo docker compose restart` |
| Apply `.env` changes | `sudo docker compose up -d` |
| Stop / start | `sudo docker compose down` / `sudo docker compose up -d` |
| A Django command | `sudo docker compose exec -w /app/builder app python manage.py <command>` |
| Django shell | `sudo docker compose exec -w /app/builder app python manage.py shell` |
| Nginx check + reload | `sudo nginx -t && sudo systemctl reload nginx` |
| Nginx errors | `sudo tail -50 /var/log/nginx/error.log` |
| App log files | `ls /srv/local_business_demo/var/logs/` |

---

## 16. Troubleshooting

| What you see | Cause and fix |
|---|---|
| **502 Bad Gateway** on `app.…` | The container isn't running or is still starting. `sudo docker compose ps` and `sudo docker compose logs --tail 100`. Check `APP_DOCKER_PORT` in `.env` matches `server 127.0.0.1:…` in `nginx-app.conf`. |
| **400 Bad Request** | The domain is missing from `ALLOWED_HOSTS` in `.env`. Add it, `sudo docker compose up -d`. |
| **403 CSRF verification failed** when logging in / signing up | `CSRF_TRUSTED_ORIGINS` must contain `https://app.devnixplus.com` (with `https://`). |
| Logged out after every click / can't log in | `SECURE_COOKIES=True` needs HTTPS. Open the site with `https://`, and check Nginx sends `X-Forwarded-Proto` (it is in `nginx-app.conf`). |
| Page without design (no CSS) | Nginx can't read `var/static/`: `ls /srv/local_business_demo/var/static/css`, permissions (step 5d), the `alias` path in `nginx-app.conf`. |
| Photos / thumbnails missing | Files not copied (step 5b), wrong `alias` for `/media/`, or permissions (step 5d). |
| `demo.…/<name>/` gives 404 | The site isn't published yet, or `root` in `nginx-demos.conf` doesn't match `MEDIA_DIR`. `ls /srv/local_business_demo/media/sites/`. |
| Logs: `could not connect to server` / `Connection refused` / `timeout` (database) | Wrong host in `DATABASE_URL`, or PostgreSQL doesn't accept the container: step 6. Test from the container: `sudo docker compose exec app python -c "import psycopg,os; psycopg.connect(os.environ['DATABASE_URL']); print('ok')"`. |
| Logs: `password authentication failed` | Wrong user/password in `DATABASE_URL`. Special characters in the password (`@ : / # ?`) must be URL-encoded, e.g. `@` → `%40`. |
| `backup.sh`: `pg_dump: error: aborting because of server version mismatch` | The server's `pg_dump` is older than your PostgreSQL (`psql --version` vs the database version). Install the matching client, e.g. `sudo apt install postgresql-client-18` (from apt.postgresql.org if Ubuntu doesn't have it). |
| `certbot` fails | DNS doesn't point to the server yet (step 1), port 80 is blocked (firewall), or the `/.well-known/acme-challenge/` location is missing (step 7a). |
| `nginx -t`: `unknown directive "http2"` | Older Nginx: see the end of step 7c. |
| `nginx -t`: `duplicate default server` | You installed `00-acme-default.conf` but already had a default server: remove the link and follow the second case in step 7a. |
| `Set APP_DOCKER_PORT in .env` (or another key) when running docker compose | `.env` is missing or not in `/srv/local_business_demo`. Step 4. |
| OTP code shown on the page | `SMS_PROVIDER=mock`. Fill in MSG91 (step 4e). |
