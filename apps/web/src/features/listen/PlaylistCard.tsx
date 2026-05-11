import React from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, MoreVertical, Clock } from 'lucide-react';
import { Playlist } from '../../stores/audioStore';

interface PlaylistCardProps {
  playlist: Playlist;
  index: number;
  onPlay: () => void;
}

export function PlaylistCard({ playlist, index, onPlay }: PlaylistCardProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-gray-900 rounded-lg border border-white/10 overflow-hidden hover:border-orange-500/50 transition-all duration-300 cursor-pointer"
      onClick={onPlay}
    >
      {/* Cover Image */}
      <div className="aspect-square relative overflow-hidden">
        {playlist.coverImageUrl ? (
          <img
            src={playlist.coverImageUrl}
            alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-red-600/20 flex items-center justify-center">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
          >
            <Play className="w-6 h-6 text-white ml-1" fill="white" />
          </motion.button>
        </div>

        {/* Favorite Badge */}
        {playlist.isFavorite && (
          <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
        )}
      </div>

      {/* Playlist Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white truncate mb-1">
          {playlist.name}
        </h3>
        {playlist.description && (
          <p className="text-sm text-gray-400 line-clamp-2 mb-2">
            {playlist.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <span>{playlist.trackCount} titres</span>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(playlist.duration)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Toggle favorite
              }}
              className="p-1 hover:text-orange-500 transition-colors"
            >
              <Heart 
                className={`w-4 h-4 ${playlist.isFavorite ? 'text-orange-500 fill-orange-500' : ''}`} 
              />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Show options
              }}
              className="p-1 hover:text-white transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Badge */}
      {playlist.isRecent && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
          Nouveau
        </div>
      )}
    </motion.div>
  );
}
