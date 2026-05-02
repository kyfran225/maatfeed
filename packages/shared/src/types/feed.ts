import type { ContentCard } from "./content.js";

export type FeedCursor = {
  nextCursor: string | null;
  hasMore: boolean;
};

export type FeedResponse = FeedCursor & {
  items: ContentCard[];
  cacheStatus: "hit" | "miss";
  generatedAt: string;
};
