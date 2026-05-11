import React, { ReactNode, useMemo, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation";

interface FeedViewportProps {
  children: ReactNode;
  className?: string;
  onActiveChange?: (index: number) => void;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

export function FeedViewport({ children, className = "", onActiveChange, onLoadMore, hasNextPage, isFetchingNextPage }: FeedViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const childrenArray = Array.isArray(children) ? children : [children];
  const activeIndexRef = useRef(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const itemElementsRef = useRef<Array<HTMLElement | null>>([]);
  const rafScrollRef = useRef<number | null>(null);

  const syncActiveIndexFromScroll = (container: HTMLDivElement) => {
    const itemHeight = container.clientHeight || 1;
    const rawIndex = Math.round(container.scrollTop / itemHeight);
    const nextIndex = Math.max(0, Math.min(rawIndex, childrenArray.length - 1));

    if (nextIndex !== activeIndexRef.current) {
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      onActiveChange?.(nextIndex);
    }
  };

  const renderWindow = useMemo(() => {
    const start = Math.max(0, activeIndex - 2);
    const end = Math.min(childrenArray.length - 1, activeIndex + 2);
    return { start, end };
  }, [activeIndex, childrenArray.length]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (childrenArray.length === 0) return;

    const raf = window.requestAnimationFrame(() => {
      syncActiveIndexFromScroll(container);
    });

    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [childrenArray.length]);

  // Use IntersectionObserver (rooted to the scroll container) to identify the active card.
  // This is more stable than scrollTop math when users scroll fast or when scroll snapping is mid-transition.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let bestIndex: number | null = null;
        let bestRatio = 0;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = Number((entry.target as HTMLElement).dataset.feedIndex);
          if (!Number.isFinite(idx)) continue;

          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIndex = idx;
          }
        }

        if (bestIndex != null && bestIndex !== activeIndexRef.current) {
          activeIndexRef.current = bestIndex;
          setActiveIndex(bestIndex);
          onActiveChange?.(bestIndex);
        }
      },
      {
        root: container,
        threshold: [0.4, 0.55, 0.7, 0.85],
      }
    );

    observerRef.current = observer;

    // Observe existing elements
    itemElementsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observerRef.current = null;
      observer.disconnect();
    };
  }, [childrenArray.length, onActiveChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      if (rafScrollRef.current != null) return;
      rafScrollRef.current = window.requestAnimationFrame(() => {
        rafScrollRef.current = null;

        const scrollTop = container.scrollTop;

        syncActiveIndexFromScroll(container);

        // Check if we're near the end and should load more
        if (onLoadMore && hasNextPage && !isFetchingNextPage) {
          const scrollHeight = container.scrollHeight;
          const clientHeight = container.clientHeight;
          const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

          // Load more when user is within 2 items of the end (80% scrolled)
          if (scrollPercentage > 0.8) {
            onLoadMore();
          }
        }

        // Clear previous timeout and set new one for scroll end detection
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }

        scrollTimeout = setTimeout(() => {
          // When scroll ends, correct position if needed
          const itemHeight = container.clientHeight;
          const maxScroll = (childrenArray.length - 1) * itemHeight;

          if (container.scrollTop > maxScroll + 10) {
            // Scrolled past last item, snap back
            container.scrollTo({
              top: maxScroll,
              behavior: 'smooth'
            });
          }
        }, 150);
      });
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (rafScrollRef.current != null) {
        window.cancelAnimationFrame(rafScrollRef.current);
        rafScrollRef.current = null;
      }
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [childrenArray.length, onLoadMore, hasNextPage, isFetchingNextPage]);

  const scrollToIndex = (index: number) => {
    const container = containerRef.current;
    if (!container) return;

    // Ensure index is within bounds
    const boundedIndex = Math.max(0, Math.min(index, childrenArray.length - 1));

    const itemHeight = container.clientHeight;
    const targetScrollTop = boundedIndex * itemHeight;

    // Only scroll if we're not already at the target position
    if (Math.abs(container.scrollTop - targetScrollTop) > 10) {
      container.scrollTo({
        top: targetScrollTop,
        behavior: "smooth"
      });
    }
  };

  const goToNext = () => {
    if (activeIndex < childrenArray.length - 1) {
      scrollToIndex(activeIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (activeIndex > 0) {
      scrollToIndex(activeIndex - 1);
    }
  };

  // Add keyboard navigation - only Space for play/pause
  useKeyboardNavigation({
    onPlayPause: () => {
      // Dispatch play/pause event to active card
      const activeCard = document.querySelector('[data-active="true"]') as HTMLElement;
      if (activeCard) {
        const playPauseBtn = activeCard.querySelector('[data-play-pause="true"]') as HTMLButtonElement;
        playPauseBtn?.click();
      }
    },
    onEscape: () => {
      // Navigate back to home or close overlays
      const overlay = document.querySelector('[data-overlay="true"]') as HTMLElement;
      if (overlay) {
        const closeBtn = overlay.querySelector('[data-close="true"]') as HTMLButtonElement;
        closeBtn?.click();
      }
    },
    enabled: childrenArray.length > 1 && !document.querySelector('[data-overlay="true"]')
  });

  return (
    <div 
      ref={containerRef}
      className={`relative h-screen w-full overflow-y-auto snap-y snap-mandatory scroll-smooth ${className}`}
      style={{ scrollbarWidth: "none", msOverflowStyle: "none", overscrollBehavior: "contain" }}
      role="feed"
      aria-label="Content feed"
      aria-orientation="vertical"
    >
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {childrenArray.map((child, index) => {
        const shouldRenderChild = index >= renderWindow.start && index <= renderWindow.end;
        
        // Generate a unique key for each child
        const childKey = React.isValidElement(child) && child.key ? 
          String(child.key) : 
          `child-${index}`;

        return (
          <motion.div
            key={childKey}
            className="w-full snap-start h-screen"
            ref={(el) => {
              const prev = itemElementsRef.current[index];
              if (prev && observerRef.current) {
                observerRef.current.unobserve(prev);
              }

              itemElementsRef.current[index] = el;

              if (el && observerRef.current) {
                observerRef.current.observe(el);
              }
            }}
            data-feed-index={index}
            initial={{ opacity: 0 }}
            animate={{
              opacity: activeIndex === index ? 1 : 0.3,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            role="article"
            aria-label={`Content item ${index + 1} of ${childrenArray.length}`}
            aria-setsize={childrenArray.length}
            aria-posinset={index + 1}
          >
            {shouldRenderChild ? child : null}
          </motion.div>
        );
      })}

      {/* Joystick Navigation */}
      {/* <JoystickNavigation
        currentIndex={activeIndex}
        totalItems={childrenArray.length}
        onNavigate={scrollToIndex}
      /> */}
    </div>
  );
}
