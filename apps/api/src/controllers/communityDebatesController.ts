import { Request, Response } from "express";
import { CommunityPostModel } from "../models/CommunityPost.js";
import { CommentModel } from "../models/Comment.js";
import { z } from "zod";
import type { CommunityPostDocument } from "../models/CommunityPost.js";

type LeanDebatePost = Pick<
  CommunityPostDocument,
  "_id" | "type" | "title" | "content" | "viralityScore" | "participantCount" | "tags" | "createdAt" | "lastActivityAt" | "isHidden"
>;

type LeanDebateComment = {
  _id: { toString(): string };
  debateScore?: number;
};

const getTopDebatesSchema = z.object({
  limit: z.string().transform(Number).refine(n => n > 0 && n <= 100, "Limit must be between 1 and 100").optional().default(20)
});

export async function getTopDebatesController(req: Request, res: Response) {
  try {
    const { limit } = getTopDebatesSchema.parse(req.query);
    console.log(`[DEBUG] getTopDebatesController - limit: ${limit}`);
    
    // Récupérer les posts communautaires de type discussion
    const debates = await CommunityPostModel.find({
      type: "discussion",
      isHidden: false
    })
    // .sort({ debateScore: -1, participantCount: -1, createdAt: -1 }) // Désactivé pour debug
    .limit(limit)
    // .populate("author", "username avatar") // Désactivé car modèle User n'existe pas
    .lean() as unknown as LeanDebatePost[];
    
    console.log(`[DEBUG] debates trouvés: ${debates.length}`);
    console.log(`[DEBUG] premier débat:`, debates[0]);

    // Transformer en format attendu par le frontend
    const formattedDebates = debates.map((debate) => ({
      id: debate._id.toString(),
      contentId: debate._id.toString(),
      title: debate.title,
      description: debate.content,
      debateScore: debate.viralityScore || 0, // Utiliser viralityScore au lieu de debateScore
      participantCount: debate.participantCount || 0,
      topComments: [], // Sera rempli plus tard si nécessaire
      tags: debate.tags || [],
      createdAt: debate.createdAt,
      lastActivity: debate.lastActivityAt || debate.createdAt
    }));

    res.json({
      success: true,
      data: formattedDebates,
      meta: {
        count: formattedDebates.length,
        limit,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in getTopDebatesController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch top debates"
    });
  }
}

export async function getDebateThreadController(req: Request, res: Response) {
  try {
    const { contentId } = req.params;
    
    const debate = await CommunityPostModel.findById(contentId)
      .populate("author", "username avatar")
      .lean() as unknown as LeanDebatePost | null;

    if (!debate || debate.type !== "discussion") {
      return res.status(404).json({
        success: false,
        error: "Debate thread not found"
      });
    }

    // Récupérer les commentaires top pour ce débat
    const topComments = await CommentModel.find({
      contentId: contentId,
      isDeleted: false
    })
    .sort({ debateScore: -1, likeCount: -1 })
    .limit(5)
    .populate("userId", "username avatar")
    .lean() as unknown as LeanDebateComment[];

    const formattedComments = topComments.map((comment, index) => ({
      commentId: comment._id.toString(),
      score: comment.debateScore || 0,
      position: index + 1
    }));

    const formattedDebate = {
      id: debate._id.toString(),
      contentId: debate._id.toString(),
      title: debate.title,
      description: debate.content,
      isActive: !debate.isHidden,
      debateScore: debate.viralityScore || 0,
      participantCount: debate.participantCount || 0,
      topComments: formattedComments,
      tags: debate.tags || [],
      createdAt: debate.createdAt,
      updatedAt: debate.lastActivityAt || debate.createdAt
    };

    res.json({
      success: true,
      data: formattedDebate,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in getDebateThreadController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch debate thread"
    });
  }
}

export async function createDebateThreadController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const { title, description, tags } = req.body as {
      title: string;
      description: string;
      tags?: string[];
    };

    // Créer un post communautaire de type discussion
    const debate = new CommunityPostModel({
      type: "discussion",
      title,
      content: description,
      author: userId,
      tags: tags || [],
      upvotes: 0,
      participantCount: 0,
      viralityScore: 0,
      viralityStatus: "cold",
      badges: [],
      aiTopics: [],
      sentiment: "neutral",
      controversy: 0,
      quality: 0.5,
      engagementMetrics: {
        views: 0,
        shares: 0,
        bookmarks: 0,
        averageReadTime: 0,
        bounceRate: 1.0,
        conversionRate: 0
      },
      transformedToFeed: false,
      transformationScore: 0,
      reports: 0,
      isHidden: false,
      lastActivityAt: new Date(),
      bumpedAt: new Date()
    });

    await debate.save();

    const formattedDebate = {
      id: debate._id.toString(),
      contentId: debate._id.toString(),
      title: debate.title,
      description: debate.content,
      isActive: !debate.isHidden,
      debateScore: debate.viralityScore || 0,
      participantCount: debate.participantCount || 0,
      topComments: [],
      tags: debate.tags || [],
      createdAt: debate.createdAt,
      updatedAt: debate.lastActivityAt || debate.createdAt
    };

    res.status(201).json({
      success: true,
      data: formattedDebate,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in createDebateThreadController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create debate thread"
    });
  }
}
