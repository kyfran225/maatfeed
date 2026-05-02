export const redisKeys = {
  globalFeed: "feed:global:v1",
  userFeed: (userId: string) => `feed:user:${userId}`,
  sessionFeed: (sessionId: string) => `feed:session:${sessionId}`,
  hotContent: (contentId: string) => `content:hot:${contentId}`,
  viralTrends: "trends:viral:v1",
  activeRankingConfig: "ranking:config:active"
};
