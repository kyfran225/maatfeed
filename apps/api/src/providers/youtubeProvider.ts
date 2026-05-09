import { env } from "../config/env.js";
import type { IngestionSourceItem } from "./providerTypes.js";

const baseUrl = "https://www.googleapis.com/youtube/v3";

export async function searchVideos(keyword: string, limit = 20): Promise<IngestionSourceItem[]> {
  if (!env.YOUTUBE_API_KEY) {
    throw new Error("YOUTUBE_API_KEY is not configured.");
  }

  const urlBase = env.YOUTUBE_API_BASE_URL ? env.YOUTUBE_API_BASE_URL : `${baseUrl}/search`;
  const searchUrl = new URL(urlBase);
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("q", keyword);
  searchUrl.searchParams.set("maxResults", String(limit));
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("key", env.YOUTUBE_API_KEY);

  const searchResponse = await fetch(searchUrl);

  if (!searchResponse.ok) {
    throw new Error(`YouTube search failed with status ${searchResponse.status}.`);
  }

  const searchPayload = (await searchResponse.json()) as {
    items: Array<{
      id: { videoId: string };
      snippet: {
        title: string;
        description: string;
        channelTitle: string;
        thumbnails?: { high?: { url: string }; default?: { url: string } };
      };
    }>;
  };

  return searchPayload.items.map((item) => ({
    externalId: item.id.videoId,
    canonicalUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    mediaType: "video",
    mediaUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    thumbnailUrl: item.snippet.thumbnails?.high?.url ?? item.snippet.thumbnails?.default?.url,
    title: item.snippet.title,
    description: item.snippet.description,
    creatorName: item.snippet.channelTitle,
    tags: [keyword]
  }));
}

export async function searchChannelVideos(channelId: string, limit = 10): Promise<IngestionSourceItem[]> {
  if (!env.YOUTUBE_API_KEY) {
    throw new Error("YOUTUBE_API_KEY is not configured.");
  }

  const urlBase = env.YOUTUBE_API_BASE_URL ? env.YOUTUBE_API_BASE_URL : `${baseUrl}/search`;
  const searchUrl = new URL(urlBase);
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("channelId", channelId);
  searchUrl.searchParams.set("maxResults", String(limit));
  searchUrl.searchParams.set("order", "date");
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("key", env.YOUTUBE_API_KEY);

  const searchResponse = await fetch(searchUrl);

  if (!searchResponse.ok) {
    throw new Error(`YouTube channel search failed with status ${searchResponse.status}.`);
  }

  const searchPayload = (await searchResponse.json()) as {
    items: Array<{
      id: { videoId: string };
      snippet: {
        title: string;
        description: string;
        channelTitle: string;
        thumbnails?: { high?: { url: string }; default?: { url: string } };
      };
    }>;
  };

  return searchPayload.items.map((item) => ({
    externalId: item.id.videoId,
    canonicalUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    mediaType: "video",
    mediaUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    thumbnailUrl: item.snippet.thumbnails?.high?.url ?? item.snippet.thumbnails?.default?.url,
    title: item.snippet.title,
    description: item.snippet.description,
    creatorName: item.snippet.channelTitle,
    tags: ["youtube-channel", channelId]
  }));
}
