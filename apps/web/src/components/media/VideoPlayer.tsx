import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Headphones, ExternalLink } from 'lucide-react';
import { TouchFeedback } from '../ui/TouchFeedback';

interface VideoPlayerProps {
  videoUrl?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  title: string;
  bucket: string;
}

// Get bucket gradient for placeholder
const getBucketGradient = (bucket: string) => {
  const gradients: Record<string, string> = {
    viral: 'from-red-500/30 via-orange-500/20 to-red-600/30',
    educational: 'from-blue-500/30 via-cyan-500/20 to-blue-600/30',
    deep: 'from-purple-500/30 via-pink-500/20 to-purple-600/30'
  };
  return gradients[bucket] || gradients.deep;
};

// Detect platform from URL
const detectPlatform = (url: string): 'youtube' | 'tiktok' | 'direct' | 'unknown' => {
  if (!url) return 'unknown';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.match(/\.(mp4|webm|ogg|m3u8)(\?.*)?$/i)) return 'direct';
  return 'unknown';
};

// Convert YouTube URL to embed URL with mobile-friendly parameters
const getYouTubeEmbedUrl = (url: string, autoplay = true): string | null => {
  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/)?.[1];
  if (videoId) {
    // Preload version: no autoplay, just load the player
    // enablejsapi=1 allows JavaScript API control via postMessage
    // mute=1 helps with autoplay policies on some browsers
    const params = new URLSearchParams({
      rel: '0',
      playsinline: '1',
      enablejsapi: '1',
      modestbranding: '1',
      ...(autoplay && { autoplay: '1', mute: '0' }),
    });
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }
  return null;
};

// Check if device is mobile
const isMobile = () => {
  if (typeof window === 'undefined' || !navigator) return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Convert TikTok URL to embed URL
const getTikTokEmbedUrl = (url: string): string | null => {
  // TikTok embed requires their embed script, so we'll open in new tab
  return null;
};

export function VideoPlayer({ videoUrl, audioUrl, thumbnailUrl, title, bucket }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const preloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const platform = videoUrl ? detectPlatform(videoUrl) : 'unknown';
  const embedUrl = videoUrl && platform === 'youtube' ? getYouTubeEmbedUrl(videoUrl, false) : null;

  // Preload iframe after a short delay when component mounts
  useEffect(() => {
    if (platform === 'youtube' && embedUrl && !isPreloaded) {
      // Delay preload slightly to not block initial render
      preloadTimeoutRef.current = setTimeout(() => {
        setIsPreloaded(true);
      }, 500);
    }

    return () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }
    };
  }, [platform, embedUrl, isPreloaded]);

  const hasVideo = !!videoUrl;
  const hasAudio = !!audioUrl;

  // Get initials for placeholder
  const initials = title
    .split(' ')
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase())
    .join('')
    .slice(0, 2);

  const handlePlay = useCallback(() => {
    console.log('Playing:', { videoUrl, audioUrl, platform, isMobile: isMobile(), isPreloaded });

    if (platform === 'youtube') {
      // On mobile, open YouTube app directly for better controls
      // On desktop, use embedded player
      if (isMobile() && videoUrl) {
        window.location.href = videoUrl;
        return;
      }

      if (embedUrl) {
        setIsPlaying(true);
        // If preloaded, try to trigger play via postMessage
        if (isPreloaded && iframeRef.current?.contentWindow) {
          try {
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'playVideo' }),
              '*'
            );
          } catch (e) {
            console.warn('Could not trigger play via postMessage:', e);
          }
        }
        return;
      }
    }

    if (platform === 'direct' || hasAudio) {
      setIsPlaying(true);
      return;
    }

    // For TikTok or other platforms, open in new tab
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    }
  }, [videoUrl, audioUrl, platform, embedUrl, isPreloaded]);

  // YouTube player with preloading
  if (platform === 'youtube' && embedUrl) {
    return (
      <div className="w-full h-full bg-black relative">
        {/* Preloaded iframe - always rendered but hidden until playing */}
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={title}
          className={`w-full h-full absolute inset-0 transition-opacity duration-300 ${
            isPlaying ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
          }`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="eager"
        />

        {/* Thumbnail overlay - shown until user clicks play */}
        {!isPlaying && (
          <div className={`w-full h-full absolute inset-0 z-20 ${getBucketGradient(bucket)}`}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            </div>

            {/* Thumbnail or placeholder */}
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 flex flex-col items-center justify-center gap-2">
                  <Play className="w-12 h-12 text-white/60 ml-1" />
                </div>
              </div>
            )}

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <TouchFeedback>
                <button
                  onClick={handlePlay}
                  className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors group"
                >
                  <Play className="w-8 h-8 text-white ml-1" />
                </button>
              </TouchFeedback>

              {/* Platform indicator */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <span className="px-3 py-1 bg-black/50 rounded-full text-xs text-white/80">
                  YouTube
                </span>
              </div>
            </div>

            {/* Loading indicator while preloading */}
            {!isPreloaded && (
              <div className="absolute bottom-4 right-4">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white/60 rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Direct video player with mobile optimizations
  if (isPlaying && platform === 'direct' && videoUrl) {
    return (
      <div className="w-full h-full bg-black relative">
        <video
          src={videoUrl}
          controls
          autoPlay
          playsInline
          webkit-playsinline="true"
          x5-playsinline="true"
          x5-video-player-type="h5"
          x5-video-player-fullscreen="false"
          preload="auto"
          className="w-full h-full object-contain"
          onEnded={() => setIsPlaying(false)}
          onError={(e) => {
            console.error('Video error:', e);
            setError('Erreur de lecture');
            setIsPlaying(false);
          }}
        />
        {/* Mobile hint overlay */}
        {isMobile() && (
          <div className="absolute bottom-16 left-0 right-0 text-center pointer-events-none">
            <span className="text-white/60 text-xs bg-black/50 px-3 py-1 rounded-full">
              Touchez les contrôles pour pause/lecture
            </span>
          </div>
        )}
      </div>
    );
  }

  // Audio player
  if (isPlaying && hasAudio && audioUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/50 to-black">
        <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center mb-4">
          <Headphones className="w-16 h-16 text-white/60" />
        </div>
        <audio
          src={audioUrl}
          controls
          autoPlay
          className="w-3/4 max-w-md"
          onEnded={() => setIsPlaying(false)}
        />
      </div>
    );
  }

  // Thumbnail / Placeholder view
  return (
    <div className={`w-full h-full relative bg-gradient-to-br ${getBucketGradient(bucket)}`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
      </div>

      {/* Thumbnail or placeholder */}
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 flex flex-col items-center justify-center gap-2">
            {hasAudio ? (
              <Headphones className="w-12 h-12 text-white/60" />
            ) : (
              <Play className="w-12 h-12 text-white/60 ml-1" />
            )}
            <span className="text-xl font-bold text-white/40">{initials}</span>
          </div>
        </div>
      )}

      {/* Play/External Link Button Overlay */}
      {(hasVideo || hasAudio) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <TouchFeedback>
            <button
              onClick={handlePlay}
              className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors group"
            >
              {platform === 'tiktok' || platform === 'unknown' ? (
                <ExternalLink className="w-8 h-8 text-white" />
              ) : hasAudio ? (
                <Headphones className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </button>
          </TouchFeedback>
          
          {/* Platform indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <span className="px-3 py-1 bg-black/50 rounded-full text-xs text-white/80 capitalize">
              {platform === 'youtube' && 'YouTube'}
              {platform === 'tiktok' && 'TikTok'}
              {platform === 'direct' && 'Vidéo'}
              {platform === 'unknown' && hasAudio && 'Audio'}
            </span>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
