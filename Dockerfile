# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files from backend
COPY ./backend/package*.json ./

# Install dependencies
RUN npm ci

# Copy all backend source code
COPY ./backend/ ./

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY ./backend/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 4000

# Start application
CMD ["node", "dist/main"]

