#!/bin/sh
# Prepare the database and files, then run the site builder.
#   DEBUG=True  (your computer): Django dev server, demo logins, designs re-imported on every start
#   DEBUG=False (server):        Gunicorn; designs imported only once, so the team's on/off and order stay
set -e
cd /app/builder
mkdir -p /app/media/uploads /app/media/sites
python manage.py migrate --noinput
python manage.py setup_roles
python manage.py sync_shared --force
python manage.py collectstatic --noinput -v 0
python manage.py write_showcase_config
case "$DEBUG" in
  [Tt]rue|1|[Yy]es|[Oo]n)
    python manage.py import_templates
    python manage.py seed_demo
    exec python manage.py runserver 0.0.0.0:8000 ;;
esac
python manage.py import_templates --if-empty
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers "${GUNICORN_WORKERS:-3}" --timeout 60 \
     --access-logfile - --error-logfile -
