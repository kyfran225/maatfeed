import { Request, Response } from "express";
import { z } from "zod";
import { recommendationsService } from "../services/recommendationsService.js";
import { logger } from "../config/logger.js";

// Validation schemas
const recommendationsQuerySchema = z.object({
  type: z.enum(['content-based', 'collaborative', 'trending', 'personalized', 'all']).optional(),
  category: z.string().optional(),
  language: z.string().optional(),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
  offset: z.string().optional().transform(val => val ? parseInt(val, 10) : 0),
  excludeViewed: z.string().optional().transform(val => val === 'true'),
  includeSeries: z.string().optional().transform(val => val === 'true')
});

const trendingTopicsQuerySchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  category: z.string().optional()
});

const discoveryQuerySchema = z.object({
  category: z.string().optional(),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 5)
});

/**
 * Get personalized recommendations for user
 */
export async function getRecommendationsController(req: Request, res: Response) {
  try {
    // Get user ID from auth middleware
    const userId = res.locals.auth?.userId;

    // Validate query parameters
    const query = recommendationsQuerySchema.parse(req.query);

    // Get recommendations
    const result = await recommendationsService.getRecommendations({
      userId,
      ...query
    });

    res.json({
      success: true,
      data: result.items,
      meta: {
        ...result.meta,
        trendingTopics: result.trendingTopics,
        discoveryInsights: result.discoveryInsights,
        userId: userId || 'anonymous'
      }
    });
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Failed to get recommendations');
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid query parameters",
        details: error.issues
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to fetch recommendations"
    });
  }
}

/**
 * Get content-based recommendations
 */
export async function getContentBasedRecommendationsController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    const query = recommendationsQuerySchema.parse(req.query);

    const result = await recommendationsService.getRecommendations({
      userId,
      type: 'content-based',
      ...query
    });

    res.json({
      success: true,
      data: result.items,
      meta: {
        type: 'content-based',
        algorithm: 'Content Similarity Matching',
        timestamp: new Date(),
        totalItems: result.items.length,
        userId: userId || 'anonymous'
      }
    });
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Failed to get content-based recommendations');
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid query parameters",
        details: error.issues
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to fetch content-based recommendations"
    });
  }
}

/**
 * Get collaborative filtering recommendations
 */
export async function getCollaborativeRecommendationsController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required for collaborative recommendations"
      });
    }

    const query = recommendationsQuerySchema.parse(req.query);

    const result = await recommendationsService.getRecommendations({
      userId,
      type: 'collaborative',
      ...query
    });

    res.json({
      success: true,
      data: result.items,
      meta: {
        type: 'collaborative',
        algorithm: 'Collaborative Filtering',
        timestamp: new Date(),
        totalItems: result.items.length,
        userId
      }
    });
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Failed to get collaborative recommendations');
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid query parameters",
        details: error.issues
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to fetch collaborative recommendations"
    });
  }
}

/**
 * Get trending recommendations
 */
export async function getTrendingRecommendationsController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    const query = recommendationsQuerySchema.parse(req.query);

    const result = await recommendationsService.getRecommendations({
      userId,
      type: 'trending',
      ...query
    });

    res.json({
      success: true,
      data: result.items,
      meta: {
        type: 'trending',
        algorithm: 'Trend Analysis',
        timestamp: new Date(),
        totalItems: result.items.length,
        userId: userId || 'anonymous'
      }
    });
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Failed to get trending recommendations');
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid query parameters",
        details: error.issues
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to fetch trending recommendations"
    });
  }
}

/**
 * Get personalized recommendations (ML-powered)
 */
export async function getPersonalizedRecommendationsController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    const query = recommendationsQuerySchema.parse(req.query);

    const result = await recommendationsService.getRecommendations({
      userId,
      type: 'personalized',
      ...query
    });

    res.json({
      success: true,
      data: result.items,
      meta: {
        type: 'personalized',
        algorithm: 'ML-Powered Personalization',
        timestamp: new Date(),
        totalItems: result.items.length,
        userId: userId || 'anonymous'
      }
    });
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Failed to get personalized recommendations');
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid query parameters",
        details: error.issues
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to fetch personalized recommendations"
    });
  }
}

/**
 * Get trending topics
 */
export async function getTrendingTopicsController(req: Request, res: Response) {
  try {
    const query = trendingTopicsQuerySchema.parse(req.query);

    const trendingTopics = await recommendationsService.getTrendingTopics(query.limit);

    res.json({
      success: true,
      data: trendingTopics,
      meta: {
        type: 'trending_topics',
        timestamp: new Date(),
        totalItems: trendingTopics.length
      }
    });
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Failed to get trending topics');
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid query parameters",
        details: error.issues
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to fetch trending topics"
    });
  }
}

/**
 * Get discovery insights
 */
export async function getDiscoveryInsightsController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    const query = discoveryQuerySchema.parse(req.query);

    const insights = await recommendationsService.getDiscoveryInsights(userId);

    // Limit results if specified
    const limitedInsights = query.limit ? insights.slice(0, query.limit) : insights;

    res.json({
      success: true,
      data: limitedInsights,
      meta: {
        type: 'discovery_insights',
        timestamp: new Date(),
        totalItems: limitedInsights.length,
        userId: userId || 'anonymous'
      }
    });
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Failed to get discovery insights');
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid query parameters",
        details: error.issues
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to fetch discovery insights"
    });
  }
}

/**
 * Get related content for a specific content item
 */
export async function getRelatedContentController(req: Request, res: Response) {
  try {
    const { contentId } = req.params;
    const userId = res.locals.auth?.userId;

    if (!contentId) {
      return res.status(400).json({
        success: false,
        error: "Content ID is required"
      });
    }

    // Get content-based recommendations for the specific content's category/tags
    const result = await recommendationsService.getRecommendations({
      userId,
      type: 'content-based',
      limit: 10,
      excludeViewed: true
    });

    // Filter to get most related content (could be enhanced with content similarity)
    const relatedContent = result.items.slice(0, 5);

    res.json({
      success: true,
      data: relatedContent,
      meta: {
        type: 'related_content',
        contentId,
        timestamp: new Date(),
        totalItems: relatedContent.length,
        userId: userId || 'anonymous'
      }
    });
  } catch (error) {
    logger.error({ error: (error as Error).message, contentId: req.params.contentId }, 'Failed to get related content');
    
    res.status(500).json({
      success: false,
      error: "Failed to fetch related content"
    });
  }
}

/**
 * Get user recommendation preferences (for UI customization)
 */
export async function getRecommendationPreferencesController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    // This could be expanded to store user preferences for recommendation types
    const preferences = {
      defaultType: 'personalized',
      enableTrending: true,
      enableCollaborative: true,
      enableContentBased: true,
      categories: ['education', 'culture', 'debate', 'entertainment'],
      languages: ['fr', 'en'],
      excludeViewed: true
    };

    res.json({
      success: true,
      data: preferences,
      meta: {
        type: 'recommendation_preferences',
        userId,
        timestamp: new Date()
      }
    });
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Failed to get recommendation preferences');
    
    res.status(500).json({
      success: false,
      error: "Failed to fetch recommendation preferences"
    });
  }
}

/**
 * Update user recommendation preferences
 */
export async function updateRecommendationPreferencesController(req: Request, res: Response) {
  try {
    const userId = res.locals.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const preferencesSchema = z.object({
      defaultType: z.enum(['content-based', 'collaborative', 'trending', 'personalized']).optional(),
      enableTrending: z.boolean().optional(),
      enableCollaborative: z.boolean().optional(),
      enableContentBased: z.boolean().optional(),
      categories: z.array(z.string()).optional(),
      languages: z.array(z.string()).optional(),
      excludeViewed: z.boolean().optional()
    });

    const preferences = preferencesSchema.parse(req.body);

    // TODO: Store preferences in user profile or separate collection
    // For now, just return success
    
    logger.info({ userId, preferences }, 'Updated recommendation preferences');

    res.json({
      success: true,
      data: preferences,
      meta: {
        type: 'recommendation_preferences_updated',
        userId,
        timestamp: new Date()
      }
    });
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'Failed to update recommendation preferences');
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid request body",
        details: error.issues
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update recommendation preferences"
    });
  }
}
