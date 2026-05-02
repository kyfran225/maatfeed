import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

interface SwipeHintProps {
  direction: "up" | "down";
  isVisible: boolean;
  className?: string;
}

export function SwipeHint({ direction, isVisible, className = "" }: SwipeHintProps) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShouldShow(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setShouldShow(false);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          className={`absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-md rounded-full border border-white/30 ${className}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={{
              y: direction === "up" ? [-4, 4, -4] : [4, -4, 4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {direction === "up" ? (
              <ChevronUp className="w-6 h-6 text-white" />
            ) : (
              <ChevronDown className="w-6 h-6 text-white" />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
