import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, CheckCircle, Circle, Star, TrendingUp } from 'lucide-react';

interface SeriesProgressProps {
  series: {
    _id: string;
    title: string;
    coverImage: string;
    creatorId: {
      _id: string;
      username: string;
      avatar?: string;
    };
    episodeCount: number;
    totalDuration: number;
    status: 'ongoing' | 'completed' | 'hiatus';
  };
  userProgress: {
    currentEpisode?: {
      episodeId: string;
      episodeNumber: number;
      seasonNumber: number;
      watchedAt: string;
    };
    completedEpisodes: Array<{
      episodeId: string;
      episodeNumber: number;
      seasonNumber: number;
      completedAt: string;
      watchDuration: number;
    }>;
    totalWatchTime: number;
    completionPercentage: number;
  };
  variant?: 'card' | 'compact' | 'detailed';
}

const SeriesProgress: React.FC<SeriesProgressProps> = ({ 
  series, 
  userProgress, 
  variant = 'card' 
}) => {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return '#10B981';
    if (percentage >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const getStatusText = (percentage: number) => {
    if (percentage === 100) return 'Terminé';
    if (percentage >= 80) return 'Presque terminé';
    if (percentage >= 50) return 'En bonne progression';
    if (percentage >= 25) return 'Commencé';
    return 'Début';
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
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white text-sm truncate mb-1">
            {series.title}
          </h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span className="text-xs text-gray-400">
                  {userProgress.completedEpisodes.length}/{series.episodeCount}
                </span>
              </div>
              <span 
                className="text-xs font-medium"
                style={{ color: getProgressColor(userProgress.completionPercentage) }}
              >
                {userProgress.completionPercentage.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">
                {formatDuration(Math.floor(userProgress.totalWatchTime / 60))}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <img 
            src={series.coverImage} 
            alt={series.title}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-white text-lg mb-1">
              {series.title}
            </h3>
            <Link 
              to={`/creator/${series.creatorId._id}`}
              className="text-sm text-gray-400 hover:text-orange-400 transition-colors"
            >
              par {series.creatorId.username}
            </Link>
          </div>
          <div className="text-right">
            <div 
              className="text-2xl font-bold mb-1"
              style={{ color: getProgressColor(userProgress.completionPercentage) }}
            >
              {userProgress.completionPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">
              {getStatusText(userProgress.completionPercentage)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Progression globale</span>
            <span className="text-sm text-gray-400">
              {userProgress.completedEpisodes.length} / {series.episodeCount} épisodes
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div 
              className="h-3 rounded-full transition-all duration-500"
              style={{ 
                width: `${userProgress.completionPercentage}%`,
                backgroundColor: getProgressColor(userProgress.completionPercentage)
              }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-orange-400 mb-1">
              <CheckCircle className="w-5 h-5" />
              <span className="text-lg font-semibold">
                {userProgress.completedEpisodes.length}
              </span>
            </div>
            <div className="text-sm text-gray-400">Épisodes terminés</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-orange-400 mb-1">
              <Clock className="w-5 h-5" />
              <span className="text-lg font-semibold">
                {formatDuration(Math.floor(userProgress.totalWatchTime / 60))}
              </span>
            </div>
            <div className="text-sm text-gray-400">Temps d'écoute total</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-orange-400 mb-1">
              <TrendingUp className="w-5 h-5" />
              <span className="text-lg font-semibold">
                {series.episodeCount - userProgress.completedEpisodes.length}
              </span>
            </div>
            <div className="text-sm text-gray-400">Épisodes restants</div>
          </div>
        </div>

        {/* Current Episode */}
        {userProgress.currentEpisode && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              <Play className="w-4 h-4 text-orange-400" />
              Épisode actuel
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-white mb-1">
                  S{userProgress.currentEpisode.seasonNumber}E{userProgress.currentEpisode.episodeNumber}
                </p>
                <p className="text-xs text-gray-400">
                  Dernière écoute: {formatDate(userProgress.currentEpisode.watchedAt)}
                </p>
              </div>
              <Link
                to={`/episode/${userProgress.currentEpisode.episodeId}`}
                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-medium text-white transition-colors"
              >
                Reprendre
              </Link>
            </div>
          </div>
        )}

        {/* Recent Episodes */}
        {userProgress.completedEpisodes.length > 0 && (
          <div>
            <h4 className="font-medium text-white mb-3">Épisodes récents</h4>
            <div className="space-y-2">
              {userProgress.completedEpisodes
                .slice(-5)
                .reverse()
                .map((episode, index) => (
                  <Link
                    key={episode.episodeId}
                    to={`/episode/${episode.episodeId}`}
                    className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">
                        S{episode.seasonNumber}E{episode.episodeNumber}
                      </p>
                      <p className="text-xs text-gray-400">
                        Terminé le {formatDate(episode.completedAt)} • {formatDuration(episode.watchDuration)}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}

        {/* Continue Button */}
        {userProgress.completionPercentage < 100 && (
          <div className="mt-6 pt-6 border-t border-gray-800">
            <Link
              to={`/series/${series._id}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-medium text-white transition-colors"
            >
              <Play className="w-5 h-5" />
              Continuer la série
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Default card variant
  return (
    <Link 
      to={`/series/${series._id}`}
      className="group bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-all duration-200 border border-gray-800 hover:border-orange-500/50"
    >
      {/* Cover with Progress Overlay */}
      <div className="relative h-40 overflow-hidden">
        <img 
          src={series.coverImage} 
          alt={series.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Progress Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
            <div 
              className="h-full transition-all duration-300"
              style={{ 
                width: `${userProgress.completionPercentage}%`,
                backgroundColor: getProgressColor(userProgress.completionPercentage)
              }}
            />
          </div>
          
          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-xs text-white font-medium">
                {userProgress.completedEpisodes.length}/{series.episodeCount}
              </span>
            </div>
          </div>

          {/* Percentage Badge */}
          <div className="absolute top-2 right-2">
            <div 
              className="px-2 py-1 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: getProgressColor(userProgress.completionPercentage) }}
            >
              {userProgress.completionPercentage.toFixed(0)}%
            </div>
          </div>

          {/* Current Episode Indicator */}
          {userProgress.currentEpisode && (
            <div className="absolute bottom-2 right-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-500 rounded-full">
                <Play className="w-3 h-3 text-white" />
                <span className="text-xs text-white font-medium">
                  S{userProgress.currentEpisode.seasonNumber}E{userProgress.currentEpisode.episodeNumber}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors">
          {series.title}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{series.creatorId.username}</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(Math.floor(userProgress.totalWatchTime / 60))}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium" 
              style={{ 
                backgroundColor: getProgressColor(userProgress.completionPercentage),
                color: 'white'
              }}
            >
              {getStatusText(userProgress.completionPercentage)}
            </span>
          </div>
        </div>

        {/* Progress Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Progression</span>
            <span className="text-xs font-medium" 
              style={{ color: getProgressColor(userProgress.completionPercentage) }}
            >
              {userProgress.completionPercentage.toFixed(1)}%
            </span>
          </div>
          
          {userProgress.completionPercentage === 100 && (
            <div className="flex items-center gap-1 text-green-400">
              <Star className="w-3 h-3 fill-green-400" />
              <span className="text-xs font-medium">Série terminée</span>
            </div>
          )}
          
          {userProgress.currentEpisode && (
            <div className="flex items-center gap-1 text-orange-400">
              <Play className="w-3 h-3" />
              <span className="text-xs">
                En cours: S{userProgress.currentEpisode.seasonNumber}E{userProgress.currentEpisode.episodeNumber}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default SeriesProgress;
