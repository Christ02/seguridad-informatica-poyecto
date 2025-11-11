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
 * IMMUTABLE: Audit logs are append-only
 * Triggers in PostgreSQL enforce this at DB level
 */
@Entity('audit_logs')
@Index(['userId'])
@Index(['action'])
@Index(['resource'])
@Index(['timestamp'])
@Index(['success'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId?: string;

  @Column()
  action: string;

  @Column()
  resource: string;

  @Column({ nullable: true })
  resourceId?: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValue?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  newValue?: Record<string, unknown>;

  @Column()
  ip: string;

  @Column()
  userAgent: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column()
  signature: string;

  @Column({ default: true })
  immutable: boolean;

  @Column({ default: false })
  sentToS3: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @BeforeUpdate()
  preventUpdate(): void {
    throw new Error('Audit logs are immutable and cannot be updated');
  }

  @BeforeRemove()
  preventDelete(): void {
    throw new Error('Audit logs are immutable and cannot be deleted');
  }
}

