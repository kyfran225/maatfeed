export type IngestionSourceItem = {
  externalId: string;
  canonicalUrl: string;
  mediaType: "video" | "audio";
  mediaUrl: string;
  thumbnailUrl?: string;
  title: string;
  description: string;
  creatorName: string;
  transcript?: string;
  tags?: string[];
};
