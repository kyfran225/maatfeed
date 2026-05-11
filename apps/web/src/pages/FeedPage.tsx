import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Check, Play, RotateCcw, Search, HelpCircle, Volume2, X } from "lucide-react";
import { SEO } from "../components/SEO";
import { useAuth } from "../hooks/useAuth";
import { useInfiniteGlobalFeed } from "../hooks/useFeed";
import { useNearViewport } from "../hooks/useNearViewport";
import { useSingleActiveMedia } from "../hooks/useActiveMedia";
import { useVideoPlayer } from "../contexts/VideoPlayerContext";
import type { FeedResponse } from "../services/feedService";
import { contentService } from "../services/contentService";
import {
  getLearningProgress,
  updateLearningProgress,
  type LearningSummary,
} from "../services/learningProgressService";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { QuizModal } from "../components/modals/QuizModal";
import { SponsorCard } from "../components/feed/SponsorCard";
import { QuizRecapCard } from "../components/feed/QuizRecapCard";
import { AdminDeleteButton } from "../components/admin/AdminDeleteButton";
import { getActiveSponsors, incrementSponsorStats, type Sponsor } from "../services/sponsorService";
import { RedditVideoPlayer } from "../components/media/RedditVideoPlayer";
import { extractYouTubeVideoId, useIsYouTubeShortFormVideo, YouTubeEmbed } from "../components/media/YouTubeEmbed";
import { preloadMediaBatch, preloadMediaCandidate } from "../utils/mediaPreload";
import type { ContentItem } from "../services/contentService";
import { seoTopics } from "../config/seoTopics";

// YouTubeVideoWrapper component with intersection observer for pause when not visible
function YouTubeVideoWrapper({ 
  videoUrl, 
  title, 
  allowAutoPlay, 
  mediaSoundEnabled, 
  loading 
}: { 
  videoUrl: string; 
  title: string; 
  allowAutoPlay: boolean; 
  mediaSoundEnabled: boolean; 
  loading: "eager" | "lazy";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      const nextIsVisible = Boolean(entry?.isIntersecting);
      setIsVisible(nextIsVisible);
    }, { threshold: 0.6 });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Only render YouTubeEmbed when visible to stop playback when not visible
  if (!isVisible) {
    return (
      <div ref={containerRef} className="relative h-full w-full">
        <div className="w-full h-full bg-black/80 flex items-center justify-center">
          <div className="text-white/60 text-center">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
              <Play className="w-8 h-8 text-white/60 ml-1" />
            </div>
            <p className="text-sm">Vidéo en pause</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <YouTubeEmbed
        videoUrl={videoUrl}
        title={title}
        layout="fill"
        loading={loading}
        autoplayWhenVisible={allowAutoPlay}
        options={{
          controls: true,
          autoplay: false,
          muted: allowAutoPlay || !mediaSoundEnabled,
          enableJsApi: true,
          fullscreen: true
        }}
      />
    </div>
  );
}

type FeedItem = FeedResponse["items"][number];
type LearningStatus = "new" | "learned" | "review";
type LearningState = Record<string, LearningStatus>;

interface QuizRecapItem {
  type: "quiz_recap";
  contentIds: string[];
}

type FeedWithInjections = FeedItem | { type: "sponsor"; data: Sponsor } | QuizRecapItem;

const STORAGE_KEY = "maatfeed-learning-state";
const FEED_RETURN_STATE_KEY = "maatfeed-feed-return-state";
const DESKTOP_FEED_QUERY = "(min-width: 768px)";

function useIsDesktopFeed() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_FEED_QUERY);
    const update = () => setIsDesktop(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  return isDesktop;
}

function readLearningState(): LearningState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as LearningState : {};
  } catch {
    return {};
  }
}

function getStatusStyle(status?: LearningStatus) {
  if (status === "learned") {
    return "border-emerald-300/25 bg-emerald-400/10 text-emerald-100";
  }

  if (status === "review") {
    return "border-amber-300/25 bg-amber-400/10 text-amber-100";
  }

  return "border-white/10 bg-white/[0.04] text-sand/62";
}

function getStatusLabel(status?: LearningStatus) {
  if (status === "learned") return "Vu";
  if (status === "review") return "Plus tard";
  return "Nouveau";
}

function feedItemToContentSnapshot(item: FeedItem): ContentItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description || item.summary || "",
    author: item.creator.name || item.creator.handle,
    thumbnailUrl: item.thumbnailUrl,
    videoUrl: item.mediaType === "video" ? item.mediaUrl : undefined,
    audioUrl: item.mediaType === "audio" ? item.mediaUrl : undefined,
    bucket: item.bucket,
    score: item.scores.finalScore,
    likes: item.scores.likes,
    comments: item.scores.comments,
    views: item.scores.views,
    createdAt: item.createdAt,
    tags: item.tags
  };
}

function contentItemToFeedItem(item: ContentItem): FeedItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    summary: item.description,
    mediaUrl: item.videoUrl || item.audioUrl || "",
    thumbnailUrl: item.thumbnailUrl,
    mediaType: item.videoUrl ? "video" : "audio",
    creator: {
      name: item.author,
      handle: item.author
    },
    sourceProvider: "youtube", // Default value, could be enhanced
    bucket: item.bucket,
    tags: item.tags || [],
    transcript: "", // Empty transcript for search results
    scores: {
      finalScore: item.score || 0,
      likes: item.likes || 0,
      comments: item.comments || 0,
      views: item.views || 0
    },
    createdAt: item.createdAt || new Date().toISOString()
  };
}

function FeedItemCard({
  item,
  status,
  allowAutoPlay,
  eagerMedia,
  registerAutoPlayCandidate,
  onSetStatus,
  onOpenQuiz,
  onDeleteSuccess,
}: {
  item: FeedItem;
  status?: LearningStatus;
  allowAutoPlay: boolean;
  eagerMedia: boolean;
  registerAutoPlayCandidate?: (key: string, element: HTMLElement | null) => void;
  onSetStatus: (status: LearningStatus) => void;
  onOpenQuiz: (contentId: string) => void;
  onDeleteSuccess?: (contentId: string) => void;
}) {
  const location = useLocation();
  const [directVideoOrientation, setDirectVideoOrientation] = useState<'portrait' | 'landscape' | 'square' | null>(null);
  const { mediaSoundEnabled, activateMediaSound } = useVideoPlayer();
  const isTikTokVideo = item.mediaUrl?.includes('tiktok.com');
  const isYouTubeVideo = Boolean(item.mediaUrl && extractYouTubeVideoId(item.mediaUrl));
  const isYouTubeShortFormVideo = useIsYouTubeShortFormVideo(
    isYouTubeVideo ? item.mediaUrl : null,
    item.thumbnailUrl
  );
  const isShortFormVideo = isTikTokVideo || isYouTubeShortFormVideo || directVideoOrientation === 'portrait';
  const { elementRef: mediaRef, isNearViewport } = useNearViewport<HTMLDivElement>("800px");
  const shouldMountMedia = eagerMedia || isNearViewport;
  const returnTo = `${location.pathname}${location.search}${location.hash}`;
  const detailRouteState = {
    returnTo,
    source: "feed" as const,
    contentId: item.id,
    contentSnapshot: feedItemToContentSnapshot(item)
  };
  const registerArticleRef = useCallback((element: HTMLElement | null) => {
    if (item.mediaType !== "video") return;
    registerAutoPlayCandidate?.(item.id, element);
  }, [item.id, item.mediaType, registerAutoPlayCandidate]);

  const saveReturnState = () => {
    sessionStorage.setItem(FEED_RETURN_STATE_KEY, JSON.stringify({
      contentId: item.id,
      scrollY: window.scrollY
    }));
    preloadMediaCandidate({ mediaUrl: item.mediaUrl, thumbnailUrl: item.thumbnailUrl, sourceProvider: item.sourceProvider }, "immediate");
  };

  return (
    <article
      ref={registerArticleRef}
      className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.035]"
      data-feed-content-id={item.id}
      onPointerEnter={() => preloadMediaCandidate({ mediaUrl: item.mediaUrl, thumbnailUrl: item.thumbnailUrl, sourceProvider: item.sourceProvider })}
      onFocus={() => preloadMediaCandidate({ mediaUrl: item.mediaUrl, thumbnailUrl: item.thumbnailUrl, sourceProvider: item.sourceProvider })}
    >
      <div ref={mediaRef} className={`relative ${isShortFormVideo ? 'h-[400px]' : 'aspect-video'} overflow-hidden bg-stone/25`}>
        {item.mediaType === 'video' && item.mediaUrl && shouldMountMedia ? (
          <div className="h-full w-full">
            {isYouTubeVideo ? (
              <YouTubeVideoWrapper
                videoUrl={item.mediaUrl}
                title={item.title}
                allowAutoPlay={allowAutoPlay}
                mediaSoundEnabled={mediaSoundEnabled}
                loading={eagerMedia || allowAutoPlay ? "eager" : "lazy"}
              />
            ) : (
              <RedditVideoPlayer
                src={item.mediaUrl}
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
          <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" loading={eagerMedia ? "eager" : "lazy"} decoding="async" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,_rgba(197,162,76,0.18),_rgba(24,93,83,0.2),_rgba(96,65,130,0.16))]">
            <Play className="h-8 w-8 text-sand/65" aria-hidden="true" />
          </div>
        )}
        <span className={`absolute left-2 top-2 rounded-md border px-2 py-1 text-xs ${getStatusStyle(status)}`}>
          {getStatusLabel(status)}
        </span>
      </div>

      <div className="p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-sand/52">
          <span>{item.sourceProvider}</span>
          <span>·</span>
          <span>{item.bucket}</span>
          {item.tags?.slice(0, 2).map((tag, tagIndex) => (
            <span key={`tag-${tagIndex}`} className="rounded-md bg-white/[0.06] px-2 py-1">
              {String(tag)}
            </span>
          ))}
        </div>

        <Link
          to={`/content/${item.id}`}
          state={detailRouteState}
          onClick={saveReturnState}
          className="group"
        >
          <h2 className="line-clamp-2 text-lg font-semibold leading-6 text-white group-hover:text-gold">
            {item.title}
          </h2>
        </Link>

        {(item.summary || item.description) && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-sand/70">
            {item.summary || item.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to={`/content/${item.id}`}
            state={detailRouteState}
            onClick={saveReturnState}
            className="inline-flex items-center gap-2 rounded-md bg-gold px-3 py-2 text-sm font-semibold text-ink transition hover:bg-gold/90"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            Ouvrir
          </Link>
          <button
            type="button"
            onClick={() => onSetStatus("learned")}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
              status === "learned"
                ? "border-emerald-300/35 bg-emerald-400/16 text-emerald-50"
                : "border-white/10 bg-white/[0.04] text-sand/72 hover:bg-white/[0.08]"
            }`}
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Vu
          </button>
          <button
            type="button"
            onClick={() => onSetStatus("review")}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
              status === "review"
                ? "border-amber-300/35 bg-amber-400/16 text-amber-50"
                : "border-white/10 bg-white/[0.04] text-sand/72 hover:bg-white/[0.08]"
            }`}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Plus tard
          </button>
          <button
            type="button"
            onClick={() => onOpenQuiz(item.id)}
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-sand/72 transition hover:bg-white/[0.08]"
            title="Vérifier ta compréhension"
          >
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
            Vérifier
          </button>
          <AdminDeleteButton contentId={item.id} title={item.title} onDeleteSuccess={onDeleteSuccess} />
        </div>
      </div>
    </article>
  );
}

export function FeedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const feedRestoreHandledRef = useRef(false);
  const isDesktopFeed = useIsDesktopFeed();
  const initialUrlQuery = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("q") ?? ""
    : "";
  const [searchQuery, setSearchQuery] = useState(initialUrlQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteGlobalFeed();
  const [learningState, setLearningState] = useState<LearningState>({});
  const [serverSummary, setServerSummary] = useState<LearningSummary | null>(null);
  const [quizContentId, setQuizContentId] = useState<string | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]); // Chargement depuis l'API
  const [deletedContentIds, setDeletedContentIds] = useState<Set<string>>(new Set());
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  
  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items).filter((item) => item?.id && !deletedContentIds.has(item.id)) ?? [],
    [data, deletedContentIds]
  );
  const contentIds = useMemo(() => items.map((item) => item.id), [items]);
  const { activeKey: activeAutoPlayId, registerElement: registerAutoPlayElement } = useSingleActiveMedia<string>({
    enabled: !isDesktopFeed,
    minimumVisibleRatio: 0.6
  });

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
      const results = await contentService.searchContent(query);
      if (results.items.length > 0) {
        setSearchResults(results.items);
        return;
      }

      const normalizedQuery = query
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      if (normalizedQuery !== query) {
        const normalizedResults = await contentService.searchContent(normalizedQuery);
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

  // Sync search query with URL params
  useEffect(() => {
    const urlQuery = new URLSearchParams(location.search).get("q") ?? "";
    if (urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
    }
  }, [location.search]);

  // Update URL when search query changes
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

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setLearningState(readLearningState());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(learningState));
  }, [learningState]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasNextPage || isFetchingNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void fetchNextPage();
        }
      },
      { rootMargin: "700px 0px" }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Charger les sponsors depuis l'API
  useEffect(() => {
    async function loadSponsors() {
      try {
        const result = await getActiveSponsors(10);
        setSponsors(result.sponsors);
      } catch (error) {
        console.error("Erreur lors du chargement des sponsors:", error);
        // Pas de fallback - afficher uniquement les sponsors réels de la base de données
      }
    }

    void loadSponsors();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || contentIds.length === 0) {
      return;
    }

    let cancelled = false;

    void getLearningProgress(contentIds)
      .then((progress) => {
        if (cancelled) return;

        setServerSummary(progress.summary);
        setLearningState((current) => {
          const next = { ...current };
          for (const item of progress.items) {
            next[item.contentId] = item.status;
          }
          return next;
        });
      })
      .catch((loadError) => {
        console.error("Learning progress load failed:", loadError);
      });

    return () => {
      cancelled = true;
    };
  }, [contentIds, isAuthenticated]);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    preloadMediaBatch(
      items.slice(0, 6).map((item) => ({
        mediaUrl: item.mediaUrl,
        thumbnailUrl: item.thumbnailUrl,
        sourceProvider: item.sourceProvider
      }))
    );
  }, [items]);

  useEffect(() => {
    const routeState = location.state as {
      restoreSource?: string;
      restoreContentId?: string;
    } | null;

    if (routeState?.restoreSource !== "feed" || items.length === 0) {
      return;
    }

    if (feedRestoreHandledRef.current) {
      return;
    }
    feedRestoreHandledRef.current = true;

    let savedState: { contentId?: string; scrollY?: number } = {};
    try {
      savedState = JSON.parse(sessionStorage.getItem(FEED_RETURN_STATE_KEY) || "{}");
    } catch {
      savedState = {};
    }

    const contentId = routeState.restoreContentId ?? savedState.contentId;
    const scrollY = savedState.scrollY;

    window.requestAnimationFrame(() => {
      const target = contentId
        ? Array.from(document.querySelectorAll<HTMLElement>("[data-feed-content-id]"))
            .find((element) => element.dataset.feedContentId === contentId)
        : null;

      if (target) {
        target.scrollIntoView({ block: "center" });
      } else if (typeof scrollY === "number") {
        window.scrollTo({ top: scrollY });
      }

      sessionStorage.removeItem(FEED_RETURN_STATE_KEY);
    });
  }, [items.length, location.state]);

  // Scroll detection for search results context indicator
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const isScrolled = scrollY > 200; // Show indicator after scrolling 200px
      const shouldShow = Boolean(searchQuery) && isScrolled;
      
      setShowScrollIndicator(shouldShow);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [searchQuery]);

  const localMarkedCount = useMemo(
    () => items.filter((item) => learningState[item.id] === "learned" || learningState[item.id] === "review").length,
    [items, learningState]
  );

  // Combiner les items du feed avec les sponsors et les quiz récap
  const feedWithInjections = useMemo(() => {
    const result: FeedWithInjections[] = [];
    let sponsorIndex = 0;
    let learnedSinceLastRecap = 0;

    for (let i = 0; i < items.length; i++) {
      result.push(items[i]);

      // Track learned items for recap quiz trigger
      if (learningState[items[i].id] === "learned") {
        learnedSinceLastRecap++;
      }

      // Inject quiz recap after every 3 learned items
      if (learnedSinceLastRecap >= 3) {
        const last3Learned = items
          .slice(0, i + 1)
          .filter((item) => learningState[item.id] === "learned")
          .slice(-3)
          .map((item) => item.id);

        if (last3Learned.length === 3) {
          result.push({
            type: "quiz_recap" as const,
            contentIds: last3Learned
          });
          learnedSinceLastRecap = 0; // Reset counter
        }
      }

      // Insérer un sponsor tous les 4 items
      if ((i + 1) % 4 === 0 && sponsorIndex < sponsors.length) {
        result.push({
          type: 'sponsor' as const,
          data: sponsors[sponsorIndex]
        });
        sponsorIndex++;

        // Incrémenter les impressions pour ce sponsor
        void incrementSponsorStats(sponsors[sponsorIndex - 1].id, 'impressions');
      }
    }

    return result;
  }, [items, sponsors, learningState]);

  const markedCount = serverSummary ? serverSummary.learned + serverSummary.review : localMarkedCount;

  const setStatus = (itemId: string, status: LearningStatus) => {
    setLearningState((current) => ({ ...current, [itemId]: status }));

    if (!isAuthenticated) {
      return;
    }

    void updateLearningProgress({ contentId: itemId, status })
      .then((result) => {
        setServerSummary(result.summary);
        setLearningState((current) => ({
          ...current,
          [result.progress.contentId]: result.progress.status
        }));
      })
      .catch((saveError) => {
        console.error("Learning progress save failed:", saveError);
      });
  };

  return (
    <>
      <SEO pageKey="home" />
      <main className="min-h-screen px-4 pb-28 pt-4 lg:px-0 lg:pb-12" aria-label="MAATFEED">
        <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-gold/78">Pour toi</p>
            <h1 className="mt-2 font-display text-4xl text-white lg:text-5xl">MAATFEED</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-sand/68">
              Ta sélection du moment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* markedCount supprimé pour nettoyer l'interface */}
          </div>
        </section>

        {/* Search Bar */}
        <section className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-sand/40" />
            <input
              type="text"
              placeholder="Rechercher dans le feed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-sand/40 focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-transparent"
            />
            {searchQuery && !isSearching && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-sand/40 hover:text-white transition-colors"
                aria-label="Effacer la recherche"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </section>

        <section className="mb-6 rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-sand/58">Explorer par theme</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {seoTopics.map((topic) => (
              <Link
                key={topic.slug}
                to={`/${topic.slug}`}
                className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-sand/74 transition hover:bg-white/[0.08] hover:text-white"
              >
                {topic.shortTitle}
              </Link>
            ))}
          </div>
        </section>

        {searchQuery ? (
          // Search results view
          <>
            {isSearching ? (
              <LoadingState message="Recherche en cours..." />
            ) : searchResults.length > 0 ? (
              <>
                <h2 className="text-lg font-semibold text-white mb-4">
                  Résultats pour "{searchQuery}"
                </h2>
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {searchResults.map((item, index) => {
                    const feedItem = contentItemToFeedItem(item);
                    return (
                      <FeedItemCard
                        key={`search-${item.id}`}
                        item={feedItem}
                        status={learningState[item.id]}
                        allowAutoPlay={false}
                        eagerMedia={index < 3}
                        registerAutoPlayCandidate={registerAutoPlayElement}
                        onSetStatus={(status) => setStatus(item.id, status)}
                        onOpenQuiz={(contentId) => setQuizContentId(contentId)}
                        onDeleteSuccess={handleContentDeleted}
                      />
                    );
                  })}
                </section>
              </>
            ) : (
              <EmptyState
                title="Aucun résultat"
                description="Essaie un sujet plus précis."
              />
            )}
          </>
        ) : (
          // Normal feed view
          <>
            {isLoading && <LoadingState message="Chargement..." />}

            {error && (
              <ErrorState
                message={`Le fil n'a pas pu se charger : ${error.message}`}
                onRetry={() => void refetch()}
              />
            )}

            {!isLoading && !error && items.length === 0 && (
              <EmptyState
                title="Aucun contenu disponible"
                description="Reviens après la prochaine mise à jour."
              />
            )}

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {feedWithInjections.map((item, index) => {
                if ('type' in item && item.type === 'sponsor') {
                  return (
                    <SponsorCard
                      key={`sponsor-${item.data.id}-${index}`}
                      sponsor={item.data}
                    />
                  );
                }

                if ('type' in item && item.type === 'quiz_recap') {
                  return (
                    <QuizRecapCard
                      key={`quiz-recap-${index}`}
                      contentIds={item.contentIds}
                      onComplete={() => {
                        // Optional: track completion or refresh state
                      }}
                    />
                  );
                }

                const feedItem = item as FeedItem;
                const shouldAutoPlay = false;

                return (
                  <FeedItemCard
                    key={`feed-${feedItem.id}`}
                    item={feedItem}
                    status={learningState[feedItem.id]}
                    allowAutoPlay={shouldAutoPlay}
                    eagerMedia={index < 3}
                    registerAutoPlayCandidate={registerAutoPlayElement}
                    onSetStatus={(status) => setStatus(feedItem.id, status)}
                    onOpenQuiz={(contentId) => setQuizContentId(contentId)}
                    onDeleteSuccess={handleContentDeleted}
                  />
                );
              })}
            </section>
          </>
        )}

        {!isLoading && !error && items.length > 0 && (
          <div ref={loadMoreRef} className="flex min-h-24 items-center justify-center py-6">
            {isFetchingNextPage && <LoadingState message="Chargement de la suite..." />}
            {!hasNextPage && (
              <p className="text-sm text-sand/52">
                Tu as parcouru toute la sélection disponible.
              </p>
            )}
          </div>
        )}

        <QuizModal
          contentId={quizContentId ?? ""}
          isOpen={quizContentId != null}
          onClose={() => setQuizContentId(null)}
          onSuccess={(correct) => {
            // Quiz submission already updates learning progress via API
            if (quizContentId) {
              setLearningState((current) => ({
                ...current,
                [quizContentId]: correct ? "learned" : "review"
              }));
            }
          }}
        />

        
        {/* Floating Search Results Indicator */}
        {showScrollIndicator && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999] flex items-center gap-2 bg-ember/90 backdrop-blur-sm text-white px-6 py-2 rounded-full shadow-lg border border-white/20 transition-all duration-300 whitespace-nowrap min-w-fit">
            <Search className="w-4 h-4" />
            <span className="text-sm font-medium">
              Résultats pour "{searchQuery}"
            </span>
            <button
              onClick={() => setSearchQuery("")}
              className="ml-2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              aria-label="Effacer la recherche"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </main>
    </>
  );
}
