import { env } from "../config/env.js";
import type { IngestionSourceItem } from "./providerTypes.js";

export async function searchPosts(keyword: string, limit = 20): Promise<IngestionSourceItem[]> {
  if (!env.TIKTOK_PROVIDER_BASE_URL) {
    throw new Error("TIKTOK_PROVIDER_BASE_URL is not configured.");
  }

  if (!env.APIFY_API_TOKEN) {
    throw new Error("APIFY_API_TOKEN is not configured.");
  }

  const url = new URL(env.TIKTOK_PROVIDER_BASE_URL);
  url.searchParams.set("token", env.APIFY_API_TOKEN);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      searchQueries: [keyword],
      resultsPerPage: limit,
      maxItems: limit,
      shouldDownloadVideos: false,
      shouldDownloadCovers: false,
      proxy: {
        useApifyProxy: true
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `TikTok provider failed with status ${response.status}.${errorBody ? ` Body: ${errorBody}` : ""}`
    );
  }

  const payload = (await response.json()) as Array<Record<string, unknown>>;

  return payload.slice(0, limit).map((item) => {
    const id = String(item.id ?? item.itemId ?? item.postId ?? "");
    const canonicalUrl = String(item.webVideoUrl ?? item.url ?? item.shareUrl ?? "");
    const title = String(item.text ?? item.desc ?? "").slice(0, 120);
    const description = String(item.text ?? item.desc ?? "");
    const creatorName = String(
      (item.authorMeta as { name?: unknown } | undefined)?.name ??
        (item.author as { nickname?: unknown } | undefined)?.nickname ??
        item.authorName ??
        ""
    );

    const videoUrl = String(
      (item.videoUrls as unknown[] | undefined)?.[0] ??
        (item.videoUrl as unknown) ??
        (item.video as { url?: unknown } | undefined)?.url ??
        canonicalUrl
    );

    const thumbnailUrl =
      typeof item.coverUrl === "string"
        ? item.coverUrl
        : typeof item.thumbnailUrl === "string"
          ? item.thumbnailUrl
          : undefined;

    // Fix: hashtags from Apify can be objects with 'name' property, not just strings
    let tags: string[] = [keyword];
    if (Array.isArray(item.hashtags)) {
      tags = item.hashtags.map((tag: any) => {
        // If tag is an object with 'name' property (Apify format), extract it
        if (tag && typeof tag === 'object' && tag.name) {
          return String(tag.name).replace(/^#/, '');
        }
        // Otherwise convert to string
        return String(tag).replace(/^#/, '');
      }).filter((tag: string) => tag && tag !== '[object Object]' && tag.length > 0);
    }

    // Fallback if no valid tags extracted
    if (tags.length === 0) {
      tags = [keyword];
    }

    return {
      externalId: id || canonicalUrl,
      canonicalUrl,
      mediaType: "video",
      mediaUrl: videoUrl,
      thumbnailUrl,
      title: title || keyword,
      description,
      creatorName: creatorName || "unknown",
      tags
    } satisfies IngestionSourceItem;
  });
}
