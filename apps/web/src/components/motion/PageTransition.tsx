import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();

  // Simplified: no AnimatePresence mode="wait" to avoid blocking and state loss
  // Just a subtle fade-in when the page mounts
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="h-full min-h-0 w-full"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
