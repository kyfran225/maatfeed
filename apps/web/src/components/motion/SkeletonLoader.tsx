import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  type?: 'card' | 'feed' | 'list';
  count?: number;
  className?: string;
}

const skeletonVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatType: 'reverse' as const,
      ease: 'easeInOut' as const
    }
  }
};

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'card',
  count = 3,
  className = ''
}) => {
  const renderSkeletonItem = () => {
    switch (type) {
      case 'feed':
        return (
          <div className="w-full h-screen bg-white/5 rounded-lg overflow-hidden">
            <div className="h-3/4 bg-gradient-to-r from-sand/10 to-sand/5 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-sand/10 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-sand/10 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
            <div className="w-12 h-12 bg-sand/10 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-sand/10 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-sand/10 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        );
      
      case 'card':
      default:
        return (
          <div className="bg-white/5 rounded-lg p-4 space-y-3">
            <div className="h-32 bg-sand/10 rounded animate-pulse" />
            <div className="h-4 bg-sand/10 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-sand/10 rounded w-1/2 animate-pulse" />
          </div>
        );
    }
  };

  return (
    <motion.div
      variants={skeletonVariants}
      initial="initial"
      animate="animate"
      className={`space-y-4 ${className}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="bg-gradient-to-r from-sand/5 to-sand/10 rounded-lg"
        >
          {renderSkeletonItem()}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default SkeletonLoader;
