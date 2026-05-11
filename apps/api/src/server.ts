import { createServer } from "node:http";
import mongoose from "mongoose";
import { loadEnv } from "./bootstrap/loadEnv.js";

loadEnv();

import { connectServices } from "./bootstrap/connectServices.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { createApp } from "./app.js";
import { socketIOManager } from "./realtime/socketIOServer.js";
import { disconnectRedis } from "./db/redis.js";

async function startServer() {
  await connectServices();

  const app = createApp();
  const server = createServer(app);

  // Initialize Socket.IO server (unified real-time solution)
  await socketIOManager.initialize(server);

  // Graceful shutdown handlers
  let isShuttingDown = false;

  async function gracefulShutdown(signal: string) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info({ signal }, "Starting graceful shutdown...");

    // Close HTTP server (stop accepting new connections)
    server.close(() => {
      logger.info("HTTP server closed");
    });

    // Close Socket.IO server
    socketIOManager.close(() => {
      logger.info("Socket.IO server closed");
    });

    // Close database connections
    try {
      await mongoose.connection.close(false);
      logger.info("MongoDB connection closed");
    } catch (err) {
      logger.error({ err }, "Error closing MongoDB connection");
    }

    try {
      await disconnectRedis();
      logger.info("Redis connection closed");
    } catch (err) {
      logger.error({ err }, "Error closing Redis connection");
    }

    logger.info("Graceful shutdown complete");
    process.exit(0);
  }

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "MAAT API listening");
  });
}

startServer().catch((error) => {
  logger.error({ err: error }, "Failed to start MAAT API");
  process.exit(1);
});
