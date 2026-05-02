import mongoose from "mongoose";
import { env } from "../config/env.js";

export async function connectMongo(): Promise<typeof mongoose> {
  return mongoose.connect(env.MONGODB_URI);
}

export function mongoHealth() {
  return {
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null
  };
}
