import Redis from "ioredis";
import { env } from "../config/env.js";

let redisClient: Redis | null = null;

const DEFAULT_REDIS_URL = "redis://localhost:6380";

export function resolveRedisUrl(redisUrl = env.REDIS_URL): string {
  const trimmedUrl = redisUrl?.trim();

  if (trimmedUrl && (trimmedUrl.startsWith("redis://") || trimmedUrl.startsWith("rediss://"))) {
    return trimmedUrl;
  }

  console.warn("Invalid REDIS_URL detected, using default Redis URL");
  return DEFAULT_REDIS_URL;
}

export function createBullMqConnection() {
  return {
    url: resolveRedisUrl(),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    connectTimeout: 10000
  };
}

export function createRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(resolveRedisUrl(), {
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
