import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog, AuditEventType } from './entities/audit-log.entity';
import * as crypto from 'crypto';

interface CreateAuditLogDto {
  eventType: AuditEventType;
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  metadata?: Record<string, any>;
  isSuspicious?: boolean;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Crear registro de auditoría
   */
  async log(createAuditLogDto: CreateAuditLogDto): Promise<void> {
    const { ipAddress, ...rest } = createAuditLogDto;

    const auditLog = this.auditLogRepository.create({
      ...rest,
      ipAddressHash: this.hashIP(ipAddress),
    });

    // Guardar de forma asíncrona para no bloquear
    await this.auditLogRepository.save(auditLog).catch((error) => {
      console.error('Error guardando audit log:', error);
    });
  }

  /**
   * Registrar login exitoso
   */
  async logLogin(
    userId: string,
    userEmail: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    await this.log({
      eventType: AuditEventType.LOGIN,
      userId,
      userEmail,
      ipAddress,
      userAgent,
      action: 'User logged in successfully',
    });
  }

  /**
   * Registrar intento de login fallido
   */
  async logLoginFailed(
    email: string,
    ipAddress: string,
    userAgent: string,
    reason: string,
  ): Promise<void> {
    await this.log({
      eventType: AuditEventType.LOGIN_FAILED,
      userEmail: email,
      ipAddress,
      userAgent,
      action: 'Login attempt failed',
      metadata: { reason },
      isSuspicious: true,
    });
  }

  /**
   * Registrar voto emitido
   */
  async logVoteCast(
    userId: string,
    electionId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    await this.log({
      eventType: AuditEventType.VOTE_CAST,
      userId,
      ipAddress,
      userAgent,
      resource: `election:${electionId}`,
      action: 'Vote cast',
      metadata: { electionId },
    });
  }

  /**
   * Registrar actividad sospechosa
   */
  async logSuspiciousActivity(
    userId: string | undefined,
    ipAddress: string,
    userAgent: string,
    reason: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      eventType: AuditEventType.SUSPICIOUS_ACTIVITY,
      userId,
      ipAddress,
      userAgent,
      action: reason,
      metadata,
      isSuspicious: true,
    });
  }

  /**
   * Obtener logs de auditoría (Solo ADMIN/AUDITOR)
   */
  async findAll(filters?: {
    userId?: string;
    eventType?: AuditEventType;
    startDate?: Date;
    endDate?: Date;
    suspiciousOnly?: boolean;
  }): Promise<AuditLog[]> {
    const query = this.auditLogRepository.createQueryBuilder('audit');

    if (filters?.userId) {
      query.andWhere('audit.userId = :userId', { userId: filters.userId });
    }

    if (filters?.eventType) {
      query.andWhere('audit.eventType = :eventType', {
        eventType: filters.eventType,
      });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    if (filters?.suspiciousOnly) {
      query.andWhere('audit.isSuspicious = :isSuspicious', {
        isSuspicious: true,
      });
    }

    query.orderBy('audit.createdAt', 'DESC').limit(1000);

    return await query.getMany();
  }

  /**
   * Detectar patrones sospechosos
   */
  async detectSuspiciousPatterns(userId: string): Promise<{
    isSuspicious: boolean;
    reasons: string[];
  }> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentLogs = await this.auditLogRepository.find({
      where: {
        userId,
        createdAt: Between(oneHourAgo, new Date()),
      },
    });

    const reasons: string[] = [];

    // Verificar múltiples intentos de voto
    const voteCasts = recentLogs.filter(
      (log) => log.eventType === AuditEventType.VOTE_CAST,
    );
    if (voteCasts.length > 5) {
      reasons.push('Múltiples intentos de voto en corto período');
    }

    // Verificar IPs diferentes
    const uniqueIPs = new Set(recentLogs.map((log) => log.ipAddressHash));
    if (uniqueIPs.size > 3) {
      reasons.push('Actividad desde múltiples IPs');
    }

    // Verificar intentos de login fallidos
    const failedLogins = recentLogs.filter(
      (log) => log.eventType === AuditEventType.LOGIN_FAILED,
    );
    if (failedLogins.length > 3) {
      reasons.push('Múltiples intentos de login fallidos');
    }

    return {
      isSuspicious: reasons.length > 0,
      reasons,
    };
  }

  /**
   * Obtener estadísticas de auditoría
   */
  async getStats(startDate: Date, endDate: Date): Promise<any> {
    const logs = await this.auditLogRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    const stats = {
      total: logs.length,
      byEventType: {} as Record<string, number>,
      suspiciousCount: logs.filter((log) => log.isSuspicious).length,
      uniqueUsers: new Set(logs.map((log) => log.userId).filter(Boolean)).size,
    };

    // Contar por tipo de evento
    logs.forEach((log) => {
      stats.byEventType[log.eventType] =
        (stats.byEventType[log.eventType] || 0) + 1;
    });

    return stats;
  }

  // ============= Utility Functions =============

  private hashIP(ip: string): string {
    return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 32);
  }

  /**
   * Registrar evento genérico
   */
  async logEvent(
    eventType: string,
    userId: string,
    ipAddress: string,
    action: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      eventType: eventType as AuditEventType,
      userId,
      ipAddress,
      action,
      metadata,
    });
  }

  /**
   * Obtener actividad reciente de un usuario
   */
  async getUserActivity(userId: string, limit: number = 10): Promise<any[]> {
    const logs = await this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return logs.map((log) => ({
      id: log.id,
      action: log.action || log.eventType,
      date: log.createdAt,
      eventType: log.eventType,
      metadata: log.metadata,
    }));
  }
}

