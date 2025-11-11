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

@Entity('vote_options')
@Index(['electionId', 'order'])
export class VoteOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  electionId: string;

  @ManyToOne(() => Election)
  @JoinColumn({ name: 'electionId' })
  election: Election;

  @Column()
  optionText: string;

  @Column({ type: 'int' })
  order: number;

  @CreateDateColumn()
  createdAt: Date;
}

