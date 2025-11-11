import { AppDataSource } from '../config/database.config';
import { AuditLog } from '../models/AuditLog.model';
import { AuditLogEntry } from '@voting-system/shared';

export class AuditLogService {
  private auditLogRepository = AppDataSource.getRepository(AuditLog);

  /**
   * Log an audit event
   */
  async log(entry: AuditLogEntry): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      userId: entry.userId,
      action: entry.action,
      resource: entry.resource,
      details: entry.details,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      timestamp: entry.timestamp,
    });

    return await this.auditLogRepository.save(auditLog);
  }

  /**
   * Get audit logs for a user
   */
  async getUserLogs(
    userId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      action?: string;
      limit?: number;
    }
  ): Promise<AuditLog[]> {
    const query = this.auditLogRepository.createQueryBuilder('audit')
      .where('audit.userId = :userId', { userId });

    if (options?.startDate) {
      query.andWhere('audit.timestamp >= :startDate', { startDate: options.startDate });
    }

    if (options?.endDate) {
      query.andWhere('audit.timestamp <= :endDate', { endDate: options.endDate });
    }

    if (options?.action) {
      query.andWhere('audit.action = :action', { action: options.action });
    }

    query.orderBy('audit.timestamp', 'DESC');

    if (options?.limit) {
      query.limit(options.limit);
    }

    return await query.getMany();
  }

  /**
   * Get audit logs for a resource
   */
  async getResourceLogs(
    resource: string,
    resourceId?: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<AuditLog[]> {
    const query = this.auditLogRepository.createQueryBuilder('audit')
      .where('audit.resource = :resource', { resource });

    if (resourceId) {
      query.andWhere("audit.details->>'resourceId' = :resourceId", { resourceId });
    }

    if (options?.startDate) {
      query.andWhere('audit.timestamp >= :startDate', { startDate: options.startDate });
    }

    if (options?.endDate) {
      query.andWhere('audit.timestamp <= :endDate', { endDate: options.endDate });
    }

    query.orderBy('audit.timestamp', 'DESC');

    if (options?.limit) {
      query.limit(options.limit);
    }

    return await query.getMany();
  }

  /**
   * Get security events
   */
  async getSecurityEvents(
    options?: {
      startDate?: Date;
      endDate?: Date;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      limit?: number;
    }
  ): Promise<AuditLog[]> {
    const securityActions = [
      'LOGIN_FAILED',
      'LOGIN_BLOCKED',
      '2FA_FAILED',
      'UNAUTHORIZED_ACCESS',
      'RATE_LIMIT_EXCEEDED',
      'SUSPICIOUS_ACTIVITY',
    ];

    const query = this.auditLogRepository.createQueryBuilder('audit')
      .where('audit.action IN (:...actions)', { actions: securityActions });

    if (options?.startDate) {
      query.andWhere('audit.timestamp >= :startDate', { startDate: options.startDate });
    }

    if (options?.endDate) {
      query.andWhere('audit.timestamp <= :endDate', { endDate: options.endDate });
    }

    query.orderBy('audit.timestamp', 'DESC');

    if (options?.limit) {
      query.limit(options.limit);
    }

    return await query.getMany();
  }

  /**
   * Get audit statistics
   */
  async getStatistics(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalEvents: number;
    eventsByAction: { action: string; count: number }[];
    eventsByUser: { userId: string; count: number }[];
    eventsByHour: { hour: string; count: number }[];
  }> {
    // Total events
    const totalEvents = await this.auditLogRepository.count({
      where: {
        timestamp: { $gte: startDate, $lte: endDate } as any,
      },
    });

    // Events by action
    const eventsByAction = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .where('audit.timestamp >= :startDate', { startDate })
      .andWhere('audit.timestamp <= :endDate', { endDate })
      .groupBy('audit.action')
      .orderBy('count', 'DESC')
      .getRawMany();

    // Events by user
    const eventsByUser = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.userId', 'userId')
      .addSelect('COUNT(*)', 'count')
      .where('audit.timestamp >= :startDate', { startDate })
      .andWhere('audit.timestamp <= :endDate', { endDate })
      .groupBy('audit.userId')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // Events by hour
    const eventsByHour = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select("to_char(audit.timestamp, 'YYYY-MM-DD HH24:00')", 'hour')
      .addSelect('COUNT(*)', 'count')
      .where('audit.timestamp >= :startDate', { startDate })
      .andWhere('audit.timestamp <= :endDate', { endDate })
      .groupBy('hour')
      .orderBy('hour', 'ASC')
      .getRawMany();

    return {
      totalEvents,
      eventsByAction,
      eventsByUser,
      eventsByHour,
    };
  }

  /**
   * Search audit logs
   */
  async searchLogs(
    searchTerm: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<AuditLog[]> {
    const query = this.auditLogRepository.createQueryBuilder('audit')
      .where('audit.action ILIKE :search', { search: `%${searchTerm}%` })
      .orWhere('audit.resource ILIKE :search', { search: `%${searchTerm}%` })
      .orWhere('audit.details::text ILIKE :search', { search: `%${searchTerm}%` });

    if (options?.startDate) {
      query.andWhere('audit.timestamp >= :startDate', { startDate: options.startDate });
    }

    if (options?.endDate) {
      query.andWhere('audit.timestamp <= :endDate', { endDate: options.endDate });
    }

    query.orderBy('audit.timestamp', 'DESC');

    if (options?.limit) {
      query.limit(options.limit);
    }

    return await query.getMany();
  }

  /**
   * Delete old logs (for GDPR compliance)
   */
  async deleteOldLogs(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .where('timestamp < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  /**
   * Export logs to JSON
   */
  async exportLogs(
    startDate: Date,
    endDate: Date,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    const logs = await this.auditLogRepository.find({
      where: {
        timestamp: { $gte: startDate, $lte: endDate } as any,
      },
      order: { timestamp: 'ASC' },
    });

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    } else {
      // CSV format
      const headers = ['timestamp', 'userId', 'action', 'resource', 'ipAddress', 'userAgent'];
      const rows = logs.map(log => [
        log.timestamp.toISOString(),
        log.userId,
        log.action,
        log.resource,
        log.ipAddress,
        log.userAgent,
      ]);

      return [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');
    }
  }
}

