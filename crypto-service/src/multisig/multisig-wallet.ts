import forge from 'node-forge';
import crypto from 'crypto';
import {
  MultiSigTransaction,
  MultiSigTransactionType,
  Signature,
  CRYPTO_PARAMS,
} from '@voting-system/shared';
import { v4 as uuidv4 } from 'uuid';

/**
 * Multi-Signature Wallet implementation
 * Implements m-of-n multi-signature scheme for admin operations
 */
export class MultiSigWallet {
  private totalAdmins: number;
  private requiredSignatures: Map<MultiSigTransactionType, number>;
  private transactions: Map<string, MultiSigTransaction>;
  private adminPublicKeys: Map<string, string>; // adminId -> publicKey

  constructor(totalAdmins: number = CRYPTO_PARAMS.MULTISIG.TOTAL_ADMINS) {
    this.totalAdmins = totalAdmins;
    this.requiredSignatures = new Map([
      [
        MultiSigTransactionType.CREATE_ELECTION,
        CRYPTO_PARAMS.MULTISIG.REQUIRED_SIGNATURES.CREATE_ELECTION,
      ],
      [
        MultiSigTransactionType.CLOSE_ELECTION,
        CRYPTO_PARAMS.MULTISIG.REQUIRED_SIGNATURES.CLOSE_ELECTION,
      ],
      [
        MultiSigTransactionType.START_DECRYPTION,
        CRYPTO_PARAMS.MULTISIG.REQUIRED_SIGNATURES.DECRYPT_VOTES,
      ],
      [
        MultiSigTransactionType.CANCEL_ELECTION,
        CRYPTO_PARAMS.MULTISIG.REQUIRED_SIGNATURES.CANCEL_ELECTION,
      ],
      [
        MultiSigTransactionType.EMERGENCY_SHUTDOWN,
        CRYPTO_PARAMS.MULTISIG.REQUIRED_SIGNATURES.EMERGENCY_SHUTDOWN,
      ],
      [MultiSigTransactionType.PUBLISH_RESULTS, 3],
      [MultiSigTransactionType.ROTATE_KEYS, 4],
    ]);
    this.transactions = new Map();
    this.adminPublicKeys = new Map();
  }

  /**
   * Register an admin's public key
   * @param adminId - Admin ID
   * @param publicKeyPem - Admin's public key (PEM format)
   */
  registerAdmin(adminId: string, publicKeyPem: string): void {
    if (this.adminPublicKeys.size >= this.totalAdmins) {
      throw new Error(`Maximum number of admins (${this.totalAdmins}) reached`);
    }

    // Validate public key format
    try {
      forge.pki.publicKeyFromPem(publicKeyPem);
    } catch (error) {
      throw new Error('Invalid public key format');
    }

    this.adminPublicKeys.set(adminId, publicKeyPem);
  }

  /**
   * Create a new multi-sig transaction
   * @param type - Transaction type
   * @param payload - Transaction payload
   * @param createdBy - Admin ID who created it
   * @param expiryHours - Hours until expiry (default: 24)
   * @returns Created transaction
   */
  createTransaction(
    type: MultiSigTransactionType,
    payload: Record<string, unknown>,
    createdBy: string,
    expiryHours: number = 24
  ): MultiSigTransaction {
    if (!this.adminPublicKeys.has(createdBy)) {
      throw new Error('Creator is not a registered admin');
    }

    const required = this.requiredSignatures.get(type);
    if (!required) {
      throw new Error('Unknown transaction type');
    }

    const transaction: MultiSigTransaction = {
      id: uuidv4(),
      type,
      payload,
      requiredSignatures: required,
      signatures: [],
      status: 'PENDING',
      createdAt: new Date(),
      createdBy,
      expiresAt: new Date(Date.now() + expiryHours * 60 * 60 * 1000),
    };

    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  /**
   * Sign a transaction
   * @param transactionId - Transaction ID
   * @param adminId - Admin ID signing
   * @param privateKeyPem - Admin's private key
   * @returns Updated transaction
   */
  signTransaction(
    transactionId: string,
    adminId: string,
    privateKeyPem: string
  ): MultiSigTransaction {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== 'PENDING') {
      throw new Error(`Transaction is ${transaction.status}, cannot sign`);
    }

    if (new Date() > transaction.expiresAt) {
      transaction.status = 'EXPIRED';
      throw new Error('Transaction has expired');
    }

    if (!this.adminPublicKeys.has(adminId)) {
      throw new Error('Signer is not a registered admin');
    }

    // Check if admin already signed
    if (transaction.signatures.some((sig) => sig.adminId === adminId)) {
      throw new Error('Admin has already signed this transaction');
    }

    // Generate signature
    const signature = this.generateSignature(transaction, privateKeyPem);
    const publicKeyPem = this.adminPublicKeys.get(adminId)!;

    // Verify signature
    const isValid = this.verifySignature(transaction, signature, publicKeyPem);
    if (!isValid) {
      throw new Error('Signature verification failed');
    }

    // Add signature
    transaction.signatures.push({
      adminId,
      signature,
      publicKey: publicKeyPem,
      signedAt: new Date(),
      verified: true,
    });

    // Check if enough signatures
    if (transaction.signatures.length >= transaction.requiredSignatures) {
      transaction.status = 'APPROVED';
    }

    return transaction;
  }

  /**
   * Execute a transaction (after approval)
   * @param transactionId - Transaction ID
   * @param executor - Admin executing
   * @returns Executed transaction
   */
  executeTransaction(transactionId: string, executor: string): MultiSigTransaction {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== 'APPROVED') {
      throw new Error('Transaction must be approved before execution');
    }

    if (!this.adminPublicKeys.has(executor)) {
      throw new Error('Executor is not a registered admin');
    }

    // Execute transaction (actual execution logic would be in backend)
    transaction.status = 'EXECUTED';
    transaction.executedAt = new Date();

    return transaction;
  }

  /**
   * Reject a transaction
   * @param transactionId - Transaction ID
   * @param adminId - Admin rejecting
   * @returns Updated transaction
   */
  rejectTransaction(transactionId: string, adminId: string): MultiSigTransaction {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== 'PENDING') {
      throw new Error('Can only reject pending transactions');
    }

    if (!this.adminPublicKeys.has(adminId)) {
      throw new Error('Rejector is not a registered admin');
    }

    transaction.status = 'REJECTED';
    return transaction;
  }

  /**
   * Generate signature for transaction
   * @param transaction - Transaction to sign
   * @param privateKeyPem - Private key
   * @returns Signature (base64)
   */
  private generateSignature(transaction: MultiSigTransaction, privateKeyPem: string): string {
    try {
      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

      // Create canonical representation of transaction
      const transactionData = this.canonicalizeTransaction(transaction);

      // Create message digest
      const md = forge.md.sha256.create();
      md.update(transactionData, 'utf8');

      // Sign
      const signature = privateKey.sign(md);

      return forge.util.encode64(signature);
    } catch (error) {
      throw new Error(`Signature generation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Verify signature
   * @param transaction - Transaction
   * @param signature - Signature (base64)
   * @param publicKeyPem - Public key
   * @returns True if valid
   */
  private verifySignature(
    transaction: MultiSigTransaction,
    signature: string,
    publicKeyPem: string
  ): boolean {
    try {
      const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

      // Create canonical representation
      const transactionData = this.canonicalizeTransaction(transaction);

      // Create message digest
      const md = forge.md.sha256.create();
      md.update(transactionData, 'utf8');

      // Decode signature
      const sig = forge.util.decode64(signature);

      // Verify
      return publicKey.verify(md.digest().bytes(), sig);
    } catch {
      return false;
    }
  }

  /**
   * Create canonical representation of transaction for signing
   * @param transaction - Transaction
   * @returns Canonical string
   */
  private canonicalizeTransaction(transaction: MultiSigTransaction): string {
    // Create deterministic representation (exclude signatures)
    const canonical = {
      id: transaction.id,
      type: transaction.type,
      payload: transaction.payload,
      requiredSignatures: transaction.requiredSignatures,
      createdAt: transaction.createdAt.toISOString(),
      createdBy: transaction.createdBy,
      expiresAt: transaction.expiresAt.toISOString(),
    };

    // Sort keys for determinism
    return JSON.stringify(canonical, Object.keys(canonical).sort());
  }

  /**
   * Get transaction by ID
   * @param transactionId - Transaction ID
   * @returns Transaction or undefined
   */
  getTransaction(transactionId: string): MultiSigTransaction | undefined {
    return this.transactions.get(transactionId);
  }

  /**
   * Get all pending transactions
   * @returns Array of pending transactions
   */
  getPendingTransactions(): MultiSigTransaction[] {
    return Array.from(this.transactions.values()).filter((tx) => tx.status === 'PENDING');
  }

  /**
   * Get transactions by type
   * @param type - Transaction type
   * @returns Array of transactions
   */
  getTransactionsByType(type: MultiSigTransactionType): MultiSigTransaction[] {
    return Array.from(this.transactions.values()).filter((tx) => tx.type === type);
  }

  /**
   * Get transactions created by admin
   * @param adminId - Admin ID
   * @returns Array of transactions
   */
  getTransactionsByCreator(adminId: string): MultiSigTransaction[] {
    return Array.from(this.transactions.values()).filter((tx) => tx.createdBy === adminId);
  }

  /**
   * Get transactions signed by admin
   * @param adminId - Admin ID
   * @returns Array of transactions
   */
  getTransactionsSignedBy(adminId: string): MultiSigTransaction[] {
    return Array.from(this.transactions.values()).filter((tx) =>
      tx.signatures.some((sig) => sig.adminId === adminId)
    );
  }

  /**
   * Clean up expired transactions
   * @returns Number of cleaned transactions
   */
  cleanupExpiredTransactions(): number {
    const now = new Date();
    let count = 0;

    this.transactions.forEach((tx, id) => {
      if (tx.status === 'PENDING' && now > tx.expiresAt) {
        tx.status = 'EXPIRED';
        count++;
      }
    });

    return count;
  }

  /**
   * Get signature progress for transaction
   * @param transactionId - Transaction ID
   * @returns Progress information
   */
  getSignatureProgress(transactionId: string): {
    current: number;
    required: number;
    percentage: number;
    remaining: number;
    signers: string[];
  } | null {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      return null;
    }

    const current = transaction.signatures.length;
    const required = transaction.requiredSignatures;
    const percentage = (current / required) * 100;
    const remaining = Math.max(0, required - current);
    const signers = transaction.signatures.map((sig) => sig.adminId);

    return {
      current,
      required,
      percentage,
      remaining,
      signers,
    };
  }

  /**
   * Validate transaction payload based on type
   * @param type - Transaction type
   * @param payload - Payload to validate
   * @returns True if valid
   */
  validatePayload(type: MultiSigTransactionType, payload: Record<string, unknown>): boolean {
    switch (type) {
      case MultiSigTransactionType.CREATE_ELECTION:
        return !!(payload.title && payload.startDate && payload.endDate);

      case MultiSigTransactionType.CLOSE_ELECTION:
        return !!payload.electionId;

      case MultiSigTransactionType.START_DECRYPTION:
        return !!(payload.electionId && payload.custodianIds);

      case MultiSigTransactionType.CANCEL_ELECTION:
        return !!(payload.electionId && payload.reason);

      case MultiSigTransactionType.EMERGENCY_SHUTDOWN:
        return !!(payload.reason && payload.affectedSystems);

      case MultiSigTransactionType.PUBLISH_RESULTS:
        return !!(payload.electionId && payload.results);

      case MultiSigTransactionType.ROTATE_KEYS:
        return !!(payload.keyType && payload.newPublicKeys);

      default:
        return false;
    }
  }

  /**
   * Get registered admins count
   * @returns Number of registered admins
   */
  getRegisteredAdminsCount(): number {
    return this.adminPublicKeys.size;
  }

  /**
   * Check if admin is registered
   * @param adminId - Admin ID
   * @returns True if registered
   */
  isAdminRegistered(adminId: string): boolean {
    return this.adminPublicKeys.has(adminId);
  }
}

export default MultiSigWallet;

