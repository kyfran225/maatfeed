import { useCallback, useEffect, useRef, useState } from "react";

interface UseActiveMediaOptions {
  onEnter: (index: number) => void;
  threshold?: number;
}

export function useActiveMedia({ onEnter, threshold = 0.5 }: UseActiveMediaOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRefs = useRef<Map<Element, number>>(new Map());

  const observeElement = useCallback((element: Element, index: number) => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const elementIndex = elementRefs.current.get(entry.target);
              if (elementIndex !== undefined) {
                onEnter(elementIndex);
              }
            }
          });
        },
        { threshold }
      );
    }

    elementRefs.current.set(element, index);
    observerRef.current.observe(element);
  }, [onEnter, threshold]);

  const unobserveElement = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element);
    }
    elementRefs.current.delete(element);
  }, []);

  return {
    observeElement,
    unobserveElement,
  };
}

interface UseSingleActiveMediaOptions {
  enabled?: boolean;
  minimumVisibleRatio?: number;
  rootMargin?: string;
}

interface ObservedMedia<Key> {
  key: Key;
  ratio: number;
  isIntersecting: boolean;
  distanceFromViewportCenter: number;
}

const ACTIVE_MEDIA_THRESHOLDS = [0, 0.25, 0.5, 0.6, 0.75, 0.9, 1];

export function useSingleActiveMedia<Key extends string | number>({
  enabled = true,
  minimumVisibleRatio = 0.6,
  rootMargin = "0px"
}: UseSingleActiveMediaOptions = {}) {
  const [activeKey, setActiveKey] = useState<Key | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsByKeyRef = useRef<Map<Key, HTMLElement>>(new Map());
  const entriesByElementRef = useRef<Map<Element, ObservedMedia<Key>>>(new Map());

  const chooseActiveMedia = useCallback(() => {
    if (!enabled) {
      setActiveKey(null);
      return;
    }

    let best: ObservedMedia<Key> | null = null;

    for (const candidate of entriesByElementRef.current.values()) {
      if (!candidate.isIntersecting || candidate.ratio < minimumVisibleRatio) {
        continue;
      }

      if (
        !best ||
        candidate.ratio > best.ratio ||
        (
          candidate.ratio === best.ratio &&
          candidate.distanceFromViewportCenter < best.distanceFromViewportCenter
        )
      ) {
        best = candidate;
      }
    }

    setActiveKey((current) => {
      const next = best?.key ?? null;
      return current === next ? current : next;
    });
  }, [enabled, minimumVisibleRatio]);

  const disconnectObserver = useCallback(() => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    entriesByElementRef.current.clear();
  }, []);

  const ensureObserver = useCallback(() => {
    if (!enabled || observerRef.current || typeof IntersectionObserver === "undefined") {
      return observerRef.current;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const viewportCenter = window.innerHeight / 2;

        for (const entry of entries) {
          const key = Array.from(elementsByKeyRef.current.entries())
            .find(([, element]) => element === entry.target)?.[0];

          if (key === undefined) {
            entriesByElementRef.current.delete(entry.target);
            continue;
          }

          const elementCenter = entry.boundingClientRect.top + entry.boundingClientRect.height / 2;
          entriesByElementRef.current.set(entry.target, {
            key,
            ratio: entry.intersectionRatio,
            isIntersecting: entry.isIntersecting,
            distanceFromViewportCenter: Math.abs(elementCenter - viewportCenter)
          });
        }

        chooseActiveMedia();
      },
      {
        root: null,
        rootMargin,
        threshold: ACTIVE_MEDIA_THRESHOLDS
      }
    );

    return observerRef.current;
  }, [chooseActiveMedia, enabled, rootMargin]);

  useEffect(() => {
    if (!enabled) {
      disconnectObserver();
      setActiveKey(null);
      return;
    }

    const observer = ensureObserver();
    if (!observer) {
      setActiveKey(null);
      return;
    }

    elementsByKeyRef.current.forEach((element) => observer.observe(element));

    return () => {
      disconnectObserver();
    };
  }, [disconnectObserver, enabled, ensureObserver]);

  const registerElement = useCallback((key: Key, element: HTMLElement | null) => {
    const previousElement = elementsByKeyRef.current.get(key);

    if (previousElement && previousElement !== element) {
      observerRef.current?.unobserve(previousElement);
      entriesByElementRef.current.delete(previousElement);
      elementsByKeyRef.current.delete(key);
    }

    if (!element) {
      setActiveKey((current) => current === key ? null : current);
      chooseActiveMedia();
      return;
    }

    elementsByKeyRef.current.set(key, element);
    ensureObserver()?.observe(element);
    chooseActiveMedia();
  }, [chooseActiveMedia, ensureObserver]);

  return {
    activeKey,
    registerElement
  };
}
