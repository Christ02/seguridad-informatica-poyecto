import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Election } from '../elections/entities/election.entity';
import { Vote } from '../votes/entities/vote.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Election, Vote, Candidate, AuditLog]),
    AuditModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}


