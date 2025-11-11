import forge from 'node-forge';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';

/**
 * Admin Keys Management
 * Handles generation, storage, and encryption of admin keys for multi-sig
 */
export class AdminKeysManager {
  /**
   * Generate RSA key pair for admin
   * @param keySize - Key size in bits (2048 or 4096)
   * @returns Promise with key pair
   */
  static async generateAdminKeyPair(
    keySize: number = 2048
  ): Promise<{ publicKey: string; privateKey: string; fingerprint: string }> {
    return new Promise((resolve, reject) => {
      forge.pki.rsa.generateKeyPair({ bits: keySize, workers: -1 }, (err, keypair) => {
        if (err) {
          reject(new Error(`Key generation failed: ${err.message}`));
          return;
        }

        try {
          const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
          const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

          // Generate fingerprint
          const fingerprint = AdminKeysManager.generateKeyFingerprint(publicKeyPem);

          resolve({
            publicKey: publicKeyPem,
            privateKey: privateKeyPem,
            fingerprint,
          });
        } catch (error) {
          reject(new Error(`Key formatting failed: ${(error as Error).message}`));
        }
      });
    });
  }

  /**
   * Generate fingerprint for public key
   * @param publicKeyPem - Public key in PEM format
   * @returns Fingerprint (hex)
   */
  static generateKeyFingerprint(publicKeyPem: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(publicKeyPem);
    return hash.digest('hex');
  }

  /**
   * Encrypt private key with password
   * @param privateKeyPem - Private key
   * @param password - Password
   * @returns Encrypted private key
   */
  static encryptPrivateKey(privateKeyPem: string, password: string): string {
    try {
      // Use AES-256-CBC for encryption
      const encrypted = CryptoJS.AES.encrypt(privateKeyPem, password).toString();
      return encrypted;
    } catch (error) {
      throw new Error(`Private key encryption failed: ${(error as Error).message}`);
    }
  }

  /**
   * Decrypt private key with password
   * @param encryptedKey - Encrypted private key
   * @param password - Password
   * @returns Decrypted private key (PEM)
   */
  static decryptPrivateKey(encryptedKey: string, password: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedKey, password);
      const privateKeyPem = decrypted.toString(CryptoJS.enc.Utf8);

      if (!privateKeyPem) {
        throw new Error('Decryption failed or wrong password');
      }

      // Validate it's a valid private key
      forge.pki.privateKeyFromPem(privateKeyPem);

      return privateKeyPem;
    } catch (error) {
      throw new Error(`Private key decryption failed: ${(error as Error).message}`);
    }
  }

  /**
   * Derive encryption key from password (PBKDF2)
   * @param password - Password
   * @param salt - Salt (hex)
   * @param iterations - Number of iterations
   * @returns Derived key (hex)
   */
  static deriveKeyFromPassword(
    password: string,
    salt: string,
    iterations: number = 100000
  ): string {
    const key = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), iterations, 32, 'sha256');
    return key.toString('hex');
  }

  /**
   * Generate random salt
   * @returns Salt (hex)
   */
  static generateSalt(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate public key format
   * @param publicKeyPem - Public key to validate
   * @returns True if valid
   */
  static validatePublicKey(publicKeyPem: string): boolean {
    try {
      forge.pki.publicKeyFromPem(publicKeyPem);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate private key format
   * @param privateKeyPem - Private key to validate
   * @returns True if valid
   */
  static validatePrivateKey(privateKeyPem: string): boolean {
    try {
      forge.pki.privateKeyFromPem(privateKeyPem);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Export admin key bundle for secure storage
   * @param adminId - Admin ID
   * @param publicKey - Public key
   * @param encryptedPrivateKey - Encrypted private key
   * @param fingerprint - Key fingerprint
   * @returns Key bundle object
   */
  static exportKeyBundle(
    adminId: string,
    publicKey: string,
    encryptedPrivateKey: string,
    fingerprint: string
  ): {
    adminId: string;
    publicKey: string;
    encryptedPrivateKey: string;
    fingerprint: string;
    createdAt: string;
    version: string;
  } {
    return {
      adminId,
      publicKey,
      encryptedPrivateKey,
      fingerprint,
      createdAt: new Date().toISOString(),
      version: '1.0',
    };
  }

  /**
   * Import key bundle
   * @param bundle - Key bundle
   * @returns Validated key bundle
   */
  static importKeyBundle(bundle: {
    adminId: string;
    publicKey: string;
    encryptedPrivateKey: string;
    fingerprint: string;
  }): boolean {
    // Validate public key
    if (!AdminKeysManager.validatePublicKey(bundle.publicKey)) {
      return false;
    }

    // Validate fingerprint matches
    const computedFingerprint = AdminKeysManager.generateKeyFingerprint(bundle.publicKey);
    if (computedFingerprint !== bundle.fingerprint) {
      return false;
    }

    return true;
  }

  /**
   * Generate backup codes for admin (in case of key loss)
   * @param count - Number of codes to generate
   * @returns Array of backup codes
   */
  static generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      // Format as XXXX-XXXX
      const formatted = `${code.substring(0, 4)}-${code.substring(4, 8)}`;
      codes.push(formatted);
    }

    return codes;
  }

  /**
   * Hash backup code for storage
   * @param code - Backup code
   * @returns Hashed code
   */
  static hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  /**
   * Verify backup code
   * @param code - Code to verify
   * @param hashedCode - Stored hash
   * @returns True if valid
   */
  static verifyBackupCode(code: string, hashedCode: string): boolean {
    const hash = AdminKeysManager.hashBackupCode(code);
    return hash === hashedCode;
  }

  /**
   * Rotate admin keys (generate new pair)
   * @param oldPrivateKeyPem - Old private key
   * @param password - Password for encryption
   * @returns New key pair and encrypted old key
   */
  static async rotateKeys(
    oldPrivateKeyPem: string,
    password: string
  ): Promise<{
    newPublicKey: string;
    newPrivateKey: string;
    newFingerprint: string;
    oldKeyEncrypted: string;
  }> {
    // Generate new key pair
    const newKeys = await AdminKeysManager.generateAdminKeyPair();

    // Encrypt old key for archive
    const oldKeyEncrypted = AdminKeysManager.encryptPrivateKey(oldPrivateKeyPem, password);

    return {
      newPublicKey: newKeys.publicKey,
      newPrivateKey: newKeys.privateKey,
      newFingerprint: newKeys.fingerprint,
      oldKeyEncrypted,
    };
  }

  /**
   * Create key metadata for auditing
   * @param adminId - Admin ID
   * @param publicKey - Public key
   * @param operation - Operation type
   * @returns Metadata object
   */
  static createKeyMetadata(
    adminId: string,
    publicKey: string,
    operation: 'CREATED' | 'ROTATED' | 'REVOKED'
  ): {
    adminId: string;
    fingerprint: string;
    operation: string;
    timestamp: string;
    publicKeyHash: string;
  } {
    const fingerprint = AdminKeysManager.generateKeyFingerprint(publicKey);
    const publicKeyHash = crypto.createHash('sha256').update(publicKey).digest('hex');

    return {
      adminId,
      fingerprint,
      operation,
      timestamp: new Date().toISOString(),
      publicKeyHash,
    };
  }
}

export default AdminKeysManager;

