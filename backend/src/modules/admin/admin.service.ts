import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Election, ElectionStatus } from '../elections/entities/election.entity';
import { Vote } from '../votes/entities/vote.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { AuditLog, AuditEventType } from '../audit/entities/audit-log.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { UpdateCandidateDto, UpdateElectionDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Election)
    private electionRepository: Repository<Election>,
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Obtener estadísticas generales del dashboard
   */
  async getDashboardStats() {
    const [
      totalUsers,
      totalElections,
      activeElections,
      totalVotes,
      todayVotes,
      recentUsers,
    ] = await Promise.all([
      this.userRepository.count({ where: { deletedAt: null as any } }),
      this.electionRepository.count({ where: { deletedAt: null as any } }),
      this.electionRepository.count({
        where: { status: 'ACTIVE' as any, deletedAt: null as any },
      }),
      this.voteRepository.count(),
      this.getTodayVotesCount(),
      this.getRecentUsersCount(7),
    ]);

    // Calcular crecimiento
    const previousWeekUsers = await this.getPreviousWeekUsersCount();
    const userGrowth = previousWeekUsers > 0
      ? ((recentUsers - previousWeekUsers) / previousWeekUsers) * 100
      : 0;

    const previousDayVotes = await this.getPreviousDayVotesCount();
    const votesGrowth = previousDayVotes > 0
      ? ((todayVotes - previousDayVotes) / previousDayVotes) * 100
      : 0;

    return {
      totalUsers,
      totalElections,
      activeElections,
      totalVotes,
      todayVotes,
      recentUsers,
      userGrowth: Math.round(userGrowth * 10) / 10,
      votesGrowth: Math.round(votesGrowth * 10) / 10,
    };
  }

  /**
   * Obtener actividad reciente del sistema
   */
  async getRecentActivity(limit: number = 10) {
    const activities = await this.auditLogRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return activities.map((activity) => ({
      id: activity.id,
      type: activity.eventType,
      userEmail: activity.userEmail,
      action: activity.action,
      timestamp: activity.createdAt,
      metadata: activity.metadata,
    }));
  }

  /**
   * Obtener tendencias de votación por día
   */
  async getVotingTrends(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const votes = await this.voteRepository
      .createQueryBuilder('vote')
      .select("DATE(vote.createdAt)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('vote.createdAt >= :startDate', { startDate })
      .groupBy("DATE(vote.createdAt)")
      .orderBy('date', 'ASC')
      .getRawMany();

    return votes.map((v) => ({
      date: v.date,
      votes: parseInt(v.count),
    }));
  }

  /**
   * Obtener historial completo de votaciones con filtros
   */
  async getVotesHistory(filters: {
    page: number;
    limit: number;
    status?: string;
    electionId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page, limit, status, electionId, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    const queryBuilder = this.voteRepository
      .createQueryBuilder('vote')
      .leftJoinAndSelect('vote.election', 'election')
      .leftJoinAndSelect('vote.candidate', 'candidate')
      .leftJoinAndSelect('vote.user', 'user')
      .orderBy('vote.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (status) {
      if (status === 'valid') {
        queryBuilder.andWhere('vote.isValid = :isValid', { isValid: true });
      } else if (status === 'invalid') {
        queryBuilder.andWhere('vote.isValid = :isValid', { isValid: false });
      }
    }

    if (electionId) {
      queryBuilder.andWhere('vote.electionId = :electionId', { electionId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('vote.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    const [votes, total] = await queryBuilder.getManyAndCount();

    return {
      data: votes.map((vote) => ({
        id: vote.id,
        electionTitle: vote.election.title,
        candidateName: vote.candidate.name,
        voterEmail: vote.user.email,
        voterName: vote.user.fullName,
        voteHash: vote.voteHash,
        isValid: vote.isValid,
        timestamp: vote.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener resultados detallados de una elección
   */
  async getDetailedResults(electionId: string) {
    const election = await this.electionRepository.findOne({
      where: { id: electionId, deletedAt: null as any },
      relations: ['candidates'],
    });

    if (!election) {
      throw new Error('Elección no encontrada');
    }

    const totalVotes = await this.voteRepository.count({
      where: { electionId, isValid: true },
    });

    const candidateResults = await Promise.all(
      election.candidates.map(async (candidate) => {
        const votes = await this.voteRepository.count({
          where: { candidateId: candidate.id, isValid: true },
        });

        return {
          id: candidate.id,
          name: candidate.name,
          party: candidate.party,
          votes,
          percentage: totalVotes > 0 ? (votes / totalVotes) * 100 : 0,
          photoUrl: candidate.photoUrl,
        };
      }),
    );

    // Ordenar por votos
    candidateResults.sort((a, b) => b.votes - a.votes);

    return {
      election: {
        id: election.id,
        title: election.title,
        description: election.description,
        status: election.status,
        startDate: election.startDate,
        endDate: election.endDate,
      },
      results: {
        totalVotes,
        candidates: candidateResults,
        winner: candidateResults[0] || null,
      },
    };
  }

  /**
   * Obtener análisis demográfico
   */
  async getDemographics(electionId: string) {
    const votesByDepartment = await this.voteRepository
      .createQueryBuilder('vote')
      .leftJoin('vote.user', 'user')
      .select('user.department', 'department')
      .addSelect('COUNT(*)', 'count')
      .where('vote.electionId = :electionId', { electionId })
      .andWhere('vote.isValid = :isValid', { isValid: true })
      .groupBy('user.department')
      .getRawMany();

    const votesByAge = await this.voteRepository
      .createQueryBuilder('vote')
      .leftJoin('vote.user', 'user')
      .select(
        `CASE 
          WHEN EXTRACT(YEAR FROM AGE(user.dateOfBirth)) < 25 THEN '18-24'
          WHEN EXTRACT(YEAR FROM AGE(user.dateOfBirth)) < 35 THEN '25-34'
          WHEN EXTRACT(YEAR FROM AGE(user.dateOfBirth)) < 45 THEN '35-44'
          WHEN EXTRACT(YEAR FROM AGE(user.dateOfBirth)) < 55 THEN '45-54'
          ELSE '55+'
        END`,
        'ageGroup',
      )
      .addSelect('COUNT(*)', 'count')
      .where('vote.electionId = :electionId', { electionId })
      .andWhere('vote.isValid = :isValid', { isValid: true })
      .groupBy('ageGroup')
      .getRawMany();

    return {
      byDepartment: votesByDepartment.map((d) => ({
        department: d.department || 'No especificado',
        votes: parseInt(d.count),
      })),
      byAge: votesByAge.map((a) => ({
        ageGroup: a.ageGroup,
        votes: parseInt(a.count),
      })),
    };
  }

  /**
   * Obtener usuarios con paginación
   */
  async getUsers(filters: {
    page: number;
    limit: number;
    role?: string;
    verified?: boolean;
  }) {
    const { page, limit, role, verified } = filters;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null as any };
    if (role) where.role = role;
    if (verified !== undefined) where.isVerified = verified;

    const [users, total] = await this.userRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: users.map((user) => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        dpi: user.dpi,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener estadísticas de usuarios
   */
  async getUserStats() {
    const [
      totalUsers,
      verifiedUsers,
      activeUsers,
      usersByRole,
    ] = await Promise.all([
      this.userRepository.count({ where: { deletedAt: null as any } }),
      this.userRepository.count({
        where: { isVerified: true, deletedAt: null as any },
      }),
      this.userRepository.count({
        where: { isActive: true, deletedAt: null as any },
      }),
      this.userRepository
        .createQueryBuilder('user')
        .select('user.role', 'role')
        .addSelect('COUNT(*)', 'count')
        .where('user.deletedAt IS NULL')
        .groupBy('user.role')
        .getRawMany(),
    ]);

    return {
      totalUsers,
      verifiedUsers,
      activeUsers,
      byRole: usersByRole.map((r) => ({
        role: r.role,
        count: parseInt(r.count),
      })),
    };
  }

  // Helper methods
  private async getTodayVotesCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await this.voteRepository.count({
      where: {
        createdAt: Between(today, tomorrow),
      },
    });
  }

  private async getPreviousDayVotesCount(): Promise<number> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await this.voteRepository.count({
      where: {
        createdAt: Between(yesterday, today),
      },
    });
  }

  private async getRecentUsersCount(days: number): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await this.userRepository.count({
      where: {
        createdAt: Between(startDate, new Date()) as any,
        deletedAt: null as any,
      },
    });
  }

  private async getPreviousWeekUsersCount(): Promise<number> {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return await this.userRepository.count({
      where: {
        createdAt: Between(twoWeeksAgo, oneWeekAgo) as any,
        deletedAt: null as any,
      },
    });
  }

  /**
   * Obtener detalles completos de un usuario
   */
  async getUserDetails(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, deletedAt: null as any },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Obtener estadísticas adicionales del usuario
    const votesCount = await this.voteRepository.count({
      where: { userId },
    });

    const lastVote = await this.voteRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['election'],
    });

    const recentActivity = await this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    // No devolver información sensible
    const { password, refreshToken, mfaSecret, ...userDetails } = user;

    return {
      user: userDetails,
      stats: {
        totalVotes: votesCount,
        lastVote: lastVote
          ? {
              electionTitle: lastVote.election.title,
              timestamp: lastVote.createdAt,
            }
          : null,
      },
      recentActivity: recentActivity.map((log) => ({
        eventType: log.eventType,
        action: log.action,
        timestamp: log.createdAt,
        ipAddress: log.ipAddressHash,
      })),
    };
  }

  /**
   * Actualizar rol de usuario
   */
  async updateUserRole(userId: string, newRole: UserRole) {
    const user = await this.userRepository.findOne({
      where: { id: userId, deletedAt: null as any },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.role = newRole;
    await this.userRepository.save(user);

    return {
      message: 'Rol de usuario actualizado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  /**
   * Actualizar estado activo de usuario
   */
  async updateUserStatus(userId: string, isActive: boolean) {
    const user = await this.userRepository.findOne({
      where: { id: userId, deletedAt: null as any },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.isActive = isActive;
    await this.userRepository.save(user);

    return {
      message: `Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente`,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isActive: user.isActive,
      },
    };
  }

  /**
   * Eliminar usuario (soft delete)
   */
  async deleteUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, deletedAt: null as any },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que el usuario no tenga votos asociados
    const votesCount = await this.voteRepository.count({
      where: { userId },
    });

    if (votesCount > 0) {
      throw new BadRequestException(
        'No se puede eliminar un usuario que ha emitido votos. Desactiva la cuenta en su lugar.',
      );
    }

    user.deletedAt = new Date();
    await this.userRepository.save(user);

    return {
      message: 'Usuario eliminado exitosamente',
    };
  }

  /**
   * Actualizar candidato
   */
  async updateCandidate(candidateId: string, updateDto: UpdateCandidateDto) {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId, deletedAt: null as any },
    });

    if (!candidate) {
      throw new NotFoundException('Candidato no encontrado');
    }

    // Actualizar solo los campos proporcionados
    Object.assign(candidate, updateDto);
    await this.candidateRepository.save(candidate);

    return {
      message: 'Candidato actualizado exitosamente',
      candidate,
    };
  }

  /**
   * Eliminar candidato (soft delete)
   */
  async deleteCandidate(candidateId: string) {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId, deletedAt: null as any },
      relations: ['election'],
    });

    if (!candidate) {
      throw new NotFoundException('Candidato no encontrado');
    }

    // Verificar que la elección no esté activa
    if (candidate.election.status === 'ACTIVE') {
      throw new BadRequestException(
        'No se puede eliminar un candidato de una elección activa',
      );
    }

    candidate.deletedAt = new Date();
    await this.candidateRepository.save(candidate);

    return {
      message: 'Candidato eliminado exitosamente',
    };
  }

  /**
   * Activar/Desactivar candidato
   */
  async toggleCandidateStatus(candidateId: string, isActive: boolean) {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId, deletedAt: null as any },
    });

    if (!candidate) {
      throw new NotFoundException('Candidato no encontrado');
    }

    candidate.isActive = isActive;
    await this.candidateRepository.save(candidate);

    return {
      message: `Candidato ${isActive ? 'activado' : 'desactivado'} exitosamente`,
      candidate,
    };
  }

  /**
   * Actualizar estado de elección
   */
  async updateElectionStatus(electionId: string, newStatus: ElectionStatus) {
    const election = await this.electionRepository.findOne({
      where: { id: electionId, deletedAt: null as any },
    });

    if (!election) {
      throw new NotFoundException('Elección no encontrada');
    }

    // Validar transiciones de estado
    this.validateElectionStatusTransition(election.status, newStatus);

    election.status = newStatus;
    await this.electionRepository.save(election);

    return {
      message: 'Estado de elección actualizado exitosamente',
      election: {
        id: election.id,
        title: election.title,
        status: election.status,
      },
    };
  }

  /**
   * Validar transiciones de estado de elección
   */
  private validateElectionStatusTransition(
    currentStatus: ElectionStatus,
    newStatus: ElectionStatus,
  ) {
    const validTransitions: Record<ElectionStatus, ElectionStatus[]> = {
      [ElectionStatus.DRAFT]: [ElectionStatus.ACTIVE, ElectionStatus.CLOSED],
      [ElectionStatus.ACTIVE]: [ElectionStatus.COMPLETED, ElectionStatus.CLOSED],
      [ElectionStatus.COMPLETED]: [ElectionStatus.CLOSED],
      [ElectionStatus.CLOSED]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `No se puede cambiar el estado de ${currentStatus} a ${newStatus}`,
      );
    }
  }

  /**
   * Actualizar elección
   */
  async updateElection(electionId: string, updateDto: UpdateElectionDto) {
    const election = await this.electionRepository.findOne({
      where: { id: electionId, deletedAt: null as any },
    });

    if (!election) {
      throw new NotFoundException('Elección no encontrada');
    }

    // No permitir editar elecciones activas o completadas
    if (election.status === 'ACTIVE' || election.status === 'COMPLETED') {
      throw new BadRequestException(
        'No se puede editar una elección activa o completada',
      );
    }

    // Actualizar solo los campos proporcionados
    Object.assign(election, updateDto);
    await this.electionRepository.save(election);

    return {
      message: 'Elección actualizada exitosamente',
      election,
    };
  }

  /**
   * Eliminar elección (soft delete)
   */
  async deleteElection(electionId: string) {
    const election = await this.electionRepository.findOne({
      where: { id: electionId, deletedAt: null as any },
    });

    if (!election) {
      throw new NotFoundException('Elección no encontrada');
    }

    // No permitir eliminar elecciones activas
    if (election.status === 'ACTIVE') {
      throw new BadRequestException('No se puede eliminar una elección activa');
    }

    election.deletedAt = new Date();
    await this.electionRepository.save(election);

    return {
      message: 'Elección eliminada exitosamente',
    };
  }

  /**
   * Exportar resultados en formato CSV
   */
  async exportElectionCSV(electionId: string) {
    const results = await this.getDetailedResults(electionId);

    const csvRows = [
      ['Candidato', 'Partido', 'Votos', 'Porcentaje'].join(','),
      ...results.results.candidates.map((c) =>
        [
          `"${c.name}"`,
          `"${c.party || 'Independiente'}"`,
          c.votes,
          `${c.percentage.toFixed(2)}%`,
        ].join(','),
      ),
    ];

    return {
      filename: `resultados-${electionId}-${Date.now()}.csv`,
      content: csvRows.join('\n'),
      contentType: 'text/csv',
    };
  }

  /**
   * Exportar resultados en formato PDF (placeholder)
   */
  async exportElectionPDF(electionId: string) {
    const results = await this.getDetailedResults(electionId);

    // Aquí se implementaría la generación real de PDF con una librería como pdfkit o puppeteer
    // Por ahora retornamos la estructura de datos
    return {
      filename: `resultados-${electionId}-${Date.now()}.pdf`,
      message: 'La exportación PDF está en desarrollo',
      data: results,
    };
  }

  /**
   * Obtener logs de auditoría filtrados
   */
  async getAuditLogs(filters: {
    page: number;
    limit: number;
    eventType?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page, limit, eventType, userId, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('log')
      .orderBy('log.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (eventType) {
      queryBuilder.andWhere('log.eventType = :eventType', { eventType });
    }

    if (userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    const [logs, total] = await queryBuilder.getManyAndCount();

    return {
      data: logs.map((log) => ({
        id: log.id,
        eventType: log.eventType,
        userId: log.userId,
        userEmail: log.userEmail,
        action: log.action,
        ipAddress: log.ipAddressHash,
        userAgent: log.userAgent,
        metadata: log.metadata,
        timestamp: log.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener estadísticas de seguridad
   */
  async getSecurityStats() {
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const [
      totalLogins,
      failedLogins,
      successfulLogins,
      mfaEnabled,
      activeUsers,
      suspiciousActivity,
    ] = await Promise.all([
      this.auditLogRepository.count({
        where: {
          eventType: In([AuditEventType.LOGIN, AuditEventType.LOGIN_FAILED]),
          createdAt: Between(last24Hours, new Date()) as any,
        },
      }),
      this.auditLogRepository.count({
        where: {
          eventType: AuditEventType.LOGIN_FAILED,
          createdAt: Between(last24Hours, new Date()) as any,
        },
      }),
      this.auditLogRepository.count({
        where: {
          eventType: AuditEventType.LOGIN,
          createdAt: Between(last24Hours, new Date()) as any,
        },
      }),
      this.userRepository.count({
        where: { mfaEnabled: true, deletedAt: null as any },
      }),
      this.userRepository.count({
        where: {
          isActive: true,
          deletedAt: null as any,
          lastLoginAt: Between(last24Hours, new Date()) as any,
        },
      }),
      this.auditLogRepository.count({
        where: {
          eventType: In([
            AuditEventType.LOGIN_FAILED,
            AuditEventType.SUSPICIOUS_ACTIVITY,
            AuditEventType.RATE_LIMIT_EXCEEDED,
          ]),
          createdAt: Between(last24Hours, new Date()) as any,
        },
      }),
    ]);

    // Obtener logins por hora (últimas 24 horas)
    const loginsByHour = await this.auditLogRepository
      .createQueryBuilder('log')
      .select("DATE_TRUNC('hour', log.createdAt)", 'hour')
      .addSelect('COUNT(*)', 'count')
      .where('log.eventType IN (:...types)', {
        types: [AuditEventType.LOGIN, AuditEventType.LOGIN_FAILED],
      })
      .andWhere('log.createdAt >= :date', { date: last24Hours })
      .groupBy("DATE_TRUNC('hour', log.createdAt)")
      .orderBy('hour', 'ASC')
      .getRawMany();

    // IPs con más intentos fallidos
    const suspiciousIPs = await this.auditLogRepository
      .createQueryBuilder('log')
      .select('log.ipAddressHash', 'ip')
      .addSelect('COUNT(*)', 'attempts')
      .where('log.eventType = :eventType', { eventType: AuditEventType.LOGIN_FAILED })
      .andWhere('log.createdAt >= :date', { date: last24Hours })
      .groupBy('log.ipAddressHash')
      .orderBy('attempts', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      last24Hours: {
        totalLogins,
        successfulLogins,
        failedLogins,
        failureRate: totalLogins > 0 ? (failedLogins / totalLogins) * 100 : 0,
        activeUsers,
        suspiciousActivity,
      },
      security: {
        mfaEnabled,
        mfaAdoptionRate:
          (mfaEnabled /
            (await this.userRepository.count({
              where: { deletedAt: null as any },
            }))) *
          100,
      },
      trends: {
        loginsByHour: loginsByHour.map((l) => ({
          hour: l.hour,
          count: parseInt(l.count),
        })),
      },
      threats: {
        suspiciousIPs: suspiciousIPs.map((ip) => ({
          ip: ip.ip,
          attempts: parseInt(ip.attempts),
        })),
      },
    };
  }
}

