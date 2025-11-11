# Multi-stage Dockerfile para seguridad

# Stage 1: Development
FROM node:20-alpine AS development

WORKDIR /app

# Instalar dependencias de seguridad
RUN apk add --no-cache git

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando de desarrollo con hot-reload
CMD ["npm", "run", "dev"]

# Stage 2: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar código fuente
COPY . .

# Build de producción
RUN npm run build

# Stage 3: Production
FROM nginx:alpine AS production

# Copiar configuración de Nginx con security headers
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos estáticos desde build
COPY --from=build /app/dist /usr/share/nginx/html

# Usuario no-root para seguridad
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Exponer puerto
EXPOSE 80

# Usuario no-root
USER nginx

CMD ["nginx", "-g", "daemon off;"]

