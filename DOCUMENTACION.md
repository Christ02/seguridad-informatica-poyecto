# Documentación Completa - VoteSecure

## Descripción General

**VoteSecure** es un sistema de votación electrónica seguro desarrollado con tecnologías modernas, que implementa autenticación de dos factores (2FA), encriptación end-to-end, y auditoría completa de todas las acciones.

### Arquitectura

```
VoteSecure/
 backend/ # API REST con NestJS
 frontend/ # Aplicación web con React + TypeScript
 .github/ # CI/CD y seguridad automatizada
```

---

## Stack Tecnológico

### Backend

- **Framework:** NestJS (Node.js + TypeScript)
- **Base de datos:** PostgreSQL
- **ORM:** TypeORM
- **Autenticación:** JWT + Passport
- **Email:** Resend
- **Seguridad:** Helmet, CORS, Rate Limiting
- **Validación:** class-validator, class-transformer
- **Cron Jobs:** @nestjs/schedule

### Frontend

- **Framework:** React 18 + TypeScript
- **Routing:** React Router DOM v6
- **Estado:** Zustand
- **HTTP Client:** Axios
- **PDF Generation:** jsPDF + jspdf-autotable
- **Build Tool:** Vite
- **Estilos:** CSS Modules

### DevOps

- **Hosting Backend:** Railway
- **Hosting Frontend:** Vercel
- **CI/CD:** GitHub Actions
- **Containerización:** Docker
- **Security Scans:** TruffleHog, Trivy, CodeQL

---

## Estructura del Proyecto

### Backend (`/backend`)

```
backend/
 src/
 main.ts # Punto de entrada de la aplicación
 app.module.ts # Módulo raíz
 app.controller.ts # Controlador principal
 app.service.ts # Servicio principal
 
 common/ # Código compartido
 decorators/
 roles.decorator.ts # Decorador @Roles() para autorización
 enums/
 user-role.enum.ts # Enum de roles (VOTER, ADMIN, SUPER_ADMIN)
 
 config/ # Configuraciones
 database.config.ts # Configuración de PostgreSQL
 mongodb.config.ts # Configuración de MongoDB (opcional)
 redis.config.ts # Configuración de Redis (opcional)
 
 database/ # Base de datos
 migrations/ # Migraciones de TypeORM
 1700000000000-CreateTwoFactorCodesTable.ts
 seeds/ # Seeds para datos iniciales
 run-seeds.ts # Script para ejecutar seeds
 seed.ts # Seed principal
 users.seed.ts # Seed de usuarios
 elections.seed.ts # Seed de elecciones
 
 modules/ # Módulos funcionales
 
 admin/ # Módulo de Administración
 admin.controller.ts # Endpoints de admin
 admin.service.ts # Lógica de negocio admin
 admin.module.ts # Configuración del módulo
 dto/
 admin.dto.ts # DTOs para estadísticas y reportes
 
 audit/ # Módulo de Auditoría
 audit.service.ts # Registro de acciones
 audit.module.ts # Configuración del módulo
 entities/
 audit-log.entity.ts # Entidad de logs de auditoría
 
 auth/ # Módulo de Autenticación
 auth.controller.ts # Endpoints: login, register, 2FA
 auth.service.ts # Lógica de autenticación
 auth.module.ts # Configuración del módulo
 dto/
 login.dto.ts # DTO para login
 register.dto.ts # DTO para registro
 entities/
 two-factor-code.entity.ts # Entidad de códigos 2FA
 guards/
 jwt-auth.guard.ts # Guard de autenticación JWT
 jwt-refresh.guard.ts # Guard de refresh token
 roles.guard.ts # Guard de autorización por roles
 services/
 email.service.ts # Envío de emails (Resend)
 two-factor.service.ts # Lógica de 2FA
 strategies/
 jwt.strategy.ts # Estrategia JWT
 jwt-refresh.strategy.ts # Estrategia refresh token
 
 candidates/ # Módulo de Candidatos
 candidates.controller.ts # CRUD de candidatos
 candidates.service.ts # Lógica de candidatos
 candidates.module.ts # Configuración del módulo
 entities/
 candidate.entity.ts # Entidad de candidato
 
 elections/ # Módulo de Elecciones
 elections.controller.ts # CRUD de elecciones
 elections.service.ts # Lógica de elecciones
 elections.module.ts # Configuración del módulo
 elections-scheduler.service.ts # Cron jobs (activar/cerrar)
 dto/
 create-election.dto.ts # DTO para crear elección
 update-election.dto.ts # DTO para actualizar elección
 entities/
 election.entity.ts # Entidad de elección
 
 users/ # Módulo de Usuarios
 users.controller.ts # CRUD de usuarios
 users.service.ts # Lógica de usuarios
 users.module.ts # Configuración del módulo
 dto/
 update-profile.dto.ts # DTO para actualizar perfil
 entities/
 user.entity.ts # Entidad de usuario
 
 votes/ # Módulo de Votos
 votes.controller.ts # Endpoints de votación
 votes.service.ts # Lógica de votos
 votes.module.ts # Configuración del módulo
 dto/
 cast-vote.dto.ts # DTO para emitir voto
 verify-vote.dto.ts # DTO para verificar voto
 entities/
 vote.entity.ts # Entidad de voto

 Dockerfile # Dockerfile para backend
 package.json # Dependencias de Node.js
 tsconfig.json # Configuración de TypeScript
 nest-cli.json # Configuración de NestJS CLI
 env.example # Ejemplo de variables de entorno
 railway.json # Configuración de Railway
 railway.toml # Configuración de Railway
```

---

### Frontend (`/frontend`)

```
frontend/
 src/
 main.tsx # Punto de entrada de React
 App.tsx # Componente raíz con rutas
 App.css # Estilos globales de App
 index.css # Estilos globales
 
 components/ # Componentes Reutilizables
 AdminLayout.tsx # Layout para panel de admin
 AdminLayout.css
 Sidebar.tsx # Barra lateral de navegación
 Sidebar.css
 LoadingSpinner.tsx # Spinner de carga
 LoadingSpinner.css
 Skeleton.tsx # Skeleton loader
 Skeleton.css
 Toast.tsx # Notificaciones toast
 Toast.css
 ToastContainer.tsx # Contenedor de toasts
 ToastContainer.css
 VoteReceiptModal.tsx # Modal de recibo de voto
 VoteReceiptModal.css
 
 features/ # Features por Dominio
 
 auth/ # Feature de Autenticación
 components/
 LoginForm.tsx # Formulario de login
 LoginForm.css
 RegisterForm.tsx # Formulario de registro
 RegisterForm.css
 TwoFactorVerification.tsx # Verificación 2FA
 TwoFactorVerification.css
 hooks/
 useAuth.ts # Hook de autenticación
 services/
 mfa.service.ts # Servicio de MFA
 store/
 authStore.ts # Estado global de auth (Zustand)
 
 pages/ # Páginas de la Aplicación
 
 Dashboard.tsx # Dashboard de usuario
 Dashboard.css
 VotingPage.tsx # Página de votación
 VotingPage.css
 VotingHistory.tsx # Historial de votos del usuario
 VotingHistory.css
 ResultsListPage.tsx # Lista de resultados
 ResultsListPage.css
 ResultsPage.tsx # Resultados detallados
 ResultsPage.css
 ProfilePage.tsx # Perfil de usuario
 ProfilePage.css
 SettingsPage.tsx # Configuración
 SettingsPage.css
 HelpPage.tsx # Ayuda
 HelpPage.css
 
 AdminDashboard.tsx # Dashboard de administrador
 AdminDashboard.css
 
 admin/ # Páginas de Administración
 CreateElection.tsx # Crear/editar elecciones
 CreateElection.css
 ManageCandidates.tsx # Gestionar candidatos
 ManageCandidates.css
 ManageVoters.tsx # Gestionar votantes
 ManageVoters.css
 ElectionResults.tsx # Resultados de elección (admin)
 ElectionResults.css
 AdminVotesHistory.tsx # Historial de votos (admin)
 AdminVotesHistory.css
 
 services/ # Servicios de API
 api.service.ts # Cliente HTTP base (Axios)
 auth.api.ts # API de autenticación
 users.api.ts # API de usuarios
 elections.api.ts # API de elecciones
 candidates.api.ts # API de candidatos
 votes.api.ts # API de votos
 admin.api.ts # API de administración
 
 hooks/ # 🪝 Custom Hooks
 useToast.ts # Hook para notificaciones
 
 utils/ # Utilidades
 crypto.ts # Funciones de encriptación
 validation.ts # Validaciones de formularios
 sanitize.ts # Sanitización de inputs
 logger.ts # Logger del cliente
 pdfGenerator.ts # Generación de PDFs (usuario)
 adminPdfGenerator.ts # Generación de PDFs (admin)
 
 types/ # Tipos de TypeScript
 index.ts # Tipos compartidos
 
 config/ # Configuraciones
 security.config.ts # Configuración de seguridad
 
 data/ # Datos Estáticos
 guatemala-locations.ts # Departamentos y municipios
 
 styles/ # Estilos Compartidos
 admin-shared.css # Estilos compartidos de admin

 public/ # Archivos Públicos
 vote-icon.svg # Favicon personalizado
 vite.svg # Logo de Vite

 index.html # HTML principal
 Dockerfile # Dockerfile para frontend
 nginx.conf # Configuración de Nginx
 package.json # Dependencias de Node.js
 tsconfig.json # Configuración de TypeScript
 vite.config.ts # Configuración de Vite
 vitest.config.ts # Configuración de Vitest (tests)
 vercel.json # Configuración de Vercel
```

---

## Módulos del Backend - Detalle

### 1. **Auth Module** (`/modules/auth`)

**Responsabilidad:** Autenticación y autorización de usuarios.

#### Archivos Principales:

- **`auth.controller.ts`**
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión (genera código 2FA)
- `POST /auth/verify-2fa` - Verificar código 2FA y completar login
- `POST /auth/logout` - Cerrar sesión
- `POST /auth/refresh` - Refrescar access token
- `GET /auth/me` - Obtener perfil del usuario autenticado
- **`auth.service.ts`**
- `register()` - Crear usuario con contraseña hasheada
- `login()` - Validar credenciales y generar código 2FA
- `verify2FAAndCompleteLogin()` - Verificar 2FA y generar tokens JWT
- `validateUser()` - Validar credenciales
- `generateTokens()` - Generar access y refresh tokens
- **`email.service.ts`**
- `send2FACode()` - Enviar código 2FA por email (Resend)
- `sendLoginNotification()` - Notificar login desde nuevo dispositivo
- **`two-factor.service.ts`**
- `generateAndSend2FACode()` - Generar código de 6 dígitos y enviarlo
- `verify2FACode()` - Validar código 2FA
- `isNewDevice()` - Detectar si es un dispositivo nuevo

#### Entidades:

- **`two-factor-code.entity.ts`**
- Almacena códigos 2FA temporales (10 min de expiración)
- Campos: `code`, `userId`, `expiresAt`, `ipAddress`, `userAgent`, `isNewDevice`

#### Guards:

- **`jwt-auth.guard.ts`** - Protege rutas que requieren autenticación
- **`jwt-refresh.guard.ts`** - Protege ruta de refresh token
- **`roles.guard.ts`** - Protege rutas por rol (VOTER, ADMIN, SUPER_ADMIN)

#### Strategies:

- **`jwt.strategy.ts`** - Estrategia para validar access tokens
- **`jwt-refresh.strategy.ts`** - Estrategia para validar refresh tokens

---

### 2. **Elections Module** (`/modules/elections`)

**Responsabilidad:** Gestión de elecciones.

#### Archivos Principales:

- **`elections.controller.ts`**
- `GET /elections` - Listar elecciones (filtradas por rol)
- `GET /elections/:id` - Obtener elección por ID
- `POST /elections` - Crear elección (solo ADMIN)
- `PATCH /elections/:id` - Actualizar elección (solo ADMIN)
- `DELETE /elections/:id` - Eliminar elección (solo ADMIN)
- **`elections.service.ts`**
- `create()` - Crear nueva elección
- `findAll()` - Listar elecciones (con filtros por estado y rol)
- `findOne()` - Obtener elección con candidatos
- `update()` - Actualizar elección
- `remove()` - Soft delete de elección
- `activateElection()` - Activar elección manualmente
- `closeElection()` - Cerrar elección manualmente
- **`elections-scheduler.service.ts`**
- `@Cron('*/5 * * * *')` - Cada 5 minutos:
- Activa elecciones que llegaron a `startDate`
- Cierra elecciones que llegaron a `endDate`

#### Entidades:

- **`election.entity.ts`**
- Estados: `DRAFT`, `ACTIVE`, `CLOSED`, `COMPLETED`
- Campos: `title`, `description`, `startDate`, `endDate`, `status`, `allowMultipleVotes`
- Relaciones: `OneToMany` con `Candidate` y `Vote`

---

### 3. **Candidates Module** (`/modules/candidates`)

**Responsabilidad:** Gestión de candidatos.

#### Archivos Principales:

- **`candidates.controller.ts`**
- `GET /candidates` - Listar candidatos
- `GET /candidates/:id` - Obtener candidato por ID
- `GET /candidates/election/:electionId` - Candidatos de una elección
- `GET /candidates/results/:electionId` - Resultados de candidatos
- `POST /candidates` - Crear candidato (solo ADMIN)
- `PATCH /candidates/:id` - Actualizar candidato (solo ADMIN)
- `DELETE /candidates/:id` - Eliminar candidato (solo ADMIN)
- **`candidates.service.ts`**
- `create()` - Crear candidato
- `findAll()` - Listar candidatos
- `findByElection()` - Candidatos de una elección
- `getResults()` - Obtener resultados con votos y porcentajes
- `update()` - Actualizar candidato
- `remove()` - Soft delete de candidato

#### Entidades:

- **`candidate.entity.ts`**
- Campos: `name`, `description`, `party`, `photoUrl`, `isActive`
- Relaciones: `ManyToOne` con `Election`, `OneToMany` con `Vote`

---

### 4. **Votes Module** (`/modules/votes`)

**Responsabilidad:** Gestión de votos.

#### Archivos Principales:

- **`votes.controller.ts`**
- `POST /votes` - Emitir voto
- `GET /votes/history` - Historial de votos del usuario
- `GET /votes/verify/:voteHash` - Verificar voto por hash
- `GET /votes/check/:electionId` - Verificar si ya votó
- **`votes.service.ts`**
- `castVote()` - Emitir voto con encriptación
- `getVoteHistory()` - Historial de votos del usuario
- `verifyVote()` - Verificar integridad del voto
- `hasUserVoted()` - Verificar si el usuario ya votó
- `generateVoteHash()` - Generar hash único del voto

#### Entidades:

- **`vote.entity.ts`**
- Campos: `voteHash`, `encryptedVote`, `timestamp`, `ipAddress`, `isValid`
- Relaciones: `ManyToOne` con `User`, `Election`, `Candidate`

---

### 5. **Users Module** (`/modules/users`)

**Responsabilidad:** Gestión de usuarios.

#### Archivos Principales:

- **`users.controller.ts`**
- `GET /users` - Listar usuarios (solo ADMIN)
- `GET /users/:id` - Obtener usuario por ID
- `PATCH /users/:id` - Actualizar perfil
- `DELETE /users/:id` - Eliminar usuario (solo ADMIN)
- **`users.service.ts`**
- `create()` - Crear usuario
- `findAll()` - Listar usuarios
- `findOne()` - Obtener usuario por ID
- `findByEmail()` - Buscar usuario por email
- `update()` - Actualizar usuario
- `remove()` - Soft delete de usuario

#### Entidades:

- **`user.entity.ts`**
- Campos: `email`, `password`, `firstName`, `lastName`, `dpi`, `role`, `isActive`
- Relaciones: `OneToMany` con `Vote`, `TwoFactorCode`, `AuditLog`

---

### 6. **Admin Module** (`/modules/admin`)

**Responsabilidad:** Panel de administración y estadísticas.

#### Archivos Principales:

- **`admin.controller.ts`**
- `GET /admin/dashboard/stats` - Estadísticas generales
- `GET /admin/dashboard/activity` - Actividad reciente
- `GET /admin/dashboard/trends` - Tendencias de votos
- `GET /admin/elections/:id/results` - Resultados detallados
- `GET /admin/votes/history` - Historial completo de votos
- **`admin.service.ts`**
- `getDashboardStats()` - Estadísticas del dashboard
- `getRecentActivity()` - Actividad reciente
- `getVotingTrends()` - Tendencias de votación
- `getDetailedResults()` - Resultados con demografía
- `getVotesHistory()` - Historial completo con filtros

---

### 7. **Audit Module** (`/modules/audit`)

**Responsabilidad:** Registro de auditoría de acciones.

#### Archivos Principales:

- **`audit.service.ts`**
- `log()` - Registrar acción en la base de datos
- `logLogin()` - Registrar login
- `logVote()` - Registrar voto
- `logAdminAction()` - Registrar acción de admin

#### Entidades:

- **`audit-log.entity.ts`**
- Campos: `action`, `userId`, `ipAddress`, `userAgent`, `metadata`, `timestamp`

---

## Páginas del Frontend - Detalle

### Páginas de Usuario

#### 1. **Dashboard** (`/pages/Dashboard.tsx`)

- **Ruta:** `/dashboard`
- **Descripción:** Panel principal del usuario
- **Funcionalidades:**
- Ver elecciones activas
- Ver elecciones próximas
- Ver elecciones completadas
- Botón "Votar Ahora" para elecciones activas
- Badge "Ya has votado" si ya votó
- Ver resultados de elecciones cerradas

#### 2. **VotingPage** (`/pages/VotingPage.tsx`)

- **Ruta:** `/vote/:electionId`
- **Descripción:** Página para emitir voto
- **Funcionalidades:**
- Ver información de la elección
- Ver lista de candidatos con fotos
- Seleccionar candidato
- Confirmar voto con modal
- Encriptación del voto antes de enviar

#### 3. **VotingHistory** (`/pages/VotingHistory.tsx`)

- **Ruta:** `/voting-history`
- **Descripción:** Historial de votos del usuario
- **Funcionalidades:**
- Ver lista de votos emitidos
- Ver detalles de cada voto (hash, fecha, elección)
- Exportar historial a PDF
- Ver recibo individual de voto (modal)
- Descargar recibo en PDF

#### 4. **ResultsListPage** (`/pages/ResultsListPage.tsx`)

- **Ruta:** `/results`
- **Descripción:** Lista de elecciones con resultados disponibles
- **Funcionalidades:**
- Ver elecciones cerradas o completadas
- Ver información básica de cada elección
- Botón para ver resultados detallados

#### 5. **ResultsPage** (`/pages/ResultsPage.tsx`)

- **Ruta:** `/results/:electionId`
- **Descripción:** Resultados detallados de una elección
- **Funcionalidades:**
- Ver ganador destacado
- Ver gráfico de resultados
- Ver tabla de candidatos con votos y porcentajes
- Ver total de votos

#### 6. **ProfilePage** (`/pages/ProfilePage.tsx`)

- **Ruta:** `/profile`
- **Descripción:** Perfil del usuario
- **Funcionalidades:**
- Ver información personal
- Editar nombre, apellido, teléfono
- Ver último login
- Ver rol

#### 7. **SettingsPage** (`/pages/SettingsPage.tsx`)

- **Ruta:** `/settings`
- **Descripción:** Configuración de la cuenta
- **Funcionalidades:**
- Cambiar contraseña
- Configurar notificaciones
- Configurar privacidad

#### 8. **HelpPage** (`/pages/HelpPage.tsx`)

- **Ruta:** `/help`
- **Descripción:** Página de ayuda
- **Funcionalidades:**
- Preguntas frecuentes
- Guías de uso
- Contacto de soporte

---

### Páginas de Administrador

#### 1. **AdminDashboard** (`/pages/AdminDashboard.tsx`)

- **Ruta:** `/admin/dashboard`
- **Descripción:** Panel principal del administrador
- **Funcionalidades:**
- Ver estadísticas generales (usuarios, elecciones, votos)
- Ver actividad reciente
- Ver tendencias de votación (gráfico)
- Acceso rápido a funciones de admin

#### 2. **CreateElection** (`/pages/admin/CreateElection.tsx`)

- **Ruta:** `/admin/elections/create` y `/admin/elections/edit/:id`
- **Descripción:** Crear o editar elección
- **Funcionalidades:**
- Formulario de elección (título, descripción, fechas)
- Agregar/editar/eliminar candidatos
- Vista previa de candidatos
- Validación de fechas
- Guardar como borrador o activar

#### 3. **ManageCandidates** (`/pages/admin/ManageCandidates.tsx`)

- **Ruta:** `/admin/candidates`
- **Descripción:** Gestionar candidatos
- **Funcionalidades:**
- Ver lista de candidatos
- Filtrar por elección
- Crear nuevo candidato
- Editar candidato existente
- Eliminar candidato
- Activar/desactivar candidato

#### 4. **ManageVoters** (`/pages/admin/ManageVoters.tsx`)

- **Ruta:** `/admin/voters`
- **Descripción:** Gestionar votantes
- **Funcionalidades:**
- Ver lista de usuarios
- Filtrar por rol
- Buscar por nombre o email
- Ver detalles de usuario
- Activar/desactivar usuario
- Cambiar rol de usuario

#### 5. **ElectionResults** (`/pages/admin/ElectionResults.tsx`)

- **Ruta:** `/admin/results/:electionId`
- **Descripción:** Resultados detallados de elección (admin)
- **Funcionalidades:**
- Ver resultados con demografía
- Ver gráficos avanzados
- Exportar resultados a PDF
- Exportar resultados a CSV
- Ver estadísticas detalladas

#### 6. **AdminVotesHistory** (`/pages/admin/AdminVotesHistory.tsx`)

- **Ruta:** `/admin/votes-history`
- **Descripción:** Historial completo de votos (admin)
- **Funcionalidades:**
- Ver todos los votos del sistema
- Filtrar por elección, usuario, fecha
- Ver votos válidos e inválidos
- Exportar historial a PDF
- Exportar historial a CSV
- Ver detalles de cada voto

---

## Seguridad

### Autenticación y Autorización

1. **JWT (JSON Web Tokens)**

- Access Token: 15 minutos de expiración
- Refresh Token: 7 días de expiración
- Almacenados en `sessionStorage` (frontend)

2. **Two-Factor Authentication (2FA)**

- Código de 6 dígitos enviado por email
- Expiración: 10 minutos
- Detección de nuevo dispositivo
- Notificación por email en login desde nuevo dispositivo

3. **Roles y Permisos**

- `VOTER`: Usuario regular (puede votar)
- `ADMIN`: Administrador (gestiona elecciones)
- `SUPER_ADMIN`: Super administrador (gestiona todo)

4. **Guards**

- `JwtAuthGuard`: Protege rutas autenticadas
- `RolesGuard`: Protege rutas por rol
- `JwtRefreshGuard`: Protege ruta de refresh

### Encriptación

1. **Votos**

- Encriptación AES-256-GCM
- Hash SHA-256 para verificación
- Firma digital para integridad

2. **Contraseñas**

- Bcrypt con salt de 10 rounds
- Nunca se almacenan en texto plano

### Seguridad de Red

1. **CORS**

- Configurado para permitir solo dominios autorizados
- Headers permitidos: `Authorization`, `Content-Type`, etc.

2. **Helmet**

- Security headers automáticos
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`

3. **Rate Limiting**

- 100 requests por minuto por IP
- Protección contra ataques de fuerza bruta

### Auditoría

- Todas las acciones críticas se registran en `audit_logs`
- Información registrada:
- Usuario
- Acción
- IP Address
- User Agent
- Timestamp
- Metadata adicional

---

## Base de Datos

### Entidades Principales

#### 1. **users**

```sql
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, hashed)
- firstName (VARCHAR)
- lastName (VARCHAR)
- dpi (VARCHAR, UNIQUE)
- role (ENUM: VOTER, ADMIN, SUPER_ADMIN)
- isActive (BOOLEAN)
- lastLogin (TIMESTAMP)
- lastLoginIp (VARCHAR)
- lastLoginUserAgent (VARCHAR)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
- deletedAt (TIMESTAMP, nullable)
```

#### 2. **elections**

```sql
- id (UUID, PK)
- title (VARCHAR)
- description (TEXT)
- startDate (TIMESTAMP)
- endDate (TIMESTAMP)
- status (ENUM: DRAFT, ACTIVE, CLOSED, COMPLETED)
- allowMultipleVotes (BOOLEAN)
- isActive (BOOLEAN)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
- deletedAt (TIMESTAMP, nullable)
```

#### 3. **candidates**

```sql
- id (UUID, PK)
- name (VARCHAR)
- description (TEXT)
- party (VARCHAR, nullable)
- photoUrl (VARCHAR, nullable)
- electionId (UUID, FK -> elections)
- isActive (BOOLEAN)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
- deletedAt (TIMESTAMP, nullable)
```

#### 4. **votes**

```sql
- id (UUID, PK)
- voteHash (VARCHAR, UNIQUE)
- encryptedVote (TEXT)
- userId (UUID, FK -> users)
- electionId (UUID, FK -> elections)
- candidateId (UUID, FK -> candidates)
- timestamp (TIMESTAMP)
- ipAddress (VARCHAR)
- isValid (BOOLEAN)
- createdAt (TIMESTAMP)
```

#### 5. **two_factor_codes**

```sql
- id (UUID, PK)
- code (VARCHAR(6))
- userId (UUID, FK -> users)
- expiresAt (TIMESTAMP)
- ipAddress (VARCHAR)
- userAgent (TEXT)
- isNewDevice (BOOLEAN)
- createdAt (TIMESTAMP)
```

#### 6. **audit_logs**

```sql
- id (UUID, PK)
- action (VARCHAR)
- userId (UUID, FK -> users)
- ipAddress (VARCHAR)
- userAgent (TEXT)
- metadata (JSONB)
- timestamp (TIMESTAMP)
```

---

## Deployment

### Backend (Railway)

1. **Variables de Entorno Requeridas:**

```env
# Database
DATABASE_URL=postgresql://...
DATABASE_HOST=...
DATABASE_PORT=5432
DATABASE_NAME=...
DATABASE_USER=...
DATABASE_PASSWORD=...

# JWT
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=onboarding@resend.dev

# CORS
CORS_ORIGIN=https://frontend-domain.vercel.app

# Other
NODE_ENV=production
PORT=4000
SEED_SECRET=...
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

2. **Comandos de Deploy:**

```bash
# Railway detecta automáticamente NestJS
# Build: npm run build
# Start: npm run start:prod
```

### Frontend (Vercel)

1. **Variables de Entorno Requeridas:**

```env
VITE_API_URL=https://backend-domain.railway.app/api/v1
```

2. **Configuración de Vercel:**

```json
{
 "buildCommand": "npm run build",
 "outputDirectory": "dist",
 "installCommand": "npm ci",
 "framework": "vite"
}
```

---

## CI/CD (GitHub Actions)

### Security Scan Workflow

**Archivo:** `.github/workflows/security-scan.yml`

**Jobs:**

1. **Dependency Vulnerability Scan**

- `npm audit` para detectar vulnerabilidades
- Snyk para análisis de dependencias

2. **Code Quality & Security Linting**

- ESLint con reglas de seguridad
- TypeScript compiler check

3. **Secrets & Credentials Scan**

- TruffleHog para detectar secretos en código

4. **Docker Container Security Scan**

- Trivy para escanear vulnerabilidades en imágenes Docker

5. **CodeQL SAST Analysis**

- Análisis estático de código para detectar vulnerabilidades

**Triggers:**

- Push a `main` o `develop`
- Pull requests a `main` o `develop`
- Cron: Todos los lunes a las 9 AM

---

## Dependencias Principales

### Backend

```json
{
 "@nestjs/common": "^10.0.0",
 "@nestjs/core": "^10.0.0",
 "@nestjs/jwt": "^10.0.0",
 "@nestjs/passport": "^10.0.0",
 "@nestjs/schedule": "^4.0.0",
 "@nestjs/typeorm": "^10.0.0",
 "bcrypt": "^5.1.0",
 "class-validator": "^0.14.0",
 "class-transformer": "^0.5.1",
 "passport-jwt": "^4.0.1",
 "pg": "^8.11.0",
 "resend": "^3.0.0",
 "typeorm": "^0.3.17"
}
```

### Frontend

```json
{
 "react": "^18.2.0",
 "react-dom": "^18.2.0",
 "react-router-dom": "^6.20.0",
 "zustand": "^4.4.7",
 "axios": "^1.6.2",
 "jspdf": "^2.5.1",
 "jspdf-autotable": "^3.8.2"
}
```

---

## Testing

### Backend

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend

```bash
# Unit tests con Vitest
npm run test

# Coverage
npm run test:coverage
```

---

## Scripts Útiles

### Backend

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod

# Migraciones
npm run migration:generate -- -n MigrationName
npm run migration:run
npm run migration:revert

# Seeds
npm run seed
```

### Frontend

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview

# Lint
npm run lint
```

---

## Configuración Local

### 1. Clonar Repositorio

```bash
git clone https://github.com/Christ02/seguridad-informatica-poyecto.git
cd seguridad-informatica-poyecto
```

### 2. Backend Setup

```bash
cd backend
npm install
cp env.example .env
# Editar .env con tus credenciales
npm run start:dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
# Crear .env.local
echo "VITE_API_URL=http://localhost:4000/api/v1" > .env.local
npm run dev
```

### 4. Base de Datos

```bash
# Crear base de datos PostgreSQL
createdb votesecure

# Ejecutar migraciones
cd backend
npm run migration:run

# Ejecutar seeds (opcional)
npm run seed
```
