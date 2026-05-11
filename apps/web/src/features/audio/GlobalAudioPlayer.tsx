import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioPlayer } from '../../hooks/useAudio';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Shuffle, 
  Heart, 
  MoreHorizontal,
  List,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface QueueItem {
  id: string;
  title: string;
  artist: string;
  duration: number;
  coverImageUrl?: string;
  url: string;
}

export function GlobalAudioPlayer() {
  const {
    currentTrack,
    queue,
    currentIndex,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    error,
    isCurrentTrackLiked,
    hasNext,
    hasPrevious,
    playTrack,
    pause,
    resume,
    togglePlayback,
    seekTo,
    playNext,
    playPrevious,
    likeCurrentTrack,
    getCurrentTrackSharePayload,
    copyCurrentTrackShareLink,
    copyCurrentTrackExcerpt,
    shareCurrentTrack
  } = useAudioPlayer();

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  // Format time helper
  const formatTime = useCallback((seconds: number) => {
    const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
    const minutes = Math.floor(safeSeconds / 60);
    const remainder = Math.floor(safeSeconds % 60);
    return `${minutes}:${remainder.toString().padStart(2, "0")}`;
  }, []);

  // Calculate progress
  const progressMax = duration > 0 ? duration : currentTrack?.duration || 0;
  const progressValue = Math.min(currentTime, progressMax || currentTime);
  const progressPercent = progressMax > 0 ? Math.min(100, (progressValue / progressMax) * 100) : 0;

  // Handle progress bar click
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = clickX / rect.width;
    const newTime = clickPercent * progressMax;
    
    seekTo(newTime);
  }, [progressMax, seekTo]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        togglePlayback();
      } else if (e.code === 'ArrowRight' && e.ctrlKey) {
        e.preventDefault();
        playNext();
      } else if (e.code === 'ArrowLeft' && e.ctrlKey) {
        e.preventDefault();
        playPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [togglePlayback, playNext, playPrevious]);

  if (!currentTrack) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className={`
          fixed bottom-0 left-0 right-0 z-50 
          bg-gradient-to-t from-black via-black/95 to-transparent
          border-t border-white/10
          ${isMinimized ? 'h-16' : 'h-24'}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="relative w-12 h-12 flex-shrink-0">
              {currentTrack.coverImageUrl ? (
                <img
                  src={currentTrack.coverImageUrl}
                  alt={currentTrack.title}
                  className="w-full h-full rounded-lg object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <span className="text-white text-lg">♪</span>
                </div>
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-medium truncate text-sm">
                {currentTrack.shortTitle || currentTrack.title}
              </h3>
              <p className="text-gray-400 text-xs truncate">
                {currentTrack.artist}
              </p>
            </div>
          </div>

          {/* Progress Bar - Full Width */}
          {!isMinimized && (
            <div 
              ref={progressRef}
              className="flex-1 mx-4 h-1 bg-white/20 rounded-full cursor-pointer relative group"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-200 relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {/* Like Button */}
            <button
              onClick={() => likeCurrentTrack()}
              className={`p-2 rounded-full transition-colors ${
                isCurrentTrackLiked 
                  ? 'text-red-500 hover:text-red-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
              aria-label="Aimer cette piste"
            >
              <Heart className={`w-4 h-4 ${isCurrentTrackLiked ? 'fill-current' : ''}`} />
            </button>

            {/* Previous */}
            <button
              onClick={() => playPrevious()}
              disabled={!hasPrevious}
              className="p-2 rounded-full text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Piste précédente"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={() => togglePlayback()}
              className="p-3 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              aria-label={isPlaying ? "Pause" : "Lecture"}
            >
              {isLoading ? (
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={() => playNext()}
              disabled={!hasNext}
              className="p-2 rounded-full text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Piste suivante"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Queue Toggle */}
            <button
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              className={`p-2 rounded-full transition-colors ${
                isQueueOpen ? 'text-orange-500' : 'text-gray-400 hover:text-white'
              }`}
              aria-label="File d'attente"
            >
              <List className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="relative">
              <button
                onClick={() => setShowVolume(!showVolume)}
                className="p-2 rounded-full text-gray-400 hover:text-white transition-colors"
                aria-label="Volume"
              >
                {volume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              
              <AnimatePresence>
                {showVolume && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg p-3 shadow-xl border border-white/10"
                  >
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-24 h-1 accent-orange-500"
                      style={{ writingMode: 'vertical-rl' }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Minimize/Maximize */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 rounded-full text-gray-400 hover:text-white transition-colors"
              aria-label={isMinimized ? "Agrandir" : "Réduire"}
            >
              {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Time Display - Full Width Only */}
        {!isMinimized && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 pb-1">
            <span className="text-xs text-gray-400">
              {formatTime(currentTime)}
            </span>
            <span className="text-xs text-gray-400">
              {formatTime(progressMax)}
            </span>
          </div>
        )}

        {/* Queue Panel */}
        <AnimatePresence>
          {isQueueOpen && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed bottom-24 right-4 w-80 max-h-96 bg-gray-900 rounded-lg shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-medium">File d'attente</h3>
                  <span className="text-gray-400 text-sm">
                    {queue.length} piste{queue.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {queue.map((track, index) => (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track, queue)}
                    className={`
                      flex items-center space-x-3 p-3 hover:bg-white/5 cursor-pointer transition-colors
                      ${index === currentIndex ? 'bg-white/10' : ''}
                    `}
                  >
                    <div className="w-10 h-10 flex-shrink-0">
                      {track.coverImageUrl ? (
                        <img
                          src={track.coverImageUrl}
                          alt={track.title}
                          className="w-full h-full rounded object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                          <span className="text-white text-xs">♪</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm truncate">
                        {track.shortTitle || track.title}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {track.artist}
                      </p>
                    </div>
                    
                    <div className="text-gray-400 text-xs">
                      {formatTime(track.duration)}
                    </div>
                    
                    {index === currentIndex && isPlaying && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        {error && (
          <div className="absolute top-0 left-0 right-0 bg-red-500/90 text-white text-center py-2 text-sm">
            {error}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
