import { motion, useAnimation } from 'framer-motion';
import { ReactNode } from 'react';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

interface TouchFeedbackProps {
  children: ReactNode;
  className?: string;
  scale?: number;
  disabled?: boolean;
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
  minTouchSize?: boolean;
}

export const TouchFeedback: React.FC<TouchFeedbackProps> = ({ 
  children, 
  className = '',
  scale = 0.95,
  disabled = false,
  hapticType = 'light',
  minTouchSize = false
}) => {
  const controls = useAnimation();
  const { triggerHaptic } = useHapticFeedback();

  const handleTapStart = () => {
    if (!disabled) {
      controls.start({ scale });
      triggerHaptic({ type: hapticType });
    }
  };

  const handleTapEnd = () => {
    if (!disabled) {
      controls.start({ scale: 1 });
    }
  };

  const handleTap = () => {
    if (!disabled) {
      triggerHaptic({ type: hapticType });
    }
  };

  return (
    <motion.div
      className={`${className} ${minTouchSize ? 'min-h-[44px] min-w-[44px]' : ''}`}
      animate={controls}
      onTapStart={handleTapStart}
      onTap={handleTap}
      onTapCancel={handleTapEnd}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: scale } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{ touchAction: 'manipulation' }}
    >
      {children}
    </motion.div>
  );
};

export default TouchFeedback;
