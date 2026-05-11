import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Heart, 
  MoreVertical,
  Clock,
  TrendingUp,
  Headphones,
  Shuffle,
  Repeat,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { useAudioStore, Playlist } from '../../stores/audioStore';
import { useContinueListening, ContinueListeningItem } from '../../hooks/useContinueListening';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { PlaylistCard } from './PlaylistCard';
import { ContinueListeningCard } from './ContinueListeningCard';
import { RecommendedSection } from './RecommendedSection';
import { CreatePlaylistDialog } from './CreatePlaylistDialog';

export function ListenPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'favorites'>('all');
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  
  const { 
    currentTrack, 
    isPlaying, 
    queue, 
    playlists, 
    togglePlayPause, 
    playNext, 
    playPrevious 
  } = useAudioStore();
  
  const { continueListeningItems, isLoading: continueLoading } = useContinueListening();
  const { preferences, updatePreferences } = useUserPreferences();

  // Filter playlists based on search and filter
  const filteredPlaylists = playlists?.filter((playlist: Playlist) => {
    const matchesSearch = playlist.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'recent' && playlist.isRecent) ||
      (selectedFilter === 'favorites' && playlist.isFavorite);
    return matchesSearch && matchesFilter;
  }) || [];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-black/80 backdrop-blur-lg border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                Écouter
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Votre musique, vos playlists, vos découvertes
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher playlists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-900 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 w-64"
                />
              </div>

              {/* Filter */}
              <div className="flex bg-gray-900 border border-white/20 rounded-lg p-1">
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    selectedFilter === 'all' 
                      ? 'bg-orange-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Tout
                </button>
                <button
                  onClick={() => setSelectedFilter('recent')}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    selectedFilter === 'recent' 
                      ? 'bg-orange-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Récent
                </button>
                <button
                  onClick={() => setSelectedFilter('favorites')}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    selectedFilter === 'favorites' 
                      ? 'bg-orange-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Favoris
                </button>
              </div>

              {/* Create Playlist */}
              <button
                onClick={() => setShowCreatePlaylist(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Playlist</span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        
        {/* Continue Listening Section */}
        {!continueLoading && continueListeningItems.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-white">
                  Continue d'écouter
                </h2>
              </div>
              <button className="text-orange-500 hover:text-orange-400 text-sm transition-colors">
                Voir tout
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {continueListeningItems.slice(0, 6).map((item: ContinueListeningItem, index: number) => (
                <ContinueListeningCard
                  key={item.id}
                  item={item}
                  index={index}
                  onPlay={() => {
                    // Handle play
                  }}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-gray-900 rounded-lg border border-white/10 p-4">
            <div className="flex items-center space-x-3">
              <Headphones className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {preferences?.totalListeningTime || 0}
                </p>
                <p className="text-sm text-gray-400">Minutes écoutées</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg border border-white/10 p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {playlists?.length || 0}
                </p>
                <p className="text-sm text-gray-400">Playlists</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg border border-white/10 p-4">
            <div className="flex items-center space-x-3">
              <Heart className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {preferences?.favoriteTracksCount || 0}
                </p>
                <p className="text-sm text-gray-400">Titres favoris</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg border border-white/10 p-4">
            <div className="flex items-center space-x-3">
              <Shuffle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {queue?.length || 0}
                </p>
                <p className="text-sm text-gray-400">Dans la file</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Your Playlists */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              Vos Playlists
            </h2>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Shuffle className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Repeat className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {filteredPlaylists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPlaylists.map((playlist: Playlist, index: number) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  index={index}
                  onPlay={() => {
                    // Handle playlist play
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                <Headphones className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Aucune playlist trouvée
              </h3>
              <p className="text-gray-400 mb-4">
                Créez votre première playlist pour organiser votre musique
              </p>
              <button
                onClick={() => setShowCreatePlaylist(true)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Créer une playlist
              </button>
            </div>
          )}
        </motion.section>

        {/* Recommended Section */}
        <RecommendedSection />
      </div>

      {/* Create Playlist Modal */}
      <AnimatePresence>
        {showCreatePlaylist && (
          <CreatePlaylistDialog
            onClose={() => setShowCreatePlaylist(false)}
            onSuccess={() => {
              setShowCreatePlaylist(false);
              // Refresh playlists
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default ListenPage;
