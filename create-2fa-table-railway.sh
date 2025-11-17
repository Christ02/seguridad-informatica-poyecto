#!/bin/bash

# Script para crear la tabla two_factor_codes en Railway PostgreSQL
# Ejecutar desde el directorio backend

echo "🔐 Creando tabla two_factor_codes en Railway PostgreSQL..."
echo ""

cd backend

# Crear la tabla usando railway run
railway run --service Postgres-KRNX -- psql -c "
CREATE TABLE IF NOT EXISTS two_factor_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(6) NOT NULL,
    \"userId\" UUID NOT NULL,
    \"expiresAt\" TIMESTAMP NOT NULL,
    \"ipAddress\" VARCHAR(255),
    \"userAgent\" TEXT,
    \"isNewDevice\" BOOLEAN DEFAULT false,
    \"createdAt\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    \"updatedAt\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_two_factor_user 
        FOREIGN KEY (\"userId\") 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT unique_user_code UNIQUE (\"userId\", code)
);

CREATE INDEX IF NOT EXISTS idx_two_factor_user_id ON two_factor_codes(\"userId\");
CREATE INDEX IF NOT EXISTS idx_two_factor_expires_at ON two_factor_codes(\"expiresAt\");
"

echo ""
echo "✅ Tabla creada!"
echo ""
echo "Verificando..."
railway run --service Postgres-KRNX -- psql -c "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name = 'two_factor_codes' ORDER BY ordinal_position;"

