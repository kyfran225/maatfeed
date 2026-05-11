import React, { useState, useEffect } from 'react';
import { FeedList } from './FeedList';
import { FeedLoading } from './FeedLoading';
import { FeedEmpty } from './FeedEmpty';
import { FeedItem } from '../../../types/feed';
import { useUIStore } from '../../stores';

export const FeedPage: React.FC = () => {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('score');

  const { setLoading: setUILoading } = useUIStore();

  const loadFeed = async (reset = false) => {
    try {
      setLoading(true);
      setUILoading('feed', true);

      const currentOffset = reset ? 0 : offset;
      const params = new URLSearchParams({
        limit: '20',
        offset: currentOffset.toString(),
        category,
        sortBy,
        includeDebates: 'true'
      });

      const response = await fetch(`/api/feed/personalized?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load feed');
      }

      const data = await response.json();

      if (reset) {
        setItems(data.data);
      } else {
        setItems(prev => [...prev, ...data.data]);
      }

      setHasMore(data.meta.hasMore);
      setOffset(currentOffset + data.meta.count);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
      setUILoading('feed', false);
    }
  };

  const handleRefresh = async () => {
    await loadFeed(true);
  };

  const handleLoadMore = async () => {
    if (!loading && hasMore) {
      await loadFeed();
    }
  };

  useEffect(() => {
    loadFeed(true);
  }, [category, sortBy]);

  if (loading && items.length === 0) {
    return <FeedLoading />;
  }

  if (!loading && items.length === 0) {
    return (
      <FeedEmpty
        title="Votre feed est vide"
        message="Suivez des créateurs ou explorez des catégories pour remplir votre feed"
        action={{
          label: 'Explorer',
          onClick: () => {
            // Navigate to explore page
            window.location.href = '/explore';
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1A1A1A] border-b border-gray-800 p-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-white mb-4">Feed</h1>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setOffset(0);
              }}
              className="flex-1 px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            >
              <option value="all">Toutes catégories</option>
              <option value="debate">Débats</option>
              <option value="music">Musique</option>
              <option value="podcast">Podcasts</option>
              <option value="news">Actualités</option>
              <option value="education">Éducation</option>
              <option value="entertainment">Divertissement</option>
              <option value="sports">Sports</option>
              <option value="technology">Technologie</option>
              <option value="business">Business</option>
              <option value="health">Santé</option>
              <option value="other">Autre</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setOffset(0);
              }}
              className="px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            >
              <option value="score">Pertinent</option>
              <option value="recent">Récent</option>
              <option value="trending">Tendances</option>
              <option value="popular">Populaire</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feed Content */}
      <FeedList
        items={items}
        loading={loading}
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      />
    </div>
  );
};
