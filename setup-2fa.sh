#!/bin/bash

# Script para configurar 2FA completamente
# Autor: AI Assistant
# Fecha: 2025-11-17

set -e  # Exit on error

echo "🚀 =========================================="
echo "   CONFIGURACIÓN DE 2FA - SISTEMA DE VOTACIÓN"
echo "============================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
RESEND_API_KEY="re_VWu6DSi9_KGfXBucqph5zZ3njBq3p1Cnp"
EMAIL_FROM="onboarding@resend.dev"
NODE_ENV="production"

echo -e "${BLUE}📋 Paso 1: Verificando Railway CLI...${NC}"
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI no está instalado${NC}"
    echo "Instala con: npm install -g @railway/cli"
    exit 1
fi
echo -e "${GREEN}✅ Railway CLI encontrado${NC}"
echo ""

echo -e "${BLUE}📋 Paso 2: Verificando conexión a Railway...${NC}"
cd backend
if ! railway status &> /dev/null; then
    echo -e "${YELLOW}⚠️  No estás conectado a Railway${NC}"
    echo "Ejecutando railway link..."
    railway link
fi
echo -e "${GREEN}✅ Conectado a Railway${NC}"
echo ""

echo -e "${BLUE}📋 Paso 3: Configurando variables de entorno...${NC}"
echo "Setting RESEND_API_KEY..."
railway variables --set RESEND_API_KEY="$RESEND_API_KEY" 2>/dev/null || true

echo "Setting EMAIL_FROM..."
railway variables --set EMAIL_FROM="$EMAIL_FROM" 2>/dev/null || true

echo "Setting NODE_ENV..."
railway variables --set NODE_ENV="$NODE_ENV" 2>/dev/null || true

echo -e "${GREEN}✅ Variables configuradas${NC}"
echo ""

echo -e "${BLUE}📋 Paso 4: Eliminando variables SMTP antiguas...${NC}"
railway variables --delete SMTP_HOST 2>/dev/null || echo "SMTP_HOST no existe (ok)"
railway variables --delete SMTP_PORT 2>/dev/null || echo "SMTP_PORT no existe (ok)"
railway variables --delete SMTP_USER 2>/dev/null || echo "SMTP_USER no existe (ok)"
railway variables --delete SMTP_PASSWORD 2>/dev/null || echo "SMTP_PASSWORD no existe (ok)"
echo -e "${GREEN}✅ Variables SMTP eliminadas${NC}"
echo ""

echo -e "${BLUE}📋 Paso 5: Creando tabla two_factor_codes en PostgreSQL...${NC}"
echo "Ejecutando SQL..."

# Crear archivo temporal con el SQL
cat > /tmp/create-2fa-table.sql << 'EOF'
-- Crear la tabla two_factor_codes
CREATE TABLE IF NOT EXISTS two_factor_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(6) NOT NULL,
    "userId" UUID NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "ipAddress" VARCHAR(255),
    "userAgent" TEXT,
    "isNewDevice" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_two_factor_user 
        FOREIGN KEY ("userId") 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT unique_user_code UNIQUE ("userId", code)
);

CREATE INDEX IF NOT EXISTS idx_two_factor_user_id ON two_factor_codes("userId");
CREATE INDEX IF NOT EXISTS idx_two_factor_expires_at ON two_factor_codes("expiresAt");

-- Verificar
SELECT COUNT(*) as table_exists FROM information_schema.tables WHERE table_name = 'two_factor_codes';
EOF

# Ejecutar SQL en Railway
railway run psql -f /tmp/create-2fa-table.sql

echo -e "${GREEN}✅ Tabla creada${NC}"
echo ""

echo -e "${BLUE}📋 Paso 6: Verificando configuración...${NC}"
echo "Variables actuales:"
railway variables
echo ""

echo -e "${BLUE}📋 Paso 7: Reiniciando servicio...${NC}"
echo "El servicio se reiniciará automáticamente con las nuevas variables"
echo "Espera 2-3 minutos para que el deployment termine"
echo ""

echo -e "${GREEN}✅ =========================================="
echo "   CONFIGURACIÓN COMPLETADA"
echo "============================================${NC}"
echo ""
echo -e "${YELLOW}📧 Próximos pasos:${NC}"
echo "1. Espera 2-3 minutos a que Railway reinicie"
echo "2. Ve a: https://frontend-delta-six-81.vercel.app/login"
echo "3. Ingresa: christianbarrios@ufm.edu / Lolipop1234!"
echo "4. Revisa tu email para el código 2FA"
echo "5. ¡Disfruta de la autenticación de dos factores! 🎉"
echo ""
echo -e "${BLUE}🔍 Ver logs:${NC}"
echo "railway logs"
echo ""

