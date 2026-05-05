import Redis from "ioredis";
import { env } from "../config/env.js";

let redisClient: Redis | null = null;

export function createRedisClient(): Redis {
  if (!redisClient) {
    // Handle case where REDIS_URL might be malformed or missing
    let redisUrl = env.REDIS_URL || "redis://localhost:6379";
    
    // Fix invalid Redis URLs that cause EACCES errors
    if (redisUrl === '/' || !redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
      console.warn('Invalid REDIS_URL detected, using default Redis URL');
      redisUrl = "redis://localhost:6379";
    }
    
    redisClient = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      connectTimeout: 10000,
      commandTimeout: 5000,
      enableOfflineQueue: false,
    });

    // Handle connection errors gracefully
    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err.message);
    });

    redisClient.on('connect', () => {
      console.log('Redis connected successfully');
    });
  }

  return redisClient;
}

export async function connectRedis(): Promise<Redis> {
  const client = createRedisClient();

  if (client.status === "wait") {
    await client.connect();
  }

  return client;
}

export function redisHealth() {
  const client = createRedisClient();

  return {
    status: client.status
  };
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
