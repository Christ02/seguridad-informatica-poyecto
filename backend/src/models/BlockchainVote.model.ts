import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  BeforeUpdate,
  BeforeRemove,
} from 'typeorm';

/**
 * IMMUTABLE: Blockchain votes cannot be modified or deleted
 * Triggers in PostgreSQL enforce this at DB level
 * NO foreign keys to users or vote_eligibility (segregation)
 */
@Entity('blockchain_votes')
@Index(['electionId'])
@Index(['blockIndex'])
@Index(['hash'])
export class BlockchainVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', unique: true })
  blockIndex: number;

  @Column()
  electionId: string;

  @Column({ type: 'text' })
  encryptedData: string;

  @Column()
  previousHash: string;

  @Column({ unique: true })
  hash: string;

  @Column({ type: 'bigint' })
  nonce: number;

  @Column()
  merkleRoot: string;

  @Column()
  validator: string;

  @Column()
  signature: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @CreateDateColumn()
  createdAt: Date;

  @BeforeUpdate()
  preventUpdate(): void {
    throw new Error('Blockchain votes are immutable and cannot be updated');
  }

  @BeforeRemove()
  preventDelete(): void {
    throw new Error('Blockchain votes are immutable and cannot be deleted');
  }
}

