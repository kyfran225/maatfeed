import { Request, Response } from "express";
import { z } from "zod";
import { CommunityPostModel, type CommunityPostDocument } from "../models/CommunityPost.js";
import { communityAIService } from "../services/communityAIService.js";
import { communityFeedIntegrationService } from "../services/communityFeedIntegrationService.js";

type CommunityPostLean = CommunityPostDocument & {
  _id: { toString(): string };
};

// Schémas de validation
const createPostSchema = z.object({
  type: z.enum(["discussion", "question", "post"]),
  title: z.string().min(1, "Title required").max(200, "Title too long"),
  content: z.string().min(1, "Content required").max(5000, "Content too long"),
  tags: z.array(z.string().max(30)).optional().default([]),
  mediaUrl: z.string().url().optional(),
  mediaType: z.enum(["image", "video", "audio"]).optional(),
  linkPreview: z.object({
    url: z.string().url(),
    title: z.string(),
    description: z.string().optional(),
    image: z.string().url().optional()
  }).optional()
});

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(5000).optional(),
  tags: z.array(z.string().max(30)).optional()
});

const getPostsSchema = z.object({
  type: z.enum(["discussion", "question", "post"]).optional(),
  tags: z.string().transform(str => str ? str.split(',').map(t => t.trim()) : []).optional(),
  sort: z.enum(["trending", "popular", "recent", "virality"]).default("trending"),
  limit: z.string().transform(Number).refine(n => n > 0 && n <= 50).default(20),
  cursor: z.string().optional()
});

export async function createCommunityPostController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const validated = createPostSchema.parse(req.body);
    
    // Créer le post communautaire
    const post = new CommunityPostModel({
      ...validated,
      author: userId,
      aiTopics: [], // Sera rempli par l'IA
      sentiment: "neutral",
      controversy: 0,
      quality: 0,
      viralityScore: 0,
      viralityStatus: "cold"
    });

    // Analyse IA du contenu
    await Promise.all([
      analyzeContentWithAI(post),
      calculateInitialMetrics(post)
    ]);

    await post.save();

    // Mettre à jour les scores de viralité
    await communityAIService.updateViralityScores();

    res.status(201).json({
      success: true,
      data: post,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in createCommunityPostController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create community post"
    });
  }
}

export async function getCommunityPostsController(req: Request, res: Response) {
  try {
    const { type, tags, sort, limit, cursor } = getPostsSchema.parse(req.query);
    
    // Construire la requête
    const query: Record<string, unknown> = {
      isHidden: false
    };

    if (type) query.type = type;
    if ((tags?.length ?? 0) > 0) query.tags = { $in: tags || [] };

    // Tri
    let sortOptions: Record<string, 1 | -1> = {};
    switch (sort) {
      case "trending":
        sortOptions = { viralityScore: -1, lastActivityAt: -1 };
        break;
      case "popular":
        sortOptions = { upvotes: -1, participantCount: -1 };
        break;
      case "recent":
        sortOptions = { createdAt: -1 };
        break;
      case "virality":
        sortOptions = { viralityScore: -1, trendPrediction: -1 };
        break;
    }

    // Pagination avec cursor
    if (cursor) {
      const cursorPost = await CommunityPostModel.findById(cursor);
      if (cursorPost) {
        query._id = { $lt: cursorPost._id };
      }
    }

    const posts = await CommunityPostModel.find(query)
      .sort(sortOptions)
      .limit(limit + 1) // +1 pour vérifier s'il y a plus de résultats
      .populate("author", "username avatar")
      .lean() as unknown as CommunityPostLean[];

    const hasMore = posts.length > limit;
    const results = hasMore ? posts.slice(0, -1) : posts;
    const nextCursor = hasMore ? results[results.length - 1]._id : null;

    res.json({
      success: true,
      data: results,
      meta: {
        count: results.length,
        hasMore,
        nextCursor,
        sort,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in getCommunityPostsController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch community posts"
    });
  }
}

export async function getCommunityPostController(req: Request, res: Response) {
  try {
    const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
    
    const post = await CommunityPostModel.findById(postId)
      .populate("author", "username avatar")
      .populate("comments")
      .lean() as unknown as CommunityPostLean | null;

    if (!post || (post as any).isHidden) {
      return res.status(404).json({
        success: false,
        error: "Post not found"
      });
    }

    // Incrémenter les vues
    await CommunityPostModel.findByIdAndUpdate(postId, {
      $inc: { "engagementMetrics.views": 1 },
      $set: { lastActivityAt: new Date() }
    });

    res.json({
      success: true,
      data: post,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in getCommunityPostController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch community post"
    });
  }
}

export async function updateCommunityPostController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
    const validated = updatePostSchema.parse(req.body);
    
    const post = await CommunityPostModel.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found"
      });
    }

    // Vérifier que l'utilisateur est l'auteur
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Only author can update post"
      });
    }

    // Mettre à jour le post
    Object.assign(post, validated);
    await post.save();

    // Réanalyser avec IA si le contenu a changé
    if (validated.content || validated.title) {
      await analyzeContentWithAI(post);
      await post.save();
    }

    res.json({
      success: true,
      data: post,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in updateCommunityPostController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update community post"
    });
  }
}

export async function deleteCommunityPostController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
    
    const post = await CommunityPostModel.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found"
      });
    }

    // Vérifier que l'utilisateur est l'auteur
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Only author can delete post"
      });
    }

    // Soft delete
    await CommunityPostModel.findByIdAndUpdate(postId, {
      $set: { 
        isHidden: true,
        moderatedAt: new Date(),
        moderatedBy: userId
      }
    });

    res.json({
      success: true,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in deleteCommunityPostController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete community post"
    });
  }
}

export async function upvotePostController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
    
    const post = await CommunityPostModel.findByIdAndUpdate(
      postId,
      { 
        $inc: { upvotes: 1 },
        $set: { lastActivityAt: new Date() }
      },
      { new: true }
    ).populate("author", "username avatar");

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found"
      });
    }

    // Mettre à jour les scores de viralité
    await communityAIService.updateViralityScores();

    // Synchroniser avec le feed
    await communityFeedIntegrationService.syncFeedToCommunity(postId.toString(), "like", userId);

    res.json({
      success: true,
      data: post,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in upvotePostController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upvote post"
    });
  }
}

// getTrendingTopicsController désactivé temporairement à cause du conflit de routes

export async function getContradictionsController(req: Request, res: Response) {
  try {
    const topic = Array.isArray(req.params.topic) ? req.params.topic[0] : req.params.topic;
    
    const contradictions = await communityAIService.detectContradictions(topic);

    res.json({
      success: true,
      data: contradictions,
      meta: {
        topic,
        count: contradictions.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in getContradictionsController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch contradictions"
    });
  }
}

export async function generateSummaryController(req: Request, res: Response) {
  try {
    const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
    
    const summary = await communityAIService.generateDiscussionSummary(postId);

    res.json({
      success: true,
      data: { summary },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in generateSummaryController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate summary"
    });
  }
}

export async function getPersonalizedSuggestionsController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const suggestions = await communityAIService.suggestPersonalizedContent(userId);

    res.json({
      success: true,
      data: suggestions,
      meta: {
        count: suggestions.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in getPersonalizedSuggestionsController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch personalized suggestions"
    });
  }
}

export async function getIntegrationStatsController(req: Request, res: Response) {
  try {
    const stats = await communityFeedIntegrationService.getIntegrationStats();

    res.json({
      success: true,
      data: stats,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in getIntegrationStatsController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch integration stats"
    });
  }
}

// Fonctions utilitaires
async function analyzeContentWithAI(post: CommunityPostDocument): Promise<void> {
  try {
    // Simulation d'analyse IA (à remplacer avec vraie IA)
    const topics = extractTopicsFromContent(post.content);
    const sentiment = analyzeSentiment(post.content);
    const controversy = calculateControversy(post.content);
    const quality = calculateQuality(post.title, post.content);

    post.aiTopics = topics;
    post.sentiment = sentiment;
    post.controversy = controversy;
    post.quality = quality;
  } catch (error) {
    console.error("Error analyzing content with AI:", error);
  }
}

async function calculateInitialMetrics(post: CommunityPostDocument): Promise<void> {
  // Calculer les métriques initiales
  post.transformationScore = calculateTransformationScore(post);
  post.trendPrediction = Math.random() * 50; // Prédiction initiale
}

function extractTopicsFromContent(content: string): string[] {
  // Extraction simple de mots-clés (à améliorer avec IA)
  const keywords = ["kemet", "egypt", "african", "philosophy", "spirituality", "history", "culture"];
  const contentLower = content.toLowerCase();
  
  return keywords.filter(keyword => contentLower.includes(keyword));
}

function analyzeSentiment(content: string): "positive" | "neutral" | "negative" {
  // Analyse simple de sentiment (à améliorer avec IA)
  const positiveWords = ["bon", "excellent", "amour", "paix", "harmonie", "sagesse"];
  const negativeWords = ["mauvais", "haine", "guerre", "conflit", "colère"];
  
  const contentLower = content.toLowerCase();
  const positiveCount = positiveWords.filter(word => contentLower.includes(word)).length;
  const negativeCount = negativeWords.filter(word => contentLower.includes(word)).length;
  
  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
}

function calculateControversy(content: string): number {
  // Calcul simple de controverse (à améliorer avec IA)
  const controversialWords = ["mais", "cependant", "pourtant", "opposition", "contre"];
  const contentLower = content.toLowerCase();
  
  const count = controversialWords.filter(word => contentLower.includes(word)).length;
  return Math.min(1, count / 10);
}

function calculateQuality(title: string, content: string): number {
  // Calcul simple de qualité (à améliorer avec IA)
  let score = 0.5; // Base
  
  // Longueur appropriée
  if (title.length >= 10 && title.length <= 100) score += 0.2;
  if (content.length >= 50 && content.length <= 2000) score += 0.2;
  
  // Présence de structure
  if (content.includes('?') || content.includes('!')) score += 0.1;
  
  return Math.min(1, score);
}

function calculateTransformationScore(post: CommunityPostDocument): number {
  let score = 0;
  
  // Base sur les métriques
  score += (post.upvotes / 10) * 20;
  score += (post.participantCount / 5) * 30;
  score += post.quality * 25;
  score += (post.controversy * 20) * 0.5; // Controverse modérée
  
  return Math.min(100, Math.round(score));
}
