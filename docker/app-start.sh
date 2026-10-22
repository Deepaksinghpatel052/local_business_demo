#!/bin/sh
# Prepare the database and demo data, then run the Django dev server (local Docker only).
set -e
cd /app/builder
python manage.py migrate --noinput
python manage.py setup_roles
python manage.py import_templates
python manage.py sync_shared --force
python manage.py seed_demo
python manage.py write_showcase_config
exec python manage.py runserver 0.0.0.0:8000
