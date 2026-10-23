"""The Nginx server block and certbot command the team copies to connect a customer's own domain."""
import re

from django.conf import settings

DOMAIN_RE = re.compile(r"^(?=.{4,253}$)(?!-)([a-z0-9-]{1,63}\.)+[a-z]{2,63}$")


def clean_domain(value):
    d = str(value or "").strip().lower()
    d = re.sub(r"^https?://", "", d).split("/")[0]
    if d.startswith("www."):
        d = d[4:]
    return d if DOMAIN_RE.match(d) else ""


def server_block(project):
    d = project.custom_domain
    root = str(settings.NGINX_SITES_ROOT).rstrip("/")
    return """# /etc/nginx/sites-available/{d}.conf   ({name}, project #{pk})
server {{
    listen 80;
    listen [::]:80;
    server_name {d} www.{d};
    location /.well-known/acme-challenge/ {{ root /var/www/certbot; }}
    location / {{ return 301 https://{d}$request_uri; }}
}}

server {{
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name {d} www.{d};
    ssl_certificate     /etc/letsencrypt/live/{d}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/{d}/privkey.pem;
    if ($host = www.{d}) {{ return 301 https://{d}$request_uri; }}

    root {root}/{slug};
    index index.html;
    location /_shared/ {{ alias {root}/_shared/; expires 30d; }}
    location ~ /\\. {{ deny all; }}
    location = /data.js {{ expires -1; }}
    location ~* \\.(?:jpg|jpeg|png|webp|gif|svg|ico|css|js|woff2?)$ {{ expires 7d; }}
    location / {{ try_files $uri $uri/ =404; }}
    gzip on;
    gzip_types text/css application/javascript text/javascript image/svg+xml;
}}
""".format(d=d, name=project.business_name, pk=project.pk, root=root, slug=project.slug)


def install_commands(project):
    d = project.custom_domain
    return """# 1) DNS at the customer's registrar:  A  @  -> SERVER_IP    and   A  www -> SERVER_IP
dig +short {d}          # must print your server IP before you continue

# 2) Get the certificate first. The default port-80 server (deploy/nginx-acme-default.conf)
#    answers the HTTP challenge for any domain that points at this server.
sudo certbot certonly --webroot -w /var/www/certbot -d {d} -d www.{d}

# 3) Install the server block above and reload
sudo nano /etc/nginx/sites-available/{d}.conf     # paste the block
sudo ln -s /etc/nginx/sites-available/{d}.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 4) Check
curl -I https://{d}/
""".format(d=d)
