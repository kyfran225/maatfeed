import { motion } from "framer-motion";

interface FeedCursorLoaderProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

export function FeedCursorLoader({ hasNextPage, isFetchingNextPage, onLoadMore }: FeedCursorLoaderProps) {
  if (!hasNextPage) return null;

  return (
    <div className="text-center py-6">
      <motion.button
        onClick={onLoadMore}
        disabled={isFetchingNextPage}
        className="px-6 py-3 bg-gold/20 hover:bg-gold/30 text-gold rounded-full transition-colors disabled:opacity-50"
        whileHover={{ scale: isFetchingNextPage ? 1 : 1.05 }}
        whileTap={{ scale: isFetchingNextPage ? 1 : 0.95 }}
      >
        {isFetchingNextPage ? "Loading more..." : "Load more"}
      </motion.button>
    </div>
  );
}
