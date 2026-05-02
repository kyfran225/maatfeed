import Redis from "ioredis";
import { createRedisClient } from "../db/redis.js";

function getClient(): Redis {
  return createRedisClient();
}

export async function getCache<T>(key: string): Promise<T | null> {
  const client = getClient();

  if (client.status !== "ready") {
    return null;
  }

  const value = await client.get(key);
  return value ? (JSON.parse(value) as T) : null;
}

export async function setCache(key: string, value: unknown, ttlSeconds: number) {
  const client = getClient();

  if (client.status !== "ready") {
    return;
  }

  await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export const cacheService = {
  get: getCache,
  set: setCache,
  delete: async (key: string) => {
    const client = getClient();
    if (client.status !== "ready") return;
    await client.del(key);
  },
  deletePattern: async (pattern: string) => {
    const client = getClient();
    if (client.status !== "ready") return;
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  }
};

export async function invalidateCacheKeys(keys: string[]) {
  const client = getClient();

  if (client.status !== "ready" || keys.length === 0) {
    return;
  }

  await client.del(...keys);
}

export async function invalidateCachePattern(pattern: string) {
  const client = getClient();

  if (client.status !== "ready") {
    return;
  }

  const keys = await client.keys(pattern);
  if (keys.length > 0) {
    await client.del(...keys);
  }
}

export async function getCacheWithFallback<T>(
  key: string,
  fallback: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  const cached = await getCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  const value = await fallback();
  await setCache(key, value, ttlSeconds);
  return value;
}

export async function setCacheWithVersion<T>(
  key: string,
  value: T,
  ttlSeconds: number,
  version: string = "v1"
): Promise<void> {
  const versionedValue = {
    ...value,
    _version: version,
    _timestamp: new Date().toISOString()
  };
  await setCache(key, versionedValue, ttlSeconds);
}

export const CACHE_TTL = {
  global: 600,     // 10 minutes
  user: 300,       // 5 minutes  
  session: 900,    // 15 minutes
  trends: 300,     // 5 minutes
  hot: 1800,       // 30 minutes
  config: 3600     // 1 hour
} as const;
