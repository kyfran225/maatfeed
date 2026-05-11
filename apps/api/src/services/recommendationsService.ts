import { ContentModel, IContent } from '../models/Content.js';
import { UserModel } from '../models/User.js';
import { ReactionModel } from '../models/Reaction.js';
import { CreatorModel } from '../models/Creator.js';
import { SeriesModel } from '../models/Series.js';
import { rankForUser } from '../ai/recommendationEngine.js';
import { feedScoringService, UserPreferences } from './feedScoringService.js';
import { logger } from '../config/logger.js';

export interface RecommendationItem {
  _id: string;
  title: string;
  description: string;
  mediaType: 'video' | 'audio';
  mediaUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  creatorVerified?: boolean;
  tags: string[];
  category: string;
  language: string;
  publishedAt: Date;
  createdAt: Date;
  
  // Metrics
  score: number;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  
  // Recommendation specific
  recommendationType: 'content-based' | 'collaborative' | 'trending' | 'personalized';
  recommendationScore: number;
  recommendationReason: string;
  
  // Additional info
  hasDebate: boolean;
  debateId?: string;
  seriesId?: string;
  seriesTitle?: string;
  episodeNumber?: number;
  isViewed?: boolean;
}

export interface RecommendationOptions {
  userId?: string;
  limit?: number;
  offset?: number;
  type?: 'content-based' | 'collaborative' | 'trending' | 'personalized' | 'all';
  category?: string;
  language?: string;
  excludeViewed?: boolean;
  includeSeries?: boolean;
}

export interface TrendingTopic {
  topic: string;
  count: number;
  growth: number;
  relatedContent: string[];
  category: string;
}

export interface DiscoveryInsight {
  type: 'new_creator' | 'trending_category' | 'viral_content' | 'featured_series';
  title: string;
  description: string;
  contentIds: string[];
  score: number;
}

class RecommendationsService {
  /**
   * Get comprehensive recommendations for user
   */
  async getRecommendations(options: RecommendationOptions = {}): Promise<{
    items: RecommendationItem[];
    trendingTopics: TrendingTopic[];
    discoveryInsights: DiscoveryInsight[];
    meta: {
      type: string;
      algorithm: string;
      timestamp: Date;
      totalItems: number;
    };
  }> {
    const {
      userId,
      limit = 20,
      offset = 0,
      type = 'personalized',
      category,
      language = 'fr',
      excludeViewed = true,
      includeSeries = true
    } = options;

    try {
      let recommendations: RecommendationItem[] = [];
      
      // Get recommendations based on type
      switch (type) {
        case 'content-based':
          recommendations = await this.getContentBasedRecommendations(userId, limit, category, language);
          break;
        case 'collaborative':
          recommendations = await this.getCollaborativeRecommendations(userId, limit, category, language);
          break;
        case 'trending':
          recommendations = await this.getTrendingRecommendations(limit, category, language);
          break;
        case 'personalized':
        default:
          recommendations = await this.getPersonalizedRecommendations(userId, limit, category, language, excludeViewed);
          break;
      }

      // Apply pagination
      const paginatedItems = recommendations.slice(offset, offset + limit);

      // Get trending topics and discovery insights
      const [trendingTopics, discoveryInsights] = await Promise.all([
        this.getTrendingTopics(limit / 2),
        this.getDiscoveryInsights(userId)
      ]);

      // Filter out viewed content if requested
      if (excludeViewed && userId) {
        const viewedContent = await this.getViewedContent(userId);
        const viewedIds = new Set(viewedContent);
        paginatedItems.forEach(item => {
          item.isViewed = viewedIds.has(item._id);
        });
      }

      logger.info({ 
        userId, 
        type, 
        count: paginatedItems.length, 
        category 
      }, 'Generated recommendations');

      return {
        items: paginatedItems,
        trendingTopics,
        discoveryInsights,
        meta: {
          type,
          algorithm: this.getAlgorithmName(type),
          timestamp: new Date(),
          totalItems: recommendations.length
        }
      };
    } catch (error) {
      logger.error({ error: (error as Error).message, userId }, 'Failed to generate recommendations');
      throw error;
    }
  }

  /**
   * Content-based recommendations using similarity scoring
   */
  private async getContentBasedRecommendations(
    userId?: string,
    limit: number = 20,
    category?: string,
    language: string = 'fr'
  ): Promise<RecommendationItem[]> {
    try {
      // Get user preferences and interaction history
      const userPreferences = userId ? await feedScoringService.getUserPreferences(userId) : undefined;
      const userInteractions = userId ? await this.getUserInteractionHistory(userId) : [];

      // Build query
      const query: any = {
        isPublished: true,
        isDeleted: false,
        language
      };

      if (category && category !== 'all') {
        query.category = category;
      }

      // Get content pool
      const content = await ContentModel
        .find(query)
        .populate('creatorId', 'name avatar verified')
        .populate('seriesId', 'title')
        .lean();

      // Calculate content similarity scores
      const scoredContent = await Promise.all(
        content.map(async (item: any) => {
          const contentItem = item as unknown as IContent;
          
          // Calculate similarity based on user preferences and interaction history
          let similarityScore = 0;
          
          if (userPreferences) {
            // Category matching
            similarityScore += userPreferences.categories[contentItem.category] || 0;
            
            // Tag matching
            contentItem.tags.forEach(tag => {
              similarityScore += userPreferences.tags[tag] || 0;
            });
            
            // Creator preference
            similarityScore += userPreferences.creators[contentItem.creatorId.toString()] || 0;
            
            // Media type preference
            similarityScore += userPreferences.mediaTypes[contentItem.mediaType] || 0;
          }

          // Content similarity from interaction history
          similarityScore += await this.calculateContentSimilarity(contentItem, userInteractions);

          return {
            ...contentItem,
            recommendationScore: similarityScore,
            recommendationType: 'content-based' as const,
            recommendationReason: this.generateContentBasedReason(similarityScore, contentItem, userPreferences)
          };
        })
      );

      // Sort by similarity score and limit
      return scoredContent
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit)
        .map(this.transformToRecommendationItem);
    } catch (error) {
      logger.error({ error: (error as Error).message }, 'Failed to generate content-based recommendations');
      return [];
    }
  }

  /**
   * Collaborative filtering recommendations
   */
  private async getCollaborativeRecommendations(
    userId?: string,
    limit: number = 20,
    category?: string,
    language: string = 'fr'
  ): Promise<RecommendationItem[]> {
    try {
      if (!userId) {
        return []; // Collaborative filtering requires user
      }

      // Find similar users based on interaction patterns
      const similarUsers = await this.findSimilarUsers(userId, 50);
      
      if (similarUsers.length === 0) {
        return [];
      }

      // Get content liked by similar users
      const similarUserIds = similarUsers.map(u => u.userId);
      const contentLikedBySimilarUsers = await ReactionModel
        .find({
          userId: { $in: similarUserIds },
          type: { $in: ['like', 'love'] },
          isActive: true
        })
        .distinct('contentId');

      // Build query for recommended content
      const query: any = {
        _id: { $in: contentLikedBySimilarUsers },
        isPublished: true,
        isDeleted: false,
        language
      };

      if (category && category !== 'all') {
        query.category = category;
      }

      // Exclude content already interacted with by current user
      const userInteractedContent = await ReactionModel
        .find({ userId, isActive: true })
        .distinct('contentId');
      
      query._id = { ...query._id, $nin: userInteractedContent };

      const content = await ContentModel
        .find(query)
        .populate('creatorId', 'name avatar verified')
        .populate('seriesId', 'title')
        .lean();

      // Calculate collaborative scores
      const scoredContent = content.map(item => {
        const contentItem = item as unknown as IContent;
        const collaborativeScore = this.calculateCollaborativeScore(contentItem, similarUsers);
        
        return {
          ...contentItem,
          recommendationScore: collaborativeScore,
          recommendationType: 'collaborative' as const,
          recommendationReason: this.generateCollaborativeReason(collaborativeScore, similarUsers)
        };
      });

      return scoredContent
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit)
        .map(this.transformToRecommendationItem);
    } catch (error) {
      logger.error({ error: (error as Error).message }, 'Failed to generate collaborative recommendations');
      return [];
    }
  }

  /**
   * Trending content recommendations
   */
  private async getTrendingRecommendations(
    limit: number = 20,
    category?: string,
    language: string = 'fr'
  ): Promise<RecommendationItem[]> {
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const query: any = {
        isPublished: true,
        isDeleted: false,
        publishedAt: { $gte: oneDayAgo },
        language
      };

      if (category && category !== 'all') {
        query.category = category;
      }

      const content = await ContentModel
        .find(query)
        .populate('creatorId', 'name avatar verified')
        .populate('seriesId', 'title')
        .sort({ score: -1, views: -1, likes: -1 })
        .limit(limit * 2) // Get more to calculate trending scores
        .lean();

      // Calculate trending scores based on velocity
      const scoredContent = content.map(item => {
        const contentItem = item as unknown as IContent;
        const trendingScore = this.calculateTrendingScore(contentItem);
        
        return {
          ...contentItem,
          recommendationScore: trendingScore,
          recommendationType: 'trending' as const,
          recommendationReason: this.generateTrendingReason(trendingScore, contentItem)
        };
      });

      return scoredContent
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit)
        .map(this.transformToRecommendationItem);
    } catch (error) {
      logger.error({ error: (error as Error).message }, 'Failed to generate trending recommendations');
      return [];
    }
  }

  /**
   * Personalized recommendations using ML engine
   */
  private async getPersonalizedRecommendations(
    userId?: string,
    limit: number = 20,
    category?: string,
    language: string = 'fr',
    excludeViewed: boolean = true
  ): Promise<RecommendationItem[]> {
    try {
      if (!userId) {
        // Fallback to trending if no user
        return this.getTrendingRecommendations(limit, category, language);
      }

      // Get user data
      const [user, userPreferences] = await Promise.all([
        UserModel.findById(userId),
        feedScoringService.getUserPreferences(userId)
      ]);

      if (!user) {
        return this.getTrendingRecommendations(limit, category, language);
      }

      // Build content query
      const query: any = {
        isPublished: true,
        isDeleted: false,
        language
      };

      if (category && category !== 'all') {
        query.category = category;
      }

      // Get content pool
      const content = await ContentModel
        .find(query)
        .populate('creatorId', 'name avatar verified')
        .populate('seriesId', 'title')
        .limit(limit * 3) // Get more for ML ranking
        .lean();

      // Transform to feed items for ML engine
      const feedItems = content.map((item: any) => ({
        id: (item as any)._id.toString(),
        title: item.title,
        description: item.description,
        mediaUrl: item.mediaUrl,
        mediaType: item.mediaType,
        creator: {
          name: item.creatorId?.name || 'Unknown',
          handle: item.creatorId?.name?.toLowerCase().replace(/\s+/g, '') || 'unknown',
          avatar: item.creatorId?.avatar
        },
        sourceProvider: 'internal' as const,
        bucket: this.categorizeContent(item as unknown as IContent),
        scores: {
          likes: item.likes,
          comments: item.comments,
          views: item.views,
          finalScore: item.score || 0
        },
        createdAt: item.createdAt.toISOString(),
        transcript: item.transcript,
        summary: item.summary,
        tags: item.tags
      }));

      // Use ML recommendation engine
      const interests = this.extractInterests(userPreferences);
      const rankedItems = await rankForUser({
        items: feedItems,
        interests: interests,
        learningProgress: [] // TODO: Integrate learning progress
      });

      // Transform back to recommendation items
      const recommendations = rankedItems.slice(0, limit).map((item, index) => {
        const originalContent = content.find((c: any) => (c as any)._id.toString() === item.id);
        
        if (!originalContent) return null;
        
        return {
          ...originalContent,
          recommendationScore: 100 - index, // Higher score for top ranked
          recommendationType: 'personalized' as const,
          recommendationReason: this.generatePersonalizedReason(interests, item)
        };
      }).filter(Boolean);

      return recommendations.map(this.transformToRecommendationItem);
    } catch (error) {
      logger.error({ error: (error as Error).message }, 'Failed to generate personalized recommendations');
      return [];
    }
  }

  /**
   * Get trending topics
   */
  async getTrendingTopics(limit: number = 10): Promise<TrendingTopic[]> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Get recent content
      const recentContent = await ContentModel
        .find({
          isPublished: true,
          isDeleted: false,
          publishedAt: { $gte: sevenDaysAgo }
        })
        .select('tags category likes views createdAt')
        .lean();

      // Analyze tag trends
      const tagMetrics = new Map<string, { count: number; growth: number; category: string }>();
      
      recentContent.forEach((content: any) => {
        ((content as any).tags || []).forEach((tag: string) => {
          const existing = tagMetrics.get(tag) || { count: 0, growth: 0, category: (content as any).category };
          existing.count++;
          // Simple growth calculation based on recency and engagement
          existing.growth += ((content as any).likes + (content as any).views * 0.1) * this.getRecencyWeight((content as any).createdAt);
          existing.category = (content as any).category;
          tagMetrics.set(tag, existing);
        });
      });

      // Convert to trending topics
      const trendingTopics: TrendingTopic[] = Array.from(tagMetrics.entries())
        .map(([topic, metrics]) => ({
          topic,
          count: metrics.count,
          growth: Math.round(metrics.growth),
          relatedContent: [], // TODO: Find related content
          category: metrics.category
        }))
        .sort((a, b) => b.growth - a.growth)
        .slice(0, limit);

      return trendingTopics;
    } catch (error) {
      logger.error({ error: (error as Error).message }, 'Failed to get trending topics');
      return [];
    }
  }

  /**
   * Get discovery insights
   */
  async getDiscoveryInsights(userId?: string): Promise<DiscoveryInsight[]> {
    try {
      const insights: DiscoveryInsight[] = [];

      // Trending category insight
      const trendingCategory = await this.getTrendingCategory();
      if (trendingCategory) {
        insights.push({
          type: 'trending_category',
          title: `Trending: ${trendingCategory.name}`,
          description: `Discover popular content in ${trendingCategory.name}`,
          contentIds: trendingCategory.contentIds,
          score: trendingCategory.score
        });
      }

      // New creators insight
      const newCreators = await this.getEmergingCreators();
      if (newCreators.length > 0) {
        insights.push({
          type: 'new_creator',
          title: 'Emerging Creators',
          description: 'Check out these rising stars',
          contentIds: newCreators.map(c => c.contentId),
          score: 85
        });
      }

      // Featured series insight
      const featuredSeries = await this.getFeaturedSeries();
      if (featuredSeries) {
        insights.push({
          type: 'featured_series',
          title: `Featured: ${featuredSeries.title}`,
          description: featuredSeries.description,
          contentIds: featuredSeries.episodeIds,
          score: featuredSeries.score
        });
      }

      // Viral content insight
      const viralContent = await this.getViralContent();
      if (viralContent.length > 0) {
        insights.push({
          type: 'viral_content',
          title: 'Viral Now',
          description: 'Content everyone is talking about',
          contentIds: viralContent.map(c => (c as any)._id.toString()),
          score: 95
        });
      }

      return insights.sort((a, b) => b.score - a.score);
    } catch (error) {
      logger.error({ error: (error as Error).message }, 'Failed to get discovery insights');
      return [];
    }
  }

  // Helper methods

  private async getUserInteractionHistory(userId: string): Promise<IContent[]> {
    const reactions = await ReactionModel
      .find({ userId, isActive: true })
      .populate('contentId')
      .lean();

    return reactions
      .map(r => r.contentId as unknown as IContent)
      .filter(Boolean);
  }

  private async calculateContentSimilarity(content: IContent, userHistory: IContent[]): Promise<number> {
    if (userHistory.length === 0) return 0;

    let similarityScore = 0;
    
    userHistory.forEach(historyItem => {
      // Category similarity
      if (historyItem.category === content.category) {
        similarityScore += 2;
      }
      
      // Tag similarity
      const commonTags = content.tags.filter(tag => historyItem.tags.includes(tag));
      similarityScore += commonTags.length * 1.5;
      
      // Creator similarity
      if (historyItem.creatorId.toString() === content.creatorId.toString()) {
        similarityScore += 3;
      }
      
      // Media type similarity
      if (historyItem.mediaType === content.mediaType) {
        similarityScore += 1;
      }
    });

    return similarityScore / userHistory.length;
  }

  private async findSimilarUsers(userId: string, limit: number): Promise<Array<{ userId: string; similarity: number }>> {
    try {
      // Get current user's reactions
      const userReactions = await ReactionModel
        .find({ userId, isActive: true })
        .select('contentId type')
        .lean();

      const userContentSet = new Set(userReactions.map(r => r.contentId.toString()));

      // Find users with similar reaction patterns
      const allUsers = await ReactionModel
        .find({ userId: { $ne: userId }, isActive: true })
        .select('userId contentId type')
        .lean();

      const userSimilarities = new Map<string, number>();

      allUsers.forEach(reaction => {
        const otherUserId = reaction.userId.toString();
        
        if (userContentSet.has(reaction.contentId.toString())) {
          const similarity = userSimilarities.get(otherUserId) || 0;
          userSimilarities.set(otherUserId, similarity + 1);
        }
      });

      return Array.from(userSimilarities.entries())
        .map(([userId, similarity]) => ({ userId, similarity }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
    } catch (error) {
      logger.error({ error: (error as Error).message }, 'Failed to find similar users');
      return [];
    }
  }

  private calculateCollaborativeScore(content: IContent, similarUsers: Array<{ userId: string; similarity: number }>): number {
    // Simple collaborative scoring based on similar user preferences
    return similarUsers.reduce((score, user) => score + user.similarity, 0) / similarUsers.length;
  }

  private calculateTrendingScore(content: IContent): number {
    const now = new Date();
    const hoursSincePublish = (now.getTime() - new Date(content.publishedAt || content.createdAt).getTime()) / (1000 * 60 * 60);
    
    // Base engagement score
    let score = content.likes * 2 + content.comments * 3 + content.shares * 4 + content.views * 0.1;
    
    // Time decay (recent content gets boost)
    const timeBoost = Math.max(0.1, Math.exp(-hoursSincePublish / 24)); // 24-hour half-life
    score *= timeBoost;
    
    return score;
  }

  private categorizeContent(content: IContent): 'viral' | 'educational' | 'deep' {
    const engagementRatio = (content.likes + content.comments) / Math.max(content.views, 1);
    
    if (engagementRatio > 0.1) return 'viral';
    if (content.category === 'education' || content.tags.some(tag => tag.includes('learn'))) return 'educational';
    return 'deep';
  }

  private extractInterests(userPreferences?: UserPreferences): Record<string, number> {
    if (!userPreferences) return {};

    const interests: Record<string, number> = {
      ...userPreferences.categories,
      ...userPreferences.tags,
      ...userPreferences.creators,
      ...userPreferences.mediaTypes
    };

    // Add some default interests based on common patterns
    if (Object.keys(interests).length === 0) {
      interests.education = 0.5;
      interests.culture = 0.5;
      interests.video = 0.3;
      interests.audio = 0.3;
    }

    return interests;
  }

  private async getViewedContent(userId: string): Promise<string[]> {
    const reactions = await ReactionModel
      .find({ userId, isActive: true })
      .select('contentId')
      .lean();
    
    return reactions.map(r => r.contentId.toString());
  }

  private getRecencyWeight(createdAt: Date): number {
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return Math.max(0.1, Math.exp(-hoursSinceCreation / 48)); // 48-hour half-life
  }

  private transformToRecommendationItem = (item: any): RecommendationItem => {
    return {
      _id: (item as any)._id?.toString() || item.id,
      title: item.title,
      description: item.description,
      mediaType: item.mediaType,
      mediaUrl: item.mediaUrl,
      thumbnailUrl: item.thumbnailUrl,
      duration: item.duration,
      creatorId: item.creatorId?._id?.toString() || item.creatorId?.toString(),
      creatorName: item.creatorId?.name || item.creator?.name,
      creatorAvatar: item.creatorId?.avatar || item.creator?.avatar,
      creatorVerified: item.creatorId?.verified,
      tags: item.tags || [],
      category: item.category,
      language: item.language,
      publishedAt: item.publishedAt || item.createdAt || new Date(),
      createdAt: item.createdAt,
      score: item.score || 0,
      views: item.views || 0,
      likes: item.likes || 0,
      shares: item.shares || 0,
      comments: item.comments || 0,
      recommendationType: item.recommendationType,
      recommendationScore: item.recommendationScore || 0,
      recommendationReason: item.recommendationReason || 'Recommended for you',
      hasDebate: item.hasDebate || false,
      debateId: item.debateId?.toString(),
      seriesId: item.seriesId?._id?.toString() || item.seriesId?.toString(),
      seriesTitle: item.seriesId?.title || item.series?.title,
      episodeNumber: item.episodeNumber
    };
  };

  private generateContentBasedReason(score: number, content: IContent, preferences?: UserPreferences): string {
    if (score > 8) return `Perfect match for your interests in ${content.category}`;
    if (score > 5) return `Similar to content you've enjoyed`;
    if (preferences?.categories[content.category]) return `Based on your interest in ${content.category}`;
    return `Recommended based on content similarity`;
  }

  private generateCollaborativeReason(score: number, similarUsers: Array<{ userId: string; similarity: number }>): string {
    const userCount = similarUsers.length;
    return `${userCount} users with similar taste enjoyed this`;
  }

  private generateTrendingReason(score: number, content: IContent): string {
    if (score > 100) return `Going viral - ${content.views.toLocaleString()} views`;
    if (score > 50) return `Trending in ${content.category}`;
    return `Popular this week`;
  }

  private generatePersonalizedReason(interests: Record<string, number>, item: any): string {
    const topInterests = Object.entries(interests)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([interest]) => interest);
    
    if (topInterests.length > 0) {
      return `Personalized for your interest in ${topInterests.join(' & ')}`;
    }
    return 'Personalized recommendation';
  }

  private getAlgorithmName(type: string): string {
    switch (type) {
      case 'content-based': return 'Content Similarity Matching';
      case 'collaborative': return 'Collaborative Filtering';
      case 'trending': return 'Trend Analysis';
      case 'personalized': return 'ML-Powered Personalization';
      default: return 'Hybrid Recommendation Engine';
    }
  }

  // Additional helper methods for discovery insights
  private async getTrendingCategory(): Promise<{ name: string; contentIds: string[]; score: number } | null> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const categoryStats = await ContentModel.aggregate([
        {
          $match: {
            isPublished: true,
            isDeleted: false,
            publishedAt: { $gte: sevenDaysAgo }
          }
        },
        {
          $group: {
            _id: '$category',
            totalScore: { $sum: '$score' },
            totalViews: { $sum: '$views' },
            contentIds: { $push: '$_id' }
          }
        },
        { $sort: { totalScore: -1 } },
        { $limit: 1 }
      ]);

      if (categoryStats.length > 0) {
        const category = categoryStats[0];
        return {
          name: (category as any)._id,
          contentIds: ((category as any).contentIds || []).map((id: any) => (id as any)._id?.toString?.() || id.toString()),
          score: category.totalScore
        };
      }

      return null;
    } catch (error) {
      logger.error({ error: (error as Error).message }, 'Failed to get trending category');
      return null;
    }
  }

  private async getEmergingCreators(): Promise<Array<{ contentId: string }>> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const newCreators = await CreatorModel
        .find({
          createdAt: { $gte: thirtyDaysAgo },
          verified: false
        })
        .sort({ score: -1 })
        .limit(5)
        .lean();

      const contentIds = await Promise.all(
        newCreators.map(async (creator) => {
          const content = await ContentModel
            .findOne({ creatorId: (creator as any)._id, isPublished: true })
            .select('_id')
            .lean();
          
          return content ? { contentId: (content as any)._id.toString() } : null;
        })
      );

      return contentIds.filter((item): item is { contentId: string } => item !== null);
    } catch (error) {
      logger.error({ error: (error as Error).message }, 'Failed to get emerging creators');
      return [];
    }
  }

  private async getFeaturedSeries(): Promise<{ title: string; description: string; episodeIds: string[]; score: number } | null> {
    try {
      const series = await SeriesModel
        .findOne({ isPublished: true })
        .populate('episodes')
        .sort({ score: -1 })
        .lean();

      if (series) {
        const seriesData = series as any;
        return {
          title: seriesData.title,
          description: seriesData.description,
          episodeIds: ((seriesData.episodes || []) as any[]).map((ep: any) => (ep as any)._id?.toString?.() || ep.toString()),
          score: seriesData.score || 0
        };
      }

      return null;
    } catch (error) {
      logger.error({ error: (error as Error).message }, 'Failed to get featured series');
      return null;
    }
  }

  private async getViralContent(): Promise<IContent[]> {
    try {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);

      return await ContentModel
        .find({
          isPublished: true,
          isDeleted: false,
          publishedAt: { $gte: twentyFourHoursAgo }
        })
        .sort({ views: -1, likes: -1 })
        .limit(3)
        .lean() as unknown as IContent[];
    } catch (error) {
      logger.error({ error: (error as Error).message }, 'Failed to get viral content');
      return [];
    }
  }
}

export const recommendationsService = new RecommendationsService();
