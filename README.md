# Sistema de Votación Electrónico Seguro

Sistema de votación electrónico con seguridad de nivel producción, implementando threshold cryptography, zero-knowledge proofs, multi-signature para administradores, y arquitectura de seguridad de múltiples capas.

## 🔒 Características de Seguridad

### Autenticación y Autorización
- **2FA obligatorio** con TOTP (Google Authenticator compatible)
- **JWT** con rotación automática (access + refresh tokens)
- **Multi-signature** para operaciones administrativas (3 de 5 admins requeridos)
- **Rate limiting** avanzado con backoff exponencial
- **Device fingerprinting** para detección de sesiones anómalas

### Criptografía Avanzada
- **Threshold Cryptography** (Esquema 3-de-5 con Shamir Secret Sharing)
- **Zero-Knowledge Proofs** para receipts no-coercibles
- **RSA 4096-bit** para encriptación de votos
- **AES-256** para datos sensibles en base de datos
- **Bcrypt** con 14 rounds para contraseñas

### Integridad y Auditoría
- **Blockchain** con Merkle trees para votos inmutables
- **Logging inmutable** a S3
- **SIEM** con detección de anomalías en tiempo real
- **Validación continua** de integridad de blockchain
- **Audit logs** append-only

### Privacidad
- **Separación total** entre identidad del votante y voto emitido
- **Tablas segregadas** con encriptación a nivel de columna
- **Receipts ZK** que permiten verificación sin revelar el voto
- **No hay joins** posibles entre identidad y contenido de voto

## 🏗️ Arquitectura

```
Internet → Cloudflare (WAF/DDoS) → Railway Load Balancer
    ↓
Frontend (React + TypeScript) + Backend (Node.js + Express)
    ↓
PostgreSQL (encrypted) + Redis (sessions) + S3 (immutable logs)
    ↓
Crypto Service (Threshold + ZKP + Multi-sig) + Monitoring (SIEM)
```

## 📦 Stack Tecnológico

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Web Crypto API (client-side encryption)
- Web Workers (crypto operations)

### Backend
- Node.js 20 + Express
- TypeORM (ORM con encrypted columns)
- PostgreSQL 16 (base de datos principal)
- Redis 7 (sessions, rate limiting)
- JWT + Speakeasy (auth + 2FA)

### Crypto Service
- Node Forge (RSA operations)
- secrets.js-34r7h (Shamir Secret Sharing)
- snarkjs (Zero-Knowledge Proofs)
- elliptic (Elliptic Curve Cryptography)

### Monitoring
- Prometheus (métricas)
- Winston (structured logging)
- Custom SIEM (anomaly detection)
- AWS S3 (immutable log storage)

### DevOps
- Docker + Docker Compose
- Railway (deployment)
- GitHub Actions (CI/CD)
- Trivy (container scanning)

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js >= 20.0.0
- Docker y Docker Compose
- npm >= 9.0.0

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd Seguridad
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus valores
```

4. **Generar claves criptográficas**
```bash
npm run generate-keys
```

5. **Iniciar servicios con Docker**
```bash
npm run docker:up
```

6. **Ejecutar migraciones**
```bash
npm run migrate -w backend
```

7. **Seed de datos demo**
```bash
npm run seed -w backend
```

8. **Acceder a la aplicación**
- Frontend: http://localhost:5175
- Backend API: http://localhost:3002
- Crypto Service: http://localhost:3003
- Monitoring: http://localhost:3004

## 📁 Estructura del Proyecto

```
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   ├── services/     # API services
│   │   ├── utils/        # Utilities
│   │   └── workers/      # Web Workers
│   └── Dockerfile
│
├── backend/              # Node.js API
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── services/     # Business logic
│   │   ├── models/       # Database models
│   │   ├── middleware/   # Express middleware
│   │   ├── jobs/         # Background jobs
│   │   └── database/     # Migrations & seeds
│   └── Dockerfile
│
├── crypto-service/       # Cryptography microservice
│   ├── src/
│   │   ├── threshold/    # Threshold cryptography
│   │   ├── zkp/          # Zero-knowledge proofs
│   │   └── multisig/     # Multi-signature
│   └── Dockerfile
│
├── monitoring/           # SIEM & monitoring
│   ├── src/
│   │   ├── siem/         # Security monitoring
│   │   ├── alerts/       # Alert management
│   │   └── dashboards/   # Monitoring dashboards
│   └── Dockerfile
│
├── shared/               # Shared TypeScript types
│   ├── types/
│   └── constants/
│
├── docs/                 # Documentation
│   ├── security/         # Security documentation
│   ├── compliance/       # Compliance docs
│   ├── incident-response/# Incident response plans
│   └── presentation/     # Presentation materials
│
└── scripts/              # Utility scripts
    ├── demo/             # Demo scripts
    └── disaster-recovery/# DR scripts
```

## 🔐 Seguridad

### Reportar Vulnerabilidades
Ver [SECURITY.md](./docs/security/VULNERABILITY_DISCLOSURE.md) para la política de divulgación responsable.

### Documentación de Seguridad
- [Arquitectura de Seguridad](./docs/SECURITY_ARCHITECTURE.md)
- [Modelo de Amenazas](./docs/THREAT_MODEL.md)
- [Diseño Criptográfico](./docs/CRYPTOGRAPHY_DESIGN.md)
- [Guía de Administrador](./docs/ADMIN_SECURITY_GUIDE.md)
- [Plan de Respuesta a Incidentes](./docs/incident-response/INCIDENT_RESPONSE_PLAN.md)

## 🧪 Testing

```bash
# Todos los tests
npm test

# Tests de seguridad
npm run test:security -w backend

# Tests E2E
npm run test:e2e -w frontend

# Coverage
npm run test:coverage
```

## 📊 Monitoring

### Métricas Disponibles
- Latencia de APIs
- Tasa de autenticaciones fallidas
- Estado de integridad del blockchain
- Uso de recursos (CPU, memoria)
- Patrones de tráfico anómalos

### Acceder a Dashboards
- Prometheus: http://localhost:9090
- Monitoring Dashboard: http://localhost:3004/dashboard

## 🎯 Flujo de Votación

1. **Registro/Login**
   - Usuario se registra con email y contraseña
   - Activa 2FA escaneando QR con Google Authenticator
   - Login con contraseña + código TOTP

2. **Visualizar Elecciones**
   - Dashboard muestra elecciones activas
   - Verificación de elegibilidad automática

3. **Votar**
   - Ingreso a cabina de votación segura
   - Selección de candidato/opción
   - Voto se encripta en el cliente con RSA público de la elección
   - Backend crea bloque en blockchain con voto encriptado
   - Sistema genera receipt ZK para verificación posterior

4. **Verificar Voto**
   - Usuario puede verificar con receipt que su voto está en la cadena
   - Zero-knowledge proof confirma inclusión sin revelar contenido

5. **Resultados** (Solo después de cerrar elección)
   - 3 de 5 administradores deben aprobar cierre
   - Threshold decryption con shares de custodios
   - Conteo de votos y publicación de resultados

## 🚢 Deployment en Producción

### Railway (Recomendado)

1. **Instalar Railway CLI**
```bash
npm install -g @railway/cli
railway login
```

2. **Crear proyecto**
```bash
railway init
```

3. **Configurar servicios**
```bash
railway up
```

4. **Configurar variables de entorno**
Ver `.env.example` y configurar en Railway Dashboard.

### Configuración de Seguridad en Producción
- HTTPS automático con Let's Encrypt
- CORS restringido a dominio específico
- Rate limiting más estricto
- Logs inmutables a S3
- Backups automáticos de PostgreSQL
- Monitoreo 24/7 con alertas

## 📚 Comandos Útiles

```bash
# Desarrollo
npm run dev                    # Iniciar todos los servicios
npm run build                  # Build producción
npm run lint                   # Lint código
npm run format                 # Format código

# Docker
npm run docker:up              # Iniciar contenedores
npm run docker:down            # Detener contenedores
docker-compose logs -f         # Ver logs

# Base de datos
npm run migrate -w backend     # Ejecutar migraciones
npm run seed -w backend        # Seed datos demo
npm run db:reset -w backend    # Reset DB

# Demo
./scripts/demo/setup-demo.sh   # Setup demo completo
./scripts/demo/vote-flow-demo.sh  # Demo de votación
```

## 👥 Usuarios Demo

Después del seed, puedes usar estas cuentas:

**Administradores** (5 custodios):
- admin1@voting.com / Admin123!@# (Custodio 1)
- admin2@voting.com / Admin123!@# (Custodio 2)
- admin3@voting.com / Admin123!@# (Custodio 3)
- admin4@voting.com / Admin123!@# (Custodio 4)
- admin5@voting.com / Admin123!@# (Custodio 5)

**Votantes**:
- voter1@example.com / Voter123!@#
- voter2@example.com / Voter123!@#
...hasta voter10

## 🤝 Contribuir

Este es un proyecto académico. Para contribuciones:
1. Fork el repositorio
2. Crea una rama de feature
3. Commits siguiendo conventional commits
4. Push y crea Pull Request
5. Espera code review

## 📄 Licencia

Este proyecto es para propósitos académicos y de investigación.

## 👨‍💻 Autor

Christian - Universidad - Curso de Ciberseguridad

## 🙏 Agradecimientos

- Comunidad de seguridad criptográfica
- Referencias de sistemas electorales reales
- Librerías open-source utilizadas

