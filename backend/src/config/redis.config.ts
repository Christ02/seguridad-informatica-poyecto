import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Redis client for sessions, rate limiting, and caching
 */
export const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      // Reconnect on specific errors
      return true;
    }
    return false;
  },
  lazyConnect: true,
  enableReadyCheck: true,
  showFriendlyErrorStack: process.env.NODE_ENV === 'development',
});

/**
 * Redis client for pub/sub
 */
export const redisPubSubClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

/**
 * Initialize Redis connection
 */
export const initializeRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    await redisPubSubClient.connect();
    console.log('✓ Redis connection established');

    // Test connection
    await redisClient.ping();
  } catch (error) {
    console.error('✗ Redis connection failed:', error);
    throw error;
  }
};

/**
 * Close Redis connections
 */
export const closeRedis = async (): Promise<void> => {
  try {
    await redisClient.quit();
    await redisPubSubClient.quit();
    console.log('✓ Redis connection closed');
  } catch (error) {
    console.error('✗ Error closing Redis:', error);
  }
};

// Event handlers
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('ready', () => {
  console.log('✓ Redis client is ready');
});

redisPubSubClient.on('error', (err) => {
  console.error('Redis PubSub Error:', err);
});

export default redisClient;

