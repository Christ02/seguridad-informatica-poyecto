# Frontend Deployment en Vercel - Guía Rápida

## 📋 Pre-requisitos
- Tener cuenta en Vercel (https://vercel.com)
- Vercel CLI instalado globalmente

## 🚀 Pasos de Deployment

### 1. Instalar Vercel CLI (si no lo tienes)
```bash
npm install -g vercel
```

### 2. Login en Vercel
```bash
vercel login
```

### 3. Deploy desde la carpeta frontend
```bash
cd frontend
vercel
```

Cuando Vercel pregunte:
- **Set up and deploy?** → Yes
- **Which scope?** → Tu cuenta personal
- **Link to existing project?** → No
- **Project name?** → `voting-system-frontend` (o el que prefieras)
- **In which directory is your code located?** → `./`
- **Want to override settings?** → No

### 4. Configurar Variables de Entorno

**IMPORTANTE**: Después del primer deploy, configura las variables de entorno en Vercel:

#### Opción A: Usando Vercel CLI
```bash
# VITE_API_URL
vercel env add VITE_API_URL production
# Cuando pregunte, ingresar: https://voting-system-secure-production.up.railway.app/api/v1

# VITE_SESSION_TIMEOUT
vercel env add VITE_SESSION_TIMEOUT production
# Ingresar: 600000

# VITE_API_TIMEOUT
vercel env add VITE_API_TIMEOUT production
# Ingresar: 30000

# VITE_ENABLE_MFA
vercel env add VITE_ENABLE_MFA production
# Ingresar: false

# VITE_ENABLE_WEBAUTHN
vercel env add VITE_ENABLE_WEBAUTHN production
# Ingresar: false

# VITE_ENABLE_CAPTCHA
vercel env add VITE_ENABLE_CAPTCHA production
# Ingresar: false
```

#### Opción B: Usando Vercel Dashboard
1. Ir a https://vercel.com/dashboard
2. Seleccionar tu proyecto
3. Ir a Settings → Environment Variables
4. Agregar cada variable:
   - `VITE_API_URL` = `https://voting-system-secure-production.up.railway.app/api/v1`
   - `VITE_SESSION_TIMEOUT` = `600000`
   - `VITE_API_TIMEOUT` = `30000`
   - `VITE_ENABLE_MFA` = `false`
   - `VITE_ENABLE_WEBAUTHN` = `false`
   - `VITE_ENABLE_CAPTCHA` = `false`

### 5. Re-deploy con Variables de Entorno
```bash
vercel --prod
```

## 🔗 URLs Esperadas

Después del deployment, tendrás:
- **Production URL**: `https://voting-system-frontend-[tu-username].vercel.app`
- **Preview URLs**: Para cada commit/PR

## ✅ Verificación

1. Visita la URL de producción
2. Verifica que puedes ver la página de login
3. Intenta hacer login con las credenciales del admin:
   - Email: `barriosc31@gmail.com`
   - Password: `Admin123!@#`

## 🔄 Auto-Deploy

Vercel detectará automáticamente:
- Nuevos commits en `main` → Deploy a production
- Pull Requests → Preview deployments

## 📝 Notas Importantes

- ✅ El frontend se conectará automáticamente al backend en Railway
- ✅ HTTPS está habilitado automáticamente en Vercel
- ✅ Las variables de entorno solo están disponibles en build time (Vite las embebe)
- ⚠️ Si cambias variables de entorno, necesitas re-deploy

## 🐛 Troubleshooting

### Error: "Cannot connect to backend"
- Verificar que `VITE_API_URL` esté configurado correctamente
- Verificar que el backend en Railway esté activo

### Error: "Network Error"
- Verificar CORS en el backend
- Verificar que la URL del backend sea correcta

### Variables de entorno no funcionan
- Re-deploy el proyecto después de agregar variables
- Verificar que las variables empiecen con `VITE_`

