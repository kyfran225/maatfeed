import { getJson, postJson } from "./httpClient";

export type DiscussionAnalyticsEventName =
  | "discussion_sort_selected"
  | "discussion_reply_opened"
  | "discussion_reply_mode_selected"
  | "discussion_reply_submitted";

export interface DiscussionAnalyticsMetadata {
  surface?: "debate_detail";
  sortBy?: "relevant" | "newest" | "popular" | "debated";
  replyMode?: "flat" | "nested";
  targetType?: "comment" | "flat_reply" | "nested_reply";
  targetId?: string;
  parentCommentId?: string;
}

export interface DiscussionAnalyticsSummary {
  totals: {
    events: number;
    sortSelections: number;
    replyOpens: number;
    replyModeSelections: number;
    replySubmissions: number;
  };
  sortSelections: Record<string, number>;
  replyOpens: Record<string, number>;
  replyModeSelections: Record<string, number>;
  replySubmissions: Record<string, number>;
  modeConversion: Record<string, { selected: number; submitted: number; conversionRate: number }>;
}

export async function trackDiscussionAnalyticsEvent(
  contentId: string,
  eventName: DiscussionAnalyticsEventName,
  metadata?: DiscussionAnalyticsMetadata
) {
  return postJson<{ success: boolean; data: { tracked: boolean; eventName: DiscussionAnalyticsEventName } }>(
    "/api/community/analytics",
    {
      contentId,
      eventName,
      metadata
    }
  );
}

export async function getDiscussionAnalyticsSummary(contentId: string): Promise<DiscussionAnalyticsSummary> {
  const response = await getJson<{ success: boolean; data: DiscussionAnalyticsSummary }>(
    `/api/community/debates/${contentId}/interaction-analytics`
  );

  return response.data;
}

export function fireAndForgetDiscussionAnalyticsEvent(
  contentId: string,
  eventName: DiscussionAnalyticsEventName,
  metadata?: DiscussionAnalyticsMetadata
) {
  void trackDiscussionAnalyticsEvent(contentId, eventName, metadata).catch((error) => {
    console.debug("Discussion analytics tracking skipped:", error);
  });
}
