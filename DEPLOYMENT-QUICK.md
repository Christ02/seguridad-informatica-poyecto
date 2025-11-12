# 🚀 Guía Rápida de Deployment - Sistema Electoral

## ✅ Estado Actual

- ✅ Backend preparado con Dockerfile
- ✅ PostgreSQL desplegado en Railway
- ✅ Archivos de configuración creados
- ⏳ Backend en proceso de deployment
- ⏳ Frontend pendiente

## 📦 URLs y Credenciales

### Railway Backend
- **Proyecto**: `voting-system-secure`
- **Base de datos**: PostgreSQL ya desplegada
- **Variables configuradas**: Ver dashboard de Railway

### Credenciales de Base de Datos
```
# Railway configura estas automáticamente cuando vinculas PostgreSQL
# Las encontrarás en: Railway Dashboard → Postgres Service → Variables
Host: ${Postgres.PGHOST}
Port: ${Postgres.PGPORT}
User: ${Postgres.PGUSER}
Password: ${Postgres.PGPASSWORD}
Database: ${Postgres.PGDATABASE}
```

## 🔧 Pasos Rápidos para Completar el Deployment

### 1. Completar Backend en Railway

```bash
# En el dashboard de Railway (https://railway.app/project/098eb00c-5336-4b3f-a9fc-766ce4e2a133)

1. Ve al servicio "voting-system-secure"
2. Click en "Settings" → "Root Directory" → Cambia a "backend"
3. Click en "Deploy" → "Deploy"
4. Espera a que el build complete
5. En "Settings" → "Networking" → "Generate Domain"
6. Copia la URL generada (ej: https://voting-system-secure-production.up.railway.app)
```

### 2. Configurar Variables de Entorno en Railway

Ve a "Variables" y agrega:

```bash
# Ya configuradas automáticamente al vincular PostgreSQL:
DATABASE_HOST=${Postgres.PGHOST}
DATABASE_PORT=${Postgres.PGPORT}
DATABASE_USER=${Postgres.PGUSER}
DATABASE_PASSWORD=${Postgres.PGPASSWORD}
DATABASE_NAME=${Postgres.PGDATABASE}

# Agregar manualmente (genera tus propios secretos seguros):
# Para generar secretos: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=TU_SECRETO_JWT_AQUI
JWT_REFRESH_SECRET=TU_SECRETO_REFRESH_AQUI
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=4000
NODE_ENV=production
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
CORS_ORIGIN=https://tu-app.vercel.app
```

### 3. Deploy Frontend en Vercel

#### Opción A: Desde el Dashboard de Vercel (Más fácil)

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en "New Project"
3. Importa tu repositorio de GitHub
4. Configura:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Agrega la variable de entorno:
   - `VITE_API_URL` = `https://tu-backend.up.railway.app/api/v1`
6. Click en "Deploy"
7. Copia la URL de Vercel y actualiza `CORS_ORIGIN` en Railway

#### Opción B: Usando Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Ir a la carpeta frontend
cd frontend

# Login
vercel login

# Deploy
vercel --prod

# Cuando pregunte:
# - Framework: Vite
# - Build command: npm run build
# - Output directory: dist

# Configurar variable de entorno
vercel env add VITE_API_URL production
# Ingresa: https://tu-backend.up.railway.app/api/v1
```

## 🔄 Actualizar CORS

Después de desplegar el frontend:

1. Copia la URL de Vercel (ej: `https://sistema-electoral.vercel.app`)
2. Ve a Railway → Variables
3. Actualiza `CORS_ORIGIN` con la URL de Vercel
4. Railway redesplegará automáticamente

## ✅ Verificación

### Test Backend

```bash
# Verificar que el backend esté corriendo
curl https://tu-backend.up.railway.app/api/v1

# Test de login (necesitas crear un usuario primero)
curl -X POST https://tu-backend.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sistema.com",
    "dpi": "1234567890101",
    "firstName": "Admin",
    "lastName": "Sistema",
    "dateOfBirth": "1990-01-01",
    "phoneNumber": "12345678",
    "password": "Admin123!@#$"
  }'
```

### Test Frontend

1. Abre `https://tu-app.vercel.app`
2. Intenta registrarte
3. Intenta hacer login
4. Verifica la consola del navegador (F12) para errores

## 🐛 Troubleshooting

### Error: "Failed to fetch"
- Verifica que `VITE_API_URL` en Vercel sea correcto
- Verifica que `CORS_ORIGIN` en Railway coincida con tu URL de Vercel

### Error: "CORS policy"
- Actualiza `CORS_ORIGIN` en Railway con tu URL de Vercel (sin `/` al final)
- Redeploy el backend

### Backend no inicia
- Verifica los logs en Railway → Deployments → último deploy → Logs
- Verifica que todas las variables de entorno estén configuradas

### Base de datos no conecta
- Verifica que PostgreSQL esté corriendo (verde en Railway)
- Verifica las variables de base de datos

## 📝 Comandos Útiles

```bash
# Ver logs del backend
railway logs --service voting-system-secure

# Redeploy del backend
cd backend
railway up

# Redeploy del frontend
cd frontend
vercel --prod

# Ver variables
railway variables
```

## 🎉 URLs Finales

Una vez completado el deployment:

- **Frontend**: `https://sistema-electoral-[tu-id].vercel.app`
- **Backend**: `https://voting-system-secure-production.up.railway.app`
- **API Base**: `https://voting-system-secure-production.up.railway.app/api/v1`

## 🔒 Seguridad

- ✅ HTTPS automático en Railway y Vercel
- ✅ Variables secretas configuradas
- ✅ CORS configurado
- ✅ Rate limiting habilitado
- ✅ JWT con secretos seguros

## 📚 Documentación Adicional

- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [Deployment completo](./DEPLOYMENT.md)

---

**¿Necesitas ayuda?** Revisa los logs en Railway y Vercel para más detalles.

