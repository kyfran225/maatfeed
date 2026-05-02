import { CommunityPostModel } from "../models/CommunityPost.js";
import { ContentModel } from "../models/Content.js";
import { ProfileModel } from "../models/Profile.js";
import { communityAIService } from "./communityAIService.js";
import { cacheService } from "./cacheService.js";
import type { CommunityPostDocument } from "../models/CommunityPost.js";

type EligibleCommunityPost = Pick<
  CommunityPostDocument,
  "_id" | "tags" | "viralityScore" | "participantCount" | "quality" | "controversy" | "mediaUrl"
>;

type ScoredCommunityPost = EligibleCommunityPost & {
  feedScore: number;
  integrationType: "trending" | "featured" | "personalized";
};

type ContentWithCommunityMetadata = {
  metadata?: {
    communityPostId?: {
      tags: string[];
    } | string;
  };
};

// Interface pour l'intégration feed-communauté
export interface CommunityFeedItem {
  communityPostId: string;
  feedContentId?: string;
  score: number;
  type: "trending" | "featured" | "personalized";
  boost: number;
}

// Interface pour les statistiques d'intégration
export interface IntegrationStats {
  totalCommunityPosts: number;
  transformedToFeed: number;
  averageTransformationScore: number;
  topPerformingTopics: string[];
  engagementIncrease: number;
}

class CommunityFeedIntegrationService {
  /**
   * Intègre les posts communautaires populaires dans le feed
   */
  async integrateCommunityToFeed(): Promise<CommunityFeedItem[]> {
    try {
      // 1. Récupérer les posts communautaires éligibles
      const eligiblePosts = await this.getEligibleCommunityPosts();
      
      // 2. Calculer les scores d'intégration
      const scoredPosts = await this.scorePostsForFeed(eligiblePosts);
      
      // 3. Transformer les meilleurs posts en contenu feed
      const transformedItems = await this.transformTopPosts(scoredPosts);
      
      // 4. Mettre à jour le feed avec le nouveau contenu
      await this.updateFeedWithCommunityContent(transformedItems);
      
      // 5. Mettre en cache les résultats
      await this.cacheIntegrationResults(transformedItems);
      
      return transformedItems;
    } catch (error) {
      console.error("Error integrating community to feed:", error);
      return [];
    }
  }

  /**
   * Récupère les posts communautaires éligibles pour le feed
   */
  private async getEligibleCommunityPosts(): Promise<EligibleCommunityPost[]> {
    const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 dernières heures
    
    const posts = await CommunityPostModel.find({
      isHidden: false,
      createdAt: { $gte: threshold },
      viralityScore: { $gte: 30 }, // Score minimum
      participantCount: { $gte: 3 }, // Minimum 3 participants
      transformedToFeed: false // Pas encore transformés
    })
    .sort({ viralityScore: -1, participantCount: -1 })
    .limit(50)
    .populate("author", "username avatar")
    .lean() as unknown as EligibleCommunityPost[];

    return posts;
  }

  /**
   * Calcule les scores d'intégration pour les posts
   */
  private async scorePostsForFeed(posts: EligibleCommunityPost[]): Promise<ScoredCommunityPost[]> {
    const scoredPosts: ScoredCommunityPost[] = [];

    for (const post of posts) {
      const score = await this.calculateFeedIntegrationScore(post);
      const type = this.determineIntegrationType(score);
      
      scoredPosts.push({
        ...post,
        feedScore: score,
        integrationType: type
      });
    }

    return scoredPosts.sort((a, b) => b.feedScore - a.feedScore);
  }

  /**
   * Calcule le score d'intégration pour un post
   */
  private async calculateFeedIntegrationScore(post: EligibleCommunityPost): Promise<number> {
    let score = 0;

    // Base: score de viralité (40%)
    score += post.viralityScore * 0.4;

    // Engagement participants (25%)
    const engagementScore = Math.min(100, post.participantCount * 10);
    score += engagementScore * 0.25;

    // Qualité IA (20%)
    score += (post.quality * 100) * 0.2;

    // Controverse modérée (10%) - augmente l'engagement
    const controversyScore = (post.controversy > 0.3 && post.controversy < 0.7) ? 50 : post.controversy * 30;
    score += controversyScore * 0.1;

    // Média (5%)
    if (post.mediaUrl) score += 5;

    // Bonus pour les tendances actuelles
    const trendingBonus = await this.getTrendingBonus(post.tags);
    score += trendingBonus;

    return Math.min(100, Math.round(score));
  }

  /**
   * Détermine le type d'intégration
   */
  private determineIntegrationType(score: number): "trending" | "featured" | "personalized" {
    if (score >= 75) return "trending";
    if (score >= 50) return "featured";
    return "personalized";
  }

  /**
   * Transforme les meilleurs posts en contenu feed
   */
  private async transformTopPosts(scoredPosts: ScoredCommunityPost[]): Promise<CommunityFeedItem[]> {
    const transformedItems: CommunityFeedItem[] = [];
    const topPosts = scoredPosts.slice(0, 10); // Top 10 posts

    for (const post of topPosts) {
      try {
        const feedContentId = await communityAIService.transformDiscussionToFeed(post._id.toString());
        
        if (feedContentId) {
          transformedItems.push({
            communityPostId: post._id.toString(),
            feedContentId,
            score: post.feedScore,
            type: post.integrationType,
            boost: this.calculateBoost(post.integrationType, post.feedScore)
          });
        }
      } catch (error) {
        console.error(`Error transforming post ${post._id}:`, error);
      }
    }

    return transformedItems;
  }

  /**
   * Met à jour le feed avec le contenu communautaire
   */
  private async updateFeedWithCommunityContent(items: CommunityFeedItem[]): Promise<void> {
    for (const item of items) {
      if (item.feedContentId) {
        // Appliquer les boosts au contenu feed
        await this.applyFeedBoosts(item.feedContentId, item.boost, item.type);
        
        // Ajouter aux feeds appropriés
        await this.addToFeeds(item);
      }
    }

    // Invalider les caches feed
    await cacheService.deletePattern("feed:*");
  }

  /**
   * Applique les boosts au contenu feed
   */
  private async applyFeedBoosts(contentId: string, boost: number, type: string): Promise<void> {
    const boostMultiplier = {
      trending: 1.5,
      featured: 1.3,
      personalized: 1.1
    };

    const finalBoost = boost * (boostMultiplier[type as keyof typeof boostMultiplier] || 1);

    await ContentModel.findByIdAndUpdate(contentId, {
      $inc: { score: finalBoost },
      $set: { 
        lastBoostedAt: new Date(),
        boostType: type
      }
    });
  }

  /**
   * Ajoute le contenu aux feeds appropriés
   */
  private async addToFeeds(item: CommunityFeedItem): Promise<void> {
    if (!item.feedContentId) return;

    switch (item.type) {
      case "trending":
        await this.addToGlobalFeed(item.feedContentId, item.boost * 1.5);
        break;
      case "featured":
        await this.addToGlobalFeed(item.feedContentId, item.boost);
        await this.addToPersonalizedFeeds(item.feedContentId);
        break;
      case "personalized":
        await this.addToPersonalizedFeeds(item.feedContentId);
        break;
    }
  }

  /**
   * Ajoute au feed global
   */
  private async addToGlobalFeed(contentId: string, boost: number): Promise<void> {
    // Le contenu sera automatiquement inclus dans le feed global via les scores
    await ContentModel.findByIdAndUpdate(contentId, {
      $inc: { globalFeedBoost: boost || 0 }
    });
  }

  /**
   * Ajoute aux feeds personnalisés basés sur les tags
   */
  private async addToPersonalizedFeeds(contentId: string): Promise<void> {
    const content = await ContentModel.findById(contentId).populate("metadata.communityPostId") as unknown as ContentWithCommunityMetadata | null;
    if (!content) return;

    const communityPost = content.metadata?.communityPostId;
    if (!communityPost || typeof communityPost === "string") return;

    // Trouver les utilisateurs intéressés par ces tags
    const interestedUsers = await ProfileModel.find({
      interests: { $in: communityPost.tags }
    }).distinct("userId");

    // Mettre en cache pour les feeds personnalisés
    for (const userId of interestedUsers) {
      await cacheService.set(
        `personalized_feed_boost:${userId}:${contentId}`,
        { boost: 1.2, addedAt: new Date() },
        3600 // 1 heure
      );
    }
  }

  /**
   * Calcule le boost pour un post
   */
  private calculateBoost(type: string, score: number): number {
    const baseBoost = {
      trending: 25,
      featured: 15,
      personalized: 10
    };

    const scoreMultiplier = score / 100;
    return (baseBoost[type as keyof typeof baseBoost] || 10) * scoreMultiplier;
  }

  /**
   * Obtient le bonus de tendance pour les tags
   */
  private async getTrendingBonus(tags: string[]): Promise<number> {
    try {
      const trends = await communityAIService.detectTrendingTopics("day");
      
      let bonus = 0;
      for (const tag of tags) {
        const trend = trends.find(t => t.topic.toLowerCase().includes(tag.toLowerCase()));
        if (trend) {
          bonus += Math.min(20, trend.growth / 5); // Max 20 points par tag tendance
        }
      }

      return Math.min(30, bonus); // Max 30 points bonus total
    } catch (error) {
      console.error("Error getting trending bonus:", error);
      return 0;
    }
  }

  /**
   * Met en cache les résultats d'intégration
   */
  private async cacheIntegrationResults(items: CommunityFeedItem[]): Promise<void> {
    await cacheService.set(
      "community_feed_integration",
      {
        items,
        timestamp: new Date(),
        count: items.length
      },
      300 // 5 minutes
    );
  }

  /**
   * Synchronise les interactions du feed vers la communauté
   */
  async syncFeedToCommunity(contentId: string, interactionType: string, userId: string): Promise<void> {
    try {
      // Vérifier si c'est du contenu communautaire
      const content = await ContentModel.findById(contentId) as unknown as ContentWithCommunityMetadata | null;
      if (!content?.metadata?.communityPostId || typeof content.metadata.communityPostId === "string") return;

      const communityPostId = content.metadata.communityPostId;
      
      // Mettre à jour les métriques du post communautaire
      const updateData: any = {};
      
      switch (interactionType) {
        case "like":
          updateData.$inc = { upvotes: 1 };
          break;
        case "share":
          updateData.$inc = { "engagementMetrics.shares": 1 };
          break;
        case "watch":
          updateData.$inc = { "engagementMetrics.views": 1 };
          break;
        case "save":
          updateData.$inc = { "engagementMetrics.bookmarks": 1 };
          break;
      }

      updateData.$set = { lastActivityAt: new Date() };

      await CommunityPostModel.findByIdAndUpdate(communityPostId, updateData);

      // Mettre à jour le score de viralité
      await communityAIService.updateViralityScores();
      
    } catch (error) {
      console.error("Error syncing feed to community:", error);
    }
  }

  /**
   * Obtient les statistiques d'intégration
   */
  async getIntegrationStats(): Promise<IntegrationStats> {
    try {
      const totalPosts = await CommunityPostModel.countDocuments({ isHidden: false });
      const transformedCount = await CommunityPostModel.countDocuments({ transformedToFeed: true });
      
      const transformedPosts = await CommunityPostModel.find({ transformedToFeed: true })
        .select("transformationScore tags")
        .lean() as unknown as Array<{ transformationScore?: number; tags: string[] }>;
      
      const avgTransformationScore = transformedPosts.length > 0
        ? transformedPosts.reduce((sum, post) => sum + (post.transformationScore || 0), 0) / transformedPosts.length
        : 0;

      // Top topics
      const allTags = transformedPosts.flatMap(post => post.tags);
      const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topTopics = Object.entries(tagCounts)
        .sort(([, a]: [string, number], [, b]: [string, number]) => Number(b) - Number(a))
        .slice(0, 5)
        .map(([tag]) => tag);

      // Calculer l'augmentation d'engagement (simulation)
      const engagementIncrease = transformedCount > 0 ? (avgTransformationScore / 100) * 45 : 0;

      return {
        totalCommunityPosts: totalPosts,
        transformedToFeed: transformedCount,
        averageTransformationScore: Math.round(avgTransformationScore),
        topPerformingTopics: topTopics,
        engagementIncrease: Math.round(engagementIncrease)
      };
    } catch (error) {
      console.error("Error getting integration stats:", error);
      return {
        totalCommunityPosts: 0,
        transformedToFeed: 0,
        averageTransformationScore: 0,
        topPerformingTopics: [],
        engagementIncrease: 0
      };
    }
  }

  /**
   * Nettoie les anciennes intégrations
   */
  async cleanupOldIntegrations(): Promise<void> {
    try {
      const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 jours

      // Marquer les anciens posts comme non transformés pour réévaluation
      await CommunityPostModel.updateMany(
        {
          transformedToFeed: true,
          createdAt: { $lt: cutoff },
          viralityScore: { $lt: 20 } // Posts qui ne sont plus populaires
        },
        {
          $set: { transformedToFeed: false },
          $unset: { feedContentId: 1, transformationScore: 1 }
        }
      );

      console.log("Cleaned up old community integrations");
    } catch (error) {
      console.error("Error cleaning up old integrations:", error);
    }
  }
}

export const communityFeedIntegrationService = new CommunityFeedIntegrationService();
