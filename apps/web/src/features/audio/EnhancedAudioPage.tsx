import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GlobalAudioPlayer, 
  WaveformVisualization,
  CompactWaveform 
} from './index';
import { useAudioTracks, usePlaylists, useCreatePlaylist } from '../../hooks/useAudio';
import { 
  Search, 
  Plus, 
  Shuffle, 
  Repeat, 
  ListMusic, 
  Clock,
  TrendingUp
} from 'lucide-react';

export function EnhancedAudioPage() {
  const { data: tracks, isLoading: tracksLoading } = useAudioTracks(50);
  const { data: playlists, isLoading: playlistsLoading } = usePlaylists();
  const createPlaylistMutation = useCreatePlaylist();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedView, setSelectedView] = useState<'player' | 'waveform' | 'queue'>('player');
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  // Filter tracks based on search
  const filteredTracks = tracks?.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Handle playlist creation
  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylistMutation.mutate({
        name: newPlaylistName.trim(),
        description: 'Playlist créée depuis la page audio',
        isPublic: false
      });
      setNewPlaylistName('');
      setShowCreatePlaylist(false);
    }
  };

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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              Audio Player
            </h1>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher des pistes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-900 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 w-64"
                />
              </div>

              {/* View Toggle */}
              <div className="flex bg-gray-900 border border-white/20 rounded-lg p-1">
                <button
                  onClick={() => setSelectedView('player')}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    selectedView === 'player' 
                      ? 'bg-orange-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Lecteur
                </button>
                <button
                  onClick={() => setSelectedView('waveform')}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    selectedView === 'waveform' 
                      ? 'bg-orange-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Waveform
                </button>
                <button
                  onClick={() => setSelectedView('queue')}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    selectedView === 'queue' 
                      ? 'bg-orange-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  File d'attente
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
      <div className="max-w-7xl mx-auto px-4 py-6">
          {selectedView === 'player' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Global Audio Player */}
            <div className="bg-gray-900 rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4 text-white">
                Lecteur Audio Global
              </h2>
              <GlobalAudioPlayer />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900 rounded-lg border border-white/10 p-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {tracks?.length || 0}
                    </p>
                    <p className="text-sm text-gray-400">Pistes disponibles</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg border border-white/10 p-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-orange-500" />
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
                  <ListMusic className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {filteredTracks.length}
                    </p>
                    <p className="text-sm text-gray-400">Résultats</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {selectedView === 'waveform' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gray-900 rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4 text-white">
                Waveform Visualization
              </h2>
              <WaveformVisualization height={120} />
            </div>

            <div className="bg-gray-900 rounded-2xl border border-white/10 p-6">
              <h3 className="text-md font-semibold mb-3 text-white">
                Waveform Compacte
              </h3>
              <CompactWaveform height={60} />
            </div>
          </motion.div>
        )}

        {selectedView === 'queue' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gray-900 rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  File d'attente
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsShuffle(!isShuffle)}
                    className={`p-2 rounded-lg transition-colors ${
                      isShuffle 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                    aria-label="Aléatoire"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsRepeat(!isRepeat)}
                    className={`p-2 rounded-lg transition-colors ${
                      isRepeat 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                    aria-label="Répéter"
                  >
                    <Repeat className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Queue Items */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTracks.map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="w-12 h-12 flex-shrink-0">
                      {track.coverImageUrl ? (
                        <img
                          src={track.coverImageUrl}
                          alt={track.title}
                          className="w-full h-full rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                          <span className="text-white text-sm">♪</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium">
                        {track.shortTitle || track.title}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {track.artist}
                      </p>
                    </div>
                    
                    <div className="text-gray-400 text-sm">
                      {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Create Playlist Modal */}
      {showCreatePlaylist && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setShowCreatePlaylist(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-2xl border border-white/20 p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">
              Créer une Playlist
            </h3>
            
            <input
              type="text"
              placeholder="Nom de la playlist..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 mb-4"
              autoFocus
            />
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreatePlaylist(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim() || createPlaylistMutation.isPending}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createPlaylistMutation.isPending ? 'Création...' : 'Créer'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
