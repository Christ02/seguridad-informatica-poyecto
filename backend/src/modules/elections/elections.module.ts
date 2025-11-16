import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElectionsController } from './elections.controller';
import { ElectionsService } from './elections.service';
import { ElectionsSchedulerService } from './elections-scheduler.service';
import { Election } from './entities/election.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Election])],
  controllers: [ElectionsController],
  providers: [ElectionsService, ElectionsSchedulerService],
  exports: [ElectionsService],
})
export class ElectionsModule {}

