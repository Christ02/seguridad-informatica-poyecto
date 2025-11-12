/**
 * Type Definitions
 * Definiciones de tipos TypeScript para el sistema de votación
 */

// ============= User & Authentication Types =============

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  lastLogin?: string;
}

export const UserRole = {
  VOTER: 'VOTER',
  AUDITOR: 'AUDITOR',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface MFASetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

// ============= Voting Types =============

export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ElectionStatus;
  candidates: Candidate[];
  totalVotes?: number;
}

export const ElectionStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  CLOSED: 'closed',
  COMPLETED: 'completed',
} as const;

export type ElectionStatus = typeof ElectionStatus[keyof typeof ElectionStatus];

export interface Candidate {
  id: string;
  name: string;
  description: string;
  photoUrl?: string;
  party?: string;
}

export interface Vote {
  electionId: string;
  candidateId: string;
  timestamp: number;
}

export interface EncryptedVote {
  electionId: string;
  encryptedData: string;
  signature: string;
  voteHash: string;
}

export interface VoteReceipt {
  voteHash: string;
  timestamp: string;
  electionId: string;
  verification: string;
}

// ============= Crypto Types =============

export interface CryptoKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface BlindSignature {
  blindedData: string;
  signature: string;
}

// ============= API Response Types =============

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============= Audit Log Types =============

export interface AuditLog {
  id: string;
  eventType: AuditEventType;
  userId?: string;
  timestamp: string;
  details: Record<string, unknown>;
  ipHash: string;
}

export const AuditEventType = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  LOGIN_FAILED: 'login_failed',
  MFA_ENABLED: 'mfa_enabled',
  MFA_DISABLED: 'mfa_disabled',
  VOTE_CAST: 'vote_cast',
  VOTE_VERIFIED: 'vote_verified',
  ELECTION_VIEWED: 'election_viewed',
  SESSION_TIMEOUT: 'session_timeout',
} as const;

export type AuditEventType = typeof AuditEventType[keyof typeof AuditEventType];

// ============= Form Types =============

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface FormState<T> {
  values: T;
  errors: FormErrors;
  isSubmitting: boolean;
  isValid: boolean;
}

// ============= Security Types =============

export interface SessionInfo {
  userId: string;
  expiresAt: number;
  lastActivity: number;
  deviceFingerprint: string;
}

export interface RateLimitInfo {
  attempts: number;
  resetAt: number;
  isLocked: boolean;
}

export interface SecurityEvent {
  type: SecurityEventType;
  timestamp: number;
  details: Record<string, unknown>;
}

export const SecurityEventType = {
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  INVALID_TOKEN: 'invalid_token',
  CSRF_DETECTED: 'csrf_detected',
  XSS_ATTEMPT: 'xss_attempt',
} as const;

export type SecurityEventType = typeof SecurityEventType[keyof typeof SecurityEventType];

