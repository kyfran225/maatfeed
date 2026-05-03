import mongoose from "mongoose";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export async function connectMongo(): Promise<typeof mongoose> {
  logger.info({ mongodbUri: env.MONGODB_URI }, "Connexion à MongoDB");
  const connection = await mongoose.connect(env.MONGODB_URI);
  logger.info({ dbName: connection.connection.name, host: connection.connection.host }, "Connecté à MongoDB");
  return connection;
}

export function mongoHealth() {
  return {
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null
  };
}
