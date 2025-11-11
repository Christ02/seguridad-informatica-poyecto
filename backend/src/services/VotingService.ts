import axios from 'axios';
import { AppDataSource } from '../config/database.config';
import { VoteEligibility } from '../models/VoteEligibility.model';
import { VoteReceipt } from '../models/VoteReceipt.model';
import { Election } from '../models/Election.model';
import { VoteOption } from '../models/VoteOption.model';
import { BlockchainService } from './BlockchainService';
import { AuditLogService } from './AuditLogService';
import { EncryptedVote, ZKPReceipt } from '@voting-system/shared';

const CRYPTO_SERVICE_URL = process.env.CRYPTO_SERVICE_URL || 'http://crypto-service:4000';

export class VotingService {
  private eligibilityRepository = AppDataSource.getRepository(VoteEligibility);
  private receiptRepository = AppDataSource.getRepository(VoteReceipt);
  private electionRepository = AppDataSource.getRepository(Election);
  private voteOptionRepository = AppDataSource.getRepository(VoteOption);
  private blockchainService = new BlockchainService();
  private auditLogService = new AuditLogService();

  /**
   * Check if user is eligible to vote
   */
  async checkEligibility(userId: string, electionId: string): Promise<{
    eligible: boolean;
    reason?: string;
    hasVoted: boolean;
  }> {
    // Check if election exists and is active
    const election = await this.electionRepository.findOne({
      where: { id: electionId },
    });

    if (!election) {
      return { eligible: false, reason: 'Election not found', hasVoted: false };
    }

    const now = new Date();
    if (now < election.startDate) {
      return { eligible: false, reason: 'Election has not started', hasVoted: false };
    }

    if (now > election.endDate) {
      return { eligible: false, reason: 'Election has ended', hasVoted: false };
    }

    if (election.status !== 'active') {
      return { eligible: false, reason: 'Election is not active', hasVoted: false };
    }

    // Check if user has already voted
    const eligibility = await this.eligibilityRepository.findOne({
      where: { userId, electionId },
    });

    if (eligibility?.hasVoted) {
      return { eligible: false, reason: 'Already voted', hasVoted: true };
    }

    // Check if user is eligible (this would check against voter registry)
    // For now, we assume all authenticated users are eligible
    return { eligible: true, hasVoted: false };
  }

  /**
   * Cast a vote
   */
  async castVote(
    userId: string,
    electionId: string,
    voteOptionId: string,
    encryptedVote: string,
    clientSignature: string
  ): Promise<{
    success: boolean;
    receipt: ZKPReceipt;
    blockHash: string;
    merkleProof: string[];
  }> {
    // Check eligibility
    const eligibility = await this.checkEligibility(userId, electionId);
    if (!eligibility.eligible) {
      throw new Error(`Not eligible to vote: ${eligibility.reason}`);
    }

    // Verify vote option exists
    const voteOption = await this.voteOptionRepository.findOne({
      where: { id: voteOptionId, electionId },
    });

    if (!voteOption) {
      throw new Error('Invalid vote option');
    }

    // Get election public key for encryption
    const election = await this.electionRepository.findOne({
      where: { id: electionId },
    });

    if (!election?.publicKey) {
      throw new Error('Election public key not found');
    }

    // Prepare encrypted vote for blockchain
    const voteData: EncryptedVote = {
      electionId,
      encryptedData: encryptedVote,
      encryptionPublicKey: election.publicKey,
      timestamp: new Date(),
      signature: clientSignature,
      nonce: this.generateNonce(),
    };

    // Add vote to blockchain
    const { block, merkleProof } = await this.blockchainService.addVoteBlock(
      voteData,
      userId
    );

    // Generate ZKP receipt (non-coercible)
    const zkpReceipt = await this.generateZKPReceipt(
      userId,
      electionId,
      block.hash
    );

    // Mark user as having voted (without linking to vote content)
    await this.markAsVoted(userId, electionId);

    // Store receipt
    await this.storeReceipt(userId, electionId, zkpReceipt, block.hash);

    // Audit log
    await this.auditLogService.log({
      userId,
      action: 'VOTE_CAST',
      resource: 'vote',
      details: {
        electionId,
        blockHash: block.hash,
        blockIndex: block.blockIndex,
      },
      ipAddress: '',
      userAgent: '',
      timestamp: new Date(),
    });

    return {
      success: true,
      receipt: zkpReceipt,
      blockHash: block.hash,
      merkleProof,
    };
  }

  /**
   * Generate ZKP receipt using crypto service
   */
  private async generateZKPReceipt(
    userId: string,
    electionId: string,
    blockHash: string
  ): Promise<ZKPReceipt> {
    try {
      const response = await axios.post(`${CRYPTO_SERVICE_URL}/zkp/generate-receipt`, {
        voterId: userId,
        electionId,
        voteHash: blockHash,
        timestamp: new Date().toISOString(),
      });

      return response.data.receipt;
    } catch (error) {
      console.error('Error generating ZKP receipt:', error);
      throw new Error('Failed to generate receipt');
    }
  }

  /**
   * Mark user as having voted
   */
  private async markAsVoted(userId: string, electionId: string): Promise<void> {
    let eligibility = await this.eligibilityRepository.findOne({
      where: { userId, electionId },
    });

    if (!eligibility) {
      eligibility = this.eligibilityRepository.create({
        userId,
        electionId,
        hasVoted: true,
        votedAt: new Date(),
      });
    } else {
      eligibility.hasVoted = true;
      eligibility.votedAt = new Date();
    }

    await this.eligibilityRepository.save(eligibility);
  }

  /**
   * Store receipt
   */
  private async storeReceipt(
    userId: string,
    electionId: string,
    receipt: ZKPReceipt,
    blockHash: string
  ): Promise<void> {
    const receiptRecord = this.receiptRepository.create({
      userId,
      electionId,
      receiptData: JSON.stringify(receipt),
      blockHash,
      issuedAt: new Date(),
    });

    await this.receiptRepository.save(receiptRecord);
  }

  /**
   * Verify ZKP receipt
   */
  async verifyReceipt(receipt: ZKPReceipt): Promise<{
    valid: boolean;
    electionId?: string;
    blockHash?: string;
  }> {
    try {
      const response = await axios.post(`${CRYPTO_SERVICE_URL}/zkp/verify-receipt`, {
        receipt,
      });

      if (response.data.valid) {
        // Check if block exists in blockchain
        const block = await this.blockchainService.getBlockByHash(receipt.voteHash);
        
        return {
          valid: !!block,
          electionId: block?.electionId,
          blockHash: block?.hash,
        };
      }

      return { valid: false };
    } catch (error) {
      console.error('Error verifying receipt:', error);
      return { valid: false };
    }
  }

  /**
   * Get voting statistics for an election
   */
  async getVotingStatistics(electionId: string): Promise<{
    totalEligible: number;
    totalVoted: number;
    turnoutPercentage: number;
    votesPerHour: number[];
  }> {
    const election = await this.electionRepository.findOne({
      where: { id: electionId },
    });

    if (!election) {
      throw new Error('Election not found');
    }

    // Get total eligible voters
    const totalEligible = await this.eligibilityRepository.count({
      where: { electionId },
    });

    // Get total voted
    const totalVoted = await this.eligibilityRepository.count({
      where: { electionId, hasVoted: true },
    });

    // Calculate turnout
    const turnoutPercentage = totalEligible > 0 
      ? (totalVoted / totalEligible) * 100 
      : 0;

    // Get votes per hour
    const votes = await this.eligibilityRepository.find({
      where: { electionId, hasVoted: true },
      order: { votedAt: 'ASC' },
    });

    const votesPerHour = this.calculateVotesPerHour(
      votes.map(v => v.votedAt!),
      election.startDate,
      election.endDate
    );

    return {
      totalEligible,
      totalVoted,
      turnoutPercentage,
      votesPerHour,
    };
  }

  /**
   * Calculate votes per hour
   */
  private calculateVotesPerHour(
    voteTimes: Date[],
    startDate: Date,
    endDate: Date
  ): number[] {
    const hours = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
    const votesPerHour = new Array(hours).fill(0);

    for (const voteTime of voteTimes) {
      const hourIndex = Math.floor(
        (voteTime.getTime() - startDate.getTime()) / (1000 * 60 * 60)
      );
      if (hourIndex >= 0 && hourIndex < hours) {
        votesPerHour[hourIndex]++;
      }
    }

    return votesPerHour;
  }

  /**
   * Decrypt votes using threshold cryptography
   */
  async decryptVotes(
    electionId: string,
    keyShares: { trusteeId: string; share: string }[]
  ): Promise<{ voteOptionId: string; count: number }[]> {
    // Verify election has ended
    const election = await this.electionRepository.findOne({
      where: { id: electionId },
    });

    if (!election) {
      throw new Error('Election not found');
    }

    if (election.status !== 'ended') {
      throw new Error('Election has not ended');
    }

    // Get all encrypted votes from blockchain
    const blocks = await this.blockchainService.getElectionBlocks(electionId);
    
    // Exclude genesis block
    const voteBlocks = blocks.filter(b => b.blockIndex > 0);

    // Decrypt votes using threshold cryptography
    const decryptedVotes = await this.thresholdDecrypt(voteBlocks, keyShares);

    // Count votes
    const voteCounts = new Map<string, number>();
    for (const vote of decryptedVotes) {
      const count = voteCounts.get(vote.voteOptionId) || 0;
      voteCounts.set(vote.voteOptionId, count + 1);
    }

    // Convert to array
    const results = Array.from(voteCounts.entries()).map(([voteOptionId, count]) => ({
      voteOptionId,
      count,
    }));

    return results;
  }

  /**
   * Threshold decrypt votes
   */
  private async thresholdDecrypt(
    voteBlocks: any[],
    keyShares: { trusteeId: string; share: string }[]
  ): Promise<{ voteOptionId: string }[]> {
    try {
      const response = await axios.post(`${CRYPTO_SERVICE_URL}/threshold/decrypt-batch`, {
        encryptedVotes: voteBlocks.map(b => b.encryptedData),
        keyShares,
      });

      return response.data.decryptedVotes;
    } catch (error) {
      console.error('Error decrypting votes:', error);
      throw new Error('Failed to decrypt votes');
    }
  }

  /**
   * Generate nonce
   */
  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Verify blockchain integrity for election
   */
  async verifyElectionIntegrity(electionId: string): Promise<{
    valid: boolean;
    details: any;
  }> {
    const validation = await this.blockchainService.validateBlockchain(electionId);
    
    return {
      valid: validation.isValid,
      details: validation,
    };
  }
}

