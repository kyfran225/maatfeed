import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { SEO } from "../../components/SEO";
import type { AudioTrack, Playlist } from "../../services/audioService";
import { TrackList } from "./TrackList";
import { YouTubeEmbed } from "../../components/media/YouTubeEmbed";
import { useAuth } from "../../hooks/useAuth";
import {
  useAudioPlayer,
  useAudioTracks,
  useAudioDiscovery,
  usePlaylists
} from "../../hooks/useAudio";
import { SkeletonLoader } from "../../components/motion/SkeletonLoader";
import { TouchFeedback } from "../../components/motion/TouchFeedback";
import {
  getAudioMarks,
  setAudioMark,
  type AudioMark,
  type AudioMarks
} from "../../services/audioMarkService";

const darkNightSpotlight = {
  artist: "Dark Night",
  handle: "@DarkNight1er",
  channelUrl: "https://www.youtube.com/@DarkNight1er",
  description: "Artiste engagé, spirituel et panafricain. Sélection intégrée pour écouter ses morceaux dans MAATFEED.",
  videoIds: [
    "dQw4w9WgXcQ",
    "3JZ_D3ELwOQ",
    "9bZkp7q19f0"
  ]
};

export function AudioPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "tracks";
  const [activeTab, setActiveTab] = useState<"tracks" | "playlists" | "discover">(initialTab as any);
  const [audioMarks, setAudioMarks] = useState<AudioMarks>({});
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  
  const { user } = useAuth();
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useAudioPlayer();
  const { data: tracks = [], isLoading: tracksLoading } = useAudioTracks();
  const { data: discovery, isLoading: discoveryLoading } = useAudioDiscovery();
  const { data: playlists = [], isLoading: playlistsLoading } = usePlaylists();

  // Load audio marks on mount
  useEffect(() => {
    const loadMarks = async () => {
      try {
        const marks = await getAudioMarks();
        setAudioMarks(marks);
      } catch (error) {
        console.error("Failed to load audio marks:", error);
      }
    };
    loadMarks();
  }, []);

  const handleMarkTrack = async (trackId: string, mark: AudioMark) => {
    try {
      await setAudioMark(trackId, mark);
      setAudioMarks(prev => ({
        ...prev,
        [trackId]: { trackId, mark, updatedAt: new Date().toISOString() }
      }));
    } catch (error) {
      console.error("Failed to mark track:", error);
    }
  };

  const handlePlayTrack = async (track: AudioTrack, trackQueue?: AudioTrack[]) => {
    try {
      await playTrack(track, trackQueue);
    } catch (error) {
      console.error("Failed to play track:", error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <>
      <SEO 
        title="Audio - MAATFEED"
        description="Découvrez et écoutez des contenus audio de qualité"
      />
      
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-40 bg-black/80 backdrop-blur-lg border-b border-gray-800"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-white">Audio</h1>
                {user && (
                  <span className="text-sm text-gray-400">
                    Bienvenue, {user.username}
                  </span>
                )}
              </div>
              
              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-gray-900 rounded-lg p-1">
                <TouchFeedback>
                  <button
                    onClick={() => setActiveTab("tracks")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "tracks"
                        ? "bg-amber-500 text-black"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                Pistes
                  </button>
                </TouchFeedback>
                <TouchFeedback>
                  <button
                    onClick={() => setActiveTab("playlists")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "playlists"
                        ? "bg-amber-500 text-black"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                Playlists
                  </button>
                </TouchFeedback>
                <TouchFeedback>
                  <button
                    onClick={() => setActiveTab("discover")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "discover"
                        ? "bg-amber-500 text-black"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                Découvrir
                  </button>
                </TouchFeedback>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {/* Tracks Tab */}
          {activeTab === "tracks" && (
            <motion.div variants={itemVariants}>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Toutes les pistes</h2>
                <p className="text-gray-400">
                  Explorez notre collection de contenus audio de qualité
                </p>
              </div>

              {tracksLoading ? (
                <SkeletonLoader />
              ) : tracks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">Aucune piste disponible pour le moment</p>
                </div>
              ) : (
                <TrackList
                  tracks={tracks}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onPlayTrack={handlePlayTrack}
                  onPauseTrack={pauseTrack}
                  onMarkTrack={handleMarkTrack}
                  audioMarks={audioMarks}
                />
              )}
            </motion.div>
          )}

          {/* Playlists Tab */}
          {activeTab === "playlists" && (
            <motion.div variants={itemVariants}>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Playlists</h2>
                <p className="text-gray-400">
                  Vos playlists personnalisées et recommandations
                </p>
              </div>

              {playlistsLoading ? (
                <SkeletonLoader />
              ) : playlists.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">Aucune playlist créée</p>
                  <TouchFeedback>
                    <button
                      onClick={() => setShowCreatePlaylist(true)}
                      className="px-6 py-3 bg-amber-500 text-black rounded-lg font-medium hover:bg-amber-400 transition-colors"
                    >
                      Créer une playlist
                    </button>
                  </TouchFeedback>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {playlists.map((playlist) => (
                    <motion.div
                      key={playlist.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-amber-500 transition-colors"
                    >
                      <Link to={`/playlist/${playlist.id}`}>
                        <div className="p-6">
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {playlist.name}
                          </h3>
                          <p className="text-gray-400 text-sm mb-4">
                            {playlist.description}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{playlist.tracks.length} pistes</span>
                            <span>{playlist.duration} min</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Discover Tab */}
          {activeTab === "discover" && (
            <motion.div variants={itemVariants}>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Découvrir</h2>
                <p className="text-gray-400">
                  Nouveaux contenus et recommandations personnalisées
                </p>
              </div>

              {discoveryLoading ? (
                <SkeletonLoader />
              ) : (
                <div className="space-y-8">
                  {/* Featured Artist */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Artiste en vedette</h3>
                    <motion.div
                      variants={itemVariants}
                      className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg p-6 border border-amber-500/30"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center">
                          <span className="text-black font-bold text-xl">DN</span>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white">{darkNightSpotlight.artist}</h4>
                          <p className="text-gray-400">{darkNightSpotlight.handle}</p>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-4">{darkNightSpotlight.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {darkNightSpotlight.videoIds.map((videoId, index) => (
                          <YouTubeEmbed
                            key={videoId}
                            videoId={videoId}
                            title={`${darkNightSpotlight.artist} - Vidéo ${index + 1}`}
                            className="w-full h-48"
                          />
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Trending Tracks */}
                  {discovery?.trending && discovery.trending.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4">Tendances</h3>
                      <TrackList
                        tracks={discovery.trending}
                        currentTrack={currentTrack}
                        isPlaying={isPlaying}
                        onPlayTrack={handlePlayTrack}
                        onPauseTrack={pauseTrack}
                        onMarkTrack={handleMarkTrack}
                        audioMarks={audioMarks}
                      />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  );
}
