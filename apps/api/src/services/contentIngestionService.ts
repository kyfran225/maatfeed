import { createRawContent } from "../repositories/contentRepository.js";
import type { IngestionSourceItem } from "../providers/providerTypes.js";
import { searchPosts } from "../providers/tiktokProvider.js";
import { searchChannelVideos, searchVideos } from "../providers/youtubeProvider.js";
import { logger } from "../config/logger.js";
import { classifyQueue } from "../queues/classifyQueue.js";
import { env } from "../config/env.js";

export type IngestionProvider = "youtube" | "tiktok";

function splitList(input: string) {
  return input
    .split(/[\r\n,]+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

async function persistAndQueue(items: Array<{ provider: IngestionProvider; value: IngestionSourceItem }>) {
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

  return persisted;
}

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

  const persisted = await persistAndQueue(items);

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

export async function ingestConfiguredYoutubeChannels(input: {
  channelIds?: string[];
  limitPerChannel?: number;
} = {}) {
  const channelIds = input.channelIds?.length
    ? input.channelIds
    : splitList(env.YOUTUBE_CHANNEL_IDS);
  const limit = input.limitPerChannel ?? env.WORKER_AUTO_INGEST_CHANNEL_LIMIT_PER_CHANNEL;

  if (channelIds.length === 0) {
    return {
      requestedLimitPerChannel: limit,
      counts: {
        persisted: 0,
        youtube: 0,
        channels: 0
      },
      contentIds: [],
      failures: []
    };
  }

  const settled = await Promise.allSettled(
    channelIds.map(async (channelId) => ({
      channelId,
      items: await searchChannelVideos(channelId, limit)
    }))
  );

  const items: Array<{ provider: IngestionProvider; value: IngestionSourceItem }> = [];
  const failures: Array<{ channelId: string; error: string }> = [];

  settled.forEach((result, index) => {
    const channelId = channelIds[index] ?? "unknown";
    if (result.status === "fulfilled") {
      logger.info(
        { channelId: result.value.channelId, count: result.value.items.length },
        "YouTube channel ingestion results"
      );
      items.push(...result.value.items.map((value) => ({ provider: "youtube" as const, value })));
      return;
    }

    failures.push({
      channelId,
      error: result.reason instanceof Error ? result.reason.message : String(result.reason)
    });
    logger.warn({ channelId, err: result.reason }, "YouTube channel ingestion failed");
  });

  const persisted = await persistAndQueue(items);

  return {
    requestedLimitPerChannel: limit,
    counts: {
      persisted: persisted.length,
      youtube: items.length,
      channels: channelIds.length
    },
    contentIds: persisted.map((doc) => doc._id.toString()),
    failures
  };
}
