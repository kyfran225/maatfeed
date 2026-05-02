import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface EnhancedLoadingStateProps {
  message?: string;
  type?: 'feed' | 'content' | 'search' | 'auth';
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  progress?: number;
}

export const EnhancedLoadingState: React.FC<EnhancedLoadingStateProps> = ({
  message = 'Chargement...',
  type = 'feed',
  size = 'md',
  showProgress = false,
  progress = 0
}) => {
  const sizeConfig = {
    sm: { container: 'p-4', skeleton: 'h-8', text: 'text-sm' },
    md: { container: 'p-8', skeleton: 'h-12', text: 'text-base' },
    lg: { container: 'p-12', skeleton: 'h-16', text: 'text-lg' }
  };

  const typeConfig = {
    feed: {
      skeletons: 3,
      icon: 'wave',
      color: 'from-blue-500 to-purple-500'
    },
    content: {
      skeletons: 5,
      icon: 'grid',
      color: 'from-orange-500 to-red-500'
    },
    search: {
      skeletons: 2,
      icon: 'search',
      color: 'from-green-500 to-teal-500'
    },
    auth: {
      skeletons: 1,
      icon: 'lock',
      color: 'from-indigo-500 to-purple-500'
    }
  };

  const config = typeConfig[type];
  const sizeClasses = sizeConfig[size];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`flex flex-col items-center justify-center min-h-[200px] ${sizeClasses.container}`}
    >
      {/* Animated Icon */}
      <motion.div
        className={`w-16 h-16 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center mb-6`}
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{
          rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
          scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' }
        }}
      >
        <div className="w-8 h-8 bg-white rounded-full opacity-80" />
      </motion.div>

      {/* Loading Message */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className={`text-white font-medium ${sizeClasses.text}`}>{message}</p>
      </motion.div>

      {/* Progress Bar */}
      {showProgress && (
        <motion.div
          className="w-full max-w-xs mb-6"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p className="text-center text-white/60 text-xs mt-2">{Math.round(progress)}%</p>
        </motion.div>
      )}

      {/* Skeleton Loaders */}
      <div className="w-full max-w-md space-y-3">
        {Array.from({ length: config.skeletons }).map((_, index) => (
          <motion.div
            key={index}
            className={`bg-white/10 rounded-lg ${sizeClasses.skeleton} overflow-hidden`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <motion.div
              className={`h-full bg-gradient-to-r from-white/5 via-white/20 to-white/5 rounded-lg`}
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                x: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: index * 0.2
                }
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <motion.div
            key={index}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * 100 - 50,
              y: Math.random() * 100 - 50,
              opacity: 0
            }}
            animate={{
              y: [-100, -200],
              opacity: [0, 0.6, 0],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeOut'
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default EnhancedLoadingState;
