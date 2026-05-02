import { useState, useEffect, useMemo, useCallback } from "react";
import { SEO } from "../components/SEO";
import { useInfiniteGlobalFeed } from "../hooks/useFeed";
import { useSystemStatus } from "../hooks/useSystemStatus";
import { useAccessibility } from "../hooks/useAccessibility";
import { FeedViewport } from "../components/feed/FeedViewport";
import { EnhancedFeedCard } from "../components/feed/EnhancedFeedCard";
import { ErrorState as AnimatedErrorState } from "../components/motion/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";
import { FeedCardSkeleton } from "../components/ui/SkeletonLoader";
import { TouchFeedback } from "../components/motion/TouchFeedback";

export function FeedPage() {
  const { healthQuery, readinessQuery } = useSystemStatus();
  const { 
    data: feedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteGlobalFeed();

  const allItems = useMemo(() => {
    return feedData?.pages.flatMap(page => page.items?.filter(item => item != null && item.id != null) ?? []) ?? [];
  }, [feedData]);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleActiveChange = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const handleLoadMore = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  // Accessibility enhancements
  const { announce } = useAccessibility({
    announceChanges: true,
    arrowKeys: {
      up: () => setActiveIndex(prev => Math.max(0, prev - 1)),
      down: () => setActiveIndex(prev => Math.min(allItems.length - 1, prev + 1)),
      left: () => setActiveIndex(prev => Math.max(0, prev - 1)),
      right: () => setActiveIndex(prev => Math.min(allItems.length - 1, prev + 1))
    }
  });

  // Announce content changes for screen readers
  useEffect(() => {
    if (allItems.length > 0 && activeIndex >= 0 && activeIndex < allItems.length) {
      const currentItem = allItems[activeIndex];
      announce(`Showing content ${activeIndex + 1} of ${allItems.length}: ${currentItem.title || "Untitled content"}`, "polite");
    }
  }, [activeIndex, allItems, announce]);

  // Announce loading states
  useEffect(() => {
    if (isLoading) {
      announce('Loading content...', 'polite');
    } else if (error) {
      announce('Error loading content', 'assertive');
    } else if (allItems.length === 0) {
      announce('No content available', 'polite');
    }
  }, [isLoading, error, allItems.length, announce]);

  // Reset body scroll on mount to prevent white space after navigation from onboarding
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, []);

  return (
    <>
      <SEO pageKey="home" />
      <div className="relative w-full bg-black h-screen lg:h-full" role="main" aria-label="MAAT Feed - Cultural Content Platform">
        {/* Full-screen Feed Viewport */}
        <>
          {/* Feed Viewport - only when we have items */}
          {allItems.length > 0 && (
            <FeedViewport
              onActiveChange={handleActiveChange}
              onLoadMore={handleLoadMore}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
            >
              {allItems.map((item, index) => (
                <EnhancedFeedCard
                  key={item.id}
                  item={item}
                  index={index}
                  isActive={index === activeIndex}
                  nextItems={allItems.slice(index + 1, index + 4)}
                />
              ))}
            </FeedViewport>
          )}
          
          {/* Skeleton cards during initial load - show instead of feed when loading */}
          {isLoading && allItems.length === 0 && (
            <div className="absolute inset-0 bg-black">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="h-screen w-full flex items-center justify-center">
                  <FeedCardSkeleton />
                </div>
              ))}
            </div>
          )}
        </>
        {/* Error State */}
        {error && (
          <div className="absolute inset-0 bg-black">
            <AnimatedErrorState 
              message={`Erreur de chargement du fil : ${error.message}`}
              onRetry={() => window.location.reload()}
            />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && allItems.length === 0 && (
          <div className="absolute inset-0 bg-black">
            <EmptyState 
              title="Aucun contenu disponible"
              description="Revenez plus tard pour du nouveau contenu"
            />
          </div>
        )}

        {/* Enhanced System Status Overlay */}
        <div className="fixed top-40 left-4 z-20">
          <TouchFeedback hapticType="light" minTouchSize>
            <div className="backdrop-blur-md bg-black/50 rounded-2xl p-4 border border-white/10 hover:bg-black/60 transition-colors">
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    healthQuery.data?.status === "ok" ? "bg-green-400" : "bg-red-400"
                  } animate-pulse`} />
                  <span className="text-white/70">API</span>
                  <span className={`font-medium ${
                    healthQuery.data?.status === "ok" ? "text-green-400" : "text-red-400"
                  }`}>
                    {healthQuery.data?.status === "ok" ? "OK" : "ERREUR"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    readinessQuery.data?.status === "ready" ? "bg-green-400" : "bg-yellow-400"
                  } animate-pulse`} />
                  <span className="text-white/70">Système</span>
                  <span className={`font-medium ${
                    readinessQuery.data?.status === "ready" ? "text-green-400" : "text-yellow-400"
                  }`}>
                    {readinessQuery.data?.status === "ready" ? "Prêt" : "Chargement"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-white/70">Contenu</span>
                  <span className="font-medium text-blue-400">{allItems.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  <span className="text-white/70">Position</span>
                  <span className="font-medium text-purple-400">{activeIndex + 1}/{allItems.length}</span>
                </div>
              </div>
            </div>
          </TouchFeedback>
        </div>

        {/* Enhanced Navigation Controls - Hidden on Mobile */}
        <div className="fixed right-16 top-1/2 -translate-y-1/2 z-20 hidden md:flex">
          <div className="backdrop-blur-md bg-black/50 rounded-full p-2 border border-white/10">
            <div className="flex flex-col gap-2">
              <TouchFeedback hapticType="medium" minTouchSize>
                <button
                  onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
                  disabled={activeIndex === 0}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  aria-label="Vidéo précédente"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              </TouchFeedback>
              
              <div className="h-px bg-white/20 mx-2" />
              
              <TouchFeedback hapticType="medium" minTouchSize>
                <button
                  onClick={() => setActiveIndex(Math.min(allItems.length - 1, activeIndex + 1))}
                  disabled={activeIndex === allItems.length - 1}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  aria-label="Vidéo suivante"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </TouchFeedback>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
