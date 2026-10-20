# Deployment (existing Ubuntu server with Nginx)

Target layout, on the same server as today's demos:

```
app.devnixplus.com            -> Nginx -> Gunicorn (unix socket) -> Django      deploy/nginx-app.conf
demo.devnixplus.com/<slug>/   -> Nginx static from /var/www/demos/<slug>/       deploy/nginx-demos.conf
customer-domain.com           -> Nginx static from /var/www/demos/<slug>/       generated in /manage/ per project
```

Sites stay static: if Django is down, every preview and live site keeps working.

## 1. DNS

| Type | Name | Value |
|---|---|---|
| A | `app` | SERVER_IP |
| A | `demo` | SERVER_IP |
| A | `*.demo` | SERVER_IP (only for `DEMO_URL_STYLE=subdomain`) |

## 2. Packages, user and folders

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-dev build-essential postgresql nginx certbot git
sudo timedatectl set-timezone Asia/Kolkata
sudo adduser --system --group --home /srv/local_business_demo devnix
sudo usermod -aG www-data devnix
sudo mkdir -p /var/www/demos /var/www/showcase /var/www/devnix-media /var/www/devnix-static /var/www/certbot \
              /var/log/devnix /var/backups/devnix /var/tmp/devnix-cache
sudo chown -R devnix:www-data /var/www/demos /var/www/showcase /var/www/devnix-media /var/www/devnix-static \
              /var/log/devnix /var/backups/devnix /var/tmp/devnix-cache
sudo chmod -R g+rwX,o+rX /var/www/demos /var/www/devnix-media /var/www/devnix-static
```

Existing demos already in `/var/www/demos/<slug>/` stay where they are and keep working.

## 3. PostgreSQL

```bash
sudo -u postgres psql -c "CREATE USER devnix WITH PASSWORD 'CHANGE-ME';"
sudo -u postgres psql -c "CREATE DATABASE devnix OWNER devnix;"
```

(For `backup.sh`, the `devnix` system user connects as the `devnix` database user via peer auth; or add a `~/.pgpass`.)

## 4. Code, virtualenv, settings

```bash
sudo -u devnix -H bash
cd /srv/local_business_demo
git clone https://github.com/Deepaksinghpatel052/local_business_demo.git .
python3 -m venv venv
venv/bin/pip install --upgrade pip
venv/bin/pip install -r requirements-server.txt
cp .env.example .env && nano .env
```

Production values in `.env` (comments must be on their own lines):

```ini
DEBUG=False
SECRET_KEY=<python3 -c "import secrets; print(secrets.token_urlsafe(50))">
ALLOWED_HOSTS=app.devnixplus.com
CSRF_TRUSTED_ORIGINS=https://app.devnixplus.com
DATABASE_URL=postgres://devnix:CHANGE-ME@127.0.0.1:5432/devnix
CACHE_URL=filecache:///var/tmp/devnix-cache
SECURE_COOKIES=True
SECURE_HSTS_SECONDS=31536000
APP_URL=https://app.devnixplus.com
DEMO_URL_STYLE=path
DEMO_BASE_URL=https://demo.devnixplus.com
SITES_ROOT=/var/www/demos
MEDIA_ROOT=/var/www/devnix-media
STATIC_ROOT=/var/www/devnix-static
LOG_DIR=/var/log/devnix
SERVE_SITES=False
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

Then:

```bash
cd builder
../venv/bin/python manage.py check --deploy
../venv/bin/python manage.py migrate
../venv/bin/python manage.py collectstatic --noinput
../venv/bin/python manage.py setup_roles
../venv/bin/python manage.py sync_shared            # /var/www/demos/_shared/v1/
../venv/bin/python manage.py import_templates       # demos/sample-* -> Templates
../venv/bin/python manage.py createsuperuser        # your own Admin login
exit
```

Copy the sample demos and the showcase to the web folders (the "Live sample" links point there):

```bash
sudo -u devnix rsync -a /srv/local_business_demo/demos/ /var/www/demos/
sudo -u devnix rsync -a /srv/local_business_demo/showcase/ /var/www/showcase/
```

## 5. Gunicorn (systemd)

```bash
sudo cp /srv/local_business_demo/deploy/devnix-gunicorn.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now devnix-gunicorn
systemctl status devnix-gunicorn
```

## 6. Nginx + certificates

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
Authorised redirect URI: `https://app.devnixplus.com/accounts/google/login/callback/`. Put the ID and secret in `.env`, restart Gunicorn.

## 9. Cron and backups

```bash
sudo chmod +x /srv/local_business_demo/deploy/backup.sh
sudo crontab -u devnix /srv/local_business_demo/deploy/crontab.txt
sudo crontab -u devnix -l
```

| Time | Command |
|---|---|
| 09:00 | `manage.py send_reminders` |
| 01:00 | `manage.py expire_hosting` |
| 01:30 | `manage.py expire_previews` |
| 02:30 | `deploy/backup.sh` (PostgreSQL dump, photos, `/var/www/demos`; 14 days) |
| Sun 03:00 | `manage.py clearsessions` |

## 10. Updating the server

```bash
sudo -u devnix -H bash -c '
cd /srv/local_business_demo && git pull &&
venv/bin/pip install -r requirements-server.txt &&
cd builder && ../venv/bin/python manage.py migrate &&
../venv/bin/python manage.py collectstatic --noinput'
sudo systemctl restart devnix-gunicorn
```

After changing `template/` (CSS/JS/photos): set `SHARED_VERSION=v2` in `.env`, then

```bash
cd /srv/local_business_demo/builder
../venv/bin/python manage.py sync_shared
../venv/bin/python manage.py republish_all
sudo systemctl restart devnix-gunicorn
```

Old versions stay in `_shared/v1/`, so nothing breaks while sites switch over. Downloaded copies are not affected.
