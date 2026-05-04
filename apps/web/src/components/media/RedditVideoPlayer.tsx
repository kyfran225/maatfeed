import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Settings, Share2, Maximize, Minimize, ExternalLink } from 'lucide-react';
import { TouchFeedback } from '../ui/TouchFeedback';

interface RedditVideoPlayerProps {
  src: string;
  thumbnail?: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
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

const getYouTubeEmbedUrl = (url: string, autoplay = false, muted = true): string | null => {
  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/)?.[1];
  if (!videoId) return null;

  const params = new URLSearchParams({
    rel: '0',
    playsinline: '1',
    modestbranding: '1',
    enablejsapi: '1',
    ...(autoplay && { autoplay: '1' }),
    ...(muted && { mute: '1' }),
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

const getTikTokEmbedUrl = (url: string): string | null => {
  const tiktokId = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/)?.[1]
    || url.match(/vm\.tiktok\.com\/(\w+)/)?.[1]
    || url.match(/tiktok\.com\/t\/(\w+)/)?.[1];

  if (!tiktokId) {
    return null;
  }

  return `https://www.tiktok.com/embed/v2/${tiktokId}?lang=fr-FR&playsinline=1`;
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
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
}: RedditVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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
  const youtubeEmbedUrl = platform === 'youtube' ? getYouTubeEmbedUrl(src, isPlaying, isMuted) : null;
  const tiktokEmbedUrl = platform === 'tiktok' ? getTikTokEmbedUrl(src) : null;
  const isDirectVideo = platform === 'direct';
  const isAudioFile = platform === 'audio';
  const isYoutube = platform === 'youtube';
  const isTiktok = platform === 'tiktok';
  const isTiktokEmbeddable = Boolean(tiktokEmbedUrl);

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

  const handlePlay = useCallback(async () => {
    if (isYoutube) {
      setIsPlaying(true);
      onPlay?.();
      return;
    }

    if (isTiktok) {
      if (isTiktokEmbeddable) {
        setIsPlaying(true);
        onPlay?.();
        return;
      }

      if (src) {
        window.open(src, '_blank');
      }
      return;
    }

    if (isDirectVideo) {
      if (!videoRef.current) return;
      try {
        videoRef.current.muted = isMuted;
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
  }, [isDirectVideo, isMuted, isTiktok, isTiktokEmbeddable, isAudioFile, isYoutube, onPlay, src, volume]);

  const togglePlay = useCallback(async () => {
    if (isYoutube) {
      setIsPlaying((prev) => !prev);
      return;
    }

    if (isTiktok) {
      if (isTiktokEmbeddable) {
        setIsPlaying((prev) => {
          const next = !prev;
          if (next) {
            onPlay?.();
          } else {
            onPause?.();
          }
          return next;
        });
      } else {
        await handlePlay();
      }
      return;
    }

    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        await videoRef.current.pause();
        setIsPlaying(false);
        onPause?.();
      } else {
        await videoRef.current.play();
        setIsPlaying(true);
        onPlay?.();
      }
    } catch (err) {
      console.error('Toggle play failed', err);
    }
  }, [isPlaying, onPause, onPlay, isYoutube, isTiktok, isTiktokEmbeddable, handlePlay]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) {
      setIsMuted((prev) => !prev);
      return;
    }
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  }, [isMuted]);

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
    setDuration(videoRef.current?.duration || 0);
    setIsLoading(false);
    if (autoPlay && isMuted && !isPlaying && isDirectVideo) {
      void handlePlay();
    }
  }, [autoPlay, handlePlay, isDirectVideo, isMuted, isPlaying]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    onEnded?.();
  }, [onEnded]);

  useEffect(() => {
    if (!autoPlay || !isDirectVideo || !containerRef.current || !videoRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]) return;
      if (entries[0].isIntersecting) {
        setShouldAutoPlay(true);
        if (!isPlaying) {
          void handlePlay();
        }
      } else if (isPlaying) {
        videoRef.current?.pause();
        setIsPlaying(false);
      }
    }, { threshold: 0.6 });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [autoPlay, handlePlay, isDirectVideo, isPlaying]);

  useEffect(() => {
    return () => {
      window.clearTimeout((resetControlsTimeout as any).timeoutId);
      window.clearTimeout((handleMouseLeave as any).timeoutId);
    };
  }, [handleMouseLeave, resetControlsTimeout]);

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
      {isYoutube && youtubeEmbedUrl ? (
        <div className="w-full h-full relative bg-black">
          {isPlaying ? (
            <iframe
              src={youtubeEmbedUrl}
              title={title || 'YouTube video'}
              className="w-full h-full absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full relative">
              {thumbnail ? (
                <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-black/80 flex items-center justify-center" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <TouchFeedback>
                  <button
                    onClick={handlePlay}
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
            preload="metadata"
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
      ) : isTiktok ? (
        <div className="w-full h-full bg-black relative">
          {isPlaying && tiktokEmbedUrl ? (
            <iframe
              src={tiktokEmbedUrl}
              title={title || 'TikTok video'}
              className="w-full h-full absolute inset-0"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              loading="lazy"
              allowFullScreen
            />
          ) : thumbnail ? (
            <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-black/80 flex items-center justify-center" />
          )}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <TouchFeedback>
                <button
                  onClick={handlePlay}
                  className="w-20 h-20 rounded-full bg-white/20 border border-white/30 flex items-center justify-center hover:bg-white/30 transition"
                >
                  <ExternalLink className="w-6 h-6 text-white" />
                </button>
              </TouchFeedback>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-full bg-black relative">
          {thumbnail ? (
            <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-black/80 flex items-center justify-center" />
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <TouchFeedback>
              <button
                onClick={handlePlay}
                className="w-20 h-20 rounded-full bg-white/20 border border-white/30 flex items-center justify-center hover:bg-white/30 transition"
              >
                {isTiktok ? (
                  <ExternalLink className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-8 h-8 text-white" />
                )}
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
