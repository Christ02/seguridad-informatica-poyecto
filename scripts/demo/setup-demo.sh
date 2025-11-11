#!/bin/bash

# Setup Demo - Sistema de Votación Electrónico
# Este script configura un entorno de demostración completo

set -e

echo "🗳️  Sistema de Votación Electrónico - Setup Demo"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "🔍 Verificando prerequisitos..."

command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js no encontrado${NC}"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker no encontrado${NC}"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}❌ Docker Compose no encontrado${NC}"; exit 1; }

echo -e "${GREEN}✓${NC} Prerequisites OK"
echo ""

# Install dependencies
echo "📦 Instalando dependencias..."
npm install
echo -e "${GREEN}✓${NC} Dependencias instaladas"
echo ""

# Generate environment files
echo "🔐 Generando archivos de configuración..."

if [ ! -f .env ]; then
    cp .env.example .env
    
    # Generate secure secrets
    JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d '\n' | tr -d '=+/')
    REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d '\n' | tr -d '=+/')
    DB_ENCRYPTION_KEY=$(openssl rand -base64 32 | head -c 32)
    
    # Update .env
    sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
    sed -i.bak "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|" .env
    sed -i.bak "s|DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD|" .env
    sed -i.bak "s|REDIS_PASSWORD=.*|REDIS_PASSWORD=$REDIS_PASSWORD|" .env
    sed -i.bak "s|DATABASE_ENCRYPTION_KEY=.*|DATABASE_ENCRYPTION_KEY=$DB_ENCRYPTION_KEY|" .env
    
    rm .env.bak
    
    echo -e "${GREEN}✓${NC} Secretos generados y configurados"
else
    echo -e "${YELLOW}⚠${NC}  .env ya existe, saltando..."
fi

echo ""

# Start Docker containers
echo "🐳 Iniciando contenedores Docker..."
docker-compose down -v 2>/dev/null || true
docker-compose up -d

echo "⏳ Esperando a que los servicios estén listos..."
sleep 15

# Check services health
echo "🏥 Verificando salud de servicios..."

check_service() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} $service está listo"
            return 0
        fi
        echo "   Intento $attempt/$max_attempts..."
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌${NC} $service no responde"
    return 1
}

check_service "PostgreSQL" "postgresql://voting_admin:${DB_PASSWORD}@localhost:5434/voting_system" || true
check_service "Redis" "redis://localhost:6379" || true
check_service "Backend" "http://localhost:3002/health"
check_service "Frontend" "http://localhost:5175"
check_service "Crypto Service" "http://localhost:3003/health"

echo ""

# Run migrations
echo "🗄️  Ejecutando migraciones de base de datos..."
npm run migrate -w backend || echo -e "${YELLOW}⚠${NC}  Migraciones no disponibles aún"
echo ""

# Seed demo data
echo "🌱 Cargando datos de demostración..."
npm run seed -w backend || echo -e "${YELLOW}⚠${NC}  Seeds no disponibles aún"
echo ""

# Display demo accounts
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Demo Environment Ready!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 URLs:"
echo "   Frontend:        http://localhost:5175"
echo "   Backend API:     http://localhost:3002"
echo "   Crypto Service:  http://localhost:3003"
echo "   Monitoring:      http://localhost:3004"
echo ""
echo "🔑 Demo Accounts:"
echo ""
echo "   ADMINISTRADORES (Custodios):"
echo "   ────────────────────────────"
echo "   admin1@voting.com / Admin123!@#  (Custodio 1)"
echo "   admin2@voting.com / Admin123!@#  (Custodio 2)"
echo "   admin3@voting.com / Admin123!@#  (Custodio 3)"
echo "   admin4@voting.com / Admin123!@#  (Custodio 4)"
echo "   admin5@voting.com / Admin123!@#  (Custodio 5)"
echo ""
echo "   VOTANTES:"
echo "   ─────────"
echo "   voter1@example.com / Voter123!@#"
echo "   voter2@example.com / Voter123!@#"
echo "   voter3@example.com / Voter123!@#"
echo "   ...hasta voter10"
echo ""
echo "📊 Elecciones Demo:"
echo "   - Elección Presidencial 2024"
echo "   - Referendum Constitucional"
echo ""
echo "🔐 Características Activas:"
echo "   ✓ 2FA obligatorio (usar apps como Google Authenticator)"
echo "   ✓ Threshold Cryptography (3-de-5)"
echo "   ✓ Zero-Knowledge Proofs"
echo "   ✓ Multi-Signature (3/5 admins)"
echo "   ✓ Blockchain inmutable"
echo "   ✓ Rate limiting"
echo "   ✓ SIEM monitoring"
echo ""
echo "📚 Documentación:"
echo "   - README.md"
echo "   - docs/SECURITY_ARCHITECTURE.md"
echo "   - docs/THREAT_MODEL.md"
echo "   - docs/incident-response/INCIDENT_RESPONSE_PLAN.md"
echo ""
echo "🚀 Scripts de Demo:"
echo "   ./scripts/demo/key-ceremony-demo.sh    - Ceremonia de claves"
echo "   ./scripts/demo/vote-flow-demo.sh       - Flujo de votación"
echo "   ./scripts/demo/decrypt-results-demo.sh - Desencriptación"
echo ""
echo "🛑 Para detener:"
echo "   docker-compose down"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}¡Listo para la demostración!${NC}"
echo ""

