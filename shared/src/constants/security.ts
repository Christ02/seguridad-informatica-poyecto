export const RATE_LIMITS = {
  LOGIN: {
    MAX_ATTEMPTS: 5,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  },
  REGISTER: {
    MAX_ATTEMPTS: 3,
    WINDOW_MS: 24 * 60 * 60 * 1000, // 24 hours
  },
  TWO_FACTOR_VERIFY: {
    MAX_ATTEMPTS: 3,
    WINDOW_MS: 5 * 60 * 1000, // 5 minutes
  },
  VOTE: {
    MAX_ATTEMPTS: 1,
    WINDOW_MS: 1000, // 1 second (anti timing attacks)
  },
  API_GENERAL: {
    MAX_ATTEMPTS: 100,
    WINDOW_MS: 60 * 1000, // 1 minute
  },
  BLOCKCHAIN_VERIFY: {
    MAX_ATTEMPTS: 10,
    WINDOW_MS: 60 * 1000, // 1 minute
  },
  PASSWORD_RESET: {
    MAX_ATTEMPTS: 3,
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
  },
  ADMIN_OPERATIONS: {
    MAX_ATTEMPTS: 10,
    WINDOW_MS: 60 * 1000, // 1 minute
  },
} as const;

export const CRYPTO_PARAMS = {
  RSA_KEY_SIZE: 4096,
  AES_KEY_SIZE: 256,
  BCRYPT_ROUNDS: 14,
  SALT_ROUNDS: 12,
  THRESHOLD: {
    TOTAL_SHARES: 5,
    REQUIRED_SHARES: 3,
  },
  MULTISIG: {
    TOTAL_ADMINS: 5,
    REQUIRED_SIGNATURES: {
      CREATE_ELECTION: 3,
      CLOSE_ELECTION: 3,
      DECRYPT_VOTES: 3,
      CANCEL_ELECTION: 4,
      EMERGENCY_SHUTDOWN: 4,
    },
  },
  JWT: {
    ALGORITHM: 'HS512' as const,
    ISSUER: 'SecureVotingSystem',
  },
} as const;

export const SESSION_CONFIG = {
  ACCESS_TOKEN_TTL: 15 * 60, // 15 minutes in seconds
  REFRESH_TOKEN_TTL: 7 * 24 * 60 * 60, // 7 days in seconds
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  COOKIE_HTTPONLY: true,
  COOKIE_SECURE: true,
  COOKIE_SAMESITE: 'strict' as const,
  SESSION_SECRET_ROTATION_DAYS: 90,
} as const;

export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
} as const;

export const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"], // Will be replaced with hashes in production
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:', 'https:'],
  fontSrc: ["'self'"],
  connectSrc: ["'self'"],
  frameSrc: ["'none'"],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  upgradeInsecureRequests: [],
} as const;

export const CORS_CONFIG = {
  ALLOWED_ORIGINS: [
    'http://localhost:5175',
    'http://localhost:3002',
    process.env.FRONTEND_URL || 'http://localhost:5175',
  ],
  ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  ALLOWED_HEADERS: [
    'Content-Type',
    'Authorization',
    'X-Request-ID',
    'X-Device-Fingerprint',
  ],
  CREDENTIALS: true,
  MAX_AGE: 86400, // 24 hours
} as const;

export const BLOCKCHAIN_CONFIG = {
  DIFFICULTY: 4,
  MINING_REWARD: 0,
  BLOCK_TIME_TARGET: 5000, // 5 seconds
  MAX_BLOCK_SIZE: 1024 * 1024, // 1MB
  VALIDATION_INTERVAL: 5 * 60 * 1000, // 5 minutes
  MERKLE_TREE_HEIGHT: 10,
} as const;

export const BACKUP_CONFIG = {
  POSTGRES_INTERVAL: 60 * 60 * 1000, // 1 hour
  POSTGRES_RETENTION_DAYS: 30,
  BLOCKCHAIN_INTERVAL: 0, // On every block
  BLOCKCHAIN_RETENTION_DAYS: 0, // Forever (immutable)
  KEY_SHARES_COPIES: 3,
  RTO_HOURS: 4,
  RPO_HOURS: 1,
} as const;

export const MONITORING_CONFIG = {
  METRICS_INTERVAL: 60 * 1000, // 1 minute
  HEALTH_CHECK_INTERVAL: 30 * 1000, // 30 seconds
  LOG_RETENTION_DAYS: 90,
  ALERT_COOLDOWN_MS: 5 * 60 * 1000, // 5 minutes
  ANOMALY_THRESHOLD: 0.85,
} as const;

export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 12,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: true,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MAX_LENGTH: 255,
  },
  VOTE_TOKEN: {
    LENGTH: 64,
    EXPIRY_MINUTES: 30,
  },
  RECEIPT_ID: {
    LENGTH: 32,
  },
  TWO_FACTOR_CODE: {
    LENGTH: 6,
    VALID_WINDOW: 2, // Allow 2 time steps (1 minute before/after)
  },
} as const;

export const ERROR_CODES = {
  // Authentication
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  AUTH_2FA_REQUIRED: 'AUTH_002',
  AUTH_2FA_INVALID: 'AUTH_003',
  AUTH_TOKEN_EXPIRED: 'AUTH_004',
  AUTH_TOKEN_INVALID: 'AUTH_005',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_006',
  
  // Voting
  VOTE_ELECTION_NOT_ACTIVE: 'VOTE_001',
  VOTE_NOT_ELIGIBLE: 'VOTE_002',
  VOTE_ALREADY_VOTED: 'VOTE_003',
  VOTE_INVALID_DATA: 'VOTE_004',
  VOTE_ENCRYPTION_FAILED: 'VOTE_005',
  
  // Blockchain
  BLOCKCHAIN_INVALID_BLOCK: 'CHAIN_001',
  BLOCKCHAIN_INVALID_HASH: 'CHAIN_002',
  BLOCKCHAIN_INTEGRITY_FAILED: 'CHAIN_003',
  
  // Crypto
  CRYPTO_KEY_GENERATION_FAILED: 'CRYPTO_001',
  CRYPTO_ENCRYPTION_FAILED: 'CRYPTO_002',
  CRYPTO_DECRYPTION_FAILED: 'CRYPTO_003',
  CRYPTO_SIGNATURE_INVALID: 'CRYPTO_004',
  CRYPTO_INSUFFICIENT_SHARES: 'CRYPTO_005',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_001',
  
  // General
  VALIDATION_ERROR: 'VAL_001',
  NOT_FOUND: 'GEN_001',
  INTERNAL_ERROR: 'GEN_002',
  DATABASE_ERROR: 'GEN_003',
} as const;

export const API_VERSIONS = {
  V1: '/api/v1',
  CURRENT: '/api/v1',
} as const;

export const TIMEOUT_CONFIG = {
  API_REQUEST: 30000, // 30 seconds
  DATABASE_QUERY: 10000, // 10 seconds
  CRYPTO_OPERATION: 60000, // 1 minute
  BLOCKCHAIN_VALIDATION: 120000, // 2 minutes
} as const;

