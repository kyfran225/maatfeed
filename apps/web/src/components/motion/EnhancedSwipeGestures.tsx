import { motion, PanInfo, useAnimation } from 'framer-motion';
import { ReactNode, useRef, useState, useEffect } from 'react';

interface EnhancedSwipeGesturesProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  threshold?: number;
  disabled?: boolean;
  hapticFeedback?: boolean;
  visualFeedback?: boolean;
  className?: string;
}

export const EnhancedSwipeGestures: React.FC<EnhancedSwipeGesturesProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onSwipeStart,
  onSwipeEnd,
  threshold = 50,
  disabled = false,
  hapticFeedback = true,
  visualFeedback = true,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);
  const controls = useAnimation();
  const dragStartTime = useRef(0);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const triggerHaptic = (intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!hapticFeedback) return;
    
    if ('vibrate' in navigator) {
      const duration = {
        light: 10,
        medium: 25,
        heavy: 50
      }[intensity];
      
      navigator.vibrate(duration);
    }
  };

  const handleDragStart = () => {
    if (disabled) return;
    
    setIsDragging(true);
    dragStartTime.current = Date.now();
    onSwipeStart?.();
    
    if (visualFeedback) {
      controls.start({
        scale: 0.98,
        transition: { type: 'spring', stiffness: 400, damping: 25 }
      });
    }
  };

  const handleDrag = (event: any, info: PanInfo) => {
    if (disabled) return;
    
    const { offset } = info;
    const absX = Math.abs(offset.x);
    const absY = Math.abs(offset.y);
    
    // Determine primary direction
    if (absX > absY) {
      setDragDirection(offset.x > 0 ? 'right' : 'left');
    } else {
      setDragDirection(offset.y > 0 ? 'down' : 'up');
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (disabled) return;
    
    setIsDragging(false);
    const dragDuration = Date.now() - dragStartTime.current;
    const { offset, velocity } = info;
    
    // Reset visual feedback
    if (visualFeedback) {
      controls.start({
        scale: 1,
        x: 0,
        y: 0,
        transition: { type: 'spring', stiffness: 400, damping: 30 }
      });
    }
    
    // Determine swipe based on offset and velocity
    const swipeThreshold = threshold;
    const velocityThreshold = 300; // pixels per second
    
    let swipeDetected = false;
    
    if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > velocityThreshold) {
      if (offset.x > 0) {
        onSwipeRight?.();
        swipeDetected = true;
      } else {
        onSwipeLeft?.();
        swipeDetected = true;
      }
    } else if (Math.abs(offset.y) > swipeThreshold || Math.abs(velocity.y) > velocityThreshold) {
      if (offset.y > 0) {
        onSwipeDown?.();
        swipeDetected = true;
      } else {
        onSwipeUp?.();
        swipeDetected = true;
      }
    }
    
    if (swipeDetected) {
      triggerHaptic('light');
    }
    
    setDragDirection(null);
    onSwipeEnd?.();
  };

  // Visual feedback based on drag direction
  const getVisualFeedback = () => {
    if (!visualFeedback || !isDragging || !dragDirection) return {};
    
    const feedbackConfig = {
      left: { x: -10, rotate: -2, opacity: 0.8 },
      right: { x: 10, rotate: 2, opacity: 0.8 },
      up: { y: -10, scale: 0.95, opacity: 0.8 },
      down: { y: 10, scale: 0.95, opacity: 0.8 }
    };
    
    return feedbackConfig[dragDirection];
  };

  return (
    <motion.div
      className={className}
      drag={!disabled}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      animate={controls}
      style={{ touchAction: 'none' }}
    >
      {/* Swipe Indicator Overlay */}
      {visualFeedback && isDragging && dragDirection && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Direction Indicator */}
          <motion.div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ${
              dragDirection === 'left' ? '-rotate-90' :
              dragDirection === 'right' ? 'rotate-90' :
              dragDirection === 'up' ? 'rotate-180' :
              'rotate-0'
            }`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M12 5L19 12L12 19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
          
          {/* Swipe Trail */}
          <motion.div
            className={`absolute top-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent ${
              dragDirection === 'left' ? 'right-1/2' :
              dragDirection === 'right' ? 'left-1/2' :
              dragDirection === 'up' ? 'left-1/2 -rotate-90' :
              'left-1/2 rotate-90'
            }`}
            animate={{
              opacity: [0, 0.6, 0],
              scaleX: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeOut'
            }}
          />
        </motion.div>
      )}
      
      {children}
    </motion.div>
  );
};

// Hook for keyboard navigation
export const useKeyboardNavigation = (
  onLeft?: () => void,
  onRight?: () => void,
  onUp?: () => void,
  onDown?: () => void,
  onSpace?: () => void,
  onEnter?: () => void
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          onLeft?.();
          break;
        case 'ArrowRight':
          event.preventDefault();
          onRight?.();
          break;
        case 'ArrowUp':
          event.preventDefault();
          onUp?.();
          break;
        case 'ArrowDown':
          event.preventDefault();
          onDown?.();
          break;
        case ' ':
          event.preventDefault();
          onSpace?.();
          break;
        case 'Enter':
          event.preventDefault();
          onEnter?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onLeft, onRight, onUp, onDown, onSpace, onEnter]);
};

export default EnhancedSwipeGestures;
