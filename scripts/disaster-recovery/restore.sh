#!/bin/bash

################################################################################
# Disaster Recovery - Restore Script
#
# RPO (Recovery Point Objective): < 1 hour
# RTO (Recovery Time Objective): < 4 hours
#
# Usage: ./restore.sh <backup_timestamp>
################################################################################

set -euo pipefail

if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_timestamp>"
    echo "Example: $0 20240115_120000"
    exit 1
fi

BACKUP_TIMESTAMP="$1"
BACKUP_DIR="/backups/daily/${BACKUP_TIMESTAMP}"

# Configuration
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_DB="${POSTGRES_DB:-voting_system}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD}"

echo "========================================"
echo "Disaster Recovery - Restore"
echo "Backup: ${BACKUP_TIMESTAMP}"
echo "========================================"
echo ""
echo "⚠️  WARNING: This will overwrite existing data!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Restore cancelled."
    exit 1
fi

################################################################################
# Pre-flight checks
################################################################################
echo "[1/6] Running pre-flight checks..."

# Check if backup exists
if [ ! -d "${BACKUP_DIR}" ]; then
    echo "✗ Backup directory not found: ${BACKUP_DIR}"
    exit 1
fi

# Verify backup integrity
if [ ! -f "${BACKUP_DIR}/checksums.txt" ]; then
    echo "✗ Checksums file not found"
    exit 1
fi

cd "${BACKUP_DIR}"
sha256sum -c checksums.txt --quiet && \
    echo "✓ Backup integrity verified" || \
    { echo "✗ Backup integrity check failed"; exit 1; }

echo "✓ Pre-flight checks passed"

################################################################################
# Stop services
################################################################################
echo "[2/6] Stopping services..."

docker-compose down || true

echo "✓ Services stopped"

################################################################################
# Restore PostgreSQL
################################################################################
echo "[3/6] Restoring PostgreSQL database..."

export PGPASSWORD="${POSTGRES_PASSWORD}"

# Drop and recreate database
psql -h "${POSTGRES_HOST}" \
     -p "${POSTGRES_PORT}" \
     -U "${POSTGRES_USER}" \
     -d postgres \
     -c "DROP DATABASE IF EXISTS ${POSTGRES_DB};"

psql -h "${POSTGRES_HOST}" \
     -p "${POSTGRES_PORT}" \
     -U "${POSTGRES_USER}" \
     -d postgres \
     -c "CREATE DATABASE ${POSTGRES_DB};"

# Restore from dump
pg_restore -h "${POSTGRES_HOST}" \
           -p "${POSTGRES_PORT}" \
           -U "${POSTGRES_USER}" \
           -d "${POSTGRES_DB}" \
           -v \
           --clean \
           --if-exists \
           "${BACKUP_DIR}/database/postgres_${BACKUP_TIMESTAMP}.dump"

unset PGPASSWORD

echo "✓ Database restored"

################################################################################
# Restore Redis
################################################################################
echo "[4/6] Restoring Redis data..."

# Stop Redis
docker-compose stop redis || true

# Replace RDB file
cp "${BACKUP_DIR}/redis/redis_${BACKUP_TIMESTAMP}.rdb" /var/lib/redis/dump.rdb

# Start Redis
docker-compose start redis

# Wait for Redis to load data
sleep 5

echo "✓ Redis restored"

################################################################################
# Restore Configuration
################################################################################
echo "[5/6] Restoring configuration..."

tar -xzf "${BACKUP_DIR}/config/config_${BACKUP_TIMESTAMP}.tar.gz" -C /

echo "✓ Configuration restored"

################################################################################
# Start services
################################################################################
echo "[6/6] Starting services..."

docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Health checks
echo "Running health checks..."

check_service() {
    local service=$1
    local url=$2
    if curl -f -s "${url}" > /dev/null; then
        echo "✓ ${service} is healthy"
        return 0
    else
        echo "✗ ${service} is not responding"
        return 1
    fi
}

check_service "Backend" "http://localhost:5000/api/health" || true
check_service "Frontend" "http://localhost:3000" || true
check_service "Crypto Service" "http://localhost:4000/health" || true

################################################################################
# Post-restore validation
################################################################################
echo "Running post-restore validation..."

# Check database connectivity
docker-compose exec -T backend node -e "
const { AppDataSource } = require('./dist/config/database.config.js');
AppDataSource.initialize()
    .then(() => { console.log('✓ Database connection successful'); process.exit(0); })
    .catch(() => { console.log('✗ Database connection failed'); process.exit(1); });
" || true

# Verify data integrity
export PGPASSWORD="${POSTGRES_PASSWORD}"
psql -h "${POSTGRES_HOST}" \
     -p "${POSTGRES_PORT}" \
     -U "${POSTGRES_USER}" \
     -d "${POSTGRES_DB}" \
     -c "SELECT 'Users: ' || COUNT(*) FROM users;
         SELECT 'Elections: ' || COUNT(*) FROM elections;
         SELECT 'Votes: ' || COUNT(*) FROM blockchain_votes;"

unset PGPASSWORD

################################################################################
# Create restore log
################################################################################
cat > "/var/log/restore_${BACKUP_TIMESTAMP}.log" <<EOF
Restore completed at: $(date)
Backup timestamp: ${BACKUP_TIMESTAMP}
Backup location: ${BACKUP_DIR}
Services status: Running
Database status: Connected
EOF

echo "========================================"
echo "Restore completed successfully!"
echo "Backup: ${BACKUP_TIMESTAMP}"
echo "Log: /var/log/restore_${BACKUP_TIMESTAMP}.log"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Verify application functionality"
echo "2. Check audit logs for any discrepancies"
echo "3. Notify stakeholders about the restore"
echo "4. Update incident response documentation"

exit 0

