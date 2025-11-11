# 🚀 Ejecutar el Sistema de Votación en Localhost

## Guía Completa para Desarrollo Local

---

## 📋 Requisitos Previos

Asegúrate de tener instalado:

```bash
# Node.js 20+
node --version  # debe ser v20.x o superior

# Docker Desktop
docker --version
docker-compose --version

# Git
git --version
```

---

## 🔧 Paso 1: Clonar y Configurar

```bash
# 1. Navegar al directorio del proyecto (ya lo tienes)
cd /Users/christian/Universidad/Seguridad

# 2. Instalar dependencias del monorepo
npm install

# 3. Instalar dependencias de cada servicio
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd crypto-service && npm install && cd ..
cd shared && npm install && cd ..
```

---

## 🐳 Paso 2: Configurar Variables de Entorno

### Backend (.env)

```bash
# Crear archivo .env en /backend
cat > backend/.env << 'EOF'
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/voting_system
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=voting_system
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=dev-secret-change-in-production-use-long-random-string
JWT_REFRESH_SECRET=dev-refresh-secret-also-change-this-in-prod
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# Crypto
CRYPTO_SERVICE_URL=http://localhost:4000
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
LOG_SIGNING_SECRET=dev-log-signing-secret-change-in-production

# Server
NODE_ENV=development
PORT=5000

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMITS_ENABLED=true
EOF
```

### Frontend (.env)

```bash
# Crear archivo .env en /frontend
cat > frontend/.env << 'EOF'
VITE_API_URL=http://localhost:5000/api
VITE_CRYPTO_SERVICE_URL=http://localhost:4000
NODE_ENV=development
EOF
```

### Crypto Service (.env)

```bash
# Crear archivo .env en /crypto-service
cat > crypto-service/.env << 'EOF'
NODE_ENV=development
PORT=4000
LOG_LEVEL=debug
EOF
```

---

## 🚀 Paso 3: Iniciar la Base de Datos y Redis

```bash
# Iniciar solo PostgreSQL y Redis con docker-compose
docker-compose up -d postgres redis

# Verificar que están corriendo
docker-compose ps

# Ver logs si hay problemas
docker-compose logs postgres
docker-compose logs redis
```

### Esperar a que la base de datos esté lista

```bash
# Esperar unos segundos y verificar
sleep 10
docker exec -it voting-system-postgres psql -U postgres -c "SELECT 1"
```

---

## 🗄️ Paso 4: Crear la Base de Datos

```bash
# Crear la base de datos
docker exec -it voting-system-postgres psql -U postgres -c "CREATE DATABASE voting_system;"

# Ejecutar el script de inicialización (si existe)
docker exec -i voting-system-postgres psql -U postgres -d voting_system < backend/src/database/init.sql

# O crear las tablas manualmente con TypeORM
cd backend
npm run typeorm migration:run
cd ..
```

---

## 🏃 Paso 5: Iniciar los Servicios

### Opción A: Todo en Terminales Separadas (Recomendado para desarrollo)

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Crypto Service
cd crypto-service
npm run dev

# Terminal 3 - Frontend
cd frontend
npm run dev
```

### Opción B: Con Docker Compose (Todo junto)

```bash
# Iniciar todos los servicios
docker-compose up --build

# O en background
docker-compose up -d --build

# Ver logs
docker-compose logs -f
```

---

## ✅ Paso 6: Verificar que Todo Funciona

### 1. Backend API

```bash
# Health check
curl http://localhost:5000/api/health

# Debería responder: {"status":"ok"}
```

### 2. Crypto Service

```bash
# Health check
curl http://localhost:4000/health

# Debería responder: {"status":"ok"}
```

### 3. Frontend

Abre tu navegador en: **http://localhost:3000**

Deberías ver la página principal del sistema de votación.

### 4. PostgreSQL

```bash
# Conectar a la base de datos
docker exec -it voting-system-postgres psql -U postgres -d voting_system

# Listar tablas
\dt

# Salir
\q
```

### 5. Redis

```bash
# Conectar a Redis
docker exec -it voting-system-redis redis-cli

# Verificar
ping
# Debería responder: PONG

# Salir
exit
```

---

## 🧪 Paso 7: Crear Datos de Prueba

### Usuario de Prueba

```bash
# Registrar un usuario vía API
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuario Demo",
    "email": "demo@test.com",
    "password": "SecurePass123!"
  }'
```

### Elección de Prueba

```bash
# Usar el frontend para crear una elección de prueba
# O insertar directamente en la base de datos

docker exec -i voting-system-postgres psql -U postgres -d voting_system << 'EOF'
INSERT INTO elections (id, title, description, start_date, end_date, status, election_type, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Elección de Prueba 2025',
  'Esta es una elección de prueba para demostración',
  NOW(),
  NOW() + interval '7 days',
  'active',
  'single',
  NOW(),
  NOW()
);
EOF
```

---

## 🎯 Paso 8: Probar el Flujo Completo

### 1. Registro
- Ve a http://localhost:3000/register
- Registra un nuevo usuario
- Configura 2FA con Google Authenticator

### 2. Login
- Ve a http://localhost:3000/login
- Inicia sesión con tu usuario
- Ingresa el código 2FA

### 3. Ver Elecciones
- Ve a http://localhost:3000/elections
- Deberías ver las elecciones activas

### 4. Votar
- Click en "Votar Ahora" en una elección
- Selecciona un candidato
- Confirma tu voto
- Recibe tu comprobante ZKP

### 5. Verificar
- Ve a http://localhost:3000/verify
- Pega tu comprobante
- Verifica que tu voto está en la blockchain

---

## 📊 Monitoreo Local

### Ver Logs en Tiempo Real

```bash
# Logs de todos los servicios
docker-compose logs -f

# Logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Acceder a Prometheus y Grafana

Si iniciaste el stack de monitoreo:

```bash
cd monitoring
docker-compose -f docker-compose.monitoring.yml up -d

# Acceder a:
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001 (admin/admin)
# Alertmanager: http://localhost:9093
```

---

## 🛠️ Comandos Útiles

### Reiniciar Todo

```bash
# Detener todos los servicios
docker-compose down

# Limpiar volúmenes (¡CUIDADO! Borra datos)
docker-compose down -v

# Reiniciar
docker-compose up -d
```

### Reconstruir Después de Cambios

```bash
# Reconstruir una imagen específica
docker-compose build backend
docker-compose up -d backend

# Reconstruir todo
docker-compose up -d --build
```

### Ver Estado de Contenedores

```bash
# Ver contenedores corriendo
docker-compose ps

# Ver uso de recursos
docker stats

# Ver logs de un contenedor específico
docker logs -f voting-system-backend
```

### Ejecutar Comandos en Contenedores

```bash
# Backend
docker-compose exec backend npm run migrate
docker-compose exec backend npm test

# PostgreSQL
docker-compose exec postgres psql -U postgres -d voting_system

# Redis
docker-compose exec redis redis-cli
```

---

## 🐛 Troubleshooting

### Problema: Puerto ya en uso

```bash
# Ver qué está usando el puerto
lsof -i :5000  # Backend
lsof -i :3000  # Frontend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Matar el proceso
kill -9 <PID>
```

### Problema: Base de datos no conecta

```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps postgres

# Ver logs
docker-compose logs postgres

# Reiniciar PostgreSQL
docker-compose restart postgres
```

### Problema: Frontend no carga

```bash
# Verificar que el backend está corriendo
curl http://localhost:5000/api/health

# Limpiar cache de Vite
cd frontend
rm -rf node_modules/.vite
npm run dev
```

### Problema: Docker compose falla

```bash
# Limpiar todo Docker
docker-compose down -v
docker system prune -a

# Reiniciar Docker Desktop
# Luego:
docker-compose up -d --build
```

---

## 📁 Estructura de Archivos Importantes

```
/Users/christian/Universidad/Seguridad/
├── backend/
│   ├── src/
│   ├── .env           ← Configurar esto
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── .env           ← Configurar esto
│   ├── package.json
│   └── Dockerfile
├── crypto-service/
│   ├── src/
│   ├── .env           ← Configurar esto
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml  ← Usar esto para iniciar todo
├── package.json        ← Raíz del monorepo
└── README.md
```

---

## 🎓 Próximos Pasos

Una vez que todo funcione en localhost:

1. ✅ Probar todas las funcionalidades
2. ✅ Ejecutar tests de seguridad
3. ✅ Verificar que el blockchain funciona
4. ✅ Probar el flujo de votación completo
5. ✅ Verificar los comprobantes ZKP
6. ✅ Probar el panel de administración

**Después de verificar que todo funciona localmente**, podemos proceder a:
- Configurar el deployment en Railway (o el proveedor que prefieras)
- Configurar CI/CD
- Setup de producción

---

## 💡 Tips para Desarrollo

### Hot Reload

Los servicios están configurados con hot reload:
- **Backend**: Usa `nodemon`, se recarga al guardar archivos
- **Frontend**: Vite HMR, actualización instantánea
- **Crypto Service**: Usa `nodemon`, se recarga automáticamente

### Debugging

```bash
# Backend con debugger
cd backend
npm run debug

# Luego en VS Code, adjunta el debugger al puerto 9229
```

### Tests

```bash
# Backend tests
cd backend
npm test
npm run test:watch

# Frontend tests
cd frontend
npm test

# Security tests
npm run test:security
```

---

## 📞 ¿Necesitas Ayuda?

Si algo no funciona:

1. **Revisa los logs**: `docker-compose logs -f`
2. **Verifica las variables de entorno**: Los archivos `.env`
3. **Asegúrate de que los puertos están libres**: 3000, 4000, 5000, 5432, 6379
4. **Reinicia Docker**: A veces ayuda reiniciar Docker Desktop

---

**🎉 ¡Listo para Desarrollo Local!**

Una vez que completes estos pasos, tendrás el sistema completo corriendo en tu máquina para desarrollo y pruebas.

**Comando rápido para iniciar todo:**

```bash
# En el directorio raíz
docker-compose up -d postgres redis

# Esperar 10 segundos

# En terminales separadas:
cd backend && npm run dev
cd frontend && npm run dev
cd crypto-service && npm run dev
```

🚀 **¡Happy Coding!**

