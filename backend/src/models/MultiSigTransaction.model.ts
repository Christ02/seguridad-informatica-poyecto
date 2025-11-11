import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { MultiSigTransactionType } from '@voting-system/shared';

@Entity('multisig_transactions')
@Index(['status'])
@Index(['type'])
@Index(['createdBy'])
@Index(['expiresAt'])
export class MultiSigTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MultiSigTransactionType,
  })
  type: MultiSigTransactionType;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ type: 'int' })
  requiredSignatures: number;

  @Column({ type: 'jsonb', default: [] })
  signatures: Array<{
    adminId: string;
    signature: string;
    publicKey: string;
    signedAt: Date;
    verified: boolean;
  }>;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'EXECUTED', 'EXPIRED'],
    default: 'PENDING',
  })
  status: string;

  @Column()
  createdBy: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  executedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

