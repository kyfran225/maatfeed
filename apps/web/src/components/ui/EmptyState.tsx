import { motion } from "framer-motion";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon,
  title = "No content available",
  description = "Check back later for new content",
  action,
  className = ""
}: EmptyStateProps) {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center py-12 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {icon && (
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-sand/10 mb-4">
          {icon}
        </div>
      )}
      
      <h3 className="text-gold text-xl font-medium mb-2 text-center">
        {title}
      </h3>
      
      <p className="text-sand/60 text-sm text-center mb-6 max-w-sm">
        {description}
      </p>
      
      {action && (
        <motion.button
          onClick={action.onClick}
          className="px-6 py-3 bg-orange hover:bg-orange/80 text-white rounded-full transition-colors font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
