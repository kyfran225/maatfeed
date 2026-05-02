import { Request, Response } from 'express';
import { buildContentCards } from '../repositories/contentRepository.js';
import { ContentModel } from '../models/Content.js';
import { logger } from '../config/logger.js';

export class ContentController {
  /**
   * GET /api/content/:id
   * Get a single content item by ID with full details
   */
  async getContentById(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Content ID is required'
        });
      }

      // Check if content exists first
      const contentExists = await ContentModel.findById(id).lean() as { publishedAt?: Date } | null;
      if (!contentExists) {
        return res.status(404).json({
          success: false,
          error: 'Content not found'
        });
      }

      // Build full content card with all metadata
      const contentCards = await buildContentCards([id]);

      if (contentCards.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Content not found or not fully processed'
        });
      }

      const card = contentCards[0];

      // Extra sanitization for tags - ensure they are all strings
      const sanitizedTags = (card.tags || []).map((tag: any) => {
        if (typeof tag === 'string') return tag;
        if (tag && typeof tag === 'object') {
          // Try to extract string value from object
          return tag.name || tag.text || tag.value || JSON.stringify(tag);
        }
        return String(tag);
      }).filter((tag: string) => tag && tag !== '[object Object]' && tag.length > 0);

      // Format response to match frontend expectations
      const formattedContent = {
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
        createdAt: contentExists?.publishedAt?.toISOString() || new Date().toISOString(),
        tags: sanitizedTags
      };

      res.json({
        success: true,
        data: formattedContent
      });
    } catch (error) {
      logger.error({ error, contentId: req.params.id }, 'Error getting content by ID:');
      res.status(500).json({
        success: false,
        error: 'Failed to fetch content'
      });
    }
  }
}
