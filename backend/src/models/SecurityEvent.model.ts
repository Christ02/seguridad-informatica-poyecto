import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { SecurityEventType, SecurityEventSeverity } from '@voting-system/shared';

@Entity('security_events')
@Index(['type'])
@Index(['severity'])
@Index(['userId'])
@Index(['timestamp'])
@Index(['processed'])
export class SecurityEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: SecurityEventType,
  })
  type: SecurityEventType;

  @Column({
    type: 'enum',
    enum: SecurityEventSeverity,
  })
  severity: SecurityEventSeverity;

  @Column({ nullable: true })
  userId?: string;

  @Column()
  ip: string;

  @Column()
  userAgent: string;

  @Column()
  resource: string;

  @Column()
  action: string;

  @Column()
  success: boolean;

  @Column({ type: 'jsonb' })
  metadata: Record<string, unknown>;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ default: false })
  processed: boolean;

  @Column({ default: false })
  alertSent: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

