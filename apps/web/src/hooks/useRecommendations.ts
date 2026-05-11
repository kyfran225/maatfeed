import { useState, useEffect, useCallback } from 'react';
import { RecommendationItem, TrendingTopic, DiscoveryInsight } from '../types/recommendations';

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

export interface UseRecommendationsReturn {
  recommendations: RecommendationItem[];
  trendingTopics: TrendingTopic[];
  discoveryInsights: DiscoveryInsight[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  fetchRecommendations: (options?: RecommendationOptions) => Promise<void>;
}

export const useRecommendations = (options: RecommendationOptions = {}): UseRecommendationsReturn => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [discoveryInsights, setDiscoveryInsights] = useState<DiscoveryInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [currentOptions, setCurrentOptions] = useState(options);

  const fetchRecommendations = useCallback(async (fetchOptions: RecommendationOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      
      // Build query parameters
      const mergedOptions = { ...currentOptions, ...fetchOptions };
      
      if (mergedOptions.type) queryParams.append('type', mergedOptions.type);
      if (mergedOptions.category) queryParams.append('category', mergedOptions.category);
      if (mergedOptions.language) queryParams.append('language', mergedOptions.language);
      if (mergedOptions.limit) queryParams.append('limit', mergedOptions.limit.toString());
      if (mergedOptions.offset) queryParams.append('offset', mergedOptions.offset.toString());
      if (mergedOptions.excludeViewed !== undefined) queryParams.append('excludeViewed', mergedOptions.excludeViewed.toString());
      if (mergedOptions.includeSeries !== undefined) queryParams.append('includeSeries', mergedOptions.includeSeries.toString());

      const response = await fetch(`/api/recommendations?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
      }

      const data: RecommendationsResponse = await response.json();

      if (fetchOptions.offset && fetchOptions.offset > 0) {
        // Append for pagination
        setRecommendations(prev => [...prev, ...data.items]);
      } else {
        // Replace for initial load or refresh
        setRecommendations(data.items);
        setTrendingTopics(data.trendingTopics);
        setDiscoveryInsights(data.discoveryInsights);
      }

      setHasMore(data.items.length === (mergedOptions.limit || 20));
      setCurrentOptions(mergedOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  }, [currentOptions]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const newOffset = currentOffset + (currentOptions.limit || 20);
      setCurrentOffset(newOffset);
      fetchRecommendations({ ...currentOptions, offset: newOffset });
    }
  }, [loading, hasMore, currentOffset, currentOptions, fetchRecommendations]);

  const refresh = useCallback(() => {
    setCurrentOffset(0);
    fetchRecommendations({ ...currentOptions, offset: 0 });
  }, [currentOptions, fetchRecommendations]);

  // Initial load
  useEffect(() => {
    fetchRecommendations();
  }, []); // Only run on mount

  return {
    recommendations,
    trendingTopics,
    discoveryInsights,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    fetchRecommendations,
  };
};

// Hook for specific recommendation types
export const useContentBasedRecommendations = (options: Omit<RecommendationOptions, 'type'> = {}) => {
  return useRecommendations({ ...options, type: 'content-based' });
};

export const useCollaborativeRecommendations = (options: Omit<RecommendationOptions, 'type'> = {}) => {
  return useRecommendations({ ...options, type: 'collaborative' });
};

export const useTrendingRecommendations = (options: Omit<RecommendationOptions, 'type'> = {}) => {
  return useRecommendations({ ...options, type: 'trending' });
};

export const usePersonalizedRecommendations = (options: Omit<RecommendationOptions, 'type'> = {}) => {
  return useRecommendations({ ...options, type: 'personalized' });
};

// Hook for trending topics
export const useTrendingTopics = (limit: number = 10) => {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/recommendations/trending-topics?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch trending topics: ${response.statusText}`);
      }

      const data = await response.json();
      setTopics(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching trending topics:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  return { topics, loading, error, refresh: fetchTopics };
};

// Hook for discovery insights
export const useDiscoveryInsights = () => {
  const [insights, setInsights] = useState<DiscoveryInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recommendations/discovery', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch discovery insights: ${response.statusText}`);
      }

      const data = await response.json();
      setInsights(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching discovery insights:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return { insights, loading, error, refresh: fetchInsights };
};

// Hook for related content
export const useRelatedContent = (contentId: string, limit: number = 5) => {
  const [relatedContent, setRelatedContent] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRelatedContent = useCallback(async () => {
    if (!contentId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/recommendations/related/${contentId}?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch related content: ${response.statusText}`);
      }

      const data = await response.json();
      setRelatedContent(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching related content:', err);
    } finally {
      setLoading(false);
    }
  }, [contentId, limit]);

  useEffect(() => {
    fetchRelatedContent();
  }, [fetchRelatedContent]);

  return { relatedContent, loading, error, refresh: fetchRelatedContent };
};

// Hook for recommendation preferences
export const useRecommendationPreferences = () => {
  const [preferences, setPreferences] = useState({
    defaultType: 'personalized' as const,
    enableTrending: true,
    enableCollaborative: true,
    enableContentBased: true,
    categories: ['education', 'culture', 'debate', 'entertainment'],
    languages: ['fr', 'en'],
    excludeViewed: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recommendations/preferences', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch preferences: ${response.statusText}`);
      }

      const data = await response.json();
      setPreferences(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching preferences:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (newPreferences: Partial<typeof preferences>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recommendations/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newPreferences),
      });

      if (!response.ok) {
        throw new Error(`Failed to update preferences: ${response.statusText}`);
      }

      const data = await response.json();
      setPreferences(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error updating preferences:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refresh: fetchPreferences,
  };
};
