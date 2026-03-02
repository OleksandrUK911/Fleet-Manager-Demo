#!/usr/bin/env bash
# deploy/backup-db.sh
#
# Database backup script for Fleet Manager Demo.
# Supports both SQLite (default dev) and MySQL (production).
# Keeps the last KEEP_DAYS days of backups.
#
# Run manually:
#   chmod +x deploy/backup-db.sh
#   ./deploy/backup-db.sh
#
# Schedule with cron (daily at 02:30):
#   30 2 * * * /var/www/fleet-manager/deploy/backup-db.sh >> /var/log/fleet-backup.log 2>&1

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
DB_TYPE="${DB_TYPE:-sqlite}"                              # sqlite | mysql
SQLITE_PATH="${SQLITE_PATH:-/var/www/fleet-manager/backend/fleet.db}"
MYSQL_HOST="${MYSQL_HOST:-127.0.0.1}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_DB="${MYSQL_DB:-fleet_manager}"
MYSQL_USER="${MYSQL_USER:-fleet_user}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-}"                     # set via env or .my.cnf
BACKUP_DIR="${BACKUP_DIR:-/var/backups/fleet-manager}"
KEEP_DAYS="${KEEP_DAYS:-7}"

# ── Setup ─────────────────────────────────────────────────────────────────────
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Fleet Manager backup (type=$DB_TYPE)..."

# ── Backup ────────────────────────────────────────────────────────────────────
if [ "$DB_TYPE" = "sqlite" ]; then
    DEST="$BACKUP_DIR/fleet_${TIMESTAMP}.db.gz"
    if [ ! -f "$SQLITE_PATH" ]; then
        echo "ERROR: SQLite database not found at $SQLITE_PATH"
        exit 1
    fi
    # Use SQLite .backup command for safe online backup (no data corruption)
    sqlite3 "$SQLITE_PATH" ".backup '$BACKUP_DIR/fleet_${TIMESTAMP}.db'"
    gzip "$BACKUP_DIR/fleet_${TIMESTAMP}.db"
    echo "SQLite backup saved: $DEST"

elif [ "$DB_TYPE" = "mysql" ]; then
    DEST="$BACKUP_DIR/fleet_${TIMESTAMP}.sql.gz"
    MYSQLDUMP_OPTS=(
        --host="$MYSQL_HOST"
        --port="$MYSQL_PORT"
        --user="$MYSQL_USER"
        --single-transaction          # consistent snapshot without table lock
        --quick                       # stream large tables row-by-row
        --routines --triggers --events
        "$MYSQL_DB"
    )
    if [ -n "$MYSQL_PASSWORD" ]; then
        MYSQLDUMP_OPTS=(--password="$MYSQL_PASSWORD" "${MYSQLDUMP_OPTS[@]}")
    fi
    mysqldump "${MYSQLDUMP_OPTS[@]}" | gzip > "$DEST"
    echo "MySQL backup saved: $DEST"

else
    echo "ERROR: Unknown DB_TYPE='$DB_TYPE' (expected: sqlite | mysql)"
    exit 1
fi

# ── Pruning: remove backups older than KEEP_DAYS ──────────────────────────────
DELETED=$(find "$BACKUP_DIR" -name "fleet_*.gz" -mtime +"$KEEP_DAYS" -print -delete | wc -l)
echo "Pruned $DELETED backup(s) older than ${KEEP_DAYS} days."

# ── Verify ────────────────────────────────────────────────────────────────────
BACKUP_SIZE=$(du -sh "$DEST" | cut -f1)
echo "Backup size: $BACKUP_SIZE  →  $DEST"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup complete."
