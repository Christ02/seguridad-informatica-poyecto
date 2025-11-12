# Sistema Electoral Digital - Deployment Instructions

## ✅ Backend desplegado en Railway
- **URL**: https://voting-system-secure-production.up.railway.app
- **Base de datos**: PostgreSQL (Railway Postgres-KRNX)
- **Status**: ✅ DEPLOYED & RUNNING

## 📋 Frontend Deployment en Vercel

### Paso 1: Instalar Vercel CLI (si no lo tienes)
```bash
npm install -g vercel
```

### Paso 2: Login en Vercel
```bash
vercel login
```

### Paso 3: Deploy desde la carpeta frontend
```bash
cd frontend
vercel
```

### Paso 4: Configurar Variables de Entorno en Vercel

En el dashboard de Vercel o usando CLI, configura:

**Variables requeridas:**
```
VITE_API_URL=https://voting-system-secure-production.up.railway.app/api/v1
VITE_SESSION_TIMEOUT=600000
VITE_API_TIMEOUT=30000
VITE_ENABLE_MFA=false
VITE_ENABLE_WEBAUTHN=false
VITE_ENABLE_CAPTCHA=false
```

**Usando CLI:**
```bash
vercel env add VITE_API_URL
# Ingresar: https://voting-system-secure-production.up.railway.app/api/v1

vercel env add VITE_SESSION_TIMEOUT
# Ingresar: 600000

vercel env add VITE_API_TIMEOUT
# Ingresar: 30000

vercel env add VITE_ENABLE_MFA
# Ingresar: false

vercel env add VITE_ENABLE_WEBAUTHN
# Ingresar: false

vercel env add VITE_ENABLE_CAPTCHA
# Ingresar: false
```

### Paso 5: Deploy a Producción
```bash
vercel --prod
```

## 🔗 URLs del Sistema

### Backend (Railway)
- **API Base**: https://voting-system-secure-production.up.railway.app/api/v1
- **Health Check**: https://voting-system-secure-production.up.railway.app/api/v1
- **Swagger Docs**: https://voting-system-secure-production.up.railway.app/api/v1/docs (si está habilitado)

### Frontend (Vercel)
- Se generará automáticamente después del deployment
- Formato: `https://[tu-proyecto].vercel.app`

## 🔐 Seguridad

### Backend
- ✅ HTTPS habilitado
- ✅ JWT Authentication
- ✅ Rate Limiting
- ✅ Helmet (Security Headers)
- ✅ CORS configurado
- ✅ PostgreSQL con SSL
- ✅ Validación de datos con class-validator
- ✅ Audit Logging
- ✅ Soft Deletes

### Frontend
- ✅ HTTPS (Vercel automático)
- ✅ Content Security Policy
- ✅ Secure Headers
- ✅ XSS Protection
- ✅ CSRF Protection
- ✅ Session Management
- ✅ Client-side Rate Limiting

## 📊 Base de Datos

Las tablas se crearon automáticamente con TypeORM synchronize.

**Tablas creadas:**
- `users` - Usuarios del sistema
- `elections` - Elecciones
- `candidates` - Candidatos
- `votes` - Votos (encriptados)
- `audit_logs` - Logs de auditoría
- `sessions` - Sesiones de usuario

## 🚀 Auto-Deploy

### Backend (Railway)
- ✅ Configurado con GitHub
- ✅ Auto-deploy en cada push a `main`
- ✅ Branch: `main`

### Frontend (Vercel)
- Después del primer deploy, Vercel detecta automáticamente:
  - Nuevos commits en `main`
  - Auto-build y auto-deploy
  - Preview deployments para PRs

## 📝 Notas Importantes

1. **Variables de Entorno**: Asegúrate de configurar todas las variables en Vercel antes del deploy
2. **CORS**: El backend ya está configurado para aceptar requests desde cualquier origen (`CORS_ORIGIN=*`)
3. **HTTPS**: Tanto Railway como Vercel proveen HTTPS automáticamente
4. **Migraciones**: Actualmente usando TypeORM synchronize. Para producción real, considera usar migraciones.

## 🔄 Rollback

### Backend (Railway)
```bash
railway rollback [DEPLOYMENT_ID]
```

### Frontend (Vercel)
```bash
vercel rollback [DEPLOYMENT_URL]
```

## 📞 Troubleshooting

### Backend no responde
1. Verificar logs: `railway logs`
2. Verificar variables de entorno: `railway variables`
3. Verificar status de la base de datos

### Frontend no conecta al backend
1. Verificar `VITE_API_URL` en Vercel
2. Verificar CORS en el backend
3. Verificar console del navegador para errores

## 🎉 Sistema Completamente Funcional

- ✅ Backend desplegado en Railway con HTTPS
- ✅ Base de datos PostgreSQL configurada y con tablas
- ✅ Auto-deploy configurado desde GitHub
- ⏳ Frontend listo para deploy en Vercel

