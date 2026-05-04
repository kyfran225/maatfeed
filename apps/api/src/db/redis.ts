import Redis from "ioredis";
import { env } from "../config/env.js";

let redisClient: Redis | null = null;

export function createRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1
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
