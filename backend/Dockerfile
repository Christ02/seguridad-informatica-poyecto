# Multi-stage Dockerfile for NestJS Backend

# Development stage
FROM node:20-alpine AS development

WORKDIR /app

# Install dependencies for bcrypt
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 4000

# Start in development mode
CMD ["npm", "run", "start:dev"]

# Build stage
FROM node:20-alpine AS build

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from build stage
COPY --from=build /app/dist ./dist

EXPOSE 4000

# Run as non-root user
USER node

CMD ["node", "dist/main"]

