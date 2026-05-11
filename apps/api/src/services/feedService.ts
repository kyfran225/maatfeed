import { ContentModel, IContent } from '../models/Content.js';
import { DebateModel, IDebate } from '../models/Debate.js';
import { ReactionModel } from '../models/Reaction.js';
import { feedScoringService, UserPreferences } from './feedScoringService.js';
import { logger } from '../config/logger.js';

export interface FeedItem {
  _id: string;
  title: string;
  description: string;
  mediaType: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  tags: string[];
  category: string;
  language: string;
  publishedAt: Date;
  createdAt: Date;
  
  // Engagement metrics
  score: number;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  
  // Debate info
  hasDebate: boolean;
  debateId?: string;
  debateStatus?: string;
  debateParticipants?: number;
  
  // User interactions
  userReaction?: string;
  isSaved: boolean;
}

export interface FeedOptions {
  userId?: string;
  limit?: number;
  offset?: number;
  category?: string;
  language?: string;
  tags?: string[];
  includeDebates?: boolean;
  timeRange?: 'hour' | 'day' | 'week' | 'month' | 'all';
  sortBy?: 'recent' | 'trending' | 'popular' | 'score';
}

export class FeedService {
  /**
   * Get global feed (non-personalized)
   */
  async getGlobalFeed(cursor?: string, limit?: number): Promise<FeedItem[]> {
    const options: FeedOptions = {
      limit: limit || 20,
      offset: cursor ? parseInt(cursor, 10) : 0
    };
    return this.getFeed(options);
  }

  /**
   * Get personalized feed for user
   */
  async getPersonalizedFeed(userId?: string, cursor?: string, limit?: number): Promise<FeedItem[]> {
    const options: FeedOptions = {
      userId,
      limit: limit || 20,
      offset: cursor ? parseInt(cursor, 10) : 0
    };
    return this.getFeed(options);
  }

  /**
   * Get session-based feed
   */
  async getSessionFeed(sessionId: string): Promise<FeedItem[] | null> {
    // TODO: Implement session-based feed logic
    // For now, return global feed
    return this.getGlobalFeed();
  }

  /**
   * Get feed with options
   */
  private async getFeed(options: FeedOptions): Promise<FeedItem[]> {
    const {
      userId,
      limit = 20,
      offset = 0,
      category,
      language = 'fr',
      tags,
      includeDebates = true,
      timeRange = 'all',
      sortBy = 'score'
    } = options;

    try {
      // Build base query
      const query: any = {
        isPublished: true,
        isDeleted: false
      };

      // Add filters
      if (category) query.category = category;
      if (language) query.language = language;
      if (tags && tags.length > 0) query.tags = { $in: tags };
      if (!includeDebates) query.hasDebate = false;

      // Time range filter
      if (timeRange !== 'all') {
        const now = new Date();
        const timeMap = {
          hour: 1,
          day: 24,
          week: 24 * 7,
          month: 24 * 30
        };
        const hoursAgo = timeMap[timeRange];
        query.publishedAt = { $gte: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000) };
      }

      // Get content
      const content = await ContentModel.find(query)
        .populate({
          path: 'debateId',
          select: 'status participants'
        })
        .sort(this.getSortOptions(sortBy))
        .limit(limit)
        .skip(offset)
        .lean();

      // Transform to feed items
      const feedItems = await Promise.all(
        content.map(async (contentItem) => {
          const feedItem: FeedItem = {
            _id: (contentItem as any)._id.toString(),
            title: contentItem.title,
            description: contentItem.description,
            mediaType: contentItem.mediaType,
            mediaUrl: contentItem.mediaUrl,
            thumbnailUrl: contentItem.thumbnailUrl,
            duration: contentItem.duration,
            creatorId: contentItem.creatorId.toString(),
            creatorName: contentItem.creatorName,
            creatorAvatar: contentItem.creatorAvatar,
            tags: contentItem.tags,
            category: contentItem.category,
            language: contentItem.language,
            publishedAt: contentItem.publishedAt || contentItem.createdAt,
            createdAt: contentItem.createdAt,
            
            // Engagement metrics
            score: contentItem.score,
            views: contentItem.views,
            likes: contentItem.likes,
            shares: contentItem.shares,
            comments: contentItem.comments,
            
            // Debate info
            hasDebate: contentItem.hasDebate,
            debateId: contentItem.debateId?._id?.toString(),
            debateStatus: (contentItem.debateId as any)?.status,
            debateParticipants: (contentItem.debateId as any)?.participants?.length || 0,
            
            // User interactions (will be populated if userId provided)
            userReaction: undefined,
            isSaved: false
          };

          // Get user reactions if userId provided
          if (userId) {
            const userReactions = await ReactionModel.find({
              userId,
              contentId: contentItem._id,
              isActive: true
            });
            
            userReactions.forEach(reaction => {
              if (reaction.type === 'save') {
                feedItem.isSaved = true;
              } else {
                feedItem.userReaction = reaction.type;
              }
            });
          }

          return feedItem;
        })
      );

      return feedItems;
    } catch (error) {
      logger.error({ error: (error as Error).message, options }, 'Failed to get feed');
      throw error;
    }
  }

  /**
   * Get sort options based on sortBy parameter
   */
  private getSortOptions(sortBy: string): any {
    switch (sortBy) {
      case 'recent':
        return { publishedAt: -1 };
      case 'trending':
        return { score: -1, views: -1 };
      case 'popular':
        return { likes: -1, comments: -1 };
      case 'score':
      default:
        return { score: -1 };
    }
  }

  /**
   * Update content engagement metrics
   */
  async updateEngagementMetrics(contentId: string, metrics: {
    views?: number;
    likes?: number;
    shares?: number;
    comments?: number;
  }): Promise<void> {
    try {
      const updateData: any = {};
      
      if (metrics.views !== undefined) updateData.views = metrics.views;
      if (metrics.likes !== undefined) updateData.likes = metrics.likes;
      if (metrics.shares !== undefined) updateData.shares = metrics.shares;
      if (metrics.comments !== undefined) updateData.comments = metrics.comments;

      await ContentModel.updateOne(
        { _id: contentId },
        updateData
      );

      // Recalculate score
      const content = await ContentModel.findById(contentId);
      if (content) {
        const newScore = this.calculateContentScore(content);
        await ContentModel.updateOne(
          { _id: contentId },
          { score: newScore }
        );
      }

      logger.debug({ contentId, metrics }, 'Updated engagement metrics');
    } catch (error) {
      logger.error({ error: (error as Error).message, contentId }, 'Failed to update engagement metrics');
      throw error;
    }
  }

  /**
   * Calculate content score based on engagement metrics
   */
  private calculateContentScore(content: IContent): number {
    const now = new Date();
    const publishedAt = new Date(content.publishedAt || content.createdAt);
    const hoursSincePublish = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);
    
    // Base score from engagement
    let score = 0;
    
    // Likes (weight: 2)
    score += content.likes * 2;
    
    // Comments (weight: 3)
    score += content.comments * 3;
    
    // Shares (weight: 4)
    score += content.shares * 4;
    
    // Views (weight: 0.1)
    score += content.views * 0.1;
    
    // Time decay (content loses value over time)
    const timeDecay = Math.max(0.1, 1 - (hoursSincePublish / 168)); // 1 week decay
    score *= timeDecay;
    
    // Fresh content boost (content < 24h gets boost)
    if (hoursSincePublish < 24) {
      score *= 1.2;
    }
    
    return Math.round(score * 100) / 100; // Round to 2 decimal places
  }
}

export const feedService = new FeedService();

// Export convenience functions for backward compatibility
export const getGlobalFeed = (cursor?: string, limit?: number) => feedService.getGlobalFeed(cursor, limit);
export const getUserFeed = (userId: string, cursor?: string, limit?: number) => feedService.getPersonalizedFeed(userId, cursor, limit);
export const getSessionFeed = (sessionId: string) => feedService.getSessionFeed(sessionId);
export const updateSessionFeed = (sessionId: string, watchedContent: string[], cursor?: string) => {
  // TODO: Implement session-based feed updates
  logger.info({ sessionId, watchedContent }, 'Session feed update requested (not implemented)');
};
