import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Settings, Share2, Maximize, Minimize } from 'lucide-react';
import { TouchFeedback } from '../ui/TouchFeedback';
import { TikTokEmbed, TikTokEmbedRef } from '../feed/TikTokEmbed';
import { extractYouTubeVideoId, YouTubeEmbed } from './YouTubeEmbed';
import { useVideoPlayer } from '../../contexts/VideoPlayerContext';

interface RedditVideoPlayerProps {
  src: string;
  thumbnail?: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  onVideoOrientation?: (orientation: 'portrait' | 'landscape' | 'square') => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

type PlatformType = 'youtube' | 'tiktok' | 'direct' | 'audio' | 'unknown';

const detectPlatform = (url: string): PlatformType => {
  if (!url) return 'unknown';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.match(/\.(mp4|webm|ogg|m3u8)(\?.*)?$/i)) return 'direct';
  if (url.match(/\.(mp3|wav|aac|ogg|m4a)(\?.*)?$/i)) return 'audio';
  return 'unknown';
};

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export function RedditVideoPlayer({
  src,
  thumbnail,
  title,
  className = '',
  autoPlay = false,
  muted = false,
  onVideoOrientation,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
}: RedditVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const tiktokPlayerRef = useRef<TikTokEmbedRef>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  const platform = detectPlatform(src);
  const youtubeVideoId = platform === 'youtube' ? extractYouTubeVideoId(src) : null;
  const isDirectVideo = platform === 'direct';
  const isAudioFile = platform === 'audio';
  const isYoutube = platform === 'youtube';
  const isTiktok = platform === 'tiktok';
  const { mediaSoundEnabled, activateMediaSound, deactivateMediaSound } = useVideoPlayer();

  useEffect(() => {
    if (mediaSoundEnabled) {
      setIsMuted(false);
      if (videoRef.current) {
        videoRef.current.muted = false;
      }
      return;
    }

    if (muted) {
      setIsMuted(true);
      if (videoRef.current) {
        videoRef.current.muted = true;
      }
    }
  }, [mediaSoundEnabled, muted, src]);

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (isPlaying) {
      window.clearTimeout((resetControlsTimeout as any).timeoutId);
      (resetControlsTimeout as any).timeoutId = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  const handleMouseMove = useCallback(() => resetControlsTimeout(), [resetControlsTimeout]);
  const handleMouseLeave = useCallback(() => {
    if (isPlaying) {
      window.clearTimeout((handleMouseLeave as any).timeoutId);
      (handleMouseLeave as any).timeoutId = window.setTimeout(() => {
        setShowControls(false);
      }, 1000);
    }
  }, [isPlaying]);

  const handlePlay = useCallback(async (userInitiated = false) => {
    if (userInitiated) {
      activateMediaSound();
    }

    if (isYoutube) {
      setIsPlaying(true);
      onPlay?.();
      return;
    }

    if (isTiktok) {
      setIsPlaying(true);
      onPlay?.();
      return;
    }

    if (isDirectVideo) {
      if (!videoRef.current) return;
      try {
        videoRef.current.muted = userInitiated || mediaSoundEnabled ? false : isMuted;
        videoRef.current.volume = volume;
        await videoRef.current.play();
        setIsPlaying(true);
        onPlay?.();
      } catch (err) {
        console.error('Direct video play failed', err);
        setError('Impossible de lire la vidéo');
      }
      return;
    }

    if (isAudioFile && videoRef.current) {
      try {
        videoRef.current.muted = userInitiated || mediaSoundEnabled ? false : isMuted;
        await videoRef.current.play();
        setIsPlaying(true);
        onPlay?.();
      } catch (err) {
        console.error('Audio play failed', err);
        setError('Impossible de lire le son');
      }
      return;
    }

    if (!src) {
      return;
    }

    window.open(src, '_blank');
  }, [activateMediaSound, isAudioFile, isDirectVideo, isMuted, isTiktok, isYoutube, mediaSoundEnabled, onPlay, volume]);

  const togglePlay = useCallback(async () => {
    if (isYoutube) {
      activateMediaSound();
      setIsPlaying((prev) => !prev);
      return;
    }

    if (isTiktok) {
      activateMediaSound();
      setIsPlaying((prev) => {
        const next = !prev;
        if (next) {
          onPlay?.();
        } else {
          onPause?.();
        }
        return next;
      });
      return;
    }

    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        await videoRef.current.pause();
        setIsPlaying(false);
        onPause?.();
      } else {
        activateMediaSound();
        videoRef.current.muted = false;
        setIsMuted(false);
        await videoRef.current.play();
        setIsPlaying(true);
        onPlay?.();
      }
    } catch (err) {
      console.error('Toggle play failed', err);
    }
  }, [activateMediaSound, isPlaying, onPause, onPlay, isYoutube, isTiktok]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (newVolume === 0) {
      deactivateMediaSound();
    } else {
      activateMediaSound();
    }
  }, [activateMediaSound, deactivateMediaSound]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) {
      setIsMuted((prev) => {
        if (prev) {
          activateMediaSound();
        } else {
          deactivateMediaSound();
        }
        return !prev;
      });
      return;
    }
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      deactivateMediaSound();
    } else {
      activateMediaSound();
    }
  }, [activateMediaSound, deactivateMediaSound, isMuted]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!isFullscreen) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen toggle failed', err);
    }
  }, [isFullscreen]);

  const handleProgressClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    setCurrentTime(current);
    setDuration(total);
    onTimeUpdate?.(current, total);
  }, [onTimeUpdate]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    setDuration(video?.duration || 0);
    setIsLoading(false);

    if (video && video.videoWidth > 0 && video.videoHeight > 0) {
      if (video.videoHeight > video.videoWidth) {
        onVideoOrientation?.('portrait');
      } else if (video.videoWidth > video.videoHeight) {
        onVideoOrientation?.('landscape');
      } else {
        onVideoOrientation?.('square');
      }
    }

    if (autoPlay && isMuted && !isPlaying && isDirectVideo) {
      void handlePlay();
    }
  }, [autoPlay, handlePlay, isDirectVideo, isMuted, isPlaying, onVideoOrientation]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    onEnded?.();
  }, [onEnded]);

  const pauseMedia = useCallback(() => {
    if (isDirectVideo || isAudioFile) {
      videoRef.current?.pause();
    }

    if (isTiktok) {
      tiktokPlayerRef.current?.pause();
    }

    setShouldAutoPlay(false);
    setIsPlaying(false);
    onPause?.();
  }, [isAudioFile, isDirectVideo, isTiktok, onPause]);

  useEffect(() => {
    if (autoPlay) return;
    pauseMedia();
  }, [autoPlay, pauseMedia]);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]) return;
      if (!entries[0].isIntersecting) {
        pauseMedia();
      }
    }, { threshold: 0.6 });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [pauseMedia]);

  useEffect(() => {
    return () => {
      window.clearTimeout((resetControlsTimeout as any).timeoutId);
      window.clearTimeout((handleMouseLeave as any).timeoutId);
    };
  }, [handleMouseLeave, resetControlsTimeout]);

  if (isTiktok) {
    return (
      <div
        ref={containerRef}
        className={`relative flex items-center justify-center bg-black rounded-lg overflow-hidden ${className}`}
        tabIndex={0}
      >
        <TikTokEmbed
          ref={tiktokPlayerRef}
          videoUrl={src}
          title={title || 'TikTok video'}
          className="w-full"
          options={{ autoplay: false }}
          onReady={() => setIsLoading(false)}
          onPlay={() => {
            setIsPlaying(true);
            onPlay?.();
          }}
          onPause={() => {
            setIsPlaying(false);
            onPause?.();
          }}
          onError={(message) => setError(message)}
        />
      </div>
    );
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const showOverlay = !isPlaying || (!isDirectVideo && !isYoutube && !isAudioFile);

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
    >
      {isYoutube && youtubeVideoId ? (
        <div className="w-full h-full relative bg-black">
          {isPlaying ? (
            <YouTubeEmbed
              videoUrl={src}
              title={title || 'YouTube video'}
              layout="fill"
              options={{
                autoplay: true,
                muted: !mediaSoundEnabled,
                controls: true,
                enableJsApi: true,
                fullscreen: true
              }}
              className="w-full h-full absolute inset-0"
            />
          ) : (
            <div className="w-full h-full relative">
              {thumbnail ? (
                <img src={thumbnail} alt={title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
              ) : (
                <div className="w-full h-full bg-black/80 flex items-center justify-center" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <TouchFeedback>
                  <button
                    onClick={() => void handlePlay(true)}
                    className="w-20 h-20 rounded-full bg-white/20 border border-white/30 flex items-center justify-center hover:bg-white/30 transition"
                  >
                    <Play className="w-8 h-8 text-white" />
                  </button>
                </TouchFeedback>
              </div>
            </div>
          )}
        </div>
      ) : isDirectVideo || isAudioFile ? (
        <div className="w-full h-full relative bg-black">
          <video
            ref={videoRef}
            src={src}
            poster={thumbnail}
            className="w-full h-full object-contain"
            muted={isMuted}
            preload={autoPlay ? "auto" : "metadata"}
            playsInline
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onClick={togglePlay}
            controls={false}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-full bg-black relative">
          {thumbnail ? (
            <img src={thumbnail} alt={title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
          ) : (
            <div className="w-full h-full bg-black/80 flex items-center justify-center" />
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <TouchFeedback>
              <button
                onClick={() => void handlePlay(true)}
                className="w-20 h-20 rounded-full bg-white/20 border border-white/30 flex items-center justify-center hover:bg-white/30 transition"
              >
                <Play className="w-8 h-8 text-white" />
              </button>
            </TouchFeedback>
          </div>
        </div>
      )}

      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {showOverlay && !isYoutube && (
          <button
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-opacity"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        )}

          <div className="absolute bottom-0 left-0 right-0 p-4">
          <div ref={progressRef} className="w-full h-1 bg-white/20 rounded-full cursor-pointer mb-4 relative" onClick={handleProgressClick}>
            <div className="h-full bg-white rounded-full" style={{ width: `${progressPercentage}%` }} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={togglePlay} className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
                {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
              </button>

              <div className="relative">
                <button onClick={toggleMute} className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                </button>
                {showVolumeSlider && (
                  <div
                    className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-32 h-2 bg-black/50 rounded-full cursor-pointer"
                    onMouseLeave={() => setShowVolumeSlider(false)}
                    onClick={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect();
                      const clickX = event.clientX - rect.left;
                      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
                      handleVolumeChange(percentage);
                    }}
                  >
                    <div className="h-full bg-white rounded-full" style={{ width: `${volume * 100}%` }} />
                  </div>
                )}
              </div>

              <span className="text-white text-sm font-mono ml-2">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <button onClick={() => setShowQualityMenu((prev) => !prev)} className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
                  <Settings className="w-5 h-5 text-white" />
                </button>
                {showQualityMenu && (
                  <div className="absolute bottom-12 right-0 bg-black/90 rounded-lg p-2 min-w-32">
                    <div className="text-white text-sm py-1 px-2">Qualité</div>
                    <button className="w-full text-left text-white hover:bg-white/10 py-1 px-2 rounded text-sm">Auto (recommandé)</button>
                    <button className="w-full text-left text-white hover:bg-white/10 py-1 px-2 rounded text-sm">1080p</button>
                    <button className="w-full text-left text-white hover:bg-white/10 py-1 px-2 rounded text-sm">720p</button>
                    <button className="w-full text-left text-white hover:bg-white/10 py-1 px-2 rounded text-sm">480p</button>
                  </div>
                )}
              </div>

              <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
                <Share2 className="w-5 h-5 text-white" />
              </button>

              <button onClick={toggleFullscreen} className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
                {isFullscreen ? <Minimize className="w-5 h-5 text-white" /> : <Maximize className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm">{error}</div>
        </div>
      )}
    </div>
  );
}
