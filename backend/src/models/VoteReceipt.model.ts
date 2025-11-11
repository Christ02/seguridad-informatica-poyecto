import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('vote_receipts')
@Index(['receiptId'], { unique: true })
@Index(['electionId'])
@Index(['blockIndex'])
export class VoteReceipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  receiptId: string;

  @Column()
  electionId: string;

  @Column()
  blockHash: string;

  @Column({ type: 'int' })
  blockIndex: number;

  @Column({ type: 'text' })
  zkProof: string;

  @Column({ type: 'simple-array' })
  merkleProof: string[];

  @Column()
  verificationUrl: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ default: false })
  verified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;
}

