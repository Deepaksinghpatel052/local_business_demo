# Deployment (Ubuntu server with its own Nginx + Docker)

> **Setting up a server for the first time? Follow [`SERVER_SETUP.md`](SERVER_SETUP.md)**: every step in
> order (DNS, domain, allowed hosts, media folder, database, Nginx, certificates, first login, checks,
> troubleshooting). This page is the short reference.

The site builder runs in **one Docker container** (Django + Gunicorn). There is **no Nginx in Docker**:
the server's own Nginx proxies to the container and serves every file straight from the folders.
Client files (photos people upload, published websites) live in **`MEDIA_DIR`** on the server, which is
mounted into the container, so restarting, rebuilding or removing the container never loses them.

```
app.devnixplus.com            -> Nginx -> 127.0.0.1:APP_DOCKER_PORT (container)  deploy/nginx-app.conf
demo.devnixplus.com/<slug>/   -> Nginx static from <MEDIA_DIR>/sites/<slug>/       deploy/nginx-demos.conf
customer-domain.com           -> Nginx static from <MEDIA_DIR>/sites/<slug>/       generated in /manage/ per project
```

Folders on the server (project in `/srv/local_business_demo`, `MEDIA_DIR=./media`):

```
/srv/local_business_demo/              git clone (code, .env, demos/, showcase/)
/srv/local_business_demo/media/        MEDIA_DIR: every client file (back it up)
    uploads/                           photos owners upload           -> https://app…/media/
    uploads/verification/              verification proof (never public; Nginx denies it)
    sites/<slug>/  sites/_shared/      published websites + shared template assets
/srv/local_business_demo/var/static/   collectstatic output           -> https://app…/static/
/srv/local_business_demo/var/logs/     Django, cron and backup logs
```

Sites stay static: if the container is down, every preview and live site keeps working.

## 1. DNS

| Type | Name | Value |
|---|---|---|
| A | `app` | SERVER_IP |
| A | `demo` | SERVER_IP |
| A | `*.demo` | SERVER_IP (only for `DEMO_URL_STYLE=subdomain`) |

## 2. Packages

Docker Engine with the Compose plugin (https://docs.docker.com/engine/install/ubuntu/), plus:

```bash
sudo apt update
sudo apt install -y git certbot postgresql-client
sudo timedatectl set-timezone Asia/Kolkata
sudo mkdir -p /var/www/certbot /var/backups/devnix
```

Nginx is already on the server. It needs to read the project folders:
`sudo chmod o+x /srv /srv/local_business_demo` (the files inside are world-readable by default).

## 3. PostgreSQL

Any PostgreSQL the server can reach. On the same server:

```bash
sudo -u postgres psql -c "CREATE USER devnix WITH PASSWORD 'CHANGE-ME';"
sudo -u postgres psql -c "CREATE DATABASE devnix OWNER devnix;"
```

A database on the host is reached from the container by the server's own IP (not `127.0.0.1`, which is
the container itself). Allow that address in `pg_hba.conf` and `listen_addresses`.

## 4. Code and settings

```bash
sudo git clone https://github.com/Deepaksinghpatel052/local_business_demo.git /srv/local_business_demo
cd /srv/local_business_demo
sudo cp .env.example .env && sudo nano .env
```

**Ready-made server settings:** if you have `.env.server` on your computer (git-ignored: it holds the database
password and secret key), copy it instead of editing `.env.example`:
`scp .env.server user@SERVER:/tmp/.env && ssh user@SERVER "sudo mv /tmp/.env /srv/local_business_demo/.env"`.

Every setting lives in `.env` (see `.env.example` for the full list with notes). Production values
(comments must be on their own lines):

```ini
DEBUG=False
SECRET_KEY=<python3 -c "import secrets; print(secrets.token_urlsafe(50))">
ALLOWED_HOSTS=app.devnixplus.com
CSRF_TRUSTED_ORIGINS=https://app.devnixplus.com
DATABASE_URL=postgres://devnix:CHANGE-ME@SERVER-IP:5432/devnix
CACHE_URL=filecache:///app/var/cache
SECURE_COOKIES=True
SECURE_SSL_REDIRECT=False
SECURE_HSTS_SECONDS=31536000
APP_DOCKER_PORT=9002
GUNICORN_WORKERS=3
APP_URL=https://app.devnixplus.com
DEMO_URL_STYLE=path
DEMO_BASE_URL=https://demo.devnixplus.com
SERVE_FILES=False
MEDIA_DIR=./media
NGINX_SITES_ROOT=/srv/local_business_demo/media/sites
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.your-provider.com
EMAIL_HOST_USER=...
EMAIL_HOST_PASSWORD=...
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
DEMO_PAYMENTS=False
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

`MEDIA_DIR` can also be a folder outside the project (for example a separate disk: `MEDIA_DIR=/data/devnix-media`).
Then use that path in `NGINX_SITES_ROOT` and in the two Nginx files below.

## 5. Start the container

```bash
cd /srv/local_business_demo
sudo docker compose up -d --build
sudo docker compose logs -f            # Ctrl+C to leave the logs
sudo docker compose exec -w /app/builder app python manage.py check --deploy
sudo docker compose exec -w /app/builder app python manage.py createsuperuser    # your own Admin login
```

On every start the container runs `migrate`, `setup_roles`, `sync_shared`, `collectstatic` and
`write_showcase_config`, imports the designs once (`import_templates --if-empty`), then starts Gunicorn
on `127.0.0.1:APP_DOCKER_PORT`. It restarts by itself after a reboot (`restart: unless-stopped`).

## 6. Nginx + certificates

The two config files use `/srv/local_business_demo`; change the paths if your project or `MEDIA_DIR`
is elsewhere, and the port in `nginx-app.conf` if `APP_DOCKER_PORT` is not 9002.

```bash
cd /srv/local_business_demo/deploy
sudo cp nginx-acme-default.conf /etc/nginx/sites-available/00-acme-default.conf
sudo ln -s /etc/nginx/sites-available/00-acme-default.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# certificates (HTTP challenge, answered by the default server above)
sudo certbot certonly --webroot -w /var/www/certbot -d app.devnixplus.com
sudo certbot certonly --webroot -w /var/www/certbot -d demo.devnixplus.com

sudo cp nginx-app.conf   /etc/nginx/sites-available/devnix-app.conf
sudo cp nginx-demos.conf /etc/nginx/sites-available/devnix-demos.conf
sudo ln -s /etc/nginx/sites-available/devnix-app.conf   /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/devnix-demos.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Renewal: certbot installs a timer; reload Nginx after renewals with
`echo 'systemctl reload nginx' | sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh && sudo chmod +x $_`.

**Subdomain style** (`DEMO_URL_STYLE=subdomain`): use block B in `nginx-demos.conf` and a wildcard certificate:
`sudo certbot certonly --manual --preferred-challenges dns -d "*.demo.devnixplus.com" --cert-name demo.devnixplus.com-wildcard`
(or `--dns-cloudflare` as in the main README).

**Customer domains**: per project, in `/manage/projects/<id>/` (see `docs/ADMIN_GUIDE.md`). Template: `deploy/nginx-customer-domain.conf.template`.

## 7. Razorpay

1. Dashboard → Settings → API Keys: test keys first, live keys after account activation (needs the public pages: pricing, terms, privacy, refund, contact).
2. Webhooks → Add: URL `https://app.devnixplus.com/billing/webhook/`, secret = `RAZORPAY_WEBHOOK_SECRET`, events `payment.captured`, `payment.failed`, `refund.processed`.

## 8. Google login

Google Cloud Console → OAuth consent screen → Credentials → OAuth client ID (Web).
Authorised redirect URI: `https://app.devnixplus.com/accounts/google/login/callback/`. Put the ID and secret in `.env`, then `sudo docker compose up -d`.

## 9. Cron and backups

```bash
sudo chmod +x /srv/local_business_demo/deploy/backup.sh
sudo crontab /srv/local_business_demo/deploy/crontab.txt       # root may run docker
sudo crontab -l
```

| Time | Command |
|---|---|
| 09:00 | `manage.py send_reminders` (in the container) |
| 01:00 | `manage.py expire_hosting` |
| 01:30 | `manage.py expire_previews` |
| 02:30 | `deploy/backup.sh` (PostgreSQL dump + `MEDIA_DIR`; 14 days in `/var/backups/devnix`) |
| Sun 03:00 | `manage.py clearsessions` |

## 10. Updating the server

```bash
cd /srv/local_business_demo
sudo git pull
sudo docker compose up -d --build      # migrations, static files etc. run on start
```

The client files in `MEDIA_DIR` are not touched by `git pull`, a rebuild or `docker compose down`.
Only deleting that folder removes them, so back it up (section 9).

After changing `template/` (CSS/JS/photos): set `SHARED_VERSION=v2` in `.env`, then

```bash
sudo docker compose up -d
sudo docker compose exec -w /app/builder app python manage.py republish_all
```

Old versions stay in `_shared/v1/`, so nothing breaks while sites switch over. Downloaded copies are not affected.

After adding a new design (`demos/sample-*`): `sudo docker compose exec -w /app/builder app python manage.py import_templates`.
