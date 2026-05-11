import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface JoystickNavigationProps {
  currentIndex: number;
  totalItems: number;
  onNavigate: (index: number) => void;
}

export function JoystickNavigation({ currentIndex, totalItems, onNavigate }: JoystickNavigationProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible buttons based on current position
  const getVisibleButtons = () => {
    const buttons = [];
    const maxVisible = 5; // 2 above + center + 2 below
    const centerButton = currentIndex;
    
    // Calculate range
    let start = Math.max(0, centerButton - 2);
    let end = Math.min(totalItems - 1, centerButton + 2);
    
    // Adjust to always show 5 buttons if possible
    if (end - start < 4) {
      if (start === 0) {
        end = Math.min(totalItems - 1, 4);
      } else if (end === totalItems - 1) {
        start = Math.max(0, totalItems - 5);
      }
    }
    
    for (let i = start; i <= end; i++) {
      buttons.push(i);
    }
    
    return buttons;
  };

  const visibleButtons = getVisibleButtons();

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStartY(e.touches[0].clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaY = dragStartY - e.clientY;
    const sensitivity = 5; // pixels per step
    
    if (Math.abs(deltaY) > sensitivity) {
      const steps = Math.floor(deltaY / sensitivity);
      const newIndex = Math.max(0, Math.min(currentIndex + steps, totalItems - 1));
      
      if (newIndex !== currentIndex) {
        onNavigate(newIndex);
        setDragStartY(e.clientY);
      }
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    
    const deltaY = dragStartY - e.touches[0].clientY;
    const sensitivity = 5; // pixels per step
    
    if (Math.abs(deltaY) > sensitivity) {
      const steps = Math.floor(deltaY / sensitivity);
      const newIndex = Math.max(0, Math.min(currentIndex + steps, totalItems - 1));
      
      if (newIndex !== currentIndex) {
        onNavigate(newIndex);
        setDragStartY(e.touches[0].clientY);
      }
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, dragStartY, currentIndex, totalItems]);

  const getButtonStyle = (index: number) => {
    const distance = Math.abs(index - currentIndex);
    const isCenter = index === currentIndex;
    
    let opacity = 1;
    let scale = 1;
    let backgroundColor = "bg-white/30";
    
    if (isCenter) {
      backgroundColor = "bg-yellow-400";
      scale = 1.5;
    } else if (distance === 1) {
      opacity = 0.8;
      scale = 1.2;
    } else if (distance === 2) {
      opacity = 0.6;
      scale = 1;
    } else {
      opacity = 0.3;
      scale = 0.8;
    }
    
    return {
      opacity,
      scale,
      backgroundColor,
      isActive: isCenter
    };
  };

  return (
    <div 
      ref={containerRef}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2 lg:right-4 select-none"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {visibleButtons.map((index) => {
        const style = getButtonStyle(index);
        
        return (
          <motion.button
            key={index}
            onClick={() => !isDragging && onNavigate(index)}
            className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full transition-all ${style.backgroundColor} ${
              style.isActive ? 'shadow-lg shadow-yellow-400/50' : ''
            }`}
            style={{ 
              opacity: style.opacity,
              scale: style.scale,
            }}
            whileHover={!isDragging ? { scale: style.scale * 1.2 } : {}}
            whileTap={!isDragging ? { scale: style.scale * 0.9 } : {}}
            aria-label={`Go to item ${index + 1}`}
            disabled={isDragging}
          />
        );
      })}
    </div>
  );
}
