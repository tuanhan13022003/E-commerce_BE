/**
 * Redis Configuration for Token Blacklist & Caching
 */
import Redis from 'ioredis';
import { env } from '@/config/env';

// Check if Redis URL is provided
const redisUrl = process.env.REDIS_URL;

// Initialize Redis client if available
export const redis = redisUrl
  ? new Redis(redisUrl, {
      retryStrategy: (times) => Math.min(times * 50, 2000),
      enableReadyCheck: true,
      enableOfflineQueue: true,
    })
  : null;

// Handle Redis connection events
if (redis) {
  redis.on('connect', () => {
  });

  redis.on('error', (err) => {
    console.error('Redis error:', err.message);
  });

  redis.on('close', () => {
    console.warn(' Redis connection closed');
  });
}

export const isRedisAvailable = !!redis;

// Utility functions for token blacklist
export const blacklistToken = async (token: string, expirySeconds: number) => {
  if (!redis) return false;

  try {
    const key = `blacklist:${token}`;
    await redis.setex(key, expirySeconds, '1');
    return true;
  } catch (error) {
    console.error('Failed to blacklist token:', error);
    return false;
  }
};

export const isTokenBlacklisted = async (token: string) => {
  if (!redis) return false;

  try {
    const key = `blacklist:${token}`;
    const result = await redis.get(key);
    return !!result;
  } catch (error) {
    console.error('Failed to check token blacklist:', error);
    return false;
  }
};

export default redis;
