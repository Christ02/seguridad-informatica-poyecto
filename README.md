# Sistema de Votación Electrónica Seguro

Sistema de votación electrónica con seguridad de nivel enterprise/gobierno, implementando arquitectura zero-trust y protección de la confidencialidad, integridad y disponibilidad del proceso electoral.

## Características de Seguridad

- **Confidencialidad**: Voto secreto mediante blind signatures y criptografía asimétrica
- **Integridad**: Votos inmutables con firmas digitales y hash verificables
- **Disponibilidad**: Arquitectura resistente a DDoS y fallos con 99.99% uptime
- **Auditabilidad**: Logs inmutables para auditorías forenses

## Stack Tecnológico

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Web Crypto API (criptografía client-side)
- Zod (validación)
- DOMPurify (sanitización XSS)

### Backend
- NestJS (Node.js framework)
- PostgreSQL 16 con Row-Level Security
- Redis 7 (rate limiting y cache)
- MongoDB (audit logs)
- JWT RS256 (autenticación)

### Infraestructura
- Docker & Docker Compose (desarrollo local)
- Kubernetes (producción)
- AWS/GCP/Azure (cloud)
- Terraform (IaC)

## Desarrollo Local con Docker

Todos los servicios corren en contenedores Docker para aislamiento y reproducibilidad:

```bash
# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down
```

Servicios disponibles:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **MongoDB**: localhost:27017

## Estructura del Proyecto

```
.
├── frontend/          # Aplicación React
├── backend/           # API NestJS
├── docker-compose.yml # Orquestación de servicios
├── docs/              # Documentación de seguridad
└── scripts/           # Scripts de utilidad
```

## Principios de Seguridad

1. **Zero-Trust Architecture**: Nunca confiar, siempre verificar
2. **Defense in Depth**: Múltiples capas de seguridad
3. **Separation of Duties**: Roles segregados
4. **Least Privilege**: Mínimos privilegios necesarios
5. **Security by Design**: Seguridad desde el diseño

## Testing de Seguridad

- Unit tests (>90% cobertura)
- Integration tests
- E2E tests (Playwright)
- SAST (SonarQube)
- DAST (OWASP ZAP)
- Penetration testing
- Vulnerability scanning

## Cumplimiento

- ISO 27001 (gestión de seguridad)
- SOC 2 Type II (controles de seguridad)
- GDPR (protección de datos)
- Estándares electorales

## Licencia

MIT License - Ver LICENSE file para detalles.

## Contacto

Para reportes de seguridad, contactar: security@votacion-segura.com

