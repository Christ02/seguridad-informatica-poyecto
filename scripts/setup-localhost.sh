#!/bin/bash

################################################################################
# Script de Configuración para Localhost
# Sistema de Votación Electrónico Seguro
################################################################################

set -e

echo "========================================="
echo "🚀 Setup de Localhost - Sistema de Votación"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Verificar prerequisitos
echo "📋 Verificando prerequisitos..."
echo ""

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js instalado: $NODE_VERSION"
else
    print_error "Node.js no encontrado. Por favor instala Node.js 20+"
    exit 1
fi

# Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_success "Docker instalado: $DOCKER_VERSION"
else
    print_error "Docker no encontrado. Por favor instala Docker Desktop"
    exit 1
fi

# Docker Compose
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    print_success "Docker Compose instalado: $COMPOSE_VERSION"
else
    print_warning "Docker Compose no encontrado como comando separado (OK si usas docker compose)"
fi

echo ""
echo "========================================="
echo "📦 Paso 1: Instalar Dependencias"
echo "========================================="
echo ""

# Instalar dependencias raíz
echo "Instalando dependencias del monorepo..."
npm install
print_success "Dependencias raíz instaladas"

# Backend
echo "Instalando dependencias del backend..."
cd backend && npm install && cd ..
print_success "Dependencias del backend instaladas"

# Frontend
echo "Instalando dependencias del frontend..."
cd frontend && npm install && cd ..
print_success "Dependencias del frontend instaladas"

# Crypto Service
echo "Instalando dependencias del crypto-service..."
cd crypto-service && npm install && cd ..
print_success "Dependencias del crypto-service instaladas"

# Shared
echo "Instalando dependencias de shared..."
cd shared && npm install && cd ..
print_success "Dependencias de shared instaladas"

echo ""
echo "========================================="
echo "⚙️  Paso 2: Configurar Variables de Entorno"
echo "========================================="
echo ""

# Backend .env
if [ ! -f "backend/.env" ]; then
    echo "Creando backend/.env..."
    cat > backend/.env << 'EOF'
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/voting_system
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=voting_system
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=dev-secret-change-in-production-use-long-random-string-here
JWT_REFRESH_SECRET=dev-refresh-secret-also-change-this-in-production
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# Encryption
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
LOG_SIGNING_SECRET=dev-log-signing-secret-change-in-production

# Crypto Service
CRYPTO_SERVICE_URL=http://localhost:4000

# Server
NODE_ENV=development
PORT=5000

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMITS_ENABLED=true
EOF
    print_success "backend/.env creado"
else
    print_warning "backend/.env ya existe, no se sobrescribió"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    echo "Creando frontend/.env..."
    cat > frontend/.env << 'EOF'
VITE_API_URL=http://localhost:5000/api
VITE_CRYPTO_SERVICE_URL=http://localhost:4000
NODE_ENV=development
EOF
    print_success "frontend/.env creado"
else
    print_warning "frontend/.env ya existe, no se sobrescribió"
fi

# Crypto Service .env
if [ ! -f "crypto-service/.env" ]; then
    echo "Creando crypto-service/.env..."
    cat > crypto-service/.env << 'EOF'
NODE_ENV=development
PORT=4000
LOG_LEVEL=debug
EOF
    print_success "crypto-service/.env creado"
else
    print_warning "crypto-service/.env ya existe, no se sobrescribió"
fi

echo ""
echo "========================================="
echo "🐳 Paso 3: Iniciar Docker Containers"
echo "========================================="
echo ""

echo "Iniciando PostgreSQL y Redis..."
docker-compose up -d postgres redis

echo "Esperando a que los servicios estén listos..."
sleep 10

# Verificar PostgreSQL
if docker exec voting-system-postgres pg_isready -U postgres &> /dev/null; then
    print_success "PostgreSQL está listo"
else
    print_error "PostgreSQL no está respondiendo"
    exit 1
fi

# Verificar Redis
if docker exec voting-system-redis redis-cli ping &> /dev/null; then
    print_success "Redis está listo"
else
    print_error "Redis no está respondiendo"
    exit 1
fi

echo ""
echo "========================================="
echo "🗄️  Paso 4: Configurar Base de Datos"
echo "========================================="
echo ""

# Crear base de datos
echo "Creando base de datos..."
docker exec voting-system-postgres psql -U postgres -c "DROP DATABASE IF EXISTS voting_system;" 2>/dev/null || true
docker exec voting-system-postgres psql -U postgres -c "CREATE DATABASE voting_system;" 2>/dev/null || true
print_success "Base de datos 'voting_system' creada"

# Ejecutar migrations (si existen)
if [ -f "backend/src/database/init.sql" ]; then
    echo "Ejecutando script de inicialización..."
    docker exec -i voting-system-postgres psql -U postgres -d voting_system < backend/src/database/init.sql
    print_success "Script de inicialización ejecutado"
fi

echo ""
echo "========================================="
echo "✅ ¡Setup Completado!"
echo "========================================="
echo ""

print_success "Todo está listo para desarrollo local"
echo ""
echo "📝 Próximos pasos:"
echo ""
echo "1. Iniciar los servicios en terminales separadas:"
echo ""
echo "   ${YELLOW}Terminal 1 - Backend:${NC}"
echo "   cd backend && npm run dev"
echo ""
echo "   ${YELLOW}Terminal 2 - Crypto Service:${NC}"
echo "   cd crypto-service && npm run dev"
echo ""
echo "   ${YELLOW}Terminal 3 - Frontend:${NC}"
echo "   cd frontend && npm run dev"
echo ""
echo "2. Acceder a:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:5000"
echo "   Crypto:    http://localhost:4000"
echo ""
echo "3. Ver logs de Docker:"
echo "   docker-compose logs -f"
echo ""
echo "🚀 ${GREEN}¡Happy coding!${NC}"
echo ""

