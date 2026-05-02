import { useDragControls, motion, PanInfo } from 'framer-motion';
import { ReactNode, useRef, useCallback } from 'react';

interface SwipeGesturesProps {
  children: ReactNode;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  threshold?: number;
  velocityThreshold?: number;
  preventDefault?: boolean;
  className?: string;
  disabled?: boolean;
}

export const SwipeGestures: React.FC<SwipeGesturesProps> = ({
  children,
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  onSwipeStart,
  onSwipeEnd,
  threshold = 50,
  velocityThreshold = 500,
  preventDefault = true,
  className = '',
  disabled = false
}) => {
  const dragControls = useDragControls();
  const startTime = useRef(0);
  const isDragging = useRef(false);

  const handleDragStart = useCallback((event: any) => {
    if (disabled) return;
    
    startTime.current = Date.now();
    isDragging.current = true;
    
    if (preventDefault && event.cancelable) {
      event.preventDefault();
    }
    
    onSwipeStart?.();
  }, [disabled, preventDefault, onSwipeStart]);

  const handleDrag = useCallback((event: any, info: PanInfo) => {
    if (disabled || !isDragging.current) return;
    
    // Provide haptic feedback during drag
    if ('vibrate' in navigator && Math.abs(info.velocity.y) > 1000) {
      navigator.vibrate(5);
    }
  }, [disabled]);

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    if (disabled || !isDragging.current) return;
    
    isDragging.current = false;
    const duration = Date.now() - startTime.current;
    
    const { offset, velocity } = info;
    
    // Check both distance and velocity for more responsive swipes
    const isVerticalSwipe = Math.abs(offset.y) > Math.abs(offset.x);
    const isHorizontalSwipe = Math.abs(offset.x) > Math.abs(offset.y);
    
    // Vertical swipe detection
    if (isVerticalSwipe) {
      const isFastSwipe = Math.abs(velocity.y) > velocityThreshold;
      const isFarSwipe = Math.abs(offset.y) > threshold;
      
      if (offset.y < -threshold && (isFastSwipe || isFarSwipe) && onSwipeUp) {
        onSwipeUp();
      } else if (offset.y > threshold && (isFastSwipe || isFarSwipe) && onSwipeDown) {
        onSwipeDown();
      }
    }
    // Horizontal swipe detection
    else if (isHorizontalSwipe) {
      const isFastSwipe = Math.abs(velocity.x) > velocityThreshold;
      const isFarSwipe = Math.abs(offset.x) > threshold;
      
      if (offset.x > threshold && (isFastSwipe || isFarSwipe) && onSwipeLeft) {
        onSwipeLeft();
      } else if (offset.x < -threshold && (isFastSwipe || isFarSwipe) && onSwipeRight) {
        onSwipeRight();
      }
    }
    
    onSwipeEnd?.();
  }, [disabled, threshold, velocityThreshold, onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight, onSwipeEnd]);

  return (
    <motion.div
      className={`${className} ${disabled ? 'touch-none' : 'touch-manipulation'}`}
      drag="y"
      dragControls={dragControls}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      dragMomentum={false}
      dragTransition={{ 
        bounceStiffness: 300, 
        bounceDamping: 30,
        power: 0.3,
        timeConstant: 200
      }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      tabIndex={disabled ? -1 : 0}
      role="application"
      aria-label="Swipeable content"
    >
      {children}
    </motion.div>
  );
};

export default SwipeGestures;
