import { getJson } from "./httpClient";

export interface FeedResponse {
  items: Array<{
    id: string;
    title: string;
    description: string;
    mediaUrl: string;
    thumbnailUrl?: string;
    mediaType: "video" | "audio";
    creator: {
      name: string;
      handle: string;
    };
    sourceProvider: "youtube" | "tiktok" | "internal" | "community";
    bucket: "viral" | "educational" | "deep";
    scores: {
      likes: number;
      comments: number;
      views: number;
      finalScore: number;
    };
    community?: {
      isTrending?: boolean;
      isActiveDiscussion?: boolean;
      hasDebateThread?: boolean;
      participantCount?: number;
      discussionState?: "idle" | "active" | "ready" | "debate";
      ctaKind?: "join_discussion" | "start_debate" | "join_debate" | null;
      ctaLabel?: string | null;
    };
    createdAt: string;
    transcript: string;
    summary: string;
    tags: string[];
  }>;
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
}

export interface FeedParams {
  cursor?: string | null;
  limit?: number;
}

export async function getGlobalFeed(params?: FeedParams): Promise<FeedResponse> {
  const searchParams = new URLSearchParams();
  if (params?.cursor) searchParams.set("cursor", params.cursor);
  if (params?.limit) searchParams.set("limit", params.limit.toString());

  const url = `/api/feed/global${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const response = await getJson<{ data: FeedResponse }>(url);
  return response.data;
}

export async function getPersonalizedFeed(params?: FeedParams): Promise<FeedResponse> {
  const searchParams = new URLSearchParams();
  if (params?.cursor) searchParams.set("cursor", params.cursor);
  if (params?.limit) searchParams.set("limit", params.limit.toString());

  const url = `/api/feed/personalized${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const response = await getJson<{ data: FeedResponse }>(url);
  return response.data;
}

export async function getSessionFeed(): Promise<any> {
  return getJson("/api/feed/session");
}
