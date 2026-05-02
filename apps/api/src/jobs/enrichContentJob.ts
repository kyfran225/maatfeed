import type { Job } from "bullmq";
import { logger } from "../config/logger.js";
import { enrichContentStep, failContent } from "../services/contentProcessingService.js";

export type EnrichJobPayload = {
  contentId: string;
};

function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes("429") || msg.includes("rate limit") || msg.includes("too many requests");
  }
  return false;
}

export async function processEnrichmentJob(job: Job<EnrichJobPayload>) {
  try {
    return await enrichContentStep({ contentId: job.data.contentId });
  } catch (error) {
    const maxAttempts = job.opts.attempts ?? 1;
    const attemptNumber = job.attemptsMade + 1;
    const isFinalAttempt = attemptNumber >= maxAttempts;

    // Log rate limit errors differently
    if (isRateLimitError(error)) {
      logger.warn(
        { jobId: job.id, contentId: job.data.contentId, attempt: attemptNumber, maxAttempts },
        "Rate limit hit during enrichment, will retry"
      );
    }

    if (isFinalAttempt) {
      await failContent({ contentId: job.data.contentId });
    }
    throw error;
  }
}
