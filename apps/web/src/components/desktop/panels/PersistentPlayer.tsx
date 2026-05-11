import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronUp,
  ChevronDown,
  List,
  Maximize2,
  Minimize2,
  Radio,
  Clock,
  Headphones
} from 'lucide-react';
import { cn } from '../../../lib/utils';

interface Track {
  id: string;
  title: string;
  creator: string;
  duration: number;
  currentTime: number;
  thumbnail: string;
  waveform: number[];
  isLiked?: boolean;
}

interface PersistentPlayerProps {
  expanded?: boolean;
  onToggleExpanded?: () => void;
}

const mockQueue: Track[] = [
  {
    id: '1',
    title: 'Les racines de la civilisation Kemet',
    creator: 'Dr. Awa Ndiaye',
    duration: 1455, // 24:15
    currentTime: 432,
    thumbnail: '/thumbnails/kemet-1.jpg',
    waveform: [0.3, 0.7, 0.4, 0.9, 0.6, 0.8, 0.5, 0.7, 0.3, 0.6, 0.8, 0.4, 0.9, 0.5, 0.7],
    isLiked: true
  },
  {
    id: '2',
    title: 'Méditation guidée : Retrouver ses ancêtres',
    creator: 'Sagesse Africaine',
    duration: 1125, // 18:45
    currentTime: 0,
    thumbnail: '/thumbnails/meditation.jpg',
    waveform: [0.5, 0.3, 0.8, 0.4, 0.7, 0.5, 0.9, 0.6, 0.4, 0.8, 0.3, 0.7, 0.5, 0.9, 0.4]
  },
  {
    id: '3',
    title: 'Histoire des royaumes du Mali',
    creator: 'Prof. Bakary',
    duration: 1920, // 32:00
    currentTime: 0,
    thumbnail: '/thumbnails/mali.jpg',
    waveform: [0.6, 0.8, 0.4, 0.9, 0.5, 0.7, 0.3, 0.8, 0.6, 0.4, 0.9, 0.7, 0.5, 0.8, 0.3]
  }
];

export const PersistentPlayer: React.FC<PersistentPlayerProps> = ({ 
  expanded = false, 
  onToggleExpanded 
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const currentTrack = mockQueue[currentTrackIndex];
  const progress = (currentTrack.currentTime / currentTrack.duration) * 100;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = clickX / rect.width;
    const newTime = newProgress * currentTrack.duration;
    // Update track time logic here
  };

  const handleNext = () => {
    if (currentTrackIndex < mockQueue.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else if (isRepeat) {
      setCurrentTrackIndex(0);
    }
  };

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    } else {
      setCurrentTrackIndex(mockQueue.length - 1);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center gap-4">
            {/* Mini Thumbnail */}
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-purple-500 rounded-lg flex items-center justify-center">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            
            {/* Mini Controls */}
            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrevious}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <SkipBack className="w-4 h-4 text-white" />
              </button>
              <button 
                onClick={togglePlayPause}
                className="p-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-white" />
                ) : (
                  <Play className="w-4 h-4 text-white" />
                )}
              </button>
              <button 
                onClick={handleNext}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <SkipForward className="w-4 h-4 text-white" />
              </button>
            </div>
            
            {/* Restore Button */}
            <button
              onClick={() => setIsMinimized(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronUp className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      {/* Main Player */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-t border-white/10",
          expanded ? "h-32" : "h-20"
        )}
      >
        <div className="h-full flex items-center px-6 gap-6">
          {/* Track Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Thumbnail */}
            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Headphones className="w-7 h-7 text-white" />
            </div>
            
            {/* Track Details */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-white/60 truncate">
                {currentTrack.creator}
              </p>
              
              {/* Progress Bar */}
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40">
                    {formatTime(currentTrack.currentTime)}
                  </span>
                  <div 
                    ref={progressBarRef}
                    className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer group"
                    onClick={handleProgressClick}
                  >
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-purple-500 rounded-full relative"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <span className="text-xs text-white/40">
                    {formatTime(currentTrack.duration)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Shuffle & Repeat */}
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isShuffle ? "text-orange-400 bg-orange-500/20" : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <Shuffle className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setIsRepeat(!isRepeat)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isRepeat ? "text-orange-400 bg-orange-500/20" : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <Repeat className="w-4 h-4" />
            </button>

            {/* Main Controls */}
            <button 
              onClick={handlePrevious}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button 
              onClick={togglePlayPause}
              className="p-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors shadow-lg shadow-orange-500/25"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-0.5" />
              )}
            </button>
            
            <button 
              onClick={handleNext}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <div className="w-20 h-1 bg-white/20 rounded-full">
                <div 
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                />
              </div>
            </div>

            {/* Queue */}
            <button
              onClick={() => setShowQueue(!showQueue)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                showQueue ? "text-orange-400 bg-orange-500/20" : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <List className="w-4 h-4" />
            </button>

            {/* Actions */}
            <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <Heart className={cn("w-4 h-4", currentTrack.isLiked && "fill-current text-orange-400")} />
            </button>
            
            <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {/* Minimize */}
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expanded Waveform */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 60, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/10 px-6 py-4"
            >
              <div className="h-full flex items-center justify-center">
                <div className="flex items-center gap-1 h-full">
                  {currentTrack.waveform.map((height, index) => (
                    <motion.div
                      key={index}
                      animate={{
                        height: isPlaying ? `${height * 100}%` : `${height * 40}%`
                      }}
                      className="w-1 bg-gradient-to-t from-orange-500 to-purple-500 rounded-full"
                      style={{ height: `${height * 40}%` }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Queue Panel */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-20 right-6 z-30 w-80 max-h-96 bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">File d'attente</h3>
              <p className="text-sm text-white/60">{mockQueue.length} titres</p>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {mockQueue.map((track, index) => (
                <div
                  key={track.id}
                  className={cn(
                    "p-4 hover:bg-white/5 cursor-pointer transition-colors",
                    index === currentTrackIndex && "bg-orange-500/10"
                  )}
                  onClick={() => setCurrentTrackIndex(index)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-purple-500 rounded flex items-center justify-center">
                      {index === currentTrackIndex && isPlaying ? (
                        <div className="flex items-center gap-0.5">
                          <div className="w-1 h-3 bg-white rounded-full animate-pulse" />
                          <div className="w-1 h-3 bg-white rounded-full animate-pulse delay-75" />
                          <div className="w-1 h-3 bg-white rounded-full animate-pulse delay-150" />
                        </div>
                      ) : (
                        <Headphones className="w-5 h-5 text-white" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white truncate">
                        {track.title}
                      </h4>
                      <p className="text-xs text-white/60 truncate">
                        {track.creator}
                      </p>
                    </div>
                    
                    <span className="text-xs text-white/40">
                      {formatTime(track.duration)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
