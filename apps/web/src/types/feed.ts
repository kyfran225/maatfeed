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
  sortBy?: 'score' | 'recent' | 'trending' | 'popular';
}
