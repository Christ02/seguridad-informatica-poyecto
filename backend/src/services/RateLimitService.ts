import { redisClient } from '../config/redis.config';
import { RATE_LIMITS } from '@voting-system/shared';

export class RateLimitService {
  /**
   * Check rate limit for a key
   */
  async checkRateLimit(
    key: string,
    maxAttempts: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const now = Date.now();
    const windowKey = `ratelimit:${key}:${Math.floor(now / windowMs)}`;

    // Increment counter
    const count = await redisClient.incr(windowKey);

    // Set expiry on first request in window
    if (count === 1) {
      await redisClient.pexpire(windowKey, windowMs);
    }

    const allowed = count <= maxAttempts;
    const remaining = Math.max(0, maxAttempts - count);
    const resetAt = new Date(Math.ceil(now / windowMs) * windowMs);

    return { allowed, remaining, resetAt };
  }

  /**
   * Check login rate limit
   */
  async checkLoginLimit(ip: string): Promise<boolean> {
    const key = `login:${ip}`;
    const result = await this.checkRateLimit(
      key,
      RATE_LIMITS.LOGIN.MAX_ATTEMPTS,
      RATE_LIMITS.LOGIN.WINDOW_MS
    );
    return result.allowed;
  }

  /**
   * Check register rate limit
   */
  async checkRegisterLimit(ip: string): Promise<boolean> {
    const key = `register:${ip}`;
    const result = await this.checkRateLimit(
      key,
      RATE_LIMITS.REGISTER.MAX_ATTEMPTS,
      RATE_LIMITS.REGISTER.WINDOW_MS
    );
    return result.allowed;
  }

  /**
   * Check 2FA verification rate limit
   */
  async check2FALimit(userId: string): Promise<boolean> {
    const key = `2fa:${userId}`;
    const result = await this.checkRateLimit(
      key,
      RATE_LIMITS.TWO_FACTOR_VERIFY.MAX_ATTEMPTS,
      RATE_LIMITS.TWO_FACTOR_VERIFY.WINDOW_MS
    );
    return result.allowed;
  }

  /**
   * Check vote rate limit
   */
  async checkVoteLimit(userId: string): Promise<boolean> {
    const key = `vote:${userId}`;
    const result = await this.checkRateLimit(
      key,
      RATE_LIMITS.VOTE.MAX_ATTEMPTS,
      RATE_LIMITS.VOTE.WINDOW_MS
    );
    return result.allowed;
  }

  /**
   * Check API rate limit
   */
  async checkAPILimit(userId: string): Promise<boolean> {
    const key = `api:${userId}`;
    const result = await this.checkRateLimit(
      key,
      RATE_LIMITS.API_GENERAL.MAX_ATTEMPTS,
      RATE_LIMITS.API_GENERAL.WINDOW_MS
    );
    return result.allowed;
  }

  /**
   * Implement exponential backoff
   */
  async recordFailedAttempt(key: string): Promise<number> {
    const failKey = `fail:${key}`;
    const failures = await redisClient.incr(failKey);
    
    // Set expiry (reset after 1 hour of no failures)
    await redisClient.expire(failKey, 3600);
    
    return failures;
  }

  /**
   * Get backoff delay based on failures
   */
  getBackoffDelay(failures: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 60s
    return Math.min(Math.pow(2, failures - 1) * 1000, 60000);
  }

  /**
   * Reset failures
   */
  async resetFailures(key: string): Promise<void> {
    const failKey = `fail:${key}`;
    await redisClient.del(failKey);
  }

  /**
   * Check if IP is temporarily blocked
   */
  async isIPBlocked(ip: string): Promise<boolean> {
    const blockKey = `block:${ip}`;
    const blocked = await redisClient.get(blockKey);
    return blocked !== null;
  }

  /**
   * Block IP temporarily
   */
  async blockIP(ip: string, durationMs: number): Promise<void> {
    const blockKey = `block:${ip}`;
    await redisClient.psetex(blockKey, durationMs, '1');
  }

  /**
   * Get rate limit info for a key
   */
  async getRateLimitInfo(
    key: string,
    maxAttempts: number,
    windowMs: number
  ): Promise<{
    limit: number;
    current: number;
    remaining: number;
    resetAt: Date;
    blocked: boolean;
  }> {
    const now = Date.now();
    const windowKey = `ratelimit:${key}:${Math.floor(now / windowMs)}`;
    
    const count = parseInt((await redisClient.get(windowKey)) || '0');
    const remaining = Math.max(0, maxAttempts - count);
    const resetAt = new Date(Math.ceil(now / windowMs) * windowMs);
    const blocked = count >= maxAttempts;

    return {
      limit: maxAttempts,
      current: count,
      remaining,
      resetAt,
      blocked,
    };
  }
}

