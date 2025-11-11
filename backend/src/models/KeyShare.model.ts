import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('key_shares')
@Index(['electionId', 'custodianId'])
@Index(['custodianId'])
export class KeyShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  electionId: string;

  @Column({ type: 'int' })
  shareIndex: number;

  @Column({ type: 'int' })
  custodianId: number;

  @Column({ type: 'text' })
  encryptedShare: string;

  @Column()
  publicCommitment: string;

  @Column({ default: false })
  distributed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  distributedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;
}

