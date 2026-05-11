import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Users, Clock, Star } from 'lucide-react';

interface SeriesCardProps {
  series: {
    _id: string;
    title: string;
    description: string;
    coverImage: string;
    creatorId: {
      _id: string;
      username: string;
      avatar?: string;
    };
    category: string;
    episodeCount: number;
    totalDuration: number;
    followerCount: number;
    rating: {
      average: number;
      count: number;
    };
    isVerified: boolean;
    status: 'ongoing' | 'completed' | 'hiatus';
    createdAt: string;
  };
  variant?: 'default' | 'compact' | 'featured';
}

export const SeriesCard: React.FC<SeriesCardProps> = ({ 
  series, 
  variant = 'default' 
}) => {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      education: '#3B82F6',
      entertainment: '#8B5CF6',
      news: '#EF4444',
      culture: '#F59E0B',
      technology: '#10B981',
      business: '#6366F1',
      health: '#EC4899',
      sports: '#F97316',
      other: '#6B7280'
    };
    return colors[category] || colors.other;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      ongoing: { text: 'En cours', color: '#10B981' },
      completed: { text: 'Terminé', color: '#6B7280' },
      hiatus: { text: 'En pause', color: '#F59E0B' }
    };
    return badges[status as keyof typeof badges] || badges.ongoing;
  };

  if (variant === 'compact') {
    return (
      <Link 
        to={`/series/${series._id}`}
        className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors border border-gray-800"
      >
        <img 
          src={series.coverImage} 
          alt={series.title}
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate">
            {series.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span 
              className="text-xs px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: getCategoryColor(series.category) }}
            >
              {series.category}
            </span>
            <span className="text-xs text-gray-400">
              {series.episodeCount} épisodes
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link 
        to={`/series/${series._id}`}
        className="relative group block bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden hover:from-gray-800 hover:to-gray-700 transition-all duration-300 border border-gray-700 hover:border-orange-500/50"
      >
        {/* Badge Vérifié */}
        {series.isVerified && (
          <div className="absolute top-3 right-3 z-10">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <Star className="w-3 h-3 text-white fill-white" />
            </div>
          </div>
        )}

        {/* Cover Image */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={series.coverImage} 
            alt={series.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span 
              className="text-xs px-2 py-1 rounded-full text-white font-medium"
              style={{ backgroundColor: getStatusBadge(series.status).color }}
            >
              {getStatusBadge(series.status).text}
            </span>
          </div>

          {/* Category Badge */}
          <div className="absolute bottom-3 left-3">
            <span 
              className="text-xs px-2 py-1 rounded-full text-white font-medium"
              style={{ backgroundColor: getCategoryColor(series.category) }}
            >
              {series.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h2 className="font-bold text-white text-lg mb-2 line-clamp-2">
            {series.title}
          </h2>
          
          <p className="text-gray-300 text-sm mb-3 line-clamp-2">
            {series.description}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{series.followerCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Play className="w-4 h-4" />
                <span>{series.episodeCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(series.totalDuration)}</span>
              </div>
            </div>
            
            {series.rating.count > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                <span className="text-orange-400">
                  {series.rating.average.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Creator */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700">
            <img 
              src={series.creatorId.avatar || '/default-avatar.png'} 
              alt={series.creatorId.username}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-300">
              {series.creatorId.username}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link 
      to={`/series/${series._id}`}
      className="group bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-all duration-200 border border-gray-800 hover:border-orange-500/50"
    >
      <div className="relative">
        {/* Cover Image */}
        <div className="relative h-40 overflow-hidden">
          <img 
            src={series.coverImage} 
            alt={series.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          
          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <span 
              className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
              style={{ backgroundColor: getStatusBadge(series.status).color }}
            >
              {getStatusBadge(series.status).text}
            </span>
          </div>

          {/* Category Badge */}
          <div className="absolute bottom-2 left-2">
            <span 
              className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
              style={{ backgroundColor: getCategoryColor(series.category) }}
            >
              {series.category}
            </span>
          </div>

          {/* Verified Badge */}
          {series.isVerified && (
            <div className="absolute top-2 right-2">
              <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                <Star className="w-2.5 h-2.5 text-white fill-white" />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2 group-hover:text-orange-400 transition-colors">
            {series.title}
          </h3>
          
          <p className="text-gray-400 text-xs mb-2 line-clamp-2">
            {series.description}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{series.followerCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Play className="w-3 h-3" />
                <span>{series.episodeCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(series.totalDuration)}</span>
              </div>
            </div>
            
            {series.rating.count > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                <span className="text-orange-400">
                  {series.rating.average.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Creator */}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-800">
            <img 
              src={series.creatorId.avatar || '/default-avatar.png'} 
              alt={series.creatorId.username}
              className="w-4 h-4 rounded-full"
            />
            <span className="text-xs text-gray-400">
              {series.creatorId.username}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
