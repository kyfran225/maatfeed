export const CONTENT_BUCKETS = ["viral", "educational", "deep"] as const;

export type ContentBucket = (typeof CONTENT_BUCKETS)[number];

// Labels français pour l'affichage
export const CONTENT_BUCKET_LABELS: Record<ContentBucket, string> = {
  viral: "Viral",
  educational: "Éducatif",
  deep: "Profond"
};
