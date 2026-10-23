#!/usr/bin/env bash
# Daily backup of the PostgreSQL database and every client file (MEDIA_DIR: uploads + published sites).
# Keeps 14 days. Reads DATABASE_URL and MEDIA_DIR from the project's .env. Run from cron (deploy/crontab.txt):
#   30 2 * * * /srv/local_business_demo/deploy/backup.sh >> /srv/local_business_demo/var/logs/backup.log 2>&1
# Needs the PostgreSQL client on the server (sudo apt install postgresql-client).
# Copy BACKUP_DIR off the server too (rclone/rsync to another machine or bucket).
set -euo pipefail

APP=${APP:-/srv/local_business_demo}
BACKUP_DIR=${BACKUP_DIR:-/var/backups/devnix}
KEEP_DAYS=${KEEP_DAYS:-14}
STAMP=$(date +%Y-%m-%d_%H%M)

env_value() { grep -E "^$1=" "$APP/.env" | tail -1 | cut -d= -f2-; }
DATABASE_URL=$(env_value DATABASE_URL)
MEDIA_DIR=$(env_value MEDIA_DIR)
case "$MEDIA_DIR" in /*) ;; *) MEDIA_DIR="$APP/${MEDIA_DIR#./}" ;; esac

mkdir -p "$BACKUP_DIR"
umask 077

pg_dump --format=custom --no-owner --dbname="$DATABASE_URL" > "$BACKUP_DIR/db_$STAMP.dump"
tar --exclude='.tmp-*' --exclude='.old-*' -czf "$BACKUP_DIR/media_$STAMP.tar.gz" -C "$MEDIA_DIR" .

find "$BACKUP_DIR" -type f -mtime +"$KEEP_DAYS" -delete
echo "$(date -Is) backup ok: $(du -sh "$BACKUP_DIR" | cut -f1) in $BACKUP_DIR"

# Restore:
#   pg_restore --clean --no-owner --dbname="<DATABASE_URL>" /var/backups/devnix/db_<stamp>.dump
#   tar -xzf /var/backups/devnix/media_<stamp>.tar.gz -C <MEDIA_DIR>
#   docker compose restart
