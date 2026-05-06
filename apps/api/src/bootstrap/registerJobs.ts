import { loadEnv } from "./loadEnv.js";
import { Worker } from "bullmq";
import { logger } from "../config/logger.js";
import { processIngestJob } from "../jobs/ingestContentJob.js";
import { processClassificationJob } from "../jobs/classifyContentJob.js";
import { processEnrichmentJob } from "../jobs/enrichContentJob.js";
import { processAutoIngestJob } from "../jobs/autoIngestJob.js";
import { processCommunityAICommentJob } from "../jobs/processCommunityAICommentJob.js";
import { runMultiPersonalityAIWorker } from "../jobs/multiPersonalityAIJob.js";
import { scheduleAutoIngest } from "../scheduler/ingestScheduler.js";
import { connectServices } from "./connectServices.js";
import { getQueueOptions } from "../queues/queueFactory.js";
import { QUEUE_NAMES } from "../queues/queueNames.js";
import { createPushNotificationWorker, initializePushNotificationJobs } from "../queues/pushNotificationQueue.js";
import { createRedisClient } from "../db/redis.js";
import { getAllDynamicKeywords } from "../services/keywordManagementService.js";

loadEnv();

const WORKERS_HEARTBEAT_KEY = "maat:workers:heartbeat";
const WORKERS_HEARTBEAT_TTL_SECONDS = 30;
const WORKERS_HEARTBEAT_INTERVAL_MS = 10_000;

export function registerJobWorkers() {
  const queueOptions = getQueueOptions();

  // Ingest worker: higher concurrency for I/O bound operations
  const ingestWorker = new Worker(QUEUE_NAMES.ingest, processIngestJob, {
    ...queueOptions,
    concurrency: 3
  });

  // Classification worker: limited concurrency to respect Groq rate limits
  // With 1.5s delay between requests and 3 concurrent workers = ~2 req/sec = ~120 req/min
  const classifyWorker = new Worker(QUEUE_NAMES.classify, processClassificationJob, {
    ...queueOptions,
    concurrency: 2,
    limiter: {
      max: 30,        // Max 30 jobs
      duration: 60000 // Per 60 seconds (1 minute)
    }
  });

  // Enrichment worker: limited concurrency to respect Groq rate limits
  const enrichWorker = new Worker(QUEUE_NAMES.enrich, processEnrichmentJob, {
    ...queueOptions,
    concurrency: 2,
    limiter: {
      max: 30,
      duration: 60000
    }
  });

  const communityAIWorker = new Worker(QUEUE_NAMES.communityAI, processCommunityAICommentJob, {
    ...queueOptions,
    concurrency: 2,
    limiter: {
      max: 20,
      duration: 60000
    }
  });

  // Multi-personality AI worker
  const multiPersonalityAIWorker = runMultiPersonalityAIWorker();

  // Push notification worker
  const pushNotificationWorker = createPushNotificationWorker();

  // Auto-ingest scheduler worker
  const autoIngestWorker = new Worker("auto-ingest-scheduler", async (job) => {
    const redis = createRedisClient();
    return processAutoIngestJob(job, {
      get: async (key: string) => redis.get(key),
      set: async (key: string, value: string) => { await redis.set(key, value); }
    });
  }, {
    ...queueOptions
  });

  autoIngestWorker.on("active", (job) => {
    logger.info({ jobId: job.id, queue: "auto-ingest-scheduler", name: job.name }, "Auto-ingest job started");
  });

  autoIngestWorker.on("completed", (job, result) => {
    logger.info({ jobId: job.id, queue: "auto-ingest-scheduler", name: job.name, result }, "Auto-ingest job completed");
  });

  autoIngestWorker.on("failed", (job, err) => {
    logger.error({ err, jobId: job?.id, queue: "auto-ingest-scheduler" }, "Auto-ingest job failed");
  });

  ingestWorker.on("active", (job) => {
    logger.info({ jobId: job.id, queue: QUEUE_NAMES.ingest, name: job.name }, "Job started");
  });

  ingestWorker.on("completed", (job, result) => {
    logger.info(
      { jobId: job.id, queue: QUEUE_NAMES.ingest, name: job.name, result },
      "Job completed"
    );
  });

  ingestWorker.on("failed", (job, err) => {
    logger.error({ err, jobId: job?.id, queue: QUEUE_NAMES.ingest }, "Job failed");
  });

  ingestWorker.on("error", (err) => {
    logger.error({ err, queue: QUEUE_NAMES.ingest }, "Worker error");
  });

  classifyWorker.on("active", (job) => {
    logger.info({ jobId: job.id, queue: QUEUE_NAMES.classify, name: job.name }, "Job started");
  });

  classifyWorker.on("completed", (job, result) => {
    logger.info({ jobId: job.id, queue: QUEUE_NAMES.classify, name: job.name, result }, "Job completed");
  });

  classifyWorker.on("failed", (job, err) => {
    logger.error({ err, jobId: job?.id, queue: QUEUE_NAMES.classify }, "Job failed");
  });

  classifyWorker.on("error", (err) => {
    logger.error({ err, queue: QUEUE_NAMES.classify }, "Worker error");
  });

  enrichWorker.on("active", (job) => {
    logger.info({ jobId: job.id, queue: QUEUE_NAMES.enrich, name: job.name }, "Job started");
  });

  enrichWorker.on("completed", (job, result) => {
    logger.info({ jobId: job.id, queue: QUEUE_NAMES.enrich, name: job.name, result }, "Job completed");
  });

  enrichWorker.on("failed", (job, err) => {
    logger.error({ err, jobId: job?.id, queue: QUEUE_NAMES.enrich }, "Job failed");
  });

  enrichWorker.on("error", (err) => {
    logger.error({ err, queue: QUEUE_NAMES.enrich }, "Worker error");
  });

  communityAIWorker.on("active", (job) => {
    logger.info({ jobId: job.id, queue: QUEUE_NAMES.communityAI, name: job.name }, "Job started");
  });

  communityAIWorker.on("completed", (job, result) => {
    logger.info({ jobId: job.id, queue: QUEUE_NAMES.communityAI, name: job.name, result }, "Job completed");
  });

  communityAIWorker.on("failed", (job, err) => {
    logger.error({ err, jobId: job?.id, queue: QUEUE_NAMES.communityAI }, "Job failed");
  });

  communityAIWorker.on("error", (err) => {
    logger.error({ err, queue: QUEUE_NAMES.communityAI }, "Worker error");
  });

  return {
    registeredQueues: [QUEUE_NAMES.ingest, QUEUE_NAMES.classify, QUEUE_NAMES.enrich, QUEUE_NAMES.communityAI, "multi-personality-ai", "auto-ingest-scheduler", "push-notifications"],
    timestamp: new Date().toISOString()
  };
}

async function startWorkers() {
  await connectServices();

  const redis = createRedisClient();
  try {
    await redis.set(WORKERS_HEARTBEAT_KEY, "1", "EX", WORKERS_HEARTBEAT_TTL_SECONDS);
  } catch (err) {
    logger.warn({ err }, "Worker heartbeat initial set failed");
  }

  const heartbeatTimer = setInterval(() => {
    redis
      .set(WORKERS_HEARTBEAT_KEY, "1", "EX", WORKERS_HEARTBEAT_TTL_SECONDS)
      .catch((err) => logger.warn({ err }, "Worker heartbeat update failed"));
  }, WORKERS_HEARTBEAT_INTERVAL_MS);
  heartbeatTimer.unref?.();

  const result = registerJobWorkers();

  // Initialize keywords if empty
  try {
    const existingKeywords = await getAllDynamicKeywords();
    if (existingKeywords.length === 0) {
      const { resetToDefaultKeywords } = await import("../services/keywordManagementService.js");
      await resetToDefaultKeywords();
      logger.info("Default keywords initialized");
    } else {
      logger.info({ count: existingKeywords.length }, "Keywords already initialized");
    }
  } catch (err) {
    logger.warn({ err }, "Failed to initialize keywords");
  }

  // Schedule automatic ingestion every 2 hours
  try {
    await scheduleAutoIngest("0 */2 * * *", 10);
    logger.info("Auto-ingest scheduler initialized (every 2 hours)");
  } catch (err) {
    logger.warn({ err }, "Failed to schedule auto-ingest");
  }

  // Initialize push notification jobs
  try {
    await initializePushNotificationJobs();
    logger.info("Push notification jobs initialized");
  } catch (err) {
    logger.warn({ err }, "Failed to initialize push notification jobs");
  }

  console.info(JSON.stringify(result, null, 2));
}

startWorkers().catch((error) => {
  logger.error({ err: error }, "Failed to start job workers");
  process.exit(1);
});
