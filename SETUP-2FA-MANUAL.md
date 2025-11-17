# 🔐 Configuración Manual de 2FA - Paso a Paso

## ✅ Checklist Rápido

- [ ] Configurar variables en Railway
- [ ] Crear tabla `two_factor_codes` en PostgreSQL
- [ ] Verificar deployment
- [ ] Probar login con 2FA

---

## 📋 PASO 1: Configurar Variables en Railway

### 1.1 Acceder a Railway
1. Ve a: https://railway.app
2. Selecciona tu proyecto: **voting-system-secure**
3. Click en el servicio: **voting-system-secure** (backend)
4. Click en la pestaña: **Variables**

### 1.2 Eliminar Variables Antiguas (si existen)
Busca y elimina estas variables (click en el ícono de basura 🗑️):
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`

### 1.3 Agregar Nuevas Variables
Click en **"New Variable"** o **"Raw Editor"** y agrega:

```env
RESEND_API_KEY=re_VWu6DSi9_KGfXBucqph5zZ3njBq3p1Cnp
EMAIL_FROM=onboarding@resend.dev
NODE_ENV=production
```

### 1.4 Guardar
- Click **"Add"** o **"Update Variables"**
- Railway reiniciará automáticamente (2-3 minutos)

---

## 📋 PASO 2: Crear Tabla en PostgreSQL

### 2.1 Acceder a PostgreSQL en Railway
1. En Railway, click en el servicio: **Postgres-KRNX**
2. Click en la pestaña: **Data**
3. Click en el botón: **Query** (arriba a la derecha)

### 2.2 Ejecutar SQL
Copia y pega este SQL completo:

```sql
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

-- Verificar que se creó correctamente
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'two_factor_codes'
ORDER BY 
    ordinal_position;
```

### 2.3 Verificar Resultado
Deberías ver:
- `CREATE TABLE` ✅
- `CREATE INDEX` ✅
- `CREATE INDEX` ✅
- Una tabla con las columnas: `id`, `code`, `userId`, `expiresAt`, etc.

---

## 📋 PASO 3: Verificar Deployment

### 3.1 Ver Logs del Backend
1. En Railway → **voting-system-secure** (backend)
2. Click en **Deployments**
3. Click en el deployment más reciente
4. Revisa los logs

### 3.2 Buscar en Logs
Deberías ver líneas como:
```
✅ Database connected
✅ TwoFactorService initialized
✅ EmailService initialized
🚀 Application is running on port 4000
```

### 3.3 Si hay errores
Busca líneas con `❌` o `ERROR` y reporta.

---

## 📋 PASO 4: Probar el Sistema 2FA

### 4.1 Ir al Login
1. Abre: https://frontend-delta-six-81.vercel.app/login
2. **Hard refresh:** `Ctrl+Shift+R` (Windows) o `Cmd+Shift+R` (Mac)

### 4.2 Iniciar Sesión
Ingresa:
- **Email:** `christianbarrios@ufm.edu`
- **Password:** `Lolipop1234!`
- Click **"Ingresar"**

### 4.3 Pantalla de Verificación 2FA
Deberías ver:
- ✅ Pantalla con 6 campos para el código
- ✅ Mensaje: "Hemos enviado un código de 6 dígitos a tu email"
- ✅ Tu email: `christ...@ufm.edu`

### 4.4 Revisar Email
1. Abre tu email: `christianbarrios@ufm.edu`
2. Busca email de: `onboarding@resend.dev`
3. Asunto: **"🔐 Código de verificación de dos factores"**
4. Copia el código de 6 dígitos

### 4.5 Ingresar Código
1. Pega o escribe el código en la pantalla
2. El código se enviará automáticamente
3. Deberías entrar al dashboard ✅

### 4.6 Segundo Email (Notificación)
Recibirás un segundo email:
- Asunto: **"✅ Inicio de sesión en tu cuenta"**
- Con detalles de IP, navegador, fecha/hora

---

## 🔍 Troubleshooting

### ❌ No recibo el email
**Posibles causas:**
1. Variables mal configuradas en Railway
2. `NODE_ENV` no está en `production`
3. Tabla no creada correctamente

**Solución:**
1. Verifica variables en Railway (PASO 1)
2. Revisa logs del backend:
   ```
   Busca: "📧 Código 2FA enviado" ← Éxito
   Busca: "❌ Error enviando código" ← Problema
   ```

### ❌ Error 500 al hacer login
**Posibles causas:**
1. Tabla `two_factor_codes` no existe
2. Error en la base de datos

**Solución:**
1. Ejecuta nuevamente el SQL del PASO 2
2. Verifica en Railway → Postgres → Data → Tables
3. Debe aparecer `two_factor_codes`

### ❌ Código inválido o expirado
**Posibles causas:**
1. El código expira en 10 minutos
2. Ya usaste ese código

**Solución:**
1. Click en "Reenviar código"
2. Usa el código más reciente de tu email

### ❌ Frontend no muestra pantalla 2FA
**Posibles causas:**
1. Frontend no actualizado
2. Cache del navegador

**Solución:**
1. Hard refresh: `Ctrl+Shift+R` o `Cmd+Shift+R`
2. Limpia cache del navegador
3. Abre en ventana incógnito

---

## 📊 Verificación Final

### ✅ Checklist de Éxito

- [ ] Variables configuradas en Railway
- [ ] Tabla `two_factor_codes` existe en PostgreSQL
- [ ] Backend reiniciado sin errores
- [ ] Login muestra pantalla 2FA
- [ ] Email recibido con código
- [ ] Código funciona y entra al dashboard
- [ ] Email de notificación recibido

---

## 🎯 Características del Sistema 2FA

### 🔐 Seguridad
- ✅ Códigos de 6 dígitos aleatorios
- ✅ Expiración en 10 minutos
- ✅ Un solo uso por código
- ✅ Detección de dispositivos nuevos
- ✅ Tracking de IP y User Agent
- ✅ Notificaciones de login

### 📧 Emails
- ✅ Templates HTML profesionales
- ✅ Advertencias de seguridad
- ✅ Información de dispositivo/ubicación
- ✅ Instrucciones claras

### 🎨 UX
- ✅ Pantalla moderna de verificación
- ✅ 6 campos individuales para el código
- ✅ Auto-focus entre campos
- ✅ Soporte para pegar código completo
- ✅ Botón de reenviar código
- ✅ Opción de cancelar

---

## 📞 Soporte

Si algo no funciona:
1. Revisa los logs de Railway
2. Verifica las variables de entorno
3. Confirma que la tabla existe
4. Prueba en ventana incógnito

---

**Última actualización:** 2025-11-17
**Versión:** 1.0

