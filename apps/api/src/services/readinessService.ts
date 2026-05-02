import mongoose from "mongoose";
import { createRedisClient } from "../db/redis.js";

const WORKERS_HEARTBEAT_KEY = "maat:workers:heartbeat";

export async function getReadinessStatus() {
  const redis = createRedisClient();
  const redisReady = redis.status === "ready";
  const mongoReady = mongoose.connection.readyState === 1;

  let workersReady = false;
  if (redisReady) {
    try {
      const heartbeat = await redis.get(WORKERS_HEARTBEAT_KEY);
      workersReady = heartbeat === "1";
    } catch {
      workersReady = false;
    }
  }

  const checks = {
    api: "ready",
    mongo: mongoReady ? "ready" : "not_ready",
    redis: redisReady ? "ready" : "not_ready",
    workers: workersReady ? "ready" : "not_ready"
  } as const;

  return {
    status: mongoReady && redisReady && workersReady ? "ready" : "degraded",
    checks,
    timestamp: new Date().toISOString()
  };
}
