export interface KeyShare {
  shareIndex: number;
  custodianId: number;
  encryptedShare: string;
  publicCommitment: string;
  electionId: string;
  createdAt: Date;
}

export interface ThresholdParams {
  threshold: number;
  totalShares: number;
  keyId: string;
  publicKey: string;
  algorithm: 'RSA-4096' | 'RSA-2048';
}

export interface KeyCombination {
  electionId: string;
  shareIndices: number[];
  custodianIds: number[];
  combinedAt: Date;
  combinedBy: string;
  privateKey?: string;
}

export interface ZKProof {
  proof: string;
  publicSignals: string[];
  curve: string;
  protocol: 'groth16' | 'plonk' | 'schnorr';
  createdAt: Date;
}

export interface ZKProofVerification {
  isValid: boolean;
  proofHash: string;
  verifiedAt: Date;
  verifier: string;
}

export interface MultiSigTransaction {
  id: string;
  type: MultiSigTransactionType;
  payload: Record<string, unknown>;
  requiredSignatures: number;
  signatures: Signature[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'EXPIRED';
  createdAt: Date;
  createdBy: string;
  expiresAt: Date;
  executedAt?: Date;
}

export enum MultiSigTransactionType {
  CREATE_ELECTION = 'CREATE_ELECTION',
  CLOSE_ELECTION = 'CLOSE_ELECTION',
  START_DECRYPTION = 'START_DECRYPTION',
  PUBLISH_RESULTS = 'PUBLISH_RESULTS',
  CANCEL_ELECTION = 'CANCEL_ELECTION',
  EMERGENCY_SHUTDOWN = 'EMERGENCY_SHUTDOWN',
  ROTATE_KEYS = 'ROTATE_KEYS',
}

export interface Signature {
  adminId: string;
  signature: string;
  publicKey: string;
  signedAt: Date;
  verified: boolean;
}

export interface RSAKeyPair {
  publicKey: string;
  privateKey: string;
  keySize: number;
  format: 'PEM' | 'DER';
  createdAt: Date;
}

export interface EncryptionResult {
  ciphertext: string;
  algorithm: string;
  iv?: string;
  authTag?: string;
  publicKey?: string;
}

export interface DecryptionRequest {
  electionId: string;
  ciphertext: string;
  shareIndices: number[];
  custodianSignatures: Signature[];
  requestedBy: string;
  requestedAt: Date;
}

export interface ShamirShare {
  x: number;
  y: string;
}

export interface CryptoOperation {
  id: string;
  type: 'ENCRYPT' | 'DECRYPT' | 'SIGN' | 'VERIFY' | 'KEY_GEN' | 'SHARE_COMBINE';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  executedBy: string;
}

