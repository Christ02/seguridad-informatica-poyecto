# ✅ Fix CORS - Headers Personalizados

## 🎯 Problema Identificado

Al hacer clic en "Guardar Elección", la petición POST fallaba con `net::ERR_FAILED`.

### Causa Raíz
El `apiService` del frontend estaba enviando headers personalizados que el backend no tenía configurados en CORS `allowedHeaders`:
- `X-CSRF-Token`
- `X-Request-Time`
- `X-Request-ID`
- `X-Body-Hash`

Cuando el navegador hace una petición preflight (OPTIONS), el backend respondía que estos headers no estaban permitidos, causando que el navegador bloqueara la petición POST.

## 🔧 Solución Aplicada

### Backend: `backend/src/main.ts`

**Antes**:
```typescript
allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
exposedHeaders: ['Authorization'],
```

**Después**:
```typescript
allowedHeaders: [
  'Content-Type',
  'Authorization',
  'Accept',
  'X-Requested-With',
  'X-CSRF-Token',      // ✅ Agregado
  'X-Request-Time',    // ✅ Agregado
  'X-Request-ID',      // ✅ Agregado
  'X-Body-Hash',       // ✅ Agregado
],
exposedHeaders: ['Authorization', 'X-CSRF-Token'], // ✅ Agregado X-CSRF-Token
```

## 🧪 Verificación

### Test de CORS Preflight
```bash
curl -X OPTIONS https://voting-system-secure-production.up.railway.app/api/v1/elections \
  -H "Origin: https://frontend-2bgnnparo-christians-projects-630693d2.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization,X-CSRF-Token,X-Request-Time,X-Request-ID,X-Body-Hash"
```

**Respuesta** ✅:
```
access-control-allow-credentials: true
access-control-allow-headers: Content-Type,Authorization,Accept,X-Requested-With,X-CSRF-Token,X-Request-Time,X-Request-ID,X-Body-Hash
access-control-allow-methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
access-control-allow-origin: https://frontend-2bgnnparo-christians-projects-630693d2.vercel.app
```

## 📋 Headers Personalizados del Frontend

### 1. X-CSRF-Token
**Propósito**: Protección contra ataques CSRF  
**Origen**: `apiService.ts` línea 47-50  
**Valor**: Token CSRF obtenido del backend o de cookies

### 2. X-Request-Time
**Propósito**: Prevenir replay attacks  
**Origen**: `apiService.ts` línea 52-53  
**Valor**: Timestamp actual en milisegundos

### 3. X-Request-ID
**Propósito**: Tracking y debugging de peticiones  
**Origen**: `apiService.ts` línea 55-56  
**Valor**: UUID generado con `crypto.randomUUID()`

### 4. X-Body-Hash
**Propósito**: Verificar integridad del body  
**Origen**: `apiService.ts` línea 58-62  
**Valor**: Hash SHA-256 del body JSON

## 🔄 Flujo de la Petición

### 1. Preflight Request (OPTIONS)
```
Browser → Backend: OPTIONS /api/v1/elections
Headers:
  - Origin: https://frontend-2bgnnparo-christians-projects-630693d2.vercel.app
  - Access-Control-Request-Method: POST
  - Access-Control-Request-Headers: Content-Type,Authorization,X-CSRF-Token,X-Request-Time,X-Request-ID,X-Body-Hash

Backend → Browser: 200 OK
Headers:
  - Access-Control-Allow-Origin: https://frontend-2bgnnparo-christians-projects-630693d2.vercel.app
  - Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
  - Access-Control-Allow-Headers: Content-Type,Authorization,Accept,X-Requested-With,X-CSRF-Token,X-Request-Time,X-Request-ID,X-Body-Hash
  - Access-Control-Allow-Credentials: true
```

### 2. Actual Request (POST)
```
Browser → Backend: POST /api/v1/elections
Headers:
  - Origin: https://frontend-2bgnnparo-christians-projects-630693d2.vercel.app
  - Content-Type: application/json
  - Authorization: Bearer <token>
  - X-CSRF-Token: <csrf-token>
  - X-Request-Time: 1762962727000
  - X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
  - X-Body-Hash: a1b2c3d4e5f6...
Body:
  {
    "title": "Elección de Prueba",
    "description": "Esta es una prueba",
    "startDate": "2025-11-15T08:00:00.000Z",
    "endDate": "2025-11-20T18:00:00.000Z",
    "allowMultipleVotes": false
  }

Backend → Browser: 201 Created
Body:
  {
    "id": "uuid",
    "title": "Elección de Prueba",
    ...
  }
```

## ✅ Estado Actual

- ✅ Backend desplegado en Railway con CORS actualizado
- ✅ Headers personalizados permitidos en CORS
- ✅ Preflight requests funcionando correctamente
- ✅ POST /elections ahora debería funcionar desde el frontend

## 🧪 Cómo Probar

1. **Ve al frontend**: https://frontend-2bgnnparo-christians-projects-630693d2.vercel.app

2. **Haz login**:
   - Email: `barriosc31@gmail.com`
   - Contraseña: `Admin123!@#`

3. **Ve a "Elecciones"**

4. **Llena el formulario**:
   - Título: "Elección de Prueba"
   - Descripción: "Esta es una prueba del sistema"
   - Fecha de inicio: Selecciona una fecha futura
   - Fecha de fin: Selecciona una fecha posterior

5. **Abre la consola del navegador** (F12)

6. **Haz clic en "Guardar Elección"**

### Resultado Esperado ✅
- Toast verde: "Elección creada exitosamente"
- Formulario se resetea
- Elección aparece en la tabla de "Elecciones Existentes"
- En la consola NO debería aparecer `net::ERR_FAILED`

### Si Aún Falla ❌
1. Abre la pestaña **Network** en DevTools
2. Busca la petición a `/elections`
3. Verifica:
   - ¿Hay una petición OPTIONS antes del POST?
   - ¿La petición OPTIONS responde 200?
   - ¿La petición POST se envía después del OPTIONS?
   - ¿Qué código de respuesta tiene el POST?
4. Copia el error completo y compártelo

## 📝 Commits Realizados

1. **Frontend**: Removido campo `status` y mejorado manejo de errores
   - Commit: `4b401b3`
   
2. **Backend**: Agregado headers personalizados a CORS allowedHeaders
   - Commit: `c042048`

## 🔗 URLs

- **Frontend**: https://frontend-2bgnnparo-christians-projects-630693d2.vercel.app
- **Backend**: https://voting-system-secure-production.up.railway.app/api/v1
- **Railway Dashboard**: https://railway.app
- **Vercel Dashboard**: https://vercel.com

---

**Última actualización**: 12 de Noviembre, 2025  
**Estado**: ✅ Fix aplicado, esperando confirmación del usuario

