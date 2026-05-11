import { Job } from "bullmq";
import { feedService } from "../services/feedService.js";
import { invalidateCachePattern } from "../services/cacheService.js";
import { redisKeys } from "@maat/shared";

export interface RefreshFeedCacheJobData {
  type?: "global" | "user" | "session" | "all";
  userId?: string;
  sessionId?: string;
  contentId?: string;
  reason?: "interaction" | "new_content" | "score_update" | "scheduled" | "admin_triggered";
}

export async function processRefreshFeedCacheJob(job: Job<RefreshFeedCacheJobData>) {
  const { type = "all", userId, sessionId, contentId, reason } = job.data;
  
  console.log(`Processing feed cache refresh job: ${type}`, {
    userId,
    sessionId,
    contentId,
    reason
  });

  try {
    switch (type) {
      case "global":
        await feedService.getGlobalFeed();
        break;
        
      case "user":
        if (userId) {
          await feedService.getPersonalizedFeed(userId);
          console.log(`Invalidated user feed cache for user: ${userId}`);
        }
        break;
        
      case "session":
        if (sessionId) {
          const sessionKey = redisKeys.sessionFeed(sessionId);
          await invalidateCachePattern(sessionKey);
          console.log(`Invalidated session feed cache for session: ${sessionId}`);
        }
        break;
        
      case "all":
        // Full cache refresh - invalidate all feed-related keys
        await invalidateCachePattern("feed:*");
        await invalidateCachePattern("trends:*");
        
        // Rebuild global cache
        await feedService.getGlobalFeed();
        
        console.log("Completed full feed cache refresh");
        break;
        
      default:
        console.warn(`Unknown feed cache refresh type: ${type}`);
    }

    // If specific content was mentioned, invalidate its hot cache
    if (contentId) {
      const hotKey = redisKeys.hotContent(contentId);
      await invalidateCachePattern(hotKey);
      console.log(`Invalidated hot content cache for: ${contentId}`);
    }

    return {
      success: true,
      type,
      processedAt: new Date().toISOString(),
      affectedKeys: {
        global: type === "global" || type === "all",
        user: userId ? [userId] : [],
        session: sessionId ? [sessionId] : [],
        content: contentId ? [contentId] : []
      }
    };
  } catch (error) {
    console.error("Feed cache refresh job failed:", error);
    throw error;
  }
}

// Helper function to trigger feed cache refresh from other services
export async function triggerFeedCacheRefresh(data: RefreshFeedCacheJobData) {
  const queue = await import("../queues/queueFactory.js").then(m => m.createQueue("feed-cache"));
  
  await queue.add(
    "refresh-feed-cache",
    data,
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000
      },
      removeOnComplete: 10,
      removeOnFail: 5
    }
  );
  
  console.log(`Queued feed cache refresh job: ${data.type || "all"}`);
}
