import React, { useState, useEffect } from 'react';
import { FeedGrid } from './FeedGrid';
import { FeedLoading } from './FeedLoading';
import { FeedEmpty } from './FeedEmpty';
import { FeedItem } from '../../types/feed';
import { useUIStore } from '../../stores';

export const FeedPageMobile: React.FC = () => {
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
      // Fallback to mock data for development
      if (reset) {
        setItems(getMockFeedData());
      }
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
            window.location.href = '/explore';
          }
        }}
      />
    );
  }

  return (
    <FeedGrid
      items={items}
      loading={loading}
      onRefresh={handleRefresh}
      onLoadMore={handleLoadMore}
      hasMore={hasMore}
    />
  );
};

// Mock data for development
function getMockFeedData(): FeedItem[] {
  return [
    {
      _id: '1',
      title: 'Découverte musicale: Les nouveaux talents africains',
      description: 'Explorez les artistes émergents qui révolutionnent la musique africaine',
      mediaType: 'video',
      mediaUrl: 'https://example.com/video1.mp4',
      thumbnailUrl: 'https://picsum.photos/400/700?random=1',
      duration: 180,
      creatorId: 'creator1',
      creatorName: 'Music Africa',
      creatorAvatar: 'https://picsum.photos/100/100?random=101',
      tags: ['music', 'africa', 'talents'],
      category: 'music',
      language: 'fr',
      publishedAt: new Date(),
      createdAt: new Date(Date.now() - 3600000),
      score: 85,
      views: 15420,
      likes: 892,
      shares: 234,
      comments: 156,
      hasDebate: true,
      debateId: 'debate1',
      debateStatus: 'active',
      debateParticipants: 45,
      userReaction: 'like',
      isSaved: false
    },
    {
      _id: '2',
      title: 'Débat: Technologie et tradition en Afrique',
      description: 'Comment la technologie moderne coexiste avec les traditions africaines',
      mediaType: 'audio',
      mediaUrl: 'https://example.com/audio2.mp3',
      thumbnailUrl: 'https://picsum.photos/400/700?random=2',
      duration: 240,
      creatorId: 'creator2',
      creatorName: 'Tech Debate',
      creatorAvatar: 'https://picsum.photos/100/100?random=102',
      tags: ['technology', 'tradition', 'debate'],
      category: 'technology',
      language: 'fr',
      publishedAt: new Date(),
      createdAt: new Date(Date.now() - 7200000),
      score: 78,
      views: 8900,
      likes: 567,
      shares: 123,
      comments: 89,
      hasDebate: true,
      debateId: 'debate2',
      debateStatus: 'active',
      debateParticipants: 23,
      userReaction: undefined,
      isSaved: true
    },
    {
      _id: '3',
      title: 'Podcast: Entrepreneuriat africain',
      description: 'Inspirez-vous des success stories d entrepreneurs africains',
      mediaType: 'audio',
      mediaUrl: 'https://example.com/audio3.mp3',
      thumbnailUrl: 'https://picsum.photos/400/700?random=3',
      duration: 300,
      creatorId: 'creator3',
      creatorName: 'Business Africa',
      creatorAvatar: 'https://picsum.photos/100/100?random=103',
      tags: ['business', 'entrepreneurship', 'success'],
      category: 'business',
      language: 'fr',
      publishedAt: new Date(),
      createdAt: new Date(Date.now() - 10800000),
      score: 92,
      views: 12300,
      likes: 1100,
      shares: 456,
      comments: 234,
      hasDebate: false,
      userReaction: 'like',
      isSaved: false
    },
    {
      _id: '4',
      title: 'Education: Nouvelles méthodes d apprentissage',
      description: 'Découvrez les approches innovantes pour l éducation en Afrique',
      mediaType: 'video',
      mediaUrl: 'https://example.com/video4.mp4',
      thumbnailUrl: 'https://picsum.photos/400/700?random=4',
      duration: 420,
      creatorId: 'creator4',
      creatorName: 'Edu Future',
      creatorAvatar: 'https://picsum.photos/100/100?random=104',
      tags: ['education', 'innovation', 'learning'],
      category: 'education',
      language: 'fr',
      publishedAt: new Date(),
      createdAt: new Date(Date.now() - 14400000),
      score: 88,
      views: 9800,
      likes: 745,
      shares: 189,
      comments: 167,
      hasDebate: true,
      debateId: 'debate4',
      debateStatus: 'active',
      debateParticipants: 34,
      userReaction: undefined,
      isSaved: false
    },
    {
      _id: '5',
      title: 'Sport: Les héros du sport africain',
      description: 'Célébrons les athlètes qui font la fierté de l Afrique',
      mediaType: 'video',
      mediaUrl: 'https://example.com/video5.mp4',
      thumbnailUrl: 'https://picsum.photos/400/700?random=5',
      duration: 360,
      creatorId: 'creator5',
      creatorName: 'Sport Legends',
      creatorAvatar: 'https://picsum.photos/100/100?random=105',
      tags: ['sport', 'heroes', 'africa'],
      category: 'sports',
      language: 'fr',
      publishedAt: new Date(),
      createdAt: new Date(Date.now() - 18000000),
      score: 81,
      views: 15600,
      likes: 923,
      shares: 267,
      comments: 189,
      hasDebate: false,
      userReaction: 'like',
      isSaved: true
    },
    {
      _id: '6',
      title: 'Santé: Médecine traditionnelle vs moderne',
      description: 'Analyse des approches médicales en Afrique contemporaine',
      mediaType: 'audio',
      mediaUrl: 'https://example.com/audio6.mp3',
      thumbnailUrl: 'https://picsum.photos/400/700?random=6',
      duration: 270,
      creatorId: 'creator6',
      creatorName: 'Health Talk',
      creatorAvatar: 'https://picsum.photos/100/100?random=106',
      tags: ['health', 'medicine', 'tradition'],
      category: 'health',
      language: 'fr',
      publishedAt: new Date(),
      createdAt: new Date(Date.now() - 21600000),
      score: 75,
      views: 6700,
      likes: 434,
      shares: 98,
      comments: 76,
      hasDebate: true,
      debateId: 'debate6',
      debateStatus: 'active',
      debateParticipants: 19,
      userReaction: undefined,
      isSaved: false
    }
  ];
}
