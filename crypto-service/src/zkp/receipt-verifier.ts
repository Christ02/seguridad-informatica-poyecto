import crypto from 'crypto';
import { VoteReceipt, VoteVerification, BlockchainBlock } from '@voting-system/shared';
import { ReceiptGenerator } from './receipt-generator';

/**
 * Receipt Verifier
 * Verifies vote receipts against the blockchain
 */
export class ReceiptVerifier {
  private receiptGenerator: ReceiptGenerator;

  constructor() {
    this.receiptGenerator = new ReceiptGenerator();
  }

  /**
   * Verify a vote receipt against blockchain data
   * @param receipt - Receipt to verify
   * @param block - Blockchain block containing the vote
   * @param merkleRoot - Merkle root of the block
   * @returns Verification result
   */
  verifyReceipt(
    receipt: VoteReceipt,
    block: BlockchainBlock,
    merkleRoot: string
  ): VoteVerification {
    try {
      // Verify block hash matches
      const blockHashValid = receipt.blockHash === block.hash;

      // Verify block index matches
      const blockIndexValid = receipt.blockIndex === block.index;

      // Verify Merkle proof
      const voteHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(block.data))
        .digest('hex');

      const merkleProofValid = this.receiptGenerator.verifyMerkleProof(
        voteHash,
        receipt.merkleProof,
        merkleRoot
      );

      // Verify ZK proof
      const zkProofValid = this.receiptGenerator.verifyReceipt(receipt);

      // Overall validity
      const isValid = blockHashValid && blockIndexValid && merkleProofValid && zkProofValid;

      return {
        receiptId: receipt.receiptId,
        isValid,
        blockIndex: receipt.blockIndex,
        blockHash: receipt.blockHash,
        merkleProofValid,
        zkProofValid,
        timestamp: receipt.timestamp,
        verifiedAt: new Date(),
      };
    } catch (error) {
      // Return invalid verification on error
      return {
        receiptId: receipt.receiptId,
        isValid: false,
        blockIndex: receipt.blockIndex,
        blockHash: receipt.blockHash,
        merkleProofValid: false,
        zkProofValid: false,
        timestamp: receipt.timestamp,
        verifiedAt: new Date(),
      };
    }
  }

  /**
   * Batch verify multiple receipts
   * @param receipts - Array of receipts
   * @param blocks - Map of block index to block
   * @param merkleRoots - Map of block index to merkle root
   * @returns Array of verification results
   */
  batchVerifyReceipts(
    receipts: VoteReceipt[],
    blocks: Map<number, BlockchainBlock>,
    merkleRoots: Map<number, string>
  ): VoteVerification[] {
    return receipts.map((receipt) => {
      const block = blocks.get(receipt.blockIndex);
      const merkleRoot = merkleRoots.get(receipt.blockIndex);

      if (!block || !merkleRoot) {
        return {
          receiptId: receipt.receiptId,
          isValid: false,
          blockIndex: receipt.blockIndex,
          blockHash: receipt.blockHash,
          merkleProofValid: false,
          zkProofValid: false,
          timestamp: receipt.timestamp,
          verifiedAt: new Date(),
        };
      }

      return this.verifyReceipt(receipt, block, merkleRoot);
    });
  }

  /**
   * Generate verification report
   * @param receipt - Receipt to verify
   * @param verification - Verification result
   * @returns Human-readable report
   */
  generateVerificationReport(receipt: VoteReceipt, verification: VoteVerification): string {
    const status = verification.isValid ? '✓ VALID' : '✗ INVALID';
    const statusSymbol = verification.isValid ? '✓' : '✗';

    return `
═══════════════════════════════════════════════════
      VOTE RECEIPT VERIFICATION REPORT
═══════════════════════════════════════════════════

Receipt ID: ${receipt.receiptId}
Election: ${receipt.electionId}
Status: ${status}

Verification Details:
  ${statusSymbol} Block Hash: ${verification.merkleProofValid ? 'Valid' : 'Invalid'}
  ${statusSymbol} Block Index: #${verification.blockIndex}
  ${statusSymbol} Merkle Proof: ${verification.merkleProofValid ? 'Valid' : 'Invalid'}
  ${statusSymbol} ZK Proof: ${verification.zkProofValid ? 'Valid' : 'Invalid'}

Timestamps:
  Vote Cast: ${receipt.timestamp.toISOString()}
  Verified: ${verification.verifiedAt.toISOString()}

Block Hash: ${verification.blockHash.substring(0, 32)}...

═══════════════════════════════════════════════════
${verification.isValid 
  ? 'Your vote has been successfully verified in the blockchain.'
  : 'Verification failed. Please contact election authorities.'}
═══════════════════════════════════════════════════
    `.trim();
  }

  /**
   * Check if a receipt has expired
   * @param receipt - Receipt to check
   * @param expiryDays - Days until expiry (default: 90)
   * @returns True if expired
   */
  isReceiptExpired(receipt: VoteReceipt, expiryDays: number = 90): boolean {
    const expiryDate = new Date(receipt.timestamp);
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    return new Date() > expiryDate;
  }

  /**
   * Validate receipt format
   * @param receipt - Receipt to validate
   * @returns True if format is valid
   */
  validateReceiptFormat(receipt: VoteReceipt): boolean {
    try {
      // Check required fields
      if (!receipt.receiptId || !receipt.electionId || !receipt.blockHash) {
        return false;
      }

      // Check receipt ID format (UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(receipt.receiptId)) {
        return false;
      }

      // Check block index is non-negative
      if (receipt.blockIndex < 0) {
        return false;
      }

      // Check merkle proof is array
      if (!Array.isArray(receipt.merkleProof)) {
        return false;
      }

      // Check timestamp is valid
      if (!(receipt.timestamp instanceof Date) || isNaN(receipt.timestamp.getTime())) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate verification statistics for multiple receipts
   * @param verifications - Array of verification results
   * @returns Statistics object
   */
  generateStatistics(verifications: VoteVerification[]): {
    total: number;
    valid: number;
    invalid: number;
    validPercentage: number;
    merkleValid: number;
    zkValid: number;
  } {
    const total = verifications.length;
    const valid = verifications.filter((v) => v.isValid).length;
    const invalid = total - valid;
    const validPercentage = total > 0 ? (valid / total) * 100 : 0;
    const merkleValid = verifications.filter((v) => v.merkleProofValid).length;
    const zkValid = verifications.filter((v) => v.zkProofValid).length;

    return {
      total,
      valid,
      invalid,
      validPercentage,
      merkleValid,
      zkValid,
    };
  }
}

export default ReceiptVerifier;

