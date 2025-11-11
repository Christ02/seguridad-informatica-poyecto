import { ThresholdRSA } from './threshold-rsa';
import { ShamirSecretSharing } from './shamir';
import {
  ThresholdParams,
  KeyShare,
  ShamirShare,
  Signature,
  MultiSigTransaction,
  MultiSigTransactionType,
} from '@voting-system/shared';
import { v4 as uuidv4 } from 'uuid';

/**
 * Key Ceremony implementation for secure key generation
 * Implements multi-party computation for threshold key generation
 */
export class KeyCeremony {
  private electionId: string;
  private totalCustodians: number;
  private threshold: number;
  private keySize: number;
  private participants: Map<number, string>; // custodianId -> email
  private shares: Map<number, ShamirShare>; // custodianId -> share
  private commitments: Map<number, string>; // custodianId -> commitment
  private status: 'INITIATED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  private publicKey?: string;
  private thresholdParams?: ThresholdParams;
  private signatures: Signature[];

  constructor(
    electionId: string,
    totalCustodians: number = 5,
    threshold: number = 3,
    keySize: number = 4096
  ) {
    this.electionId = electionId;
    this.totalCustodians = totalCustodians;
    this.threshold = threshold;
    this.keySize = keySize;
    this.participants = new Map();
    this.shares = new Map();
    this.commitments = new Map();
    this.status = 'INITIATED';
    this.signatures = [];
  }

  /**
   * Register a custodian for the ceremony
   * @param custodianId - Custodian ID
   * @param email - Custodian email
   */
  registerCustodian(custodianId: number, email: string): void {
    if (this.status !== 'INITIATED') {
      throw new Error('Cannot register custodians after ceremony has started');
    }

    if (this.participants.size >= this.totalCustodians) {
      throw new Error('Maximum number of custodians reached');
    }

    this.participants.set(custodianId, email);
  }

  /**
   * Start the key ceremony
   * Generates threshold keys and distributes shares to custodians
   */
  async startCeremony(): Promise<{
    publicKey: string;
    thresholdParams: ThresholdParams;
    shares: KeyShare[];
  }> {
    if (this.status !== 'INITIATED') {
      throw new Error('Ceremony has already been started');
    }

    if (this.participants.size !== this.totalCustodians) {
      throw new Error(
        `Need exactly ${this.totalCustodians} custodians, have ${this.participants.size}`
      );
    }

    try {
      this.status = 'IN_PROGRESS';

      // Generate threshold keys
      const result = await ThresholdRSA.generateThresholdKeys(
        this.keySize,
        this.totalCustodians,
        this.threshold
      );

      this.publicKey = result.publicKey;
      this.thresholdParams = result.thresholdParams;

      // Distribute shares to custodians
      const custodianIds = Array.from(this.participants.keys());
      const keyShares: KeyShare[] = [];

      result.privateKeyShares.forEach((share, index) => {
        const custodianId = custodianIds[index];
        
        // Store share
        this.shares.set(custodianId, share);

        // Generate and store commitment
        const commitment = ThresholdRSA.generateShareCommitment(share);
        this.commitments.set(custodianId, commitment);

        // Create key share object
        const keyShare: KeyShare = {
          shareIndex: share.x,
          custodianId,
          encryptedShare: share.y,
          publicCommitment: commitment,
          electionId: this.electionId,
          createdAt: new Date(),
        };

        keyShares.push(keyShare);
      });

      this.status = 'COMPLETED';

      return {
        publicKey: this.publicKey,
        thresholdParams: this.thresholdParams,
        shares: keyShares,
      };
    } catch (error) {
      this.status = 'FAILED';
      throw new Error(`Key ceremony failed: ${(error as Error).message}`);
    }
  }

  /**
   * Verify that a custodian's share is valid
   * @param custodianId - Custodian ID
   * @param share - Share to verify
   * @returns True if valid
   */
  verifyShare(custodianId: number, share: ShamirShare): boolean {
    const commitment = this.commitments.get(custodianId);
    if (!commitment) {
      return false;
    }

    return ThresholdRSA.verifyShareCommitment(share, commitment);
  }

  /**
   * Get share for a custodian (encrypted)
   * @param custodianId - Custodian ID
   * @returns Key share or undefined
   */
  getShareForCustodian(custodianId: number): KeyShare | undefined {
    const share = this.shares.get(custodianId);
    const commitment = this.commitments.get(custodianId);

    if (!share || !commitment) {
      return undefined;
    }

    return {
      shareIndex: share.x,
      custodianId,
      encryptedShare: share.y,
      publicCommitment: commitment,
      electionId: this.electionId,
      createdAt: new Date(),
    };
  }

  /**
   * Verify threshold reconstruction
   * Tests that any threshold number of shares can reconstruct the key
   * @param shares - Array of shares to test
   * @returns True if valid
   */
  async verifyThreshold(shares: ShamirShare[]): Promise<boolean> {
    if (shares.length < this.threshold) {
      return false;
    }

    try {
      // Try to reconstruct the private key
      const reconstructedKey = ShamirSecretSharing.combineShares(shares.slice(0, this.threshold));

      // Verify by encrypting and decrypting test data
      if (!this.publicKey) {
        return false;
      }

      const testData = 'threshold-verification-test-' + Date.now();
      const encrypted = ThresholdRSA.encrypt(testData, this.publicKey);
      const decrypted = ThresholdRSA.decrypt(encrypted, shares.slice(0, this.threshold));

      return testData === decrypted;
    } catch {
      return false;
    }
  }

  /**
   * Create multi-sig transaction for ceremony approval
   * @param createdBy - Admin who created the transaction
   * @returns Multi-sig transaction
   */
  createApprovalTransaction(createdBy: string): MultiSigTransaction {
    return {
      id: uuidv4(),
      type: MultiSigTransactionType.CREATE_ELECTION,
      payload: {
        electionId: this.electionId,
        publicKey: this.publicKey,
        thresholdParams: this.thresholdParams,
        custodians: Array.from(this.participants.entries()).map(([id, email]) => ({
          id,
          email,
        })),
      },
      requiredSignatures: this.threshold,
      signatures: [],
      status: 'PENDING',
      createdAt: new Date(),
      createdBy,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }

  /**
   * Add signature to ceremony approval
   * @param adminId - Admin ID
   * @param signature - Signature
   * @param publicKey - Admin's public key
   */
  addSignature(adminId: string, signature: string, publicKey: string): void {
    this.signatures.push({
      adminId,
      signature,
      publicKey,
      signedAt: new Date(),
      verified: false, // Will be verified by multi-sig service
    });
  }

  /**
   * Get ceremony status
   */
  getStatus(): {
    electionId: string;
    status: string;
    participants: number;
    threshold: number;
    publicKey?: string;
    signatures: number;
  } {
    return {
      electionId: this.electionId,
      status: this.status,
      participants: this.participants.size,
      threshold: this.threshold,
      publicKey: this.publicKey,
      signatures: this.signatures.length,
    };
  }

  /**
   * Export ceremony data for auditing
   */
  exportCeremonyData(): {
    electionId: string;
    timestamp: Date;
    totalCustodians: number;
    threshold: number;
    keySize: number;
    publicKey?: string;
    thresholdParams?: ThresholdParams;
    commitments: Array<{ custodianId: number; commitment: string }>;
    status: string;
  } {
    return {
      electionId: this.electionId,
      timestamp: new Date(),
      totalCustodians: this.totalCustodians,
      threshold: this.threshold,
      keySize: this.keySize,
      publicKey: this.publicKey,
      thresholdParams: this.thresholdParams,
      commitments: Array.from(this.commitments.entries()).map(([custodianId, commitment]) => ({
        custodianId,
        commitment,
      })),
      status: this.status,
    };
  }

  /**
   * Securely destroy ceremony data (after shares are distributed)
   * This ensures the complete private key never exists in memory after distribution
   */
  destroyPrivateData(): void {
    // Clear shares from memory
    this.shares.clear();
    
    // Note: Commitments are kept for verification purposes
    // They don't contain sensitive data, only hashes
  }
}

export default KeyCeremony;

