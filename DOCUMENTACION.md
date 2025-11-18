# Documentaci√n Completa - VoteSecure

## Descripci√n General

**VoteSecure** es un sistema de votaci√n electr√≥nica seguro desarrollado con tecnolog√≠as modernas, que implementa autenticaci√≥n de dos factores (2FA), encriptaci√≥n end-to-end, y auditor√≠a completa de todas las acciones.

### üèóÔ∏è Arquitectura

```
VoteSecure/
îú‚îÄ‚îÄ backend/          # API REST con NestJS
îú‚îÄ‚îÄ frontend/         # Aplicaci√≥n web con React + TypeScript
îî‚îÄ‚îÄ .github/          # CI/CD y seguridad automatizada
```

---

## üîß Stack Tecnol√≥gico

### Backend

- **Framework:** NestJS (Node.js + TypeScript)
- **Base de datos:** PostgreSQL
- **ORM:** TypeORM
- **Autenticaci√n:** JWT + Passport
- **Email:** Resend
- **Seguridad:** Helmet, CORS, Rate Limiting
- **Validaci√n:** class-validator, class-transformer
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
- **Containerizaci√n:** Docker
- **Security Scans:** TruffleHog, Trivy, CodeQL

---

## üìÅ Estructura del Proyecto

### üîπ Backend (`/backend`)

```
backend/
îú‚îÄ‚îÄ src/
îÇ   ‚îú‚îÄ‚îÄ main.ts                    # Punto de entrada de la aplicaci√≥n
îÇ   ‚îú‚îÄ‚îÄ app.module.ts              # M√≥dulo ra√≠z
îÇ   ‚îú‚îÄ‚îÄ app.controller.ts          # Controlador principal
îÇ   ‚îú‚îÄ‚îÄ app.service.ts             # Servicio principal
îÇ   ‚îÇ
îÇ   ‚îú‚îÄ‚îÄ common/                    # C√≥digo compartido
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ decorators/
îÇ   ‚îÇ   ‚îÇ   ‚îî‚îÄ‚îÄ roles.decorator.ts # Decorador @Roles() para autorizaci√≥n
îÇ   ‚îÇ   ‚îî‚îÄ‚îÄ enums/
îÇ   ‚îÇ       ‚îî‚îÄ‚îÄ user-role.enum.ts  # Enum de roles (VOTER, ADMIN, SUPER_ADMIN)
îÇ   ‚îÇ
îÇ   ‚îú‚îÄ‚îÄ config/                    # Configuraciones
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ database.config.ts     # Configuraci√≥n de PostgreSQL
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ mongodb.config.ts      # Configuraci√≥n de MongoDB (opcional)
îÇ   ‚îÇ   ‚îî‚îÄ‚îÄ redis.config.ts        # Configuraci√≥n de Redis (opcional)
îÇ   ‚îÇ
îÇ   ‚îú‚îÄ‚îÄ database/                  # Base de datos
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ migrations/            # Migraciones de TypeORM
îÇ   ‚îÇ   ‚îÇ   ‚îî‚îÄ‚îÄ 1700000000000-CreateTwoFactorCodesTable.ts
îÇ   ‚îÇ   ‚îî‚îÄ‚îÄ seeds/                 # Seeds para datos iniciales
îÇ   ‚îÇ       ‚îú‚îÄ‚îÄ run-seeds.ts       # Script para ejecutar seeds
îÇ   ‚îÇ       ‚îú‚îÄ‚îÄ seed.ts            # Seed principal
îÇ   ‚îÇ       ‚îú‚îÄ‚îÄ users.seed.ts      # Seed de usuarios
îÇ   ‚îÇ       ‚îî‚îÄ‚îÄ elections.seed.ts  # Seed de elecciones
îÇ   ‚îÇ
îÇ   ‚îî‚îÄ‚îÄ modules/                   # M√≥dulos funcionales
îÇ       ‚îÇ
îÇ       ‚îú‚îÄ‚îÄ admin/                 # üëë M√≥dulo de Administraci√≥n
îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ admin.controller.ts    # Endpoints de admin
îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ admin.service.ts       # L√≥gica de negocio admin
îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ admin.module.ts        # Configuraci√≥n del m√≥dulo
îÇ       ‚îÇ   ‚îî‚îÄ‚îÄ dto/
îÇ       ‚îÇ       ‚îî‚îÄ‚îÄ admin.dto.ts       # DTOs para estad√≠sticas y reportes
îÇ       ‚îÇ
îÇ       ‚îú‚îÄ‚îÄ audit/                 # üìù M√≥dulo de Auditor√≠a
îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ audit.service.ts       # Registro de acciones
îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ audit.module.ts        # Configuraci√≥n del m√≥dulo
îÇ       ‚îÇ   ‚îî‚îÄ‚îÄ entities/
îÇ       ‚îÇ       ‚îî‚îÄ‚îÄ audit-log.entity.ts # Entidad de logs de auditor√≠a
îÇ       ‚îÇ
îÇ       ‚îú‚îÄ‚îÄ auth/                  # üîê M√≥dulo de Autenticaci√≥n
îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ auth.controller.ts     # Endpoints: login, register, 2FA
îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ auth.service.ts        # L√≥gica de autenticaci√≥n
îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ auth.module.ts         # Configuraci√≥n del m√≥dulo
îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ dto/
îÇ       ‚îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ login.dto.ts       # DTO para login
îÇ       ‚îÇ   ‚îÇ   ‚îî‚îÄ‚îÄ register.dto.ts    # DTO para registro
îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ entities/
îÇ       ‚îÇ   ‚îÇ   ‚îî‚îÄ‚îÄ two-factor-code.entity.ts # Entidad de c√≥digos 2FA
îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ guards/
îÇ       ‚îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ jwt-auth.guard.ts      # Guard de autenticaci√≥n JWT
îÇ       ‚îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ jwt-refresh.guard.ts   # Guard de refresh token
îÇ       ‚îÇ   ‚îÇ   ‚îî‚îÄ‚îÄ roles.guard.ts         # Guard de autorizaci√≥n por roles
îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ services/
îÇ       ‚îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ email.service.ts       # Env√≠o de emails (Resend)
îÇ       ‚îÇ   ‚îÇ   ‚îî‚îÄ‚îÄ two-factor.service.ts  # L√≥gica de 2FA
îÇ       ‚îÇ   ‚îî‚îÄ‚îÄ strategies/
îÇ       ‚îÇ       ‚îú‚îÄ‚îÄ jwt.strategy.ts        # Estrategia JWT
îÇ       ‚îÇ       ‚îî‚îÄ‚îÄ jwt-refresh.strategy.ts # Estrategia refresh token
îÇ       ‚îÇ
îÇ       ‚îú‚îÄ‚îÄ candidates/            # üé≠ M√≥dulo de Candidatos
îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ candidates.controller.ts   # CRUD de candidatos
îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ candidates.service.ts      # L√≥gica de candidatos
îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ candidates.module.ts       # Configuraci√≥n del m√≥dulo
îÇ       ‚îÇ   ‚îî‚îÄ‚îÄ entities/
îÇ       ‚îÇ       ‚îî‚îÄ‚îÄ candidate.entity.ts    # Entidad de candidato
îÇ       ‚îÇ
îÇ       ‚îú‚îÄ‚îÄ elections/             # üó≥Ô∏è M√≥dulo de Elecciones
îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ elections.controller.ts    # CRUD de elecciones
îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ elections.service.ts       # L√≥gica de elecciones
îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ elections.module.ts        # Configuraci√≥n del m√≥dulo
îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ elections-scheduler.service.ts # Cron jobs (activar/cerrar)
îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ dto/
îÇ       ‚îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ create-election.dto.ts # DTO para crear elecci√≥n
îÇ       ‚îÇ   ‚îÇ   ‚îî‚îÄ‚îÄ update-election.dto.ts # DTO para actualizar elecci√≥n
îÇ       ‚îÇ   ‚îî‚îÄ‚îÄ entities/
îÇ       ‚îÇ       ‚îî‚îÄ‚îÄ election.entity.ts     # Entidad de elecci√≥n
îÇ       ‚îÇ
îÇ       ‚îú‚îÄ‚îÄ users/                 # üë§ M√≥dulo de Usuarios
îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ users.controller.ts        # CRUD de usuarios
îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ users.service.ts           # L√≥gica de usuarios
îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ users.module.ts            # Configuraci√≥n del m√≥dulo
îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ dto/
îÇ       ‚îÇ   ‚îÇ   ‚îî‚îÄ‚îÄ update-profile.dto.ts  # DTO para actualizar perfil
îÇ       ‚îÇ   ‚îî‚îÄ‚îÄ entities/
îÇ       ‚îÇ       ‚îî‚îÄ‚îÄ user.entity.ts         # Entidad de usuario
îÇ       ‚îÇ
îÇ       ‚îî‚îÄ‚îÄ votes/                 # üó≥Ô∏è M√≥dulo de Votos
îÇ           ‚îú‚îÄ‚îÄ votes.controller.ts        # Endpoints de votaci√≥n
îÇ           ‚îú‚îÄ‚îÄ votes.service.ts           # L√≥gica de votos
îÇ           ‚îú‚îÄ‚îÄ votes.module.ts            # Configuraci√≥n del m√≥dulo
îÇ           ‚îú‚îÄ‚îÄ dto/
îÇ           ‚îÇ   ‚îú‚îÄ‚îÄ cast-vote.dto.ts       # DTO para emitir voto
îÇ           ‚îÇ   ‚îî‚îÄ‚îÄ verify-vote.dto.ts     # DTO para verificar voto
îÇ           ‚îî‚îÄ‚îÄ entities/
îÇ               ‚îî‚îÄ‚îÄ vote.entity.ts         # Entidad de voto
îÇ
îú‚îÄ‚îÄ Dockerfile                     # Dockerfile para backend
îú‚îÄ‚îÄ package.json                   # Dependencias de Node.js
îú‚îÄ‚îÄ tsconfig.json                  # Configuraci√≥n de TypeScript
îú‚îÄ‚îÄ nest-cli.json                  # Configuraci√≥n de NestJS CLI
îú‚îÄ‚îÄ env.example                    # Ejemplo de variables de entorno
îú‚îÄ‚îÄ railway.json                   # Configuraci√≥n de Railway
îî‚îÄ‚îÄ railway.toml                   # Configuraci√≥n de Railway
```

---

### üîπ Frontend (`/frontend`)

```
frontend/
îú‚îÄ‚îÄ src/
îÇ   ‚îú‚îÄ‚îÄ main.tsx                   # Punto de entrada de React
îÇ   ‚îú‚îÄ‚îÄ App.tsx                    # Componente ra√≠z con rutas
îÇ   ‚îú‚îÄ‚îÄ App.css                    # Estilos globales de App
îÇ   ‚îú‚îÄ‚îÄ index.css                  # Estilos globales
îÇ   ‚îÇ
îÇ   ‚îú‚îÄ‚îÄ components/                # üß© Componentes Reutilizables
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ AdminLayout.tsx        # Layout para panel de admin
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ AdminLayout.css
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ Sidebar.tsx            # Barra lateral de navegaci√≥n
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ Sidebar.css
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ LoadingSpinner.tsx     # Spinner de carga
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ LoadingSpinner.css
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ Skeleton.tsx           # Skeleton loader
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ Skeleton.css
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ Toast.tsx              # Notificaciones toast
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ Toast.css
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ ToastContainer.tsx     # Contenedor de toasts
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ ToastContainer.css
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ VoteReceiptModal.tsx   # Modal de recibo de voto
îÇ   ‚îÇ   ‚îî‚îÄ‚îÄ VoteReceiptModal.css
îÇ   ‚îÇ
îÇ   ‚îú‚îÄ‚îÄ features/                  # üé® Features por Dominio
îÇ   ‚îÇ   ‚îÇ
îÇ   ‚îÇ   ‚îî‚îÄ‚îÄ auth/                  # üîê Feature de Autenticaci√≥n
îÇ   ‚îÇ       ‚îú‚îÄ‚îÄ components/
îÇ   ‚îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ LoginForm.tsx          # Formulario de login
îÇ   ‚îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ LoginForm.css
îÇ   ‚îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ RegisterForm.tsx       # Formulario de registro
îÇ   ‚îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ RegisterForm.css
îÇ   ‚îÇ       ‚îÇ   ‚îú‚îÄ‚îÄ TwoFactorVerification.tsx # Verificaci√≥n 2FA
îÇ   ‚îÇ       ‚îÇ   ‚îî‚îÄ‚îÄ TwoFactorVerification.css
îÇ   ‚îÇ       ‚îú‚îÄ‚îÄ hooks/
îÇ   ‚îÇ       ‚îÇ   ‚îî‚îÄ‚îÄ useAuth.ts             # Hook de autenticaci√≥n
îÇ   ‚îÇ       ‚îú‚îÄ‚îÄ services/
îÇ   ‚îÇ       ‚îÇ   ‚îî‚îÄ‚îÄ mfa.service.ts         # Servicio de MFA
îÇ   ‚îÇ       ‚îî‚îÄ‚îÄ store/
îÇ   ‚îÇ           ‚îî‚îÄ‚îÄ authStore.ts           # Estado global de auth (Zustand)
îÇ   ‚îÇ
îÇ   ‚îú‚îÄ‚îÄ pages/                     # üìÑ P√°ginas de la Aplicaci√≥n
îÇ   ‚îÇ   ‚îÇ
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ Dashboard.tsx          # üè† Dashboard de usuario
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ Dashboard.css
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ VotingPage.tsx         # üó≥Ô∏è P√°gina de votaci√≥n
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ VotingPage.css
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ VotingHistory.tsx      # üìú Historial de votos del usuario
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ VotingHistory.css
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ ResultsListPage.tsx    # üìä Lista de resultados
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ ResultsListPage.css
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ ResultsPage.tsx        # üìä Resultados detallados
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ ResultsPage.css
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ ProfilePage.tsx        # üë§ Perfil de usuario
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ ProfilePage.css
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ SettingsPage.tsx       # ‚öôÔ∏è Configuraci√≥n
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ SettingsPage.css
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ HelpPage.tsx           # ‚ùì Ayuda
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ HelpPage.css
îÇ   ‚îÇ   ‚îÇ
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ AdminDashboard.tsx     # üëë Dashboard de administrador
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ AdminDashboard.css
îÇ   ‚îÇ   ‚îÇ
îÇ   ‚îÇ   ‚îî‚îÄ‚îÄ admin/                 # üëë P√°ginas de Administraci√≥n
îÇ   ‚îÇ       ‚îú‚îÄ‚îÄ CreateElection.tsx     # Crear/editar elecciones
îÇ   ‚îÇ       ‚îú‚îÄ‚îÄ CreateElection.css
îÇ   ‚îÇ       ‚îú‚îÄ‚îÄ ManageCandidates.tsx   # Gestionar candidatos
îÇ   ‚îÇ       ‚îú‚îÄ‚îÄ ManageCandidates.css
îÇ   ‚îÇ       ‚îú‚îÄ‚îÄ ManageVoters.tsx       # Gestionar votantes
îÇ   ‚îÇ       ‚îú‚îÄ‚îÄ ManageVoters.css
îÇ   ‚îÇ       ‚îú‚îÄ‚îÄ ElectionResults.tsx    # Resultados de elecci√≥n (admin)
îÇ   ‚îÇ       ‚îú‚îÄ‚îÄ ElectionResults.css
îÇ   ‚îÇ       ‚îú‚îÄ‚îÄ AdminVotesHistory.tsx  # Historial de votos (admin)
îÇ   ‚îÇ       ‚îî‚îÄ‚îÄ AdminVotesHistory.css
îÇ   ‚îÇ
îÇ   ‚îú‚îÄ‚îÄ services/                  # üåê Servicios de API
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ api.service.ts         # Cliente HTTP base (Axios)
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ auth.api.ts            # API de autenticaci√≥n
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ users.api.ts           # API de usuarios
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ elections.api.ts       # API de elecciones
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ candidates.api.ts      # API de candidatos
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ votes.api.ts           # API de votos
îÇ   ‚îÇ   ‚îî‚îÄ‚îÄ admin.api.ts           # API de administraci√≥n
îÇ   ‚îÇ
îÇ   ‚îú‚îÄ‚îÄ hooks/                     # ü™ù Custom Hooks
îÇ   ‚îÇ   ‚îî‚îÄ‚îÄ useToast.ts            # Hook para notificaciones
îÇ   ‚îÇ
îÇ   ‚îú‚îÄ‚îÄ utils/                     # üõ†Ô∏è Utilidades
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ crypto.ts              # Funciones de encriptaci√≥n
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ validation.ts          # Validaciones de formularios
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ sanitize.ts            # Sanitizaci√≥n de inputs
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ logger.ts              # Logger del cliente
îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ pdfGenerator.ts        # Generaci√≥n de PDFs (usuario)
îÇ   ‚îÇ   ‚îî‚îÄ‚îÄ adminPdfGenerator.ts   # Generaci√≥n de PDFs (admin)
îÇ   ‚îÇ
îÇ   ‚îú‚îÄ‚îÄ types/                     # üìù Tipos de TypeScript
îÇ   ‚îÇ   ‚îî‚îÄ‚îÄ index.ts               # Tipos compartidos
îÇ   ‚îÇ
îÇ   ‚îú‚îÄ‚îÄ config/                    # ‚öôÔ∏è Configuraciones
îÇ   ‚îÇ   ‚îî‚îÄ‚îÄ security.config.ts     # Configuraci√≥n de seguridad
îÇ   ‚îÇ
îÇ   ‚îú‚îÄ‚îÄ data/                      # üìä Datos Est√°ticos
îÇ   ‚îÇ   ‚îî‚îÄ‚îÄ guatemala-locations.ts # Departamentos y municipios
îÇ   ‚îÇ
îÇ   ‚îî‚îÄ‚îÄ styles/                    # üé® Estilos Compartidos
îÇ       ‚îî‚îÄ‚îÄ admin-shared.css       # Estilos compartidos de admin
îÇ
îú‚îÄ‚îÄ public/                        # üìÅ Archivos P√∫blicos
îÇ   ‚îú‚îÄ‚îÄ vote-icon.svg              # Favicon personalizado
îÇ   ‚îî‚îÄ‚îÄ vite.svg                   # Logo de Vite
îÇ
îú‚îÄ‚îÄ index.html                     # HTML principal
îú‚îÄ‚îÄ Dockerfile                     # Dockerfile para frontend
îú‚îÄ‚îÄ nginx.conf                     # Configuraci√≥n de Nginx
îú‚îÄ‚îÄ package.json                   # Dependencias de Node.js
îú‚îÄ‚îÄ tsconfig.json                  # Configuraci√≥n de TypeScript
îú‚îÄ‚îÄ vite.config.ts                 # Configuraci√≥n de Vite
îú‚îÄ‚îÄ vitest.config.ts               # Configuraci√≥n de Vitest (tests)
îî‚îÄ‚îÄ vercel.json                    # Configuraci√≥n de Vercel
```

---

## üîê M√≥dulos del Backend - Detalle

### 1. **Auth Module** (`/modules/auth`)

**Responsabilidad:** Autenticaci√n y autorizaci√≥n de usuarios.

#### Archivos Principales:

- **`auth.controller.ts`**

  - `POST /auth/register` - Registrar nuevo usuario
  - `POST /auth/login` - Iniciar sesi√n (genera c√≥digo 2FA)
  - `POST /auth/verify-2fa` - Verificar c√digo 2FA y completar login
  - `POST /auth/logout` - Cerrar sesi√n
  - `POST /auth/refresh` - Refrescar access token
  - `GET /auth/me` - Obtener perfil del usuario autenticado
- **`auth.service.ts`**

  - `register()` - Crear usuario con contrase√±a hasheada
  - `login()` - Validar credenciales y generar c√digo 2FA
  - `verify2FAAndCompleteLogin()` - Verificar 2FA y generar tokens JWT
  - `validateUser()` - Validar credenciales
  - `generateTokens()` - Generar access y refresh tokens
- **`email.service.ts`**

  - `send2FACode()` - Enviar c√digo 2FA por email (Resend)
  - `sendLoginNotification()` - Notificar login desde nuevo dispositivo
- **`two-factor.service.ts`**

  - `generateAndSend2FACode()` - Generar c√digo de 6 d√≠gitos y enviarlo
  - `verify2FACode()` - Validar c√digo 2FA
  - `isNewDevice()` - Detectar si es un dispositivo nuevo

#### Entidades:

- **`two-factor-code.entity.ts`**
  - Almacena c√digos 2FA temporales (10 min de expiraci√≥n)
  - Campos: `code`, `userId`, `expiresAt`, `ipAddress`, `userAgent`, `isNewDevice`

#### Guards:

- **`jwt-auth.guard.ts`** - Protege rutas que requieren autenticaci√n
- **`jwt-refresh.guard.ts`** - Protege ruta de refresh token
- **`roles.guard.ts`** - Protege rutas por rol (VOTER, ADMIN, SUPER_ADMIN)

#### Strategies:

- **`jwt.strategy.ts`** - Estrategia para validar access tokens
- **`jwt-refresh.strategy.ts`** - Estrategia para validar refresh tokens

---

### 2. **Elections Module** (`/modules/elections`)

**Responsabilidad:** Gesti√n de elecciones.

#### Archivos Principales:

- **`elections.controller.ts`**

  - `GET /elections` - Listar elecciones (filtradas por rol)
  - `GET /elections/:id` - Obtener elecci√n por ID
  - `POST /elections` - Crear elecci√n (solo ADMIN)
  - `PATCH /elections/:id` - Actualizar elecci√n (solo ADMIN)
  - `DELETE /elections/:id` - Eliminar elecci√n (solo ADMIN)
- **`elections.service.ts`**

  - `create()` - Crear nueva elecci√n
  - `findAll()` - Listar elecciones (con filtros por estado y rol)
  - `findOne()` - Obtener elecci√n con candidatos
  - `update()` - Actualizar elecci√n
  - `remove()` - Soft delete de elecci√n
  - `activateElection()` - Activar elecci√n manualmente
  - `closeElection()` - Cerrar elecci√n manualmente
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

**Responsabilidad:** Gesti√n de candidatos.

#### Archivos Principales:

- **`candidates.controller.ts`**

  - `GET /candidates` - Listar candidatos
  - `GET /candidates/:id` - Obtener candidato por ID
  - `GET /candidates/election/:electionId` - Candidatos de una elecci√n
  - `GET /candidates/results/:electionId` - Resultados de candidatos
  - `POST /candidates` - Crear candidato (solo ADMIN)
  - `PATCH /candidates/:id` - Actualizar candidato (solo ADMIN)
  - `DELETE /candidates/:id` - Eliminar candidato (solo ADMIN)
- **`candidates.service.ts`**

  - `create()` - Crear candidato
  - `findAll()` - Listar candidatos
  - `findByElection()` - Candidatos de una elecci√n
  - `getResults()` - Obtener resultados con votos y porcentajes
  - `update()` - Actualizar candidato
  - `remove()` - Soft delete de candidato

#### Entidades:

- **`candidate.entity.ts`**
  - Campos: `name`, `description`, `party`, `photoUrl`, `isActive`
  - Relaciones: `ManyToOne` con `Election`, `OneToMany` con `Vote`

---

### 4. **Votes Module** (`/modules/votes`)

**Responsabilidad:** Gesti√n de votos.

#### Archivos Principales:

- **`votes.controller.ts`**

  - `POST /votes` - Emitir voto
  - `GET /votes/history` - Historial de votos del usuario
  - `GET /votes/verify/:voteHash` - Verificar voto por hash
  - `GET /votes/check/:electionId` - Verificar si ya vot√
- **`votes.service.ts`**

  - `castVote()` - Emitir voto con encriptaci√n
  - `getVoteHistory()` - Historial de votos del usuario
  - `verifyVote()` - Verificar integridad del voto
  - `hasUserVoted()` - Verificar si el usuario ya vot√
  - `generateVoteHash()` - Generar hash √∫nico del voto

#### Entidades:

- **`vote.entity.ts`**
  - Campos: `voteHash`, `encryptedVote`, `timestamp`, `ipAddress`, `isValid`
  - Relaciones: `ManyToOne` con `User`, `Election`, `Candidate`

---

### 5. **Users Module** (`/modules/users`)

**Responsabilidad:** Gesti√n de usuarios.

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

**Responsabilidad:** Panel de administraci√n y estad√≠sticas.

#### Archivos Principales:

- **`admin.controller.ts`**

  - `GET /admin/dashboard/stats` - Estad√sticas generales
  - `GET /admin/dashboard/activity` - Actividad reciente
  - `GET /admin/dashboard/trends` - Tendencias de votos
  - `GET /admin/elections/:id/results` - Resultados detallados
  - `GET /admin/votes/history` - Historial completo de votos
- **`admin.service.ts`**

  - `getDashboardStats()` - Estad√sticas del dashboard
  - `getRecentActivity()` - Actividad reciente
  - `getVotingTrends()` - Tendencias de votaci√n
  - `getDetailedResults()` - Resultados con demograf√a
  - `getVotesHistory()` - Historial completo con filtros

---

### 7. **Audit Module** (`/modules/audit`)

**Responsabilidad:** Registro de auditor√a de acciones.

#### Archivos Principales:

- **`audit.service.ts`**
  - `log()` - Registrar acci√n en la base de datos
  - `logLogin()` - Registrar login
  - `logVote()` - Registrar voto
  - `logAdminAction()` - Registrar acci√n de admin

#### Entidades:

- **`audit-log.entity.ts`**
  - Campos: `action`, `userId`, `ipAddress`, `userAgent`, `metadata`, `timestamp`

---

## üé® P√°ginas del Frontend - Detalle

### üîπ P√°ginas de Usuario

#### 1. **Dashboard** (`/pages/Dashboard.tsx`)

- **Ruta:** `/dashboard`
- **Descripci√n:** Panel principal del usuario
- **Funcionalidades:**
  - Ver elecciones activas
  - Ver elecciones pr√ximas
  - Ver elecciones completadas
  - Bot√n "Votar Ahora" para elecciones activas
  - Badge "Ya has votado" si ya vot√
  - Ver resultados de elecciones cerradas

#### 2. **VotingPage** (`/pages/VotingPage.tsx`)

- **Ruta:** `/vote/:electionId`
- **Descripci√n:** P√°gina para emitir voto
- **Funcionalidades:**
  - Ver informaci√n de la elecci√≥n
  - Ver lista de candidatos con fotos
  - Seleccionar candidato
  - Confirmar voto con modal
  - Encriptaci√n del voto antes de enviar

#### 3. **VotingHistory** (`/pages/VotingHistory.tsx`)

- **Ruta:** `/voting-history`
- **Descripci√n:** Historial de votos del usuario
- **Funcionalidades:**
  - Ver lista de votos emitidos
  - Ver detalles de cada voto (hash, fecha, elecci√n)
  - Exportar historial a PDF
  - Ver recibo individual de voto (modal)
  - Descargar recibo en PDF

#### 4. **ResultsListPage** (`/pages/ResultsListPage.tsx`)

- **Ruta:** `/results`
- **Descripci√n:** Lista de elecciones con resultados disponibles
- **Funcionalidades:**
  - Ver elecciones cerradas o completadas
  - Ver informaci√n b√°sica de cada elecci√≥n
  - Bot√n para ver resultados detallados

#### 5. **ResultsPage** (`/pages/ResultsPage.tsx`)

- **Ruta:** `/results/:electionId`
- **Descripci√n:** Resultados detallados de una elecci√≥n
- **Funcionalidades:**
  - Ver ganador destacado
  - Ver gr√°fico de resultados
  - Ver tabla de candidatos con votos y porcentajes
  - Ver total de votos

#### 6. **ProfilePage** (`/pages/ProfilePage.tsx`)

- **Ruta:** `/profile`
- **Descripci√n:** Perfil del usuario
- **Funcionalidades:**
  - Ver informaci√n personal
  - Editar nombre, apellido, tel√fono
  - Ver √∫ltimo login
  - Ver rol

#### 7. **SettingsPage** (`/pages/SettingsPage.tsx`)

- **Ruta:** `/settings`
- **Descripci√n:** Configuraci√≥n de la cuenta
- **Funcionalidades:**
  - Cambiar contrase√±a
  - Configurar notificaciones
  - Configurar privacidad

#### 8. **HelpPage** (`/pages/HelpPage.tsx`)

- **Ruta:** `/help`
- **Descripci√n:** P√°gina de ayuda
- **Funcionalidades:**
  - Preguntas frecuentes
  - Gu√as de uso
  - Contacto de soporte

---

### üîπ P√°ginas de Administrador

#### 1. **AdminDashboard** (`/pages/AdminDashboard.tsx`)

- **Ruta:** `/admin/dashboard`
- **Descripci√n:** Panel principal del administrador
- **Funcionalidades:**
  - Ver estad√sticas generales (usuarios, elecciones, votos)
  - Ver actividad reciente
  - Ver tendencias de votaci√n (gr√°fico)
  - Acceso r√°pido a funciones de admin

#### 2. **CreateElection** (`/pages/admin/CreateElection.tsx`)

- **Ruta:** `/admin/elections/create` y `/admin/elections/edit/:id`
- **Descripci√n:** Crear o editar elecci√≥n
- **Funcionalidades:**
  - Formulario de elecci√n (t√≠tulo, descripci√≥n, fechas)
  - Agregar/editar/eliminar candidatos
  - Vista previa de candidatos
  - Validaci√n de fechas
  - Guardar como borrador o activar

#### 3. **ManageCandidates** (`/pages/admin/ManageCandidates.tsx`)

- **Ruta:** `/admin/candidates`
- **Descripci√n:** Gestionar candidatos
- **Funcionalidades:**
  - Ver lista de candidatos
  - Filtrar por elecci√n
  - Crear nuevo candidato
  - Editar candidato existente
  - Eliminar candidato
  - Activar/desactivar candidato

#### 4. **ManageVoters** (`/pages/admin/ManageVoters.tsx`)

- **Ruta:** `/admin/voters`
- **Descripci√n:** Gestionar votantes
- **Funcionalidades:**
  - Ver lista de usuarios
  - Filtrar por rol
  - Buscar por nombre o email
  - Ver detalles de usuario
  - Activar/desactivar usuario
  - Cambiar rol de usuario

#### 5. **ElectionResults** (`/pages/admin/ElectionResults.tsx`)

- **Ruta:** `/admin/results/:electionId`
- **Descripci√n:** Resultados detallados de elecci√≥n (admin)
- **Funcionalidades:**
  - Ver resultados con demograf√a
  - Ver gr√°ficos avanzados
  - Exportar resultados a PDF
  - Exportar resultados a CSV
  - Ver estad√sticas detalladas

#### 6. **AdminVotesHistory** (`/pages/admin/AdminVotesHistory.tsx`)

- **Ruta:** `/admin/votes-history`
- **Descripci√n:** Historial completo de votos (admin)
- **Funcionalidades:**
  - Ver todos los votos del sistema
  - Filtrar por elecci√n, usuario, fecha
  - Ver votos v√°lidos e inv√°lidos
  - Exportar historial a PDF
  - Exportar historial a CSV
  - Ver detalles de cada voto

---

## üîê Seguridad

### Autenticaci√n y Autorizaci√≥n

1. **JWT (JSON Web Tokens)**

   - Access Token: 15 minutos de expiraci√n
   - Refresh Token: 7 d√as de expiraci√≥n
   - Almacenados en `sessionStorage` (frontend)
2. **Two-Factor Authentication (2FA)**

   - C√digo de 6 d√≠gitos enviado por email
   - Expiraci√n: 10 minutos
   - Detecci√n de nuevo dispositivo
   - Notificaci√n por email en login desde nuevo dispositivo
3. **Roles y Permisos**

   - `VOTER`: Usuario regular (puede votar)
   - `ADMIN`: Administrador (gestiona elecciones)
   - `SUPER_ADMIN`: Super administrador (gestiona todo)
4. **Guards**

   - `JwtAuthGuard`: Protege rutas autenticadas
   - `RolesGuard`: Protege rutas por rol
   - `JwtRefreshGuard`: Protege ruta de refresh

### Encriptaci√n

1. **Votos**

   - Encriptaci√n AES-256-GCM
   - Hash SHA-256 para verificaci√n
   - Firma digital para integridad
2. **Contrase√±as**

   - Bcrypt con salt de 10 rounds
   - Nunca se almacenan en texto plano

### Seguridad de Red

1. **CORS**

   - Configurado para permitir solo dominios autorizados
   - Headers permitidos: `Authorization`, `Content-Type`, etc.
2. **Helmet**

   - Security headers autom√°ticos
   - `X-Frame-Options: DENY`
   - `X-Content-Type-Options: nosniff`
   - `X-XSS-Protection: 1; mode=block`
3. **Rate Limiting**

   - 100 requests por minuto por IP
   - Protecci√n contra ataques de fuerza bruta

### Auditor√a

- Todas las acciones cr√ticas se registran en `audit_logs`
- Informaci√n registrada:
  - Usuario
  - Acci√n
  - IP Address
  - User Agent
  - Timestamp
  - Metadata adicional

---

## üóÑÔ∏è Base de Datos

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

## üöÄ Deployment

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
# Railway detecta autom√°ticamente NestJS
# Build: npm run build
# Start: npm run start:prod
```

### Frontend (Vercel)

1. **Variables de Entorno Requeridas:**

```env
VITE_API_URL=https://backend-domain.railway.app/api/v1
```

2. **Configuraci√n de Vercel:**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci",
  "framework": "vite"
}
```

---

## üîÑ CI/CD (GitHub Actions)

### Security Scan Workflow

**Archivo:** `.github/workflows/security-scan.yml`

**Jobs:**

1. **Dependency Vulnerability Scan**

   - `npm audit` para detectar vulnerabilidades
   - Snyk para an√°lisis de dependencias
2. **Code Quality & Security Linting**

   - ESLint con reglas de seguridad
   - TypeScript compiler check
3. **Secrets & Credentials Scan**

   - TruffleHog para detectar secretos en c√digo
4. **Docker Container Security Scan**

   - Trivy para escanear vulnerabilidades en im√°genes Docker
5. **CodeQL SAST Analysis**

   - An√°lisis est√°tico de c√digo para detectar vulnerabilidades

**Triggers:**

- Push a `main` o `develop`
- Pull requests a `main` o `develop`
- Cron: Todos los lunes a las 9 AM

---

## üì¶ Dependencias Principales

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

## üß™ Testing

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

## üìù Scripts √ötiles

### Backend

```bash
# Desarrollo
npm run start:dev

# Producci√n
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

## üîß Configuraci√≥n Local

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

---

## üìû Contacto y Soporte

**Desarrollador:** Christian Barrios
**Email:** barriosc31@gmail.com
**Universidad:** Universidad Francisco Marroqu√n (UFM)
**Curso:** Seguridad Inform√°tica

---

## üìÑ Licencia

Este proyecto es de c√digo cerrado y est√° protegido por derechos de autor.
Uso exclusivo para fines acad√micos en UFM.

---

## üéØ Roadmap Futuro

- [X] Implementar votaci√n con blockchain
- [ ] Agregar soporte para m√∫ltiples idiomas (i18n)
- [X] Implementar notificaciones push
- [X] Agregar an√°lisis de datos con IA
- [ ] Implementar sistema de reportes avanzados
- [ ] Agregar soporte para votaci√n delegada
- [X] Implementar sistema de verificaci√n biom√©trica

---

**√ltima actualizaci√≥n:** Noviembre 2025
**Versi√n:** 1.0.0
