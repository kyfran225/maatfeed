import { useEffect, useRef, useState } from "react";

export function useNearViewport<T extends HTMLElement>(rootMargin = "600px") {
  const elementRef = useRef<T | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
      setIsNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin]);

  return { elementRef, isNearViewport };
}
