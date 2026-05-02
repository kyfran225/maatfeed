import { motion } from "framer-motion";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "card" | "text" | "avatar" | "button";
  width?: string;
  height?: string;
  lines?: number;
}

export function SkeletonLoader({ 
  className = "", 
  variant = "card",
  width,
  height,
  lines = 3
}: SkeletonLoaderProps) {
  const baseClasses = "bg-gradient-to-r from-sand/20 via-sand/30 to-sand/20 rounded-lg";
  const animation = {
    animate: {
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: [0, 0, 1, 1] as const
    }
  };

  switch (variant) {
    case "card":
      return (
        <motion.div
          className={`${baseClasses} ${className}`}
          style={{ 
            width: width || "100%", 
            height: height || "200px",
            backgroundSize: "200% 100%"
          }}
          {...animation}
        />
      );
    
    case "text":
      return (
        <div className={`space-y-2 ${className}`}>
          {Array.from({ length: lines }).map((_, i) => (
            <motion.div
              key={i}
              className={`${baseClasses} h-4`}
              style={{ 
                width: i === lines - 1 ? "60%" : "100%",
                backgroundSize: "200% 100%"
              }}
              {...animation}
            />
          ))}
        </div>
      );
    
    case "avatar":
      return (
        <motion.div
          className={`${baseClasses} rounded-full ${className}`}
          style={{ 
            width: width || "40px", 
            height: height || "40px",
            backgroundSize: "200% 100%"
          }}
          {...animation}
        />
      );
    
    case "button":
      return (
        <motion.div
          className={`${baseClasses} rounded-full ${className}`}
          style={{ 
            width: width || "80px", 
            height: height || "32px",
            backgroundSize: "200% 100%"
          }}
          {...animation}
        />
      );
    
    default:
      return (
        <motion.div
          className={`${baseClasses} ${className}`}
          style={{ 
            width: width || "100%", 
            height: height || "100px",
            backgroundSize: "200% 100%"
          }}
          {...animation}
        />
      );
  }
}

// Feed-specific skeleton loader
export function FeedCardSkeleton() {
  return (
    <div className="relative h-full w-full bg-black">
      {/* Media skeleton */}
      <SkeletonLoader 
        variant="card" 
        className="absolute inset-0"
        height="100%"
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      

      {/* Content skeleton - Positionné comme dans EnhancedFeedCard */}
      <div className="absolute inset-0 flex flex-col justify-between p-6" style={{ pointerEvents: 'none' }}>
        {/* Top Content - Same position as real content */}
        <div className="absolute top-4 left-4 right-4" style={{ pointerEvents: 'auto' }}>
          <div className="flex items-center gap-2 mb-2">
            <SkeletonLoader variant="button" width="60px" height="24px" />
            <SkeletonLoader variant="button" width="80px" height="20px" />
          </div>
          <div className="space-y-2 mb-2">
            <SkeletonLoader variant="text" lines={2} />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonLoader variant="button" width="100px" height="16px" />
            <SkeletonLoader variant="button" width="80px" height="16px" />
          </div>
        </div>

        {/* Bottom sheet - Summary placeholder (pause state) */}
        <div className="absolute bottom-0 left-0 right-0 z-[70] px-[14px] lg:px-6" style={{ pointerEvents: 'auto', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 170px)' }}>
          <div className="w-full lg:max-w-6xl mx-auto rounded-2xl border border-white/20 overflow-hidden bg-black/60 backdrop-blur-xl">
            <div className="p-5 pb-1">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="h-6 mb-1">
                    <SkeletonLoader variant="text" lines={2} />
                  </div>
                  <div className="flex items-center gap-2 mt-1 mb-4">
                    <SkeletonLoader variant="button" width="80px" height="14px" />
                    <SkeletonLoader variant="button" width="60px" height="14px" />
                  </div>
                </div>
              </div>
              <div className="pt-3">
                <SkeletonLoader variant="text" lines={4} />
              </div>
              <div className="px-5 pb-3 pt-2">
                <SkeletonLoader variant="button" width="100%" height="40px" />
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons - Positionné exactement comme dans EnhancedFeedCard */}
        <div 
          className="absolute right-3 lg:right-5 z-[60] flex flex-col items-center gap-1 py-1 lg:py-8 w-14 lg:w-16 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-lg"
          style={{ 
            bottom: '[355px]',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(15px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}
        >
          {/* Like button */}
          <div className="flex flex-col items-center gap-1 p-2">
            <SkeletonLoader variant="avatar" width="28px" height="28px" />
            <SkeletonLoader variant="button" width="20px" height="12px" />
          </div>
          
          {/* Comment button */}
          <div className="flex flex-col items-center gap-1 p-3">
            <SkeletonLoader variant="avatar" width="28px" height="28px" />
            <SkeletonLoader variant="button" width="20px" height="12px" />
          </div>
          
          {/* Share button */}
          <div className="flex flex-col items-center gap-1 p-2">
            <SkeletonLoader variant="avatar" width="28px" height="28px" />
            <SkeletonLoader variant="button" width="20px" height="12px" />
          </div>
        </div>
      </div>

      {/* Media type indicator */}
      <div className="absolute top-4 right-4">
        <SkeletonLoader variant="button" width="80px" height="32px" />
      </div>
    </div>
  );
}
