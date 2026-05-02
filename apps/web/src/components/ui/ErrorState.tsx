import { AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ 
  message = "Something went wrong", 
  onRetry,
  className = "" 
}: ErrorStateProps) {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center py-12 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red/10 mb-4">
        <AlertCircle className="w-6 h-6 text-red" />
      </div>
      
      <p className="text-sand/60 text-sm font-medium text-center mb-4">
        {message}
      </p>
      
      {onRetry && (
        <motion.button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-orange/10 hover:bg-orange/20 text-orange rounded-full transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </motion.button>
      )}
    </motion.div>
  );
}
