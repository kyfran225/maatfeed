import { Queue, Worker, type Job } from "bullmq";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

// Redis connection for BullMQ
const redisConnection = {
  url: env.REDIS_URL
};
import {
  sendReviewDueNotifications,
  sendReplyNotification,
  sendTrendingContentNotification,
  cleanupExpiredSubscriptions
} from "../services/pushTriggerService.js";

// Queue for push notification jobs
export const pushNotificationQueue = new Queue("push-notifications", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 60000 // 1 minute
    },
    removeOnComplete: 100,
    removeOnFail: 50
  }
});

// Job types
type PushJobType =
  | "review-due-batch"
  | "reply-notification"
  | "trending-notification"
  | "cleanup-subscriptions";

interface PushJobData {
  type: PushJobType;
  [key: string]: unknown;
}

// Worker to process push notification jobs
export const pushNotificationWorker = new Worker<PushJobData>(
  "push-notifications",
  async (job: Job<PushJobData>) => {
    const { type, ...data } = job.data;

    logger.info({ msg: "Processing push notification job", jobId: job.id, type });

    switch (type) {
      case "review-due-batch":
        return await sendReviewDueNotifications();

      case "reply-notification": {
        const { parentCommentId, replyAuthorName, replyContent } = data as {
          parentCommentId: string;
          replyAuthorName: string;
          replyContent: string;
        };
        return await sendReplyNotification(parentCommentId, replyAuthorName, replyContent);
      }

      case "trending-notification": {
        const { contentId, trendingScore } = data as {
          contentId: string;
          trendingScore: number;
        };
        return await sendTrendingContentNotification(contentId, trendingScore);
      }

      case "cleanup-subscriptions":
        return await cleanupExpiredSubscriptions();

      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  },
  { connection: redisConnection }
);

// Worker event handlers
pushNotificationWorker.on("completed", (job) => {
  logger.info({
    msg: "Push notification job completed",
    jobId: job.id,
    type: job.data.type,
    result: job.returnvalue
  });
});

pushNotificationWorker.on("failed", (job, err) => {
  logger.error({
    msg: "Push notification job failed",
    jobId: job?.id,
    type: job?.data.type,
    error: err.message
  });
});

// Job scheduling functions

/**
 * Schedule periodic review due notifications (runs every 15 minutes)
 */
export async function scheduleReviewDueJob(): Promise<void> {
  // Remove existing repeatable job if any
  const repeatables = await pushNotificationQueue.getRepeatableJobs();
  const existing = repeatables.find((r) => r.name === "review-due-batch");
  if (existing) {
    await pushNotificationQueue.removeRepeatableByKey(existing.key);
  }

  // Add new repeatable job
  await pushNotificationQueue.add(
    "review-due-batch",
    { type: "review-due-batch" },
    {
      repeat: {
        pattern: "*/15 * * * *" // Every 15 minutes
      },
      jobId: "review-due-periodic"
    }
  );

  logger.info({ msg: "Scheduled review due notification job" });
}

/**
 * Queue a reply notification
 */
export async function queueReplyNotification(
  parentCommentId: string,
  replyAuthorName: string,
  replyContent: string
): Promise<void> {
  await pushNotificationQueue.add(
    "reply-notification",
    {
      type: "reply-notification",
      parentCommentId,
      replyAuthorName,
      replyContent
    },
    {
      delay: 5000, // 5 second delay to batch potential multiple replies
      attempts: 2
    }
  );
}

/**
 * Queue a trending content notification
 */
export async function queueTrendingNotification(
  contentId: string,
  trendingScore: number
): Promise<void> {
  // Only queue if trending score is high enough
  if (trendingScore < 100) return;

  await pushNotificationQueue.add(
    "trending-notification",
    {
      type: "trending-notification",
      contentId,
      trendingScore
    },
    {
      delay: 30000, // 30 second delay to avoid spam
      attempts: 2,
      jobId: `trending-${contentId}` // Deduplication
    }
  );
}

/**
 * Schedule periodic cleanup of expired subscriptions (runs daily)
 */
export async function scheduleSubscriptionCleanupJob(): Promise<void> {
  const repeatables = await pushNotificationQueue.getRepeatableJobs();
  const existing = repeatables.find((r) => r.name === "cleanup-subscriptions");
  if (existing) {
    await pushNotificationQueue.removeRepeatableByKey(existing.key);
  }

  await pushNotificationQueue.add(
    "cleanup-subscriptions",
    { type: "cleanup-subscriptions" },
    {
      repeat: {
        pattern: "0 3 * * *" // Daily at 3 AM
      },
      jobId: "cleanup-periodic"
    }
  );

  logger.info({ msg: "Scheduled subscription cleanup job" });
}

/**
 * Initialize all push notification jobs
 */
export async function initializePushNotificationJobs(): Promise<void> {
  try {
    await scheduleReviewDueJob();
    await scheduleSubscriptionCleanupJob();
    logger.info({ msg: "Push notification jobs initialized successfully" });
  } catch (error) {
    logger.error({
      msg: "Failed to initialize push notification jobs",
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}
