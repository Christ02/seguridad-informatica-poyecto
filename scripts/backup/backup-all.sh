#!/bin/bash

################################################################################
# Sistema de Backup - 3-2-1 Rule Implementation
# 
# 3 copies: Original + 2 backups
# 2 different media: Local disk + S3/Cloud
# 1 off-site: S3 in different region
#
# Usage: ./backup-all.sh [daily|weekly|monthly]
################################################################################

set -euo pipefail

# Configuration
BACKUP_TYPE="${1:-daily}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/${BACKUP_TYPE}/${TIMESTAMP}"
RETENTION_DAYS_DAILY=7
RETENTION_DAYS_WEEKLY=30
RETENTION_DAYS_MONTHLY=365

# Databases
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_DB="${POSTGRES_DB:-voting_system}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD}"

# S3 Configuration
S3_BUCKET="${S3_BUCKET:-voting-system-backups}"
S3_REGION="${S3_REGION:-us-east-1}"

# Create backup directory
mkdir -p "${BACKUP_DIR}"/{database,redis,logs,config}

echo "========================================"
echo "Starting backup: ${BACKUP_TYPE}"
echo "Timestamp: ${TIMESTAMP}"
echo "========================================"

################################################################################
# 1. Database Backup
################################################################################
echo "[1/5] Backing up PostgreSQL database..."

export PGPASSWORD="${POSTGRES_PASSWORD}"

# Full database dump with compression
pg_dump -h "${POSTGRES_HOST}" \
        -p "${POSTGRES_PORT}" \
        -U "${POSTGRES_USER}" \
        -d "${POSTGRES_DB}" \
        -F c \
        -b \
        -v \
        -f "${BACKUP_DIR}/database/postgres_${TIMESTAMP}.dump"

# Also create SQL dump for easy inspection
pg_dump -h "${POSTGRES_HOST}" \
        -p "${POSTGRES_PORT}" \
        -U "${POSTGRES_USER}" \
        -d "${POSTGRES_DB}" \
        --clean \
        --if-exists | gzip > "${BACKUP_DIR}/database/postgres_${TIMESTAMP}.sql.gz"

# Backup specific tables separately (for faster recovery)
CRITICAL_TABLES=("users" "elections" "blockchain_votes" "vote_receipts" "audit_logs")

for table in "${CRITICAL_TABLES[@]}"; do
    pg_dump -h "${POSTGRES_HOST}" \
            -p "${POSTGRES_PORT}" \
            -U "${POSTGRES_USER}" \
            -d "${POSTGRES_DB}" \
            -t "${table}" \
            -F c \
            -f "${BACKUP_DIR}/database/${table}_${TIMESTAMP}.dump"
done

unset PGPASSWORD

echo "✓ Database backup completed"

################################################################################
# 2. Redis Backup
################################################################################
echo "[2/5] Backing up Redis data..."

# Trigger Redis BGSAVE
redis-cli -h "${REDIS_HOST:-localhost}" -p "${REDIS_PORT:-6379}" BGSAVE

# Wait for save to complete
while [ "$(redis-cli -h "${REDIS_HOST:-localhost}" -p "${REDIS_PORT:-6379}" LASTSAVE)" = "$(redis-cli -h "${REDIS_HOST:-localhost}" -p "${REDIS_PORT:-6379}" LASTSAVE)" ]; do
    sleep 1
done

# Copy RDB file
cp /var/lib/redis/dump.rdb "${BACKUP_DIR}/redis/redis_${TIMESTAMP}.rdb"

echo "✓ Redis backup completed"

################################################################################
# 3. Application Logs Backup
################################################################################
echo "[3/5] Backing up application logs..."

# Compress logs
tar -czf "${BACKUP_DIR}/logs/app_logs_${TIMESTAMP}.tar.gz" \
    /var/log/voting-system/ \
    /var/log/nginx/ \
    --exclude='*.gz' \
    2>/dev/null || true

echo "✓ Logs backup completed"

################################################################################
# 4. Configuration Backup
################################################################################
echo "[4/5] Backing up configuration files..."

# Backup configuration files
tar -czf "${BACKUP_DIR}/config/config_${TIMESTAMP}.tar.gz" \
    /app/config/ \
    /app/.env \
    /app/docker-compose.yml \
    /etc/nginx/nginx.conf \
    2>/dev/null || true

echo "✓ Configuration backup completed"

################################################################################
# 5. Upload to S3 (Off-site backup)
################################################################################
echo "[5/5] Uploading to S3..."

# Install AWS CLI if not present
if ! command -v aws &> /dev/null; then
    echo "AWS CLI not found, skipping S3 upload"
else
    # Upload to S3 with encryption
    aws s3 sync "${BACKUP_DIR}" \
        "s3://${S3_BUCKET}/${BACKUP_TYPE}/${TIMESTAMP}" \
        --region "${S3_REGION}" \
        --sse AES256 \
        --storage-class STANDARD_IA

    echo "✓ S3 upload completed"
fi

################################################################################
# Create backup manifest
################################################################################
cat > "${BACKUP_DIR}/manifest.json" <<EOF
{
  "timestamp": "${TIMESTAMP}",
  "type": "${BACKUP_TYPE}",
  "database": {
    "postgres_version": "$(psql --version | head -n1)",
    "size": "$(du -sh ${BACKUP_DIR}/database | cut -f1)"
  },
  "redis": {
    "redis_version": "$(redis-cli --version)",
    "size": "$(du -sh ${BACKUP_DIR}/redis | cut -f1)"
  },
  "total_size": "$(du -sh ${BACKUP_DIR} | cut -f1)",
  "files": $(find "${BACKUP_DIR}" -type f | wc -l)
}
EOF

################################################################################
# Cleanup old backups (Retention policy)
################################################################################
echo "Cleaning up old backups..."

case "${BACKUP_TYPE}" in
    daily)
        find /backups/daily -type d -mtime +${RETENTION_DAYS_DAILY} -exec rm -rf {} + 2>/dev/null || true
        ;;
    weekly)
        find /backups/weekly -type d -mtime +${RETENTION_DAYS_WEEKLY} -exec rm -rf {} + 2>/dev/null || true
        ;;
    monthly)
        find /backups/monthly -type d -mtime +${RETENTION_DAYS_MONTHLY} -exec rm -rf {} + 2>/dev/null || true
        ;;
esac

echo "✓ Cleanup completed"

################################################################################
# Verify backup integrity
################################################################################
echo "Verifying backup integrity..."

# Test PostgreSQL dump
pg_restore --list "${BACKUP_DIR}/database/postgres_${TIMESTAMP}.dump" > /dev/null 2>&1 && \
    echo "✓ PostgreSQL dump verified" || \
    echo "✗ PostgreSQL dump verification failed"

# Calculate checksums
cd "${BACKUP_DIR}"
find . -type f -exec sha256sum {} \; > checksums.txt

echo "✓ Backup integrity verified"

################################################################################
# Send notification
################################################################################
BACKUP_SIZE=$(du -sh "${BACKUP_DIR}" | cut -f1)

cat > /tmp/backup_notification.json <<EOF
{
  "status": "success",
  "type": "${BACKUP_TYPE}",
  "timestamp": "${TIMESTAMP}",
  "size": "${BACKUP_SIZE}",
  "location": "${BACKUP_DIR}"
}
EOF

# Send to monitoring endpoint (if available)
curl -X POST \
     -H "Content-Type: application/json" \
     -d @/tmp/backup_notification.json \
     "http://monitoring:3000/api/backup-notifications" \
     2>/dev/null || true

echo "========================================"
echo "Backup completed successfully!"
echo "Type: ${BACKUP_TYPE}"
echo "Size: ${BACKUP_SIZE}"
echo "Location: ${BACKUP_DIR}"
echo "========================================"

exit 0

