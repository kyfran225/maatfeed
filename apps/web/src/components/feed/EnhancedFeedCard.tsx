import { FeedResponse } from "../../services/feedService";
import { useInteractions } from "../../hooks/useInteractions";
import { useTrackWatch } from "../../hooks/useTrackWatch";
import { useEngagement } from "../../hooks/useEngagement";
import { memo, useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useVideoPlayer } from "../../contexts/VideoPlayerContext";
import { CommentSheet } from "../community/CommentSheet";
import { EnhancedFeedMedia, EnhancedFeedMediaRef } from "./EnhancedFeedMedia";
import { TouchFeedback } from "../ui/TouchFeedback";
import YouTubeAPIManager from "../../utils/youtubeAPIManager";
import { AuthRequiredSheet } from "../auth/AuthRequiredSheet";
import { EmailVerificationSheet } from "../auth/EmailVerificationSheet";
import { ShareSheet } from "./ShareSheet";
import { VideoProgressBar } from "./VideoProgressBar";
import { EmailVerificationRequiredError } from "../../services/httpClient";

interface EnhancedFeedCardProps {
  item: FeedResponse["items"][0];
  index: number;
  isActive?: boolean;
  nextItems?: FeedResponse["items"]; // Items suivants pour préchargement
}

function getCommunityCtaPresentation(community: FeedResponse["items"][0]["community"]) {
  switch (community?.ctaKind) {
    case "join_debate":
      return {
        label: community.ctaLabel || "Rejoindre le debat",
        className: "bg-amber-500/20 text-amber-100 ring-1 ring-amber-300/30 hover:bg-amber-500/25",
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5m7-8a2 2 0 012 2v7a2 2 0 01-2 2h-5l-4 3v-3H4a2 2 0 01-2-2V8a2 2 0 012-2h16z" />
          </svg>
        )
      };
    case "start_debate":
      return {
        label: community.ctaLabel || "Lancer le debat",
        className: "bg-fuchsia-500/20 text-fuchsia-100 ring-1 ring-fuchsia-300/30 hover:bg-fuchsia-500/25",
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5h14a2 2 0 012 2v6a2 2 0 01-2 2h-4l-3 3v-3H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
          </svg>
        )
      };
    case "join_discussion":
      return {
        label: community.ctaLabel || "Participer a la discussion",
        className: "bg-cyan-500/20 text-cyan-100 ring-1 ring-cyan-300/30 hover:bg-cyan-500/25",
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 10h10M7 14h6" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16a2 2 0 012 2v5a2 2 0 01-2 2h-5l-4 3v-3H4a2 2 0 01-2-2V7a2 2 0 012-2z" />
          </svg>
        )
      };
    default:
      return null;
  }
}

export const EnhancedFeedCard = memo(function EnhancedFeedCard({ item, index, isActive = false, nextItems = [] }: EnhancedFeedCardProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isEmailVerified } = useAuth();
  const { likeMutation, saveMutation, shareMutation } = useInteractions(item.id);
  const { trackWatch, startTracking, resetTracking } = useTrackWatch(item.id);
  const { data: engagement, isLoading: isEngagementLoading } = useEngagement(item.id);
  const [showComments, setShowComments] = useState(false);
  const [showAuthRequired, setShowAuthRequired] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState({ currentTime: 0, duration: 0 });
  // Local state for optimistic UI updates, synced with server data
  const [hasLiked, setHasLiked] = useState(false);
  const [optimisticLikeCount, setOptimisticLikeCount] = useState(item.scores.likes);
  const [optimisticShareCount, setOptimisticShareCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRef = useRef<EnhancedFeedMediaRef>(null);
  const pointerDownRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const communityCta = getCommunityCtaPresentation(item.community);
  const isTikTok = item.sourceProvider === "tiktok";
  const nativeControlsOverlayHeightClass = isPaused ? "h-[103px]" : "h-[80px]";
  const nativeControlsOverlayBottom = "calc(env(safe-area-inset-bottom, 0px) + 72px)";

  const returnTo = `${location.pathname}${location.search}${location.hash}`;

  // Sync local state with server data when engagement changes or card becomes active
  useEffect(() => {
    if (engagement && !isEngagementLoading) {
      setHasLiked(engagement.userHasLiked);
      setOptimisticLikeCount(engagement.likes);
      setOptimisticShareCount(engagement.shares);
    }
  }, [engagement, isEngagementLoading, isActive]);

  const requireAuthOr = (action: () => void, requireVerified = true) => {
    if (!isAuthenticated) {
      setShowAuthRequired(true);
      return;
    }

    if (requireVerified && !isEmailVerified) {
      setShowEmailVerification(true);
      return;
    }

    action();
  };

  // Handle mutation errors for email verification
  const handleInteractionError = (error: Error) => {
    if (error instanceof EmailVerificationRequiredError) {
      setShowEmailVerification(true);
    }
  };

  const handleLike = () => {
    requireAuthOr(() => {
      const nextLiked = !hasLiked;
      setHasLiked(nextLiked);
      setOptimisticLikeCount(prev => nextLiked ? prev + 1 : Math.max(0, prev - 1));
      likeMutation.mutate(undefined, {
        onError: (error) => handleInteractionError(error as Error)
      });
    });
  };

  const handleSave = () => {
    requireAuthOr(() => {
      saveMutation.mutate(undefined, {
        onError: (error) => handleInteractionError(error as Error)
      });
    });
  };

  // HYBRID SHARE: External = open, Internal = verified
  const handleExternalShare = async () => {
    const shareUrl = item.mediaUrl || `${window.location.origin}/content/${item.id}`;
    const shareData = {
      title: item.title,
      text: `Découvrez "${item.title}" sur MAAT - ${item.creator.handle}`,
      url: shareUrl
    };

    try {
      // Try native share (mobile) - open to all
      if (navigator.share) {
        await navigator.share(shareData);
        setShareFeedback("Partagé !");
        setTimeout(() => setShareFeedback(null), 2000);
      } else {
        // Fallback: copy link
        await navigator.clipboard.writeText(shareData.url);
        setShareFeedback("Lien copié !");
        setTimeout(() => setShareFeedback(null), 2000);
      }
    } catch (error) {
      // User cancelled or error
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Share failed:", error);
      }
    }
  };

  // Main share handler - uses external share by default (open to all)
  const handleShare = () => {
    handleExternalShare();
  };

  // INTERNAL SHARE: Requires verified email (boosts share counter, appears in feed)
  const handleInternalShare = () => {
    requireAuthOr(() => {
      setOptimisticShareCount(prev => prev + 1);
      shareMutation.mutate(undefined, {
        onError: (error) => handleInteractionError(error as Error)
      });
      setShowShareSheet(true);
    });
  };

  const handleComments = () => {
    requireAuthOr(() => setShowComments(true));
  };

  const handleJoinDebate = () => {
    navigate(`/debate/${item.id}`);
  };

  const { setIsAnyVideoPlaying } = useVideoPlayer();

  const setPaused = (nextPaused: boolean) => {
    // For direct videos, enforce the actual media element state here.
    // For iframe-based providers (YouTube/TikTok), the media component will control playback.
    if (videoRef.current && videoRef.current.tagName === 'VIDEO') {
      if (!nextPaused) {
        videoRef.current.play();
        startTracking();
      } else {
        videoRef.current.pause();
      }
    }

    setIsPaused(nextPaused);
  };

  // Update global video playing state when active card's pause state changes
  useEffect(() => {
    if (isActive) {
      setIsAnyVideoPlaying(!isPaused);
    }
  }, [isActive, isPaused, setIsAnyVideoPlaying]);

  const handlePlayPauseToggle = () => {
    if (isTikTok) {
      return;
    }

    setPaused(!isPaused);
  };

  const handleCardPointerDownCapture = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerDownRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
    };
  };

  const handleCardPointerUpCapture = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isActive) return;

    const target = event.target as HTMLElement | null;
    if (!target) return;

    if (
      target.closest('[data-ignore-play-toggle="true"]') ||
      target.closest('[data-media-tap-handler="true"]') ||
      target.closest('button, a, input, textarea, select, summary, details, [role="button"], [data-action], [data-overlay="true"]')
    ) {
      return;
    }

    const pointerDown = pointerDownRef.current;
    if (!pointerDown || pointerDown.pointerId !== event.pointerId) {
      return;
    }

    const moveX = Math.abs(event.clientX - pointerDown.x);
    const moveY = Math.abs(event.clientY - pointerDown.y);

    if (moveX > 12 || moveY > 12) {
      return;
    }

    handlePlayPauseToggle();
  };

  // Watch tracking effect for direct videos only
  useEffect(() => {
    if (isActive && !isPaused && videoRef.current && videoRef.current.tagName === 'VIDEO') {
      startTracking();
      
      // Track progress every 2 seconds
      progressIntervalRef.current = setInterval(() => {
        if (videoRef.current && videoRef.current.tagName === 'VIDEO') {
          const progress = (videoRef.current.currentTime / videoRef.current.duration) || 0;
          setWatchProgress(progress);
          
          // Track watch events at 25%, 50%, 75%, 90% completion
          if (progress >= 0.25 && progress < 0.26) {
            trackWatch(0.25);
          } else if (progress >= 0.5 && progress < 0.51) {
            trackWatch(0.5);
          } else if (progress >= 0.75 && progress < 0.76) {
            trackWatch(0.75);
          } else if (progress >= 0.9 && progress < 0.91) {
            trackWatch(0.9);
          }
        }
      }, 2000);
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
  }, [isActive, isPaused, startTracking, trackWatch]);

  // Auto-play/pause when card becomes active/inactive
  useEffect(() => {
    if (isActive) {
      const ytAudioUnlocked = YouTubeAPIManager.getInstance().hasAudioUnlocked();
      const shouldAutoplay = item.sourceProvider !== 'youtube' || ytAudioUnlocked;
      setPaused(!shouldAutoplay);
    } else {
      setPaused(true); // Auto-pause when inactive
      resetTracking();
      setWatchProgress(0);
    }
  }, [isActive, resetTracking]);

  useEffect(() => {
    if (!isPaused) {
      setIsSummaryExpanded(false);
    }
  }, [isPaused]);

  useEffect(() => {
    setIsSummaryExpanded(false);
    setHasLiked(false);
    setOptimisticLikeCount(item.scores.likes);
    setOptimisticShareCount(0); // Sera mis à jour par engagement query
  }, [item.id]);

  // Handle video progress updates
  const handleProgressUpdate = useCallback((currentTime: number, duration: number) => {
    setVideoProgress({ currentTime, duration });
  }, []);

  // Handle seeking in video
  const handleSeek = useCallback((time: number) => {
    // Store current playback state
    const wasPlaying = !isPaused;
    
    // For direct videos, use the video element
    if (videoRef.current && videoRef.current.tagName === 'VIDEO') {
      videoRef.current.currentTime = time;
      // Resume playback if it was playing
      if (wasPlaying) {
        videoRef.current.play().catch(console.error);
      }
    }
    // For YouTube and TikTok, use the media ref
    if (mediaRef.current) {
      mediaRef.current.seekTo(time);
      // For YouTube, we need to ensure playback continues after seeking
      if (wasPlaying && item.sourceProvider === 'youtube') {
        setTimeout(() => {
          // Check if video is still paused after seek and resume if needed
          if (isPaused) {
            setPaused(false);
          }
        }, 100);
      }
    }
  }, [videoRef, isPaused, setPaused, item.sourceProvider]);

  return (
    <>
      <div
        className="relative h-full w-full bg-black overflow-hidden"
        data-active={isActive}
        data-card-id={item.id}
        onPointerDownCapture={handleCardPointerDownCapture}
        onPointerUpCapture={handleCardPointerUpCapture}
      >
        <button
          type="button"
          data-play-pause="true"
          className="sr-only"
          onClick={(e) => {
            e.stopPropagation();
            handlePlayPauseToggle();
          }}
          aria-label={isPaused ? "Play" : "Pause"}
        />

        {/* Enhanced Media Background */}
        <div className="absolute inset-0">
          <EnhancedFeedMedia
            ref={mediaRef}
            item={item}
            isActive={isActive}
            isPaused={isPaused}
            setPaused={setPaused}
            videoRef={videoRef}
            onProgressUpdate={handleProgressUpdate}
            nextItems={nextItems}
          />
        </div>

        {/* Gradient Overlay - Minimal opacity for better video visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" style={{ pointerEvents: 'none' }} />

        {/* Overlay rendered in-page to mask native player controls above the bottom nav */}
        {isActive && item.mediaType === "video" && item.sourceProvider !== 'tiktok' && (
          <div
            aria-hidden="true"
            className={`absolute left-0 right-0 z-[55] ${nativeControlsOverlayHeightClass} bg-ink transition-all duration-300`}
            style={{
              bottom: nativeControlsOverlayBottom,
              pointerEvents: "none",
              transform: "scaleY(1.8)",
              transformOrigin: "top center"
            }}
          />
        )}

        {item.sourceProvider !== 'tiktok' && (
          <div 
            className="absolute left-0 right-0 h-24 z-[50] flex items-center justify-center"
            style={{
              bottom: '84px',
              background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 80%, rgba(0,0,0,0.8) 90%, rgba(0,0,0,0.3) 100%)',
              pointerEvents: 'none'
            }}
          >
            <div className="flex items-center gap-4 px-6">
              <div className="text-amber-400/60 text-2xl font-bold">ankh</div>
              <div className="text-center">
                <div className="text-amber-300/80 text-sm font-light tracking-wider uppercase">
                  Maât
                </div>
                <div className="text-amber-400/60 text-xs font-light tracking-widest">
                  Équilibre & Harmonie
                </div>
              </div>
              <div className="text-amber-400/60 text-2xl font-bold">udjat</div>
            </div>
          </div>
        )}

        {/* Content Overlay - Positionné par rapport à la vidéo */}
        <div className="absolute inset-0 flex flex-col justify-between p-6" style={{ pointerEvents: 'none' }}>
          {/* Top Content - Compact */}
          <div className="absolute top-4 left-4 right-4" style={{ pointerEvents: 'auto' }}>
          <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 text-xs rounded-full backdrop-blur-sm ${
                item.bucket === 'viral' ? 'bg-purple-500/30 text-purple-300' :
                item.bucket === 'educational' ? 'bg-blue-500/30 text-blue-300' :
                'bg-green-500/30 text-green-300'
              }`}>
                {item.bucket}
              </span>
              <span className="text-xs text-white/70">via {item.sourceProvider}</span>
            </div>
            {!isPaused && (
              <h1 className="text-lg font-bold text-white mb-1 line-clamp-2 drop-shadow-lg">
                {item.title}
              </h1>
            )}
            
            <div className="flex items-center gap-3 text-xs text-white/80">
              <span>@{item.creator.handle}</span>
              <span>Score : {item.scores.finalScore.toFixed(1)}</span>
            </div>
            {item.community && (
              <div className="mt-2 flex flex-wrap gap-2">
                {item.community.isTrending && (
                  <span className="rounded-full bg-red-500/20 px-2 py-1 text-[11px] font-medium text-red-200">🔥 Tendance</span>
                )}
                {item.community.isActiveDiscussion && (
                  <span className="rounded-full bg-cyan-500/20 px-2 py-1 text-[11px] font-medium text-cyan-100">💬 Discussion active</span>
                )}
              </div>
            )}
          </div>

          {/* Bottom sheet - Summary affiché uniquement en pause */}
          {isPaused && item.summary && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 z-[70] px-2 lg:px-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{
                pointerEvents: 'auto',
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 170px)'
              }}
            >
              <div
                className="w-full lg:max-w-7xl mx-auto rounded-2xl border border-white/20 overflow-hidden"
                style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
                }}
              >
                <div className={isSummaryExpanded ? "p-5" : "p-5 pb-1"}>
                  <div className="flex items-start gap-3">
                    <div className="min-w-0">
                      {!(item.sourceProvider === 'tiktok' && isSummaryExpanded) && (
                        <div className="text-base font-semibold text-white min-h-[3rem] leading-6">
                          <div className="line-clamp-2">
                            {item.title}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1 mb-4 text-sm text-white/70">
                        <span>@{item.creator.handle}</span>
                        <span>•</span>
                        <span>{item.sourceProvider}</span>
                      </div>
                    </div>
                  </div>

                  <motion.div
                    initial={false}
                    animate={{
                      maxHeight: isSummaryExpanded ? '60vh' : '12px',
                      opacity: isSummaryExpanded ? 1 : 0.6
                    }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className={isSummaryExpanded ? "overflow-y-auto overscroll-contain" : "overflow-hidden"}
                    style={{ WebkitOverflowScrolling: 'touch' }}
                    onWheel={(e) => {
                      e.stopPropagation();
                    }}
                    onTouchMove={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <div className="pt-3">
                      <p className="text-base text-white/90 leading-relaxed">
                        {item.summary}
                      </p>
                    </div>
                  </motion.div>
                {/* Bouton Afficher plus en bas */}
                  <div className="px-5 pb-3 pt-2">
                    <button
                      type="button"
                      className="w-full text-sm font-medium text-white/90 hover:text-white px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/15 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSummaryExpanded((v) => !v);
                      }}
                      aria-expanded={isSummaryExpanded}
                      aria-label={isSummaryExpanded ? "Afficher moins" : "Afficher plus"}
                    >
                      {isSummaryExpanded ? "Afficher moins" : "Afficher plus"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* iOS-style Glass Action Overlay - Positionné par rapport à la vidéo */}
          {!showComments && (
          <motion.div 
              className={`absolute right-3 lg:right-5 z-[60] flex flex-col items-center gap-1 py-1 lg:py-8 w-14 lg:w-16 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-lg transition-all duration-300 ${
                  isPaused 
                    ? 'bottom-[355px] lg:bottom-[360px]' 
                    : 'bottom-[155px] lg:bottom-[100px]'
                }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ opacity: 1, scale: 1.05 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25,
                opacity: { duration: 0.3 }
              }}
              style={{ 
                pointerEvents: 'auto',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(15px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
              }}
              data-ignore-play-toggle="true"
            >
              <TouchFeedback onTap={() => {}}>
                <button
                  data-action="like"
                  type="button"
                  disabled={likeMutation.isPending}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLike();
                  }}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all disabled:opacity-50 hover:bg-white/10 active:scale-95"
                  aria-label={`Like ${item.title}`}
                >
                  <svg className={`w-7 h-7 transition-colors ${hasLiked ? 'text-red-500' : 'text-white/90'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span className="text-xs text-white/80 font-medium">{optimisticLikeCount}</span>
                </button>
              </TouchFeedback>

              <TouchFeedback onTap={() => {}}>
                <button 
                  data-action="comments"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleComments();
                  }}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all hover:bg-white/10 active:scale-95"
                  aria-label={`Comment on ${item.title}`}
                >
                  <svg className="w-7 h-7 text-white/90" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  <span className="text-xs text-white/80 font-medium">{item.scores.comments}</span>
                </button>
              </TouchFeedback>

              {communityCta && (
                <TouchFeedback onTap={() => {}}>
                  <button
                    data-action="join-debate"
                    type="button"
                    title={communityCta.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinDebate();
                    }}
                    className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors active:scale-95 ${communityCta.className}`}
                    aria-label={communityCta.label}
                  >
                    {communityCta.icon}
                    {item.community?.isTrending && (
                      <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-400" aria-hidden="true" />
                    )}
                  </button>
                </TouchFeedback>
              )}

              <TouchFeedback onTap={() => {}}>
                <button
                  data-action="share"
                  type="button"
                  disabled={shareMutation.isPending}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleInternalShare();
                  }}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all disabled:opacity-50 hover:bg-white/10 active:scale-95 relative"
                  aria-label={`Share ${item.title}`}
                >
                  <svg className="w-7 h-7 text-white/90" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                  </svg>
                  <span className="text-xs text-white/80 font-medium">{optimisticShareCount}</span>
                  {shareFeedback && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-500/90 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap animate-fade-out">
                      {shareFeedback}
                    </span>
                  )}
                </button>
              </TouchFeedback>
            </motion.div>
          )}
        </div>

        {/* Video Progress Bar - YouTube only. TikTok uses the same native controls as the demo player. */}
        {isActive && item.sourceProvider === 'youtube' && (
          <VideoProgressBar
            currentTime={videoProgress.currentTime}
            duration={videoProgress.duration}
            onSeek={handleSeek}
            isActive={isActive && !isPaused}
          />
        )}

        {/* Simple Watch Progress Bar - Only for direct videos (legacy) */}
        {isActive && watchProgress > 0 && videoRef.current?.tagName === 'VIDEO' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${watchProgress * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        
        {/* Media Type Indicator */}
        <div className="absolute top-4 right-4">
          <div className="backdrop-blur-sm bg-black/50 rounded-full px-3 py-1 border border-white/10">
            <span className="text-xs text-white/80 capitalize">
              {item.sourceProvider === 'youtube' ? 'YouTube' : 
               item.sourceProvider === 'tiktok' ? 'TikTok' : 
               item.mediaType}
            </span>
          </div>
        </div>
      </div>
      
      <CommentSheet
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        contentId={item.id}
        data-overlay="true"
      />

      <AuthRequiredSheet
        isOpen={showAuthRequired}
        onClose={() => setShowAuthRequired(false)}
        returnTo={returnTo}
      />

      <EmailVerificationSheet
        isOpen={showEmailVerification}
        onClose={() => setShowEmailVerification(false)}
      />

      <ShareSheet
        isOpen={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        url={item.mediaUrl}
        title={item.title}
      />
    </>
  );
}, (prev, next) => {
  return (
    prev.item.id === next.item.id &&
    prev.item.scores.comments === next.item.scores.comments &&
    prev.item.scores.views === next.item.scores.views &&
    prev.item.scores.finalScore === next.item.scores.finalScore &&
    prev.isActive === next.isActive &&
    prev.index === next.index
  );
});
