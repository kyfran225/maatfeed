import { DebateThreadModel } from "../models/DebateThread.js";
import { CommentModel } from "../models/Comment.js";
import { ReplyModel } from "../models/Reply.js";
import { getCache, setCache, invalidateCachePattern } from "./cacheService.js";

export interface CreateDebateThreadInput {
  contentId: string;
  title: string;
  description: string;
  tags?: string[];
}

export interface DebateThreadWithStats {
  id: string;
  contentId: string;
  title: string;
  description: string;
  isActive: boolean;
  debateScore: number;
  participantCount: number;
  topComments: Array<{
    commentId: string;
    score: number;
    position: number;
  }>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export async function createDebateThread(input: CreateDebateThreadInput): Promise<DebateThreadWithStats> {
  const debateThread = new DebateThreadModel({
    contentId: input.contentId,
    title: input.title,
    description: input.description,
    tags: input.tags || []
  });

  await debateThread.save();
  await invalidateCommunityCache();

  return formatDebateThread(debateThread);
}

export async function getDebateThread(contentId: string): Promise<DebateThreadWithStats | null> {
  const cacheKey = `debate:thread:${contentId}`;
  
  // Try cache first
  const cached = await getCache<DebateThreadWithStats>(cacheKey);
  if (cached) {
    return cached;
  }

  const debateThread = await DebateThreadModel.findOne({ contentId, isActive: true })
    .populate('topComments.commentId')
    .lean();

  if (!debateThread) {
    return null;
  }

  const formatted = formatDebateThread(debateThread);
  
  // Cache for 5 minutes
  await setCache(cacheKey, formatted, 300);
  
  return formatted;
}

export async function getTopDebates(limit: number = 20): Promise<DebateThreadWithStats[]> {
  const cacheKey = `debate:top:${limit}`;
  
  // Try cache first
  const cached = await getCache<DebateThreadWithStats[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const debates = await DebateThreadModel.find({ isActive: true })
    .sort({ debateScore: -1, participantCount: -1 })
    .limit(limit)
    .populate('topComments.commentId')
    .lean();

  const formatted = debates.map(formatDebateThread);
  
  // Cache for 10 minutes
  await setCache(cacheKey, formatted, 600);
  
  return formatted;
}

export async function rankDebateThread(contentId: string): Promise<void> {
  const debateThread = await DebateThreadModel.findOne({ contentId });
  if (!debateThread) {
    return;
  }

  // Get all comments for this content with their debate scores
  const comments = await CommentModel.find({ contentId })
    .sort({ debateScore: -1, createdAt: -1 })
    .lean();

  // Calculate participant count (unique users who commented)
  const participantCount = new Set(comments.map(c => c.userId.toString())).size;

  // Calculate overall debate score based on comment activity
  const debateScore = comments.reduce((score, comment) => {
    return score + (comment.debateScore || 0) + 1; // Base point for each comment
  }, 0);

  // Get top 5 comments
  const topComments = comments.slice(0, 5).map((comment, index) => ({
    commentId: comment._id,
    score: comment.debateScore || 0,
    position: index + 1
  }));

  // Update debate thread
  await DebateThreadModel.updateOne(
    { contentId },
    {
      debateScore,
      participantCount,
      topComments,
      updatedAt: new Date()
    }
  );

  await invalidateCommunityCache();
}

export async function boostHighDebateComments(contentId: string): Promise<void> {
  // Get comments with high debate scores
  const highDebateComments = await CommentModel.find({
    contentId,
    debateScore: { $gte: 5 }
  });

  // Boost their visibility by increasing their debate score
  for (const comment of highDebateComments) {
    await CommentModel.updateOne(
      { _id: comment._id },
      { $inc: { debateScore: 2 } }
    );
  }

  // Re-rank the debate thread
  await rankDebateThread(contentId);
}

function formatDebateThread(debateThread: any): DebateThreadWithStats {
  return {
    id: debateThread._id.toString(),
    contentId: debateThread.contentId.toString(),
    title: debateThread.title,
    description: debateThread.description,
    isActive: debateThread.isActive,
    debateScore: debateThread.debateScore || 0,
    participantCount: debateThread.participantCount || 0,
    topComments: debateThread.topComments?.map((tc: any) => ({
      commentId: tc.commentId?._id?.toString() || tc.commentId?.toString(),
      score: tc.score,
      position: tc.position
    })) || [],
    tags: debateThread.tags || [],
    createdAt: debateThread.createdAt.toISOString(),
    updatedAt: debateThread.updatedAt.toISOString()
  };
}

async function invalidateCommunityCache(): Promise<void> {
  // Invalidate all community-related cache keys
  await invalidateCachePattern("debate:*");
}
