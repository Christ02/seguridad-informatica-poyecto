export enum SecurityEventType {
  AUTH_SUCCESS = 'AUTH_SUCCESS',
  AUTH_FAILURE = 'AUTH_FAILURE',
  AUTH_2FA_FAILURE = 'AUTH_2FA_FAILURE',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  VOTE_CAST = 'VOTE_CAST',
  VOTE_VERIFIED = 'VOTE_VERIFIED',
  ELECTION_CREATED = 'ELECTION_CREATED',
  ELECTION_CLOSED = 'ELECTION_CLOSED',
  KEY_CEREMONY_STARTED = 'KEY_CEREMONY_STARTED',
  KEY_CEREMONY_COMPLETED = 'KEY_CEREMONY_COMPLETED',
  DECRYPTION_STARTED = 'DECRYPTION_STARTED',
  DECRYPTION_COMPLETED = 'DECRYPTION_COMPLETED',
  BLOCKCHAIN_VALIDATION_SUCCESS = 'BLOCKCHAIN_VALIDATION_SUCCESS',
  BLOCKCHAIN_VALIDATION_FAILURE = 'BLOCKCHAIN_VALIDATION_FAILURE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  ADMIN_ACTION = 'ADMIN_ACTION',
  KEY_ACCESS = 'KEY_ACCESS',
  DATABASE_ACCESS = 'DATABASE_ACCESS',
  API_ERROR = 'API_ERROR',
  SECURITY_BREACH = 'SECURITY_BREACH',
}

export enum SecurityEventSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY',
}

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  userId?: string;
  ip: string;
  userAgent: string;
  resource: string;
  action: string;
  success: boolean;
  metadata: Record<string, unknown>;
  timestamp: Date;
  processed: boolean;
  alertSent: boolean;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ip: string;
  userAgent: string;
  timestamp: Date;
  signature: string;
  immutable: boolean;
}

export interface IncidentReport {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  detectedAt: Date;
  detectedBy: string;
  status: IncidentStatus;
  affectedSystems: string[];
  affectedUsers?: string[];
  mitigation?: string;
  resolution?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  timeline: IncidentTimelineEvent[];
  relatedEvents: string[];
}

export enum IncidentType {
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  DATA_BREACH = 'DATA_BREACH',
  DDOS_ATTACK = 'DDOS_ATTACK',
  BLOCKCHAIN_COMPROMISE = 'BLOCKCHAIN_COMPROMISE',
  KEY_COMPROMISE = 'KEY_COMPROMISE',
  ADMIN_COMPROMISE = 'ADMIN_COMPROMISE',
  MALWARE = 'MALWARE',
  PHISHING = 'PHISHING',
  INSIDER_THREAT = 'INSIDER_THREAT',
  SYSTEM_FAILURE = 'SYSTEM_FAILURE',
  OTHER = 'OTHER',
}

export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum IncidentStatus {
  DETECTED = 'DETECTED',
  INVESTIGATING = 'INVESTIGATING',
  CONTAINED = 'CONTAINED',
  ERADICATING = 'ERADICATING',
  RECOVERING = 'RECOVERING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export interface IncidentTimelineEvent {
  timestamp: Date;
  actor: string;
  action: string;
  description: string;
}

export interface Anomaly {
  id: string;
  type: AnomalyType;
  score: number;
  threshold: number;
  detected: boolean;
  description: string;
  relatedEvents: string[];
  detectedAt: Date;
  investigated: boolean;
  falsePositive: boolean;
}

export enum AnomalyType {
  UNUSUAL_LOGIN_PATTERN = 'UNUSUAL_LOGIN_PATTERN',
  MULTIPLE_FAILED_LOGINS = 'MULTIPLE_FAILED_LOGINS',
  UNUSUAL_VOTING_PATTERN = 'UNUSUAL_VOTING_PATTERN',
  UNUSUAL_API_USAGE = 'UNUSUAL_API_USAGE',
  SUSPICIOUS_IP = 'SUSPICIOUS_IP',
  TIME_ANOMALY = 'TIME_ANOMALY',
  RATE_ANOMALY = 'RATE_ANOMALY',
  GEOGRAPHIC_ANOMALY = 'GEOGRAPHIC_ANOMALY',
}

export interface RateLimitInfo {
  key: string;
  limit: number;
  current: number;
  remaining: number;
  resetAt: Date;
  blocked: boolean;
}

export interface ThreatIntelligence {
  ip: string;
  isThreat: boolean;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  categories: string[];
  lastSeen: Date;
  reportedBy: string[];
  blocklisted: boolean;
}

export interface SecurityMetrics {
  timestamp: Date;
  totalLoginAttempts: number;
  failedLoginAttempts: number;
  successfulLogins: number;
  twoFactorFailures: number;
  rateLimitViolations: number;
  activeUsers: number;
  activeSessions: number;
  votesCast: number;
  blockchainValidations: number;
  blockchainIntegrityScore: number;
  anomaliesDetected: number;
  incidentsActive: number;
  averageResponseTime: number;
}

