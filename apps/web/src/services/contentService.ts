import { getJson, postJson } from './httpClient';

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  author: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  duration?: number;
  bucket: 'viral' | 'educational' | 'deep';
  score: number;
  likes: number;
  comments: number;
  views: number;
  createdAt: string;
  tags: string[];
}

export interface TrendingContent {
  items: ContentItem[];
  bucket: string;
  timeframe: string;
  totalItems: number;
}

export interface SearchResponse {
  items: ContentItem[];
  total: number;
  page: number;
  hasMore: boolean;
}

export const contentService = {
  // Get trending content by bucket
  async getTrendingContent(bucket: string = 'viral', limit: number = 20): Promise<TrendingContent> {
    return await getJson<TrendingContent>(`/api/trends/content/${bucket}?limit=${limit}`);
  },

  // Get trend analytics
  async getTrendAnalytics(): Promise<any> {
    return await getJson<any>('/api/trends/analytics');
  },

  // Search content using the backend API
  async searchContent(query: string, bucket?: string, page: number = 1, limit: number = 20): Promise<SearchResponse> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString()
    });

    if (bucket) {
      params.append('bucket', bucket);
    }

    const response = await getJson<{ success: boolean; data: SearchResponse }>(`/api/search?${params.toString()}`);
    return response.data;
  },

  // Get content by ID using the dedicated endpoint
  async getContentById(contentId: string): Promise<ContentItem | null> {
    try {
      const response = await getJson<{ success: boolean; data: ContentItem }>(`/api/content/${contentId}`);
      return response.data;
    } catch (error) {
      if (!(error instanceof Error && error.message === 'Content not found')) {
        console.error('Failed to get content by ID:', error);
      }
      return null;
    }
  }
};
