import {
  createComment,
  listThread,
  listCommentsPaginated,
  listNestedReplies,
  updateComment,
  updateReply,
  softDeleteComment,
  softDeleteReply,
  addCommentLike,
  removeCommentLike,
  addReplyLike,
  removeReplyLike,
  createReport,
  hasUserReported,
  isAuthorized,
  getCommentById,
  getReplyById,
  getContentCommentStats,
  type EnrichedComment,
  type EnrichedReply,
  type CommentSortBy,
  type SortOrder
} from "../repositories/commentRepository.js";
import { invalidateFeedCache } from "./feedService.js";
import { createNotification } from "./notificationService.js";
import { extractMentions } from "../middleware/contentModeration.js";
import type { ProfileDocument } from "../models/Profile.js";
import type { CommentDocument } from "../models/Comment.js";
import type { ReplyDocument } from "../models/Reply.js";
import { getAvatarById, resolveAIAvatarUrl } from "@maat/shared";
import { analyzeComment, sanitizeCommentText, type CommentAnalysis } from "./commentAnalysisService.js";
import { moderateComment, CommentModerationError } from "./moderationService.js";
import { refreshCommunityDiscussionScore, updateCommunityProfileSignals } from "./communityScoreService.js";
import { communityAIQueue } from "../queues/communityAIQueue.js";
import { queueReplyNotification } from "../queues/pushNotificationQueue.js";
import { recordComment } from "./interactionService.js";
import { logger } from "../config/logger.js";

// ==================== HELPERS ====================

/**
 * Resolve avatar URL from profile data
 * Priority: profileImageUrl > avatar URL > null
 */
function resolveAvatarUrl(profile: ProfileDocument | null | undefined): string | null {
  if (!profile) {
    console.log("[DEBUG] resolveAvatarUrl: no profile");
    return null;
  }

  console.log("[DEBUG] resolveAvatarUrl:", {
    userId: profile.userId,
    profileImageUrl: profile.profileImageUrl,
    avatar: profile.avatar
  });

  // If profileImageUrl exists and looks like a URL (Cloudinary or data URL), use it
  if (profile.profileImageUrl && (
    profile.profileImageUrl.startsWith("http") ||
    profile.profileImageUrl.startsWith("data:")
  )) {
    console.log("[DEBUG] resolveAvatarUrl: using profileImageUrl", profile.profileImageUrl);
    return profile.profileImageUrl;
  }

  // If avatar exists, resolve it to the image URL
  if (profile.avatar) {
    const avatarData = getAvatarById(profile.avatar);
    if (avatarData) {
      console.log("[DEBUG] resolveAvatarUrl: using avatar", avatarData.imageUrl64);
      return avatarData.imageUrl64; // Use 64px version for comments
    }
  }

  console.log("[DEBUG] resolveAvatarUrl: no avatar found");
  return null;
}

async function enqueueCommunityAIResponse(commentId: string, moderationStatus?: string | null) {
  if (moderationStatus !== "approved") {
    logger.info({ commentId, moderationStatus }, "Comment not approved, skipping AI response");
    return;
  }

  logger.info({ commentId, moderationStatus }, "Attempting to enqueue community AI response");

  scheduleCommunityAIResponseWatchdog(commentId, 20_000, "queue-watchdog");

  try {
    const job = await communityAIQueue.add(
      "generate-comment-response",
      { commentId },
      {
        jobId: `community-ai:${commentId}`,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5_000
        },
        removeOnComplete: 100,
        removeOnFail: 200
      }
    );
    logger.info({ commentId, jobId: job.id }, "Community AI response job enqueued successfully");
  } catch (error) {
    logger.error({ err: error, commentId }, "Failed to enqueue community AI response");
    scheduleCommunityAIResponseWatchdog(commentId, 750, "queue-enqueue-failed");
  }
}

function scheduleCommunityAIResponseWatchdog(
  commentId: string,
  delayMs: number,
  reason: "queue-watchdog" | "queue-enqueue-failed"
) {
  const timer = setTimeout(async () => {
    try {
      const { CommentModel } = await import("../models/Comment.js");
      const sourceComment = await CommentModel.findById(commentId)
        .select("_id moderationStatus hidden aiGenerated")
        .lean() as { _id?: { toString(): string }; moderationStatus?: string; hidden?: boolean; aiGenerated?: boolean } | null;

      if (!sourceComment || sourceComment.aiGenerated || sourceComment.hidden || sourceComment.moderationStatus !== "approved") {
        return;
      }

      const existingAIComment = await CommentModel.findOne({
        inReplyToCommentId: commentId,
        aiGenerated: true
      })
        .select("_id")
        .lean();

      if (existingAIComment) {
        return;
      }

      logger.warn({ commentId, reason }, "Auto AI response fallback triggered");

      const { createAICommentForComment } = await import("./aiCommentService.js");
      await createAICommentForComment(commentId);
    } catch (error) {
      logger.error({ err: error, commentId, reason }, "Auto AI response fallback failed");
    }
  }, delayMs);

  timer.unref?.();
}

// ==================== TYPES ====================

export interface CommentData {
  id: string;
  _id?: string;
  contentId: string;
  userId: string;
  body: string;
  debateScore: number;
  aiGenerated?: boolean;
  aiPersona?: string | null;
  aiPersonaName?: string | null;
  aiPersonaAvatar?: string | null;
  moderationStatus?: "approved" | "blocked" | "hidden";
  moderationReason?: string | null;
  hidden?: boolean;
  reportCount?: number;
  analysis?: CommentAnalysis;
  likeCount: number;
  replyCount: number;
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  authorName?: string;
  authorAvatar?: string | null;
  replies: ReplyData[];
  isLikedByCurrentUser?: boolean;
  mentions: string[];
  inReplyToCommentId?: string | null;
  replyToCommentId?: string | null;
  replyToReplyId?: string | null;
  replyTargetId?: string | null;
  replyTargetType?: "comment" | "reply" | null;
  replyTargetAuthorName?: string | null;
  replyMode?: "nested" | "flat";
  parentAuthorName?: string | null;
}

export interface ReplyData {
  id: string;
  commentId: string;
  parentReplyId?: string;
  userId: string;
  body: string;
  likeCount: number;
  nestedReplyCount: number;
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  authorName?: string;
  authorAvatar?: string | null;
  nestedReplies: ReplyData[];
  isLikedByCurrentUser?: boolean;
  mentions: string[];
  replyMode?: "nested" | "flat";
  isFlatReply?: boolean;
}

export interface PaginatedCommentsResult {
  data: CommentData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ==================== COMMENTS ====================

export async function postComment(input: {
  contentId: string;
  userId: string;
  body: string;
}): Promise<CommentData> {
  const sanitizedBody = sanitizeCommentText(input.body);
  const analysis = await analyzeComment(sanitizedBody);
  const moderation = moderateComment(sanitizedBody, analysis);

  if (moderation.status === "blocked") {
    throw new CommentModerationError(moderation);
  }

  const mentions = extractMentions(sanitizedBody);

  const comment = await createComment({
    contentId: input.contentId,
    userId: input.userId,
    body: sanitizedBody,
    mentions,
    debateScore: Math.round(analysis.debateScore * 10),
    moderationStatus: moderation.status,
    moderationReason: moderation.reason,
    hidden: moderation.status === "hidden",
    hiddenAt: moderation.status === "hidden" ? new Date() : null,
    reportCount: 0,
    analysis,
    qualityScore: analysis.qualityScore
  });

  // Fetch profile for author name
  const { ProfileModel } = await import("../models/Profile.js");
  const profile = await ProfileModel.findOne({ userId: input.userId }).lean() as ProfileDocument | null;
  const { CommunityPostModel } = await import("../models/CommunityPost.js");
  const communityPost = await CommunityPostModel.findById(input.contentId).select("_id").lean()
    || await CommunityPostModel.findOne({
      feedContentId: input.contentId,
      type: "discussion",
      isHidden: false
    }).select("_id").lean();

  // Increment comment count in ContentScore
  const { ContentScoreModel } = await import("../models/ContentScore.js");
  await ContentScoreModel.findOneAndUpdate(
    { contentId: input.contentId },
    { $inc: { comments: 1 } },
    { upsert: true }
  );

  // Notify mentioned users
  if (mentions.length > 0) {
    await notifyMentionedUsers(mentions, input.userId, comment._id.toString(), "comment", input.contentId);
  }

  // Notify content author
  await notifyContentAuthorOfComment(input.contentId, input.userId, comment._id.toString());

  await recordComment({ contentId: input.contentId, userId: input.userId });
  await updateCommunityProfileSignals(input.userId, {
    debateIncrement: analysis.debateScore,
    educationIncrement: analysis.questionScore,
    contributionsIncrement: 1
  });

  if (communityPost) {
    await CommunityPostModel.findByIdAndUpdate((communityPost as { _id: { toString(): string } })._id.toString(), {
      $addToSet: { comments: comment._id },
      $set: { lastActivityAt: new Date() }
    });
    await refreshCommunityDiscussionScore(input.contentId);
  }

  // Invalidate feed cache since new comments affect ranking
  await invalidateFeedCache(input.contentId);

  await enqueueCommunityAIResponse(comment._id.toString(), moderation.status);

  return {
    id: comment._id.toString(),
    _id: comment._id.toString(),
    contentId: comment.contentId.toString(),
    userId: comment.userId.toString(),
    body: comment.body,
    debateScore: comment.debateScore,
    aiGenerated: comment.aiGenerated,
    aiPersona: comment.aiPersona,
    aiPersonaName: comment.aiPersonaName,
    aiPersonaAvatar: comment.aiPersonaAvatar,
    moderationStatus: comment.moderationStatus,
    moderationReason: comment.moderationReason,
    hidden: comment.hidden,
    reportCount: comment.reportCount,
    analysis: comment.analysis,
    likeCount: 0,
    replyCount: 0,
    isDeleted: false,
    isEdited: false,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    authorName: profile?.displayName || `User ${input.userId.slice(-6)}`,
    authorAvatar: resolveAvatarUrl(profile),
    replies: [],
    isLikedByCurrentUser: false,
    mentions
  };
}

export async function editComment(
  commentId: string,
  userId: string,
  newBody: string
): Promise<CommentData | null> {
  // Check authorization
  const authorized = await isAuthorized(commentId, userId, "comment");
  if (!authorized) {
    throw new Error("Unauthorized: You can only edit your own comments");
  }

  const mentions = extractMentions(newBody);
  const updatedComment = await updateComment(commentId, userId, newBody, mentions);

  if (!updatedComment) return null;

  return enrichComment(updatedComment, userId);
}

export async function deleteComment(
  commentId: string,
  userId: string,
  reason?: string
): Promise<boolean> {
  // Check authorization
  const authorized = await isAuthorized(commentId, userId, "comment");
  if (!authorized) {
    throw new Error("Unauthorized: You can only delete your own comments");
  }

  const success = await softDeleteComment(commentId, userId, reason);

  if (success) {
    // Get the comment to find its contentId for cache invalidation
    const { CommentModel } = await import("../models/Comment.js");
    const comment = await CommentModel.findById(commentId).lean() as unknown as CommentDocument | null;
    if (comment) {
      if (comment.replyMode === "flat" && comment.inReplyToCommentId) {
        await CommentModel.findByIdAndUpdate(comment.inReplyToCommentId, {
          $inc: { replyCount: -1 }
        });
      }
      await invalidateFeedCache(comment.contentId.toString());
    }
  }

  return success;
}

// ==================== REPLIES ====================

export async function postReply(input: {
  commentId: string;
  userId: string;
  body: string;
  parentReplyId?: string;
  replyToCommentId?: string;
  replyToReplyId?: string;
  replyMode?: "nested" | "flat";
}): Promise<ReplyData> {
  // Get the comment to check it exists and get contentId
  const { CommentModel } = await import("../models/Comment.js");
  const comment = await CommentModel.findById(input.commentId).lean() as CommentDocument | null;

  if (!comment) {
    throw new Error("Comment not found");
  }

  const sanitizedBody = sanitizeCommentText(input.body);
  const analysis = await analyzeComment(sanitizedBody);
  const moderation = moderateComment(sanitizedBody, analysis);

  if (moderation.status === "blocked") {
    throw new CommentModerationError(moderation);
  }

  // Extract mentions
  const mentions = extractMentions(sanitizedBody);
  const replyTargetReplyId = input.replyToReplyId || input.parentReplyId || null;
  const parentComment = comment;

  if (!parentComment) {
    throw new Error("Parent comment not found");
  }

  const newComment = await CommentModel.create({
    contentId: parentComment.contentId,
    userId: input.userId,
    body: sanitizedBody,
    inReplyToCommentId: input.commentId,
    replyToCommentId: input.replyToCommentId || input.commentId,
    replyToReplyId: replyTargetReplyId,
    replyMode: "flat",
    debateScore: Math.round(analysis.debateScore * 10),
    moderationStatus: moderation.status,
    moderationReason: moderation.reason || null,
    analysis: {
      debateScore: Math.round(analysis.debateScore * 10),
      questionScore: analysis.questionScore,
      emotionScore: analysis.emotionScore,
      toxicityScore: analysis.toxicityScore,
      spamScore: analysis.spamScore,
      qualityScore: analysis.qualityScore
    },
    qualityScore: analysis.qualityScore,
    mentions
  });

  // Fetch profile for author name
  const { ProfileModel } = await import("../models/Profile.js");
  const profile = await ProfileModel.findOne({ userId: input.userId }).lean() as ProfileDocument | null;
  const contentId = parentComment.contentId.toString();

  // Update counts
  const { ContentScoreModel } = await import("../models/ContentScore.js");
  await CommentModel.findByIdAndUpdate(input.commentId, {
    $inc: { replyCount: 1 }
  });

  await ContentScoreModel.findOneAndUpdate(
    { contentId },
    { $inc: { comments: 1 } },
    { upsert: true }
  );

  // Notify mentioned users
  if (mentions.length > 0) {
    await notifyMentionedUsers(mentions, input.userId, newComment._id.toString(), "comment", contentId);
  }

  await notifyCommentAuthorOfReply(input.commentId, input.userId, newComment._id.toString(), "comment");

  // Queue push notification for reply
  const authorName = profile?.displayName || `User ${input.userId.slice(-6)}`;
  await queueReplyNotification(input.commentId, authorName, sanitizedBody);

  if (replyTargetReplyId) {
    await notifyReplyAuthorOfNestedReply(replyTargetReplyId, input.userId, newComment._id.toString(), "comment");
  }

  await invalidateFeedCache(contentId);
  await recordComment({ contentId, userId: input.userId });
  await updateCommunityProfileSignals(input.userId, {
    debateIncrement: analysis.debateScore,
    educationIncrement: analysis.questionScore,
    contributionsIncrement: 1
  });
  await refreshCommunityDiscussionScore(contentId);
  await enqueueCommunityAIResponse(newComment._id.toString(), moderation.status);

  return {
    id: newComment._id.toString(),
    commentId: input.commentId,
    parentReplyId: undefined,
    userId: input.userId,
    body: newComment.body,
    likeCount: 0,
    nestedReplyCount: 0,
    isDeleted: false,
    isEdited: false,
    authorName: profile?.displayName || `User ${input.userId.slice(-6)}`,
    authorAvatar: resolveAvatarUrl(profile),
    createdAt: newComment.createdAt.toISOString(),
    updatedAt: newComment.updatedAt.toISOString(),
    nestedReplies: [],
    isLikedByCurrentUser: false,
    mentions,
    replyMode: "flat",
    isFlatReply: true
  };
}

export async function editReply(
  replyId: string,
  userId: string,
  newBody: string
): Promise<ReplyData | null> {
  // Check authorization
  const authorized = await isAuthorized(replyId, userId, "reply");
  if (!authorized) {
    throw new Error("Unauthorized: You can only edit your own replies");
  }

  const mentions = extractMentions(newBody);
  const updatedReply = await updateReply(replyId, userId, newBody, mentions);

  if (!updatedReply) return null;

  return enrichReply(updatedReply, userId);
}

export async function deleteReply(
  replyId: string,
  userId: string,
  reason?: string
): Promise<boolean> {
  // Check authorization
  const authorized = await isAuthorized(replyId, userId, "reply");
  if (!authorized) {
    throw new Error("Unauthorized: You can only delete your own replies");
  }

  const success = await softDeleteReply(replyId, userId, reason);

  if (success) {
    // Get the reply to find its contentId for cache invalidation
    const { ReplyModel } = await import("../models/Reply.js");
    const reply = await ReplyModel.findById(replyId).lean() as unknown as ReplyDocument | null;
    if (reply) {
      const { CommentModel } = await import("../models/Comment.js");
      const comment = await CommentModel.findById(reply.commentId).lean() as unknown as CommentDocument | null;
      if (comment) {
        await invalidateFeedCache(comment.contentId.toString());
      }
    }
  }

  return success;
}

export async function getNestedReplies(
  parentReplyId: string,
  currentUserId?: string
): Promise<ReplyData[]> {
  // listNestedReplies already returns enriched replies with author info
  const replies = await listNestedReplies(parentReplyId, currentUserId);
  return replies.map(mapReplyData);
}

// ==================== LISTING ====================

export async function getCommentsThread(
  contentId: string,
  currentUserId?: string
): Promise<CommentData[]> {
  // listThread uses listCommentsPaginated which already returns enriched comments
  const result = await listThread(contentId, currentUserId);

  // Map EnrichedComment to CommentData format
  return result.map(c => ({
    id: c.id,
    _id: c._id || c.id,
    contentId: c.contentId,
    userId: c.userId,
    body: c.body,
    debateScore: c.debateScore,
    aiGenerated: c.aiGenerated,
    aiPersona: c.aiPersona,
    aiPersonaName: c.aiPersonaName,
    aiPersonaAvatar: c.aiPersonaAvatar,
    moderationStatus: c.moderationStatus,
    moderationReason: c.moderationReason,
    hidden: c.hidden,
    reportCount: c.reportCount,
    analysis: c.analysis,
    likeCount: c.likeCount,
    replyCount: c.replyCount,
    isDeleted: c.isDeleted,
    isEdited: !!c.lastEditedAt,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    authorName: c.authorName,
    authorAvatar: c.authorAvatar,
    replies: c.replies.map(mapReplyData),
    isLikedByCurrentUser: c.isLikedByCurrentUser || false,
    mentions: c.mentions || []
  }));
}

export async function getCommentsPaginated(
  contentId: string,
  options: {
    page?: number;
    limit?: number;
    sortBy?: CommentSortBy;
    sortOrder?: SortOrder;
    currentUserId?: string;
    aiOnly?: boolean;
  } = {}
): Promise<PaginatedCommentsResult> {
  // listCommentsPaginated already returns enriched comments with author info
  const result = await listCommentsPaginated(contentId, options);

  // Map EnrichedComment to CommentData format (they're already similar)
  return {
    data: result.data.map(c => ({
      id: c.id,
      _id: c._id || c.id,
      contentId: c.contentId,
      userId: c.userId,
      body: c.body,
      debateScore: c.debateScore,
      aiGenerated: c.aiGenerated,
      aiPersona: c.aiPersona,
      aiPersonaName: c.aiPersonaName,
      aiPersonaAvatar: c.aiPersonaAvatar,
      moderationStatus: c.moderationStatus,
      moderationReason: c.moderationReason,
      hidden: c.hidden,
      reportCount: c.reportCount,
      analysis: c.analysis,
      likeCount: c.likeCount,
      replyCount: c.replyCount,
      isDeleted: c.isDeleted,
      isEdited: !!c.lastEditedAt,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      authorName: c.authorName,
      authorAvatar: c.authorAvatar,
      replies: c.replies.map(mapReplyData),
      isLikedByCurrentUser: c.isLikedByCurrentUser || false,
      mentions: c.mentions || [],
      inReplyToCommentId: c.inReplyToCommentId || null,
      replyToCommentId: c.replyToCommentId || null,
      replyToReplyId: c.replyToReplyId || null,
      replyTargetId: c.replyTargetId || null,
      replyTargetType: c.replyTargetType || null,
      replyTargetAuthorName: c.replyTargetAuthorName || null,
      replyMode: c.replyMode || undefined,
      parentAuthorName: c.parentAuthorName || null
    })),
    pagination: result.pagination
  };
}

function mapReplyData(reply: EnrichedReply): ReplyData {
  return {
    id: reply.id,
    commentId: reply.commentId,
    parentReplyId: reply.parentReplyId || undefined,
    userId: reply.userId,
    body: reply.body,
    likeCount: reply.likeCount,
    nestedReplyCount: reply.nestedReplyCount,
    isDeleted: reply.isDeleted,
    isEdited: !!reply.lastEditedAt,
    createdAt: reply.createdAt.toISOString(),
    updatedAt: reply.updatedAt.toISOString(),
    authorName: reply.authorName,
    authorAvatar: reply.authorAvatar,
    nestedReplies: reply.nestedReplies.map(mapReplyData),
    isLikedByCurrentUser: reply.isLikedByCurrentUser || false,
    mentions: reply.mentions || []
  };
}

// ==================== LIKES ====================

export async function likeComment(commentId: string, userId: string): Promise<boolean> {
  const success = await addCommentLike(commentId, userId);

  if (success) {
    // Notify comment author
    const comment = await getCommentById(commentId);
    if (comment?.userId && comment.userId.toString() !== userId) {
      await createNotification({
        userId: comment.userId.toString(),
        type: "like_received",
        message: "Quelqu'un a aimé votre contribution.",
        data: {
          commentId,
          userId,
          url: `/debate/${comment.contentId.toString()}#comment-${commentId}`
        }
      });
    }
  }

  return success;
}

export async function unlikeComment(commentId: string, userId: string): Promise<boolean> {
  return removeCommentLike(commentId, userId);
}

export async function likeReply(replyId: string, userId: string): Promise<boolean> {
  const success = await addReplyLike(replyId, userId);

  if (success) {
    // Notify reply author
    const reply = await getReplyById(replyId);
    if (reply && reply.userId.toString() !== userId) {
      const comment = await getCommentById(reply.commentId.toString());
      await createNotification({
        userId: reply.userId.toString(),
        type: "like_received",
        message: "Quelqu'un a aimé votre réponse.",
        data: {
          replyId,
          userId,
          commentId: reply.commentId.toString(),
          contentId: comment?.contentId.toString(),
          url: comment ? `/debate/${comment.contentId.toString()}#reply-${replyId}` : undefined
        }
      });
    }
  }

  return success;
}

export async function unlikeReply(replyId: string, userId: string): Promise<boolean> {
  return removeReplyLike(replyId, userId);
}

// ==================== REPORTS ====================

export async function reportComment(
  commentId: string,
  reporterId: string,
  reason: "spam" | "harassment" | "hate_speech" | "misinformation" | "inappropriate" | "other",
  description?: string
): Promise<{ success: boolean; reportCount: number; hidden: boolean }> {
  // Check if user already reported this comment
  const alreadyReported = await hasUserReported(reporterId, commentId, undefined);
  if (alreadyReported) {
    throw new Error("You have already reported this comment");
  }

  await createReport({
    commentId,
    reporterId,
    reason,
    description
  });

  const { CommentModel } = await import("../models/Comment.js");
  const { CommentReportModel } = await import("../models/CommentReport.js");
  const reportCount = await CommentReportModel.countDocuments({ commentId });
  const hidden = reportCount >= 3;

  const updatedComment = await CommentModel.findByIdAndUpdate(
    commentId,
    {
      $set: {
        hidden,
        hiddenAt: hidden ? new Date() : null,
        moderationStatus: hidden ? "hidden" : "approved",
        moderationReason: hidden ? "Hidden after 3 community reports." : null
      },
      $inc: {
        reportCount: 1
      }
    },
    { new: true }
  ).lean() as CommentDocument | null;

  if (updatedComment) {
    await updateCommunityProfileSignals(reporterId, { reportsIncrement: 1 });
    await refreshCommunityDiscussionScore(updatedComment.contentId.toString());
  }

  return {
    success: true,
    reportCount,
    hidden
  };
}

export async function reportReply(
  replyId: string,
  reporterId: string,
  reason: "spam" | "harassment" | "hate_speech" | "misinformation" | "inappropriate" | "other",
  description?: string
): Promise<boolean> {
  // Check if user already reported this reply
  const alreadyReported = await hasUserReported(reporterId, undefined, replyId);
  if (alreadyReported) {
    throw new Error("You have already reported this reply");
  }

  await createReport({
    replyId,
    reporterId,
    reason,
    description
  });

  return true;
}

// ==================== STATS ====================

export async function getCommentStats(contentId: string): Promise<{
  commentCount: number;
  replyCount: number;
  totalCount: number;
}> {
  return getContentCommentStats(contentId);
}

// ==================== AUTHORIZATION ====================

export async function checkCommentAuthorization(commentId: string, userId: string): Promise<boolean> {
  return isAuthorized(commentId, userId, "comment");
}

export async function checkReplyAuthorization(replyId: string, userId: string): Promise<boolean> {
  return isAuthorized(replyId, userId, "reply");
}

// ==================== HELPERS ====================

async function enrichComment(comment: CommentDocument, currentUserId?: string): Promise<CommentData> {
  const { ProfileModel } = await import("../models/Profile.js");
  const { CommentModel } = await import("../models/Comment.js");
  const profile = comment.userId
    ? await ProfileModel.findOne({
        userId: comment.userId.toString()
      }).lean() as ProfileDocument | null
    : null;

  // Get parent author name for flat replies
  let parentAuthorName: string | null = null;
  if (comment.inReplyToCommentId && comment.replyMode === "flat") {
    const parentComment = await CommentModel.findById(comment.inReplyToCommentId)
      .populate<{ userId: { displayName?: string } }>("userId", "displayName")
      .lean() as (CommentDocument & { userId?: { displayName?: string } }) | null;
    if (parentComment) {
      if (parentComment.aiGenerated && parentComment.aiPersonaName) {
        parentAuthorName = parentComment.aiPersonaName;
      } else if (parentComment.userId) {
        const parentProfile = await ProfileModel.findOne({
          userId: parentComment.userId.toString?.() || parentComment.userId
        }).lean() as ProfileDocument | null;
        parentAuthorName = parentProfile?.displayName || "Utilisateur";
      }
    }
  }

  return {
    id: comment._id.toString(),
    _id: comment._id.toString(),
    contentId: comment.contentId.toString(),
    userId: comment.userId?.toString() || "",
    body: comment.isDeleted ? "[Commentaire supprimé]" : comment.body,
    debateScore: comment.debateScore,
    aiGenerated: comment.aiGenerated || false,
    aiPersona: comment.aiPersona || null,
    aiPersonaName: comment.aiPersonaName || null,
    aiPersonaAvatar: resolveAIAvatarUrl(comment.aiPersonaAvatar || null, comment.aiPersona || null, 64),
    moderationStatus: comment.moderationStatus,
    moderationReason: comment.moderationReason,
    hidden: comment.hidden,
    reportCount: comment.reportCount,
    analysis: comment.analysis,
    likeCount: comment.likeCount,
    replyCount: comment.replyCount,
    isDeleted: comment.isDeleted,
    isEdited: !!comment.lastEditedAt,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    authorName: comment.isDeleted
      ? "Utilisateur"
      : (comment.aiPersonaName || profile?.displayName || (comment.userId ? `User ${comment.userId.toString().slice(-6)}` : "IA MAAT")),
    authorAvatar: comment.isDeleted
      ? undefined
      : (resolveAIAvatarUrl(comment.aiPersonaAvatar || null, comment.aiPersona || null, 64) || resolveAvatarUrl(profile)),
    replies: [], // Will be populated separately
    isLikedByCurrentUser: false, // Set by repository
    mentions: comment.mentions || [],
    inReplyToCommentId: comment.inReplyToCommentId?.toString() || null,
    replyToCommentId: comment.replyToCommentId?.toString() || null,
    replyToReplyId: comment.replyToReplyId?.toString() || null,
    replyTargetId: comment.replyToReplyId?.toString() || comment.replyToCommentId?.toString() || null,
    replyTargetType: comment.replyToReplyId ? "reply" : comment.replyToCommentId ? "comment" : null,
    replyTargetAuthorName: parentAuthorName,
    replyMode: comment.replyMode || undefined,
    parentAuthorName
  };
}

async function enrichReply(reply: ReplyDocument, currentUserId?: string): Promise<ReplyData> {
  const { ProfileModel } = await import("../models/Profile.js");
  const profile = await ProfileModel.findOne({
    userId: reply.userId.toString()
  }).lean() as ProfileDocument | null;

  return {
    id: reply._id.toString(),
    commentId: reply.commentId.toString(),
    parentReplyId: reply.parentReplyId?.toString(),
    userId: reply.userId.toString(),
    body: reply.isDeleted ? "[Réponse supprimée]" : reply.body,
    likeCount: reply.likeCount,
    nestedReplyCount: reply.nestedReplyCount,
    isDeleted: reply.isDeleted,
    isEdited: !!reply.lastEditedAt,
    createdAt: reply.createdAt.toISOString(),
    updatedAt: reply.updatedAt.toISOString(),
    authorName: reply.isDeleted ? "Utilisateur" : (profile?.displayName || `User ${reply.userId.toString().slice(-6)}`),
    authorAvatar: reply.isDeleted ? undefined : (resolveAvatarUrl(profile)),
    nestedReplies: [],
    isLikedByCurrentUser: false,
    mentions: reply.mentions || []
  };
}

// ==================== NOTIFICATIONS ====================

async function notifyMentionedUsers(
  mentions: string[],
  authorId: string,
  commentOrReplyId: string,
  type: "comment" | "reply",
  contentId: string
): Promise<void> {
  const { ProfileModel } = await import("../models/Profile.js");

  type LeanProfile = { userId: { toString(): string }; displayName?: string };

  // Find users with matching usernames
  const mentionedProfiles = await ProfileModel.find({
    displayName: { $in: mentions }
  }).lean() as unknown as LeanProfile[];

  const authorProfile = await ProfileModel.findOne({ userId: authorId }).lean() as unknown as LeanProfile | null;

  for (const profile of mentionedProfiles) {
    // Don't notify if user mentioned themselves
    if (profile.userId.toString() === authorId) continue;

    await createNotification({
      userId: profile.userId.toString(),
      type: "mention_received",
      title: "💬 Mention dans un débat",
      message: `${authorProfile?.displayName || "Quelqu'un"} vous a mentionné dans un ${type === "comment" ? "commentaire" : "message"}.`,
      data: {
        [type === "comment" ? "commentId" : "replyId"]: commentOrReplyId,
        contentId,
        userId: authorId,
        url: `/debate/${contentId}#${type === "comment" ? "comment" : "reply"}-${commentOrReplyId}`
      }
    });
  }
}

async function notifyContentAuthorOfComment(
  contentId: string,
  commenterId: string,
  commentId: string
): Promise<void> {
  const { ContentModel } = await import("../models/Content.js");
  const { ProfileModel } = await import("../models/Profile.js");
  type ContentDoc = { uploadedBy: { toString(): string } | null | undefined };

  const content = await ContentModel.findById(contentId).lean() as unknown as ContentDoc | null;
  if (!content) return;

  // Skip if content has no uploader (imported content) or user commented on their own content
  if (!content.uploadedBy || content.uploadedBy.toString() === commenterId) return;

  const commenterProfile = await ProfileModel.findOne({ userId: commenterId }).lean() as ProfileDocument | null;

  await createNotification({
    userId: content.uploadedBy.toString(),
    type: "comment_reply",
    title: "💬 Nouveau commentaire",
    message: `${commenterProfile?.displayName || "Quelqu'un"} a commenté votre contenu.`,
    data: {
      commentId,
      contentId,
      userId: commenterId,
      url: `/debate/${contentId}#comment-${commentId}`
    }
  });
}

async function notifyCommentAuthorOfReply(
  commentId: string,
  replierId: string,
  messageId: string,
  messageType: "comment" | "reply"
): Promise<void> {
  const { CommentModel } = await import("../models/Comment.js");
  const { ProfileModel } = await import("../models/Profile.js");

  const comment = await CommentModel.findById(commentId).lean() as unknown as CommentDocument | null;
  if (!comment) return;

  // Don't notify if user replied to their own comment
  if (!comment.userId || comment.userId.toString() === replierId) return;

  const replierProfile = await ProfileModel.findOne({ userId: replierId }).lean() as ProfileDocument | null;

  await createNotification({
    userId: comment.userId.toString(),
    type: "comment_reply",
    message: `${replierProfile?.displayName || "Quelqu'un"} a répondu à votre commentaire.`,
    data: {
      [messageType === "reply" ? "replyId" : "commentId"]: messageId,
      commentId,
      contentId: comment.contentId.toString(),
      userId: replierId,
      url: `/debate/${comment.contentId.toString()}#${messageType === "reply" ? "reply" : "comment"}-${messageId}`
    }
  });
}

async function notifyReplyAuthorOfNestedReply(
  parentReplyId: string,
  replierId: string,
  messageId: string,
  messageType: "comment" | "reply"
): Promise<void> {
  const { ReplyModel } = await import("../models/Reply.js");
  const { CommentModel } = await import("../models/Comment.js");
  const { ProfileModel } = await import("../models/Profile.js");

  const parentReply = await ReplyModel.findById(parentReplyId).lean() as unknown as ReplyDocument | null;
  if (!parentReply) return;

  // Don't notify if user replied to their own reply
  if (parentReply.userId.toString() === replierId) return;

  const replierProfile = await ProfileModel.findOne({ userId: replierId }).lean() as ProfileDocument | null;
  const comment = await CommentModel.findById(parentReply.commentId).lean() as unknown as CommentDocument | null;

  await createNotification({
    userId: parentReply.userId.toString(),
    type: "comment_reply",
    message: `${replierProfile?.displayName || "Quelqu'un"} a répondu à votre réponse.`,
    data: {
      [messageType === "reply" ? "replyId" : "commentId"]: messageId,
      parentReplyId,
      commentId: parentReply.commentId.toString(),
      contentId: comment?.contentId.toString(),
      userId: replierId,
      url: comment ? `/debate/${comment.contentId.toString()}#${messageType === "reply" ? "reply" : "comment"}-${messageId}` : undefined
    }
  });
}
