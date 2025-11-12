import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Between } from 'typeorm';
import { Election, ElectionStatus } from './entities/election.entity';
import { CreateElectionDto } from './dto/create-election.dto';
import { UpdateElectionDto } from './dto/update-election.dto';
import * as crypto from 'crypto';

@Injectable()
export class ElectionsService {
  constructor(
    @InjectRepository(Election)
    private readonly electionRepository: Repository<Election>,
  ) {}

  /**
   * Crear nueva elección (Solo ADMIN)
   */
  async create(createElectionDto: CreateElectionDto): Promise<Election> {
    const { startDate, endDate, ...rest } = createElectionDto;

    // Validar fechas
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start >= end) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha de fin',
      );
    }

    if (end <= now) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha actual',
      );
    }

    // Generar clave de encriptación única para esta elección
    const encryptionKey = crypto.randomBytes(32).toString('hex');

    const election = this.electionRepository.create({
      ...rest,
      startDate: start,
      endDate: end,
      encryptionKey,
      status: ElectionStatus.DRAFT,
    });

    return await this.electionRepository.save(election);
  }

  /**
   * Obtener todas las elecciones (filtradas según usuario)
   */
  async findAll(userRole: string): Promise<Election[]> {
    const query = this.electionRepository
      .createQueryBuilder('election')
      .leftJoinAndSelect('election.candidates', 'candidates')
      .where('election.isActive = :isActive', { isActive: true })
      .orderBy('election.createdAt', 'DESC');

    // Si no es admin, solo mostrar elecciones activas o completadas
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      query.andWhere('election.status IN (:...statuses)', {
        statuses: [ElectionStatus.ACTIVE, ElectionStatus.COMPLETED],
      });
    }

    const elections = await query.getMany();

    // No exponer la clave de encriptación
    return elections.map((election) => {
      const { encryptionKey, ...rest } = election;
      return rest as Election;
    });
  }

  /**
   * Obtener elecciones activas para votar
   */
  async findActive(): Promise<Election[]> {
    const now = new Date();

    const elections = await this.electionRepository.find({
      where: {
        status: ElectionStatus.ACTIVE,
        isActive: true,
        startDate: LessThan(now),
        endDate: MoreThan(now),
      },
      relations: ['candidates'],
      order: { createdAt: 'DESC' },
    });

    // No exponer claves de encriptación
    return elections.map((election) => {
      const { encryptionKey, ...rest } = election;
      return rest as Election;
    });
  }

  /**
   * Obtener una elección por ID
   */
  async findOne(id: string, userRole?: string): Promise<Election> {
    const election = await this.electionRepository.findOne({
      where: { id, isActive: true },
      relations: ['candidates'],
    });

    if (!election) {
      throw new NotFoundException('Elección no encontrada');
    }

    // Verificar permisos
    if (userRole && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      if (
        election.status !== ElectionStatus.ACTIVE &&
        election.status !== ElectionStatus.COMPLETED
      ) {
        throw new ForbiddenException(
          'No tienes permisos para ver esta elección',
        );
      }
    }

    // No exponer clave de encriptación
    const { encryptionKey, ...rest } = election;
    return rest as Election;
  }

  /**
   * Actualizar estado de elección
   */
  async updateStatus(id: string, status: ElectionStatus): Promise<Election> {
    const election = await this.findOne(id);

    // Validaciones de transición de estado
    if (status === ElectionStatus.ACTIVE) {
      const now = new Date();
      if (election.startDate > now) {
        throw new BadRequestException(
          'No se puede activar una elección antes de su fecha de inicio',
        );
      }
      if (election.endDate <= now) {
        throw new BadRequestException(
          'No se puede activar una elección cuya fecha de fin ya pasó',
        );
      }
    }

    election.status = status;
    return await this.electionRepository.save(election);
  }

  /**
   * Incrementar contador de votos
   */
  async incrementVoteCount(id: string): Promise<void> {
    await this.electionRepository.increment({ id }, 'totalVotes', 1);
  }

  /**
   * Obtener clave de encriptación (solo para proceso de votación)
   */
  async getEncryptionKey(id: string): Promise<string> {
    const election = await this.electionRepository.findOne({
      where: { id },
      select: ['id', 'encryptionKey'],
    });

    if (!election) {
      throw new NotFoundException('Elección no encontrada');
    }

    return election.encryptionKey;
  }

  /**
   * Verificar si una elección está activa y abierta para votación
   */
  async isElectionOpen(id: string): Promise<boolean> {
    const now = new Date();

    const election = await this.electionRepository.findOne({
      where: {
        id,
        status: ElectionStatus.ACTIVE,
        isActive: true,
        startDate: LessThan(now),
        endDate: MoreThan(now),
      },
    });

    return !!election;
  }

  /**
   * Cerrar automáticamente elecciones vencidas (CRON JOB)
   */
  async closeExpiredElections(): Promise<number> {
    const now = new Date();

    const result = await this.electionRepository
      .createQueryBuilder()
      .update(Election)
      .set({ status: ElectionStatus.CLOSED })
      .where('status = :status', { status: ElectionStatus.ACTIVE })
      .andWhere('endDate < :now', { now })
      .execute();

    return result.affected || 0;
  }

  /**
   * Actualizar elección (Solo ADMIN)
   */
  async update(id: string, updateElectionDto: UpdateElectionDto): Promise<Election> {
    const election = await this.electionRepository.findOne({
      where: { id, isActive: true },
    });

    if (!election) {
      throw new NotFoundException('Elección no encontrada');
    }

    // No permitir editar elecciones activas o completadas
    if (election.status === ElectionStatus.ACTIVE || election.status === ElectionStatus.COMPLETED) {
      throw new BadRequestException(
        'No se puede editar una elección activa o completada',
      );
    }

    // Validar fechas si se proporcionan
    if (updateElectionDto.startDate || updateElectionDto.endDate) {
      const startDate = updateElectionDto.startDate 
        ? new Date(updateElectionDto.startDate) 
        : election.startDate;
      const endDate = updateElectionDto.endDate 
        ? new Date(updateElectionDto.endDate) 
        : election.endDate;

      if (startDate >= endDate) {
        throw new BadRequestException(
          'La fecha de inicio debe ser anterior a la fecha de fin',
        );
      }
    }

    // Actualizar solo los campos proporcionados
    Object.assign(election, updateElectionDto);
    
    return await this.electionRepository.save(election);
  }

  /**
   * Eliminar elección (soft delete) (Solo ADMIN)
   */
  async delete(id: string): Promise<{ message: string }> {
    const election = await this.electionRepository.findOne({
      where: { id, isActive: true },
    });

    if (!election) {
      throw new NotFoundException('Elección no encontrada');
    }

    // No permitir eliminar elecciones activas
    if (election.status === ElectionStatus.ACTIVE) {
      throw new BadRequestException('No se puede eliminar una elección activa');
    }

    // Soft delete
    election.isActive = false;
    election.deletedAt = new Date();
    await this.electionRepository.save(election);

    return {
      message: 'Elección eliminada exitosamente',
    };
  }
}

