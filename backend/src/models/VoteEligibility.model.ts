import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

/**
 * CRITICAL: This table is SEGREGATED from votes
 * NO FOREIGN KEYS to blockchain_votes
 * Tracks ONLY if user voted, not what they voted
 */
@Entity('vote_eligibility')
@Unique(['userId', 'electionId'])
@Index(['userId'])
@Index(['electionId'])
@Index(['hasVoted'])
export class VoteEligibility {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  electionId: string;

  @Column({ default: true })
  isEligible: boolean;

  @Column({ default: false })
  hasVoted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  votedAt?: Date;

  @Column({ type: 'text', nullable: true })
  voteTokenHash?: string;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

