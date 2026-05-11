import React, { useState } from 'react';
import { useRecommendations, useTrendingTopics, useDiscoveryInsights } from '../../hooks/useRecommendations';
import { RecommendationItem, TrendingTopic, DiscoveryInsight } from '../../types/recommendations';
import { FeedCard } from '../feed/FeedCard';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Badge } from '../../components/ui/Badge';

type RecommendationType = 'all' | 'personalized' | 'content-based' | 'collaborative' | 'trending';

export const RecommendationsPage: React.FC = () => {
  const [activeType, setActiveType] = useState<RecommendationType>('personalized');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const {
    recommendations,
    trendingTopics,
    discoveryInsights,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    fetchRecommendations,
  } = useRecommendations({
    type: activeType === 'all' ? undefined : activeType,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    limit: 20,
  });

  const { topics: trendingTopicsData } = useTrendingTopics(8);
  const { insights } = useDiscoveryInsights();

  const categories = ['all', 'education', 'culture', 'debate', 'entertainment', 'news', 'sports', 'technology'];

  const handleTypeChange = (type: RecommendationType) => {
    setActiveType(type);
    // Reset offset when changing type
    fetchRecommendations({ 
      type: type === 'all' ? undefined : type,
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      offset: 0 
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchRecommendations({ 
      type: activeType === 'all' ? undefined : activeType,
      category: category === 'all' ? undefined : category,
      offset: 0 
    });
  };

  const getAlgorithmDescription = (type: RecommendationType) => {
    switch (type) {
      case 'personalized':
        return 'ML-powered recommendations based on your interests';
      case 'content-based':
        return 'Similar content to what you\'ve enjoyed';
      case 'collaborative':
        return 'Content liked by users with similar taste';
      case 'trending':
        return 'Popular content right now';
      case 'all':
        return 'Mixed recommendations from all algorithms';
      default:
        return '';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <Button onClick={refresh} variant="primary">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover</h1>
          <p className="text-gray-400">
            {getAlgorithmDescription(activeType)}
          </p>
        </div>

        {/* Discovery Insights */}
        {insights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Discovery Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {insights.map((insight) => (
                <InsightCard key={insight.title} insight={insight} />
              ))}
            </div>
          </div>
        )}

        {/* Type Selector */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {(['personalized', 'content-based', 'collaborative', 'trending', 'all'] as RecommendationType[]).map((type) => (
              <Button
                key={type}
                variant={activeType === type ? 'primary' : 'secondary'}
                onClick={() => handleTypeChange(type)}
                className="capitalize text-sm px-3 py-1"
              >
                {type.replace('-', ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'primary' : 'secondary'}
                onClick={() => handleCategoryChange(category)}
                className="capitalize text-sm px-3 py-1"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Trending Topics */}
        {trendingTopicsData.length > 0 && activeType === 'trending' && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Trending Topics</h2>
            <div className="flex flex-wrap gap-2">
              {trendingTopicsData.map((topic) => (
                <Badge key={topic.topic} variant="secondary" className="text-sm">
                  #{topic.topic} ({topic.count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Recommendations ({recommendations.length})
            </h2>
            <Button
              variant="secondary"
              onClick={refresh}
              disabled={loading}
              className="text-sm px-3 py-1"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Refresh'}
            </Button>
          </div>

          {loading && recommendations.length === 0 ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No recommendations found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {recommendations.map((item) => (
                  <RecommendationCard key={item._id} item={item} />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="secondary"
                    onClick={loadMore}
                    disabled={loading}
                    className="text-sm px-3 py-1"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Load More'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Recommendation Card Component
const RecommendationCard: React.FC<{ item: RecommendationItem }> = ({ item }) => {
  return (
    <div className="relative group">
      <FeedCard
        id={item._id}
        title={item.title}
        description={item.description}
        thumbnailUrl={item.thumbnailUrl}
        creatorName={item.creatorName}
        creatorAvatar={item.creatorAvatar}
        creatorVerified={item.creatorVerified}
        views={item.views}
        likes={item.likes}
        comments={item.comments}
        duration={item.duration || 0}
        mediaType={item.mediaType}
        hasDebate={item.hasDebate}
        seriesTitle={item.seriesTitle}
        episodeNumber={item.episodeNumber}
        isViewed={item.isViewed}
      />
      
      {/* Recommendation Badge */}
      <div className="absolute top-2 right-2">
        <Badge variant="primary" className="text-xs">
          {item.recommendationType}
        </Badge>
      </div>

      {/* Recommendation Reason */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-xs text-white line-clamp-2">
          {item.recommendationReason}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-orange-400">
            {Math.round(item.recommendationScore)}% match
          </span>
        </div>
      </div>
    </div>
  );
};

// Insight Card Component
const InsightCard: React.FC<{ insight: DiscoveryInsight }> = ({ insight }) => {
  const getIcon = (type: DiscoveryInsight['type']) => {
    switch (type) {
      case 'new_creator':
        return '🌟';
      case 'trending_category':
        return '📈';
      case 'viral_content':
        return '🔥';
      case 'featured_series':
        return '🎬';
      default:
        return '✨';
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors cursor-pointer">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{getIcon(insight.type)}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">{insight.title}</h3>
          <p className="text-xs text-gray-400 line-clamp-2">{insight.description}</p>
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              {insight.score}% relevant
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
