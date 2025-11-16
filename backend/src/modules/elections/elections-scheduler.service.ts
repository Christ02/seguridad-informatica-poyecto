import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Between } from 'typeorm';
import { Election, ElectionStatus } from './entities/election.entity';

/**
 * ElectionsSchedulerService
 * Servicio para tareas programadas relacionadas con elecciones
 * - Cierra automáticamente elecciones cuando pasa su fecha de fin
 * - Activa automáticamente elecciones cuando llega su fecha de inicio
 */
@Injectable()
export class ElectionsSchedulerService {
  private readonly logger = new Logger(ElectionsSchedulerService.name);

  constructor(
    @InjectRepository(Election)
    private readonly electionRepository: Repository<Election>,
  ) {}

  /**
   * Ejecutar cada 5 minutos para cerrar elecciones vencidas
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async closeExpiredElections() {
    try {
      const now = new Date();
      
      // Buscar elecciones activas cuya fecha de fin ya pasó
      const expiredElections = await this.electionRepository.find({
        where: {
          status: ElectionStatus.ACTIVE,
          endDate: LessThan(now),
          isActive: true,
        },
      });

      if (expiredElections.length === 0) {
        this.logger.debug('No hay elecciones activas que hayan expirado');
        return;
      }

      // Cerrar las elecciones expiradas
      for (const election of expiredElections) {
        election.status = ElectionStatus.CLOSED;
        await this.electionRepository.save(election);
        
        this.logger.log(
          `✅ Elección "${election.title}" cerrada automáticamente (ID: ${election.id})`,
        );
      }

      this.logger.log(
        `🔒 ${expiredElections.length} elección(es) cerrada(s) automáticamente`,
      );
    } catch (error) {
      this.logger.error('❌ Error al cerrar elecciones expiradas', error);
    }
  }

  /**
   * Ejecutar cada 10 minutos para activar elecciones programadas
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async activateScheduledElections() {
    try {
      const now = new Date();
      
      // Buscar elecciones en DRAFT cuya fecha de inicio ya llegó
      // y cuya fecha de fin aún no ha pasado
      const scheduledElections = await this.electionRepository.find({
        where: {
          status: ElectionStatus.DRAFT,
          startDate: LessThan(now),
          endDate: MoreThan(now),
          isActive: true,
        },
      });

      if (scheduledElections.length === 0) {
        this.logger.debug('No hay elecciones programadas para activar');
        return;
      }

      // Activar las elecciones programadas
      for (const election of scheduledElections) {
        election.status = ElectionStatus.ACTIVE;
        await this.electionRepository.save(election);
        
        this.logger.log(
          `✅ Elección "${election.title}" activada automáticamente (ID: ${election.id})`,
        );
      }

      this.logger.log(
        `🚀 ${scheduledElections.length} elección(es) activada(s) automáticamente`,
      );
    } catch (error) {
      this.logger.error('❌ Error al activar elecciones programadas', error);
    }
  }
}

