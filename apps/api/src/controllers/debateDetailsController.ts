import { Request, Response } from "express";
import mongoose from "mongoose";
import { CommentModel } from "../models/Comment.js";
import { CommunityPostModel } from "../models/CommunityPost.js";
import { getAllPersonalities, getPersonality, AIPersonalityId } from "../services/personalityRouterService.js";
import { logger } from "../config/logger.js";
import { resolveAIAvatarUrl } from "@maat/shared";

/**
 * Get AI personalities that have participated in a debate
 */
export async function getDebateAIPersonalitiesController(req: Request, res: Response) {
  try {
    const { contentId } = req.params;
    
    // Find all AI-generated comments for this content
    const aiComments = await CommentModel.find({
      contentId,
      aiGenerated: true,
      hidden: false,
      isDeleted: false
    }).select("aiPersona aiPersonaName aiPersonaAvatar").lean();

    // Get unique personalities
    const uniquePersonas = new Map<string, {
      id: string;
      name: string;
      avatar: string;
      expertise: string[];
      description: string;
      isOnline: boolean;
      participated: boolean;
      commentCount: number;
      availability: "active" | "available";
    }>();
    
    aiComments.forEach((comment) => {
      if (!comment.aiPersona) {
        return;
      }

      const personality = getPersonality(comment.aiPersona as AIPersonalityId);
      if (!personality) {
        return;
      }

      const existing = uniquePersonas.get(comment.aiPersona);
      if (existing) {
        existing.commentCount += 1;
        return;
      }

      uniquePersonas.set(comment.aiPersona, {
        id: personality.id,
        name: personality.displayName || personality.name,
        avatar: resolveAIAvatarUrl(comment.aiPersonaAvatar, comment.aiPersona, 64) || personality.avatar,
        expertise: personality.expertise,
        description: personality.description,
        isOnline: true,
        participated: true,
        commentCount: 1,
        availability: "active"
      });
    });

    // If no AI personalities found, return default ones
    if (uniquePersonas.size === 0) {
      const allPersonalities = getAllPersonalities();
      const defaultPersonas = allPersonalities
        .filter(p => p.id === "maat_sage" || p.id === "kemet_expert")
        .map(p => ({
          id: p.id,
          name: p.displayName || p.name,
          avatar: p.avatar,
          expertise: p.expertise,
          description: p.description,
          isOnline: false,
          participated: false,
          commentCount: 0,
          availability: "available" as const
        }));
      
      return res.json({
        success: true,
        data: defaultPersonas,
        meta: {
          contentId,
          timestamp: new Date().toISOString()
        }
      });
    }

    res.json({
      success: true,
      data: Array.from(uniquePersonas.values()),
      meta: {
        contentId,
        count: uniquePersonas.size,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error({ err: error, contentId: req.params.contentId }, "Failed to get debate AI personalities");
    res.status(500).json({
      success: false,
      error: "Failed to get AI personalities for debate"
    });
  }
}

/**
 * Get debate statistics
 */
export async function getDebateStatsController(req: Request, res: Response) {
  try {
    const contentId = Array.isArray(req.params.contentId) ? req.params.contentId[0] : req.params.contentId;
    if (!contentId) {
      return res.status(400).json({
        success: false,
        error: "Content ID is required"
      });
    }
    const contentObjectId = mongoose.Types.ObjectId.isValid(contentId)
      ? new mongoose.Types.ObjectId(contentId)
      : null;

    // Get all comments for stats
    const [totalComments, totalReplies, aiComments, topContributorsResult] = await Promise.all([
      CommentModel.countDocuments({
        contentId,
        hidden: false,
        isDeleted: false,
        inReplyToCommentId: { $exists: false }
      }),
      CommentModel.countDocuments({
        contentId,
        hidden: false,
        isDeleted: false,
        inReplyToCommentId: { $exists: true }
      }),
      CommentModel.countDocuments({
        contentId,
        aiGenerated: true,
        hidden: false,
        isDeleted: false
      }),
      CommentModel.aggregate([
        {
          $match: {
            ...(contentObjectId ? { contentId: contentObjectId } : { contentId }),
            hidden: false,
            isDeleted: false,
            userId: { $exists: true, $ne: null }
          }
        },
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
      ])
    ]);

    // Format top contributors
    const topContributors = topContributorsResult.map((c: any) => ({
      name: c.name || "Utilisateur",
      avatar: c.avatar || null,
      count: c.count
    }));

    // Calculate engagement rate (comments per hour since first comment)
    const firstComment = await CommentModel.findOne({
      contentId,
      createdAt: { $exists: true }
    }).sort({ createdAt: 1 }).select("createdAt");

    let engagementRate = 0;
    if (firstComment) {
      const hoursSinceStart = Math.max(1, (Date.now() - new Date(firstComment.createdAt).getTime()) / (1000 * 60 * 60));
      engagementRate = parseFloat(((totalComments + totalReplies) / hoursSinceStart).toFixed(2));
    }

    res.json({
      success: true,
      data: {
        totalComments,
        totalReplies,
        aiContributions: aiComments,
        topContributors,
        engagementRate
      },
      meta: {
        contentId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error({ err: error, contentId: req.params.contentId }, "Failed to get debate stats");
    res.status(500).json({
      success: false,
      error: "Failed to get debate statistics"
    });
  }
}

/**
 * Generate AI summary for a debate
 */
export async function getDebateAISummaryController(req: Request, res: Response) {
  try {
    const { contentId } = req.params;

    // Get recent comments for analysis
    const recentComments = await CommentModel.find({
      contentId,
      hidden: false,
      isDeleted: false,
      moderationStatus: { $in: ["approved", null] }
    })
    .sort({ debateScore: -1, createdAt: -1 })
    .limit(20)
    .select("body aiGenerated aiPersonaName debateScore")
    .lean();

    // Get the debate post for context
    const debatePost = await CommunityPostModel.findById(contentId).select("title content").lean()
      || await CommunityPostModel.findOne({
        feedContentId: contentId,
        type: "discussion",
        isHidden: false
      }).select("title content").lean();

    if (!recentComments.length) {
      return res.json({
        success: true,
        data: {
          summary: "Ce débat n'a pas encore de commentaires. Soyez le premier à participer !",
          keyPoints: [],
          perspectives: []
        },
        meta: {
          contentId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Group comments by type (AI vs Human)
    const aiComments = recentComments.filter(c => c.aiGenerated);
    const humanComments = recentComments.filter(c => !c.aiGenerated);

    // Generate key points from top-scoring comments
    const keyPoints = recentComments
      .filter(c => c.debateScore > 5)
      .slice(0, 5)
      .map(c => {
        const text = c.body;
        // Extract first sentence or first 100 chars
        const point = text.length > 100 ? text.substring(0, 100) + "..." : text;
        return point;
      });

    // Generate perspectives from AI personas
    const perspectives: Array<{ persona: string; viewpoint: string }> = [];
    
    // Get unique AI personas
    const aiPersonas = [...new Set(aiComments.map(c => c.aiPersonaName).filter(Boolean))];
    
    if (aiPersonas.length > 0) {
      aiPersonas.forEach(persona => {
        const personaComments = aiComments.filter(c => c.aiPersonaName === persona);
        if (personaComments.length > 0) {
          const latestComment = personaComments[0];
          perspectives.push({
            persona: persona as string,
            viewpoint: latestComment.body.length > 150 
              ? latestComment.body.substring(0, 150) + "..."
              : latestComment.body
          });
        }
      });
    }

    // Generate summary based on comment themes
    let summary = "";
    if (debatePost && !Array.isArray(debatePost)) {
      const postTitle = (debatePost as any).title || "ce sujet";
      summary = `Ce débat sur "${postTitle}" a généré ${recentComments.length} contributions.`;
      
      if (aiComments.length > 0) {
        summary += ` ${aiComments.length} réponses ont été apportées par nos personnalités IA.`;
      }
      
      if (humanComments.length > 0) {
        summary += ` La communauté s'est activement engagée dans la discussion.`;
      }
    } else {
      summary = `Ce débat compte ${recentComments.length} contributions avec ${humanComments.length} commentaires de la communauté et ${aiComments.length} interventions IA.`;
    }

    res.json({
      success: true,
      data: {
        summary,
        keyPoints,
        perspectives
      },
      meta: {
        contentId,
        commentCount: recentComments.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error({ err: error, contentId: req.params.contentId }, "Failed to generate debate AI summary");
    res.status(500).json({
      success: false,
      error: "Failed to generate debate summary"
    });
  }
}
