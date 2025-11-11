import { ec as EC } from 'elliptic';
import crypto from 'crypto';
import { ZKProof, ZKProofVerification } from '@voting-system/shared';

/**
 * Schnorr Protocol implementation for Zero-Knowledge Proofs
 * Used for non-coercible receipt generation
 */
export class SchnorrProtocol {
  private ec: EC;
  private curve: string;

  constructor(curve: string = 'secp256k1') {
    this.ec = new EC(curve);
    this.curve = curve;
  }

  /**
   * Generate a Schnorr signature (used as ZK proof)
   * @param message - Message to sign
   * @param privateKey - Private key (hex)
   * @returns ZK Proof
   */
  generateProof(message: string, privateKey: string): ZKProof {
    try {
      const keyPair = this.ec.keyFromPrivate(privateKey, 'hex');
      const publicKey = keyPair.getPublic();

      // Generate random nonce
      const k = this.ec.genKeyPair().getPrivate();

      // R = k * G
      const R = this.ec.g.mul(k);

      // e = H(R || P || m)
      const hash = crypto.createHash('sha256');
      hash.update(R.encode('hex', false));
      hash.update(publicKey.encode('hex', false));
      hash.update(message);
      const e = hash.digest('hex');

      // s = k + e * x (mod n)
      const eBN = this.ec.curve.n ? this.ec.curve.n.fromRed(this.ec.curve.red.fromNumber(parseInt(e, 16))) : null;
      if (!eBN) throw new Error('Invalid curve parameters');
      
      const s = k.add(eBN.mul(keyPair.getPrivate())).umod(this.ec.curve.n!);

      // Proof = (R, s)
      const proof = {
        R: R.encode('hex', false),
        s: s.toString('hex'),
        e: e,
      };

      return {
        proof: JSON.stringify(proof),
        publicSignals: [publicKey.encode('hex', false), message],
        curve: this.curve,
        protocol: 'schnorr',
        createdAt: new Date(),
      };
    } catch (error) {
      throw new Error(`Schnorr proof generation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Verify a Schnorr proof
   * @param zkProof - ZK Proof to verify
   * @returns Verification result
   */
  verifyProof(zkProof: ZKProof): ZKProofVerification {
    try {
      const proof = JSON.parse(zkProof.proof);
      const [publicKeyHex, message] = zkProof.publicSignals;

      // Parse proof components
      const R = this.ec.curve.decodePoint(proof.R, 'hex');
      const s = this.ec.curve.n!.fromRed(this.ec.curve.red.fromNumber(parseInt(proof.s, 16)));
      const publicKey = this.ec.curve.decodePoint(publicKeyHex, 'hex');

      // Recompute e = H(R || P || m)
      const hash = crypto.createHash('sha256');
      hash.update(proof.R);
      hash.update(publicKeyHex);
      hash.update(message);
      const e = hash.digest('hex');

      // Verify: s * G = R + e * P
      const sG = this.ec.g.mul(s);
      const eBN = this.ec.curve.n!.fromRed(this.ec.curve.red.fromNumber(parseInt(e, 16)));
      const eP = publicKey.mul(eBN);
      const RplusEP = R.add(eP);

      const isValid = sG.eq(RplusEP);

      // Generate proof hash for verification
      const proofHash = crypto.createHash('sha256').update(zkProof.proof).digest('hex');

      return {
        isValid,
        proofHash,
        verifiedAt: new Date(),
        verifier: 'schnorr-protocol',
      };
    } catch (error) {
      return {
        isValid: false,
        proofHash: '',
        verifiedAt: new Date(),
        verifier: 'schnorr-protocol',
      };
    }
  }

  /**
   * Generate a key pair for Schnorr protocol
   * @returns Key pair (private and public keys in hex)
   */
  generateKeyPair(): { privateKey: string; publicKey: string } {
    const keyPair = this.ec.genKeyPair();
    return {
      privateKey: keyPair.getPrivate('hex'),
      publicKey: keyPair.getPublic().encode('hex', false),
    };
  }

  /**
   * Create commitment for a value (used in receipt generation)
   * @param value - Value to commit
   * @param randomness - Random value (blinding factor)
   * @returns Commitment
   */
  createCommitment(value: string, randomness: string): string {
    try {
      // Pedersen commitment: C = g^value * h^randomness
      const valueBN = this.ec.curve.n!.fromRed(this.ec.curve.red.fromNumber(parseInt(value, 16)));
      const randomnessBN = this.ec.curve.n!.fromRed(this.ec.curve.red.fromNumber(parseInt(randomness, 16)));

      // Use different generators g and h
      const g = this.ec.g;
      const h = this.ec.g.mul(this.ec.genKeyPair().getPrivate()); // Pseudo-random h

      const commitment = g.mul(valueBN).add(h.mul(randomnessBN));
      return commitment.encode('hex', false);
    } catch (error) {
      throw new Error(`Commitment creation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Verify commitment
   * @param commitment - Commitment to verify
   * @param value - Claimed value
   * @param randomness - Randomness used
   * @returns True if valid
   */
  verifyCommitment(commitment: string, value: string, randomness: string): boolean {
    try {
      const recomputed = this.createCommitment(value, randomness);
      return commitment === recomputed;
    } catch {
      return false;
    }
  }

  /**
   * Generate random scalar for blinding
   * @returns Random scalar (hex)
   */
  generateRandomScalar(): string {
    return this.ec.genKeyPair().getPrivate('hex');
  }
}

export default SchnorrProtocol;

