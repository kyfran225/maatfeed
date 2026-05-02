import type { ContentBucket } from "../constants/contentBuckets.js";

export type ContentScoreBreakdown = {
  likes: number;
  comments: number;
  views: number;
  debateScore: number;
  recencyBoost: number;
  finalScore: number;
  scoreVersion: string;
};

export type ContentCard = {
  id: string;
  source: "youtube" | "tiktok" | "internal";
  sourceUrl: string;
  title: string;
  description: string;
  creatorName: string;
  mediaType: "video" | "audio";
  mediaUrl: string;
  thumbnailUrl?: string;
  bucket: ContentBucket;
  tags: string[];
  summary?: string;
  scores: ContentScoreBreakdown;
};
