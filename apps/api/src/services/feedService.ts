import mongoose from "mongoose";
import { redisKeys } from "@maat/shared";
import { getCache, setCache, invalidateCacheKeys } from "./cacheService.js";
import { storeFeedSnapshot, getLatestSnapshot } from "../repositories/feedRepository.js";
import { ContentModel } from "../models/Content.js";
import { ContentScoreModel } from "../models/ContentScore.js";
import { ContentClassificationModel } from "../models/ContentClassification.js";
import { ContentEnrichmentModel } from "../models/ContentEnrichment.js";
import { CommentModel } from "../models/Comment.js";
import { CommunityPostModel } from "../models/CommunityPost.js";
import { ReplyModel } from "../models/Reply.js";
import { decodeCursor, encodeCursor } from "@maat/shared";

interface CursorData {
  index: number;
}

// TTL constants in seconds
const CACHE_TTL = {
  global: 300,  // 5 minutes - cache longer to prevent repeated DB queries
  user: 60,     // 1 minute
  session: 300  // 5 minutes
};

// Maximum items to fetch for feed cache (all published content)
const MAX_FEED_ITEMS = 2000;

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export interface FeedItem {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  mediaType: "video" | "audio";
  creator: {
    name: string;
    handle: string;
    avatar?: string;
  };
  sourceProvider: "youtube" | "tiktok";
  bucket: "viral" | "educational" | "deep";
  scores: {
    likes: number;
    comments: number;
    views: number;
    finalScore: number;
  };
  community?: {
    isTrending: boolean;
    isActiveDiscussion: boolean;
    hasDebateThread: boolean;
    participantCount: number;
    discussionState: "idle" | "active" | "ready" | "debate";
    ctaKind: "join_discussion" | "start_debate" | "join_debate" | null;
    ctaLabel: string | null;
  };
  createdAt: string;
  transcript?: string;
  summary?: string;
  tags: string[];
}

export interface FeedResponse {
  items: FeedItem[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
}

export interface FeedCacheData {
  items: FeedItem[];
  nextCursor: string | null;
  totalCount: number;
  version: string;
  createdAt: string;
}

interface DiscussionSignal {
  totalCommentCount: number;
  participantCount: number;
  substantiveCommentCount: number;
  lowSignalCommentCount: number;
  averageDebateScore: number;
  questionCount: number;
  directReplyCount: number;
  structuredReplyCount: number;
  nestedReplyCount: number;
  seriousnessScore: number;
}

interface LinkedDebateSignal {
  id: string;
  participantCount: number;
}

const THREAD_SIGNAL_CONFIG = {
  comment: {
    minSubstantiveWordCount: 6,
    lowSignalWordCount: 4,
    maxSubstantiveToxicity: 0.35,
    maxSubstantiveSpam: 0.35,
    minSubstantiveDebateScore: 4,
    minSubstantiveQuestionScore: 0.45,
    minSubstantiveQualityScore: 0.6,
    lowSignalMaxDebateScore: 2,
    lowSignalMaxQuestionScore: 0.2,
    lowSignalMaxQualityScore: 0.45,
    lowSignalMinToxicity: 0.5,
    lowSignalMinSpam: 0.5
  },
  reply: {
    minStructuredReplyWordCount: 6
  },
  scoreWeights: {
    substantiveComment: 1.8,
    participant: 1.5,
    backAndForth: 1.15,
    question: 0.9,
    debateAverage: 0.42,
    lowSignalRatioPenalty: 5.5,
    looseCommentPenalty: 0.12,
    maxBackAndForthCount: 6
  },
  thresholds: {
    linkedDebateTrendingSeriousness: 8.5,
    linkedDebateTrendingParticipants: 4,
    linkedDebateTrendingSubstantiveComments: 4,
    ready: {
      minParticipants: 2,
      minSubstantiveComments: 3,
      minSubstantiveRatio: 0.42,
      maxLowSignalRatio: 0.45,
      minBackAndForthCount: 2,
      minSeriousnessScore: 8.25,
      minAverageDebateScore: 4.8,
      minQuestionCount: 2
    },
    active: {
      minParticipants: 2,
      minSubstantiveComments: 2,
      minSubstantiveRatio: 0.34,
      maxLowSignalRatio: 0.6,
      minBackAndForthCount: 1,
      minSeriousnessScore: 4.75
    },
    readyTrending: {
      minSeriousnessScore: 10,
      minSubstantiveComments: 5,
      minParticipants: 4
    },
    activeTrending: {
      minSeriousnessScore: 7.5,
      minSubstantiveComments: 5
    }
  }
} as const;

function buildSubstantiveCommentAggregation(contentIds: mongoose.Types.ObjectId[]) {
  return [
    {
      $match: {
        contentId: { $in: contentIds },
        hidden: false,
        isDeleted: false,
        moderationStatus: "approved"
      }
    },
    {
      $addFields: {
        bodyWordCount: {
          $size: {
            $filter: {
              input: {
                $split: [
                  {
                    $trim: {
                      input: { $ifNull: ["$body", ""] }
                    }
                  },
                  " "
                ]
              },
              as: "word",
              cond: { $ne: ["$$word", ""] }
            }
          }
        },
        toxicitySignal: { $ifNull: ["$analysis.toxicityScore", 0] },
        spamSignal: { $ifNull: ["$analysis.spamScore", 0] },
        questionSignal: { $ifNull: ["$analysis.questionScore", 0] },
        qualitySignal: { $ifNull: ["$qualityScore", 0] },
        debateSignal: { $ifNull: ["$debateScore", 0] }
      }
    },
    {
      $addFields: {
        isSubstantive: {
          $and: [
            { $gte: ["$bodyWordCount", THREAD_SIGNAL_CONFIG.comment.minSubstantiveWordCount] },
            { $lt: ["$toxicitySignal", THREAD_SIGNAL_CONFIG.comment.maxSubstantiveToxicity] },
            { $lt: ["$spamSignal", THREAD_SIGNAL_CONFIG.comment.maxSubstantiveSpam] },
            {
              $or: [
                { $gte: ["$debateSignal", THREAD_SIGNAL_CONFIG.comment.minSubstantiveDebateScore] },
                { $gte: ["$questionSignal", THREAD_SIGNAL_CONFIG.comment.minSubstantiveQuestionScore] },
                { $gte: ["$qualitySignal", THREAD_SIGNAL_CONFIG.comment.minSubstantiveQualityScore] }
              ]
            }
          ]
        }
      }
    },
    {
        $group: {
          _id: "$contentId",
          totalCommentCount: { $sum: 1 },
          participantIds: {
            $addToSet: {
              $cond: ["$isSubstantive", "$userId", null]
            }
          },
        substantiveCommentCount: {
          $sum: {
            $cond: ["$isSubstantive", 1, 0]
          }
        },
        lowSignalCommentCount: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $lt: ["$bodyWordCount", THREAD_SIGNAL_CONFIG.comment.lowSignalWordCount] },
                  {
                    $and: [
                      { $lt: ["$debateSignal", THREAD_SIGNAL_CONFIG.comment.lowSignalMaxDebateScore] },
                      { $lt: ["$questionSignal", THREAD_SIGNAL_CONFIG.comment.lowSignalMaxQuestionScore] },
                      { $lt: ["$qualitySignal", THREAD_SIGNAL_CONFIG.comment.lowSignalMaxQualityScore] }
                    ]
                  },
                  { $gte: ["$toxicitySignal", THREAD_SIGNAL_CONFIG.comment.lowSignalMinToxicity] },
                  { $gte: ["$spamSignal", THREAD_SIGNAL_CONFIG.comment.lowSignalMinSpam] }
                ]
              },
              1,
              0
            ]
          }
        },
        averageDebateScore: {
          $avg: {
            $cond: ["$isSubstantive", "$debateSignal", null]
          }
        },
        questionCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  "$isSubstantive",
                  { $gte: ["$questionSignal", THREAD_SIGNAL_CONFIG.comment.minSubstantiveQuestionScore] }
                ]
              },
              1,
              0
            ]
          }
        },
        directReplyCount: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ["$replyMode", "flat"] },
                  { $ne: ["$inReplyToCommentId", null] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $project: {
        totalCommentCount: 1,
        participantCount: {
          $size: {
            $filter: {
              input: "$participantIds",
              as: "participantId",
              cond: { $ne: ["$$participantId", null] }
            }
          }
        },
        substantiveCommentCount: 1,
        lowSignalCommentCount: 1,
        averageDebateScore: { $ifNull: ["$averageDebateScore", 0] },
        questionCount: 1,
        directReplyCount: 1
      }
    }
  ];
}

function buildReplyStructureAggregation(contentIds: mongoose.Types.ObjectId[]) {
  return [
    {
      $lookup: {
        from: "comments",
        localField: "commentId",
        foreignField: "_id",
        as: "parentComment"
      }
    },
    {
      $unwind: "$parentComment"
    },
    {
      $match: {
        isDeleted: false,
        "parentComment.contentId": { $in: contentIds },
        "parentComment.hidden": false,
        "parentComment.isDeleted": false
      }
    },
    {
      $addFields: {
        bodyWordCount: {
          $size: {
            $filter: {
              input: {
                $split: [
                  {
                    $trim: {
                      input: { $ifNull: ["$body", ""] }
                    }
                  },
                  " "
                ]
              },
              as: "word",
              cond: { $ne: ["$$word", ""] }
            }
          }
        }
      }
    },
    {
      $addFields: {
        isStructuredReply: { $gte: ["$bodyWordCount", THREAD_SIGNAL_CONFIG.reply.minStructuredReplyWordCount] }
      }
    },
    {
      $group: {
        _id: "$parentComment.contentId",
        structuredParticipantIds: {
          $addToSet: {
            $cond: ["$isStructuredReply", "$userId", null]
          }
        },
        structuredReplyCount: {
          $sum: {
            $cond: ["$isStructuredReply", 1, 0]
          }
        },
        nestedReplyCount: {
          $sum: {
            $cond: [{ $ne: ["$parentReplyId", null] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        structuredReplyParticipantCount: {
          $size: {
            $filter: {
              input: "$structuredParticipantIds",
              as: "participantId",
              cond: { $ne: ["$$participantId", null] }
            }
          }
        },
        structuredReplyCount: 1,
        nestedReplyCount: 1
      }
    }
  ];
}

function computeThreadSeriousness(input: {
  totalCommentCount: number;
  participantCount: number;
  substantiveCommentCount: number;
  lowSignalCommentCount: number;
  averageDebateScore: number;
  questionCount: number;
  directReplyCount: number;
  structuredReplyCount: number;
  nestedReplyCount: number;
}) {
  const totalCount = Math.max(1, input.totalCommentCount);
  const substantiveRatio = input.substantiveCommentCount / totalCount;
  const lowSignalRatio = input.lowSignalCommentCount / totalCount;
  const backAndForthCount = input.directReplyCount + input.structuredReplyCount + input.nestedReplyCount;

  const seriousnessScore =
    (input.substantiveCommentCount * THREAD_SIGNAL_CONFIG.scoreWeights.substantiveComment) +
    (input.participantCount * THREAD_SIGNAL_CONFIG.scoreWeights.participant) +
    (Math.min(backAndForthCount, THREAD_SIGNAL_CONFIG.scoreWeights.maxBackAndForthCount) * THREAD_SIGNAL_CONFIG.scoreWeights.backAndForth) +
    (input.questionCount * THREAD_SIGNAL_CONFIG.scoreWeights.question) +
    (input.averageDebateScore * THREAD_SIGNAL_CONFIG.scoreWeights.debateAverage) -
    (lowSignalRatio * THREAD_SIGNAL_CONFIG.scoreWeights.lowSignalRatioPenalty) -
    (Math.max(0, totalCount - input.substantiveCommentCount - input.directReplyCount) * THREAD_SIGNAL_CONFIG.scoreWeights.looseCommentPenalty);

  return {
    seriousnessScore,
    substantiveRatio,
    lowSignalRatio,
    backAndForthCount
  };
}

function deriveCommunityState(input: {
  totalCommentCount: number;
  participantCount: number;
  substantiveCommentCount: number;
  lowSignalCommentCount: number;
  averageDebateScore: number;
  questionCount: number;
  directReplyCount: number;
  structuredReplyCount: number;
  nestedReplyCount: number;
  hasDebateThread: boolean;
}) {
  const { seriousnessScore, substantiveRatio, lowSignalRatio, backAndForthCount } = computeThreadSeriousness(input);

  if (input.hasDebateThread) {
    return {
      isTrending:
        seriousnessScore >= THREAD_SIGNAL_CONFIG.thresholds.linkedDebateTrendingSeriousness ||
        input.participantCount >= THREAD_SIGNAL_CONFIG.thresholds.linkedDebateTrendingParticipants ||
        input.substantiveCommentCount >= THREAD_SIGNAL_CONFIG.thresholds.linkedDebateTrendingSubstantiveComments,
      isActiveDiscussion: true,
      hasDebateThread: true,
      participantCount: input.participantCount,
      discussionState: "debate" as const,
      ctaLabel: "Rejoindre le debat",
      ctaKind: "join_debate" as const
    };
  }

  const isReadyForDebate =
    input.participantCount >= THREAD_SIGNAL_CONFIG.thresholds.ready.minParticipants &&
    input.substantiveCommentCount >= THREAD_SIGNAL_CONFIG.thresholds.ready.minSubstantiveComments &&
    substantiveRatio >= THREAD_SIGNAL_CONFIG.thresholds.ready.minSubstantiveRatio &&
    lowSignalRatio <= THREAD_SIGNAL_CONFIG.thresholds.ready.maxLowSignalRatio &&
    backAndForthCount >= THREAD_SIGNAL_CONFIG.thresholds.ready.minBackAndForthCount &&
    seriousnessScore >= THREAD_SIGNAL_CONFIG.thresholds.ready.minSeriousnessScore &&
    (
      input.averageDebateScore >= THREAD_SIGNAL_CONFIG.thresholds.ready.minAverageDebateScore ||
      input.questionCount >= THREAD_SIGNAL_CONFIG.thresholds.ready.minQuestionCount
    );

  const isActiveDiscussion =
    input.participantCount >= THREAD_SIGNAL_CONFIG.thresholds.active.minParticipants &&
    input.substantiveCommentCount >= THREAD_SIGNAL_CONFIG.thresholds.active.minSubstantiveComments &&
    substantiveRatio >= THREAD_SIGNAL_CONFIG.thresholds.active.minSubstantiveRatio &&
    lowSignalRatio <= THREAD_SIGNAL_CONFIG.thresholds.active.maxLowSignalRatio &&
    backAndForthCount >= THREAD_SIGNAL_CONFIG.thresholds.active.minBackAndForthCount &&
    seriousnessScore >= THREAD_SIGNAL_CONFIG.thresholds.active.minSeriousnessScore;

  if (isReadyForDebate) {
    return {
      isTrending:
        seriousnessScore >= THREAD_SIGNAL_CONFIG.thresholds.readyTrending.minSeriousnessScore ||
        input.substantiveCommentCount >= THREAD_SIGNAL_CONFIG.thresholds.readyTrending.minSubstantiveComments ||
        input.participantCount >= THREAD_SIGNAL_CONFIG.thresholds.readyTrending.minParticipants,
      isActiveDiscussion: true,
      hasDebateThread: false,
      participantCount: input.participantCount,
      discussionState: "ready" as const,
      ctaLabel: "Lancer le debat",
      ctaKind: "start_debate" as const
    };
  }

  if (isActiveDiscussion) {
    return {
      isTrending:
        seriousnessScore >= THREAD_SIGNAL_CONFIG.thresholds.activeTrending.minSeriousnessScore ||
        input.substantiveCommentCount >= THREAD_SIGNAL_CONFIG.thresholds.activeTrending.minSubstantiveComments,
      isActiveDiscussion: true,
      hasDebateThread: false,
      participantCount: input.participantCount,
      discussionState: "active" as const,
      ctaLabel: "Participer a la discussion",
      ctaKind: "join_discussion" as const
    };
  }

  return {
    isTrending: false,
    isActiveDiscussion: false,
    hasDebateThread: false,
    participantCount: input.participantCount,
    discussionState: "idle" as const,
    ctaLabel: null,
    ctaKind: null
  };
}

async function getDiscussionSignals(contentIds: string[]) {
  const objectIds = contentIds.map((id) => new mongoose.Types.ObjectId(id));
  const [commentStats, replyStats, linkedDebates] = await Promise.all([
    CommentModel.aggregate(buildSubstantiveCommentAggregation(objectIds)),
    ReplyModel.aggregate(buildReplyStructureAggregation(objectIds)),
    CommunityPostModel.find({
      type: "discussion",
      isHidden: false,
      feedContentId: { $in: contentIds }
    })
      .select("_id feedContentId participantCount")
      .lean()
  ]);

  const commentSignalMap = new Map<string, DiscussionSignal>();
  const replySignalMap = new Map<string, { structuredReplyCount: number; nestedReplyCount: number; structuredReplyParticipantCount: number }>();

  replyStats.forEach((entry: any) => {
    replySignalMap.set(entry._id.toString(), {
      structuredReplyCount: entry.structuredReplyCount || 0,
      nestedReplyCount: entry.nestedReplyCount || 0,
      structuredReplyParticipantCount: entry.structuredReplyParticipantCount || 0
    });
  });

  commentStats.forEach((entry: any) => {
    const replySignal = replySignalMap.get(entry._id.toString());
    const participantCount = Math.max(
      entry.participantCount || 0,
      (entry.participantCount || 0) + ((replySignal?.structuredReplyParticipantCount || 0) > 0 ? 1 : 0)
    );
    const partialSignal = {
      totalCommentCount: entry.totalCommentCount || 0,
      participantCount,
      substantiveCommentCount: entry.substantiveCommentCount || 0,
      lowSignalCommentCount: entry.lowSignalCommentCount || 0,
      averageDebateScore: entry.averageDebateScore || 0,
      questionCount: entry.questionCount || 0,
      directReplyCount: entry.directReplyCount || 0,
      structuredReplyCount: replySignal?.structuredReplyCount || 0,
      nestedReplyCount: replySignal?.nestedReplyCount || 0
    };
    commentSignalMap.set(entry._id.toString(), {
      ...partialSignal,
      seriousnessScore: computeThreadSeriousness(partialSignal).seriousnessScore
    });
  });

  const linkedDebateMap = new Map<string, LinkedDebateSignal>();
  linkedDebates.forEach((debate: any) => {
    if (!debate.feedContentId) {
      return;
    }

    linkedDebateMap.set(debate.feedContentId.toString(), {
      id: debate._id.toString(),
      participantCount: debate.participantCount || 0
    });
  });

  return { commentSignalMap, linkedDebateMap };
}

async function buildFeedItemFromContent(
  content: any,
  discussionSignals?: {
    commentSignalMap: Map<string, DiscussionSignal>;
    linkedDebateMap: Map<string, LinkedDebateSignal>;
  }
): Promise<FeedItem> {
  const contentId = content._id.toString();
  const commentSignalPromise = discussionSignals
    ? Promise.resolve(discussionSignals.commentSignalMap.get(contentId))
    : CommentModel.aggregate(buildSubstantiveCommentAggregation([new mongoose.Types.ObjectId(contentId)])).then((entries) => entries[0] ? {
      totalCommentCount: entries[0].totalCommentCount || 0,
      participantCount: entries[0].participantCount || 0,
      substantiveCommentCount: entries[0].substantiveCommentCount || 0,
      lowSignalCommentCount: entries[0].lowSignalCommentCount || 0,
      averageDebateScore: entries[0].averageDebateScore || 0,
      questionCount: entries[0].questionCount || 0,
      directReplyCount: entries[0].directReplyCount || 0,
      structuredReplyCount: 0,
      nestedReplyCount: 0,
      seriousnessScore: 0
    } : undefined);
  const replySignalPromise = discussionSignals
    ? Promise.resolve(undefined)
    : ReplyModel.aggregate(buildReplyStructureAggregation([new mongoose.Types.ObjectId(contentId)])).then((entries) => entries[0] ? {
      structuredReplyCount: entries[0].structuredReplyCount || 0,
      nestedReplyCount: entries[0].nestedReplyCount || 0,
      structuredReplyParticipantCount: entries[0].structuredReplyParticipantCount || 0
    } : undefined);
  const linkedDebatePromise = discussionSignals
    ? Promise.resolve(discussionSignals.linkedDebateMap.get(contentId))
    : CommunityPostModel.findOne({
      type: "discussion",
      isHidden: false,
      feedContentId: contentId
    })
      .select("_id participantCount")
      .lean()
      .then((debate: any) => debate ? {
        id: debate._id.toString(),
        participantCount: debate.participantCount || 0
      } : undefined);

  const [score, classification, enrichment, commentSignal, replySignal, linkedDebate] = await Promise.all([
    ContentScoreModel.findOne({ contentId: content._id }),
    ContentClassificationModel.findOne({ contentId: content._id }),
    ContentEnrichmentModel.findOne({ contentId: content._id }),
    commentSignalPromise,
    replySignalPromise,
    linkedDebatePromise
  ]);
  const mergedCommentSignal = commentSignal ? {
    ...commentSignal,
    participantCount: Math.max(
      commentSignal.participantCount || 0,
      (commentSignal.participantCount || 0) + ((replySignal?.structuredReplyParticipantCount || 0) > 0 ? 1 : 0)
    ),
    structuredReplyCount: replySignal?.structuredReplyCount ?? commentSignal.structuredReplyCount ?? 0,
    nestedReplyCount: replySignal?.nestedReplyCount ?? commentSignal.nestedReplyCount ?? 0
  } : undefined;
  const community = deriveCommunityState({
    totalCommentCount: mergedCommentSignal?.totalCommentCount ?? 0,
    participantCount: linkedDebate?.participantCount ?? mergedCommentSignal?.participantCount ?? 0,
    substantiveCommentCount: mergedCommentSignal?.substantiveCommentCount ?? 0,
    lowSignalCommentCount: mergedCommentSignal?.lowSignalCommentCount ?? 0,
    averageDebateScore: mergedCommentSignal?.averageDebateScore ?? 0,
    questionCount: mergedCommentSignal?.questionCount ?? 0,
    directReplyCount: mergedCommentSignal?.directReplyCount ?? 0,
    structuredReplyCount: mergedCommentSignal?.structuredReplyCount ?? 0,
    nestedReplyCount: mergedCommentSignal?.nestedReplyCount ?? 0,
    hasDebateThread: !!linkedDebate
  });
  const commentCount = score?.comments || 0;
  
  return {
    id: contentId,
    title: content.title,
    description: content.description,
    mediaUrl: content.mediaUrl,
    thumbnailUrl: content.thumbnailUrl || undefined,
    mediaType: content.mediaType,
    creator: {
      name: content.creatorName,
      handle: content.creatorName?.toLowerCase().replace(/\s+/g, '') || 'unknown'
    },
    sourceProvider: content.sourceProvider,
    bucket: classification?.bucket || "deep",
    scores: {
      likes: score?.likes || 0,
      comments: commentCount,
      views: score?.views || 0,
      finalScore: score?.finalScore || 0
    },
    community,
    createdAt: content.createdAt.toISOString(),
    transcript: content.transcript,
    summary: enrichment?.summary || content.description,
    tags: Array.isArray(content.tags) ? content.tags.filter((tag: any) => typeof tag === 'string') : []
  };
}

export async function getGlobalFeed(cursor?: string, limit = 20, shuffle = true): Promise<FeedResponse> {
  const cacheKey = redisKeys.globalFeed;

  // Try cache first - always use cache if available for consistent pagination
  const cached = await getCache<FeedCacheData>(cacheKey);
  if (cached) {
    const startIndex = cursor ? decodeCursor<CursorData>(cursor).index : 0;
    const endIndex = startIndex + limit;
    const items = cached.items.slice(startIndex, endIndex);
    const hasMore = endIndex < cached.items.length;
    const nextCursor = hasMore ? encodeCursor({ index: endIndex }) : null;

    return {
      items,
      nextCursor,
      hasMore,
      totalCount: cached.items.length
    };
  }

  // Cache miss - build from database
  // Get ALL published video content from YouTube/TikTok only (no internal/audio)
  const contents = await ContentModel.find({
    processingStatus: "published",
    sourceProvider: { $in: ["youtube", "tiktok"] },
    mediaType: "video"
  })
    .sort({ createdAt: -1 })
    .limit(MAX_FEED_ITEMS);

  // Get classifications for content filtering
  const contentIds = contents.map(c => c._id);
  const classifications = await ContentClassificationModel.find({
    contentId: { $in: contentIds },
    bucket: { $in: ["viral", "educational", "deep"] }
  }).select("contentId bucket");

  // Filter to only content with valid bucket classifications
  const validContentIds = new Set(classifications.map(c => c.contentId.toString()));
  const validContents = contents.filter(c => validContentIds.has(c._id.toString()));
  const discussionSignals = await getDiscussionSignals(validContents.map((content) => content._id.toString()));

  let items = await Promise.all(
    validContents.map(content => buildFeedItemFromContent(content, discussionSignals))
  );

  // Shuffle once when building cache for variety between cache refreshes
  if (shuffle) {
    items = shuffleArray(items);
  }

  // Cache the full result
  const cacheData: FeedCacheData = {
    items,
    nextCursor: items.length > limit ? encodeCursor({ index: limit }) : null,
    totalCount: items.length,
    version: "v1",
    createdAt: new Date().toISOString()
  };
  
  await setCache(cacheKey, cacheData, CACHE_TTL.global);

  // Store snapshot for persistence
  await storeFeedSnapshot({
    scope: "global",
    scopeId: "default",
    contentIds: validContents.map(c => c._id),
    nextCursor: cacheData.nextCursor
  });

  // Return requested slice
  const startIndex = cursor ? decodeCursor<CursorData>(cursor).index : 0;
  const endIndex = startIndex + limit;
  const slicedItems = items.slice(startIndex, endIndex);
  const hasMore = endIndex < items.length;
  const nextCursor = hasMore ? encodeCursor({ index: endIndex }) : null;

  return {
    items: slicedItems,
    nextCursor,
    hasMore,
    totalCount: items.length
  };
}

export async function getUserFeed(userId: string, cursor?: string, limit = 20): Promise<FeedResponse> {
  const cacheKey = redisKeys.userFeed(userId);
  
  // Try cache first
  const cached = await getCache<FeedCacheData>(cacheKey);
  if (cached) {
    const startIndex = cursor ? decodeCursor<CursorData>(cursor).index : 0;
    const endIndex = startIndex + limit;
    const items = cached.items.slice(startIndex, endIndex);
    const hasMore = endIndex < cached.items.length;
    const nextCursor = hasMore ? encodeCursor({ index: endIndex }) : null;
    
    return {
      items,
      nextCursor,
      hasMore,
      totalCount: cached.items.length
    };
  }

  // Cache miss - build personalized feed
  // Get user interest vector
  const { getUserInterests } = await import("./interestService.js");
  const userInterests = await getUserInterests(userId);
  
  // Get global feed as base content pool
  const globalFeed = await getGlobalFeed();
  
  // Get user's learning progress for ranking boost
  const { listLearningProgress } = await import("./learningProgressService.js");
  const contentIds = globalFeed.items.map((item: any) => item.id);
  const learningProgress = await listLearningProgress(userId, contentIds);
  
  // Apply recommendation engine to personalize ranking
  const { rankForUser } = await import("../ai/recommendationEngine.js");
  const personalizedItems = await rankForUser({
    items: globalFeed.items,
    interests: userInterests,
    learningProgress
  });

  // Apply pagination to personalized results
  const startIndex = cursor ? decodeCursor<CursorData>(cursor).index : 0;
  const endIndex = startIndex + limit;
  const slicedItems = personalizedItems.slice(startIndex, endIndex);
  const hasMore = endIndex < personalizedItems.length;
  const nextCursor = hasMore ? encodeCursor({ index: endIndex }) : null;
  
  // Cache with user-specific TTL
  const cacheData: FeedCacheData = {
    items: personalizedItems,
    nextCursor,
    totalCount: personalizedItems.length,
    version: "v1",
    createdAt: new Date().toISOString()
  };
  
  await setCache(cacheKey, cacheData, CACHE_TTL.user);

  // Store snapshot
  const mongoose = await import("mongoose");
  await storeFeedSnapshot({
    scope: "user",
    scopeId: userId,
    contentIds: personalizedItems.map((item: any) => new mongoose.default.Types.ObjectId(item.id)),
    nextCursor
  });

  return {
    items: slicedItems,
    nextCursor,
    hasMore,
    totalCount: personalizedItems.length
  };
}

export async function getSessionFeed(sessionId: string): Promise<FeedResponse | null> {
  const cacheKey = redisKeys.sessionFeed(sessionId);
  
  // Try cache first
  const cached = await getCache<FeedCacheData>(cacheKey);
  if (cached) {
    return {
      items: cached.items,
      nextCursor: cached.nextCursor,
      hasMore: !!cached.nextCursor,
      totalCount: cached.totalCount
    };
  }

  // Check MongoDB snapshot for session state
  const snapshot = await getLatestSnapshot("session", sessionId);
  if (!snapshot) {
    return null;
  }

  // Rehydrate content from snapshot (filter to video content only)
  const contents = await ContentModel.find({
    _id: { $in: snapshot.contentIds },
    processingStatus: "published",
    sourceProvider: { $in: ["youtube", "tiktok"] },
    mediaType: "video"
  });

  const items = await Promise.all(
    contents.map(content => buildFeedItemFromContent(content))
  );

  const cacheData: FeedCacheData = {
    items,
    nextCursor: snapshot.nextCursor,
    totalCount: items.length,
    version: "v1",
    createdAt: snapshot.updatedAt.toISOString()
  };
  
  await setCache(cacheKey, cacheData, CACHE_TTL.session);

  return {
    items,
    nextCursor: snapshot.nextCursor,
    hasMore: !!snapshot.nextCursor,
    totalCount: items.length
  };
}

export async function updateSessionFeed(sessionId: string, contentIds: string[], nextCursor: string | null) {
  const cacheKey = redisKeys.sessionFeed(sessionId);
  
  // Convert string IDs to ObjectIds for MongoDB
  const mongoose = await import("mongoose");
  const objectIdContentIds = contentIds.map(id => new mongoose.default.Types.ObjectId(id));
  
  // Update MongoDB snapshot
  await storeFeedSnapshot({
    scope: "session",
    scopeId: sessionId,
    contentIds: objectIdContentIds,
    nextCursor
  });

  // Invalidate cache to force refresh on next request
  await invalidateCacheKeys([cacheKey]);
}

export async function invalidateFeedCache(contentId?: string, userId?: string) {
  const keysToInvalidate = [redisKeys.globalFeed];
  
  if (userId) {
    keysToInvalidate.push(redisKeys.userFeed(userId));
  }
  
  if (contentId) {
    keysToInvalidate.push(redisKeys.hotContent(contentId));
  }

  await invalidateCacheKeys(keysToInvalidate);
}

export async function refreshFeedCache() {
  // Invalidate global cache to force rebuild
  await invalidateCacheKeys([redisKeys.globalFeed]);
  
  // Trigger cache rebuild by calling getGlobalFeed
  await getGlobalFeed();
  
  console.log("Feed cache refreshed successfully");
}

export { buildFeedItemFromContent };
