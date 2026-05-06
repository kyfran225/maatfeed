import Redis from "ioredis";
import { createRedisClient } from "../db/redis.js";

function getClient(): Redis {
  return createRedisClient();
}

function getCacheErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function getCache<T>(key: string): Promise<T | null> {
  const client = getClient();

  if (client.status !== "ready") {
    return null;
  }

  try {
    const value = await client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch (error) {
    console.warn("Cache read skipped", { key, error: getCacheErrorMessage(error) });
    return null;
  }
}

export async function setCache(key: string, value: unknown, ttlSeconds: number) {
  const client = getClient();

  if (client.status !== "ready") {
    return;
  }

  try {
    await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (error) {
    console.warn("Cache write skipped", { key, error: getCacheErrorMessage(error) });
  }
}

export const cacheService = {
  get: getCache,
  set: setCache,
  delete: async (key: string) => {
    const client = getClient();
    if (client.status !== "ready") return;
    try {
      await client.del(key);
    } catch (error) {
      console.warn("Cache delete skipped", { key, error: getCacheErrorMessage(error) });
    }
  },
  deletePattern: async (pattern: string) => {
    const client = getClient();
    if (client.status !== "ready") return;
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } catch (error) {
      console.warn("Cache pattern delete skipped", { pattern, error: getCacheErrorMessage(error) });
    }
  }
};

export async function invalidateCacheKeys(keys: string[]) {
  const client = getClient();

  if (client.status !== "ready" || keys.length === 0) {
    return;
  }

  try {
    await client.del(...keys);
  } catch (error) {
    console.warn("Cache keys invalidation skipped", { keys, error: getCacheErrorMessage(error) });
  }
}

export async function invalidateCachePattern(pattern: string) {
  const client = getClient();

  if (client.status !== "ready") {
    return;
  }

  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch (error) {
    console.warn("Cache pattern invalidation skipped", { pattern, error: getCacheErrorMessage(error) });
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
