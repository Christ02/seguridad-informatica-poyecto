# GitHub Security Settings
# Este archivo documenta las configuraciones de seguridad

## Secretos y Credenciales

⚠️ **IMPORTANTE**: Nunca commitear secretos reales en el código

### Variables de Entorno Seguras

Todos los secretos deben configurarse en:
- **Railway**: Dashboard → Variables
- **Vercel**: Dashboard → Environment Variables
- **GitHub**: Settings → Secrets and variables → Actions

### Generación de Secretos Seguros

```bash
# Generar secreto JWT
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generar secreto Refresh Token
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Lista de Secretos Necesarios

1. `JWT_SECRET` - Secreto para firmar tokens JWT
2. `JWT_REFRESH_SECRET` - Secreto para refresh tokens
3. `DATABASE_PASSWORD` - Contraseña de PostgreSQL (auto-generada por Railway)
4. `SMTP_PASSWORD` - Si usas email (opcional)

### Notas de Seguridad

- ✅ Usa variables de entorno para todos los secretos
- ✅ Los archivos `.env` están en `.gitignore`
- ✅ Railway y Vercel manejan secretos de forma segura
- ❌ Nunca hardcodear secretos en el código
- ❌ Nunca commitear archivos `.env` al repo

