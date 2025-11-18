-- ============================================
-- SCRIPT RÁPIDO: Verificar y Cerrar Elección
-- ============================================
-- Ejecutar en Railway → Postgres-KRNX → Data → Query

-- 1️⃣ VER TODAS LAS ELECCIONES
SELECT 
    id,
    title,
    status,
    "isActive",
    "startDate",
    "endDate",
    "totalVotes"
FROM elections
ORDER BY "createdAt" DESC;

-- ============================================
-- 📊 RESULTADO ESPERADO:
-- Deberías ver una lista de elecciones
-- Busca una con status = 'ACTIVE'
-- ============================================

-- 2️⃣ CERRAR LA PRIMERA ELECCIÓN ACTIVA
-- (Descomenta las siguientes líneas después de ver los resultados)

/*
UPDATE elections 
SET 
    status = 'CLOSED',
    "isActive" = false
WHERE status = 'ACTIVE' 
LIMIT 1
RETURNING id, title, status;
*/

-- ============================================
-- 3️⃣ VERIFICAR QUE SE CERRÓ
-- (Descomenta después de ejecutar el UPDATE)

/*
SELECT 
    id,
    title,
    status,
    "isActive"
FROM elections
WHERE status = 'CLOSED';
*/

-- ============================================
-- ✅ DESPUÉS DE EJECUTAR:
-- 1. Espera 5 segundos
-- 2. Ve a: https://frontend-delta-six-81.vercel.app/results
-- 3. Hard refresh: Ctrl+Shift+R
-- 4. Deberías ver la elección cerrada
-- ============================================

