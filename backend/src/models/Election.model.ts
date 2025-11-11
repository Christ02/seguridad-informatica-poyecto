import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ElectionStatus, ElectionType } from '@voting-system/shared';

@Entity('elections')
@Index(['status'])
@Index(['startDate', 'endDate'])
export class Election {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ElectionType,
  })
  type: ElectionType;

  @Column({
    type: 'enum',
    enum: ElectionStatus,
    default: ElectionStatus.DRAFT,
  })
  status: ElectionStatus;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'text' })
  publicKey: string;

  @Column({ type: 'jsonb' })
  thresholdParams: {
    totalShares: number;
    threshold: number;
    custodianIds: number[];
  };

  @Column({ type: 'timestamp', nullable: true })
  keyCeremonyCompletedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  resultsPublishedAt?: Date;

  @Column({ type: 'int', default: 0 })
  totalEligibleVoters: number;

  @Column({ type: 'int', default: 0 })
  totalVotesCast: number;

  @Column({ type: 'simple-array', nullable: true })
  allowedVoterRoles?: string[];

  @Column({ default: true })
  requiresIdentityVerification: boolean;

  @Column({ default: true })
  isAnonymous: boolean;

  @Column()
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

