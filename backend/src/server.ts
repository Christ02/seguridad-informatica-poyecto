import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database.config';
import { initializeRedis } from './config/redis.config';
import securityConfig from './config/security.config';
import { createLogger } from './utils/logger';

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3002;
const logger = createLogger('backend');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: securityConfig.csp,
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

app.use(cors(securityConfig.cors));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'backend',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.get('/', (req, res) => {
  res.json({
    service: 'Secure Voting System - Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      elections: '/api/v1/elections',
      votes: '/api/v1/votes',
      admin: '/api/v1/admin',
    },
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
  });

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
  });
});

// Initialize and start server
const startServer = async (): Promise<void> => {
  try {
    // Initialize database
    await initializeDatabase();

    // Initialize Redis
    await initializeRedis();

    // Start server
    app.listen(port, () => {
      logger.info(`Backend server listening on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();

export default app;

