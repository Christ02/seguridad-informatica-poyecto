#!/bin/bash

echo "====================================="
echo "🚀 Iniciando Sistema de Votación"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar que PostgreSQL y Redis estén corriendo
echo "${BLUE}📡 Verificando servicios de Docker...${NC}"
if ! docker ps | grep -q "voting-postgres"; then
    echo "${YELLOW}⚠ PostgreSQL no está corriendo. Iniciando...${NC}"
    docker-compose up -d postgres
    sleep 5
fi

if ! docker ps | grep -q "voting-redis"; then
    echo "${YELLOW}⚠ Redis no está corriendo. Iniciando...${NC}"
    docker-compose up -d redis
    sleep 3
fi

echo "${GREEN}✓${NC} PostgreSQL y Redis están corriendo"
echo ""

# Crear base de datos si no existe
echo "${BLUE}🗄️  Configurando base de datos...${NC}"
docker exec voting-postgres psql -U postgres -c "SELECT 1 FROM pg_database WHERE datname='voting_system'" | grep -q 1 || \
    docker exec voting-postgres psql -U postgres -c "CREATE DATABASE voting_system;"
echo "${GREEN}✓${NC} Base de datos configurada"
echo ""

echo "====================================="
echo "📝 Servicios listos:"
echo "====================================="
echo ""
echo "${GREEN}✓${NC} PostgreSQL: localhost:5434"
echo "${GREEN}✓${NC} Redis: localhost:6379"
echo ""
echo "====================================="
echo "🎯 Próximo paso:"
echo "====================================="
echo ""
echo "Abre 3 terminales separadas y ejecuta:"
echo ""
echo "${YELLOW}Terminal 1${NC} - Backend:"
echo "  cd backend"
echo "  npm install --legacy-peer-deps"
echo "  npm run dev"
echo ""
echo "${YELLOW}Terminal 2${NC} - Crypto Service:"
echo "  cd crypto-service"
echo "  npm install --legacy-peer-deps"
echo "  npm run dev"
echo ""
echo "${YELLOW}Terminal 3${NC} - Frontend:"
echo "  cd frontend"
echo "  npm install --legacy-peer-deps"
echo "  npm run dev"
echo ""
echo "====================================="
echo "${GREEN}✨ Luego accede a:${NC}"
echo "  Frontend: http://localhost:3000"
echo "  Backend: http://localhost:5000"
echo "  Crypto: http://localhost:4000"
echo "====================================="

