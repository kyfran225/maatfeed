import React, { useRef, useCallback } from 'react';
import { FeedCardMobile } from './FeedCardMobile';
import { FeedItem } from '../../types/feed';
import { Home, Search, PlusCircle, User, Settings, MessageCircle } from 'lucide-react';

interface FeedGridProps {
  items: FeedItem[];
  loading?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const FeedGrid: React.FC<FeedGridProps> = ({
  items,
  loading = false,
  onRefresh,
  onLoadMore,
  hasMore = true,
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && onLoadMore) {
        onLoadMore();
      }
    }, {
      threshold: 0.1,
      rootMargin: '100px'
    });

    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, onLoadMore]);

  const handleNavClick = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">MAATFEED</h1>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Search size={20} />
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Pull-to-refresh indicator */}
          <div className="flex justify-center mb-4">
            <button
              onClick={onRefresh}
              className="text-gray-500 hover:text-white transition-colors text-sm"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Pull to refresh'}
            </button>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {items.map((item, index) => (
              <div
                key={item._id}
                ref={index === items.length - 1 ? lastItemRef : null}
                className="transform transition-all duration-200 hover:scale-105"
              >
                <FeedCardMobile
                  id={item._id}
                  title={item.title}
                  author={{
                    name: item.creatorName,
                    avatar: item.creatorAvatar,
                    isVerified: false // TODO: Add verification status to FeedItem
                  }}
                  mediaUrl={item.mediaUrl || ''}
                  mediaType={item.mediaType as 'video' | 'audio'}
                  thumbnail={item.thumbnailUrl}
                  duration={item.duration || 0}
                  views={item.views}
                  likes={item.likes}
                  comments={item.comments}
                  isLiked={item.userReaction === 'like'}
                  createdAt={item.createdAt.toISOString()}
                  description={item.description}
                />
              </div>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35]"></div>
            </div>
          )}

          {/* End of Feed */}
          {!hasMore && items.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">You've reached the end</p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            <button
              onClick={() => handleNavClick('/feed')}
              className="flex flex-col items-center p-2 text-[#FF6B35] transition-colors"
            >
              <Home size={20} />
              <span className="text-xs mt-1">Home</span>
            </button>
            
            <button
              onClick={() => handleNavClick('/explore')}
              className="flex flex-col items-center p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Search size={20} />
              <span className="text-xs mt-1">Explore</span>
            </button>
            
            <button
              onClick={() => handleNavClick('/upload')}
              className="flex flex-col items-center p-2 text-gray-400 hover:text-white transition-colors"
            >
              <div className="w-10 h-10 bg-[#FF6B35] rounded-full flex items-center justify-center -mt-2">
                <PlusCircle size={20} className="text-white" />
              </div>
            </button>
            
            <button
              onClick={() => handleNavClick('/debates')}
              className="flex flex-col items-center p-2 text-gray-400 hover:text-white transition-colors"
            >
              <MessageCircle size={20} />
              <span className="text-xs mt-1">Debates</span>
            </button>
            
            <button
              onClick={() => handleNavClick('/profile')}
              className="flex flex-col items-center p-2 text-gray-400 hover:text-white transition-colors"
            >
              <User size={20} />
              <span className="text-xs mt-1">Profile</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};
