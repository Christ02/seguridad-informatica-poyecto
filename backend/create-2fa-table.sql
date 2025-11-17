-- Script para crear la tabla two_factor_codes
-- Ejecutar este script en Railway PostgreSQL

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
    
    -- Foreign key a users
    CONSTRAINT fk_two_factor_user 
        FOREIGN KEY ("userId") 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    -- Índice único en userId + code
    CONSTRAINT unique_user_code UNIQUE ("userId", code)
);

-- Crear índice en userId para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_two_factor_user_id ON two_factor_codes("userId");

-- Crear índice en expiresAt para limpiezas periódicas
CREATE INDEX IF NOT EXISTS idx_two_factor_expires_at ON two_factor_codes("expiresAt");

-- Verificar que la tabla se creó correctamente
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'two_factor_codes'
ORDER BY 
    ordinal_position;

