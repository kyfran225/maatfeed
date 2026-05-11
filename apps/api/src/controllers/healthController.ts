import type { Request, Response } from "express";
import { mongoHealth } from "../db/mongo.js";
import { redisHealth } from "../db/redis.js";
import { getReadinessStatus } from "../services/readinessService.js";
import { env } from "../config/env.js";

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    mongo: any;
    redis: any;
    socketio?: any;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  metrics?: {
    activeConnections: number;
    totalRooms: number;
    onlineUsers: number;
  };
}

export async function health(_request: Request, response: Response) {
  const startTime = Date.now();
  
  // Get memory usage
  const memUsage = process.memoryUsage();
  const memoryInfo = {
    used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
    total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
    percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
  };
  
  // Get Socket.IO stats if available
  let socketMetrics = undefined;
  try {
    const { socketIOManager } = await import("../realtime/socketIOServer.js");
    socketMetrics = socketIOManager.getRoomStats();
  } catch (error) {
    // Socket.IO not available
  }
  
  const responseTime = Date.now() - startTime;
  const mongoStatus = mongoHealth();
  const redisStatus = redisHealth();
  const isHealthy = mongoStatus.readyState === 1 && (redisStatus as any).status === 'connected' && responseTime < 5000;
  
  const healthResponse: HealthResponse = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    version: process.env.npm_package_version || '1.0.0',
    environment: env.NODE_ENV || 'development',
    services: {
      mongo: mongoStatus,
      redis: redisStatus,
      ...(socketMetrics && { socketio: 'running' })
    },
    memory: memoryInfo,
    ...(socketMetrics && {
      metrics: {
        activeConnections: socketMetrics.totalConnections,
        totalRooms: socketMetrics.totalRooms,
        onlineUsers: socketMetrics.onlineUsers
      }
    })
  };
  
  const statusCode = isHealthy ? 200 : 503;
  
  response.status(statusCode).json(healthResponse);
}

export async function readiness(_request: Request, response: Response) {
  const status = await getReadinessStatus();
  response.status(status.status === "ready" ? 200 : 503).json(status);
}

export async function liveness(_request: Request, response: Response) {
  response.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime())
  });
}
