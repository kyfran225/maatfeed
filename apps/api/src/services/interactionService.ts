import { createInteraction, deleteInteraction, aggregateEngagement } from "../repositories/interactionRepository.js";
import { invalidateFeedCache } from "./feedService.js";
import { computeContentScore } from "./scoringService.js";
import { ContentModel } from "../models/Content.js";
import { updateCommunityProfileSignals } from "./communityScoreService.js";
import { InteractionModel } from "../models/Interaction.js";

export type DiscussionAnalyticsEventName =
  | "discussion_sort_selected"
  | "discussion_reply_opened"
  | "discussion_reply_mode_selected"
  | "discussion_reply_submitted";

async function isFeedContent(contentId: string): Promise<boolean> {
  const content = await ContentModel.exists({ _id: contentId });
  return !!content;
}

export async function recordLike(input: { 
  contentId: string; 
  userId?: string; 
  sessionId?: string;
}) {
  // Only implement toggle logic for authenticated users
  if (!input.userId) {
    // For anonymous users, keep the old behavior (always add)
    await createInteraction({
      userId: null,
      contentId: input.contentId,
      actionType: "like",
      sessionId: input.sessionId ?? null
    });

    // Update content score
    await computeContentScore({ contentId: input.contentId });

    // Invalidate relevant caches
    await invalidateFeedCache(input.contentId, input.userId);
    return;
  }

  // Check if user has already liked this content
  const hasLiked = await deleteInteraction(input.contentId, input.userId, "like");
  
  if (!hasLiked) {
    // User hasn't liked yet, so add the like
    await createInteraction({
      userId: input.userId,
      contentId: input.contentId,
      actionType: "like",
      sessionId: input.sessionId ?? null
    });

    // Update user interests when liking
    const { onInteractionUpdate } = await import("./profileService.js");
    await onInteractionUpdate(input.userId, input.contentId, "like");
  }
  // If hasLiked is true, the interaction was deleted (unlike)
  // No need to update user interests for unlike

  // Update content score regardless of like/unlike
  await computeContentScore({ contentId: input.contentId });

  // Invalidate relevant caches
  await invalidateFeedCache(input.contentId, input.userId);
}

export async function recordSave(input: { 
  contentId: string; 
  userId?: string; 
  sessionId?: string;
}) {
  // Create the interaction
  await createInteraction({
    userId: input.userId ?? null,
    contentId: input.contentId,
    actionType: "save",
    sessionId: input.sessionId ?? null
  });

  // Update content score
  await computeContentScore({ contentId: input.contentId });

  // Update user interests if authenticated user
  if (input.userId) {
    const { onInteractionUpdate } = await import("./profileService.js");
    await onInteractionUpdate(input.userId, input.contentId, "save");
  }

  // Invalidate relevant caches
  await invalidateFeedCache(input.contentId, input.userId);
}

export async function recordShare(input: { 
  contentId: string; 
  userId?: string; 
  sessionId?: string;
}) {
  // Create the interaction
  await createInteraction({
    userId: input.userId ?? null,
    contentId: input.contentId,
    actionType: "share",
    sessionId: input.sessionId ?? null
  });

  // Update content score
  await computeContentScore({ contentId: input.contentId });

  // Update user interests if authenticated user
  if (input.userId) {
    const { onInteractionUpdate } = await import("./profileService.js");
    await onInteractionUpdate(input.userId, input.contentId, "share");
  }

  // Invalidate relevant caches
  await invalidateFeedCache(input.contentId, input.userId);
}

export async function recordWatch(input: { 
  contentId: string; 
  userId?: string; 
  sessionId?: string;
  watchDurationMs: number;
  completionRatio: number;
}) {
  // Create the interaction
  await createInteraction({
    userId: input.userId ?? null,
    contentId: input.contentId,
    actionType: "view",
    watchDurationMs: input.watchDurationMs,
    completionRatio: input.completionRatio,
    sessionId: input.sessionId ?? null
  });

  // Update content score (views affect ranking)
  await computeContentScore({ contentId: input.contentId });

  // Update user interests if authenticated user and significant completion
  if (input.userId && input.completionRatio > 0.5) {
    const { onInteractionUpdate } = await import("./profileService.js");
    await onInteractionUpdate(input.userId, input.contentId, "view");
  }

  // Invalidate relevant caches
  await invalidateFeedCache(input.contentId, input.userId);
}

export async function recordComment(input: { 
  contentId: string; 
  userId?: string; 
  sessionId?: string;
}) {
  // Create the interaction
  await createInteraction({
    userId: input.userId ?? null,
    contentId: input.contentId,
    actionType: "comment",
    sessionId: input.sessionId ?? null
  });

  if (await isFeedContent(input.contentId)) {
    await computeContentScore({ contentId: input.contentId });
  }

  // Update user interests if authenticated user
  if (input.userId) {
    const { onInteractionUpdate } = await import("./profileService.js");
    await onInteractionUpdate(input.userId, input.contentId, "comment");
  }

  // Invalidate relevant caches
  await invalidateFeedCache(input.contentId, input.userId);
}

export async function recordReply(input: { 
  contentId: string; 
  userId?: string; 
  sessionId?: string;
}) {
  // Create the interaction
  await createInteraction({
    userId: input.userId ?? null,
    contentId: input.contentId,
    actionType: "reply",
    sessionId: input.sessionId ?? null
  });

  if (await isFeedContent(input.contentId)) {
    await computeContentScore({ contentId: input.contentId });
  }

  // Invalidate relevant caches
  await invalidateFeedCache(input.contentId, input.userId);
}

export async function recordCommunityInteraction(input: {
  contentId: string;
  userId?: string;
  sessionId?: string;
  type: "comment" | "like" | "report" | "reply";
  analysis?: {
    debateScore?: number;
    questionScore?: number;
  };
}) {
  await createInteraction({
    userId: input.userId ?? null,
    contentId: input.contentId,
    actionType: input.type,
    sessionId: input.sessionId ?? null
  });

  if (input.userId) {
    await updateCommunityProfileSignals(input.userId, {
      debateIncrement: input.analysis?.debateScore ?? 0,
      educationIncrement: input.analysis?.questionScore ?? 0,
      contributionsIncrement: input.type === "report" ? 0 : 1,
      reportsIncrement: input.type === "report" ? 1 : 0
    });
  }

  if (await isFeedContent(input.contentId)) {
    await invalidateFeedCache(input.contentId, input.userId);
  }
}

export async function recordCommunityAnalyticsEvent(input: {
  contentId: string;
  eventName: DiscussionAnalyticsEventName;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}) {
  await createInteraction({
    userId: input.userId ?? null,
    contentId: input.contentId,
    actionType: input.eventName,
    sessionId: input.sessionId ?? null,
    metadata: input.metadata ?? null
  });
}

export async function getCommunityAnalyticsSummary(contentId: string) {
  const relevantEvents: DiscussionAnalyticsEventName[] = [
    "discussion_sort_selected",
    "discussion_reply_opened",
    "discussion_reply_mode_selected",
    "discussion_reply_submitted"
  ];

  const events = await InteractionModel.find({
    contentId,
    actionType: { $in: relevantEvents }
  })
    .select("actionType metadata createdAt")
    .lean();

  const sortSelections: Record<string, number> = {};
  const replyOpens: Record<string, number> = {};
  const replySubmissions: Record<string, number> = {};

  for (const event of events) {
    const metadata = (event as { metadata?: Record<string, unknown> | null }).metadata || {};
    const sortBy = typeof metadata.sortBy === "string" ? metadata.sortBy : "unknown";
    const replyMode = typeof metadata.replyMode === "string" ? metadata.replyMode : "unknown";
    const targetType = typeof metadata.targetType === "string" ? metadata.targetType : "unknown";

    switch (event.actionType) {
      case "discussion_sort_selected":
        sortSelections[sortBy] = (sortSelections[sortBy] || 0) + 1;
        break;
      case "discussion_reply_opened":
        replyOpens[targetType] = (replyOpens[targetType] || 0) + 1;
        break;
      case "discussion_reply_mode_selected":
        break;
      case "discussion_reply_submitted":
        replySubmissions[targetType !== "unknown" ? targetType : replyMode] =
          (replySubmissions[targetType !== "unknown" ? targetType : replyMode] || 0) + 1;
        break;
      default:
        break;
    }
  }

  const modeConversion = Object.fromEntries(
    Array.from(new Set([...Object.keys(replyOpens), ...Object.keys(replySubmissions)])).map((mode) => {
      const selected = replyOpens[mode] || 0;
      const submitted = replySubmissions[mode] || 0;
      return [
        mode,
        {
          selected,
          submitted,
          conversionRate: selected > 0 ? Number((submitted / selected).toFixed(4)) : 0
        }
      ];
    })
  );

  return {
    totals: {
      events: events.length,
      sortSelections: Object.values(sortSelections).reduce((sum, value) => sum + value, 0),
      replyOpens: Object.values(replyOpens).reduce((sum, value) => sum + value, 0),
      replyModeSelections: 0,
      replySubmissions: Object.values(replySubmissions).reduce((sum, value) => sum + value, 0)
    },
    sortSelections,
    replyOpens,
    replyModeSelections: {},
    replySubmissions,
    modeConversion
  };
}

export async function getContentEngagement(contentId: string, userId?: string) {
  return aggregateEngagement(contentId, userId);
}

export async function batchUpdateContentScores(contentIds: string[]) {
  const results = [];
  
  for (const contentId of contentIds) {
    try {
      await computeContentScore({ contentId });
      results.push({ contentId, status: "ok" });
    } catch (error) {
      results.push({ contentId, status: "error", error: String(error) });
    }
  }

  return results;
}

export async function invalidateUserFeedCaches(userIds: string[]) {
  const { invalidateCacheKeys } = await import("./cacheService.js");
  const { redisKeys } = await import("@maat/shared");
  
  const keysToInvalidate = userIds.map(userId => redisKeys.userFeed(userId));
  await invalidateCacheKeys(keysToInvalidate);
}

export async function invalidateGlobalFeedCache() {
  const { invalidateCacheKeys } = await import("./cacheService.js");
  const { redisKeys } = await import("@maat/shared");
  
  await invalidateCacheKeys([redisKeys.globalFeed]);
}
