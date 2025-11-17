-- ============================================
-- SCRIPT PARA CREAR TABLA two_factor_codes
-- ============================================
-- 
-- INSTRUCCIONES:
-- 1. Ve a Railway → Tu proyecto → Postgres-KRNX
-- 2. Click en "Data" tab
-- 3. Click en "Query" (botón arriba a la derecha)
-- 4. Copia y pega TODO este archivo
-- 5. Click "Run Query"
-- 
-- ============================================

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

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver todas las columnas de la tabla creada
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'two_factor_codes'
ORDER BY 
    ordinal_position;

-- Contar registros (debe ser 0 al inicio)
SELECT COUNT(*) as total_codes FROM two_factor_codes;

-- Ver constraints
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'two_factor_codes'
ORDER BY tc.constraint_type, tc.constraint_name;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- 
-- Deberías ver:
-- 1. CREATE TABLE
-- 2. CREATE INDEX (2 veces)
-- 3. Tabla con 9 columnas:
--    - id (uuid)
--    - code (character varying)
--    - userId (uuid)
--    - expiresAt (timestamp without time zone)
--    - ipAddress (character varying)
--    - userAgent (text)
--    - isNewDevice (boolean)
--    - createdAt (timestamp without time zone)
--    - updatedAt (timestamp without time zone)
-- 4. total_codes = 0
-- 5. 3 constraints:
--    - PRIMARY KEY en id
--    - FOREIGN KEY en userId
--    - UNIQUE en userId + code
-- 
-- ============================================
-- ✅ Si ves todo esto, la tabla está lista!
-- ============================================

