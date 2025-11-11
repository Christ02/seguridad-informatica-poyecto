# Multi-stage build for production
FROM node:20-alpine AS builder

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY shared/package.json ./shared/
COPY crypto-service/package.json ./crypto-service/

# Install dependencies
RUN npm ci --workspace=crypto-service --workspace=shared

# Copy source code
COPY shared/ ./shared/
COPY crypto-service/ ./crypto-service/

# Build
RUN npm run build -w shared
RUN npm run build -w crypto-service

# Production stage
FROM node:20-alpine

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy built files
COPY --from=builder --chown=nodejs:nodejs /app/crypto-service/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/crypto-service/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/shared/dist ./shared/dist
COPY --from=builder --chown=nodejs:nodejs /app/shared/package.json ./shared/

# Install only production dependencies
RUN npm ci --only=production

# Create directory for keys
RUN mkdir -p /app/keys && chown nodejs:nodejs /app/keys

# Security: Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3003/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start application
CMD ["node", "dist/server.js"]

