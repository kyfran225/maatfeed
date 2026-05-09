import type { Job } from "bullmq";
import { ingestByKeyword, ingestConfiguredYoutubeChannels } from "../services/contentIngestionService.js";
import {
  getEnabledKeywords,
  type DynamicKeyword
} from "../services/keywordManagementService.js";
import { logger } from "../config/logger.js";

export interface AutoIngestJobPayload {
  keywords?: string[];
  limitPerProvider?: number;
  triggeredAt: string;
}

const LAST_USED_KEYWORDS_KEY = "maat:autoingest:last_keywords";

async function getLastUsedKeywords(redis: { get: (key: string) => Promise<string | null> }): Promise<string[]> {
  try {
    const stored = await redis.get(LAST_USED_KEYWORDS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return [];
}

async function storeLastUsedKeywords(
  redis: { set: (key: string, value: string) => Promise<void> },
  keywords: string[]
): Promise<void> {
  try {
    await redis.set(LAST_USED_KEYWORDS_KEY, JSON.stringify(keywords));
  } catch {
    // ignore
  }
}

export async function processAutoIngestJob(
  job: Job<AutoIngestJobPayload>,
  redis: { get: (key: string) => Promise<string | null>; set: (key: string, value: string) => Promise<void> }
) {
  const { keywords: explicitKeywords, limitPerProvider = 10, triggeredAt } = job.data;

  logger.info(
    { jobId: job.id, triggeredAt, explicitKeywords },
    "Auto-ingest job started"
  );

  let keywordsToUse: string[];

  if (explicitKeywords && explicitKeywords.length > 0) {
    // Use explicitly provided keywords
    keywordsToUse = explicitKeywords;
  } else {
    // Get enabled dynamic keywords and rotate
    const enabledKeywords = await getEnabledKeywords();
    const lastUsed = await getLastUsedKeywords(redis);
    
    // Filter out recently used keywords
    const available = enabledKeywords.filter(
      (k) => !lastUsed.includes(k.keyword)
    );
    
    // Select 2 random keywords (or from all if all were recently used)
    const pool = available.length >= 2 ? available : enabledKeywords;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 2);
    
    keywordsToUse = selected.map((k) => k.keyword);

    // Store for next rotation
    await storeLastUsedKeywords(redis, keywordsToUse);

    logger.info(
      { selected: keywordsToUse, totalEnabled: enabledKeywords.length },
      "Auto-ingest keyword rotation"
    );
  }

  const results = await Promise.allSettled(
    keywordsToUse.map(async (kw) => {
      const startTime = Date.now();
      const result = await ingestByKeyword({ keyword: kw, limitPerProvider });
      const duration = Date.now() - startTime;

      return {
        ...result,
        durationMs: duration,
        keywordUsed: kw
      };
    })
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
  const failed = results.filter((r) => r.status === "rejected").map((r) => (r as PromiseRejectedResult).reason);
  const channelResult = await ingestConfiguredYoutubeChannels();

  const totalPersisted = succeeded.reduce((sum, r) => sum + r.counts.persisted, 0);
  const totalYouTube = succeeded.reduce((sum, r) => sum + r.counts.youtube, 0);
  const totalTikTok = succeeded.reduce((sum, r) => sum + r.counts.tiktok, 0);
  const channelPersisted = channelResult.counts.persisted;
  const channelYouTube = channelResult.counts.youtube;

  logger.info(
    {
      jobId: job.id,
      keywordsUsed: keywordsToUse,
      totalPersisted: totalPersisted + channelPersisted,
      totalYouTube: totalYouTube + channelYouTube,
      totalTikTok,
      channelIngestion: channelResult.counts,
      succeeded: succeeded.length,
      failed: failed.length,
      failures: failed.map((f) => f?.message || String(f))
    },
    "Auto-ingest job completed"
  );

  return {
    success: failed.length === 0,
    keywordsUsed: keywordsToUse,
    totalPersisted: totalPersisted + channelPersisted,
    totalYouTube: totalYouTube + channelYouTube,
    totalTikTok,
    channelIngestion: {
      persisted: channelPersisted,
      youtube: channelYouTube,
      channels: channelResult.counts.channels,
      failures: channelResult.failures ?? []
    },
    results: succeeded.map((r) => ({
      keyword: r.keyword,
      persisted: r.counts.persisted,
      youtube: r.counts.youtube,
      tiktok: r.counts.tiktok,
      contentIds: r.contentIds
    })),
    errors: failed.map((f) => f?.message || String(f))
  };
}
