import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { useVideoPlayer } from "../../contexts/VideoPlayerContext";

interface TikTokEmbedProps {
  videoUrl: string;
  className?: string;
  title?: string;
  options?: {
    controls?: boolean;
    volume_control?: boolean;
    fullscreen_button?: boolean;
    progress_bar?: boolean;
    play_button?: boolean;
    timestamp?: boolean;
    autoplay?: boolean;
  };
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onProgressUpdate?: (currentTime: number, duration: number) => void;
  onError?: (message: string) => void;
}

interface PlayerMessage {
  'x-tiktok-player': boolean;
  value: any;
  type: string;
}

function scheduleTikTokUnmute(postPlayerMessage: (type: string, value?: any) => boolean) {
  postPlayerMessage('play');
  postPlayerMessage('unMute');
  window.setTimeout(() => postPlayerMessage('unMute'), 100);
  window.setTimeout(() => postPlayerMessage('play'), 200);
  window.setTimeout(() => postPlayerMessage('unMute'), 350);
  window.setTimeout(() => postPlayerMessage('unMute'), 800);
  window.setTimeout(() => postPlayerMessage('unMute'), 1600);
}

export interface TikTokEmbedRef {
  play: () => boolean;
  pause: () => boolean;
  mute: () => boolean;
  unMute: () => boolean;
  seekTo: (time: number) => boolean;
  getCurrentTime: () => number;
  getDuration: () => number;
}

export const TIKTOK_DEFAULT_OPTIONS = {
  controls: true,
  volume_control: true,
  fullscreen_button: true,
  progress_bar: true,
  play_button: true,
  timestamp: true,
  autoplay: false
};

export const TikTokEmbed = forwardRef<TikTokEmbedRef, TikTokEmbedProps>(function TikTokEmbed(
  { videoUrl, className = "", title = "TikTok video", options = {}, onReady, onPlay, onPause, onProgressUpdate, onError },
  ref
) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressRef = useRef({ currentTime: 0, duration: 0 });
  const callbacksRef = useRef({ onReady, onPlay, onPause, onProgressUpdate, onError });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const { mediaSoundEnabled, activateMediaSound } = useVideoPlayer();
  const [tiktokSoundConfirmed, setTiktokSoundConfirmed] = useState(false);

  useEffect(() => {
    callbacksRef.current = { onReady, onPlay, onPause, onProgressUpdate, onError };
  }, [onReady, onPlay, onPause, onProgressUpdate, onError]);

  // Extract video ID from TikTok URL
  const getVideoId = (url: string): string | null => {
    const match = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/);
    return match ? match[1] : null;
  };

  const finalOptions = { ...TIKTOK_DEFAULT_OPTIONS, ...options };

  // Build URL parameters
  const buildUrlParams = () => {
    const params = new URLSearchParams();
    Object.entries(finalOptions).forEach(([key, value]) => {
      params.append(key, value ? '1' : '0');
    });
    return params.toString();
  };

  const videoId = getVideoId(videoUrl);

  const postPlayerMessage = useCallback((type: string, value?: any) => {
    if (!iframeRef.current?.contentWindow) {
      return false;
    }

    const message: PlayerMessage = {
      'x-tiktok-player': true,
      value,
      type
    };
    iframeRef.current.contentWindow.postMessage(message, '*');
    return true;
  }, []);

  const sendPlayerMessage = useCallback((type: string, value?: any) => {
    if (!playerReady) {
      return false;
    }

    return postPlayerMessage(type, value);
  }, [playerReady, postPlayerMessage]);

  const applyStoredSoundPreference = useCallback(() => {
    if (!mediaSoundEnabled) {
      return;
    }

    scheduleTikTokUnmute(postPlayerMessage);
  }, [mediaSoundEnabled, postPlayerMessage]);

  const activateSoundPreference = useCallback(() => {
    activateMediaSound();
    scheduleTikTokUnmute(postPlayerMessage);
  }, [activateMediaSound, postPlayerMessage]);

  useEffect(() => {
    if (mediaSoundEnabled) {
      applyStoredSoundPreference();
    } else {
      setTiktokSoundConfirmed(false);
    }
  }, [applyStoredSoundPreference, mediaSoundEnabled]);

  useImperativeHandle(ref, () => ({
    play: () => sendPlayerMessage('play'),
    pause: () => sendPlayerMessage('pause'),
    mute: () => sendPlayerMessage('mute'),
    unMute: () => {
      activateSoundPreference();
      return true;
    },
    seekTo: (time: number) => sendPlayerMessage('seekTo', time),
    getCurrentTime: () => progressRef.current.currentTime,
    getDuration: () => progressRef.current.duration,
  }), [activateSoundPreference, sendPlayerMessage]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setPlayerReady(false);
    setTiktokSoundConfirmed(false);
    progressRef.current = { currentTime: 0, duration: 0 };

    if (!videoId) {
      const message = 'URL TikTok invalide';
      setError(message);
      setLoading(false);
      callbacksRef.current.onError?.(message);
      return;
    }

    // iOS Safari touch events fix: Add dummy touch listeners to parent window
    // This is required for touch events to work within iframes on iOS
    const enableTouchEvents = () => {
      // Add dummy touch listener to window - required for iOS iframe touch events
      window.addEventListener('touchstart', () => {}, { passive: false });
      window.addEventListener('touchmove', () => {}, { passive: false });
      window.addEventListener('touchend', () => {}, { passive: false });
    };

    enableTouchEvents();

    // Handle messages from the TikTok player
    const handleMessage = (event: MessageEvent) => {
      const message = event.data as PlayerMessage;

      if (message && message['x-tiktok-player']) {
        switch (message.type) {
          case 'onPlayerReady':
            setPlayerReady(true);
            setLoading(false);
            callbacksRef.current.onReady?.();
            applyStoredSoundPreference();
            break;
          case 'onPlayerError':
            setError('Erreur de chargement de la vidéo TikTok');
            setLoading(false);
            callbacksRef.current.onError?.('Erreur de chargement de la vidéo TikTok');
            break;
          case 'onStateChange':
            if (message.value === 1) {
              callbacksRef.current.onPlay?.();
              applyStoredSoundPreference();
            } else if (message.value === 0 || message.value === 2) {
              callbacksRef.current.onPause?.();
            }
            break;
          case 'onCurrentTime':
            if (message.value) {
              const { currentTime = 0, duration = 0 } = message.value;
              progressRef.current = { currentTime, duration };
              callbacksRef.current.onProgressUpdate?.(currentTime, duration);
            }
            break;
          case 'onMute':
            setTiktokSoundConfirmed(message.value === false);
            break;
          case 'onVolumeChange':
            setTiktokSoundConfirmed(typeof message.value === 'number' && message.value > 0);
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Fallback: if no message received after 5 seconds, try to load anyway
    const timeout = setTimeout(() => {
      setPlayerReady(true);
      setLoading(false);
      callbacksRef.current.onReady?.();
      applyStoredSoundPreference();
    }, 5000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeout);
    };
  }, [videoId, applyStoredSoundPreference]);

  const rememberSoundActivationFromPoint = (clientX: number, clientY: number) => {
    // Get click position relative to iframe
    const rect = iframeRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;
    const relativeX = clickX / rect.width;
    const relativeY = clickY / rect.height;
    
    // Sound button is typically in bottom-right area
    if (relativeX > 0.75 && relativeY > 0.75) {
      activateSoundPreference();
    }
  };

  // Handle sound toggle independently
  const handleSoundToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    rememberSoundActivationFromPoint(e.clientX, e.clientY);
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 bg-red-50 rounded-lg ${className}`}>
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!videoId) {
    return (
      <div className={`flex items-center justify-center p-8 bg-red-50 rounded-lg ${className}`}>
        <div className="text-red-600">URL TikTok invalide</div>
      </div>
    );
  }

  return (
    <>
      {/* iOS Safari iframe touch events fix CSS */}
      <style>{`
        .tiktok-embed-container iframe {
          -webkit-touch-callout: default;
          -webkit-user-select: text;
          user-select: text;
          pointer-events: auto;
          touch-action: manipulation;
        }
        
        /* iOS Safari specific fixes */
        @supports (-webkit-touch-callout: none) {
          .tiktok-embed-container iframe {
            -webkit-touch-callout: default;
            -webkit-user-select: auto;
            user-select: auto;
          }
        }
      `}</style>
      
      <div className={`tiktok-embed-container flex justify-center w-full ${className}`}>
        <div
          className="relative w-full"
          onPointerDownCapture={(event) => {
            rememberSoundActivationFromPoint(event.clientX, event.clientY);
          }}
          style={{
            maxWidth: '605px',
            minWidth: '325px',
            margin: '0 auto'
          }}
        >
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-gray-600">Chargement de la vidéo TikTok...</div>
            </div>
          )}
        <iframe
          ref={iframeRef}
          src={`https://www.tiktok.com/player/v1/${videoId}?${buildUrlParams()}`}
          title={title}
          style={{
            width: '100%',
            height: '400px',
            border: 'none',
            borderRadius: '8px',
            margin: '0 auto',
            pointerEvents: 'auto',
            touchAction: 'manipulation',
            WebkitTouchCallout: 'default',
            WebkitUserSelect: 'auto'
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; touch"
          allowFullScreen
          onClick={handleSoundToggle}
          onLoad={() => {
            setPlayerReady(true);
            setLoading(false);
            callbacksRef.current.onReady?.();
            applyStoredSoundPreference();
          }}
          onError={() => {
            const message = 'Erreur de chargement de la vidéo TikTok';
            setError(message);
            setLoading(false);
            callbacksRef.current.onError?.(message);
          }}
        />
        {(!mediaSoundEnabled || !tiktokSoundConfirmed) && (
          <button
            type="button"
            aria-label="Activer le son TikTok"
            title="Activer le son"
            className="absolute right-3 top-20 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur transition hover:bg-black/75"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              activateSoundPreference();
            }}
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              activateSoundPreference();
            }}
          >
            <Volume2 className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        </div>
      </div>
    </>
  );
});
