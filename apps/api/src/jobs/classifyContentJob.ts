import type { Job } from "bullmq";
import { logger } from "../config/logger.js";
import { classifyContentStep, failContent } from "../services/contentProcessingService.js";
import { enrichQueue } from "../queues/enrichQueue.js";

export type ClassifyJobPayload = {
  contentId: string;
};

function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes("429") || msg.includes("rate limit") || msg.includes("too many requests");
  }
  return false;
}

export async function processClassificationJob(job: Job<ClassifyJobPayload>) {
  try {
    const result = await classifyContentStep({ contentId: job.data.contentId });
    if (result.status === "ok") {
      await enrichQueue.add(
        "enrich:content",
        { contentId: job.data.contentId },
        {
          attempts: 5,
          backoff: { type: "exponential", delay: 10_000 },
          removeOnComplete: 200,
          removeOnFail: 500
        }
      );
    }
    return result;
  } catch (error) {
    const maxAttempts = job.opts.attempts ?? 1;
    const attemptNumber = job.attemptsMade + 1;
    const isFinalAttempt = attemptNumber >= maxAttempts;

    // Log rate limit errors differently
    if (isRateLimitError(error)) {
      logger.warn(
        { jobId: job.id, contentId: job.data.contentId, attempt: attemptNumber, maxAttempts },
        "Rate limit hit, will retry"
      );
    }

    if (isFinalAttempt) {
      await failContent({ contentId: job.data.contentId });
    }
    throw error;
  }
}
