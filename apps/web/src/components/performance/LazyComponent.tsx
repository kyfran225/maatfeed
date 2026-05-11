import React, { Suspense, lazy, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LazyComponentProps {
  loader: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  delay?: number;
  rootMargin?: string;
  threshold?: number;
}

const defaultFallback = (
  <div className="flex items-center justify-center p-8">
    <motion.div
      className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

export function LazyComponent({ 
  loader, 
  fallback = defaultFallback,
  delay = 0,
  rootMargin = "50px",
  threshold = 0.1
}: LazyComponentProps) {
  const LazyComponent = lazy(() => {
    if (delay > 0) {
      return new Promise<{ default: React.ComponentType<any> }>(resolve => {
        setTimeout(() => {
          loader().then(resolve);
        }, delay);
      });
    }
    return loader();
  });

  return (
    <Suspense fallback={fallback}>
      <LazyComponent />
    </Suspense>
  );
}

// Hook pour détecter l'intersection observer
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef, options]);

  return isIntersecting;
}

// Composant de lazy loading avec intersection observer
export function LazyIntersectionComponent({
  loader,
  fallback = defaultFallback,
  rootMargin = "100px",
  threshold = 0.1,
  children
}: LazyComponentProps & { children?: React.ReactNode }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const shouldLoad = useIntersectionObserver(elementRef, { rootMargin, threshold });

  if (!shouldLoad) {
    return (
      <div ref={elementRef} className="lazy-load-placeholder">
        {fallback}
      </div>
    );
  }

  return (
    <div ref={elementRef}>
      <LazyComponent loader={loader} fallback={fallback} />
    </div>
  );
}
