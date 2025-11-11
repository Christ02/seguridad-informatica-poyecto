import crypto from 'crypto';
import { AuditLogEntry } from '@voting-system/shared';

/**
 * Immutable Log Service
 * 
 * This service provides tamper-evident logging by:
 * 1. Creating cryptographic hashes of log entries
 * 2. Chaining logs with previous hash (blockchain-like)
 * 3. Storing logs in append-only storage (S3 or similar)
 * 4. Verifying log integrity
 */
export class ImmutableLogService {
  private lastHash: string = '0';

  /**
   * Create immutable log entry
   */
  createLogEntry(entry: AuditLogEntry): {
    entry: AuditLogEntry;
    hash: string;
    previousHash: string;
    signature: string;
  } {
    const previousHash = this.lastHash;
    
    // Create deterministic hash of entry
    const entryString = JSON.stringify({
      ...entry,
      previousHash,
    });

    const hash = crypto.createHash('sha256').update(entryString).digest('hex');
    
    // Sign the entry
    const signature = this.signEntry(hash);

    this.lastHash = hash;

    return {
      entry,
      hash,
      previousHash,
      signature,
    };
  }

  /**
   * Sign a log entry
   */
  private signEntry(hash: string): string {
    // In production, this would use a private key
    // For now, we use HMAC with a secret
    const secret = process.env.LOG_SIGNING_SECRET || 'log-secret-key';
    return crypto.createHmac('sha256', secret).update(hash).digest('hex');
  }

  /**
   * Verify log entry integrity
   */
  verifyLogEntry(
    entry: AuditLogEntry,
    hash: string,
    previousHash: string,
    signature: string
  ): boolean {
    // Recalculate hash
    const entryString = JSON.stringify({
      ...entry,
      previousHash,
    });

    const calculatedHash = crypto
      .createHash('sha256')
      .update(entryString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return false;
    }

    // Verify signature
    const calculatedSignature = this.signEntry(hash);
    
    return calculatedSignature === signature;
  }

  /**
   * Verify log chain integrity
   */
  verifyLogChain(
    logs: Array<{
      entry: AuditLogEntry;
      hash: string;
      previousHash: string;
      signature: string;
    }>
  ): {
    valid: boolean;
    invalidIndices: number[];
    totalLogs: number;
    validLogs: number;
  } {
    const invalidIndices: number[] = [];
    let validLogs = 0;

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      
      // Verify entry integrity
      const entryValid = this.verifyLogEntry(
        log.entry,
        log.hash,
        log.previousHash,
        log.signature
      );

      if (!entryValid) {
        invalidIndices.push(i);
        continue;
      }

      // Verify chain linkage (except for first entry)
      if (i > 0) {
        const previousLog = logs[i - 1];
        if (log.previousHash !== previousLog.hash) {
          invalidIndices.push(i);
          continue;
        }
      }

      validLogs++;
    }

    return {
      valid: invalidIndices.length === 0,
      invalidIndices,
      totalLogs: logs.length,
      validLogs,
    };
  }

  /**
   * Export logs for archival (S3, etc.)
   */
  async exportLogsToArchive(
    logs: Array<{
      entry: AuditLogEntry;
      hash: string;
      previousHash: string;
      signature: string;
    }>,
    format: 'json' | 'ndjson' = 'ndjson'
  ): Promise<string> {
    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    } else {
      // NDJSON (newline-delimited JSON) - better for streaming
      return logs.map(log => JSON.stringify(log)).join('\n');
    }
  }

  /**
   * Generate merkle root for log batch
   */
  generateMerkleRoot(
    logs: Array<{
      hash: string;
    }>
  ): string {
    if (logs.length === 0) {
      return '';
    }

    let hashes = logs.map(log => log.hash);

    // Build merkle tree
    while (hashes.length > 1) {
      const newLevel: string[] = [];

      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i];
        const right = i + 1 < hashes.length ? hashes[i + 1] : left;
        
        const combined = crypto
          .createHash('sha256')
          .update(left + right)
          .digest('hex');
        
        newLevel.push(combined);
      }

      hashes = newLevel;
    }

    return hashes[0];
  }

  /**
   * Create tamper-evident snapshot
   */
  createSnapshot(
    logs: Array<{
      entry: AuditLogEntry;
      hash: string;
      previousHash: string;
      signature: string;
    }>,
    snapshotId: string
  ): {
    snapshotId: string;
    timestamp: Date;
    totalLogs: number;
    merkleRoot: string;
    firstHash: string;
    lastHash: string;
    signature: string;
  } {
    const merkleRoot = this.generateMerkleRoot(logs);
    const timestamp = new Date();

    const snapshot = {
      snapshotId,
      timestamp,
      totalLogs: logs.length,
      merkleRoot,
      firstHash: logs[0]?.hash || '',
      lastHash: logs[logs.length - 1]?.hash || '',
    };

    const signature = crypto
      .createHash('sha256')
      .update(JSON.stringify(snapshot))
      .digest('hex');

    return {
      ...snapshot,
      signature,
    };
  }

  /**
   * Verify snapshot integrity
   */
  verifySnapshot(
    logs: Array<{
      entry: AuditLogEntry;
      hash: string;
      previousHash: string;
      signature: string;
    }>,
    snapshot: {
      snapshotId: string;
      timestamp: Date;
      totalLogs: number;
      merkleRoot: string;
      firstHash: string;
      lastHash: string;
      signature: string;
    }
  ): boolean {
    // Verify log count
    if (logs.length !== snapshot.totalLogs) {
      return false;
    }

    // Verify first and last hashes
    if (logs[0]?.hash !== snapshot.firstHash) {
      return false;
    }

    if (logs[logs.length - 1]?.hash !== snapshot.lastHash) {
      return false;
    }

    // Verify merkle root
    const calculatedMerkleRoot = this.generateMerkleRoot(logs);
    if (calculatedMerkleRoot !== snapshot.merkleRoot) {
      return false;
    }

    // Verify snapshot signature
    const snapshotData = {
      snapshotId: snapshot.snapshotId,
      timestamp: snapshot.timestamp,
      totalLogs: snapshot.totalLogs,
      merkleRoot: snapshot.merkleRoot,
      firstHash: snapshot.firstHash,
      lastHash: snapshot.lastHash,
    };

    const calculatedSignature = crypto
      .createHash('sha256')
      .update(JSON.stringify(snapshotData))
      .digest('hex');

    return calculatedSignature === snapshot.signature;
  }

  /**
   * Reset hash chain (for new log chain)
   */
  resetChain(): void {
    this.lastHash = '0';
  }
}

