import { AuditLogService } from './AuditLogService';
import { SecurityEvent } from '../models/SecurityEvent.model';
import { AppDataSource } from '../config/database.config';

export interface SecurityAlert {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  userId?: string;
  ipAddress?: string;
  timestamp: Date;
  metadata: any;
}

export class SIEMService {
  private securityEventRepository = AppDataSource.getRepository(SecurityEvent);
  private auditLogService = new AuditLogService();

  // Thresholds for anomaly detection
  private readonly THRESHOLDS = {
    FAILED_LOGIN_ATTEMPTS: 5,
    FAILED_LOGIN_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    API_REQUESTS_PER_MINUTE: 100,
    VOTE_ATTEMPTS_PER_HOUR: 10,
    SUSPICIOUS_IP_CHANGE: true,
    MULTIPLE_SESSIONS_THRESHOLD: 3,
  };

  /**
   * Log security event
   */
  async logSecurityEvent(event: SecurityAlert): Promise<SecurityEvent> {
    const securityEvent = this.securityEventRepository.create({
      eventType: event.type,
      severity: event.severity,
      description: event.description,
      userId: event.userId,
      ipAddress: event.ipAddress,
      metadata: event.metadata,
      timestamp: event.timestamp,
      acknowledged: false,
    });

    const saved = await this.securityEventRepository.save(securityEvent);

    // Trigger alerts for high/critical events
    if (event.severity === 'high' || event.severity === 'critical') {
      await this.triggerAlert(saved);
    }

    return saved;
  }

  /**
   * Detect failed login anomalies
   */
  async detectFailedLoginAnomaly(userId: string, ipAddress: string): Promise<boolean> {
    const windowStart = new Date(Date.now() - this.THRESHOLDS.FAILED_LOGIN_WINDOW_MS);

    const recentFailures = await this.auditLogService.getUserLogs(userId, {
      action: 'LOGIN_FAILED',
      startDate: windowStart,
    });

    if (recentFailures.length >= this.THRESHOLDS.FAILED_LOGIN_ATTEMPTS) {
      await this.logSecurityEvent({
        severity: 'high',
        type: 'BRUTE_FORCE_ATTEMPT',
        description: `Multiple failed login attempts detected for user ${userId}`,
        userId,
        ipAddress,
        timestamp: new Date(),
        metadata: {
          failedAttempts: recentFailures.length,
          timeWindow: this.THRESHOLDS.FAILED_LOGIN_WINDOW_MS,
        },
      });

      return true;
    }

    return false;
  }

  /**
   * Detect rate limit anomalies
   */
  async detectRateLimitAnomaly(userId: string, ipAddress: string): Promise<boolean> {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    const recentRequests = await this.auditLogService.getUserLogs(userId, {
      startDate: oneMinuteAgo,
    });

    if (recentRequests.length > this.THRESHOLDS.API_REQUESTS_PER_MINUTE) {
      await this.logSecurityEvent({
        severity: 'medium',
        type: 'RATE_LIMIT_ANOMALY',
        description: `Excessive API requests detected for user ${userId}`,
        userId,
        ipAddress,
        timestamp: new Date(),
        metadata: {
          requestCount: recentRequests.length,
          timeWindow: 60,
        },
      });

      return true;
    }

    return false;
  }

  /**
   * Detect suspicious IP changes
   */
  async detectIPChangeAnomaly(userId: string, newIpAddress: string): Promise<boolean> {
    const recentActivity = await this.auditLogService.getUserLogs(userId, {
      limit: 10,
    });

    if (recentActivity.length > 0) {
      const lastIp = recentActivity[0].ipAddress;
      
      // Check if IP changed within last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentWithOldIp = recentActivity.filter(
        log => log.ipAddress === lastIp && log.timestamp > fiveMinutesAgo
      );

      if (lastIp !== newIpAddress && recentWithOldIp.length > 0) {
        await this.logSecurityEvent({
          severity: 'medium',
          type: 'SUSPICIOUS_IP_CHANGE',
          description: `Rapid IP address change detected for user ${userId}`,
          userId,
          ipAddress: newIpAddress,
          timestamp: new Date(),
          metadata: {
            oldIp: lastIp,
            newIp: newIpAddress,
          },
        });

        return true;
      }
    }

    return false;
  }

  /**
   * Detect multiple concurrent sessions
   */
  async detectMultipleSessionsAnomaly(userId: string): Promise<boolean> {
    // This would check Redis for active sessions
    // Simplified implementation for now
    await this.logSecurityEvent({
      severity: 'low',
      type: 'MULTIPLE_SESSIONS',
      description: `Multiple concurrent sessions detected for user ${userId}`,
      userId,
      timestamp: new Date(),
      metadata: {},
    });

    return false;
  }

  /**
   * Detect vote manipulation attempts
   */
  async detectVoteManipulationAnomaly(
    userId: string,
    electionId: string
  ): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentVoteAttempts = await this.auditLogService.getUserLogs(userId, {
      action: 'VOTE_CAST',
      startDate: oneHourAgo,
    });

    if (recentVoteAttempts.length >= this.THRESHOLDS.VOTE_ATTEMPTS_PER_HOUR) {
      await this.logSecurityEvent({
        severity: 'critical',
        type: 'VOTE_MANIPULATION_ATTEMPT',
        description: `Multiple vote attempts detected for user ${userId} in election ${electionId}`,
        userId,
        timestamp: new Date(),
        metadata: {
          voteAttempts: recentVoteAttempts.length,
          electionId,
        },
      });

      return true;
    }

    return false;
  }

  /**
   * Detect unauthorized access attempts
   */
  async detectUnauthorizedAccess(
    userId: string,
    resource: string,
    ipAddress: string
  ): Promise<void> {
    await this.logSecurityEvent({
      severity: 'high',
      type: 'UNAUTHORIZED_ACCESS',
      description: `Unauthorized access attempt to ${resource} by user ${userId}`,
      userId,
      ipAddress,
      timestamp: new Date(),
      metadata: {
        resource,
      },
    });
  }

  /**
   * Analyze security events for patterns
   */
  async analyzeSecurityPatterns(
    timeWindow: number = 24 * 60 * 60 * 1000 // 24 hours
  ): Promise<{
    totalEvents: number;
    criticalEvents: number;
    topThreats: { type: string; count: number }[];
    affectedUsers: string[];
    suspiciousIPs: string[];
  }> {
    const windowStart = new Date(Date.now() - timeWindow);

    const events = await this.securityEventRepository.find({
      where: {
        timestamp: { $gte: windowStart } as any,
      },
    });

    const criticalEvents = events.filter(e => e.severity === 'critical').length;

    // Count threat types
    const threatCounts = new Map<string, number>();
    for (const event of events) {
      const count = threatCounts.get(event.eventType) || 0;
      threatCounts.set(event.eventType, count + 1);
    }

    const topThreats = Array.from(threatCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get unique affected users
    const affectedUsers = [...new Set(events.map(e => e.userId).filter(Boolean))];

    // Get suspicious IPs (IPs with multiple security events)
    const ipCounts = new Map<string, number>();
    for (const event of events) {
      if (event.ipAddress) {
        const count = ipCounts.get(event.ipAddress) || 0;
        ipCounts.set(event.ipAddress, count + 1);
      }
    }

    const suspiciousIPs = Array.from(ipCounts.entries())
      .filter(([, count]) => count >= 5)
      .map(([ip]) => ip);

    return {
      totalEvents: events.length,
      criticalEvents,
      topThreats,
      affectedUsers: affectedUsers as string[],
      suspiciousIPs,
    };
  }

  /**
   * Get unacknowledged security events
   */
  async getUnacknowledgedEvents(): Promise<SecurityEvent[]> {
    return await this.securityEventRepository.find({
      where: { acknowledged: false },
      order: { severity: 'DESC', timestamp: 'DESC' },
    });
  }

  /**
   * Acknowledge security event
   */
  async acknowledgeEvent(eventId: string, acknowledgedBy: string): Promise<void> {
    const event = await this.securityEventRepository.findOne({
      where: { id: eventId },
    });

    if (event) {
      event.acknowledged = true;
      event.acknowledgedBy = acknowledgedBy;
      event.acknowledgedAt = new Date();
      await this.securityEventRepository.save(event);
    }
  }

  /**
   * Trigger alert (would integrate with external alerting systems)
   */
  private async triggerAlert(event: SecurityEvent): Promise<void> {
    // In production, this would integrate with:
    // - Email notifications
    // - Slack/Teams webhooks
    // - PagerDuty
    // - SMS alerts
    
    console.error('[SECURITY ALERT]', {
      severity: event.severity,
      type: event.eventType,
      description: event.description,
      timestamp: event.timestamp,
    });

    // Log to audit trail
    await this.auditLogService.log({
      userId: 'SYSTEM',
      action: 'SECURITY_ALERT_TRIGGERED',
      resource: 'security',
      details: {
        eventId: event.id,
        severity: event.severity,
        type: event.eventType,
      },
      ipAddress: '',
      userAgent: '',
      timestamp: new Date(),
    });
  }

  /**
   * Generate security report
   */
  async generateSecurityReport(
    startDate: Date,
    endDate: Date
  ): Promise<{
    summary: {
      totalEvents: number;
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    topThreats: { type: string; count: number }[];
    timeline: { date: string; count: number }[];
    recommendations: string[];
  }> {
    const events = await this.securityEventRepository.find({
      where: {
        timestamp: { $gte: startDate, $lte: endDate } as any,
      },
    });

    const summary = {
      totalEvents: events.length,
      critical: events.filter(e => e.severity === 'critical').length,
      high: events.filter(e => e.severity === 'high').length,
      medium: events.filter(e => e.severity === 'medium').length,
      low: events.filter(e => e.severity === 'low').length,
    };

    // Count threat types
    const threatCounts = new Map<string, number>();
    for (const event of events) {
      const count = threatCounts.get(event.eventType) || 0;
      threatCounts.set(event.eventType, count + 1);
    }

    const topThreats = Array.from(threatCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Generate timeline
    const timeline = this.generateTimeline(events, startDate, endDate);

    // Generate recommendations
    const recommendations = this.generateRecommendations(summary, topThreats);

    return {
      summary,
      topThreats,
      timeline,
      recommendations,
    };
  }

  /**
   * Generate timeline for report
   */
  private generateTimeline(
    events: SecurityEvent[],
    startDate: Date,
    endDate: Date
  ): { date: string; count: number }[] {
    const days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const timeline: { date: string; count: number }[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = events.filter(e => {
        const eventDate = e.timestamp.toISOString().split('T')[0];
        return eventDate === dateStr;
      }).length;

      timeline.push({ date: dateStr, count });
    }

    return timeline;
  }

  /**
   * Generate security recommendations
   */
  private generateRecommendations(
    summary: any,
    topThreats: { type: string; count: number }[]
  ): string[] {
    const recommendations: string[] = [];

    if (summary.critical > 0) {
      recommendations.push(
        'URGENT: Investigate and resolve all critical security events immediately'
      );
    }

    if (topThreats.some(t => t.type === 'BRUTE_FORCE_ATTEMPT')) {
      recommendations.push(
        'Implement stricter rate limiting and consider CAPTCHA for login'
      );
    }

    if (topThreats.some(t => t.type === 'VOTE_MANIPULATION_ATTEMPT')) {
      recommendations.push(
        'Review election security measures and investigate potential vote manipulation'
      );
    }

    if (topThreats.some(t => t.type === 'UNAUTHORIZED_ACCESS')) {
      recommendations.push(
        'Review access controls and audit user permissions'
      );
    }

    if (summary.high > 10) {
      recommendations.push(
        'High number of high-severity events - consider security audit'
      );
    }

    return recommendations;
  }
}

