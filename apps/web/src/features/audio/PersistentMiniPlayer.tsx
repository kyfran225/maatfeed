import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioPlayer } from '../../hooks/useAudio';
import { useLocation } from 'react-router-dom';
import { CompactWaveform } from './WaveformVisualization';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  X,
  Maximize2,
  Heart
} from 'lucide-react';

interface PersistentMiniPlayerProps {
  className?: string;
}

export function PersistentMiniPlayer({ className = '' }: PersistentMiniPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    error,
    isCurrentTrackLiked,
    hasNext,
    hasPrevious,
    togglePlayback,
    playNext,
    playPrevious,
    likeCurrentTrack,
  } = useAudioPlayer();

  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showVolume, setShowVolume] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Auto-hide on certain pages
  const shouldHide = location.pathname === '/audio' || location.pathname.startsWith('/admin');
  
  // Format time helper
  const formatTime = (seconds: number) => {
    const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
    const minutes = Math.floor(safeSeconds / 60);
    const remainder = Math.floor(safeSeconds % 60);
    return `${minutes}:${remainder.toString().padStart(2, "0")}`;
  };

  // Calculate progress
  const progressMax = duration > 0 ? duration : currentTrack?.duration || 0;
  const progressValue = Math.min(currentTime, progressMax || currentTime);
  const progressPercent = progressMax > 0 ? Math.min(100, (progressValue / progressMax) * 100) : 0;

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.ctrlKey) {
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

  if (!currentTrack || shouldHide) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ 
          opacity: 1, 
          y: isMinimized ? 80 : 0,
          height: isExpanded ? 'auto' : isMinimized ? '60px' : '80px'
        }}
        exit={{ opacity: 0, y: 100 }}
        className={`
          fixed bottom-0 left-0 right-0 z-50 
          bg-gradient-to-t from-black via-black/95 to-transparent
          border-t border-white/10
          backdrop-blur-xl
          ${className}
        `}
      >
        {/* Minimized State - Just a bar */}
        {isMinimized && (
          <div className="h-15 flex items-center justify-center px-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-orange-500 flex items-center justify-center">
                {currentTrack.coverImageUrl ? (
                  <img
                    src={currentTrack.coverImageUrl}
                    alt={currentTrack.title}
                    className="w-full h-full rounded object-cover"
                  />
                ) : (
                  <span className="text-white text-xs">♪</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs truncate font-medium">
                  {currentTrack.shortTitle || currentTrack.title}
                </p>
              </div>

              <button
                onClick={() => setIsMinimized(false)}
                className="p-1 rounded-full text-white/70 hover:text-white transition-colors"
                aria-label="Agrandir le lecteur"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Normal State */}
        {!isMinimized && (
          <div className="h-20 flex items-center justify-between px-4">
            {/* Left Section - Track Info + Controls */}
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              {/* Album Art */}
              <div className="relative w-12 h-12 flex-shrink-0">
                {currentTrack.coverImageUrl ? (
                  <img
                    src={currentTrack.coverImageUrl}
                    alt={currentTrack.title}
                    className="w-full h-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <span className="text-white text-sm">♪</span>
                  </div>
                )}
                
                {/* Playing Indicator */}
                {isPlaying && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                )}
              </div>
              
              {/* Track Info */}
              <div className="min-w-0 flex-1">
                <h4 className="text-white text-sm font-medium truncate">
                  {currentTrack.shortTitle || currentTrack.title}
                </h4>
                <p className="text-gray-400 text-xs truncate">
                  {currentTrack.artist}
                </p>
              </div>

              {/* Basic Controls */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => likeCurrentTrack()}
                  className={`p-1.5 rounded-full transition-colors ${
                    isCurrentTrackLiked 
                      ? 'text-red-500' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  aria-label="Aimer cette piste"
                >
                  <Heart className={`w-3 h-3 ${isCurrentTrackLiked ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={() => playPrevious()}
                  disabled={!hasPrevious}
                  className="p-1.5 rounded-full text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Piste précédente"
                >
                  <SkipBack className="w-3 h-3" />
                </button>

                <button
                  onClick={() => togglePlayback()}
                  className="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                  aria-label={isPlaying ? "Pause" : "Lecture"}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() => playNext()}
                  disabled={!hasNext}
                  className="p-1.5 rounded-full text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Piste suivante"
                >
                  <SkipForward className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Center Section - Waveform (when expanded) */}
            {isExpanded && (
              <div className="flex-1 max-w-md mx-4">
                <CompactWaveform height={40} />
              </div>
            )}

            {/* Right Section - Time + Volume + Actions */}
            <div className="flex items-center space-x-3">
              {/* Time Display */}
              <div className="text-xs text-gray-400 min-w-[80px] text-right">
                {formatTime(currentTime)} / {formatTime(progressMax)}
              </div>

              {/* Volume Control */}
              <div className="relative">
                <button
                  onClick={() => setShowVolume(!showVolume)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-white transition-colors"
                  aria-label="Volume"
                >
                  {volume > 0 ? <Volume2 className="w-3 h-3" /> : <X className="w-3 h-3" />}
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
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Expand/Collapse */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white transition-colors"
                aria-label={isExpanded ? "Réduire" : "Agrandir"}
              >
                {isExpanded ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293 3.293a1 1 0 001.414-1.414l-4-4a1 1 0 00-1.414 0l-4 4a1 1 0 000 1.414z" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 000 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" />
                  </svg>
                )}
              </button>

              {/* Minimize */}
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white transition-colors"
                aria-label="Réduire"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Expanded State - Full Waveform */}
        {isExpanded && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 80 }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10 bg-black/50"
          >
            <div className="h-20 flex items-center justify-center px-4">
              <CompactWaveform height={60} />
            </div>
          </motion.div>
        )}

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
