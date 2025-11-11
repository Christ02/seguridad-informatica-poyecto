import forge from 'node-forge';
import { ShamirSecretSharing } from './shamir';
import { ThresholdParams, RSAKeyPair, ShamirShare, KeyShare } from '@voting-system/shared';
import { v4 as uuidv4 } from 'uuid';

/**
 * Threshold RSA implementation
 * Combines RSA encryption with Shamir Secret Sharing
 */
export class ThresholdRSA {
  /**
   * Generate RSA key pair and split private key using threshold scheme
   * @param keySize - RSA key size (2048, 4096)
   * @param totalShares - Total number of shares
   * @param threshold - Minimum shares needed
   * @returns Key pair and shares
   */
  static async generateThresholdKeys(
    keySize: number = 4096,
    totalShares: number = 5,
    threshold: number = 3
  ): Promise<{
    publicKey: string;
    privateKeyShares: ShamirShare[];
    thresholdParams: ThresholdParams;
  }> {
    return new Promise((resolve, reject) => {
      // Generate RSA key pair
      forge.pki.rsa.generateKeyPair({ bits: keySize, workers: -1 }, (err, keypair) => {
        if (err) {
          reject(new Error(`Key generation failed: ${err.message}`));
          return;
        }

        try {
          // Convert keys to PEM format
          const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
          const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

          // Split private key using Shamir Secret Sharing
          const privateKeyShares = ShamirSecretSharing.splitSecret(
            privateKeyPem,
            totalShares,
            threshold
          );

          // Create threshold parameters
          const thresholdParams: ThresholdParams = {
            threshold,
            totalShares,
            keyId: uuidv4(),
            publicKey: publicKeyPem,
            algorithm: keySize === 4096 ? 'RSA-4096' : 'RSA-2048',
          };

          resolve({
            publicKey: publicKeyPem,
            privateKeyShares,
            thresholdParams,
          });
        } catch (error) {
          reject(new Error(`Key splitting failed: ${(error as Error).message}`));
        }
      });
    });
  }

  /**
   * Encrypt data with public key
   * @param data - Data to encrypt
   * @param publicKeyPem - Public key in PEM format
   * @returns Encrypted data (base64)
   */
  static encrypt(data: string, publicKeyPem: string): string {
    try {
      const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

      // Encrypt data
      const encrypted = publicKey.encrypt(data, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: {
          md: forge.md.sha256.create(),
        },
      });

      // Return base64 encoded
      return forge.util.encode64(encrypted);
    } catch (error) {
      throw new Error(`Encryption failed: ${(error as Error).message}`);
    }
  }

  /**
   * Decrypt data using combined private key shares
   * @param encryptedData - Encrypted data (base64)
   * @param shares - Private key shares (minimum threshold required)
   * @returns Decrypted data
   */
  static decrypt(encryptedData: string, shares: ShamirShare[]): string {
    try {
      // Combine shares to reconstruct private key
      const privateKeyPem = ShamirSecretSharing.combineShares(shares);

      // Parse private key
      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

      // Decode base64
      const encrypted = forge.util.decode64(encryptedData);

      // Decrypt data
      const decrypted = privateKey.decrypt(encrypted, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: {
          md: forge.md.sha256.create(),
        },
      });

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${(error as Error).message}`);
    }
  }

  /**
   * Encrypt data in chunks (for large data)
   * @param data - Data to encrypt
   * @param publicKeyPem - Public key
   * @param chunkSize - Chunk size (default: 190 bytes for 2048-bit, 446 bytes for 4096-bit)
   * @returns Array of encrypted chunks
   */
  static encryptLarge(data: string, publicKeyPem: string, chunkSize?: number): string[] {
    try {
      const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
      
      // Determine chunk size based on key size
      if (!chunkSize) {
        // RSA-OAEP with SHA-256: keySize/8 - 2*hashSize - 2
        // For 4096-bit: 512 - 64 - 2 = 446 bytes
        // For 2048-bit: 256 - 64 - 2 = 190 bytes
        const keySize = (publicKey as any).n.bitLength();
        chunkSize = Math.floor(keySize / 8) - 66;
      }

      const chunks: string[] = [];
      const dataBuffer = Buffer.from(data, 'utf-8');

      for (let i = 0; i < dataBuffer.length; i += chunkSize) {
        const chunk = dataBuffer.slice(i, i + chunkSize);
        const encrypted = publicKey.encrypt(chunk.toString('binary'), 'RSA-OAEP', {
          md: forge.md.sha256.create(),
          mgf1: {
            md: forge.md.sha256.create(),
          },
        });
        chunks.push(forge.util.encode64(encrypted));
      }

      return chunks;
    } catch (error) {
      throw new Error(`Large data encryption failed: ${(error as Error).message}`);
    }
  }

  /**
   * Decrypt chunked data
   * @param encryptedChunks - Array of encrypted chunks
   * @param shares - Private key shares
   * @returns Decrypted data
   */
  static decryptLarge(encryptedChunks: string[], shares: ShamirShare[]): string {
    try {
      // Combine shares to reconstruct private key
      const privateKeyPem = ShamirSecretSharing.combineShares(shares);
      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

      const decryptedChunks: string[] = [];

      for (const chunk of encryptedChunks) {
        const encrypted = forge.util.decode64(chunk);
        const decrypted = privateKey.decrypt(encrypted, 'RSA-OAEP', {
          md: forge.md.sha256.create(),
          mgf1: {
            md: forge.md.sha256.create(),
          },
        });
        decryptedChunks.push(decrypted);
      }

      return decryptedChunks.join('');
    } catch (error) {
      throw new Error(`Large data decryption failed: ${(error as Error).message}`);
    }
  }

  /**
   * Sign data with private key shares
   * @param data - Data to sign
   * @param shares - Private key shares
   * @returns Signature (base64)
   */
  static sign(data: string, shares: ShamirShare[]): string {
    try {
      // Combine shares to reconstruct private key
      const privateKeyPem = ShamirSecretSharing.combineShares(shares);
      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

      // Create message digest
      const md = forge.md.sha256.create();
      md.update(data, 'utf8');

      // Sign
      const signature = privateKey.sign(md);

      return forge.util.encode64(signature);
    } catch (error) {
      throw new Error(`Signing failed: ${(error as Error).message}`);
    }
  }

  /**
   * Verify signature with public key
   * @param data - Original data
   * @param signature - Signature (base64)
   * @param publicKeyPem - Public key
   * @returns True if valid
   */
  static verify(data: string, signature: string, publicKeyPem: string): boolean {
    try {
      const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

      // Create message digest
      const md = forge.md.sha256.create();
      md.update(data, 'utf8');

      // Decode signature
      const sig = forge.util.decode64(signature);

      // Verify
      return publicKey.verify(md.digest().bytes(), sig);
    } catch {
      return false;
    }
  }

  /**
   * Generate public commitment for a share (for verification)
   * @param share - Share to commit
   * @returns Commitment (hash)
   */
  static generateShareCommitment(share: ShamirShare): string {
    const md = forge.md.sha256.create();
    md.update(JSON.stringify(share));
    return md.digest().toHex();
  }

  /**
   * Verify share commitment
   * @param share - Share to verify
   * @param commitment - Expected commitment
   * @returns True if valid
   */
  static verifyShareCommitment(share: ShamirShare, commitment: string): boolean {
    const computed = this.generateShareCommitment(share);
    return computed === commitment;
  }

  /**
   * Export key share for storage
   * @param share - Share to export
   * @param custodianId - Custodian ID
   * @param electionId - Election ID
   * @returns Key share object
   */
  static exportKeyShare(
    share: ShamirShare,
    custodianId: number,
    electionId: string
  ): Omit<KeyShare, 'createdAt'> {
    return {
      shareIndex: share.x,
      custodianId,
      encryptedShare: share.y,
      publicCommitment: this.generateShareCommitment(share),
      electionId,
    };
  }

  /**
   * Import key share from storage
   * @param keyShare - Key share object
   * @returns Shamir share
   */
  static importKeyShare(keyShare: KeyShare): ShamirShare {
    return {
      x: keyShare.shareIndex,
      y: keyShare.encryptedShare,
    };
  }
}

export default ThresholdRSA;

