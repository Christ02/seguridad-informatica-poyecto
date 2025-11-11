import crypto from 'crypto';
import { AppDataSource } from '../config/database.config';
import { BlockchainVote } from '../models/BlockchainVote.model';
import { EncryptedVote, BlockchainBlock, BlockchainValidation } from '@voting-system/shared';
import { MerkleTree } from '../utils/merkle-tree';

export class BlockchainService {
  private blockchainRepository = AppDataSource.getRepository(BlockchainVote);

  /**
   * Create genesis block
   */
  async createGenesisBlock(electionId: string): Promise<BlockchainVote> {
    const genesisData: EncryptedVote = {
      electionId,
      encryptedData: 'GENESIS',
      encryptionPublicKey: 'GENESIS',
      timestamp: new Date(),
      signature: 'GENESIS',
      nonce: 'GENESIS',
    };

    const genesisBlock = this.blockchainRepository.create({
      blockIndex: 0,
      electionId,
      encryptedData: JSON.stringify(genesisData),
      previousHash: '0',
      hash: this.calculateHash(0, '0', genesisData, 0),
      nonce: 0,
      merkleRoot: this.calculateHash(0, '0', genesisData, 0),
      validator: 'SYSTEM',
      signature: 'GENESIS',
      timestamp: new Date(),
    });

    return await this.blockchainRepository.save(genesisBlock);
  }

  /**
   * Add vote to blockchain
   */
  async addVoteBlock(
    vote: EncryptedVote,
    validator: string
  ): Promise<{ block: BlockchainVote; merkleProof: string[] }> {
    // Get last block
    const lastBlock = await this.getLastBlock(vote.electionId);

    if (!lastBlock) {
      // Create genesis block if doesn't exist
      await this.createGenesisBlock(vote.electionId);
      return this.addVoteBlock(vote, validator);
    }

    // Calculate new block index
    const newIndex = lastBlock.blockIndex + 1;

    // Mine block (find nonce)
    const { hash, nonce } = this.mineBlock(newIndex, lastBlock.hash, vote);

    // Get all votes for election to calculate Merkle tree
    const allVotes = await this.blockchainRepository.find({
      where: { electionId: vote.electionId },
      order: { blockIndex: 'ASC' },
    });

    // Add new vote to array
    const voteHashes = [
      ...allVotes.map((b) => b.hash),
      hash,
    ];

    // Calculate Merkle tree
    const merkleTree = new MerkleTree(voteHashes);
    const merkleRoot = merkleTree.getRoot();
    const merkleProof = merkleTree.getProof(hash);

    // Create signature
    const signature = this.signBlock(newIndex, hash, validator);

    // Create new block
    const newBlock = this.blockchainRepository.create({
      blockIndex: newIndex,
      electionId: vote.electionId,
      encryptedData: vote.encryptedData,
      previousHash: lastBlock.hash,
      hash,
      nonce,
      merkleRoot,
      validator,
      signature,
      timestamp: vote.timestamp,
    });

    const savedBlock = await this.blockchainRepository.save(newBlock);

    return { block: savedBlock, merkleProof };
  }

  /**
   * Get last block for election
   */
  private async getLastBlock(electionId: string): Promise<BlockchainVote | null> {
    return await this.blockchainRepository.findOne({
      where: { electionId },
      order: { blockIndex: 'DESC' },
    });
  }

  /**
   * Calculate block hash
   */
  private calculateHash(
    index: number,
    previousHash: string,
    data: EncryptedVote,
    nonce: number
  ): string {
    const blockString = index + previousHash + JSON.stringify(data) + nonce;
    return crypto.createHash('sha256').update(blockString).digest('hex');
  }

  /**
   * Mine block (Proof of Work)
   */
  private mineBlock(
    index: number,
    previousHash: string,
    data: EncryptedVote,
    difficulty: number = 4
  ): { hash: string; nonce: number } {
    let nonce = 0;
    let hash = '';
    const target = '0'.repeat(difficulty);

    while (true) {
      hash = this.calculateHash(index, previousHash, data, nonce);
      if (hash.substring(0, difficulty) === target) {
        break;
      }
      nonce++;
    }

    return { hash, nonce };
  }

  /**
   * Sign block
   */
  private signBlock(index: number, hash: string, validator: string): string {
    const data = `${index}:${hash}:${validator}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Validate entire blockchain
   */
  async validateBlockchain(electionId: string): Promise<BlockchainValidation> {
    const blocks = await this.blockchainRepository.find({
      where: { electionId },
      order: { blockIndex: 'ASC' },
    });

    if (blocks.length === 0) {
      return {
        isValid: true,
        totalBlocks: 0,
        validatedBlocks: 0,
        invalidBlocks: [],
        merkleRootValid: true,
        chainIntegrityValid: true,
        lastValidatedAt: new Date(),
      };
    }

    const invalidBlocks: number[] = [];
    let validatedBlocks = 0;

    // Validate each block
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const isValid = await this.validateBlock(block, i === 0 ? null : blocks[i - 1]);

      if (isValid) {
        validatedBlocks++;
      } else {
        invalidBlocks.push(block.blockIndex);
      }
    }

    // Validate Merkle root of last block
    const lastBlock = blocks[blocks.length - 1];
    const allHashes = blocks.map((b) => b.hash);
    const merkleTree = new MerkleTree(allHashes);
    const calculatedRoot = merkleTree.getRoot();
    const merkleRootValid = lastBlock.merkleRoot === calculatedRoot;

    return {
      isValid: invalidBlocks.length === 0 && merkleRootValid,
      totalBlocks: blocks.length,
      validatedBlocks,
      invalidBlocks,
      merkleRootValid,
      chainIntegrityValid: invalidBlocks.length === 0,
      lastValidatedAt: new Date(),
    };
  }

  /**
   * Validate a single block
   */
  private async validateBlock(
    block: BlockchainVote,
    previousBlock: BlockchainVote | null
  ): Promise<boolean> {
    // Validate genesis block
    if (block.blockIndex === 0) {
      return block.previousHash === '0';
    }

    if (!previousBlock) {
      return false;
    }

    // Validate previous hash
    if (block.previousHash !== previousBlock.hash) {
      return false;
    }

    // Validate hash
    const data: EncryptedVote = {
      electionId: block.electionId,
      encryptedData: block.encryptedData,
      encryptionPublicKey: '',
      timestamp: block.timestamp,
      signature: block.signature,
      nonce: String(block.nonce),
    };

    const calculatedHash = this.calculateHash(
      block.blockIndex,
      block.previousHash,
      data,
      Number(block.nonce)
    );

    return block.hash === calculatedHash;
  }

  /**
   * Get block by index
   */
  async getBlock(electionId: string, blockIndex: number): Promise<BlockchainVote | null> {
    return await this.blockchainRepository.findOne({
      where: { electionId, blockIndex },
    });
  }

  /**
   * Get block by hash
   */
  async getBlockByHash(hash: string): Promise<BlockchainVote | null> {
    return await this.blockchainRepository.findOne({
      where: { hash },
    });
  }

  /**
   * Get all blocks for election
   */
  async getElectionBlocks(electionId: string): Promise<BlockchainVote[]> {
    return await this.blockchainRepository.find({
      where: { electionId },
      order: { blockIndex: 'ASC' },
    });
  }

  /**
   * Get blockchain statistics
   */
  async getStatistics(electionId: string): Promise<{
    totalBlocks: number;
    totalVotes: number;
    firstBlock: Date | null;
    lastBlock: Date | null;
    averageBlockTime: number;
  }> {
    const blocks = await this.getElectionBlocks(electionId);

    if (blocks.length === 0) {
      return {
        totalBlocks: 0,
        totalVotes: 0,
        firstBlock: null,
        lastBlock: null,
        averageBlockTime: 0,
      };
    }

    const totalVotes = blocks.length - 1; // Exclude genesis
    const firstBlock = blocks[0].createdAt;
    const lastBlock = blocks[blocks.length - 1].createdAt;

    // Calculate average block time
    let totalTime = 0;
    for (let i = 1; i < blocks.length; i++) {
      const timeDiff = blocks[i].createdAt.getTime() - blocks[i - 1].createdAt.getTime();
      totalTime += timeDiff;
    }

    const averageBlockTime = blocks.length > 1 ? totalTime / (blocks.length - 1) : 0;

    return {
      totalBlocks: blocks.length,
      totalVotes,
      firstBlock,
      lastBlock,
      averageBlockTime,
    };
  }

  /**
   * Verify Merkle proof
   */
  verifyMerkleProof(
    blockHash: string,
    merkleProof: string[],
    merkleRoot: string
  ): boolean {
    const merkleTree = new MerkleTree([]);
    return merkleTree.verifyProof(blockHash, merkleProof, merkleRoot);
  }
}

