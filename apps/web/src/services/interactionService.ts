import { getJson, postJson } from './httpClient';

export interface InteractionResponse {
  status: string;
  action: string;
  contentId: string;
}

export interface EngagementData {
  likes: number;
  saves: number;
  shares: number;
  views: number;
  comments: number;
  userHasLiked: boolean;
  userHasSaved: boolean;
}

export interface EngagementResponse {
  status: string;
  contentId: string;
  engagement: EngagementData;
}

export const interactionService = {
  // Like content
  async likeContent(contentId: string): Promise<InteractionResponse> {
    return await postJson<InteractionResponse>('/api/interactions/like', { contentId });
  },

  // Save/bookmark content
  async saveContent(contentId: string): Promise<InteractionResponse> {
    return await postJson<InteractionResponse>('/api/interactions/save', { contentId });
  },

  // Share content
  async shareContent(contentId: string): Promise<InteractionResponse> {
    return await postJson<InteractionResponse>('/api/interactions/share', { contentId });
  },

  // Get engagement stats for content
  async getEngagement(contentId: string): Promise<EngagementData> {
    const response = await getJson<EngagementResponse>(`/api/interactions/engagement/${contentId}`);
    return response.engagement;
  },

  // Track watch duration
  async trackWatch(contentId: string, watchDurationMs: number, completionRatio: number): Promise<InteractionResponse> {
    return await postJson<InteractionResponse>('/api/interactions/watch', {
      contentId,
      watchDurationMs,
      completionRatio
    });
  }
};
