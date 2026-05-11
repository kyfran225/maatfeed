import React, { useState } from 'react';
import { Play, Heart, MessageCircle, Share2, Volume2, VolumeX } from 'lucide-react';
import { usePlayerStore } from '../../stores';

// Types for the mobile feed card
interface FeedCardMobileProps {
  id: string;
  title: string;
  author: {
    name: string;
    avatar?: string;
    isVerified?: boolean;
  };
  mediaUrl: string;
  mediaType: 'video' | 'audio';
  thumbnail?: string;
  duration: number;
  views: number;
  likes: number;
  comments: number;
  isLiked?: boolean;
  createdAt: string;
  description?: string;
}

export const FeedCardMobile: React.FC<FeedCardMobileProps> = ({
  id,
  title,
  author,
  mediaUrl,
  mediaType,
  thumbnail,
  duration,
  views,
  likes,
  comments,
  isLiked = false,
  createdAt,
  description,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const { 
    currentTrack, 
    isPlaying, 
    playTrack, 
    pauseTrack,
    setVolume 
  } = usePlayerStore();

  const isCurrentTrack = currentTrack?.id === id;
  const formattedDuration = formatDuration(duration);
  const formattedViews = formatViews(views);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isCurrentTrack && isPlaying) {
      pauseTrack();
    } else {
      const track = {
        id,
        title,
        artist: author.name,
        url: mediaUrl,
        duration,
        coverArt: thumbnail,
        type: mediaType
      };
      playTrack(track);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement like functionality
    console.log('Like post:', id);
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement comment functionality
    console.log('Comment on post:', id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement share functionality
    console.log('Share post:', id);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    setVolume(isMuted ? 1 : 0);
  };

  return (
    <div 
      className="relative w-full bg-black rounded-2xl overflow-hidden cursor-pointer group"
      style={{ aspectRatio: '9/16' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlayPause}
    >
      {/* Background Media */}
      <div className="absolute inset-0">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-2">
                {mediaType === 'video' ? (
                  <Play size={24} className="text-white ml-1" />
                ) : (
                  <Volume2 size={24} className="text-white" />
                )}
              </div>
              <p className="text-gray-400 text-sm">No thumbnail</p>
            </div>
          </div>
        )}
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
      </div>

      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          className={`w-20 h-20 bg-[#FF6B35]/90 hover:bg-[#FF6B35] rounded-full flex items-center justify-center transition-all transform ${
            isHovered || isCurrentTrack ? 'scale-110' : 'scale-100'
          } ${isCurrentTrack && isPlaying ? 'animate-pulse' : ''}`}
          onClick={handlePlayPause}
        >
          {isCurrentTrack && isPlaying ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <div className="w-3 h-8 bg-white rounded-sm mr-1" />
              <div className="w-3 h-8 bg-white rounded-sm" />
            </div>
          ) : (
            <Play size={32} className="text-white ml-1" />
          )}
        </button>
      </div>

      {/* Top Overlay - Author Info */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B35] to-orange-600 flex items-center justify-center flex-shrink-0">
              {author.avatar ? (
                <img 
                  src={author.avatar} 
                  alt={author.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-xs">
                  {author.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1">
                <h3 className="text-white font-semibold text-sm truncate">{author.name}</h3>
                {author.isVerified && (
                  <div className="w-3 h-3 bg-[#FF6B35] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              <p className="text-gray-300 text-xs">{formattedViews} views</p>
            </div>
          </div>
          
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* Bottom Overlay - Content & Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
        {/* Title & Description */}
        <div className="mb-3">
          <h2 className="text-white font-bold text-base mb-1 line-clamp-2">{title}</h2>
          {description && (
            <p className="text-gray-300 text-xs line-clamp-2">{description}</p>
          )}
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
          <span className="text-white text-xs font-medium">{formattedDuration}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLike}
              className="flex items-center space-x-1 text-white hover:text-[#FF6B35] transition-colors"
            >
              <Heart size={20} className={isLiked ? 'fill-[#FF6B35] text-[#FF6B35]' : ''} />
              <span className="text-xs">{likes}</span>
            </button>
            <button 
              onClick={handleComment}
              className="flex items-center space-x-1 text-white hover:text-[#FF6B35] transition-colors"
            >
              <MessageCircle size={20} />
              <span className="text-xs">{comments}</span>
            </button>
            <button 
              onClick={handleShare}
              className="text-white hover:text-[#FF6B35] transition-colors"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar for Current Track */}
      {isCurrentTrack && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
          <div className="h-full bg-[#FF6B35] animate-pulse" />
        </div>
      )}
    </div>
  );
};

// Helper functions
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
}
