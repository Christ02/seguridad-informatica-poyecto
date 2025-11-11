import { redisClient } from '../config/redis.config';
import { SESSION_CONFIG } from '@voting-system/shared';

interface SessionData {
  accessToken: string;
  refreshToken: string;
  deviceFingerprint?: string;
  createdAt: Date;
}

export class SessionService {
  private readonly SESSION_PREFIX = 'session:';
  private readonly BLACKLIST_PREFIX = 'blacklist:';

  /**
   * Create a new session
   */
  async createSession(userId: string, data: SessionData): Promise<void> {
    const key = `${this.SESSION_PREFIX}${userId}`;
    await redisClient.setex(
      key,
      SESSION_CONFIG.REFRESH_TOKEN_TTL,
      JSON.stringify(data)
    );
  }

  /**
   * Get session data
   */
  async getSession(userId: string): Promise<SessionData | null> {
    const key = `${this.SESSION_PREFIX}${userId}`;
    const data = await redisClient.get(key);
    if (!data) return null;
    return JSON.parse(data);
  }

  /**
   * Validate session
   */
  async validateSession(userId: string, refreshToken: string): Promise<boolean> {
    const session = await this.getSession(userId);
    if (!session) return false;
    return session.refreshToken === refreshToken;
  }

  /**
   * Delete session
   */
  async deleteSession(userId: string): Promise<void> {
    const key = `${this.SESSION_PREFIX}${userId}`;
    await redisClient.del(key);
  }

  /**
   * Delete all user sessions
   */
  async deleteAllUserSessions(userId: string): Promise<void> {
    const pattern = `${this.SESSION_PREFIX}${userId}*`;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  }

  /**
   * Blacklist a token
   */
  async blacklistToken(token: string): Promise<void> {
    const key = `${this.BLACKLIST_PREFIX}${token}`;
    await redisClient.setex(key, SESSION_CONFIG.ACCESS_TOKEN_TTL, '1');
  }

  /**
   * Check if token is blacklisted
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `${this.BLACKLIST_PREFIX}${token}`;
    const result = await redisClient.get(key);
    return result !== null;
  }

  /**
   * Get all active sessions for user
   */
  async getUserSessions(userId: string): Promise<SessionData[]> {
    const pattern = `${this.SESSION_PREFIX}${userId}*`;
    const keys = await redisClient.keys(pattern);
    
    const sessions: SessionData[] = [];
    for (const key of keys) {
      const data = await redisClient.get(key);
      if (data) {
        sessions.push(JSON.parse(data));
      }
    }
    
    return sessions;
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(userId: string): Promise<void> {
    const session = await this.getSession(userId);
    if (session) {
      await this.createSession(userId, {
        ...session,
        createdAt: new Date(),
      });
    }
  }
}

