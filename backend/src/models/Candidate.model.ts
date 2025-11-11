import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Election } from './Election.model';

@Entity('candidates')
@Index(['electionId', 'order'])
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  electionId: string;

  @ManyToOne(() => Election)
  @JoinColumn({ name: 'electionId' })
  election: Election;

  @Column()
  name: string;

  @Column({ nullable: true })
  party?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  photoUrl?: string;

  @Column({ type: 'int' })
  order: number;

  @CreateDateColumn()
  createdAt: Date;
}

