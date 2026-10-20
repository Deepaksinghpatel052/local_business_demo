#!/usr/bin/env bash
# Daily backup of the PostgreSQL database, uploaded photos and every published site.
# Keeps 14 days. Run from cron as the devnix user (see deploy/crontab.txt):
#   30 2 * * * /srv/local_business_demo/deploy/backup.sh >> /var/log/devnix/backup.log 2>&1
# Copy /var/backups/devnix off the server too (rclone/rsync to another machine or bucket).
set -euo pipefail

BACKUP_DIR=${BACKUP_DIR:-/var/backups/devnix}
DB_NAME=${DB_NAME:-devnix}
SITES=${SITES:-/var/www/demos}
MEDIA=${MEDIA:-/var/www/devnix-media}
KEEP_DAYS=${KEEP_DAYS:-14}
STAMP=$(date +%Y-%m-%d_%H%M)

mkdir -p "$BACKUP_DIR"
umask 077

pg_dump --format=custom --no-owner "$DB_NAME" > "$BACKUP_DIR/db_$STAMP.dump"
tar --exclude='.tmp-*' --exclude='.old-*' -czf "$BACKUP_DIR/sites_$STAMP.tar.gz" -C "$(dirname "$SITES")" "$(basename "$SITES")"
tar -czf "$BACKUP_DIR/media_$STAMP.tar.gz" -C "$(dirname "$MEDIA")" "$(basename "$MEDIA")"

find "$BACKUP_DIR" -type f -mtime +"$KEEP_DAYS" -delete
echo "$(date -Is) backup ok: $(du -sh "$BACKUP_DIR" | cut -f1) in $BACKUP_DIR"

# Restore:
#   pg_restore --clean --no-owner -d devnix /var/backups/devnix/db_<stamp>.dump
#   tar -xzf sites_<stamp>.tar.gz -C /var/www   &&   tar -xzf media_<stamp>.tar.gz -C /var/www
