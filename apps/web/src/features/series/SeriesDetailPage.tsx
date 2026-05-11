import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Play, 
  Users, 
  Clock, 
  Star, 
  Heart, 
  Share2, 
  MoreVertical,
  Check,
  Plus,
  Bell,
  BellOff
} from 'lucide-react';
import { SeriesCard } from './SeriesCard';

interface Series {
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
  tags: string[];
  language: string;
  isPublic: boolean;
  isVerified: boolean;
  episodeCount: number;
  totalDuration: number;
  followerCount: number;
  playCount: number;
  rating: {
    average: number;
    count: number;
  };
  status: 'ongoing' | 'completed' | 'hiatus';
  releaseSchedule: string;
  createdAt: string;
  updatedAt: string;
}

interface Episode {
  _id: string;
  title: string;
  description: string;
  episodeNumber: number;
  seasonNumber: number;
  audioUrl: string;
  videoUrl?: string;
  coverImage: string;
  duration: number;
  isPublished: boolean;
  publishedAt: string;
  playCount: number;
  likeCount: number;
  commentCount: number;
  rating: {
    average: number;
    count: number;
  };
}

interface UserFollow {
  _id: string;
  userId: string;
  seriesId: string;
  followedAt: string;
  notifications: {
    newEpisodes: boolean;
    seriesUpdates: boolean;
  };
  progress: {
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
  rating?: number;
  notes?: string;
  isFavorite: boolean;
}

const SeriesDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [series, setSeries] = useState<Series | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [userFollow, setUserFollow] = useState<UserFollow | null>(null);
  const [loading, setLoading] = useState(true);
  const [episodesLoading, setEpisodesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'episodes' | 'about' | 'stats'>('episodes');
  const [showFollowOptions, setShowFollowOptions] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSeries();
      fetchEpisodes();
      fetchUserFollow();
    }
  }, [id]);

  const fetchSeries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/series/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setSeries(data.data);
      }
    } catch (error) {
      console.error('Error fetching series:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEpisodes = async () => {
    try {
      setEpisodesLoading(true);
      const response = await fetch(`/api/series/${id}/episodes?page=1&limit=50`);
      const data = await response.json();
      
      if (data.success) {
        setEpisodes(data.data.episodes);
      }
    } catch (error) {
      console.error('Error fetching episodes:', error);
    } finally {
      setEpisodesLoading(false);
    }
  };

  const fetchUserFollow = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`/api/series/${id}/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserFollow(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching user follow:', error);
    }
  };

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        // Redirect to login
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`/api/series/${id}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notifications: {
            newEpisodes: true,
            seriesUpdates: false
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setUserFollow(data.data);
        setShowFollowOptions(false);
      }
    } catch (error) {
      console.error('Error following series:', error);
    }
  };

  const handleUnfollow = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`/api/series/${id}/follow`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setUserFollow(null);
        setShowFollowOptions(false);
      }
    } catch (error) {
      console.error('Error unfollowing series:', error);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const isEpisodeCompleted = (episodeId: string) => {
    return userFollow?.progress.completedEpisodes.some(
      ep => ep.episodeId === episodeId
    );
  };

  const isCurrentEpisode = (episodeId: string) => {
    return userFollow?.progress.currentEpisode?.episodeId === episodeId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Série non trouvée</h1>
          <Link 
            to="/series"
            className="text-orange-400 hover:text-orange-300 transition-colors"
          >
            Retour aux séries
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Image */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img 
            src={series.coverImage} 
            alt={series.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          
          {/* Back Button */}
          <div className="absolute top-4 left-4">
            <Link 
              to="/series"
              className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
            >
              ← Retour
            </Link>
          </div>

          {/* Status and Category */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span 
              className="px-3 py-1 rounded-full text-white font-medium text-sm"
              style={{ backgroundColor: getCategoryColor(series.category) }}
            >
              {series.category}
            </span>
            <span 
              className="px-3 py-1 rounded-full text-white font-medium text-sm"
              style={{ backgroundColor: getStatusBadge(series.status).color }}
            >
              {getStatusBadge(series.status).text}
            </span>
            {series.isVerified && (
              <div className="px-3 py-1 bg-orange-500 rounded-full text-white font-medium text-sm flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" />
                Vérifié
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Series Info */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Title and Actions */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-4">{series.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{series.followerCount} abonnés</span>
                </div>
                <div className="flex items-center gap-1">
                  <Play className="w-4 h-4" />
                  <span>{series.episodeCount} épisodes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(series.totalDuration)}</span>
                </div>
                {series.rating.count > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                    <span className="text-orange-400">
                      {series.rating.average.toFixed(1)} ({series.rating.count})
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {userFollow ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowFollowOptions(!showFollowOptions)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <Check className="w-4 h-4 text-green-400" />
                      Abonné
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {showFollowOptions && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-10">
                        <button
                          onClick={handleUnfollow}
                          className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-red-400"
                        >
                          Se désabonner
                        </button>
                        <div className="px-4 py-2 border-t border-gray-700">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={userFollow.notifications.newEpisodes}
                              onChange={() => {}}
                              className="rounded"
                            />
                            Notifications nouveaux épisodes
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleFollow}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    S'abonner
                  </button>
                )}
                
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <Heart className="w-4 h-4" />
                </button>
                
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-800 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('episodes')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'episodes'
                      ? 'border-orange-500 text-orange-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Épisodes ({series.episodeCount})
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'about'
                      ? 'border-orange-500 text-orange-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  À propos
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'stats'
                      ? 'border-orange-500 text-orange-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Statistiques
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'episodes' && (
              <div className="space-y-4">
                {episodesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  </div>
                ) : (
                  <>
                    {userFollow && userFollow.progress.completionPercentage > 0 && (
                      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Progression</span>
                          <span className="text-sm text-orange-400">
                            {userFollow.progress.completionPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${userFollow.progress.completionPercentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {userFollow.progress.completedEpisodes.length} / {series.episodeCount} épisodes terminés
                        </p>
                      </div>
                    )}

                    {episodes.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-400">Aucun épisode disponible</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {episodes.map((episode) => (
                          <Link
                            key={episode._id}
                            to={`/episode/${episode._id}`}
                            className="block bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors border border-gray-800 hover:border-orange-500/50"
                          >
                            <div className="flex gap-4">
                              <img 
                                src={episode.coverImage} 
                                alt={episode.title}
                                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                              />
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-semibold text-white mb-1 line-clamp-1">
                                      S{episode.seasonNumber}E{episode.episodeNumber}: {episode.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 line-clamp-2">
                                      {episode.description}
                                    </p>
                                  </div>
                                  
                                  <div className="flex flex-col items-end gap-1 ml-4">
                                    {isEpisodeCompleted(episode._id) && (
                                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                      </div>
                                    )}
                                    {isCurrentEpisode(episode._id) && (
                                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                        <Play className="w-3 h-3 text-white" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>{formatDuration(episode.duration)}</span>
                                  <span>{formatDate(episode.publishedAt)}</span>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                                    <span className="text-orange-400">
                                      {episode.rating.average.toFixed(1)}
                                    </span>
                                  </div>
                                  <span>{episode.playCount} lectures</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-3">Description</h2>
                  <p className="text-gray-300 leading-relaxed">{series.description}</p>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-white mb-3">Informations</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Catégorie</span>
                        <span>{series.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Langue</span>
                        <span>{series.language.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Statut</span>
                        <span>{getStatusBadge(series.status).text}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Créé le</span>
                        <span>{formatDate(series.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Mis à jour</span>
                        <span>{formatDate(series.updatedAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Fréquence</span>
                        <span>{series.releaseSchedule}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {series.tags.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-3">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {series.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-400">
                      {series.followerCount}
                    </div>
                    <div className="text-sm text-gray-400">Abonnés</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-400">
                      {series.playCount}
                    </div>
                    <div className="text-sm text-gray-400">Lectures totales</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-400">
                      {series.episodeCount}
                    </div>
                    <div className="text-sm text-gray-400">Épisodes</div>
                  </div>
                </div>
                
                {userFollow && (
                  <div className="bg-gray-900 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Votre progression</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Épisodes terminés</span>
                        <span>{userFollow.progress.completedEpisodes.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Temps d'écoute</span>
                        <span>{formatDuration(Math.floor(userFollow.progress.totalWatchTime / 60))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Progression</span>
                        <span className="text-orange-400">
                          {userFollow.progress.completionPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Creator Info */}
            <div className="bg-gray-900 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-white mb-3">Créateur</h3>
              <div className="flex items-center gap-3">
                <img 
                  src={series.creatorId.avatar || '/default-avatar.png'} 
                  alt={series.creatorId.username}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <Link 
                    to={`/creator/${series.creatorId._id}`}
                    className="font-medium text-white hover:text-orange-400 transition-colors"
                  >
                    {series.creatorId.username}
                  </Link>
                  {series.isVerified && (
                    <div className="flex items-center gap-1 text-sm text-orange-400">
                      <Star className="w-3 h-3 fill-orange-400" />
                      Vérifié
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Similar Series */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-3">Séries similaires</h3>
              <div className="space-y-3">
                {/* Placeholder for similar series */}
                <p className="text-gray-400 text-sm">
                  Chargement des séries similaires...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesDetailPage;
