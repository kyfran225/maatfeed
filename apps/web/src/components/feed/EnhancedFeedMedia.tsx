import type React from "react";
import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { FeedResponse } from "../../services/feedService";
import { YouTubeDirectEmbed, YouTubePlayerRef } from "./YouTubeDirectEmbed";

export interface EnhancedFeedMediaRef {
  seekTo: (time: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

interface EnhancedFeedMediaProps {
  item: FeedResponse["items"][0];
  isActive: boolean;
  isPaused: boolean;
  setPaused: (nextPaused: boolean) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onProgressUpdate?: (currentTime: number, duration: number) => void;
  nextItems?: FeedResponse["items"]; // Items suivants pour préchargement
}

export const EnhancedFeedMedia = forwardRef<EnhancedFeedMediaRef, EnhancedFeedMediaProps>(
  function EnhancedFeedMedia({ item, isActive, isPaused, setPaused, videoRef, onProgressUpdate, nextItems = [] }, ref) {
  const [error, setError] = useState<string | null>(null);
  const [tiktokIframe, setTiktokIframe] = useState<HTMLIFrameElement | null>(null);
  const [isTikTokReady, setIsTikTokReady] = useState(false);
  const [hasTikTokUserPlayed, setHasTikTokUserPlayed] = useState(false);
  const [isMediaReady, setIsMediaReady] = useState(false);
  const [tiktokSrc, setTiktokSrc] = useState<string | null>(null);
  const [tiktokProgress, setTiktokProgress] = useState({ currentTime: 0, duration: 0 });
  const [tiktokThumbnailLoaded, setTiktokThumbnailLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const tiktokProgressRef = useRef({ currentTime: 0, duration: 0 });
  const youtubePlayerRef = useRef<YouTubePlayerRef>(null);

  const logTikTokDebug = useCallback((message: string, details?: Record<string, unknown>) => {
    if (item.sourceProvider !== "tiktok") return;
    if (!(import.meta.env.DEV || window.localStorage.getItem("maat:debug:tiktok") === "1")) return;

    if (details) {
      console.log(`[TikTokFeed] ${message}`, details);
      return;
    }

    console.log(`[TikTokFeed] ${message}`);
  }, [item.sourceProvider]);

  const postTikTokMessage = useCallback((type: string, value?: unknown) => {
    if (!tiktokIframe?.contentWindow) {
      logTikTokDebug("postMessage skipped: iframe unavailable", { type, value });
      return false;
    }

    tiktokIframe.contentWindow.postMessage({
      'x-tiktok-player': true,
      type,
      value,
    }, '*');

    logTikTokDebug("postMessage sent", { type, value });

    return true;
  }, [logTikTokDebug, tiktokIframe]);

  // Global error handler for external script errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('403') || event.message.includes('AxiosError')) {
        console.error('Caught 403/Axios error:', event);
        setError('Content temporarily unavailable due to access restrictions');
        setIsMediaReady(true);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Global TikTok message listener for progress and state tracking
  useEffect(() => {
    if (item.sourceProvider !== "tiktok") return;

    const handleTikTokMessage = (event: MessageEvent) => {
      if (!event.data?.['x-tiktok-player']) return;

      logTikTokDebug("player message received", {
        type: event.data.type,
        value: event.data.value
      });

      if (event.data.type === 'onPlayerReady') {
        setIsTikTokReady(true);
        setIsMediaReady(true);
        postTikTokMessage('pause');
        setPaused(true);
        return;
      }

      if (event.data.type === 'onStateChange') {
        if (event.data.value === 1) {
          setHasTikTokUserPlayed(true);
          setPaused(false);
        } else if (event.data.value === 0 || event.data.value === 2) {
          setPaused(true);
        }
        return;
      }

      if (event.data.type === 'onCurrentTime' && event.data.value) {
        const { currentTime, duration } = event.data.value;
        tiktokProgressRef.current = { currentTime, duration };
        setTiktokProgress({ currentTime, duration });
        onProgressUpdate?.(currentTime, duration);
      }
    };

    window.addEventListener('message', handleTikTokMessage);
    return () => window.removeEventListener('message', handleTikTokMessage);
  }, [item.sourceProvider, onProgressUpdate, postTikTokMessage, setPaused]);

  // Seek function for TikTok
  const seekToTikTok = useCallback((time: number) => {
    if (tiktokIframe && isTikTokReady) {
      const message = {
        'x-tiktok-player': true,
        type: 'seekTo',
        value: time,
      };
      tiktokIframe.contentWindow?.postMessage(message, 'https://www.tiktok.com');
    }
  }, [tiktokIframe, isTikTokReady]);

  // Get current time for TikTok
  const getTikTokCurrentTime = useCallback(() => {
    return tiktokProgressRef.current.currentTime;
  }, []);

  // Get duration for TikTok
  const getTikTokDuration = useCallback(() => {
    return tiktokProgressRef.current.duration;
  }, []);

  // Expose imperative handle for seeking
  useImperativeHandle(ref, () => ({
    seekTo: (time: number) => {
      if (item.sourceProvider === 'tiktok') {
        seekToTikTok(time);
      } else if (item.sourceProvider === 'youtube' && youtubePlayerRef.current) {
        youtubePlayerRef.current.seekTo(time);
      } else if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    },
    getCurrentTime: () => {
      if (item.sourceProvider === 'tiktok') {
        return getTikTokCurrentTime();
      } else if (item.sourceProvider === 'youtube' && youtubePlayerRef.current) {
        return youtubePlayerRef.current.getCurrentTime();
      } else if (videoRef.current) {
        return videoRef.current.currentTime;
      }
      return 0;
    },
    getDuration: () => {
      if (item.sourceProvider === 'tiktok') {
        return getTikTokDuration();
      } else if (item.sourceProvider === 'youtube' && youtubePlayerRef.current) {
        return youtubePlayerRef.current.getDuration();
      } else if (videoRef.current) {
        return videoRef.current.duration || 0;
      }
      return 0;
    },
  }), [item.sourceProvider, seekToTikTok, getTikTokCurrentTime, getTikTokDuration, videoRef]);

  useEffect(() => {
    setIsMediaReady(false);
  }, [item.id, item.mediaUrl, item.sourceProvider]);

  // Initialize TikTok iframe with proper messaging
  useEffect(() => {
    if (item.sourceProvider === "tiktok" && mediaSource && !tiktokIframe) {
      // We'll set up the iframe in the render section
    }
  }, [item.sourceProvider, item.mediaUrl, tiktokIframe]);

  // Handle TikTok play/pause using the official embed API.
  useEffect(() => {
    if (item.sourceProvider !== "tiktok") return;
    if (!isActive) return;
    if (!isTikTokReady) return;

    if (isPaused) {
      postTikTokMessage('pause');
      return;
    }

    postTikTokMessage('play');
    const retryId = window.setTimeout(() => {
      postTikTokMessage('play');
    }, 250);

    return () => window.clearTimeout(retryId);
  }, [isActive, isPaused, item.sourceProvider, isTikTokReady, postTikTokMessage]);

  // Get media source for different providers
  const getMediaSource = useCallback(() => {
    if (!item.mediaUrl) return null;
    
    if (item.sourceProvider === "youtube") {
      let videoId = null;
      if (item.mediaUrl.includes("youtube.com/watch?v=")) {
        videoId = item.mediaUrl.split("v=")[1]?.split("&")[0];
      } else if (item.mediaUrl.includes("youtu.be/")) {
        videoId = item.mediaUrl.split("youtu.be/")[1]?.split("?")[0];
      }
      if (videoId) {
        // YouTube uses IFrame API, not direct embed URL
        return null; // We'll handle YouTube separately
      }
    }
    
    if (item.sourceProvider === "tiktok") {
      const tiktokId = item.mediaUrl.match(/\/video\/(\d+)/)?.[1];
      if (tiktokId) {
        // Prime the player with autoplay enabled so the first host-triggered play command works reliably,
        // while still keeping the volume controls available.
        return `https://www.tiktok.com/player/v1/${tiktokId}?autoplay=1&muted=0&loop=1&controls=1&description=1&music_info=1`;
      }
    }
    
    return item.mediaUrl.trim() || null;
  }, [item.mediaUrl, item.sourceProvider]);

  const mediaSource = getMediaSource();

  // TikTok hard reset strategy: when the card is inactive, unload the iframe to stop audio and avoid stuck frames.
  // When it becomes active again, restore the src so TikTok re-initializes cleanly.
  useEffect(() => {
    if (item.sourceProvider !== "tiktok") return;

    if (!mediaSource) {
      setTiktokSrc(null);
      return;
    }

    if (isActive) {
      setTiktokSrc(mediaSource);
      setIsMediaReady(false);
      // Force TikTok to be paused on activation so the first user tap always triggers play (not pause).
      setPaused(true);
      return;
    }

    setTiktokSrc("about:blank");
    setIsMediaReady(true);
    setIsTikTokReady(false);
    setHasTikTokUserPlayed(false);
  }, [isActive, item.sourceProvider, mediaSource]);

  // When TikTok is active and ready, enforce a paused state at the iframe level.
  // This prevents TikTok from occasionally auto-starting (or reporting PLAYING) during fast scroll.
  useEffect(() => {
    if (item.sourceProvider !== "tiktok") return;
    if (!isActive) return;
    if (!tiktokIframe) return;
    if (!isTikTokReady) return;

    const message = {
      'x-tiktok-player': true,
      type: 'pause',
      value: undefined
    };

    tiktokIframe.contentWindow?.postMessage(message, 'https://www.tiktok.com');
  }, [isActive, isTikTokReady, item.sourceProvider, tiktokIframe]);

  // Handle direct video element play/pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video || video.tagName !== 'VIDEO') return;

    if (isActive && !isPaused) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  }, [isActive, isPaused, item.sourceProvider, mediaSource]);

  // Handle click on video for play/pause toggle
  const handleVideoClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('=== VIDEO CLICK ANALYSIS ===');
    console.log('Provider:', item.sourceProvider);
    console.log('Is paused:', isPaused);
    console.log('Is active:', isActive);
    console.log('TikTok ready:', isTikTokReady);
    console.log('TikTok iframe exists:', !!tiktokIframe);
    console.log('Click target:', e.target);
    console.log('Current element:', e.currentTarget);
    
    // YouTube is handled by YouTubeDirectEmbed (it has its own click overlay)
    // If this handler is reached for YouTube (e.g. via direct video element click), just toggle state.
    if (item.sourceProvider === "youtube") {
      setPaused(!isPaused);
      return;
    }
    
    // For TikTok, use the official embed API
    if (item.sourceProvider === "tiktok" && tiktokIframe) {
      console.log('TikTok click handler triggered');
      console.log('TikTok iframe src:', tiktokIframe.src);
      console.log('TikTok iframe ready state:', (tiktokIframe as any).readyState);
      
      try {
        const message = {
          'x-tiktok-player': true,
          type: isPaused ? 'play' : 'pause',
          value: undefined
        };
        
        console.log('Sending TikTok message:', message);
        console.log('Target origin: https://www.tiktok.com');
        
        tiktokIframe.contentWindow?.postMessage(message, 'https://www.tiktok.com');
        console.log('TikTok message sent successfully');
        
        setPaused(!isPaused);
        console.log('TikTok onPlayPause called');
      } catch (error) {
        console.log('TikTok control failed:', error);
        setPaused(!isPaused);
      }
      return;
    }
    
    // For direct videos
    if (videoRef.current && videoRef.current.tagName === 'VIDEO') {
      console.log('Direct video click handler triggered');
      setPaused(!isPaused);
    }
    
    console.log('=== END VIDEO CLICK ANALYSIS ===');
  }, [item.sourceProvider, tiktokIframe, isPaused, setPaused, isActive, isTikTokReady, videoRef]);

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

  return (
    <div className="absolute inset-0 bg-black" ref={containerRef}>
      {isActive && !isMediaReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
            <div className="text-xs text-white/60">Chargement de la vidéo…</div>
          </div>
        </div>
      )}

      {/* Click overlay - disabled for TikTok to let native player handle clicks */}
      {isActive && item.sourceProvider !== "tiktok" && item.sourceProvider !== "youtube" && (
        <div 
          className="absolute inset-0 cursor-pointer z-10"
          onClick={handleVideoClick}
          style={{ 
            pointerEvents: 'auto',
            backgroundColor: 'transparent'
          }}
        />
      )}
      
      {/* YouTube Player - Use Direct Embed for better compatibility */}
      {item.sourceProvider === "youtube" ? (
        <YouTubeDirectEmbed
          ref={youtubePlayerRef}
          item={item}
          isActive={isActive}
          isPaused={isPaused}
          setPaused={setPaused}
          onReady={() => setIsMediaReady(true)}
          onProgressUpdate={onProgressUpdate}
          preloadNext={nextItems?.filter(i => i.sourceProvider === 'youtube').slice(0, 3).map(i => i.mediaUrl)}
        />
      ) : item.sourceProvider === "tiktok" && mediaSource ? (
        /* TikTok Player - let native player handle all clicks */
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
          {/* TikTok Thumbnail/Placeholder - shown while iframe is loading */}
          {!isTikTokReady && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black">
              {/* TikTok Thumbnail Image if available */}
              {item.thumbnailUrl ? (
                <>
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title || "TikTok video"}
                    className="absolute left-0 right-0 w-full object-cover"
                    style={{ top: '-160px', height: 'calc(100% + 160px)', objectPosition: 'center 20%' }}
                    onLoad={() => setTiktokThumbnailLoaded(true)}
                    onError={() => setTiktokThumbnailLoaded(false)}
                  />
                  {/* Dark overlay for loading spinner visibility */}
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                    {/* TikTok Logo */}
                    <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-cyan-400 via-pink-500 to-yellow-400 p-[2px]">
                      <div className="w-full h-full bg-black/80 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                        </svg>
                      </div>
                    </div>
                    {/* Loading indicator */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white/80 animate-spin" />
                      <span className="text-white/80 text-sm font-medium">Chargement...</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Fallback: TikTok Logo + Loading */}
                  <div className="w-20 h-20 mb-4 rounded-2xl bg-gradient-to-br from-cyan-400 via-pink-500 to-yellow-400 p-[2px]">
                    <div className="w-full h-full bg-black rounded-2xl flex items-center justify-center">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                      </svg>
                    </div>
                  </div>
                  {/* Loading indicator */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
                    <span className="text-white/60 text-sm font-medium">Chargement TikTok...</span>
                  </div>
                </>
              )}
            </div>
          )}

          <iframe
            src={tiktokSrc ?? mediaSource}
            className="absolute w-full h-full border-0"
            ref={(el) => {
              if (el && el !== tiktokIframe) {
                console.log('=== TIKTOK IFRAME SETUP ===');
                console.log('Creating TikTok iframe with src:', mediaSource);
                setTiktokIframe(el);
                el.onload = () => {
                  console.log('TikTok iframe loaded - setting ready state');
                  setIsTikTokReady(true);
                  setIsMediaReady(true);
                  // Ensure we start paused (no autoplay) so the UI shows the play button consistently.
                  setPaused(true);
                  el.contentWindow?.postMessage({
                    'x-tiktok-player': true,
                    type: 'pause',
                    value: undefined
                  }, '*');
                  console.log('TikTok ready state set to true');
                };
                el.onerror = () => {
                  console.error('TikTok iframe failed to load - likely 403 error');
                  setError('TikTok content unavailable due to access restrictions');
                  setIsMediaReady(true);
                };
                console.log('TikTok iframe element assigned');
              }
            }}
            style={{
              width: '100%',
              height: 'calc(100% + 160px)',
              objectFit: 'cover',
              top: '-160px',
              opacity: isTikTokReady ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out'
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />

          {isActive && isTikTokReady && (
            <div
              className="absolute left-0 right-0 cursor-pointer"
              data-media-tap-handler="true"
              style={{
                zIndex: 10,
                top: '-80px',
                height: 'calc(100% - 160px)'
              }}
              onClick={(event) => {
                event.stopPropagation();

                logTikTokDebug("overlay click", {
                  isActive,
                  isPaused,
                  isTikTokReady,
                  hasTikTokUserPlayed,
                  hasIframe: Boolean(tiktokIframe)
                });

                if (!tiktokIframe || !isTikTokReady) {
                  return;
                }

                if (isPaused) {
                  postTikTokMessage('play');
                  // Toujours essayer de démuter - pas seulement la première fois
                  // Le navigateur bloque souvent le son sur l'autoplay
                  window.setTimeout(() => {
                    postTikTokMessage('unMute');
                  }, 100);
                  // Retry au cas où le premier échoue
                  window.setTimeout(() => {
                    postTikTokMessage('unMute');
                  }, 500);

                  setHasTikTokUserPlayed(true);
                  setPaused(false);
                  return;
                }

                postTikTokMessage('pause');
                setPaused(true);
              }}
            />
          )}

        </div>
      ) : mediaSource ? (
        /* Direct Video Element */
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src={mediaSource}
          loop
          playsInline
          muted
          autoPlay={isActive && !isPaused}
          onClick={handleVideoClick}
          onLoadedData={() => setIsMediaReady(true)}
          onError={() => {
            setError("Failed to load media");
            setIsMediaReady(true);
          }}
        />
      ) : (
        /* Fallback */
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              {(() => {
                const provider = item.sourceProvider as "youtube" | "tiktok";
                if (provider === "youtube") {
                  return (
                    <svg className="w-10 h-10 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                    </svg>
                  );
                } else if (provider === "tiktok") {
                  return (
                    <svg className="w-10 h-10 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                  );
                } else if (item.mediaType === "video") {
                  return (
                    <svg className="w-10 h-10 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  );
                } else {
                  return (
                    <svg className="w-10 h-10 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  );
                }
              })()}
            </div>
            <p className="text-white/60 text-sm mb-2 capitalize">{item.sourceProvider} Content</p>
            <p className="text-white/40 text-xs mb-3"> @{item.creator.handle}</p>
            {error && error.includes('access restrictions') && (
              <p className="text-yellow-400 text-xs mb-3 px-3 py-2 bg-yellow-400/10 rounded-lg">
                ⚠️ {error}
              </p>
            )}
            <button 
              onClick={() => window.open(item.mediaUrl, '_blank')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white/80 text-xs transition-colors"
            >
              Watch on {item.sourceProvider}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
);
