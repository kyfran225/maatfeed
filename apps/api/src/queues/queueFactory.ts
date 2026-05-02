import { Queue } from "bullmq";
import { env } from "../config/env.js";

const connection = {
  url: env.REDIS_URL
};

export function createQueue(name: string) {
  return new Queue(name, {
    connection
  });
}

export function getQueueConnection() {
  return connection;
}
