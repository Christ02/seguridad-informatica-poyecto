/**
 * Security Configuration
 * Configuración centralizada de seguridad para el frontend
 */

export const securityConfig = {
  // Content Security Policy
  csp: {
    defaultSrc: ["'none'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", import.meta.env.VITE_API_URL || 'http://localhost:4000'],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'none'"],
    frameSrc: ["'none'"],
    frameAncestors: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
  },

  // Session management
  session: {
    timeout: Number(import.meta.env.VITE_SESSION_TIMEOUT) || 600000, // 10 minutos
    warningTime: 120000, // 2 minutos antes de expirar
    checkInterval: 60000, // Verificar cada minuto
  },

  // Authentication
  auth: {
    maxLoginAttempts: 5,
    lockoutDuration: 900000, // 15 minutos
    tokenRefreshInterval: 840000, // 14 minutos (antes de expirar)
    mfaEnabled: import.meta.env.VITE_ENABLE_MFA === 'true',
    webAuthnEnabled: import.meta.env.VITE_ENABLE_WEBAUTHN === 'true',
  },

  // API Configuration
  api: {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
    maxRetries: 3,
    retryDelay: 1000,
  },

  // Crypto Configuration
  crypto: {
    algorithm: 'RSA-OAEP',
    keySize: 4096,
    hashAlgorithm: 'SHA-256',
  },

  // Rate Limiting (client-side)
  rateLimit: {
    login: {
      maxAttempts: 5,
      windowMs: 900000, // 15 minutos
    },
    vote: {
      maxAttempts: 1,
      windowMs: 3600000, // 1 hora
    },
  },

  // Security Headers (estos son configurados por el servidor en las respuestas, no por el cliente)
  // NOTA: No se deben enviar como headers de request, el backend los configura en las responses
  headers: {
    // 'X-Content-Type-Options': 'nosniff',
    // 'X-Frame-Options': 'DENY',
    // 'X-XSS-Protection': '1; mode=block',
    // 'Referrer-Policy': 'strict-origin-when-cross-origin',
  },

  // Feature Flags
  features: {
    captchaEnabled: import.meta.env.VITE_ENABLE_CAPTCHA === 'true',
    auditLogging: true,
    deviceFingerprinting: true,
  },
} as const;

// Validate configuration on load
export function validateSecurityConfig(): void {
  if (!securityConfig.api.baseURL) {
    console.warn('API URL not configured, using default');
  }

  if (securityConfig.session.timeout < 300000) {
    console.warn('Session timeout is less than 5 minutes, consider increasing');
  }

  if (!securityConfig.auth.mfaEnabled) {
    console.warn('MFA is disabled, consider enabling for production');
  }
}

// Initialize validation
validateSecurityConfig();

