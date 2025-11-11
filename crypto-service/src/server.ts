import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { createLogger } from './utils/logger';

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3003;
const logger = createLogger('crypto-service');

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5175', 'http://localhost:3002'],
  credentials: true,
}));

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
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'crypto-service',
    timestamp: new Date().toISOString(),
  });
});

// Routes will be added here
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'Secure Voting System - Crypto Service',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      threshold: '/api/v1/threshold',
      zkp: '/api/v1/zkp',
      multisig: '/api/v1/multisig',
    },
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
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

// Start server
app.listen(port, () => {
  logger.info(`Crypto service listening on port ${port}`);
});

export default app;

