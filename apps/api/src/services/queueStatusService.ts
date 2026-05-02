/**
 * Queue status service
 * Provides real-time status of BullMQ queues
 */
import { Queue } from "bullmq";
import { getQueueConnection } from "../queues/queueFactory.js";
import { QUEUE_NAMES } from "../queues/queueNames.js";
import { logger } from "../config/logger.js";

export interface QueueStatus {
  ingest: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  };
  classify: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
  enrich: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
  totalJobs: number;
  isProcessing: boolean;
}

export async function getQueueStatus(): Promise<QueueStatus> {
  try {
    const connection = getQueueConnection();

    // Create temporary queue instances to check status
    const ingestQueue = new Queue(QUEUE_NAMES.ingest, { connection });
    const classifyQueue = new Queue(QUEUE_NAMES.classify, { connection });
    const enrichQueue = new Queue(QUEUE_NAMES.enrich, { connection });

    // Get job counts for each queue
    const [ingestCounts, classifyCounts, enrichCounts] = await Promise.all([
      ingestQueue.getJobCounts(),
      classifyQueue.getJobCounts(),
      enrichQueue.getJobCounts(),
    ]);

    // Clean up queue instances
    await Promise.all([
      ingestQueue.close(),
      classifyQueue.close(),
      enrichQueue.close(),
    ]);

    const totalJobs =
      (ingestCounts.waiting || 0) +
      (ingestCounts.active || 0) +
      (classifyCounts.waiting || 0) +
      (classifyCounts.active || 0) +
      (enrichCounts.waiting || 0) +
      (enrichCounts.active || 0);

    return {
      ingest: {
        waiting: ingestCounts.waiting || 0,
        active: ingestCounts.active || 0,
        completed: ingestCounts.completed || 0,
        failed: ingestCounts.failed || 0,
        delayed: ingestCounts.delayed || 0,
      },
      classify: {
        waiting: classifyCounts.waiting || 0,
        active: classifyCounts.active || 0,
        completed: classifyCounts.completed || 0,
        failed: classifyCounts.failed || 0,
      },
      enrich: {
        waiting: enrichCounts.waiting || 0,
        active: enrichCounts.active || 0,
        completed: enrichCounts.completed || 0,
        failed: enrichCounts.failed || 0,
      },
      totalJobs,
      isProcessing: totalJobs > 0,
    };
  } catch (err) {
    logger.error({ err }, "Failed to get queue status");
    throw err;
  }
}
