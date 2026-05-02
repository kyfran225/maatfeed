import type { Job } from "bullmq";
import { ingestByKeyword } from "../services/contentIngestionService.js";

export type IngestJobPayload = {
  keyword: string;
  limitPerProvider?: number;
};

export async function processIngestJob(job: Job<IngestJobPayload>) {
  return ingestByKeyword({
    keyword: job.data.keyword,
    limitPerProvider: job.data.limitPerProvider
  });
}
