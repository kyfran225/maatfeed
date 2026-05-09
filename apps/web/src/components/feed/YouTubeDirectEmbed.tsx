import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import YouTubeAPIManager from "../../utils/youtubeAPIManager";
import { buildYouTubeEmbedUrl, extractYouTubeVideoId } from "../media/YouTubeEmbed";
import { useVideoPlayer } from "../../contexts/VideoPlayerContext";

interface YouTubeDirectEmbedProps {
  item: any;
  isActive: boolean;
  isPaused: boolean;
  setPaused: (nextPaused: boolean) => void;
  onReady?: () => void;
  onProgressUpdate?: (currentTime: number, duration: number) => void;
  preloadNext?: string[]; // IDs des vidéos suivantes à précharger
}

export interface YouTubePlayerRef {
  seekTo: (time: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

// Cache des thumbnails déjà préchargés pour éviter les requêtes répétées
const preloadedThumbnails = new Set<string>();

// Précharger les thumbnails des vidéos (silencieusement, sans logs d'erreur)
const preloadThumbnails = (videoIds: string[]) => {
  videoIds.forEach(id => {
    // Éviter de précharger la même thumbnail plusieurs fois
    if (preloadedThumbnails.has(id)) return;
    preloadedThumbnails.add(id);

    const img = new Image();
    // Silencer les erreurs de chargement d'image
    img.onerror = () => {
      // Fallback to hqdefault if maxresdefault fails - mais silencieusement
      const fallbackImg = new Image();
      fallbackImg.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    };
    img.onload = () => {
      // Thumbnail chargée avec succès
    };
    img.src = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
  });
};

export const YouTubeDirectEmbed = forwardRef<YouTubePlayerRef, YouTubeDirectEmbedProps>(
  function YouTubeDirectEmbed({ item, isActive, isPaused, setPaused, onReady, onProgressUpdate, preloadNext = [] }, ref) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  const [isAPIReady, setIsAPIReady] = useState(false);
  const { mediaSoundEnabled, activateMediaSound } = useVideoPlayer();
  const [userHasInteracted, setUserHasInteracted] = useState(() => (
    YouTubeAPIManager.getInstance().hasAudioUnlocked() || mediaSoundEnabled
  ));
  const [thumbnailError, setThumbnailError] = useState(false);
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Extract YouTube video ID
  const videoId = extractYouTubeVideoId(item.mediaUrl);

  useEffect(() => {
    if (mediaSoundEnabled) {
      YouTubeAPIManager.getInstance().markAudioUnlocked();
      setUserHasInteracted(true);
      try {
        playerRef.current?.unMute?.();
        playerRef.current?.setVolume?.(50);
      } catch {
        // Ignore player API timing errors.
      }
    }
  }, [mediaSoundEnabled]);

  // Précharger les thumbnails des vidéos suivantes (une seule fois)
  const hasPreloadedNext = useRef(false);
  useEffect(() => {
    if (hasPreloadedNext.current) return;
    if (preloadNext.length > 0) {
      const ids = preloadNext.map(url => extractYouTubeVideoId(url)).filter(Boolean) as string[];
      if (ids.length > 0) {
        hasPreloadedNext.current = true;
        preloadThumbnails(ids);
      }
    }
  }, [preloadNext]);

  // Précharger la thumbnail de la vidéo actuelle (une seule fois par vidéo)
  const hasPreloadedCurrent = useRef(false);
  useEffect(() => {
    if (videoId && !isLoaded && !hasPreloadedCurrent.current) {
      hasPreloadedCurrent.current = true;
      const img = new Image();
      img.onerror = () => setThumbnailError(true);
      img.src = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    }
  }, [videoId, isLoaded]);

  // Expose player control methods via ref
  useImperativeHandle(ref, () => ({
    seekTo: (time: number) => {
      if (playerRef.current && playerRef.current.seekTo) {
        playerRef.current.seekTo(time, true);
      }
    },
    getCurrentTime: () => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        return playerRef.current.getCurrentTime() || 0;
      }
      return 0;
    },
    getDuration: () => {
      if (playerRef.current && playerRef.current.getDuration) {
        return playerRef.current.getDuration() || 0;
      }
      return 0;
    },
  }), []);

  // Progress tracking
  useEffect(() => {
    if (!playerRef.current || !isLoaded) return;

    if (isActive && !isPaused) {
      // Update progress every 500ms
      progressIntervalRef.current = setInterval(() => {
        try {
          if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.getDuration) {
            const currentTime = playerRef.current.getCurrentTime() || 0;
            const duration = playerRef.current.getDuration() || 0;
            onProgressUpdate?.(currentTime, duration);
          }
        } catch (e) {
          // Ignore errors during progress tracking
        }
      }, 500);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isActive, isPaused, isLoaded, onProgressUpdate]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT && !document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onload = () => {
        window.YT?.ready(() => {
          setIsAPIReady(true);
        });
      };
      document.head.appendChild(script);
    } else if (window.YT) {
      window.YT.ready(() => {
        setIsAPIReady(true);
      });
    }
  }, []);

  // Initialize YouTube player
  useEffect(() => {
    if (videoId && isAPIReady && !player && iframeRef.current && window.YT) {
      const playerId = `youtube-player-${videoId}`;
      iframeRef.current.id = playerId;
      
      console.log('Initializing YouTube player with videoId:', videoId);
      
      const ytPlayer = new window.YT.Player(playerId, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          playsinline: 1,
          loop: 1,
          playlist: videoId,
          controls: 0,
          rel: 0,
          fs: 0,
          cc_load_policy: 0,
          iv_load_policy: 3,
          origin: window.location.origin,
          enablejsapi: 1,
          start: 0, // Commencer au début pour éviter la recherche
          wmode: 'transparent', // Meilleure performance de rendu
          vq: 'hd720', // Qualité par défaut raisonnable pour un chargement rapide
          // Désactiver les fonctionnalités non essentielles
          disablekb: 1, // Désactiver les contrôles clavier
          hl: 'fr', // Langue française pour les captions si présentes
        },
        events: {
          onReady: (event: any) => {
            console.log('YouTube player ready for video:', videoId);
            playerRef.current = event.target;
            setPlayer(event.target);
            setIsLoaded(true);
            onReady?.();

            if (isActive && !isPaused) {
              console.log('Auto-playing YouTube video');
              if (mediaSoundEnabled) {
                event.target.unMute();
                event.target.setVolume(50);
              } else {
                event.target.mute();
              }
              event.target.playVideo();
            }
          },
          onStateChange: (event: any) => {
            // Optimisé: moins de logs en production
            if (process.env.NODE_ENV === 'development') {
              console.log('YouTube state:', event.data);
            }

            if (event.data === window.YT?.PlayerState.ENDED) {
              if (playerRef.current) {
                playerRef.current.playVideo();
              }
            }
          },
          onError: (event: any) => {
            console.error('YouTube error:', event);
            setError(`YouTube error: ${event.data}`);
          }
        }
      });
    }
  }, [videoId, isAPIReady, player, isActive, isPaused, mediaSoundEnabled, onReady]);

  // Handle play/pause with proper state management
  useEffect(() => {
    if (player && isLoaded) {
      try {
        if (isActive && !isPaused) {
          const audioUnlocked = YouTubeAPIManager.getInstance().hasAudioUnlocked() || mediaSoundEnabled;

          if (!audioUnlocked) {
            player.pauseVideo();
            return;
          }

          player.playVideo();
          
          // If user has interacted before, try to unmute after a short delay
          if (userHasInteracted || audioUnlocked) {
            setTimeout(() => {
              try {
                player.unMute();
                player.setVolume(50);
              } catch (e) {
                console.log('Could not unmute:', e);
              }
            }, 100);
          }
        } else {
          player.pauseVideo();
        }
      } catch (error) {
        console.log('Player control error:', error);
      }
    }
  }, [isActive, isPaused, player, isLoaded, mediaSoundEnabled, userHasInteracted]);

  // Handle click for play/pause and enable sound
  const handlePlayPause = useCallback(() => {
    YouTubeAPIManager.getInstance().markAudioUnlocked();
    activateMediaSound();
    setUserHasInteracted(true);
    
    if (player) {
      try {
        if (isPaused) {
          // User clicked to play - ensure video plays and enable sound
          player.unMute();
          player.setVolume(50);
          player.playVideo();
          
          // Double-check playback state after a short delay
          setTimeout(() => {
            try {
              const state = player.getPlayerState();
              if (state !== window.YT?.PlayerState.PLAYING) {
                console.log('Retrying play after state check');
                player.playVideo();
              }
            } catch (e) {
              console.log('State check failed:', e);
            }
          }, 300);
        } else {
          player.pauseVideo();
        }
      } catch (error) {
        console.log('Player control failed:', error);
      }
    }
    setPaused(!isPaused);
  }, [activateMediaSound, isPaused, player, setPaused]);

  if (!videoId) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
            </svg>
          </div>
          <p className="text-white/70 text-sm">Invalid YouTube URL</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-white/70 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // URL de la thumbnail avec fallback
  const thumbnailUrl = thumbnailError
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div className="absolute inset-0 bg-black">
      {/* Thumbnail preview - affichée immédiatement pendant le chargement */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10">
          <img
            src={thumbnailUrl}
            alt={item.title || "YouTube video"}
            className="absolute left-0 right-0 w-full object-cover"
            style={{ top: '-160px', height: 'calc(100% + 160px)', objectPosition: 'center 20%' }}
            onError={() => setThumbnailError(true)}
          />
          {/* Overlay sombre pour la lisibilité */}
          <div className="absolute inset-0 bg-black/40" />
          {/* Indicateur de chargement */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-white/30 border-t-white/80 animate-spin" />
              <span className="text-white/70 text-sm font-medium">Chargement...</span>
            </div>
          </div>
        </div>
      )}

      {/* Click overlay for play/pause */}
      {isActive && (
        <div
          className="absolute left-0 right-0 top-0 cursor-pointer z-30"
          data-media-tap-handler="true"
          onClick={(e) => {
            e.stopPropagation();
            handlePlayPause();
          }}
          style={{
            pointerEvents: 'auto',
            backgroundColor: 'transparent',
            height: 'calc(100% - (env(safe-area-inset-bottom, 0px) + 100px))'
          }}
        />
      )}

      {/* YouTube iframe wrapper - masks top UI elements without black space at bottom */}
      <div className="absolute inset-0 overflow-hidden">
        <iframe
          ref={iframeRef}
          src={buildYouTubeEmbedUrl(videoId, {
            autoplay: true,
            controls: false,
            loop: true,
            fullscreen: false,
            keyboardControls: false,
            enableJsApi: true
          })}
          className="absolute left-0 right-0 w-full border-0"
          style={{
            pointerEvents: 'none',
            opacity: isLoaded ? 1 : 0,
            top: '-150px',
            height: 'calc(100% + 150px)'
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={item.title || "YouTube video"}
        />
      </div>

      {/* Play/Pause indicator - centered on visible video area */}
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: '-140px' }}>
          {isPaused && (
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          )}
          {!isPaused && !userHasInteracted && (
            <div className="absolute bottom-20 left-4 bg-black/70 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 shadow-lg">
              <p className="text-white text-sm font-medium">Tap for sound</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
);
