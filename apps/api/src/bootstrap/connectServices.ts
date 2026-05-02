import { connectMongo, mongoHealth } from "../db/mongo.js";
import { connectRedis, redisHealth } from "../db/redis.js";
import { ensureIndexes } from "../db/indexes.js";
import { initializeWebPush, isWebPushConfigured } from "../services/webPushService.js";
import { logger } from "../config/logger.js";

export async function connectServices() {
  const [mongo, redis] = await Promise.allSettled([connectMongo(), connectRedis()]);

  if (mongo.status === "rejected") {
    logger.warn({ err: mongo.reason }, "MongoDB connection is not ready at startup");
  } else {
    await ensureIndexes();
  }

  if (redis.status === "rejected") {
    logger.warn({ err: redis.reason }, "Redis connection is not ready at startup");
  }

  // Initialize web push service (doesn't require external connection)
  initializeWebPush();

  return {
    mongo: mongo.status === "fulfilled" ? mongo.value : null,
    redis: redis.status === "fulfilled" ? redis.value : null,
    health: {
      mongo: mongoHealth(),
      redis: redisHealth(),
      webPush: isWebPushConfigured()
    }
  };
}
