# 🔐 Credenciales de Prueba

## Sistema de Votación Seguro - Usuarios de Prueba

### 👤 Usuario Normal (VOTER)
- **ID/Cédula:** `1234567890`
- **Email:** `user@test.com`
- **Contraseña:** `password123`
- **Rol:** VOTER
- **Descripción:** Usuario con permisos de votación

---

### 👨‍💼 Administrador (ADMIN)
- **ID/Cédula:** `admin`
- **Email:** `admin@test.com`
- **Contraseña:** `admin123`
- **Rol:** ADMIN
- **Descripción:** Administrador del sistema con acceso al panel de administración

---

### 🔐 Super Administrador (SUPER_ADMIN)
- **ID/Cédula:** `superadmin`
- **Email:** `superadmin@test.com`
- **Contraseña:** `superadmin123`
- **Rol:** SUPER_ADMIN
- **Descripción:** Super administrador con acceso completo

---

### 🔍 Auditor (AUDITOR)
- **ID/Cédula:** `9876543210`
- **Email:** `auditor@test.com`
- **Contraseña:** `auditor123`
- **Rol:** AUDITOR
- **Descripción:** Auditor del sistema para revisiones de seguridad

---

## 🌐 URLs del Sistema

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000/api/v1
- **Documentación API:** http://localhost:4000/api/v1 (en construcción)

---

## ✅ Estado del Sistema

- ✅ Backend corriendo en puerto 4000
- ✅ Frontend corriendo en puerto 3000
- ✅ PostgreSQL corriendo con 4 usuarios de prueba
- ✅ Redis corriendo para caché (pendiente configuración)
- ✅ MongoDB corriendo para audit logs (pendiente configuración)
- ✅ Autenticación JWT funcionando correctamente
- ✅ Access tokens (15 minutos de duración)
- ✅ Refresh tokens (7 días de duración)

---

## 📋 Cómo Probar

1. Abrir http://localhost:3000
2. Ingresar uno de los emails o IDs de arriba
3. Ingresar la contraseña correspondiente
4. Si eres ADMIN, serás redirigido a `/admin/dashboard`
5. Si eres VOTER, serás redirigido a `/dashboard`

---

## 🛠️ Comandos Útiles

```bash
# Ver logs del backend
docker-compose -f docker-compose.full.yml logs backend --tail=50

# Ver logs del frontend
docker-compose -f docker-compose.full.yml logs frontend --tail=50

# Reiniciar todo el sistema
docker-compose -f docker-compose.full.yml restart

# Ver usuarios en la base de datos
docker exec voting-postgres psql -U voting_user -d voting_db -c "SELECT id, email, role, \"isActive\" FROM users;"
```

