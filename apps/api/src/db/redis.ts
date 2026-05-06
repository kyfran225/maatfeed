import Redis from "ioredis";
import { env } from "../config/env.js";

let redisClient: Redis | null = null;

const DEFAULT_REDIS_URL = "redis://localhost:6380";
const UPSTASH_HOST_SUFFIX = ".upstash.io";

function buildUpstashRedisUrl(hostname: string): string | null {
  if (!env.UPSTASH_REST_TOKEN) {
    return null;
  }

  return `rediss://default:${encodeURIComponent(env.UPSTASH_REST_TOKEN)}@${hostname}:6379`;
}

export function resolveRedisUrl(redisUrl = env.REDIS_URL): string {
  const trimmedUrl = redisUrl?.trim();

  if (trimmedUrl) {
    try {
      const url = new URL(trimmedUrl);
      const isUpstashHost = url.hostname.endsWith(UPSTASH_HOST_SUFFIX);

      if (url.protocol === "rediss:") {
        return url.toString();
      }

      if (url.protocol === "redis:") {
        if (isUpstashHost) {
          url.protocol = "rediss:";
          url.port = url.port || "6379";
        }

        return url.toString();
      }

      if ((url.protocol === "https:" || url.protocol === "http:") && isUpstashHost) {
        const upstashRedisUrl = buildUpstashRedisUrl(url.hostname);

        if (upstashRedisUrl) {
          console.warn("Using Upstash REST endpoint as Redis TLS endpoint");
          return upstashRedisUrl;
        }
      }
    } catch {
      // Fall through to the explicit fallback warning below.
    }
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

export function getBullMqPrefix(): string {
  return `maatfeed:${env.NODE_ENV}`;
}

export function createRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(resolveRedisUrl(), {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      connectTimeout: 10000,
      commandTimeout: 5000,
      enableOfflineQueue: true,
      retryStrategy: times => Math.min(times * 100, 2000),
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
