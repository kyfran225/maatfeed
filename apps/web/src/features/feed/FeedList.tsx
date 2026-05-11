import React, { useState, useEffect } from 'react';
import { FeedCard } from './FeedCard';
import { FeedItem } from '../../../types/feed';
import { useUIStore } from '../../stores';

interface FeedListProps {
  items: FeedItem[];
  loading?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  emptyMessage?: string;
}

export const FeedList: React.FC<FeedListProps> = ({
  items,
  loading = false,
  onRefresh,
  onLoadMore,
  hasMore = true,
  emptyMessage = "Aucun contenu à afficher"
}) => {
  const { setLoading } = useUIStore();

  const handleRefresh = async () => {
    setLoading('feed', true);
    try {
      await onRefresh?.();
    } finally {
      setLoading('feed', false);
    }
  };

  const handleLoadMore = async () => {
    if (!loading && hasMore && onLoadMore) {
      await onLoadMore();
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#1A1A1A] p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] border-t-transparent"></div>
        <p className="text-gray-400 mt-4">Chargement du contenu...</p>
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#1A1A1A] p-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 00-2 2m14 0v2a2 2 0 002 2H5a2 2 0 01-2-2v-2a2 2 0 00-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Aucun contenu</h3>
          <p className="text-gray-400 text-center max-w-md">{emptyMessage}</p>
          <button
            onClick={handleRefresh}
            className="mt-6 px-6 py-3 bg-[#FF6B35] hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            Actualiser
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1A1A1A] border-b border-gray-800 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Feed</h1>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 7m0 0H4v7m6 0v-7m-6 7l6-7m-8 7v7m0 0a8 8 0 01-8-8V8a8 8 0 018-8z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Feed Content */}
      <div className="max-w-md mx-auto">
        <div className="space-y-4 p-4">
          {items.map((item, index) => (
            <FeedCard
              key={item._id}
              {...item}
            />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="p-4 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF6B35] border-t-transparent"></div>
                  <span>Chargement...</span>
                </div>
              ) : (
                'Charger plus'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
