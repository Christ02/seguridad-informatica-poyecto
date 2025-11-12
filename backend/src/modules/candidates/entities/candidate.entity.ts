import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Election } from '../../elections/entities/election.entity';
import { Vote } from '../../votes/entities/vote.entity';

@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  party: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  photoUrl: string;

  @Column({ type: 'int', default: 0 })
  voteCount: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'uuid' })
  electionId: string;

  @ManyToOne(() => Election, (election) => election.candidates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'electionId' })
  election: Election;

  @OneToMany(() => Vote, (vote) => vote.candidate)
  votes: Vote[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}

