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
  publishedAt: string;
  createdAt: string;
  
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

export interface RecommendationOptions {
  type?: 'content-based' | 'collaborative' | 'trending' | 'personalized' | 'all';
  category?: string;
  language?: string;
  limit?: number;
  offset?: number;
  excludeViewed?: boolean;
  includeSeries?: boolean;
}

export interface RecommendationsResponse {
  items: RecommendationItem[];
  trendingTopics: TrendingTopic[];
  discoveryInsights: DiscoveryInsight[];
  meta: {
    type: string;
    algorithm: string;
    timestamp: string;
    totalItems: number;
  };
}

export interface RecommendationPreferences {
  defaultType: 'content-based' | 'collaborative' | 'trending' | 'personalized';
  enableTrending: boolean;
  enableCollaborative: boolean;
  enableContentBased: boolean;
  categories: string[];
  languages: string[];
  excludeViewed: boolean;
}
