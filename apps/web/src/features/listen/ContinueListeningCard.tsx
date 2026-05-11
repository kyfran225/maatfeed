import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, MoreVertical } from 'lucide-react';
import { ContinueListeningItem } from '../../hooks/useContinueListening';

interface ContinueListeningCardProps {
  item: ContinueListeningItem;
  index: number;
  onPlay: () => void;
}

export function ContinueListeningCard({ item, index, onPlay }: ContinueListeningCardProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatLastPlayed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a quelques minutes';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
  };

  const getTypeIcon = () => {
    switch (item.type) {
      case 'podcast':
        return '🎙️';
      case 'audiobook':
        return '📚';
      default:
        return '🎵';
    }
  };

  const getTypeLabel = () => {
    switch (item.type) {
      case 'podcast':
        return 'Podcast';
      case 'audiobook':
        return 'Livre audio';
      default:
        return 'Musique';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gray-900 rounded-lg border border-white/10 p-4 hover:border-orange-500/50 transition-all duration-300 cursor-pointer group"
      onClick={onPlay}
    >
      <div className="flex items-start space-x-4">
        {/* Cover Image */}
        <div className="w-20 h-20 flex-shrink-0 relative overflow-hidden rounded-lg">
          {item.coverImageUrl ? (
            <img
              src={item.coverImageUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-red-600/20 flex items-center justify-center">
              <span className="text-2xl">{getTypeIcon()}</span>
            </div>
          )}
          
          {/* Play Button */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                onPlay();
              }}
            >
              <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
            </motion.button>
          </div>
        </div>

        {/* Content Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs text-gray-500">{getTypeLabel()}</span>
                {item.episodeNumber && (
                  <span className="text-xs text-orange-500">Episode {item.episodeNumber}</span>
                )}
              </div>
              
              <h3 className="font-semibold text-white truncate mb-1">
                {item.title}
              </h3>
              
              <p className="text-sm text-gray-400 truncate mb-2">
                {item.artist}
              </p>
              
              <div className="flex items-center space-x-3 text-xs text-gray-500">
                <span>{formatTime(item.duration)}</span>
                <span>•</span>
                <span>{formatLastPlayed(item.lastPlayedAt)}</span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-1 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Show options
                }}
                className="p-1.5 text-gray-400 hover:text-white transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>{Math.round(item.progress)}% écouté</span>
              <span>{formatTime(Math.floor(item.duration * (item.progress / 100)))}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div
                className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
