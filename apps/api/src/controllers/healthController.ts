import type { Request, Response } from "express";
import { mongoHealth } from "../db/mongo.js";
import { redisHealth } from "../db/redis.js";
import { getReadinessStatus } from "../services/readinessService.js";

export function health(_request: Request, response: Response) {
  response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      mongo: mongoHealth(),
      redis: redisHealth()
    }
  });
}

export async function readiness(_request: Request, response: Response) {
  const status = await getReadinessStatus();
  response.status(status.status === "ready" ? 200 : 503).json(status);
}
