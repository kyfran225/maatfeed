import mongoose from "mongoose";
import { CommentModel, type CommentDocument } from "../models/Comment.js";
import { ReplyModel, type ReplyDocument } from "../models/Reply.js";
import { ProfileModel } from "../models/Profile.js";
import { CommentLikeModel } from "../models/CommentLike.js";
import { CommentReportModel } from "../models/CommentReport.js";
import type { Types } from "mongoose";
import { getAvatarById, resolveAIAvatarUrl } from "@maat/shared";
import type { ProfileDocument } from "../models/Profile.js";

// Types for sorting
export type CommentSortBy = "date" | "likes" | "replies" | "debate";
export type SortOrder = "asc" | "desc";

// Pagination result type
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Enriched comment type
export interface EnrichedComment {
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
  hidden?: boolean;
  reportCount?: number;
  moderationStatus?: "approved" | "blocked" | "hidden";
  moderationReason?: string | null;
  analysis?: {
    debateScore: number;
    questionScore: number;
    emotionScore: number;
    toxicityScore: number;
    spamScore: number;
    qualityScore: number;
  };
  likeCount: number;
  replyCount: number;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  deleteReason: string | null;
  editHistory: { body: string; editedAt: Date }[];
  lastEditedAt: Date | null;
  mentions: string[];
  createdAt: Date;
  updatedAt: Date;
  authorName: string;
  authorAvatar?: string;
  replies: EnrichedReply[];
  isLikedByCurrentUser?: boolean;
  inReplyToCommentId?: string | null;
  replyToCommentId?: string | null;
  replyToReplyId?: string | null;
  replyTargetId?: string | null;
  replyTargetType?: "comment" | "reply" | null;
  replyTargetAuthorName?: string | null;
  replyMode?: "nested" | "flat" | null;
  parentAuthorName?: string | null;
}

// Enriched reply type
export interface EnrichedReply {
  id: string;
  commentId: string;
  parentReplyId?: string | null;
  userId: string;
  body: string;
  likeCount: number;
  nestedReplyCount: number;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  deleteReason: string | null;
  editHistory: { body: string; editedAt: Date }[];
  lastEditedAt: Date | null;
  mentions: string[];
  createdAt: Date;
  updatedAt: Date;
  authorName: string;
  authorAvatar?: string;
  nestedReplies: EnrichedReply[];
  isLikedByCurrentUser?: boolean;
}

// ==================== AVATAR HELPER ====================

/**
 * Resolve avatar URL from profile data
 * Priority: profileImageUrl > avatar URL > null
 */
function resolveAvatarUrl(profile: ProfileDocument | null | undefined | any): string | null {
  if (!profile) {
    return null;
  }

  // If profileImageUrl exists and looks like a URL (Cloudinary or data URL), use it
  if (profile.profileImageUrl && (
    profile.profileImageUrl.startsWith("http") ||
    profile.profileImageUrl.startsWith("data:")
  )) {
    return profile.profileImageUrl;
  }

  // If avatar exists, resolve it to the image URL
  if (profile.avatar) {
    const avatarData = getAvatarById(profile.avatar);
    if (avatarData) {
      return avatarData.imageUrl64; // Use 64px version for comments
    }
  }

  return null;
}

// ==================== PROFILE HELPERS ====================

async function fetchProfilesForUsers(userIds: string[]): Promise<Map<string, { displayName: string; avatarUrl?: string | null }>> {
  const uniqueUserIds = [...new Set(userIds.filter(id => id))];
  if (uniqueUserIds.length === 0) return new Map();

  const profiles = await ProfileModel.find({
    userId: { $in: uniqueUserIds }
  }).lean();

  const profileMap = new Map<string, { displayName: string; avatarUrl?: string | null }>();
  for (const profile of profiles) {
    profileMap.set(profile.userId.toString(), {
      displayName: profile.displayName || `User ${profile.userId.toString().slice(-6)}`,
      avatarUrl: resolveAvatarUrl(profile)
    });
  }

  return profileMap;
}

async function getUserLikesForComments(userId: string, commentIds: string[]): Promise<Set<string>> {
  if (!userId || commentIds.length === 0) return new Set();

  const likes = await CommentLikeModel.find({
    userId,
    commentId: { $in: commentIds }
  }).lean();

  return new Set(likes.map(like => like.commentId?.toString()).filter(Boolean));
}

async function getUserLikesForReplies(userId: string, replyIds: string[]): Promise<Set<string>> {
  if (!userId || replyIds.length === 0) return new Set();

  const likes = await CommentLikeModel.find({
    userId,
    replyId: { $in: replyIds }
  }).lean();

  return new Set(likes.map(like => like.replyId?.toString()).filter(Boolean));
}

type LeanReplyDoc = {
  _id: { toString(): string };
  userId: { toString(): string };
  commentId: { toString(): string };
  parentReplyId?: { toString(): string } | null;
};

async function enrichRepliesRecursively(
  replies: LeanReplyDoc[],
  currentUserId?: string
): Promise<EnrichedReply[]> {
  if (replies.length === 0) {
    return [];
  }

  const replyIds = replies.map((reply) => reply._id.toString());
  const userIds = replies.map((reply) => reply.userId.toString());

  const [profileMap, userLikes, childRepliesRaw] = await Promise.all([
    fetchProfilesForUsers(userIds),
    currentUserId ? getUserLikesForReplies(currentUserId, replyIds) : Promise.resolve(new Set<string>()),
    ReplyModel.find({
      parentReplyId: { $in: replyIds },
      isDeleted: false
    })
      .sort({ createdAt: 1 })
      .lean()
  ]);

  const childReplies = await enrichRepliesRecursively(childRepliesRaw as unknown as LeanReplyDoc[], currentUserId);
  const childRepliesByParent = new Map<string, EnrichedReply[]>();

  for (const childReply of childReplies) {
    const parentReplyId = childReply.parentReplyId;
    if (!parentReplyId) {
      continue;
    }

    const existingChildren = childRepliesByParent.get(parentReplyId) ?? [];
    existingChildren.push(childReply);
    childRepliesByParent.set(parentReplyId, existingChildren);
  }

  return replies.map((reply) => {
    const replyId = reply._id.toString();
    const userId = reply.userId.toString();
    const profile = profileMap.get(userId);

    return {
      id: replyId,
      commentId: reply.commentId.toString(),
      parentReplyId: reply.parentReplyId?.toString() || null,
      userId,
      body: (reply as unknown as { body: string }).body,
      likeCount: (reply as unknown as { likeCount: number }).likeCount || 0,
      nestedReplyCount: (reply as unknown as { nestedReplyCount: number }).nestedReplyCount || 0,
      isDeleted: (reply as unknown as { isDeleted: boolean }).isDeleted || false,
      deletedAt: (reply as unknown as { deletedAt: Date | null }).deletedAt || null,
      deletedBy: ((reply as unknown as { deletedBy: { toString(): string } | null | undefined }).deletedBy)?.toString() || null,
      deleteReason: (reply as unknown as { deleteReason: string | null }).deleteReason || null,
      editHistory: (reply as unknown as { editHistory: { body: string; editedAt: Date }[] }).editHistory || [],
      lastEditedAt: (reply as unknown as { lastEditedAt: Date | null }).lastEditedAt || null,
      mentions: (reply as unknown as { mentions: string[] }).mentions || [],
      createdAt: (reply as unknown as { createdAt: Date }).createdAt,
      updatedAt: (reply as unknown as { updatedAt: Date }).updatedAt,
      authorName: profile?.displayName || `User ${userId.slice(-6)}`,
      authorAvatar: profile?.avatarUrl || undefined,
      nestedReplies: childRepliesByParent.get(replyId) ?? [],
      isLikedByCurrentUser: userLikes.has(replyId)
    };
  });
}

// ==================== COMMENT CRUD ====================

export async function createComment(input: {
  contentId: string;
  userId?: string | null;
  body: string;
  mentions?: string[];
  debateScore?: number;
  aiGenerated?: boolean;
  aiPersona?: string | null;
  aiPersonaName?: string | null;
  aiPersonaAvatar?: string | null;
  moderationStatus?: "approved" | "blocked" | "hidden";
  moderationReason?: string | null;
  hidden?: boolean;
  hiddenAt?: Date | null;
  hiddenBy?: string | null;
  reportCount?: number;
  analysis?: {
    debateScore: number;
    questionScore: number;
    emotionScore: number;
    toxicityScore: number;
    spamScore: number;
    qualityScore: number;
  };
  qualityScore?: number;
  inReplyToCommentId?: string;
  replyToCommentId?: string;
  replyToReplyId?: string;
}) {
  return CommentModel.create({
    contentId: input.contentId,
    userId: input.userId ?? null,
    aiGenerated: input.aiGenerated ?? false,
    aiPersona: input.aiPersona ?? null,
    aiPersonaName: input.aiPersonaName ?? null,
    aiPersonaAvatar: input.aiPersonaAvatar ?? null,
    body: input.body,
    mentions: input.mentions || [],
    debateScore: input.debateScore ?? 0,
    moderationStatus: input.moderationStatus ?? "approved",
    moderationReason: input.moderationReason ?? null,
    hidden: input.hidden ?? false,
    hiddenAt: input.hiddenAt ?? null,
    hiddenBy: input.hiddenBy ?? null,
    reportCount: input.reportCount ?? 0,
    analysis: input.analysis ?? {
      debateScore: 0,
      questionScore: 0,
      emotionScore: 0,
      toxicityScore: 0,
      spamScore: 0,
      qualityScore: 0
    },
    qualityScore: input.qualityScore ?? input.analysis?.qualityScore ?? 0,
    inReplyToCommentId: input.inReplyToCommentId ?? null,
    replyToCommentId: input.replyToCommentId ?? null,
    replyToReplyId: input.replyToReplyId ?? null
  });
}

export async function getCommentById(commentId: string): Promise<CommentDocument | null> {
  return CommentModel.findById(commentId).lean() as unknown as CommentDocument | null;
}

export async function updateComment(
  commentId: string,
  userId: string,
  newBody: string,
  newMentions?: string[]
): Promise<CommentDocument | null> {
  const comment = await CommentModel.findById(commentId);
  if (!comment) return null;

  // Store previous version in edit history
  comment.editHistory.push({
    body: comment.body,
    editedAt: new Date()
  });

  comment.body = newBody;
  comment.lastEditedAt = new Date();
  if (newMentions) {
    comment.mentions = newMentions;
  }
  if (userId) {
    comment.deletedBy = userId;
  }

  await comment.save();
  return comment.toObject() as unknown as CommentDocument;
}

export async function softDeleteComment(
  commentId: string,
  userId: string,
  reason?: string
): Promise<boolean> {
  const result = await CommentModel.findByIdAndUpdate(
    commentId,
    {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId,
      deleteReason: reason || "user_requested",
      body: "[Commentaire supprimé]"
    },
    { new: true }
  );

  return result !== null;
}

export async function hardDeleteComment(commentId: string): Promise<boolean> {
  // Delete all associated data
  await Promise.all([
    CommentLikeModel.deleteMany({ commentId }),
    CommentReportModel.deleteMany({ commentId }),
    ReplyModel.deleteMany({ commentId })
  ]);

  const result = await CommentModel.findByIdAndDelete(commentId);
  return result !== null;
}

// ==================== REPLY CRUD ====================

export async function createReply(input: {
  commentId: string;
  userId: string;
  body: string;
  parentReplyId?: string;
  mentions?: string[];
}) {
  const reply = await ReplyModel.create({
    commentId: input.commentId,
    userId: input.userId,
    body: input.body,
    parentReplyId: input.parentReplyId || null,
    mentions: input.mentions || []
  });

  // Update reply counts
  await CommentModel.findByIdAndUpdate(input.commentId, {
    $inc: { replyCount: 1 }
  });

  // If this is a nested reply, update parent's nested reply count
  if (input.parentReplyId) {
    await ReplyModel.findByIdAndUpdate(input.parentReplyId, {
      $inc: { nestedReplyCount: 1 }
    });
  }

  return reply;
}

export async function getReplyById(replyId: string): Promise<ReplyDocument | null> {
  return ReplyModel.findById(replyId).lean() as unknown as ReplyDocument | null;
}

export async function updateReply(
  replyId: string,
  userId: string,
  newBody: string,
  newMentions?: string[]
): Promise<ReplyDocument | null> {
  const reply = await ReplyModel.findById(replyId);
  if (!reply) return null;

  reply.editHistory.push({
    body: reply.body,
    editedAt: new Date()
  });

  reply.body = newBody;
  reply.lastEditedAt = new Date();
  if (newMentions) {
    reply.mentions = newMentions;
  }

  await reply.save();
  return reply.toObject() as unknown as ReplyDocument;
}

export async function softDeleteReply(
  replyId: string,
  userId: string,
  reason?: string
): Promise<boolean> {
  const reply = await ReplyModel.findById(replyId);
  if (!reply) return false;

  // Soft delete the reply
  reply.isDeleted = true;
  reply.deletedAt = new Date();
  reply.deletedBy = userId as unknown as Types.ObjectId;
  reply.deleteReason = reason || "user_requested";
  reply.body = "[Réponse supprimée]";
  await reply.save();

  // Decrement comment's reply count
  await CommentModel.findByIdAndUpdate(reply.commentId, {
    $inc: { replyCount: -1 }
  });

  // If nested, decrement parent's count
  if (reply.parentReplyId) {
    await ReplyModel.findByIdAndUpdate(reply.parentReplyId, {
      $inc: { nestedReplyCount: -1 }
    });
  }

  return true;
}

export async function hardDeleteReply(replyId: string): Promise<boolean> {
  const reply = await ReplyModel.findById(replyId);
  if (!reply) return false;

  // Delete associated data
  await Promise.all([
    CommentLikeModel.deleteMany({ replyId }),
    CommentReportModel.deleteMany({ replyId }),
    // Delete all nested replies
    ReplyModel.deleteMany({ parentReplyId: replyId })
  ]);

  await ReplyModel.findByIdAndDelete(replyId);
  return true;
}

// ==================== PAGINATION & LISTING ====================

export async function listCommentsPaginated(
  contentId: string,
  options: {
    page?: number;
    limit?: number;
    sortBy?: CommentSortBy;
    sortOrder?: SortOrder;
    currentUserId?: string;
    aiOnly?: boolean;
  } = {}
): Promise<PaginatedResult<EnrichedComment>> {
  const {
    page = 1,
    limit = 20,
    sortBy = "date",
    sortOrder = "desc",
    currentUserId,
    aiOnly = false
  } = options;
  const normalizedContentId = mongoose.Types.ObjectId.isValid(contentId)
    ? new mongoose.Types.ObjectId(contentId)
    : contentId;

  const activeCommentFilter = {
    contentId: normalizedContentId,
    isDeleted: false,
    hidden: { $ne: true },
    moderationStatus: { $ne: "blocked" },
    ...(aiOnly ? { aiGenerated: true } : {})
  } as const;

  // Build sort query
  let sortQuery: Record<string, 1 | -1> = {};
  switch (sortBy) {
    case "likes":
      sortQuery = { likeCount: sortOrder === "desc" ? -1 : 1, createdAt: -1 };
      break;
    case "replies":
      sortQuery = { replyCount: sortOrder === "desc" ? -1 : 1, createdAt: -1 };
      break;
    case "debate":
      sortQuery = { debateScore: sortOrder === "desc" ? -1 : 1, createdAt: -1 };
      break;
    case "date":
    default:
      sortQuery = { createdAt: sortOrder === "desc" ? -1 : 1 };
      break;
  }

  type LeanDoc = { _id: { toString(): string }; userId?: { toString(): string } | null; contentId: { toString(): string } };
  type LeanParentComment = {
    _id: { toString(): string };
    userId?: { toString(): string } | null;
    aiGenerated?: boolean;
    aiPersonaName?: string | null;
  };
  type LeanTargetReply = {
    _id: { toString(): string };
    userId?: { toString(): string } | null;
  };
  type RootAggregateRow = { _id: Types.ObjectId };

  const rootThreadPipeline = [
    { $match: activeCommentFilter },
    {
      $lookup: {
        from: CommentModel.collection.name,
        let: { parentId: "$inReplyToCommentId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$parentId"] }
            }
          },
          { $match: activeCommentFilter },
          { $project: { _id: 1 } }
        ],
        as: "visibleParent"
      }
    },
    {
      $addFields: {
        isFlatReplyWithParent: {
          $and: [
            { $eq: ["$replyMode", "flat"] },
            { $ne: ["$inReplyToCommentId", null] },
            { $gt: [{ $size: "$visibleParent" }, 0] }
          ]
        }
      }
    },
    { $match: { isFlatReplyWithParent: false } }
  ];

  const [rootCountRows, rootPageRows] = await Promise.all([
    CommentModel.aggregate([...rootThreadPipeline, { $count: "total" }]),
    CommentModel.aggregate([
      ...rootThreadPipeline,
      { $sort: sortQuery },
      { $skip: (page - 1) * limit },
      { $limit: limit + 1 },
      { $project: { _id: 1 } }
    ])
  ]);

  const total = (rootCountRows[0] as { total?: number } | undefined)?.total || 0;
  const hasNext = rootPageRows.length > limit;
  const rootRows = hasNext ? rootPageRows.slice(0, limit) : rootPageRows;
  const rootCommentIds = (rootRows as RootAggregateRow[]).map((row) => row._id.toString());

  const rootCommentsRaw = rootCommentIds.length > 0
    ? await CommentModel.find({ _id: { $in: rootCommentIds } }).lean()
    : [];

  const rootCommentsById = new Map<string, LeanDoc>(
    (rootCommentsRaw as unknown as LeanDoc[]).map((comment) => [comment._id.toString(), comment])
  );
  const rootComments = rootCommentIds
    .map((id) => rootCommentsById.get(id))
    .filter((comment): comment is LeanDoc => Boolean(comment));

  const descendantComments: LeanDoc[] = [];
  const seenCommentIds = new Set(rootCommentIds);
  let frontierIds = [...rootCommentIds];

  while (frontierIds.length > 0) {
    const childDocs = await CommentModel.find({
      ...activeCommentFilter,
      replyMode: "flat",
      inReplyToCommentId: { $in: frontierIds }
    })
      .sort({ createdAt: 1 })
      .lean();

    const nextFrontier: string[] = [];
    for (const childDoc of childDocs as unknown as LeanDoc[]) {
      const childId = childDoc._id.toString();
      if (seenCommentIds.has(childId)) {
        continue;
      }

      seenCommentIds.add(childId);
      descendantComments.push(childDoc);
      nextFrontier.push(childId);
    }

    frontierIds = nextFrontier;
  }

  const commentsToReturn = [...rootComments, ...descendantComments];
  const commentsById = new Map<string, LeanDoc>(
    commentsToReturn.map((comment) => [comment._id.toString(), comment])
  );

  // Get user likes if user is authenticated
  const commentIds = commentsToReturn.map((comment) => comment._id.toString());
  const userLikes = currentUserId
    ? await getUserLikesForComments(currentUserId, commentIds)
    : new Set<string>();

  // Get reply counts and top replies for each comment
  const replies = await ReplyModel.find({
    commentId: { $in: commentIds },
    isDeleted: false,
    parentReplyId: null // Only top-level replies for now
  })
    .sort({ createdAt: 1 })
    .lean();

  const flatReplyParents = commentsToReturn
    .map((comment) => {
      const replyMode = (comment as unknown as { replyMode?: "nested" | "flat" | null }).replyMode;
      const parentId = (comment as unknown as { inReplyToCommentId?: { toString(): string } | null }).inReplyToCommentId?.toString();
      return replyMode === "flat" && parentId ? parentId : null;
    })
    .filter((value): value is string => Boolean(value));

  const replyTargetCommentIds = commentsToReturn
    .map((comment) => (comment as unknown as { replyToCommentId?: { toString(): string } | null }).replyToCommentId?.toString())
    .filter((value): value is string => Boolean(value));

  const replyTargetReplyIds = commentsToReturn
    .map((comment) => (comment as unknown as { replyToReplyId?: { toString(): string } | null }).replyToReplyId?.toString())
    .filter((value): value is string => Boolean(value));

  const parentCommentIdsToFetch = [...new Set([...flatReplyParents, ...replyTargetCommentIds])]
    .filter((parentId) => !commentsById.has(parentId));

  const parentComments = parentCommentIdsToFetch.length > 0
    ? await CommentModel.find({
        _id: { $in: parentCommentIdsToFetch }
      })
        .select("_id userId aiGenerated aiPersonaName")
        .lean()
    : [];

  const targetReplies = replyTargetReplyIds.length > 0
    ? await ReplyModel.find({
        _id: { $in: [...new Set(replyTargetReplyIds)] }
      })
        .select("_id userId")
        .lean()
    : [];

  const parentCommentsById = new Map<string, LeanParentComment>(
    [
      ...commentsToReturn.map((comment) => [
        comment._id.toString(),
        comment as unknown as LeanParentComment
      ] as const),
      ...(parentComments as unknown as LeanParentComment[]).map((parentComment) => [
        parentComment._id.toString(),
        parentComment
      ] as const)
    ]
  );

  const targetRepliesById = new Map<string, LeanTargetReply>(
    (targetReplies as unknown as LeanTargetReply[]).map((targetReply) => [
      targetReply._id.toString(),
      targetReply
    ])
  );

  // Collect user IDs for profile lookup
  const userIds = [
    ...commentsToReturn.map(c => c.userId?.toString()).filter(Boolean) as string[],
    ...(replies as unknown as LeanReplyDoc[]).map(r => r.userId.toString()),
    ...(parentComments as unknown as LeanParentComment[])
      .map((parentComment) => parentComment.userId?.toString())
      .filter(Boolean) as string[],
    ...(targetReplies as unknown as LeanTargetReply[])
      .map((targetReply) => targetReply.userId?.toString())
      .filter(Boolean) as string[]
  ];
  const profileMap = await fetchProfilesForUsers(userIds);

  const enrichedReplies = await enrichRepliesRecursively(replies as unknown as LeanReplyDoc[], currentUserId);
  const repliesByComment = new Map<string, EnrichedReply[]>();
  for (const reply of enrichedReplies) {
    const existing = repliesByComment.get(reply.commentId) ?? [];
    existing.push(reply);
    repliesByComment.set(reply.commentId, existing);
  }

  // Enrich comments
  const enrichedComments: EnrichedComment[] = commentsToReturn.map(comment => {
    const userId = comment.userId?.toString() || "";
    const profile = profileMap.get(userId);

    return {
      id: comment._id.toString(),
      _id: comment._id.toString(),
      contentId: (comment as unknown as LeanDoc).contentId.toString(),
      userId,
      body: (comment as unknown as { body: string }).body,
      debateScore: (comment as unknown as { debateScore: number }).debateScore || 0,
      aiGenerated: (comment as unknown as { aiGenerated?: boolean }).aiGenerated || false,
      aiPersona: (comment as unknown as { aiPersona?: string | null }).aiPersona || null,
      aiPersonaName: (comment as unknown as { aiPersonaName?: string | null }).aiPersonaName || null,
      aiPersonaAvatar: resolveAIAvatarUrl(
        (comment as unknown as { aiPersonaAvatar?: string | null }).aiPersonaAvatar || null,
        (comment as unknown as { aiPersona?: string | null }).aiPersona || null,
        64
      ),
      hidden: (comment as unknown as { hidden?: boolean }).hidden || false,
      reportCount: (comment as unknown as { reportCount?: number }).reportCount || 0,
      moderationStatus: ((comment as unknown as { moderationStatus?: "approved" | "blocked" | "hidden" }).moderationStatus) || "approved",
      moderationReason: (comment as unknown as { moderationReason?: string | null }).moderationReason || null,
      analysis: (comment as unknown as { analysis?: EnrichedComment["analysis"] }).analysis || {
        debateScore: 0,
        questionScore: 0,
        emotionScore: 0,
        toxicityScore: 0,
        spamScore: 0,
        qualityScore: 0
      },
      likeCount: (comment as unknown as { likeCount: number }).likeCount || 0,
      replyCount: (comment as unknown as { replyCount: number }).replyCount || 0,
      isDeleted: (comment as unknown as { isDeleted: boolean }).isDeleted || false,
      deletedAt: (comment as unknown as { deletedAt: Date | null }).deletedAt || null,
      deletedBy: ((comment as unknown as { deletedBy: { toString(): string } | null | undefined }).deletedBy)?.toString() || null,
      deleteReason: (comment as unknown as { deleteReason: string | null }).deleteReason || null,
      editHistory: (comment as unknown as { editHistory: { body: string; editedAt: Date }[] }).editHistory || [],
      lastEditedAt: (comment as unknown as { lastEditedAt: Date | null }).lastEditedAt || null,
      mentions: (comment as unknown as { mentions: string[] }).mentions || [],
      createdAt: (comment as unknown as { createdAt: Date }).createdAt,
      updatedAt: (comment as unknown as { updatedAt: Date }).updatedAt,
      authorName: (comment as unknown as { aiPersonaName?: string | null }).aiPersonaName || profile?.displayName || (userId ? `User ${userId.slice(-6)}` : "IA MAAT"),
      authorAvatar: resolveAIAvatarUrl(
        (comment as unknown as { aiPersonaAvatar?: string | null }).aiPersonaAvatar || null,
        (comment as unknown as { aiPersona?: string | null }).aiPersona || null,
        64
      ) || profile?.avatarUrl || undefined,
      replies: repliesByComment.get(comment._id.toString()) ?? [],
      isLikedByCurrentUser: userLikes.has(comment._id.toString()),
      inReplyToCommentId: (comment as unknown as { inReplyToCommentId?: { toString(): string } | null }).inReplyToCommentId?.toString() || null,
      replyToCommentId: (comment as unknown as { replyToCommentId?: { toString(): string } | null }).replyToCommentId?.toString() || null,
      replyToReplyId: (comment as unknown as { replyToReplyId?: { toString(): string } | null }).replyToReplyId?.toString() || null,
      replyTargetId: (() => {
        const replyToReplyId = (comment as unknown as { replyToReplyId?: { toString(): string } | null }).replyToReplyId?.toString();
        if (replyToReplyId) {
          return replyToReplyId;
        }
        return (comment as unknown as { replyToCommentId?: { toString(): string } | null }).replyToCommentId?.toString() || null;
      })(),
      replyTargetType: (() => {
        const replyToReplyId = (comment as unknown as { replyToReplyId?: { toString(): string } | null }).replyToReplyId?.toString();
        if (replyToReplyId) {
          return "reply";
        }
        const replyToCommentId = (comment as unknown as { replyToCommentId?: { toString(): string } | null }).replyToCommentId?.toString();
        return replyToCommentId ? "comment" : null;
      })(),
      replyTargetAuthorName: (() => {
        const replyToReplyId = (comment as unknown as { replyToReplyId?: { toString(): string } | null }).replyToReplyId?.toString();
        if (replyToReplyId) {
          const targetReply = targetRepliesById.get(replyToReplyId);
          const targetUserId = targetReply?.userId?.toString();
          return targetUserId ? profileMap.get(targetUserId)?.displayName || null : null;
        }

        const replyToCommentId = (comment as unknown as { replyToCommentId?: { toString(): string } | null }).replyToCommentId?.toString();
        const targetComment = replyToCommentId ? parentCommentsById.get(replyToCommentId) : null;
        if (!targetComment) {
          return null;
        }
        if (targetComment.aiGenerated && targetComment.aiPersonaName) {
          return targetComment.aiPersonaName;
        }
        const targetUserId = targetComment.userId?.toString();
        return targetUserId ? profileMap.get(targetUserId)?.displayName || null : null;
      })(),
      replyMode: (comment as unknown as { replyMode?: "nested" | "flat" | null }).replyMode || null,
      parentAuthorName: (() => {
        const parentId = (comment as unknown as { inReplyToCommentId?: { toString(): string } | null }).inReplyToCommentId?.toString();
        const parentComment = parentId ? parentCommentsById.get(parentId) : null;

        if (!parentComment) {
          return null;
        }

        if (parentComment.aiGenerated && parentComment.aiPersonaName) {
          return parentComment.aiPersonaName;
        }

        const parentUserId = parentComment.userId?.toString();
        return parentUserId ? profileMap.get(parentUserId)?.displayName || null : null;
      })()
    };
  });

  return {
    data: enrichedComments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext,
      hasPrev: page > 1
    }
  };
}

export async function listNestedReplies(
  parentReplyId: string,
  currentUserId?: string
): Promise<EnrichedReply[]> {
  const replies = await ReplyModel.find({
    parentReplyId,
    isDeleted: false
  })
    .sort({ createdAt: 1 })
    .lean();

  return enrichRepliesRecursively(replies as unknown as LeanReplyDoc[], currentUserId);
}

// Legacy function for backwards compatibility
export async function listThread(contentId: string, currentUserId?: string): Promise<EnrichedComment[]> {
  const result = await listCommentsPaginated(contentId, {
    page: 1,
    limit: 1000,
    sortBy: "debate",
    currentUserId
  });
  return result.data;
}

// ==================== LIKES ====================

export async function addCommentLike(commentId: string, userId: string): Promise<boolean> {
  try {
    await CommentLikeModel.create({
      commentId,
      userId
    });

    await CommentModel.findByIdAndUpdate(commentId, {
      $inc: { likeCount: 1 }
    });

    return true;
  } catch (error) {
    // Duplicate key error means already liked
    return false;
  }
}

export async function removeCommentLike(commentId: string, userId: string): Promise<boolean> {
  const result = await CommentLikeModel.findOneAndDelete({
    commentId,
    userId
  });

  if (result) {
    await CommentModel.findByIdAndUpdate(commentId, {
      $inc: { likeCount: -1 }
    });
    return true;
  }

  return false;
}

export async function addReplyLike(replyId: string, userId: string): Promise<boolean> {
  try {
    await CommentLikeModel.create({
      replyId,
      userId
    });

    await ReplyModel.findByIdAndUpdate(replyId, {
      $inc: { likeCount: 1 }
    });

    return true;
  } catch (error) {
    return false;
  }
}

export async function removeReplyLike(replyId: string, userId: string): Promise<boolean> {
  const result = await CommentLikeModel.findOneAndDelete({
    replyId,
    userId
  });

  if (result) {
    await ReplyModel.findByIdAndUpdate(replyId, {
      $inc: { likeCount: -1 }
    });
    return true;
  }

  return false;
}

// ==================== REPORTS ====================

export async function createReport(input: {
  commentId?: string;
  replyId?: string;
  reporterId: string;
  reason: "spam" | "harassment" | "hate_speech" | "misinformation" | "inappropriate" | "other";
  description?: string;
}) {
  return CommentReportModel.create({
    commentId: input.commentId || null,
    replyId: input.replyId || null,
    reporterId: input.reporterId,
    reason: input.reason,
    description: input.description || "",
    status: "pending"
  });
}

export async function hasUserReported(
  userId: string,
  commentId?: string,
  replyId?: string
): Promise<boolean> {
  const query: Record<string, unknown> = { reporterId: userId };
  if (commentId) query.commentId = commentId;
  if (replyId) query.replyId = replyId;

  const count = await CommentReportModel.countDocuments(query);
  return count > 0;
}

// ==================== STATS & COUNTERS ====================

export async function getContentCommentStats(contentId: string): Promise<{
  commentCount: number;
  replyCount: number;
  totalCount: number;
}> {
  const comments = await CommentModel.find({ contentId, isDeleted: false }).select("_id").lean();
  const commentIds = comments.map((comment) => comment._id);
  const commentCount = comments.length;
  const replyCount = commentIds.length > 0
    ? await ReplyModel.countDocuments({ commentId: { $in: commentIds }, isDeleted: false })
    : 0;

  return {
    commentCount,
    replyCount,
    totalCount: commentCount + replyCount
  };
}

export async function getUserCommentCount(userId: string): Promise<number> {
  const [comments, replies] = await Promise.all([
    CommentModel.countDocuments({ userId, isDeleted: false }),
    ReplyModel.countDocuments({ userId, isDeleted: false })
  ]);
  return comments + replies;
}

// Check if user is authorized to modify/delete a comment/reply
export async function isAuthorized(
  itemId: string,
  userId: string,
  type: "comment" | "reply"
): Promise<boolean> {
  const Model = type === "comment" ? CommentModel : ReplyModel;
  type ItemWithUserId = { userId: { toString(): string } };
  const item = await Model.findById(itemId).select("userId").lean() as unknown as ItemWithUserId | null;
  if (!item) return false;
  return item.userId.toString() === userId;
}
