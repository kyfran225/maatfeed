import { Queue } from "bullmq";
import { createBullMqConnection } from "../db/redis.js";

const connection = createBullMqConnection();

export function createQueue(name: string) {
  return new Queue(name, {
    connection
  });
}

export function getQueueConnection() {
  return connection;
}
