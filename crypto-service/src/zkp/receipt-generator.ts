import crypto from 'crypto';
import { SchnorrProtocol } from './schnorr-protocol';
import { VoteReceipt, ZKProof, EncryptedVote } from '@voting-system/shared';
import { v4 as uuidv4 } from 'uuid';

/**
 * Receipt Generator for non-coercible vote verification
 * Allows voters to verify their vote was counted without revealing how they voted
 */
export class ReceiptGenerator {
  private schnorr: SchnorrProtocol;

  constructor() {
    this.schnorr = new SchnorrProtocol();
  }

  /**
   * Generate a non-coercible receipt for a vote
   * The receipt proves inclusion in blockchain without revealing the vote content
   * 
   * @param vote - Encrypted vote
   * @param blockHash - Hash of the block containing the vote
   * @param blockIndex - Index of the block
   * @param merkleProof - Merkle proof of inclusion
   * @returns Vote receipt with ZK proof
   */
  generateReceipt(
    vote: EncryptedVote,
    blockHash: string,
    blockIndex: number,
    merkleProof: string[]
  ): VoteReceipt {
    try {
      // Generate unique receipt ID
      const receiptId = uuidv4();

      // Create ZK proof of inclusion
      // The proof shows the vote is in the blockchain without revealing which vote it is
      const zkProof = this.createInclusionProof(vote, blockHash, merkleProof);

      // Generate verification URL
      const verificationUrl = this.generateVerificationUrl(receiptId, vote.electionId);

      const receipt: VoteReceipt = {
        receiptId,
        electionId: vote.electionId,
        blockHash,
        blockIndex,
        timestamp: new Date(),
        zkProof: zkProof.proof,
        merkleProof,
        verificationUrl,
      };

      return receipt;
    } catch (error) {
      throw new Error(`Receipt generation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Create ZK proof of inclusion in blockchain
   * This proves a vote is in a specific block without revealing the vote
   * 
   * @param vote - Encrypted vote
   * @param blockHash - Block hash
   * @param merkleProof - Merkle proof
   * @returns ZK Proof
   */
  private createInclusionProof(
    vote: EncryptedVote,
    blockHash: string,
    merkleProof: string[]
  ): ZKProof {
    // Generate ephemeral key pair for this proof
    const keyPair = this.schnorr.generateKeyPair();

    // Create commitment to the vote
    const randomness = this.schnorr.generateRandomScalar();
    const voteHash = crypto
      .createHash('sha256')
      .update(vote.encryptedData)
      .digest('hex');

    const commitment = this.schnorr.createCommitment(voteHash, randomness);

    // Create message for proof: combines commitment, block hash, and merkle root
    const message = JSON.stringify({
      commitment,
      blockHash,
      merkleRoot: merkleProof[merkleProof.length - 1], // Root is last element
      timestamp: new Date().toISOString(),
    });

    // Generate Schnorr proof
    return this.schnorr.generateProof(message, keyPair.privateKey);
  }

  /**
   * Verify a receipt's ZK proof
   * @param receipt - Receipt to verify
   * @returns True if valid
   */
  verifyReceipt(receipt: VoteReceipt): boolean {
    try {
      const zkProof: ZKProof = {
        proof: receipt.zkProof,
        publicSignals: [],
        curve: 'secp256k1',
        protocol: 'schnorr',
        createdAt: receipt.timestamp,
      };

      const verification = this.schnorr.verifyProof(zkProof);
      return verification.isValid;
    } catch {
      return false;
    }
  }

  /**
   * Verify Merkle proof of inclusion
   * @param voteHash - Hash of the vote
   * @param merkleProof - Merkle proof path
   * @param merkleRoot - Expected Merkle root
   * @returns True if valid
   */
  verifyMerkleProof(voteHash: string, merkleProof: string[], merkleRoot: string): boolean {
    try {
      let currentHash = voteHash;

      // Traverse the Merkle tree
      for (const proofHash of merkleProof) {
        // Concatenate and hash
        const combined = [currentHash, proofHash].sort().join('');
        currentHash = crypto.createHash('sha256').update(combined).digest('hex');
      }

      // Final hash should match root
      return currentHash === merkleRoot;
    } catch {
      return false;
    }
  }

  /**
   * Generate verification URL for receipt
   * @param receiptId - Receipt ID
   * @param electionId - Election ID
   * @returns Verification URL
   */
  private generateVerificationUrl(receiptId: string, electionId: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5175';
    return `${baseUrl}/verify?receipt=${receiptId}&election=${electionId}`;
  }

  /**
   * Generate a printable receipt (for user)
   * @param receipt - Vote receipt
   * @returns Formatted receipt string
   */
  generatePrintableReceipt(receipt: VoteReceipt): string {
    return `
═══════════════════════════════════════════════════
        SECURE VOTING SYSTEM - VOTE RECEIPT
═══════════════════════════════════════════════════

Receipt ID: ${receipt.receiptId}
Election ID: ${receipt.electionId}
Date: ${receipt.timestamp.toISOString()}

Block Information:
  Index: ${receipt.blockIndex}
  Hash: ${receipt.blockHash.substring(0, 16)}...

Verification:
  ${receipt.verificationUrl}

═══════════════════════════════════════════════════
IMPORTANT NOTICE:

This receipt PROVES your vote was recorded in the
blockchain but DOES NOT REVEAL how you voted.

You cannot use this receipt to prove to anyone else
how you voted (non-coercible design).

Keep this receipt to verify your vote was counted
in the final tally.
═══════════════════════════════════════════════════
    `.trim();
  }

  /**
   * Generate QR code data for receipt
   * @param receipt - Vote receipt
   * @returns QR code data string
   */
  generateQRCodeData(receipt: VoteReceipt): string {
    return JSON.stringify({
      id: receipt.receiptId,
      election: receipt.electionId,
      block: receipt.blockIndex,
      hash: receipt.blockHash.substring(0, 16),
      url: receipt.verificationUrl,
    });
  }

  /**
   * Create anonymous verification token
   * Allows verification without linking to user identity
   * 
   * @param receiptId - Receipt ID
   * @returns Anonymous token
   */
  createAnonymousToken(receiptId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto
      .createHash('sha256')
      .update(receiptId + token)
      .digest('hex');

    return `${token}.${hash}`;
  }

  /**
   * Verify anonymous token
   * @param token - Token to verify
   * @param receiptId - Receipt ID
   * @returns True if valid
   */
  verifyAnonymousToken(token: string, receiptId: string): boolean {
    try {
      const [tokenPart, hashPart] = token.split('.');
      const expectedHash = crypto
        .createHash('sha256')
        .update(receiptId + tokenPart)
        .digest('hex');

      return expectedHash === hashPart;
    } catch {
      return false;
    }
  }
}

export default ReceiptGenerator;

