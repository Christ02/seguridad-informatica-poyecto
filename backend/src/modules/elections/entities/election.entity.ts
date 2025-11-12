import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Candidate } from '../../candidates/entities/candidate.entity';
import { Vote } from '../../votes/entities/vote.entity';

export enum ElectionStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  COMPLETED = 'COMPLETED',
}

@Entity('elections')
export class Election {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: ElectionStatus,
    default: ElectionStatus.DRAFT,
  })
  status: ElectionStatus;

  @Column({ type: 'int', default: 0 })
  totalVotes: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  allowMultipleVotes: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  encryptionKey: string;

  @OneToMany(() => Candidate, (candidate) => candidate.election)
  candidates: Candidate[];

  @OneToMany(() => Vote, (vote) => vote.election)
  votes: Vote[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}

