import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';
import { Vote } from './entities/vote.entity';
import { ElectionsModule } from '../elections/elections.module';
import { CandidatesModule } from '../candidates/candidates.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vote]),
    ElectionsModule,
    CandidatesModule,
    AuditModule,
  ],
  controllers: [VotesController],
  providers: [VotesService],
  exports: [VotesService],
})
export class VotesModule {}

