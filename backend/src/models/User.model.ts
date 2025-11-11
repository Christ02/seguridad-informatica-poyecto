import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { UserRole } from '@voting-system/shared';

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VOTER,
  })
  role: UserRole;

  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column({ nullable: true, type: 'text' })
  twoFactorSecret?: string;

  @Column({ type: 'simple-array', nullable: true })
  backupCodes?: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verificationToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ nullable: true })
  lastLoginIP?: string;

  @Column({ nullable: true })
  lastLoginDevice?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Admin-specific fields
  @Column({ nullable: true })
  custodianId?: number;

  @Column({ type: 'text', nullable: true })
  multiSigPublicKey?: string;

  @Column({ type: 'text', nullable: true })
  multiSigPrivateKeyEncrypted?: string;

  @Column({ type: 'simple-array', nullable: true })
  permissions?: string[];
}

