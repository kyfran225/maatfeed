import { ContentModel, IContent } from '../models/Content.js';
import { UserModel } from '../models/User.js';
import { ReactionModel } from '../models/Reaction.js';
import { logger } from '../config/logger.js';

export interface UserPreferences {
  userId: string;
  categories: Record<string, number>; // category -> preference score
  tags: Record<string, number>; // tag -> preference score
  creators: Record<string, number>; // creatorId -> preference score
  mediaTypes: Record<string, number>; // video/audio -> preference score
  languages: string[];
  timeOfDayPreferences: Record<string, number>; // hour -> preference score
  engagementPatterns: {
    averageWatchTime: number;
    preferredDuration: { min: number; max: number };
    peakActivityHours: number[];
  };
}

export interface ScoringFactors {
  // Engagement factors
  likesWeight: number;
  commentsWeight: number;
  sharesWeight: number;
  viewsWeight: number;
  completionRateWeight: number;
  
  // Time factors
  freshContentBoost: number;
  trendingBoost: number;
  timeDecayRate: number;
  
  // Personalization factors
  categoryMatchWeight: number;
  tagMatchWeight: number;
  creatorMatchWeight: number;
  mediaTypeMatchWeight: number;
  languageMatchWeight: number;
  
  // Quality factors
  debateBoost: number;
  verifiedCreatorBoost: number;
  qualityScoreWeight: number;
}

export class FeedScoringService {
  private readonly defaultFactors: ScoringFactors = {
    // Engagement weights (higher = more important)
    likesWeight: 2.0,
    commentsWeight: 3.0,
    sharesWeight: 4.0,
    viewsWeight: 0.1,
    completionRateWeight: 5.0,
    
    // Time factors
    freshContentBoost: 1.5,
    trendingBoost: 1.3,
    timeDecayRate: 0.05, // per hour
    
    // Personalization weights
    categoryMatchWeight: 2.5,
    tagMatchWeight: 1.8,
    creatorMatchWeight: 3.0,
    mediaTypeMatchWeight: 1.5,
    languageMatchWeight: 2.0,
    
    // Quality factors
    debateBoost: 1.4,
    verifiedCreatorBoost: 1.2,
    qualityScoreWeight: 1.0
  };

  /**
   * Calculate personalized score for content
   */
  async calculatePersonalizedScore(
    content: IContent, 
    userPreferences?: UserPreferences,
    factors: Partial<ScoringFactors> = {}
  ): Promise<number> {
    const scoringFactors = { ...this.defaultFactors, ...factors };
    const now = new Date();
    
    // Base engagement score
    let score = this.calculateEngagementScore(content, scoringFactors);
    
    // Time-based adjustments
    score *= this.calculateTimeMultiplier(content, now, scoringFactors);
    
    // Personalization multipliers
    if (userPreferences) {
      score *= this.calculatePersonalizationMultiplier(content, userPreferences, scoringFactors);
    }
    
    // Quality multipliers
    score *= this.calculateQualityMultiplier(content, scoringFactors);
    
    // Apply logarithmic scaling to prevent extreme values
    score = Math.log10(score + 1) * 100;
    
    return Math.round(score * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate base engagement score
   */
  private calculateEngagementScore(content: IContent, factors: ScoringFactors): number {
    let score = 0;
    
    // Weighted engagement metrics
    score += content.likes * factors.likesWeight;
    score += content.comments * factors.commentsWeight;
    score += content.shares * factors.sharesWeight;
    score += content.views * factors.viewsWeight;
    
    // Completion rate (if available)
    if ((content as any).completionRate) {
      score += (content as any).completionRate * content.views * factors.completionRateWeight;
    }
    
    return Math.max(1, score); // Minimum score of 1
  }

  /**
   * Calculate time-based multiplier
   */
  private calculateTimeMultiplier(content: IContent, now: Date, factors: ScoringFactors): number {
    const publishedAt = new Date(content.publishedAt || content.createdAt);
    const hoursSincePublish = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);
    
    let multiplier = 1.0;
    
    // Time decay (exponential decay)
    const timeDecay = Math.exp(-factors.timeDecayRate * hoursSincePublish);
    multiplier *= Math.max(0.1, timeDecay);
    
    // Fresh content boost (content < 24h)
    if (hoursSincePublish < 24) {
      multiplier *= factors.freshContentBoost;
    }
    
    // Trending boost (content with high recent engagement)
    if (hoursSincePublish < 48 && this.isTrending(content)) {
      multiplier *= factors.trendingBoost;
    }
    
    return multiplier;
  }

  /**
   * Calculate personalization multiplier
   */
  private calculatePersonalizationMultiplier(
    content: IContent, 
    userPreferences: UserPreferences, 
    factors: ScoringFactors
  ): number {
    let multiplier = 1.0;
    
    // Category preference
    const categoryScore = userPreferences.categories[content.category] || 0;
    multiplier *= 1 + (categoryScore * factors.categoryMatchWeight);
    
    // Tag preferences
    const tagScore = content.tags.reduce((sum, tag) => {
      return sum + (userPreferences.tags[tag] || 0);
    }, 0) / Math.max(1, content.tags.length);
    multiplier *= 1 + (tagScore * factors.tagMatchWeight);
    
    // Creator preference
    const creatorScore = userPreferences.creators[content.creatorId.toString()] || 0;
    multiplier *= 1 + (creatorScore * factors.creatorMatchWeight);
    
    // Media type preference
    const mediaTypeScore = userPreferences.mediaTypes[content.mediaType] || 0;
    multiplier *= 1 + (mediaTypeScore * factors.mediaTypeMatchWeight);
    
    // Language preference
    const languageMatch = userPreferences.languages.includes(content.language);
    multiplier *= languageMatch ? (1 + factors.languageMatchWeight) : 0.5;
    
    // Time of day preference
    const currentHour = new Date().getHours();
    const timeScore = userPreferences.timeOfDayPreferences[currentHour.toString()] || 0;
    multiplier *= 1 + (timeScore * 0.5);
    
    return multiplier;
  }

  /**
   * Calculate quality multiplier
   */
  private calculateQualityMultiplier(content: IContent, factors: ScoringFactors): number {
    let multiplier = 1.0;
    
    // Debate boost
    if (content.hasDebate) {
      multiplier *= factors.debateBoost;
    }
    
    // Verified creator boost
    if ((content as any).isVerifiedCreator) {
      multiplier *= factors.verifiedCreatorBoost;
    }
    
    // Quality score (if available from AI moderation)
    if ((content as any).qualityScore) {
      multiplier *= 1 + ((content as any).qualityScore * factors.qualityScoreWeight);
    }
    
    // Duration optimization (not too short, not too long)
    if (content.duration) {
      const optimalMin = 60; // 1 minute
      const optimalMax = 600; // 10 minutes
      if (content.duration >= optimalMin && content.duration <= optimalMax) {
        multiplier *= 1.1;
      } else if (content.duration < optimalMin || content.duration > optimalMax) {
        multiplier *= 0.9;
      }
    }
    
    return multiplier;
  }

  /**
   * Check if content is trending
   */
  private isTrending(content: IContent): boolean {
    // Content is trending if it has high engagement relative to its age
    const hoursSincePublish = (Date.now() - new Date(content.publishedAt || content.createdAt).getTime()) / (1000 * 60 * 60);
    const engagementRate = (content.likes + content.comments * 2 + content.shares * 3) / Math.max(1, hoursSincePublish);
    
    return engagementRate > 10; // Threshold for trending
  }

  /**
   * Get user preferences based on their behavior
   */
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return this.getDefaultPreferences(userId);
      }

      // Get user's interaction history
      const reactions = await ReactionModel.find({
        userId,
        isActive: true
      }).populate('contentId');

      const preferences: UserPreferences = {
        userId,
        categories: {},
        tags: {},
        creators: {},
        mediaTypes: {},
        languages: [user.preferredLanguage || 'fr'],
        timeOfDayPreferences: {},
        engagementPatterns: {
          averageWatchTime: user.averageWatchTime || 120,
          preferredDuration: { min: 60, max: 600 },
          peakActivityHours: [10, 14, 20] // Default peak hours
        }
      };

      // Analyze reactions to build preferences
      reactions.forEach(reaction => {
        const content = reaction.contentId as any;
        if (!content) return;

        // Category preferences
        if (content.category) {
          preferences.categories[content.category] = 
            (preferences.categories[content.category] || 0) + this.getReactionWeight(reaction.type);
        }

        // Tag preferences
        if (content.tags) {
          content.tags.forEach((tag: string) => {
            preferences.tags[tag] = 
              (preferences.tags[tag] || 0) + this.getReactionWeight(reaction.type);
          });
        }

        // Creator preferences
        if (content.creatorId) {
          preferences.creators[content.creatorId.toString()] = 
            (preferences.creators[content.creatorId.toString()] || 0) + this.getReactionWeight(reaction.type);
        }

        // Media type preferences
        if (content.mediaType) {
          preferences.mediaTypes[content.mediaType] = 
            (preferences.mediaTypes[content.mediaType] || 0) + this.getReactionWeight(reaction.type);
        }
      });

      // Normalize preferences
      this.normalizePreferences(preferences);

      return preferences;
    } catch (error) {
      logger.error({ error: (error as Error).message, userId }, 'Failed to get user preferences');
      return this.getDefaultPreferences(userId);
    }
  }

  /**
   * Get weight for different reaction types
   */
  private getReactionWeight(reactionType: string): number {
    const weights: Record<string, number> = {
      'like': 1.0,
      'love': 1.5,
      'save': 2.0,
      'share': 1.8,
      'comment': 1.3,
      'dislike': -0.5
    };
    return weights[reactionType] || 0;
  }

  /**
   * Normalize preference scores to 0-1 range
   */
  private normalizePreferences(preferences: UserPreferences): void {
    // Normalize categories
    const maxCategoryScore = Math.max(...Object.values(preferences.categories), 1);
    Object.keys(preferences.categories).forEach(key => {
      preferences.categories[key] /= maxCategoryScore;
    });

    // Normalize tags
    const maxTagScore = Math.max(...Object.values(preferences.tags), 1);
    Object.keys(preferences.tags).forEach(key => {
      preferences.tags[key] /= maxTagScore;
    });

    // Normalize creators
    const maxCreatorScore = Math.max(...Object.values(preferences.creators), 1);
    Object.keys(preferences.creators).forEach(key => {
      preferences.creators[key] /= maxCreatorScore;
    });

    // Normalize media types
    const maxMediaTypeScore = Math.max(...Object.values(preferences.mediaTypes), 1);
    Object.keys(preferences.mediaTypes).forEach(key => {
      preferences.mediaTypes[key] /= maxMediaTypeScore;
    });
  }

  /**
   * Get default preferences for new users
   */
  private getDefaultPreferences(userId: string): UserPreferences {
    return {
      userId,
      categories: {
        'music': 0.8,
        'education': 0.7,
        'entertainment': 0.6,
        'debate': 0.5
      },
      tags: {},
      creators: {},
      mediaTypes: {
        'video': 0.7,
        'audio': 0.6
      },
      languages: ['fr'],
      timeOfDayPreferences: {
        '6': 0.3, '7': 0.4, '8': 0.5, '9': 0.6, '10': 0.8,
        '11': 0.7, '12': 0.6, '13': 0.7, '14': 0.8, '15': 0.7,
        '16': 0.6, '17': 0.5, '18': 0.6, '19': 0.7, '20': 0.8,
        '21': 0.6, '22': 0.4, '23': 0.3, '0': 0.2, '1': 0.2,
        '2': 0.2, '3': 0.2, '4': 0.2, '5': 0.3
      },
      engagementPatterns: {
        averageWatchTime: 120,
        preferredDuration: { min: 60, max: 600 },
        peakActivityHours: [10, 14, 20]
      }
    };
  }

  /**
   * Update user preferences based on new interactions
   */
  async updateUserPreferences(
    userId: string, 
    contentId: string, 
    reactionType: string,
    watchTime?: number
  ): Promise<void> {
    try {
      const content = await ContentModel.findById(contentId);
      if (!content) return;

      const preferences = await this.getUserPreferences(userId);
      const weight = this.getReactionWeight(reactionType);

      // Update category preference
      if (content.category) {
        preferences.categories[content.category] = 
          Math.max(0, Math.min(1, (preferences.categories[content.category] || 0) + weight * 0.1));
      }

      // Update tag preferences
      if (content.tags) {
        content.tags.forEach((tag: string) => {
          preferences.tags[tag] = 
            Math.max(0, Math.min(1, (preferences.tags[tag] || 0) + weight * 0.1));
        });
      }

      // Update creator preference
      preferences.creators[content.creatorId.toString()] = 
        Math.max(0, Math.min(1, (preferences.creators[content.creatorId.toString()] || 0) + weight * 0.1));

      // Update media type preference
      if (content.mediaType) {
        preferences.mediaTypes[content.mediaType] = 
          Math.max(0, Math.min(1, (preferences.mediaTypes[content.mediaType] || 0) + weight * 0.1));
      }

      // Update engagement patterns
      if (watchTime && content.duration) {
        const completionRate = watchTime / content.duration;
        preferences.engagementPatterns.averageWatchTime = 
          (preferences.engagementPatterns.averageWatchTime * 0.9) + (watchTime * 0.1);
      }

      // Store updated preferences (could be cached or stored in user document)
      logger.debug({ userId, contentId, reactionType }, 'Updated user preferences');
    } catch (error) {
      logger.error({ error: (error as Error).message, userId, contentId }, 'Failed to update user preferences');
    }
  }
}

export const feedScoringService = new FeedScoringService();
