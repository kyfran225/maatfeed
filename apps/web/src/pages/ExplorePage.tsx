import { useCallback, useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Play, Headphones, BookOpen, Flame, Sparkles, Info, Volume2 } from "lucide-react";
import { SEO } from "../components/SEO";
import { contentService, ContentItem, TrendingContent } from "../services/contentService";
import { LoadingState } from "../components/ui/LoadingState";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";
import { TouchFeedback } from "../components/ui/TouchFeedback";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { CONTENT_BUCKET_LABELS } from "@maat/shared";
import { useVideoPlayer } from "../contexts/VideoPlayerContext";
import { AdminDeleteButton } from "../components/admin/AdminDeleteButton";
import { RedditVideoPlayer } from "../components/media/RedditVideoPlayer";
import { extractYouTubeVideoId, useIsYouTubeShortFormVideo, YouTubeEmbed } from "../components/media/YouTubeEmbed";
import { preloadMediaBatch, preloadMediaCandidate } from "../utils/mediaPreload";
import { useNearViewport } from "../hooks/useNearViewport";
import { useSingleActiveMedia } from "../hooks/useActiveMedia";

export const BUCKETS = [
  { id: 'viral', name: CONTENT_BUCKET_LABELS.viral, color: 'bg-red-500', gradient: 'from-red-500/30 via-orange-500/20 to-red-600/30', icon: Flame },
  { id: 'educational', name: CONTENT_BUCKET_LABELS.educational, color: 'bg-blue-500', gradient: 'from-blue-500/30 via-cyan-500/20 to-blue-600/30', icon: BookOpen },
  { id: 'deep', name: CONTENT_BUCKET_LABELS.deep, color: 'bg-purple-500', gradient: 'from-purple-500/30 via-pink-500/20 to-purple-600/30', icon: Sparkles }
];

// Generate a beautiful gradient placeholder based on bucket and media type
const ThumbnailPlaceholder = ({ bucket, mediaType, title }: { bucket: string; mediaType?: string; title: string }) => {
  const bucketConfig = BUCKETS.find(b => b.id === bucket) || BUCKETS[2];
  const BucketIcon = bucketConfig.icon;

  // Get initials from title (max 2 characters)
  const initials = title
    .split(' ')
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase())
    .join('')
    .slice(0, 2);

  return (
    <div className={`w-full h-full bg-gradient-to-br ${bucketConfig.gradient} flex flex-col items-center justify-center relative overflow-hidden`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
      </div>

      {/* Content type indicator */}
      <div className="absolute top-3 left-3">
        {mediaType === 'audio' ? (
          <Headphones className="w-5 h-5 text-white/40" />
        ) : (
          <Play className="w-5 h-5 text-white/40" />
        )}
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
          <BucketIcon className="w-10 h-10 text-white/80" />
        </div>
        <span className="text-2xl font-bold text-white/60 tracking-wider">{initials}</span>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
};

// Storage key for persisting search state
const EXPLORER_STATE_KEY = 'maat-explorer-state';
const DESKTOP_EXPLORE_QUERY = "(min-width: 768px)";

function useIsDesktopExplore() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_EXPLORE_QUERY);
    const update = () => setIsDesktop(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  return isDesktop;
}

function ExploreContentCard({
  item,
  index,
  onOpen,
  allowAutoPlay,
  registerAutoPlayCandidate,
  onDeleteSuccess,
}: {
  item: ContentItem;
  index: number;
  onOpen: (contentId: string) => void;
  allowAutoPlay: boolean;
  registerAutoPlayCandidate?: (key: string, element: HTMLElement | null) => void;
  onDeleteSuccess?: (contentId: string) => void;
}) {
  const [directVideoOrientation, setDirectVideoOrientation] = useState<'portrait' | 'landscape' | 'square' | null>(null);
  const { mediaSoundEnabled, activateMediaSound } = useVideoPlayer();
  const isYouTubeVideo = Boolean(item.videoUrl && extractYouTubeVideoId(item.videoUrl));
  const isYouTubeShortFormVideo = useIsYouTubeShortFormVideo(
    isYouTubeVideo ? item.videoUrl : null,
    item.thumbnailUrl
  );
  const isShortFormVideo = item.videoUrl?.includes('tiktok.com') || isYouTubeShortFormVideo || directVideoOrientation === 'portrait';
  const { elementRef: mediaRef, isNearViewport } = useNearViewport<HTMLDivElement>("800px");
  const shouldMountMedia = index < 3 || isNearViewport;
  const handleDetailClick = () => onOpen(item.id);
  const registerCardRef = useCallback((element: HTMLDivElement | null) => {
    if (!item.videoUrl) return;
    registerAutoPlayCandidate?.(item.id, element);
  }, [item.id, item.videoUrl, registerAutoPlayCandidate]);

  return (
    <motion.div
      ref={registerCardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:bg-white/10 transition-colors"
      data-explore-content-id={item.id}
      onPointerEnter={() => preloadMediaCandidate({ videoUrl: item.videoUrl, audioUrl: item.audioUrl, thumbnailUrl: item.thumbnailUrl })}
      onFocus={() => preloadMediaCandidate({ videoUrl: item.videoUrl, audioUrl: item.audioUrl, thumbnailUrl: item.thumbnailUrl })}
    >
      <div ref={mediaRef} className={`${isShortFormVideo ? 'h-[400px]' : 'aspect-video'} relative overflow-hidden`}>
        {item.videoUrl && shouldMountMedia ? (
          <div className="h-full w-full">
            {isYouTubeVideo ? (
              <div className="relative h-full w-full">
                <YouTubeEmbed
                  videoUrl={item.videoUrl}
                  title={item.title}
                  layout="fill"
                  loading={index < 3 || allowAutoPlay ? "eager" : "lazy"}
                  autoplayWhenVisible={allowAutoPlay}
                  options={{
                    controls: true,
                    autoplay: false,
                    muted: allowAutoPlay || !mediaSoundEnabled,
                    enableJsApi: true,
                    fullscreen: true
                  }}
                />
                {allowAutoPlay && !mediaSoundEnabled && (
                  <button
                    type="button"
                    aria-label="Activer le son pour toutes les vidéos"
                    title="Activer le son"
                    className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur transition hover:bg-black/70"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      activateMediaSound();
                    }}
                  >
                    <Volume2 className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </div>
            ) : (
              <RedditVideoPlayer
                src={item.videoUrl}
                thumbnail={item.thumbnailUrl}
                title={item.title}
                className="w-full h-full"
                muted={allowAutoPlay && !mediaSoundEnabled}
                autoPlay={allowAutoPlay}
                onVideoOrientation={setDirectVideoOrientation}
              />
            )}
          </div>
        ) : item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            loading={index < 3 ? "eager" : "lazy"}
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <ThumbnailPlaceholder bucket={item.bucket} mediaType={item.videoUrl ? 'video' : item.audioUrl ? 'audio' : undefined} title={item.title} />
        )}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs text-white rounded-full ${
            BUCKETS.find(b => b.id === item.bucket)?.color || 'bg-gray-500'
          }`}>
            {item.bucket}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-white line-clamp-2 mb-2">{item.title}</h3>
        <p className="text-sand/60 text-sm line-clamp-2 mb-3">{item.description}</p>
        
        <div className="flex items-start justify-between gap-3 text-xs text-sand/40">
          <div className="min-w-0">
            <span className="block truncate">{item.author}</span>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>{item.likes} j'aime</span>
              <span>{item.comments} commentaires</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDetailClick}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-orange px-3 py-2 font-medium text-white transition-colors hover:bg-orange/90 focus:outline-none focus:ring-2 focus:ring-orange/50 focus:ring-offset-2 focus:ring-offset-black"
            aria-label={`Voir le détail de ${item.title}`}
          >
            <Info className="h-4 w-4" />
            Détail
          </button>
          <AdminDeleteButton contentId={item.id} title={item.title} onDeleteSuccess={onDeleteSuccess} />
        </div>
      </div>
    </motion.div>
  );
}

export default function ExplorePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialUrlQuery = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("q") ?? ""
    : "";
  const [searchQuery, setSearchQuery] = useState(initialUrlQuery);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [trendingContent, setTrendingContent] = useState<TrendingContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [pendingRestore, setPendingRestore] = useState<{ contentId?: string; scrollY?: number } | null>(null);
  const [deletedContentIds, setDeletedContentIds] = useState<Set<string>>(new Set());
  const routeRestoreHandledRef = useRef(false);
  const isDesktopExplore = useIsDesktopExplore();
  const allowAutoPlay = !isDesktopExplore;
  const { activeKey: activeAutoPlayId, registerElement: registerAutoPlayElement } = useSingleActiveMedia<string>({
    enabled: allowAutoPlay,
    minimumVisibleRatio: 0.6
  });
  const urlQuery = useMemo(() => new URLSearchParams(location.search).get("q") ?? "", [location.search]);

  // Restore saved state on mount
  useEffect(() => {
    const currentUrlQuery = new URLSearchParams(window.location.search).get("q") ?? "";
    const savedState = sessionStorage.getItem(EXPLORER_STATE_KEY);
    if (savedState) {
      try {
        const { query, bucket, contentId, scrollY } = JSON.parse(savedState);
        if (currentUrlQuery) {
          setSearchQuery(currentUrlQuery);
        } else if (query) {
          setSearchQuery(query);
        }
        if (bucket) setSelectedBucket(bucket);
        if (contentId || typeof scrollY === 'number') {
          routeRestoreHandledRef.current = true;
          setPendingRestore({ contentId, scrollY });
        }
      } catch {
        // Ignore parse errors
      }
    }
    loadTrendingContent();
  }, []);

  useEffect(() => {
    setSearchQuery(urlQuery);
  }, [urlQuery]);

  // Save state before navigating to content detail
  const handleCardClick = useCallback((contentId: string) => {
    const contentSnapshot = [...searchResults, ...(trendingContent?.items ?? [])].find((item) => item.id === contentId);

    // Save current search state
    sessionStorage.setItem(EXPLORER_STATE_KEY, JSON.stringify({
      query: searchQuery,
      bucket: selectedBucket,
      contentId,
      scrollY: window.scrollY
    }));
    if (contentSnapshot) {
      preloadMediaCandidate({
        videoUrl: contentSnapshot.videoUrl,
        audioUrl: contentSnapshot.audioUrl,
        thumbnailUrl: contentSnapshot.thumbnailUrl
      }, "immediate");
    }
    navigate(`/content/${contentId}`, {
      state: {
        returnTo: `${location.pathname}${location.search}${location.hash}`,
        source: "explore",
        contentId,
        contentSnapshot
      }
    });
  }, [location.hash, location.pathname, location.search, navigate, searchQuery, searchResults, selectedBucket, trendingContent]);

  // Load trending content when bucket changes
  useEffect(() => {
    if (selectedBucket) {
      loadTrendingContent(selectedBucket);
    }
  }, [selectedBucket]);

  const loadTrendingContent = async (bucket?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const content = await contentService.getTrendingContent(bucket || 'viral', 20);
      setTrendingContent(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trending content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentDeleted = (contentId: string) => {
    setDeletedContentIds((current) => new Set([...current, contentId]));
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const results = await contentService.searchContent(query, selectedBucket || undefined);
      if (results.items.length > 0) {
        setSearchResults(results.items);
        return;
      }

      const normalizedQuery = query
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      if (normalizedQuery !== query) {
        const normalizedResults = await contentService.searchContent(normalizedQuery, selectedBucket || undefined);
        setSearchResults(normalizedResults.items);
        return;
      }

      setSearchResults([]);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedBucket]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentQuery = params.get("q") ?? "";
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery === currentQuery) {
      return;
    }

    if (trimmedQuery) {
      params.set("q", trimmedQuery);
    } else {
      params.delete("q");
    }

    const nextSearch = params.toString();
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : ""
      },
      { replace: true }
    );
  }, [location.pathname, location.search, navigate, searchQuery]);

  useEffect(() => {
    const routeState = location.state as {
      restoreSource?: string;
      restoreContentId?: string;
    } | null;

    if (routeState?.restoreSource === "explore" && !pendingRestore) {
      if (routeRestoreHandledRef.current) return;
      routeRestoreHandledRef.current = true;
      setPendingRestore({ contentId: routeState.restoreContentId });
    }
  }, [location.state, pendingRestore]);

  useEffect(() => {
    if (!pendingRestore || isLoading || isSearching) {
      return;
    }

    const visibleItems = searchQuery ? searchResults : trendingContent?.items ?? [];
    if (visibleItems.length === 0) {
      return;
    }

    window.requestAnimationFrame(() => {
      const target = pendingRestore.contentId
        ? Array.from(document.querySelectorAll<HTMLElement>("[data-explore-content-id]"))
            .find((element) => element.dataset.exploreContentId === pendingRestore.contentId)
        : null;

      if (target) {
        target.scrollIntoView({ block: "center" });
      } else if (typeof pendingRestore.scrollY === 'number') {
        window.scrollTo({ top: pendingRestore.scrollY });
      }

      sessionStorage.setItem(EXPLORER_STATE_KEY, JSON.stringify({
        query: searchQuery,
        bucket: selectedBucket
      }));
      setPendingRestore(null);
    });
  }, [isLoading, isSearching, pendingRestore, searchQuery, searchResults, selectedBucket, trendingContent]);

  useEffect(() => {
    const visibleItems = searchQuery ? searchResults : trendingContent?.items ?? [];
    if (visibleItems.length === 0) {
      return;
    }

    preloadMediaBatch(
      visibleItems.slice(0, 6).map((item) => ({
        videoUrl: item.videoUrl,
        audioUrl: item.audioUrl,
        thumbnailUrl: item.thumbnailUrl
      }))
    );
  }, [searchQuery, searchResults, trendingContent]);

  const suggestedItems = trendingContent?.items ?? [];

  return (
    <>
      <SEO pageKey="explore" />
      <section className="px-4 py-6 pb-24 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-3xl text-gold mb-4">Découvrir</h1>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-sand/40" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-sand/40 focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-transparent"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <TouchFeedback>
              <button
                onClick={() => setSelectedBucket(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedBucket === null
                    ? 'bg-orange text-white'
                    : 'bg-white/10 text-sand/60 hover:bg-white/20'
                }`}
              >
                Tout
              </button>
            </TouchFeedback>
            
            {BUCKETS.map((bucket) => (
              <TouchFeedback key={bucket.id}>
                <button
                  onClick={() => setSelectedBucket(bucket.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedBucket === bucket.id
                      ? 'bg-orange text-white'
                      : 'bg-white/10 text-sand/60 hover:bg-white/20'
                  }`}
                >
                  {bucket.name}
                </button>
              </TouchFeedback>
            ))}
          </div>

          <TouchFeedback>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Filter className="w-5 h-5 text-sand/60" />
            </button>
          </TouchFeedback>
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {searchQuery && (
          <motion.div
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-lg font-semibold text-white mb-4">
              Résultats pour "{searchQuery}"
            </h2>
            
            {isSearching ? (
              <LoadingState message="Recherche en cours..." />
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.filter(item => !deletedContentIds.has(item.id)).map((item, index) => (
                  <ExploreContentCard
                    key={item.id}
                    item={item}
                    index={index}
                    onOpen={handleCardClick}
                    allowAutoPlay={allowAutoPlay && activeAutoPlayId === item.id}
                    registerAutoPlayCandidate={registerAutoPlayElement}
                    onDeleteSuccess={handleContentDeleted}
                  />
                ))}
              </div>
            ) : suggestedItems.length > 0 ? (
              <div>
                <div className="mb-4 rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm font-semibold text-white">Aucun résultat exact</p>
                  <p className="mt-1 text-sm text-sand/64">
                    Voici des contenus proches pour continuer l'exploration.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestedItems.filter(item => !deletedContentIds.has(item.id)).map((item, index) => (
                    <ExploreContentCard
                      key={item.id}
                      item={item}
                      index={index}
                      onOpen={handleCardClick}
                      allowAutoPlay={allowAutoPlay && activeAutoPlayId === item.id}
                      registerAutoPlayCandidate={registerAutoPlayElement}
                      onDeleteSuccess={handleContentDeleted}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState 
                title="Aucun résultat"
                description="Essaie un sujet plus précis ou change de filtre."
              />
            )}
          </motion.div>
        )}

        {!searchQuery && (
          <motion.div
            key="trending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {isLoading ? (
              <LoadingState message="Chargement..." />
            ) : error ? (
              <ErrorState 
                message={error}
                onRetry={() => loadTrendingContent(selectedBucket || undefined)}
              />
            ) : trendingContent?.items && trendingContent.items.length > 0 ? (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">
                  {selectedBucket ? BUCKETS.find(b => b.id === selectedBucket)?.name : 'Tendances'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trendingContent.items.filter(item => !deletedContentIds.has(item.id)).map((item, index) => (
                    <ExploreContentCard
                      key={item.id}
                      item={item}
                      index={index}
                      onOpen={handleCardClick}
                      allowAutoPlay={allowAutoPlay && activeAutoPlayId === item.id}
                      registerAutoPlayCandidate={registerAutoPlayElement}
                      onDeleteSuccess={handleContentDeleted}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState 
                title="Aucun contenu"
                description="Reviens plus tard."
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
    </>
  );
}
