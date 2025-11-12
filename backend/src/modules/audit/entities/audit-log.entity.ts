import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditEventType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  VOTE_CAST = 'VOTE_CAST',
  VOTE_VERIFIED = 'VOTE_VERIFIED',
  ELECTION_VIEWED = 'ELECTION_VIEWED',
  ELECTION_CREATED = 'ELECTION_CREATED',
  ELECTION_UPDATED = 'ELECTION_UPDATED',
  CANDIDATE_VIEWED = 'CANDIDATE_VIEWED',
  RESULTS_VIEWED = 'RESULTS_VIEWED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

@Entity('audit_logs')
@Index(['userId', 'createdAt'])
@Index(['eventType', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AuditEventType })
  eventType: AuditEventType;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userEmail: string;

  @Column({ type: 'varchar', length: 100 })
  ipAddressHash: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent: string;

  @Column({ type: 'text', nullable: true })
  resource: string;

  @Column({ type: 'text', nullable: true })
  action: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  isSuspicious: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

