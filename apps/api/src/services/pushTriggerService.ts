import { PushSubscriptionModel } from "../models/PushSubscription.js";
import { ContentModel } from "../models/Content.js";
import { CommentModel } from "../models/Comment.js";
import { CommunityPostModel } from "../models/CommunityPost.js";
import { LearningProgressModel } from "../models/LearningProgress.js";
import { sendPushToMany, type PushNotificationPayload } from "./webPushService.js";
import { logger } from "../config/logger.js";

const BASE_URL = process.env.APP_BASE_URL || "https://www.maatfeed.com";

/**
 * Send push notification to users for content that needs review
 * Triggered when user's spaced repetition indicates content is due for review
 */
export async function sendReviewDueNotifications(): Promise<{
  sent: number;
  failed: number;
  usersNotified: number;
}> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  try {
    // Find learning progress items due for review that haven't been notified recently
    const dueItems = await LearningProgressModel.find({
      status: "review",
      nextReviewAt: { $lte: now },
      $or: [
        { lastNotifiedAt: { $exists: false } },
        { lastNotifiedAt: { $lte: oneHourAgo } }
      ]
    })
      .populate("contentId", "title thumbnailUrl")
      .select("userId contentId")
      .lean();

    if (dueItems.length === 0) {
      return { sent: 0, failed: 0, usersNotified: 0 };
    }

    // Group by user to avoid spamming
    const userItems = new Map<string, typeof dueItems>();
    for (const item of dueItems) {
      const userId = item.userId.toString();
      if (!userItems.has(userId)) {
        userItems.set(userId, []);
      }
      userItems.get(userId)!.push(item);
    }

    let totalSent = 0;
    let totalFailed = 0;
    let usersNotified = 0;

    // Send notification to each user (max 1 notification with summary)
    for (const [userId, items] of userItems) {
      const subscriptions = await PushSubscriptionModel.find({
        userId,
        isActive: true
      }).lean();

      if (subscriptions.length === 0) continue;

      // Get the first due item for the notification
      const firstItem = items[0];
      const content = firstItem.contentId as unknown as { title: string; thumbnailUrl?: string };
      const reviewCount = items.length;

      const payload: PushNotificationPayload = {
        title: "🧠 Révision en attente",
        body: reviewCount === 1
          ? `"${content.title.slice(0, 50)}${content.title.length > 50 ? "..." : ""}" est prêt pour révision`
          : `${reviewCount} contenus sont prêts pour révision`,
        icon: content.thumbnailUrl || "/favicon/android-chrome-192x192.png",
        badge: "/favicon/android-chrome-192x192.png",
        tag: `review-due-${userId}`,
        data: {
          url: `${BASE_URL}/explore?review=true`,
          notificationId: `review-${userId}-${now.toISOString()}`,
          type: "review_due",
          reviewCount
        },
        actions: [
          { action: "review", title: "Réviser maintenant" },
          { action: "dismiss", title: "Plus tard" }
        ],
        requireInteraction: true
      };

      const results = await sendPushToMany(
        subscriptions.map(s => ({
          endpoint: s.endpoint,
          keys: { p256dh: s.p256dh, auth: s.auth }
        })),
        payload
      );

      totalSent += results.success;
      totalFailed += results.failed;
      usersNotified++;

      // Update last notified timestamp for all user's items
      const itemIds = items.map(i => i._id);
      await LearningProgressModel.updateMany(
        { _id: { $in: itemIds } },
        { $set: { lastNotifiedAt: now } }
      );

      logger.info({
        msg: "Review due notification sent",
        userId,
        reviewCount,
        subscriptionsCount: subscriptions.length,
        success: results.success,
        expired: results.expired
      });
    }

    return { sent: totalSent, failed: totalFailed, usersNotified };
  } catch (error) {
    logger.error({
      msg: "Failed to send review due notifications",
      error: error instanceof Error ? error.message : String(error)
    });
    return { sent: 0, failed: 0, usersNotified: 0 };
  }
}

/**
 * Send push notification when someone replies to a user's comment
 */
export async function sendReplyNotification(
  parentCommentId: string,
  replyAuthorName: string,
  replyContent: string
): Promise<boolean> {
  try {
    // Get parent comment and its author
    const parentComment = await CommentModel.findById(parentCommentId)
      .populate("author", "displayName")
      .populate("contentId", "title")
      .lean();

    if (!parentComment) {
      logger.warn({ msg: "Parent comment not found for reply notification", parentCommentId });
      return false;
    }

    const authorId = parentComment.author?._id?.toString();
    if (!authorId) {
      logger.warn({ msg: "Comment has no author", parentCommentId });
      return false;
    }

    // Don't notify if user replied to their own comment
    if (authorId === replyAuthorName) {
      return false;
    }

    // Get user's push subscriptions
    const subscriptions = await PushSubscriptionModel.find({
      userId: authorId,
      isActive: true
    }).lean();

    if (subscriptions.length === 0) return false;

    const content = parentComment.contentId as unknown as { title?: string };
    const truncatedReply = replyContent.slice(0, 100) + (replyContent.length > 100 ? "..." : "");

    const payload: PushNotificationPayload = {
      title: `💬 ${replyAuthorName} a répondu`,
      body: `"${truncatedReply}"${content.title ? ` sur "${content.title.slice(0, 40)}..."` : ""}`,
      icon: "/favicon/android-chrome-192x192.png",
      badge: "/favicon/android-chrome-192x192.png",
      tag: `reply-${parentCommentId}`,
      data: {
        url: `${BASE_URL}/content/${parentComment.contentId}?comment=${parentCommentId}`,
        notificationId: `reply-${parentCommentId}-${Date.now()}`,
        type: "reply",
        commentId: parentCommentId
      },
      actions: [
        { action: "view", title: "Voir" },
        { action: "reply", title: "Répondre" }
      ],
      renotify: true
    };

    const results = await sendPushToMany(
      subscriptions.map(s => ({
        endpoint: s.endpoint,
        keys: { p256dh: s.p256dh, auth: s.auth }
      })),
      payload
    );

    logger.info({
      msg: "Reply notification sent",
      parentCommentId,
      authorId,
      replyAuthorName,
      success: results.success,
      expired: results.expired
    });

    return results.success > 0;
  } catch (error) {
    logger.error({
      msg: "Failed to send reply notification",
      parentCommentId,
      error: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
}

/**
 * Send push notification for trending/viral content
 * Only sent to users who haven't seen the content yet
 */
export async function sendTrendingContentNotification(
  contentId: string,
  trendingScore: number
): Promise<boolean> {
  try {
    // Only notify for highly trending content
    if (trendingScore < 100) {
      return false;
    }

    const content = await ContentModel.findById(contentId).lean();
    if (!content || content.processingStatus !== "published") {
      return false;
    }

    // Find users who have push subscriptions but haven't interacted with this content
    // This is a simplified approach - in production you might want more sophisticated targeting
    const recentSubscribers = await PushSubscriptionModel.find({
      isActive: true,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Active in last 7 days
    })
      .distinct("userId")
      .lean();

    if (recentSubscribers.length === 0) return false;

    // Limit to first 100 subscribers for trending notifications (avoid spamming everyone)
    const targetUserIds = recentSubscribers.slice(0, 100);

    const subscriptions = await PushSubscriptionModel.find({
      userId: { $in: targetUserIds },
      isActive: true
    }).lean();

    if (subscriptions.length === 0) return false;

    const payload: PushNotificationPayload = {
      title: "🔥 Contenu tendance",
      body: `"${content.title.slice(0, 60)}${content.title.length > 60 ? "..." : ""}" fait le buzz !`,
      icon: content.thumbnailUrl || "/favicon/android-chrome-192x192.png",
      badge: "/favicon/android-chrome-192x192.png",
      tag: `trending-${contentId}`,
      data: {
        url: `${BASE_URL}/content/${contentId}`,
        notificationId: `trending-${contentId}-${Date.now()}`,
        type: "trending",
        contentId
      },
      actions: [
        { action: "view", title: "Découvrir" },
        { action: "save", title: "Sauvegarder" }
      ]
    };

    const results = await sendPushToMany(
      subscriptions.map(s => ({
        endpoint: s.endpoint,
        keys: { p256dh: s.p256dh, auth: s.auth }
      })),
      payload
    );

    logger.info({
      msg: "Trending content notification sent",
      contentId,
      trendingScore,
      targetUsers: targetUserIds.length,
      subscriptionsCount: subscriptions.length,
      success: results.success,
      expired: results.expired
    });

    return results.success > 0;
  } catch (error) {
    logger.error({
      msg: "Failed to send trending notification",
      contentId,
      error: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
}

/**
 * Send welcome notification to new subscribers
 */
export async function sendWelcomeNotification(userId: string): Promise<boolean> {
  try {
    const subscriptions = await PushSubscriptionModel.find({
      userId,
      isActive: true
    }).lean();

    if (subscriptions.length === 0) return false;

    const payload: PushNotificationPayload = {
      title: "🎉 Bienvenue sur MAAT FEED !",
      body: "Vous recevrez des notifications pour vos révisions et réponses.",
      icon: "/favicon/android-chrome-192x192.png",
      badge: "/favicon/android-chrome-192x192.png",
      tag: `welcome-${userId}`,
      data: {
        url: `${BASE_URL}/explore`,
        notificationId: `welcome-${userId}-${Date.now()}`,
        type: "welcome"
      },
      requireInteraction: false
    };

    const results = await sendPushToMany(
      subscriptions.map(s => ({
        endpoint: s.endpoint,
        keys: { p256dh: s.p256dh, auth: s.auth }
      })),
      payload
    );

    logger.info({
      msg: "Welcome notification sent",
      userId,
      success: results.success
    });

    return results.success > 0;
  } catch (error) {
    logger.error({
      msg: "Failed to send welcome notification",
      userId,
      error: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
}

/**
 * Clean up expired push subscriptions
 */
export async function cleanupExpiredSubscriptions(): Promise<{
  cleaned: number;
}> {
  try {
    // Find subscriptions that haven't been used in 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await PushSubscriptionModel.updateMany(
      {
        lastUsedAt: { $lt: thirtyDaysAgo },
        isActive: true
      },
      { $set: { isActive: false } }
    );

    logger.info({
      msg: "Cleaned up expired push subscriptions",
      cleaned: result.modifiedCount
    });

    return { cleaned: result.modifiedCount };
  } catch (error) {
    logger.error({
      msg: "Failed to cleanup expired subscriptions",
      error: error instanceof Error ? error.message : String(error)
    });
    return { cleaned: 0 };
  }
}
