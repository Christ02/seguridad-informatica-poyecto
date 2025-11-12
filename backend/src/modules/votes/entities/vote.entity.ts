import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Election } from '../../elections/entities/election.entity';
import { Candidate } from '../../candidates/entities/candidate.entity';
import { User } from '../../users/entities/user.entity';

@Entity('votes')
@Index(['userId', 'electionId'], { unique: true })
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  electionId: string;

  @Column({ type: 'uuid' })
  candidateId: string;

  @Column({ type: 'text' })
  encryptedVote: string;

  @Column({ type: 'varchar', length: 255 })
  voteHash: string;

  @Column({ type: 'text' })
  signature: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  verificationCode: string;

  @Column({ type: 'varchar', length: 100 })
  ipAddress: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent: string;

  @Column({ type: 'boolean', default: true })
  isValid: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Election, (election) => election.votes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'electionId' })
  election: Election;

  @ManyToOne(() => Candidate, (candidate) => candidate.votes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'candidateId' })
  candidate: Candidate;

  @CreateDateColumn()
  createdAt: Date;
}

