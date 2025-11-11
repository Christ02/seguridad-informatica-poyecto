import { Request, Response, NextFunction } from 'express';
import { RateLimitService } from '../services/RateLimitService';
import { AuthenticatedRequest } from './auth.middleware';

const rateLimitService = new RateLimitService();

/**
 * Rate limit middleware factory
 */
export const createRateLimiter = (
  type: 'login' | 'register' | '2fa' | 'vote' | 'api'
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      let allowed = false;
      const ip = req.ip || 'unknown';

      // Check if IP is blocked
      const isBlocked = await rateLimitService.isIPBlocked(ip);
      if (isBlocked) {
        res.status(429).json({
          error: 'Too many requests. Your IP is temporarily blocked.',
          retryAfter: 60,
        });
        return;
      }

      switch (type) {
        case 'login':
          allowed = await rateLimitService.checkLoginLimit(ip);
          break;
        case 'register':
          allowed = await rateLimitService.checkRegisterLimit(ip);
          break;
        case '2fa':
          if (req.user) {
            allowed = await rateLimitService.check2FALimit(req.user.userId);
          }
          break;
        case 'vote':
          if (req.user) {
            allowed = await rateLimitService.checkVoteLimit(req.user.userId);
          }
          break;
        case 'api':
          if (req.user) {
            allowed = await rateLimitService.checkAPILimit(req.user.userId);
          } else {
            allowed = await rateLimitService.checkAPILimit(ip);
          }
          break;
      }

      if (!allowed) {
        // Record failed attempt and calculate backoff
        const key = type === 'vote' || type === 'api' ? req.user?.userId || ip : ip;
        const failures = await rateLimitService.recordFailedAttempt(`${type}:${key}`);
        const backoffDelay = rateLimitService.getBackoffDelay(failures);

        // Block IP if too many failures
        if (failures >= 10) {
          await rateLimitService.blockIP(ip, 60 * 60 * 1000); // 1 hour
        }

        res.status(429).json({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil(backoffDelay / 1000),
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      next(); // Allow request on error (fail open)
    }
  };
};

export const rateLimitLogin = createRateLimiter('login');
export const rateLimitRegister = createRateLimiter('register');
export const rateLimit2FA = createRateLimiter('2fa');
export const rateLimitVote = createRateLimiter('vote');
export const rateLimitAPI = createRateLimiter('api');

