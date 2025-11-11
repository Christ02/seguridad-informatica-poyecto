import secrets from 'secrets.js-34r7h';
import { ShamirShare } from '@voting-system/shared';

/**
 * Shamir Secret Sharing implementation
 * Implements threshold cryptography (k-of-n) scheme
 */
export class ShamirSecretSharing {
  /**
   * Split a secret into n shares with threshold k
   * @param secret - The secret to split (hex string)
   * @param totalShares - Total number of shares to create (n)
   * @param threshold - Minimum shares needed to reconstruct (k)
   * @returns Array of shares
   */
  static splitSecret(
    secret: string,
    totalShares: number,
    threshold: number
  ): ShamirShare[] {
    if (threshold > totalShares) {
      throw new Error('Threshold cannot be greater than total shares');
    }

    if (threshold < 2) {
      throw new Error('Threshold must be at least 2');
    }

    if (totalShares > 255) {
      throw new Error('Total shares cannot exceed 255');
    }

    // Convert secret to hex if not already
    const hexSecret = Buffer.from(secret).toString('hex');

    // Generate shares using secrets.js
    const shares = secrets.share(hexSecret, totalShares, threshold);

    // Convert to structured format
    return shares.map((share, index) => {
      // Share format is "xyyyy..." where x is the share index
      const shareIndex = parseInt(share.substring(0, 1), 16);
      return {
        x: shareIndex,
        y: share,
      };
    });
  }

  /**
   * Combine shares to reconstruct the secret
   * @param shares - Array of shares (minimum threshold required)
   * @returns Reconstructed secret
   */
  static combineShares(shares: ShamirShare[]): string {
    if (shares.length < 2) {
      throw new Error('At least 2 shares required to combine');
    }

    try {
      // Extract share strings
      const shareStrings = shares.map((s) => s.y);

      // Combine shares
      const hexSecret = secrets.combine(shareStrings);

      // Convert from hex back to original format
      return Buffer.from(hexSecret, 'hex').toString('utf-8');
    } catch (error) {
      throw new Error(`Failed to combine shares: ${(error as Error).message}`);
    }
  }

  /**
   * Verify that a set of shares can reconstruct the secret
   * @param shares - Shares to verify
   * @param expectedSecret - Expected secret (for verification)
   * @returns True if shares are valid
   */
  static verifyShares(shares: ShamirShare[], expectedSecret: string): boolean {
    try {
      const reconstructed = this.combineShares(shares);
      return reconstructed === expectedSecret;
    } catch {
      return false;
    }
  }

  /**
   * Generate random shares for testing
   * @param totalShares - Total number of shares
   * @param threshold - Threshold
   * @returns Test secret and shares
   */
  static generateTestShares(
    totalShares: number,
    threshold: number
  ): { secret: string; shares: ShamirShare[] } {
    const secret = Buffer.from(
      Array.from({ length: 32 }, () => Math.floor(Math.random() * 256))
    ).toString('hex');

    const shares = this.splitSecret(secret, totalShares, threshold);

    return { secret, shares };
  }

  /**
   * Get share by index
   * @param shares - Array of shares
   * @param index - Index to find
   * @returns Share at index or undefined
   */
  static getShareByIndex(shares: ShamirShare[], index: number): ShamirShare | undefined {
    return shares.find((s) => s.x === index);
  }

  /**
   * Validate share format
   * @param share - Share to validate
   * @returns True if valid
   */
  static isValidShare(share: ShamirShare): boolean {
    if (!share || typeof share.x !== 'number' || typeof share.y !== 'string') {
      return false;
    }

    // Check share string format (hex)
    return /^[0-9a-f]+$/i.test(share.y);
  }

  /**
   * Calculate maximum shares that can be created
   * Based on the field size used by secrets.js (256)
   */
  static readonly MAX_SHARES = 255;

  /**
   * Minimum threshold for security
   */
  static readonly MIN_THRESHOLD = 2;
}

export default ShamirSecretSharing;

