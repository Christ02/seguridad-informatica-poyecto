import axios from 'axios';
import { AppDataSource } from '../config/database.config';
import { Election } from '../models/Election.model';
import { Candidate } from '../models/Candidate.model';
import { VoteOption } from '../models/VoteOption.model';
import { KeyShare } from '../models/KeyShare.model';
import { MultiSigTransaction } from '../models/MultiSigTransaction.model';
import { AuditLogService } from './AuditLogService';
import { BlockchainService } from './BlockchainService';

const CRYPTO_SERVICE_URL = process.env.CRYPTO_SERVICE_URL || 'http://crypto-service:4000';

export interface CreateElectionRequest {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  electionType: 'single' | 'multiple' | 'ranked';
  maxSelections?: number;
  candidates: {
    name: string;
    party?: string;
    description?: string;
    imageUrl?: string;
  }[];
  trustees: string[]; // User IDs of trustees
}

export class ElectionService {
  private electionRepository = AppDataSource.getRepository(Election);
  private candidateRepository = AppDataSource.getRepository(Candidate);
  private voteOptionRepository = AppDataSource.getRepository(VoteOption);
  private keyShareRepository = AppDataSource.getRepository(KeyShare);
  private multiSigRepository = AppDataSource.getRepository(MultiSigTransaction);
  private auditLogService = new AuditLogService();
  private blockchainService = new BlockchainService();

  /**
   * Create a new election (requires multi-sig approval)
   */
  async createElection(
    request: CreateElectionRequest,
    creatorId: string
  ): Promise<{ electionId: string; transactionId: string }> {
    // Create multi-sig transaction for election creation
    const transaction = this.multiSigRepository.create({
      transactionType: 'CREATE_ELECTION',
      requiredSignatures: 3, // 3-of-5
      signatories: [],
      metadata: JSON.stringify(request),
      status: 'pending',
      createdBy: creatorId,
      createdAt: new Date(),
    });

    const savedTransaction = await this.multiSigRepository.save(transaction);

    return {
      electionId: '', // Will be created after approval
      transactionId: savedTransaction.id,
    };
  }

  /**
   * Approve election creation (multi-sig)
   */
  async approveElectionCreation(
    transactionId: string,
    approverId: string,
    signature: string
  ): Promise<{ approved: boolean; electionId?: string }> {
    const transaction = await this.multiSigRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== 'pending') {
      throw new Error('Transaction is not pending');
    }

    // Verify signature with crypto service
    const signatureValid = await this.verifyMultiSigSignature(
      transactionId,
      approverId,
      signature
    );

    if (!signatureValid) {
      throw new Error('Invalid signature');
    }

    // Add signatory
    const signatories = transaction.signatories || [];
    if (!signatories.includes(approverId)) {
      signatories.push(approverId);
      transaction.signatories = signatories;
      await this.multiSigRepository.save(transaction);
    }

    // Check if enough signatures
    if (signatories.length >= transaction.requiredSignatures) {
      // Execute transaction - create election
      const request: CreateElectionRequest = JSON.parse(transaction.metadata);
      const election = await this.executeElectionCreation(request);

      transaction.status = 'executed';
      transaction.executedAt = new Date();
      await this.multiSigRepository.save(transaction);

      return { approved: true, electionId: election.id };
    }

    return { approved: false };
  }

  /**
   * Execute election creation after multi-sig approval
   */
  private async executeElectionCreation(
    request: CreateElectionRequest
  ): Promise<Election> {
    // Perform key ceremony to generate election keys
    const keyCeremony = await this.performKeyCeremony(
      request.trustees,
      3, // threshold
      5  // total shares
    );

    // Create election
    const election = this.electionRepository.create({
      title: request.title,
      description: request.description,
      startDate: request.startDate,
      endDate: request.endDate,
      electionType: request.electionType,
      maxSelections: request.maxSelections,
      status: 'setup',
      publicKey: keyCeremony.publicKey,
      createdAt: new Date(),
    });

    const savedElection = await this.electionRepository.save(election);

    // Create candidates
    for (const candidateData of request.candidates) {
      const candidate = this.candidateRepository.create({
        electionId: savedElection.id,
        name: candidateData.name,
        party: candidateData.party,
        description: candidateData.description,
        imageUrl: candidateData.imageUrl,
      });

      const savedCandidate = await this.candidateRepository.save(candidate);

      // Create vote option
      const voteOption = this.voteOptionRepository.create({
        electionId: savedElection.id,
        candidateId: savedCandidate.id,
        optionText: candidateData.name,
      });

      await this.voteOptionRepository.save(voteOption);
    }

    // Store key shares
    for (const share of keyCeremony.shares) {
      const keyShare = this.keyShareRepository.create({
        electionId: savedElection.id,
        trusteeId: share.trusteeId,
        encryptedShare: share.encryptedShare,
        shareIndex: share.shareIndex,
      });

      await this.keyShareRepository.save(keyShare);
    }

    // Create genesis block for election
    await this.blockchainService.createGenesisBlock(savedElection.id);

    // Audit log
    await this.auditLogService.log({
      userId: 'SYSTEM',
      action: 'ELECTION_CREATED',
      resource: 'election',
      details: {
        electionId: savedElection.id,
        title: savedElection.title,
      },
      ipAddress: '',
      userAgent: '',
      timestamp: new Date(),
    });

    return savedElection;
  }

  /**
   * Perform key ceremony using crypto service
   */
  private async performKeyCeremony(
    trustees: string[],
    threshold: number,
    totalShares: number
  ): Promise<{
    publicKey: string;
    shares: {
      trusteeId: string;
      encryptedShare: string;
      shareIndex: number;
    }[];
  }> {
    try {
      const response = await axios.post(`${CRYPTO_SERVICE_URL}/threshold/key-ceremony`, {
        trustees,
        threshold,
        totalShares,
      });

      return response.data;
    } catch (error) {
      console.error('Key ceremony error:', error);
      throw new Error('Failed to perform key ceremony');
    }
  }

  /**
   * Verify multi-sig signature
   */
  private async verifyMultiSigSignature(
    transactionId: string,
    signerId: string,
    signature: string
  ): Promise<boolean> {
    try {
      const response = await axios.post(`${CRYPTO_SERVICE_URL}/multisig/verify`, {
        transactionId,
        signerId,
        signature,
      });

      return response.data.valid;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Start an election (multi-sig required)
   */
  async startElection(
    electionId: string,
    initiatorId: string
  ): Promise<{ transactionId: string }> {
    const election = await this.electionRepository.findOne({
      where: { id: electionId },
    });

    if (!election) {
      throw new Error('Election not found');
    }

    if (election.status !== 'setup') {
      throw new Error('Election is not in setup state');
    }

    // Create multi-sig transaction
    const transaction = this.multiSigRepository.create({
      transactionType: 'START_ELECTION',
      requiredSignatures: 3,
      signatories: [],
      metadata: JSON.stringify({ electionId }),
      status: 'pending',
      createdBy: initiatorId,
      createdAt: new Date(),
    });

    const savedTransaction = await this.multiSigRepository.save(transaction);

    return { transactionId: savedTransaction.id };
  }

  /**
   * Execute start election
   */
  async executeStartElection(transactionId: string): Promise<void> {
    const transaction = await this.multiSigRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const { electionId } = JSON.parse(transaction.metadata);

    const election = await this.electionRepository.findOne({
      where: { id: electionId },
    });

    if (!election) {
      throw new Error('Election not found');
    }

    election.status = 'active';
    await this.electionRepository.save(election);

    await this.auditLogService.log({
      userId: 'SYSTEM',
      action: 'ELECTION_STARTED',
      resource: 'election',
      details: { electionId },
      ipAddress: '',
      userAgent: '',
      timestamp: new Date(),
    });
  }

  /**
   * End an election (multi-sig required)
   */
  async endElection(
    electionId: string,
    initiatorId: string
  ): Promise<{ transactionId: string }> {
    const election = await this.electionRepository.findOne({
      where: { id: electionId },
    });

    if (!election) {
      throw new Error('Election not found');
    }

    if (election.status !== 'active') {
      throw new Error('Election is not active');
    }

    // Create multi-sig transaction
    const transaction = this.multiSigRepository.create({
      transactionType: 'END_ELECTION',
      requiredSignatures: 3,
      signatories: [],
      metadata: JSON.stringify({ electionId }),
      status: 'pending',
      createdBy: initiatorId,
      createdAt: new Date(),
    });

    const savedTransaction = await this.multiSigRepository.save(transaction);

    return { transactionId: savedTransaction.id };
  }

  /**
   * Execute end election
   */
  async executeEndElection(transactionId: string): Promise<void> {
    const transaction = await this.multiSigRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const { electionId } = JSON.parse(transaction.metadata);

    const election = await this.electionRepository.findOne({
      where: { id: electionId },
    });

    if (!election) {
      throw new Error('Election not found');
    }

    election.status = 'ended';
    await this.electionRepository.save(election);

    await this.auditLogService.log({
      userId: 'SYSTEM',
      action: 'ELECTION_ENDED',
      resource: 'election',
      details: { electionId },
      ipAddress: '',
      userAgent: '',
      timestamp: new Date(),
    });
  }

  /**
   * Get election by ID
   */
  async getElection(electionId: string): Promise<Election | null> {
    return await this.electionRepository.findOne({
      where: { id: electionId },
    });
  }

  /**
   * Get all elections
   */
  async getAllElections(filters?: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Election[]> {
    const query = this.electionRepository.createQueryBuilder('election');

    if (filters?.status) {
      query.andWhere('election.status = :status', { status: filters.status });
    }

    if (filters?.startDate) {
      query.andWhere('election.startDate >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('election.endDate <= :endDate', { endDate: filters.endDate });
    }

    query.orderBy('election.startDate', 'DESC');

    return await query.getMany();
  }

  /**
   * Get candidates for election
   */
  async getCandidates(electionId: string): Promise<Candidate[]> {
    return await this.candidateRepository.find({
      where: { electionId },
      order: { name: 'ASC' },
    });
  }

  /**
   * Get vote options for election
   */
  async getVoteOptions(electionId: string): Promise<VoteOption[]> {
    return await this.voteOptionRepository.find({
      where: { electionId },
      order: { optionText: 'ASC' },
    });
  }

  /**
   * Get pending multi-sig transactions
   */
  async getPendingTransactions(userId: string): Promise<MultiSigTransaction[]> {
    return await this.multiSigRepository.find({
      where: { status: 'pending' },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string): Promise<MultiSigTransaction | null> {
    return await this.multiSigRepository.findOne({
      where: { id: transactionId },
    });
  }

  /**
   * Get election results (after decryption)
   */
  async getResults(electionId: string): Promise<{
    candidates: {
      id: string;
      name: string;
      party?: string;
      votes: number;
      percentage: number;
    }[];
    totalVotes: number;
  }> {
    const election = await this.getElection(electionId);

    if (!election) {
      throw new Error('Election not found');
    }

    if (election.status !== 'ended') {
      throw new Error('Election has not ended');
    }

    // Get candidates
    const candidates = await this.getCandidates(electionId);

    // Get decrypted results from blockchain statistics
    const stats = await this.blockchainService.getStatistics(electionId);
    const totalVotes = stats.totalVotes;

    // For now, return placeholder data
    // In production, this would fetch actual decrypted vote counts
    const results = candidates.map(candidate => ({
      id: candidate.id,
      name: candidate.name,
      party: candidate.party,
      votes: 0, // Would be populated after decryption
      percentage: 0,
    }));

    return {
      candidates: results,
      totalVotes,
    };
  }
}

