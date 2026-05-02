export const QUEUE_NAMES = {
  ingest: "ingest",
  classify: "classify",
  enrich: "enrich",
  communityAI: "community-ai"
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
