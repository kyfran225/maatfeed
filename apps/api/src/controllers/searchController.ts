import { Request, Response } from 'express';
import { searchContent, buildContentCards } from '../repositories/contentRepository.js';
import { logger } from '../config/logger.js';

export class SearchController {
  /**
   * GET /api/search?q=query&bucket=viral&page=1&limit=20
   * Search content by text query with optional bucket filter
   */
  async search(req: Request, res: Response) {
    try {
      const { q, bucket, page = '1', limit = '20' } = req.query;

      if (!q || typeof q !== 'string' || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Query parameter "q" is required'
        });
      }

      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 20));
      const skip = (pageNum - 1) * limitNum;

      // Search content using text index
      const searchResults = await searchContent(q.trim());

      if (searchResults.length === 0) {
        return res.json({
          success: true,
          data: {
            items: [],
            total: 0,
            page: pageNum,
            hasMore: false
          }
        });
      }

      // Get content IDs
      const contentIds = searchResults.map((c: any) => c._id.toString());

      // Build content cards with all metadata
      let contentCards = await buildContentCards(contentIds);

      // Apply bucket filter if specified
      if (bucket && typeof bucket === 'string' && ['viral', 'educational', 'deep'].includes(bucket)) {
        contentCards = contentCards.filter(card => card.bucket === bucket);
      }

      // Pagination
      const total = contentCards.length;
      const paginatedItems = contentCards.slice(skip, skip + limitNum);
      const hasMore = total > skip + limitNum;

      // Format response to match frontend expectations
      const formattedItems = paginatedItems.map(card => ({
        id: card.id,
        title: card.title,
        description: card.description,
        author: card.creatorName,
        thumbnailUrl: card.thumbnailUrl,
        videoUrl: card.mediaType === 'video' ? card.mediaUrl : undefined,
        audioUrl: card.mediaType === 'audio' ? card.mediaUrl : undefined,
        duration: undefined, // Could be added later
        bucket: card.bucket,
        score: card.scores.finalScore,
        likes: card.scores.likes,
        comments: card.scores.comments,
        views: card.scores.views,
        createdAt: new Date().toISOString(), // Could be improved with actual published date
        tags: card.tags
      }));

      res.json({
        success: true,
        data: {
          items: formattedItems,
          total,
          page: pageNum,
          hasMore
        }
      });
    } catch (error) {
      logger.error({ error }, 'Error in search:');
      res.status(500).json({
        success: false,
        error: 'Failed to search content'
      });
    }
  }

  /**
   * GET /api/search/suggestions?q=query
   * Get search suggestions for autocomplete
   */
  async getSuggestions(req: Request, res: Response) {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string' || q.trim().length === 0) {
        return res.json({
          success: true,
          data: []
        });
      }

      // Search for content matching the query
      const searchResults = await searchContent(q.trim());
      
      // Extract unique tags and titles as suggestions
      const suggestions = new Set<string>();
      
      searchResults.slice(0, 10).forEach((content: any) => {
        suggestions.add(content.title);
        content.tags?.forEach((tag: string) => {
          if (tag.toLowerCase().includes(q.toLowerCase())) {
            suggestions.add(tag);
          }
        });
      });

      res.json({
        success: true,
        data: Array.from(suggestions).slice(0, 8)
      });
    } catch (error) {
      logger.error({ error }, 'Error in getSuggestions:');
      res.status(500).json({
        success: false,
        error: 'Failed to get suggestions'
      });
    }
  }
}
