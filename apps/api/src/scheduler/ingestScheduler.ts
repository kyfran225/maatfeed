import { Queue, Job } from "bullmq";
import { getQueueOptions } from "../queues/queueFactory.js";
import { logger } from "../config/logger.js";
import { createRedisClient } from "../db/redis.js";

const SCHEDULER_QUEUE_NAME = "auto-ingest-scheduler";
const REPEATABLE_JOB_ID = "auto-ingest-recurring";

// Default: every 2 hours
const DEFAULT_CRON = "0 */2 * * *";

export function createIngestScheduler(): Queue {
  return new Queue(SCHEDULER_QUEUE_NAME, getQueueOptions());
}

export async function scheduleAutoIngest(
  cron = DEFAULT_CRON,
  limitPerProvider = 10
): Promise<Job> {
  const queue = createIngestScheduler();

  // Remove existing repeatable job if any
  const repeatableJobs = await queue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    if (job.id === REPEATABLE_JOB_ID || job.name === "auto-ingest") {
      await queue.removeRepeatableByKey(job.key);
      logger.info({ jobKey: job.key }, "Removed existing repeatable job");
    }
  }

  // Schedule new repeatable job
  const scheduledJob = await queue.add(
    "auto-ingest",
    {
      triggeredAt: new Date().toISOString(),
      limitPerProvider
    },
    {
      jobId: REPEATABLE_JOB_ID,
      repeat: {
        pattern: cron
      },
      removeOnComplete: 50,
      removeOnFail: 50
    }
  );

  logger.info(
    { jobId: scheduledJob.id, cron, limitPerProvider },
    "Auto-ingest scheduled"
  );

  return scheduledJob;
}

export async function stopAutoIngest(): Promise<void> {
  const queue = createIngestScheduler();

  const repeatableJobs = await queue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await queue.removeRepeatableByKey(job.key);
  }

  logger.info("Auto-ingest scheduler stopped");
}

export async function getSchedulerStatus(): Promise<{
  isScheduled: boolean;
  cron?: string;
  nextRun?: Date;
  lastRun?: Date;
}> {
  const queue = createIngestScheduler();
  const repeatableJobs = await queue.getRepeatableJobs();

  if (repeatableJobs.length === 0) {
    return { isScheduled: false };
  }

  const job = repeatableJobs[0];
  const jobs = await queue.getJobs(["delayed", "waiting"]);
  const nextJob = jobs.find((j) => j.name === "auto-ingest");

  return {
    isScheduled: true,
    cron: (job as any).cron,
    nextRun: nextJob ? new Date(nextJob.timestamp) : undefined,
    lastRun: undefined
  };
}

export async function triggerImmediateIngest(
  keywords?: string[],
  limitPerProvider = 10
): Promise<Job> {
  const queue = createIngestScheduler();

  const job = await queue.add(
    "auto-ingest",
    {
      triggeredAt: new Date().toISOString(),
      keywords,
      limitPerProvider
    },
    {
      removeOnComplete: 100,
      removeOnFail: 100
    }
  );

  logger.info(
    { jobId: job.id, keywords, limitPerProvider },
    "Immediate auto-ingest triggered"
  );

  return job;
}
