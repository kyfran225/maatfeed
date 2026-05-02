import { createRawContent } from "../repositories/contentRepository.js";
import type { IngestionSourceItem } from "../providers/providerTypes.js";
import { searchPosts } from "../providers/tiktokProvider.js";
import { searchVideos } from "../providers/youtubeProvider.js";
import { logger } from "../config/logger.js";
import { classifyQueue } from "../queues/classifyQueue.js";

export type IngestionProvider = "youtube" | "tiktok";

export async function ingestByKeyword(input: { keyword: string; limitPerProvider?: number }) {
  const limit = input.limitPerProvider ?? 15;
  const keyword = input.keyword;

  const providerResults = await Promise.allSettled([
    searchVideos(keyword, limit),
    searchPosts(keyword, limit)
  ]);

  const items: Array<{ provider: IngestionProvider; value: IngestionSourceItem }> = [];

  const youtube = providerResults[0];
  if (youtube.status === "fulfilled") {
    logger.info({ keyword, provider: "youtube", count: youtube.value.length }, "Ingestion provider results");
    const youtubeItems: Array<{ provider: IngestionProvider; value: IngestionSourceItem }> = youtube.value.map((value) => ({
      provider: "youtube",
      value
    }));
    items.push(...youtubeItems);
  } else {
    logger.warn({ err: youtube.reason, keyword, provider: "youtube" }, "Ingestion provider failed");
  }

  const tiktok = providerResults[1];
  if (tiktok.status === "fulfilled") {
    logger.info({ keyword, provider: "tiktok", count: tiktok.value.length }, "Ingestion provider results");
    const tiktokItems: Array<{ provider: IngestionProvider; value: IngestionSourceItem }> = tiktok.value.map((value) => ({
      provider: "tiktok",
      value
    }));
    items.push(...tiktokItems);
  } else {
    logger.warn({ err: tiktok.reason, keyword, provider: "tiktok" }, "Ingestion provider failed");
  }

  logger.info(
    {
      keyword,
      requestedLimitPerProvider: limit,
      counts: {
        youtube: items.filter((item) => item.provider === "youtube").length,
        tiktok: items.filter((item) => item.provider === "tiktok").length
      }
    },
    "Ingestion collected items"
  );

  const persisted = await Promise.all(
    items.map(({ provider, value }) =>
      createRawContent({
        sourceProvider: provider,
        externalId: value.externalId,
        canonicalUrl: value.canonicalUrl,
        mediaType: value.mediaType,
        mediaUrl: value.mediaUrl,
        thumbnailUrl: value.thumbnailUrl,
        title: value.title,
        description: value.description,
        creatorName: value.creatorName,
        transcript: value.transcript,
        tags: value.tags
      })
    )
  );

  await Promise.all(
    persisted.map((doc) =>
      classifyQueue.add(
        "classify:content",
        { contentId: doc._id.toString() },
        {
          attempts: 5,
          backoff: { type: "exponential", delay: 10_000 },
          removeOnComplete: 200,
          removeOnFail: 500
        }
      )
    )
  );

  return {
    keyword,
    requestedLimitPerProvider: limit,
    counts: {
      persisted: persisted.length,
      youtube: items.filter((item) => item.provider === "youtube").length,
      tiktok: items.filter((item) => item.provider === "tiktok").length
    },
    contentIds: persisted.map((doc) => doc._id.toString())
  };
}
