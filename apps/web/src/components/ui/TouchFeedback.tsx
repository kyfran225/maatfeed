import { motion } from "framer-motion";
import { ReactNode, useState } from "react";

interface TouchFeedbackProps {
  children: ReactNode;
  className?: string;
  scale?: number;
  onTap?: () => void;
  onTapStart?: () => void;
  onTapEnd?: () => void;
  hapticFeedback?: boolean;
  disabled?: boolean;
}

// Haptic feedback simulation for mobile devices
const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'heavy':
        navigator.vibrate(50);
        break;
    }
  }
};

export function TouchFeedback({ 
  children, 
  className = "",
  scale = 0.95,
  onTap,
  onTapStart,
  onTapEnd,
  hapticFeedback = true,
  disabled = false
}: TouchFeedbackProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleTapStart = () => {
    if (disabled) return;
    setIsPressed(true);
    onTapStart?.();
    if (hapticFeedback) {
      triggerHapticFeedback('light');
    }
  };

  const handleTapEnd = () => {
    if (disabled) return;
    setIsPressed(false);
    onTapEnd?.();
  };

  const handleTap = () => {
    if (disabled) return;
    onTap?.();
    if (hapticFeedback) {
      triggerHapticFeedback('medium');
    }
  };

  return (
    <motion.div
      className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${isPressed ? 'touch-manipulation' : ''}`}
      whileTap={!disabled ? { scale } : {}}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      transition={{ 
        duration: 0.1,
        type: "spring",
        stiffness: 400,
        damping: 17
      }}
      onTapStart={handleTapStart}
      onTap={handleTap}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onMouseDown={handleTapStart}
      onMouseUp={handleTapEnd}
      onMouseLeave={handleTapEnd}
      onTouchStart={handleTapStart}
      onTouchEnd={handleTapEnd}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleTap();
        }
      }}
    >
      {children}
    </motion.div>
  );
}
