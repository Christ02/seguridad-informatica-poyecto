# 🚀 Guía de Deployment - Sistema Electoral Digital

Este documento explica cómo desplegar la aplicación completa en Railway (Backend) y Vercel (Frontend) con HTTPS.

## 📋 Prerequisitos

- Cuenta en [Railway](https://railway.app/)
- Cuenta en [Vercel](https://vercel.com/)
- CLI de Railway instalada: `npm install -g @railway/cli`
- CLI de Vercel instalada: `npm install -g vercel`
- Git configurado

## 🗄️ Parte 1: Deploy del Backend en Railway

### Paso 1: Crear proyecto en Railway

1. Ve a [railway.app](https://railway.app/) e inicia sesión
2. Crea un nuevo proyecto
3. Selecciona "Deploy from GitHub repo" o "Empty Project"

### Paso 2: Agregar PostgreSQL

1. En tu proyecto de Railway, haz clic en "+ New"
2. Selecciona "Database" → "PostgreSQL"
3. Railway creará automáticamente la base de datos
4. Copia las credenciales (se configurarán automáticamente)

### Paso 3: Deploy del Backend

**Opción A: Desde GitHub (Recomendado)**

```bash
# 1. Asegúrate de que todo esté commiteado
git add .
git commit -m "Preparar para deployment"
git push origin main

# 2. En Railway:
# - Clic en "+ New" → "GitHub Repo"
# - Selecciona tu repositorio
# - Railway detectará automáticamente el backend
# - Selecciona la carpeta "backend" como root directory
```

**Opción B: Usando Railway CLI**

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Inicializar en el directorio backend
cd backend
railway init

# 4. Vincular con el proyecto
railway link

# 5. Deploy
railway up
```

### Paso 4: Configurar Variables de Entorno en Railway

En el dashboard de Railway, ve a tu servicio backend → Variables:

```bash
# Database (se configuran automáticamente al vincular PostgreSQL)
DATABASE_HOST=${{Postgres.PGHOST}}
DATABASE_PORT=${{Postgres.PGPORT}}
DATABASE_USER=${{Postgres.PGUSER}}
DATABASE_PASSWORD=${{Postgres.PGPASSWORD}}
DATABASE_NAME=${{Postgres.PGDATABASE}}

# JWT (genera claves seguras)
JWT_SECRET=tu-clave-secreta-super-segura-aqui
JWT_REFRESH_SECRET=tu-clave-refresh-super-segura-aqui
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Application
PORT=4000
NODE_ENV=production

# CORS (actualiza con tu dominio de Vercel)
CORS_ORIGIN=https://tu-app.vercel.app

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

### Paso 5: Obtener URL del Backend

Railway generará una URL pública automáticamente:
- Formato: `https://your-backend-production.up.railway.app`
- Copia esta URL para usarla en el frontend

## 🌐 Parte 2: Deploy del Frontend en Vercel

### Paso 1: Preparar el Frontend

```bash
cd frontend

# Asegúrate de que el build funciona localmente
npm run build
```

### Paso 2: Deploy con Vercel

**Opción A: Usando Vercel CLI**

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy (primera vez)
vercel

# Sigue las instrucciones:
# - Set up and deploy? Yes
# - Which scope? Tu cuenta
# - Link to existing project? No
# - Project name? sistema-electoral-frontend
# - In which directory is your code located? ./
# - Want to override settings? No

# 4. Deploy a producción
vercel --prod
```

**Opción B: Desde GitHub (Recomendado)**

1. Ve a [vercel.com](https://vercel.com/)
2. Haz clic en "New Project"
3. Importa tu repositorio de GitHub
4. Configura:
   - Framework Preset: **Vite**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Haz clic en "Deploy"

### Paso 3: Configurar Variables de Entorno en Vercel

En el dashboard de Vercel, ve a tu proyecto → Settings → Environment Variables:

```bash
VITE_API_URL=https://your-backend-production.up.railway.app/api/v1
```

**Importante**: Después de agregar las variables, haz un redeploy:
- Ve a Deployments
- Selecciona el último deployment
- Clic en los tres puntos → "Redeploy"

## 🔒 Parte 3: Configurar CORS y HTTPS

### Actualizar CORS en Railway

1. Ve a Railway → tu servicio backend → Variables
2. Actualiza `CORS_ORIGIN` con tu URL de Vercel:
   ```
   CORS_ORIGIN=https://tu-app.vercel.app
   ```
3. Railway redesplegará automáticamente

### Verificar HTTPS

Ambos servicios tendrán HTTPS automáticamente:
- ✅ Railway: `https://your-backend.railway.app`
- ✅ Vercel: `https://your-app.vercel.app`

## ✅ Verificación del Deployment

### 1. Verificar Backend

```bash
# Test de salud
curl https://your-backend.railway.app/api/v1

# Test de login
curl -X POST https://your-backend.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com","password":"Password123!"}'
```

### 2. Verificar Frontend

1. Abre `https://your-app.vercel.app`
2. Verifica que la página cargue correctamente
3. Intenta hacer login
4. Verifica la consola del navegador (F12) para errores

## 🔧 Troubleshooting

### Error de CORS

Si ves errores de CORS:

1. Verifica que `CORS_ORIGIN` en Railway coincida con tu URL de Vercel
2. Asegúrate de incluir `https://` y sin `/` al final
3. Redeploy el backend después de cambiar variables

### Error de conexión al backend

1. Verifica que `VITE_API_URL` en Vercel sea correcto
2. Debe incluir `https://` y terminar en `/api/v1`
3. Redeploy el frontend después de cambiar variables

### Base de datos no conecta

1. En Railway, verifica que PostgreSQL esté corriendo (verde)
2. Verifica las variables de entorno de la base de datos
3. Revisa los logs: Railway → tu servicio → Logs

### Build falla en Vercel

1. Verifica que `npm run build` funcione localmente
2. Revisa los logs en Vercel → Deployments → último deploy
3. Asegúrate de que todas las dependencias estén en `package.json`

## 📊 Monitoreo

### Railway Logs

```bash
railway logs
```

O en el dashboard: Railway → tu servicio → Logs

### Vercel Logs

En el dashboard: Vercel → tu proyecto → Logs

## 🔄 Actualizar la Aplicación

### Backend

Si usas GitHub:
```bash
git add .
git commit -m "Update backend"
git push origin main
# Railway redespliega automáticamente
```

### Frontend

Si usas GitHub:
```bash
git add .
git commit -m "Update frontend"
git push origin main
# Vercel redespliega automáticamente
```

## 🎉 URLs Finales

Después del deployment, tendrás:

- **Frontend**: `https://sistema-electoral.vercel.app`
- **Backend API**: `https://backend-production.up.railway.app/api/v1`
- **Base de datos**: PostgreSQL en Railway (privada)

## 🔐 Seguridad Post-Deployment

1. ✅ Cambia todos los secretos en Railway
2. ✅ Configura rate limiting adecuado
3. ✅ Revisa logs regularmente
4. ✅ Configura alertas en Railway/Vercel
5. ✅ Habilita 2FA en ambas cuentas

## 📝 Variables de Entorno Resumen

### Railway (Backend)

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| DATABASE_HOST | postgres.railway.internal | Host de PostgreSQL |
| DATABASE_PORT | 5432 | Puerto de PostgreSQL |
| DATABASE_USER | postgres | Usuario de PostgreSQL |
| DATABASE_PASSWORD | *** | Contraseña de PostgreSQL |
| DATABASE_NAME | railway | Nombre de la base de datos |
| JWT_SECRET | *** | Clave secreta para JWT |
| JWT_REFRESH_SECRET | *** | Clave para refresh tokens |
| PORT | 4000 | Puerto del servidor |
| NODE_ENV | production | Entorno de ejecución |
| CORS_ORIGIN | https://app.vercel.app | URL del frontend |

### Vercel (Frontend)

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| VITE_API_URL | https://backend.railway.app/api/v1 | URL del backend |

---

¿Necesitas ayuda con algún paso? 🚀

