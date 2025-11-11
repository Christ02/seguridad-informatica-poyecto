export enum UserRole {
  VOTER = 'VOTER',
  ADMIN = 'ADMIN',
  CUSTODIAN = 'CUSTODIAN',
  AUDITOR = 'AUDITOR',
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodes?: string[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  lastLoginIP?: string;
  lastLoginDevice?: string;
  isActive: boolean;
  isVerified: boolean;
  verificationToken?: string;
}

export interface Admin extends User {
  role: UserRole.ADMIN;
  custodianId?: number;
  multiSigPublicKey: string;
  multiSigPrivateKeyEncrypted: string;
  permissions: AdminPermission[];
}

export enum AdminPermission {
  CREATE_ELECTION = 'CREATE_ELECTION',
  CLOSE_ELECTION = 'CLOSE_ELECTION',
  DECRYPT_VOTES = 'DECRYPT_VOTES',
  MANAGE_USERS = 'MANAGE_USERS',
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',
  EMERGENCY_SHUTDOWN = 'EMERGENCY_SHUTDOWN',
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
  jti: string;
  deviceFingerprint?: string;
}

export interface DeviceInfo {
  fingerprint: string;
  userAgent: string;
  ip: string;
  lastSeen: Date;
  isTrusted: boolean;
}

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  manualEntryKey: string;
}

export interface LoginAttempt {
  userId: string;
  ip: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
  timestamp: Date;
  twoFactorPassed?: boolean;
}

