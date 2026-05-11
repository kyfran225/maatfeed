import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, TrendingUp, Star } from 'lucide-react';
import { useUserPreferences } from '../../hooks/useUserPreferences';

interface RecommendedTrack {
  id: string;
  title: string;
  artist: string;
  coverImageUrl?: string;
  duration: number;
  type: 'track' | 'podcast' | 'audiobook';
  category: string;
  rating?: number;
  playCount?: number;
}

export function RecommendedSection() {
  const [selectedCategory, setSelectedCategory] = useState<'trending' | 'personalized' | 'new'>('trending');
  const { preferences } = useUserPreferences();

  // Mock data - à remplacer avec vraie API
  const recommendedTracks: RecommendedTrack[] = [
    {
      id: '1',
      title: 'Afrobeat Mix 2024',
      artist: 'DJ Africa',
      coverImageUrl: '/images/afrobeat-mix.jpg',
      duration: 3600,
      type: 'track',
      category: 'afrobeat',
      rating: 4.8,
      playCount: 125000
    },
    {
      id: '2',
      title: 'Tech News Weekly',
      artist: 'Tech Podcast Africa',
      coverImageUrl: '/images/tech-podcast.jpg',
      duration: 2400,
      type: 'podcast',
      category: 'tech',
      rating: 4.6,
      playCount: 45000
    },
    {
      id: '3',
      title: 'African History Stories',
      artist: 'History Audio',
      coverImageUrl: '/images/history-audio.jpg',
      duration: 1800,
      type: 'audiobook',
      category: 'history',
      rating: 4.9,
      playCount: 89000
    },
    {
      id: '4',
      title: 'Jazz Fusion',
      artist: 'Various Artists',
      coverImageUrl: '/images/jazz-fusion.jpg',
      duration: 2700,
      type: 'track',
      category: 'jazz',
      rating: 4.7,
      playCount: 67000
    }
  ];

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatPlayCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`;
    }
    return count.toString();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'podcast':
        return '🎙️';
      case 'audiobook':
        return '📚';
      default:
        return '🎵';
    }
  };

  const getCategoryLabel = () => {
    switch (selectedCategory) {
      case 'trending':
        return 'Tendances';
      case 'personalized':
        return 'Pour vous';
      case 'new':
        return 'Nouveautés';
      default:
        return 'Recommandations';
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">
          Recommandations
        </h2>
        
        {/* Category Tabs */}
        <div className="flex bg-gray-900 border border-white/20 rounded-lg p-1">
          <button
            onClick={() => setSelectedCategory('trending')}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center space-x-1 ${
              selectedCategory === 'trending' 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span>Tendances</span>
          </button>
          <button
            onClick={() => setSelectedCategory('personalized')}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              selectedCategory === 'personalized' 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Pour vous
          </button>
          <button
            onClick={() => setSelectedCategory('new')}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              selectedCategory === 'new' 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Nouveautés
          </button>
        </div>
      </div>

      {/* Category Description */}
      <div className="mb-4 p-3 bg-gray-900/50 rounded-lg border border-white/5">
        <p className="text-sm text-gray-400">
          {selectedCategory === 'trending' && 'Les contenus les plus populaires en ce moment'}
          {selectedCategory === 'personalized' && 'Basé sur vos intérêts : ' + (preferences?.interests?.join(', ') || 'Musique, Tech, Histoire')}
          {selectedCategory === 'new' && 'Derniers ajouts sur la plateforme'}
        </p>
      </div>

      {/* Recommended Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendedTracks.map((track, index) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="bg-gray-900 rounded-lg border border-white/10 overflow-hidden hover:border-orange-500/50 transition-all duration-300 cursor-pointer group"
          >
            {/* Cover Image */}
            <div className="aspect-square relative overflow-hidden">
              {track.coverImageUrl ? (
                <img
                  src={track.coverImageUrl}
                  alt={track.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-red-600/20 flex items-center justify-center">
                  <span className="text-3xl">{getTypeIcon(track.type)}</span>
                </div>
              )}
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                </motion.button>
              </div>

              {/* Type Badge */}
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded">
                {track.type === 'podcast' ? 'Podcast' : 
                 track.type === 'audiobook' ? 'Livre audio' : 'Musique'}
              </div>

              {/* Rating Badge */}
              {track.rating && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span>{track.rating}</span>
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="p-4">
              <h3 className="font-semibold text-white truncate mb-1">
                {track.title}
              </h3>
              <p className="text-sm text-gray-400 truncate mb-2">
                {track.artist}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-gray-800 rounded">
                    {track.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(track.duration)}</span>
                  </div>
                </div>
                
                {track.playCount && (
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>{formatPlayCount(track.playCount)}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View More Button */}
      <div className="mt-6 text-center">
        <button className="px-6 py-2 bg-gray-900 border border-white/20 text-white rounded-lg hover:border-orange-500 hover:text-orange-500 transition-colors">
          Voir plus de recommandations
        </button>
      </div>
    </motion.section>
  );
}
