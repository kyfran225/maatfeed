import { useState, useEffect } from 'react';

interface BreakpointValues {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isUltraWide: boolean;
}

const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
  largeDesktop: 1536,
  ultraWide: 1920
};

export const useResponsive = (): BreakpointValues => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: windowSize.width < breakpoints.mobile,
    isTablet: windowSize.width >= breakpoints.mobile && windowSize.width < breakpoints.desktop,
    isDesktop: windowSize.width >= breakpoints.desktop && windowSize.width < breakpoints.largeDesktop,
    isLargeDesktop: windowSize.width >= breakpoints.largeDesktop && windowSize.width < breakpoints.ultraWide,
    isUltraWide: windowSize.width >= breakpoints.ultraWide
  };
};
