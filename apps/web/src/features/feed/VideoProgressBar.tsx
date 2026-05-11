import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface VideoProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  isActive: boolean;
  buffered?: number;
}

export function VideoProgressBar({
  currentTime,
  duration,
  onSeek,
  isActive,
  buffered = 0,
}: VideoProgressBarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedProgress = duration > 0 ? (buffered / duration) * 100 : 0;

  // Calculate time from position
  const calculateTimeFromPosition = useCallback(
    (clientX: number): number => {
      if (!progressRef.current || duration <= 0) return 0;
      const rect = progressRef.current.getBoundingClientRect();
      const position = (clientX - rect.left) / rect.width;
      const clampedPosition = Math.max(0, Math.min(1, position));
      return clampedPosition * duration;
    },
    [duration]
  );

  // Handle mouse/touch start
  const handleStart = useCallback(
    (clientX: number) => {
      setIsDragging(true);
      const position = (clientX - (progressRef.current?.getBoundingClientRect().left ?? 0)) / (progressRef.current?.getBoundingClientRect().width ?? 1);
      setHoverPosition(Math.max(0, Math.min(1, position)));
    },
    []
  );

  // Handle mouse/touch move
  const handleMove = useCallback(
    (clientX: number) => {
      if (!progressRef.current) return;
      const position = (clientX - progressRef.current.getBoundingClientRect().left) / progressRef.current.getBoundingClientRect().width;
      setHoverPosition(Math.max(0, Math.min(1, position)));
    },
    []
  );

  // Handle mouse/touch end
  const handleEnd = useCallback(() => {
    if (isDragging && hoverPosition !== null) {
      onSeek(hoverPosition * duration);
    }
    setIsDragging(false);
    setHoverPosition(null);
  }, [isDragging, hoverPosition, onSeek, duration]);

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const onMouseLeave = () => {
    setHoverPosition(null);
    if (isDragging) {
      handleEnd();
    }
  };

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    handleEnd();
  };

  // Global mouse up handler
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleEnd();
      }
    };

    if (isDragging) {
      window.addEventListener("mouseup", handleGlobalMouseUp);
      window.addEventListener("touchend", handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchend", handleGlobalMouseUp);
    };
  }, [isDragging, handleEnd]);

  if (!isActive || duration <= 0) return null;

  return (
    <div className="absolute bottom-[140px] left-0 right-0 z-[210]" data-ignore-play-toggle="true">
      {/* Progress bar container */}
      <div
        ref={progressRef}
        className="relative h-6 flex px-4 cursor-pointer select-none items-center"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onMouseUp={handleEnd}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Progress track */}
        <div className="relative flex-1 h-1.5 bg-white/20 rounded-full overflow-visible">
          {/* Buffered progress */}
          <motion.div
            className="absolute h-full bg-white/30 rounded-full"
            style={{ width: `${bufferedProgress}%` }}
            transition={{ duration: 0.3 }}
          />

          {/* Current progress */}
          <motion.div
            className="absolute h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
            style={{ width: `${progress}%` }}
            transition={isDragging ? { duration: 0 } : { duration: 0.3 }}
          />

          {/* Hover preview */}
          {hoverPosition !== null && !isDragging && (
            <div
              className="absolute top-0 h-full bg-white/50 rounded-full"
              style={{
                width: "2px",
                left: `${hoverPosition * 100}%`,
                transform: "translateX(-50%)",
              }}
            />
          )}

          {/* Thumb/Handle */}
          <motion.div
            className="absolute w-3 h-3 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing"
            style={{
              left: `${progress}%`,
              top: "-4px",
              transform: `translateX(-50%) scale(${isDragging ? 1.2 : 1})`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            }}
            animate={{
              scale: isDragging ? 1.2 : 1,
            }}
            transition={{ duration: 0.15 }}
          />
        </div>
      </div>
    </div>
  );
}
