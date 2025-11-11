# Guía para Hacer Push al Repositorio de GitHub

## Estado Actual

✅ **5 commits locales** listos para hacer push:
1. feat: configurar proyecto frontend seguro con Vite, React y TypeScript
2. feat: implementar autenticación MFA con TOTP y WebAuthn
3. docs: agregar documento de estado de implementación
4. feat: rediseñar login estilo Portal de Votación Ciudadana
5. feat: implementar dashboard post-login con routing

---

## Opción 1: Crear el Repositorio en GitHub (Si no existe)

1. Ve a https://github.com/new
2. Nombre del repositorio: `seguridad-informatica-poyecto` (o el que prefieras)
3. **NO** inicializar con README, .gitignore o license
4. Haz clic en "Create repository"

---

## Opción 2: Verificar Acceso SSH

```bash
# Verifica que tu clave SSH esté configurada
ssh -T git@github.com

# Deberías ver: "Hi [tu-usuario]! You've successfully authenticated..."
```

Si no funciona, genera una nueva clave SSH:

```bash
# Generar clave SSH
ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"

# Copiar la clave pública
cat ~/.ssh/id_ed25519.pub

# Agrégala en GitHub: Settings → SSH and GPG keys → New SSH key
```

---

## Hacer Push de los Commits

Una vez que el repositorio esté creado y el SSH configurado:

```bash
cd /Users/christian/Universidad/Seguridad

# Verificar el remote
git remote -v

# Si el remote es incorrecto, actualizarlo:
git remote set-url origin git@github.com:Christ02/seguridad-informatica-poyecto.git

# Hacer push de todos los commits
git push -u origin main
```

---

## Push Periódico (Recomendación)

Para hacer push periódicamente después de cada commit:

```bash
# Después de cada commit, hacer push automáticamente
git push origin main
```

O crear un alias para commit + push:

```bash
# Agregar al ~/.zshrc o ~/.bashrc
alias gcp='git add -A && git commit -m "$1" && git push origin main'

# Uso:
# gcp "mensaje del commit"
```

---

## Script Automático de Push

También puedes usar este comando para verificar y hacer push si hay commits pendientes:

```bash
#!/bin/bash
cd /Users/christian/Universidad/Seguridad

# Verificar si hay commits no pusheados
UNPUSHED=$(git log origin/main..HEAD --oneline 2>/dev/null | wc -l)

if [ $UNPUSHED -gt 0 ]; then
    echo "📤 Haciendo push de $UNPUSHED commit(s) pendiente(s)..."
    git push origin main
    echo "✅ Push completado!"
else
    echo "✅ Todo está sincronizado con GitHub"
fi
```

---

## Verificar Estado Actual

```bash
cd /Users/christian/Universidad/Seguridad

# Ver commits locales no pusheados
git log origin/main..HEAD --oneline

# Ver estado general
git status
```

---

## Troubleshooting

### Error: "Repository not found"
- Verifica que el repositorio exista en GitHub
- Verifica que el nombre sea correcto
- Verifica que tengas permisos de escritura

### Error: "Permission denied (publickey)"
- Tu clave SSH no está configurada
- Sigue los pasos de "Opción 2: Verificar Acceso SSH"

### Error: "Updates were rejected"
- Alguien más hizo push antes que tú
- Solución: `git pull --rebase origin main && git push origin main`

---

## Automatizar Push con Git Hooks

Para hacer push automáticamente después de cada commit:

```bash
cd /Users/christian/Universidad/Seguridad/.git/hooks

# Crear hook post-commit
cat > post-commit << 'EOF'
#!/bin/sh
git push origin main 2>&1 | tee -a .git/push.log
EOF

# Hacer ejecutable
chmod +x post-commit
```

⚠️ **ADVERTENCIA**: Esto hará push automáticamente después de cada commit local.

---

## Estado del Proyecto

```
📊 Progreso: ~18% completado
📁 Archivos: 40+ archivos creados
💻 Líneas de código: ~4500+ líneas
🐳 Docker: Funcionando correctamente
🔒 Seguridad: Múltiples capas implementadas
```

---

**Última actualización**: 11 de Noviembre, 2025

