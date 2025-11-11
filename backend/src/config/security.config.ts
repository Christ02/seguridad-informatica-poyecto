import {
  RATE_LIMITS,
  CRYPTO_PARAMS,
  SESSION_CONFIG,
  SECURITY_HEADERS,
  CSP_DIRECTIVES,
  CORS_CONFIG,
} from '@voting-system/shared';

/**
 * Security configuration for the application
 */
export const securityConfig = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-CHANGE-IN-PRODUCTION',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-CHANGE',
    accessTokenTTL: SESSION_CONFIG.ACCESS_TOKEN_TTL,
    refreshTokenTTL: SESSION_CONFIG.REFRESH_TOKEN_TTL,
    algorithm: CRYPTO_PARAMS.JWT.ALGORITHM,
    issuer: CRYPTO_PARAMS.JWT.ISSUER,
  },

  // Password Hashing
  bcrypt: {
    rounds: CRYPTO_PARAMS.BCRYPT_ROUNDS,
  },

  // Rate Limiting
  rateLimits: {
    login: {
      windowMs: RATE_LIMITS.LOGIN.WINDOW_MS,
      max: RATE_LIMITS.LOGIN.MAX_ATTEMPTS,
      message: 'Too many login attempts, please try again later',
      standardHeaders: true,
      legacyHeaders: false,
    },
    register: {
      windowMs: RATE_LIMITS.REGISTER.WINDOW_MS,
      max: RATE_LIMITS.REGISTER.MAX_ATTEMPTS,
      message: 'Too many registration attempts, please try again later',
      standardHeaders: true,
      legacyHeaders: false,
    },
    vote: {
      windowMs: RATE_LIMITS.VOTE.WINDOW_MS,
      max: RATE_LIMITS.VOTE.MAX_ATTEMPTS,
      message: 'Please wait before submitting another vote',
      standardHeaders: true,
      legacyHeaders: false,
    },
    api: {
      windowMs: RATE_LIMITS.API_GENERAL.WINDOW_MS,
      max: RATE_LIMITS.API_GENERAL.MAX_ATTEMPTS,
      message: 'Too many requests, please slow down',
      standardHeaders: true,
      legacyHeaders: false,
    },
    twoFactor: {
      windowMs: RATE_LIMITS.TWO_FACTOR_VERIFY.WINDOW_MS,
      max: RATE_LIMITS.TWO_FACTOR_VERIFY.MAX_ATTEMPTS,
      message: 'Too many 2FA attempts, please try again later',
      standardHeaders: true,
      legacyHeaders: false,
    },
  },

  // CORS Configuration
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (CORS_CONFIG.ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: CORS_CONFIG.ALLOWED_METHODS,
    allowedHeaders: CORS_CONFIG.ALLOWED_HEADERS,
    credentials: CORS_CONFIG.CREDENTIALS,
    maxAge: CORS_CONFIG.MAX_AGE,
  },

  // Security Headers
  headers: SECURITY_HEADERS,

  // Content Security Policy
  csp: CSP_DIRECTIVES,

  // Cookie Configuration
  cookie: {
    httpOnly: SESSION_CONFIG.COOKIE_HTTPONLY,
    secure: process.env.NODE_ENV === 'production',
    sameSite: SESSION_CONFIG.COOKIE_SAMESITE,
    maxAge: SESSION_CONFIG.COOKIE_MAX_AGE,
  },

  // 2FA Configuration
  twoFactor: {
    issuer: process.env.TOTP_ISSUER || 'SecureVotingSystem',
    window: 2, // Allow 2 time steps
    encoding: 'base32' as const,
  },

  // Encryption
  encryption: {
    algorithm: 'aes-256-cbc' as const,
    key: process.env.DATABASE_ENCRYPTION_KEY || 'default-key-CHANGE-IN-PRODUCTION-32b',
  },

  // Crypto Service
  cryptoService: {
    url: process.env.CRYPTO_SERVICE_URL || 'http://localhost:3003',
    timeout: 30000,
  },

  // Monitoring
  monitoring: {
    enabled: process.env.NODE_ENV === 'production',
    siemWebhook: process.env.SIEM_WEBHOOK_URL,
  },

  // AWS S3 (for immutable logs)
  aws: {
    s3: {
      bucket: process.env.S3_BUCKET_NAME || 'voting-system-logs',
      region: process.env.S3_REGION || 'us-east-1',
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
    },
  },
};

export default securityConfig;

