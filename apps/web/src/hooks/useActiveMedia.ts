import { useRef, useCallback } from "react";

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
