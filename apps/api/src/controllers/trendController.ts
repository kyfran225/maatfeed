import { Request, Response } from 'express';
import { TrendService } from '../services/trendService.js';
import { buildContentCards } from '../repositories/contentRepository.js';
import { logger } from '../config/logger.js';

export class TrendController {
  private trendService: TrendService;

  constructor() {
    this.trendService = new TrendService();
  }

  /**
   * GET /api/trends/content/:bucket
   * Get trending content by bucket - returns ContentItem format for frontend
   */
  async getTrendingContent(req: Request, res: Response) {
    try {
      const { bucket } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!['viral', 'educational', 'deep'].includes(bucket as string)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid bucket. Must be viral, educational, or deep'
        });
      }

      // Get trending signals
      const trendingSignals = await this.trendService.getTrendingContent(
        bucket as 'viral' | 'educational' | 'deep',
        Math.min(limit, 100) // Cap at 100
      );

      // Get content IDs from signals
      const contentIds = trendingSignals.map(signal => signal.contentId);

      // Build full content cards
      const contentCards = await buildContentCards(contentIds);

      // Format to match frontend ContentItem interface
      const formattedItems = contentCards.map(card => ({
        id: card.id,
        title: card.title,
        description: card.description,
        author: card.creatorName,
        thumbnailUrl: card.thumbnailUrl,
        videoUrl: card.mediaType === 'video' ? card.mediaUrl : undefined,
        audioUrl: card.mediaType === 'audio' ? card.mediaUrl : undefined,
        duration: undefined,
        bucket: card.bucket,
        score: card.scores.finalScore,
        likes: card.scores.likes,
        comments: card.scores.comments,
        views: card.scores.views,
        createdAt: new Date().toISOString(),
        tags: card.tags
      }));

      // Return in the format expected by frontend
      res.json({
        items: formattedItems,
        bucket,
        timeframe: '24h',
        totalItems: formattedItems.length
      });
    } catch (error) {
      logger.error({ error }, 'Error in getTrendingContent:');
      res.status(500).json({
        success: false,
        error: 'Failed to fetch trending content'
      });
    }
  }

  /**
   * GET /api/trends/analytics
   * Get trend analytics
   */
  async getTrendAnalytics(req: Request, res: Response) {
    try {
      const analytics = await this.trendService.getTrendAnalytics();

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error({ error }, 'Error in getTrendAnalytics:');
      res.status(500).json({
        success: false,
        error: 'Failed to fetch trend analytics'
      });
    }
  }

  /**
   * GET /api/trends/content/:contentId
   * Get trend signals for specific content
   */
  async getContentTrends(req: Request, res: Response) {
    try {
      const { contentId } = req.params;

      if (!contentId) {
        return res.status(400).json({
          success: false,
          error: 'Content ID is required'
        });
      }

      const trends = await this.trendService.getContentTrends(contentId as string);

      res.json({
        success: true,
        data: trends,
        meta: {
          contentId,
          count: trends.length,
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error({ error }, 'Error in getContentTrends:');
      res.status(500).json({
        success: false,
        error: 'Failed to fetch content trends'
      });
    }
  }

  /**
   * POST /api/trends/refresh
   * Refresh trend signals
   */
  async refreshTrends(req: Request, res: Response) {
    try {
      const result = await this.trendService.refreshTrendSignals();

      res.json({
        success: true,
        data: result,
        meta: {
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error({ error }, 'Error in refreshTrends:');
      res.status(500).json({
        success: false,
        error: 'Failed to refresh trends'
      });
    }
  }

  /**
   * POST /api/trends/analyze/:contentId
   * Manually trigger trend analysis for content
   */
  async analyzeContentTrend(req: Request, res: Response) {
    try {
      const { contentId } = req.params;

      if (!contentId) {
        return res.status(400).json({
          success: false,
          error: 'Content ID is required'
        });
      }

      const result = await this.trendService.analyzeContentTrend(contentId as string);

      res.json({
        success: true,
        data: result,
        meta: {
          contentId,
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error({ error }, 'Error in analyzeContentTrend:');
      res.status(500).json({
        success: false,
        error: 'Failed to analyze content trend'
      });
    }
  }

  /**
   * POST /api/trends/cleanup
   * Clean up old inactive trends
   */
  async cleanupOldTrends(req: Request, res: Response) {
    try {
      const deletedCount = await this.trendService.cleanupOldTrends();

      res.json({
        success: true,
        data: {
          deletedCount
        },
        meta: {
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error({ error }, 'Error in cleanupOldTrends:');
      res.status(500).json({
        success: false,
        error: 'Failed to cleanup old trends'
      });
    }
  }
}
