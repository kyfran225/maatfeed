import { CommentModel, type CommentDocument } from "../models/Comment.js";
import { DebateModel, type IDebate } from "../models/Debate.js";
import { CommunityPostModel } from "../models/CommunityPost.js";
import mongoose from "mongoose";
import { logger } from "../config/logger.js";

export interface DebateThreadNode {
  id: string;
  body: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  aiGenerated?: boolean;
  aiPersona?: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: Date;
  updatedAt: Date;
  likeCount: number;
  replyCount: number;
  debateScore: number;
  qualityScore: number;
  moderationStatus: "approved" | "blocked" | "hidden";
  isDeleted: boolean;
  mentions: string[];
  depth: number;
  children: DebateThreadNode[];
  isHighlighted?: boolean;
  isPinned?: boolean;
}

export interface DebateThreadOptions {
  sort?: "newest" | "oldest" | "popular" | "controversial" | "quality";
  maxDepth?: number;
  includeDeleted?: boolean;
  includeBlocked?: boolean;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface DebateThreadResponse {
  thread: DebateThreadNode[];
  totalCount: number;
  pageInfo: {
    hasNext: boolean;
    hasPrev: boolean;
    currentPage: number;
    totalPages: number;
  };
  stats: {
    totalComments: number;
    totalReplies: number;
    participants: number;
    averageDepth: number;
    maxDepth: number;
    topContributors: Array<{
      id: string;
      name: string;
      avatar?: string;
      count: number;
    }>;
  };
}

class DebateThreadService {
  /**
   * Build a hierarchical thread structure from flat comments
   */
  async buildDebateThread(
    contentId: string,
    options: DebateThreadOptions = {}
  ): Promise<DebateThreadResponse> {
    const {
      sort = "newest",
      maxDepth = 10,
      includeDeleted = false,
      includeBlocked = false,
      userId,
      page = 1,
      limit = 50
    } = options;

    try {
      // Build query
      const query: any = {
        contentId: new mongoose.Types.ObjectId(contentId),
        isDeleted: includeDeleted ? { $in: [true, false] } : false
      };

      if (!includeBlocked) {
        query.moderationStatus = { $ne: "blocked" };
        query.hidden = false;
      }

      // Get sort configuration
      const sortConfig = this.getSortConfig(sort);

      // Get comments with pagination
      const skip = (page - 1) * limit;
      const comments = await CommentModel.find(query)
        .populate("userId", "name avatar")
        .sort(sortConfig)
        .skip(skip)
        .limit(limit)
        .lean();

      // Get total count for pagination
      const totalCount = await CommentModel.countDocuments(query);

      // Build thread tree
      const commentMap = new Map<string, any>();
      const rootComments: any[] = [];

      // Create map of all comments
      comments.forEach((comment: any) => {
        commentMap.set(comment._id.toString(), {
          ...comment,
          children: []
        });
      });

      // Build hierarchy
      comments.forEach((comment: any) => {
        const commentId = comment._id.toString();
        const commentNode = commentMap.get(commentId);

        if (comment.inReplyToCommentId) {
          const parentId = comment.inReplyToCommentId.toString();
          const parent = commentMap.get(parentId);
          if (parent) {
            parent.children.push(commentNode);
          }
        } else {
          rootComments.push(commentNode);
        }
      });

      // Calculate depth and format nodes
      const formattedThread = rootComments.map(comment => 
        this.formatCommentNode(comment, commentMap, 0, maxDepth)
      );

      // Calculate stats
      const stats = await this.calculateThreadStats(contentId, includeDeleted);

      // Build pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const pageInfo = {
        hasNext: page < totalPages,
        hasPrev: page > 1,
        currentPage: page,
        totalPages
      };

      return {
        thread: formattedThread,
        totalCount,
        pageInfo,
        stats
      };

    } catch (error) {
      logger.error({ err: error, contentId, options }, "Failed to build debate thread");
      throw error;
    }
  }

  /**
   * Get sort configuration based on sort type
   */
  private getSortConfig(sort: string): any {
    switch (sort) {
      case "oldest":
        return { createdAt: 1 };
      case "popular":
        return { likeCount: -1, createdAt: -1 };
      case "controversial":
        return { debateScore: -1, createdAt: -1 };
      case "quality":
        return { qualityScore: -1, createdAt: -1 };
      case "newest":
      default:
        return { createdAt: -1 };
    }
  }

  /**
   * Format a comment node with its children
   */
  private formatCommentNode(
    comment: any,
    commentMap: Map<string, any>,
    depth: number,
    maxDepth: number
  ): DebateThreadNode {
    const formatted: DebateThreadNode = {
      id: comment._id.toString(),
      body: comment.body,
      author: {
        id: comment.userId?._id?.toString() || "anonymous",
        name: comment.userId?.name || "Anonymous",
        avatar: comment.userId?.avatar || null
      },
      aiGenerated: comment.aiGenerated || false,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      likeCount: comment.likeCount || 0,
      replyCount: comment.replyCount || 0,
      debateScore: comment.debateScore || 0,
      qualityScore: comment.qualityScore || 0,
      moderationStatus: comment.moderationStatus || "approved",
      isDeleted: comment.isDeleted || false,
      mentions: comment.mentions || [],
      depth,
      children: [],
      isHighlighted: comment.debateScore > 10,
      isPinned: comment.debateScore > 20
    };

    // Add AI persona info if present
    if (comment.aiGenerated && comment.aiPersonaName) {
      formatted.aiPersona = {
        id: comment.aiPersona || "unknown",
        name: comment.aiPersonaName,
        avatar: comment.aiPersonaAvatar || "/default-ai-avatar.png"
      };
    }

    // Add children if within max depth
    if (depth < maxDepth && comment.children && comment.children.length > 0) {
      formatted.children = comment.children
        .sort((a: any, b: any) => b.createdAt - a.createdAt)
        .map((child: any) => this.formatCommentNode(child, commentMap, depth + 1, maxDepth));
    }

    return formatted;
  }

  /**
   * Calculate thread statistics
   */
  private async calculateThreadStats(contentId: string, includeDeleted: boolean = false) {
    const matchStage: any = {
      contentId: new mongoose.Types.ObjectId(contentId)
    };

    if (!includeDeleted) {
      matchStage.isDeleted = false;
    }

    const [totalComments, totalReplies, participantStats, depthStats] = await Promise.all([
      CommentModel.countDocuments({
        ...matchStage,
        inReplyToCommentId: { $exists: false }
      }),
      CommentModel.countDocuments({
        ...matchStage,
        inReplyToCommentId: { $exists: true }
      }),
      CommentModel.aggregate([
        { $match: { ...matchStage, userId: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: "$userId",
            count: { $sum: 1 },
            name: { $first: "$authorName" },
            avatar: { $first: "$authorAvatar" }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      CommentModel.aggregate([
        { $match: matchStage },
        {
          $graphLookup: {
            from: "comments",
            startWith: "$inReplyToCommentId",
            connectFromField: "inReplyToCommentId",
            connectToField: "_id",
            as: "threadPath"
          }
        },
        {
          $project: {
            depth: { $size: "$threadPath" }
          }
        },
        {
          $group: {
            _id: null,
            avgDepth: { $avg: "$depth" },
            maxDepth: { $max: "$depth" }
          }
        }
      ])
    ]);

    const topContributors = participantStats.map((p: any) => ({
      id: p._id.toString(),
      name: p.name || "Utilisateur",
      avatar: p.avatar || null,
      count: p.count
    }));

    return {
      totalComments,
      totalReplies,
      participants: participantStats.length,
      averageDepth: depthStats[0]?.avgDepth || 0,
      maxDepth: depthStats[0]?.maxDepth || 0,
      topContributors
    };
  }

  /**
   * Add a reply to a comment in the thread
   */
  async addReply(
    contentId: string,
    parentCommentId: string,
    replyData: {
      body: string;
      userId?: string;
      aiGenerated?: boolean;
      aiPersona?: string;
      aiPersonaName?: string;
      aiPersonaAvatar?: string;
      mentions?: string[];
    }
  ): Promise<CommentDocument> {
    try {
      // Validate parent comment exists
      const parentComment = await CommentModel.findById(parentCommentId);
      if (!parentComment) {
        throw new Error("Parent comment not found");
      }

      // Create reply
      const reply = new CommentModel({
        contentId: new mongoose.Types.ObjectId(contentId),
        userId: replyData.userId ? new mongoose.Types.ObjectId(replyData.userId) : null,
        inReplyToCommentId: new mongoose.Types.ObjectId(parentCommentId),
        replyToCommentId: parentComment.inReplyToCommentId || new mongoose.Types.ObjectId(parentCommentId),
        body: replyData.body,
        aiGenerated: replyData.aiGenerated || false,
        aiPersona: replyData.aiPersona || null,
        aiPersonaName: replyData.aiPersonaName || null,
        aiPersonaAvatar: replyData.aiPersonaAvatar || null,
        mentions: replyData.mentions || [],
        replyMode: "nested"
      });

      await reply.save();

      // Update parent comment reply count
      await CommentModel.findByIdAndUpdate(parentCommentId, {
        $inc: { replyCount: 1 }
      });

      // Update debate participant count if needed
      if (replyData.userId) {
        await this.updateDebateParticipants(contentId, replyData.userId);
      }

      return reply;

    } catch (error) {
      logger.error({ err: error, contentId, parentCommentId }, "Failed to add reply");
      throw error;
    }
  }

  /**
   * Update debate participants
   */
  private async updateDebateParticipants(contentId: string, userId: string) {
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      
      // Update CommunityPost participant count
      await CommunityPostModel.updateOne(
        { 
          $or: [
            { _id: contentId },
            { feedContentId: contentId }
          ],
          type: "discussion"
        },
        {
          $addToSet: { participants: userObjectId },
          $inc: { participantCount: 1 },
          $set: { lastActivityAt: new Date() }
        }
      );

      // Update Debate model if it exists
      await DebateModel.updateOne(
        { contentId: new mongoose.Types.ObjectId(contentId) },
        {
          $addToSet: { participants: userObjectId },
          $inc: { responseCount: 1 }
        }
      );

    } catch (error) {
      logger.error({ err: error, contentId, userId }, "Failed to update debate participants");
    }
  }

  /**
   * Collapse/expand a thread branch
   */
  async toggleThreadCollapse(
    commentId: string,
    userId: string,
    collapsed: boolean
  ): Promise<void> {
    // This would typically be stored in user preferences
    // For now, we'll implement a simple version
    logger.info({ commentId, userId, collapsed }, "Thread collapse toggled");
  }

  /**
   * Pin/unpin a comment in the thread
   */
  async toggleCommentPin(
    commentId: string,
    pinned: boolean,
    moderatorId: string
  ): Promise<void> {
    try {
      await CommentModel.findByIdAndUpdate(commentId, {
        debateScore: pinned ? 25 : 0, // High score for pinned comments
        $set: { updatedAt: new Date() }
      });

      logger.info({ commentId, pinned, moderatorId }, "Comment pin toggled");
    } catch (error) {
      logger.error({ err: error, commentId, pinned }, "Failed to toggle comment pin");
      throw error;
    }
  }
}

export const debateThreadService = new DebateThreadService();
