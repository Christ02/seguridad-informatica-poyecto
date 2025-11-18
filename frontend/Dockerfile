# Multi-stage build para optimizar tamaño y seguridad
FROM node:20-alpine AS builder

# Metadata
LABEL maintainer="Christian Barrios <barriosc31@gmail.com>"
LABEL description="VoteSecure Frontend - Sistema de Votación Segura"

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar código fuente
COPY . .

# Build de la aplicación
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copiar archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Ejecutar nginx
CMD ["nginx", "-g", "daemon off;"]
