export interface EncryptedVote {
  electionId: string;
  encryptedData: string;
  encryptionPublicKey: string;
  timestamp: Date;
  signature: string;
  nonce: string;
}

export interface Vote {
  electionId: string;
  candidateId?: string;
  optionId?: string;
  timestamp: Date;
}

export interface VoteReceipt {
  receiptId: string;
  electionId: string;
  blockHash: string;
  blockIndex: number;
  timestamp: Date;
  zkProof: string;
  merkleProof: string[];
  verificationUrl: string;
}

export interface BlockchainBlock {
  index: number;
  timestamp: Date;
  data: EncryptedVote;
  previousHash: string;
  hash: string;
  nonce: number;
  merkleRoot: string;
  validator: string;
}

export interface VoteEligibility {
  userId: string;
  electionId: string;
  isEligible: boolean;
  hasVoted: boolean;
  votedAt?: Date;
  voteTokenHash?: string;
  reason?: string;
}

export interface VoteVerification {
  receiptId: string;
  isValid: boolean;
  blockIndex: number;
  blockHash: string;
  merkleProofValid: boolean;
  zkProofValid: boolean;
  timestamp: Date;
  verifiedAt: Date;
}

export interface BlockchainValidation {
  isValid: boolean;
  totalBlocks: number;
  validatedBlocks: number;
  invalidBlocks: number[];
  merkleRootValid: boolean;
  chainIntegrityValid: boolean;
  lastValidatedAt: Date;
  errors?: string[];
}

export interface VoteToken {
  token: string;
  userId: string;
  electionId: string;
  expiresAt: Date;
  used: boolean;
  usedAt?: Date;
}

export interface DecryptedVote {
  electionId: string;
  candidateId?: string;
  optionId?: string;
  blockHash: string;
  decryptedAt: Date;
  decryptedBy: string[];
}

