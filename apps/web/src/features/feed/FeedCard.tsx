import React from 'react';
import { Play, Pause, Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react';
import { usePlayerStore } from '../../stores';

interface FeedCardProps {
  id: string;
  title: string;
  author: {
    name: string;
    avatar?: string;
    isVerified?: boolean;
  };
  audioUrl: string;
  duration: number;
  thumbnail?: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  createdAt: string;
  description?: string;
}

export const FeedCard: React.FC<FeedCardProps> = ({
  id,
  title,
  author,
  audioUrl,
  duration,
  thumbnail,
  likes,
  comments,
  shares,
  isLiked = false,
  createdAt,
  description,
}) => {
  const { 
    currentTrack, 
    isPlaying, 
    currentTime,
    playTrack, 
    pauseTrack,
    setVolume,
    setCurrentTime 
  } = usePlayerStore();

  const isCurrentTrack = currentTrack?.id === id;
  const formattedDuration = formatDuration(duration);
  const timeAgo = formatTimeAgo(createdAt);

  const handlePlayPause = () => {
    if (isCurrentTrack && isPlaying) {
      pauseTrack();
    } else {
      const track = {
        id,
        title,
        artist: author.name,
        url: audioUrl,
        duration,
        coverArt: thumbnail,
      };
      playTrack(track);
    }
  };

  const handleLike = () => {
    // TODO: Implement like functionality
    console.log('Like post:', id);
  };

  const handleComment = () => {
    // TODO: Implement comment functionality
    console.log('Comment on post:', id);
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share post:', id);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#1A1A1A] rounded-2xl overflow-hidden border border-gray-800">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B35] to-orange-600 flex items-center justify-center">
            {author.avatar ? (
              <img 
                src={author.avatar} 
                alt={author.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-sm">
                {author.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <h3 className="text-white font-semibold text-sm">{author.name}</h3>
              {author.isVerified && (
                <div className="w-4 h-4 bg-[#FF6B35] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <p className="text-gray-400 text-xs">{timeAgo}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <h2 className="text-white font-bold text-lg mb-2 line-clamp-2">{title}</h2>
        {description && (
          <p className="text-gray-300 text-sm line-clamp-3 mb-3">{description}</p>
        )}
      </div>

      {/* Audio Player Section */}
      <div className="px-4 pb-3">
        {thumbnail && (
          <div className="relative mb-3 rounded-xl overflow-hidden">
            <img 
              src={thumbnail} 
              alt={title}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <button
                onClick={handlePlayPause}
                className="w-16 h-16 bg-[#FF6B35] hover:bg-orange-600 rounded-full flex items-center justify-center transition-all transform hover:scale-105"
              >
                {isCurrentTrack && isPlaying ? (
                  <Pause size={28} className="text-white ml-1" />
                ) : (
                  <Play size={28} className="text-white ml-1" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Audio Controls */}
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm font-medium truncate flex-1">
              {isCurrentTrack ? title : 'Tap to play'}
            </span>
            <span className="text-gray-400 text-xs ml-2">{formattedDuration}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-1 mb-3">
            <div 
              className="bg-[#FF6B35] h-1 rounded-full transition-all duration-300"
              style={{ 
                width: isCurrentTrack ? `${(currentTime || 0) / duration * 100}%` : '0%' 
              }}
            />
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePlayPause}
              className="w-10 h-10 bg-[#FF6B35] hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors"
            >
              {isCurrentTrack && isPlaying ? (
                <Pause size={16} className="text-white" />
              ) : (
                <Play size={16} className="text-white ml-0.5" />
              )}
            </button>
            
            <div className="flex items-center space-x-1">
              <button className="text-gray-400 hover:text-white transition-colors p-2">
                <Heart size={18} className={isLiked ? 'fill-[#FF6B35] text-[#FF6B35]' : ''} />
              </button>
              <button className="text-gray-400 hover:text-white transition-colors p-2">
                <MessageCircle size={18} />
              </button>
              <button className="text-gray-400 hover:text-white transition-colors p-2">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="px-4 pb-4 flex items-center justify-between text-gray-400 text-xs">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <Heart size={14} className={isLiked ? 'fill-[#FF6B35] text-[#FF6B35]' : ''} />
            <span>{likes}</span>
          </span>
          <span className="flex items-center space-x-1">
            <MessageCircle size={14} />
            <span>{comments}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Share2 size={14} />
            <span>{shares}</span>
          </span>
        </div>
        <span>{formattedDuration}</span>
      </div>
    </div>
  );
};

// Helper functions
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}
