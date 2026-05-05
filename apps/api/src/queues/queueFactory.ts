import { Queue } from "bullmq";
import { createBullMqConnection, getBullMqPrefix } from "../db/redis.js";

const connection = createBullMqConnection();
const prefix = getBullMqPrefix();

export function createQueue(name: string) {
  return new Queue(name, getQueueOptions());
}

export function getQueueConnection() {
  return connection;
}

export function getQueueOptions() {
  return {
    connection,
    prefix
  };
}
