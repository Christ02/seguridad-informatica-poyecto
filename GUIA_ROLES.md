# 🔐 Guía de Roles y Acceso al Sistema

## 📋 Descripción

El sistema de votación ahora incluye **control de acceso basado en roles (RBAC)** que redirige automáticamente a los usuarios según su rol después del login.

---

## 👥 Roles del Sistema

### 1. **Usuario Normal (Voter)**
- **Descripción**: Ciudadano con derecho a voto
- **Acceso a**:
  - Dashboard de votante
  - Emitir votos
  - Ver historial de votaciones
  - Ver resultados de elecciones
  - Perfil personal
  - Configuración de cuenta

### 2. **Administrador (Admin)**
- **Descripción**: Personal administrativo del sistema electoral
- **Acceso a**:
  - Panel de administración completo
  - Gestión de elecciones (crear, editar, cerrar)
  - Gestión de votantes
  - Visualización de reportes y estadísticas
  - Configuración del sistema
  - Monitoreo de actividad

### 3. **Super Administrador (Super Admin)**
- **Descripción**: Administrador con privilegios completos
- **Acceso a**: Todo lo anterior + gestión de otros administradores

### 4. **Auditor (Auditor)**
- **Descripción**: Personal de auditoría y verificación
- **Acceso a**: Reportes, logs de auditoría, verificación de votos (solo lectura)

---

## 🔑 Cómo Iniciar Sesión

### Como Usuario Normal

Usa cualquier ID de cédula o email que **NO** contenga "admin":

```
ID/Email: 123456789
Contraseña: cualquier_contraseña
```

**Resultado**: Redirige a `/dashboard` (Panel de votante)

---

### Como Administrador

Usa cualquiera de estas opciones:

#### Opción 1: Email con "admin"
```
Email: admin@gobierno.gob
Contraseña: cualquier_contraseña
```

#### Opción 2: ID específico de admin
```
ID: 1234567890
Contraseña: cualquier_contraseña
```

#### Opción 3: Usuario "admin"
```
Email: admin
Contraseña: cualquier_contraseña
```

**Resultado**: Redirige a `/admin/dashboard` (Panel de Administración)

---

## 🎯 URLs del Sistema

### Rutas de Usuario Normal
- `/dashboard` - Dashboard principal
- `/votar` - Página de votación
- `/historial` - Historial de votaciones
- `/resultados` - Resultados de elecciones
- `/perfil` - Perfil de usuario
- `/configuracion` - Configuración de cuenta
- `/ayuda` - Centro de ayuda

### Rutas de Administrador
- `/admin/dashboard` - Panel de administración
- `/admin/elections` - Gestión de elecciones
- `/admin/voters` - Gestión de votantes
- `/admin/reports` - Reportes y estadísticas
- `/admin/users` - Gestión de usuarios (próximamente)
- `/admin/audit` - Logs de auditoría (próximamente)

### Rutas Compartidas
- `/login` - Página de inicio de sesión
- `/configuracion` - Configuración (accesible para todos)
- `/ayuda` - Ayuda (accesible para todos)

---

## 🛡️ Protecciones de Seguridad

### 1. **Protección de Rutas**
- Las rutas están protegidas por roles
- Si un usuario normal intenta acceder a `/admin/*`, será redirigido a `/dashboard`
- Si un admin intenta acceder a rutas de usuario, será redirigido a `/admin/dashboard`

### 2. **Redirección Automática**
- La ruta raíz (`/`) redirige automáticamente según el rol:
  - Admin → `/admin/dashboard`
  - Usuario → `/dashboard`
  - No autenticado → `/login`

### 3. **Validación de Sesión**
- Las sesiones expiran después de 15 minutos de inactividad
- Los tokens se validan en cada solicitud
- El sistema detecta intentos de acceso no autorizado

---

## 🔄 Flujo de Autenticación

```
1. Usuario ingresa credenciales en /login
   ↓
2. Sistema valida y detecta el rol
   ↓
3. Sistema genera tokens de sesión
   ↓
4. Redirige según rol:
   • Admin → /admin/dashboard
   • User → /dashboard
   ↓
5. Usuario accede a rutas permitidas
   ↓
6. Sistema verifica permisos en cada ruta
```

---

## 📊 Panel de Administración

### Características Principales

#### 1. **Resumen General**
- Total de votantes registrados
- Elecciones activas
- Votos emitidos hoy
- Tasa de participación

#### 2. **Gestión de Elecciones**
- Crear nueva elección
- Ver elecciones activas
- Gestionar elecciones existentes
- Ver resultados de elecciones finalizadas

#### 3. **Acciones Rápidas**
- Crear nueva elección
- Gestionar votantes
- Ver reportes
- Configuración del sistema

#### 4. **Gráfico de Actividad**
- Visualización de votos por día
- Tendencias de participación
- Análisis de actividad

---

## 🧪 Pruebas de Roles

### Para Desarrolladores

```bash
# Iniciar el frontend
cd /Users/christian/Universidad/Seguridad
docker-compose -f docker-compose.dev.yml up

# Abrir en el navegador
open http://localhost:3000
```

### Casos de Prueba

1. **Login como Usuario Normal**
   - ID: `987654321`
   - Password: `test123`
   - Verifica: Debe redirigir a `/dashboard`

2. **Login como Admin**
   - Email: `admin@test.com`
   - Password: `admin123`
   - Verifica: Debe redirigir a `/admin/dashboard`

3. **Intentar Acceso No Autorizado**
   - Login como usuario normal
   - Navegar manualmente a `/admin/dashboard`
   - Verifica: Debe redirigir a `/dashboard`

4. **Verificar Logout**
   - Login con cualquier rol
   - Click en "Cerrar Sesión"
   - Verifica: Debe redirigir a `/login` y limpiar la sesión

---

## 🔧 Configuración para Producción

### Variables de Entorno

```env
# Backend API
VITE_API_URL=https://api.votacion.gob/v1

# Configuración de Roles
VITE_ADMIN_EMAIL_DOMAIN=@gobierno.gob
VITE_ENABLE_SUPER_ADMIN=true

# Seguridad
VITE_SESSION_TIMEOUT=900000  # 15 minutos
VITE_MAX_LOGIN_ATTEMPTS=5
VITE_LOCKOUT_DURATION=900000  # 15 minutos
```

### Backend Integration

Cuando el backend esté listo, el rol vendrá desde la API:

```typescript
// En LoginForm.tsx - descomentar cuando backend esté listo
const result = await login({
  email: sanitizedEmail,
  password: sanitizedPassword,
  mfaCode: requiresMFA ? mfaCode : undefined,
});

// El backend debe retornar:
{
  success: true,
  user: {
    id: "...",
    email: "...",
    role: "admin" | "voter" | "auditor" | "super_admin",
    // ...
  },
  tokens: {
    accessToken: "...",
    refreshToken: "..."
  }
}
```

---

## 📚 Próximas Funcionalidades

- [ ] Gestión de usuarios administradores
- [ ] Permisos granulares por módulo
- [ ] Logs de auditoría con visualización
- [ ] Panel de auditor con herramientas de verificación
- [ ] Reportes avanzados y exportación
- [ ] Sistema de notificaciones en tiempo real
- [ ] Dashboard personalizable por rol

---

## 🆘 Troubleshooting

### Problema: No puedo acceder como admin

**Solución**: Verifica que tu email contenga "admin" o uses el ID `1234567890`

### Problema: Me redirige constantemente al login

**Solución**: 
1. Limpia el localStorage y sessionStorage
2. Cierra todas las pestañas del navegador
3. Vuelve a iniciar sesión

### Problema: Veo el dashboard incorrecto

**Solución**: 
1. Verifica tu rol en la consola del navegador
2. Cierra sesión y vuelve a iniciar
3. Limpia la caché del navegador

---

**Última actualización**: 11 de Noviembre, 2025
**Versión**: 1.0.0

