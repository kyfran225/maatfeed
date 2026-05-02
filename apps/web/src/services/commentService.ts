import { getJson, postJson } from "./httpClient";

export interface Comment {
  id: string;
  _id?: string;
  contentId: string;
  userId: string;
  body: string;
  debateScore: number;
  likeCount?: number;
  replyCount?: number;
  aiGenerated?: boolean;
  aiPersona?: string | null;
  aiPersonaName?: string | null;
  aiPersonaAvatar?: string | null;
  moderationStatus?: "approved" | "blocked" | "hidden";
  moderationReason?: string | null;
  hidden?: boolean;
  reportCount?: number;
  analysis?: {
    debateScore: number;
    questionScore: number;
    emotionScore: number;
    toxicityScore: number;
    spamScore: number;
    qualityScore: number;
  };
  createdAt: string;
  updatedAt: string;
  authorName?: string;
  authorAvatar?: string;
  replies: Reply[];
  inReplyToCommentId?: string | null;
  replyToCommentId?: string | null;
  replyToReplyId?: string | null;
  replyTargetId?: string | null;
  replyTargetType?: "comment" | "reply" | null;
  replyTargetAuthorName?: string | null;
  replyMode?: "nested" | "flat";
  parentAuthorName?: string | null;
}

export interface Reply {
  id: string;
  commentId: string;
  userId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  authorName?: string;
  authorAvatar?: string;
  likeCount?: number;
  nestedReplyCount?: number;
  nestedReplies?: Reply[];
  replyMode?: "nested" | "flat";
  isFlatReply?: boolean;
}

export interface CommentResponse {
  success: boolean;
  data: Comment[];
  meta: {
    count: number;
    timestamp: string;
  };
}

export interface CreateCommentResponse {
  success: boolean;
  data: Comment;
  meta: {
    timestamp: string;
  };
}

export async function getComments(contentId: string): Promise<Comment[]> {
  const response = await getJson<CommentResponse>(`/api/comments/${contentId}`);
  return response.data;
}

export async function createComment(contentId: string, body: string): Promise<Comment> {
  const response = await postJson<CreateCommentResponse>(`/api/comments/${contentId}`, { body });
  return response.data;
}

export async function createReply(
  commentId: string, 
  body: string, 
  replyMode?: "nested" | "flat",
  options?: {
    parentReplyId?: string;
    replyToCommentId?: string;
    replyToReplyId?: string;
  }
): Promise<Reply> {
  const resolvedReplyMode = "flat";
  const resolvedReplyToReplyId = options?.replyToReplyId || options?.parentReplyId;
  const response = await postJson<{ success: boolean; data: Reply; meta: { timestamp: string } }>(
    `/api/comments/${commentId}/replies`, 
    {
      body,
      replyMode: resolvedReplyMode,
      parentReplyId: undefined,
      replyToCommentId: options?.replyToCommentId,
      replyToReplyId: resolvedReplyToReplyId
    }
  );
  return response.data;
}

export interface ReplyMutationAnalytics {
  targetType?: "comment" | "flat_reply" | "nested_reply";
  targetId?: string;
  parentCommentId?: string;
  replyToCommentId?: string;
  replyToReplyId?: string;
}

export async function reportComment(commentId: string, reason: "spam" | "harassment" | "hate_speech" | "misinformation" | "inappropriate" | "other", description?: string) {
  return postJson<{ success: boolean; data: { success: boolean; reportCount: number; hidden: boolean } }>(`/api/comments/${commentId}/report`, {
    reason,
    description
  });
}

export async function reportReply(replyId: string, reason: "spam" | "harassment" | "hate_speech" | "misinformation" | "inappropriate" | "other", description?: string) {
  return postJson<{ success: boolean; data: { success: boolean; reportCount: number; hidden: boolean } }>(`/api/comments/replies/${replyId}/report`, {
    reason,
    description
  });
}

export async function likeComment(commentId: string): Promise<{ success: boolean; likeCount: number }> {
  const response = await postJson<{ success: boolean; data: { likeCount: number } }>(`/api/comments/${commentId}/like`, {});
  return { success: response.success, likeCount: response.data?.likeCount || 0 };
}

export async function unlikeComment(commentId: string): Promise<{ success: boolean; likeCount: number }> {
  const response = await getJson<{ success: boolean; data: { likeCount: number } }>(`/api/comments/${commentId}/like`, { method: "DELETE" });
  return { success: response.success, likeCount: response.data?.likeCount || 0 };
}

export async function likeReply(replyId: string): Promise<{ success: boolean; likeCount: number }> {
  const response = await postJson<{ success: boolean; data: { likeCount: number } }>(`/api/comments/replies/${replyId}/like`, {});
  return { success: response.success, likeCount: response.data?.likeCount || 0 };
}

export async function unlikeReply(replyId: string): Promise<{ success: boolean; likeCount: number }> {
  const response = await getJson<{ success: boolean; data: { likeCount: number } }>(`/api/comments/replies/${replyId}/like`, { method: "DELETE" });
  return { success: response.success, likeCount: response.data?.likeCount || 0 };
}

export async function getNestedReplies(replyId: string): Promise<Reply[]> {
  const response = await getJson<{ success: boolean; data: Reply[] }>(`/api/comments/replies/${replyId}/nested`);
  return response.data || [];
}

export interface AIPersonality {
  id: string;
  name: string;
  avatar: string;
  expertise: string[];
  description: string;
  isOnline: boolean;
  participated: boolean;
  commentCount: number;
  availability: "active" | "available";
}

export async function getAIPersonalities(contentId: string): Promise<AIPersonality[]> {
  const response = await getJson<{ success: boolean; data: AIPersonality[] }>(`/api/community/debates/${contentId}/ai-personalities`);
  return response.data || [];
}

export interface AICommentReplyResult {
  responseGenerated: boolean;
  commentId?: string;
  reason?: string;
}

export interface AIInteractionContext {
  recentCommentCount?: number;
  discussionActive?: boolean;
  lastAIResponses?: Array<{
    personalityId: string;
    timestamp: number;
  }>;
}

export interface AICommentReplyCheckResult {
  shouldRespond: boolean;
  reason?: string;
}

export interface AIPersonalityRoutingResult {
  personality: {
    id: string;
    name: string;
    displayName?: string;
    avatar?: string;
  } | null;
  confidence?: number;
}

export async function checkAICommentReply(
  commentId: string,
  context: AIInteractionContext = {}
): Promise<AICommentReplyCheckResult> {
  const response = await postJson<{ success: boolean; data: AICommentReplyCheckResult }>(
    `/api/ai/v2/comments/${commentId}/check`,
    context
  );
  return response.data;
}

export async function requestAICommentReply(
  commentId: string,
  context: AIInteractionContext = {}
): Promise<AICommentReplyResult> {
  const response = await postJson<{ success: boolean; data: AICommentReplyResult }>(
    `/api/ai/v2/comments/${commentId}/respond`,
    context
  );
  return response.data;
}

export async function routeAICommentPersonality(
  text: string,
  context: AIInteractionContext = {}
): Promise<AIPersonalityRoutingResult> {
  const response = await postJson<{ success: boolean; data: AIPersonalityRoutingResult | null }>(
    "/api/ai/v2/route",
    {
      text,
      ...context
    }
  );

  return response.data || {
    personality: null
  };
}

export async function getDebateStats(contentId: string): Promise<{
  totalComments: number;
  totalReplies: number;
  aiContributions: number;
  topContributors: Array<{ name: string; avatar: string; count: number }>;
  engagementRate: number;
}> {
  const response = await getJson<{ success: boolean; data: {
    totalComments: number;
    totalReplies: number;
    aiContributions: number;
    topContributors: Array<{ name: string; avatar: string; count: number }>;
    engagementRate: number;
  }}>(`/api/community/debates/${contentId}/stats`);
  return response.data || {
    totalComments: 0,
    totalReplies: 0,
    aiContributions: 0,
    topContributors: [],
    engagementRate: 0
  };
}

export async function getAISummary(contentId: string): Promise<{
  summary: string;
  keyPoints: string[];
  perspectives: Array<{ persona: string; viewpoint: string }>;
}> {
  const response = await getJson<{ success: boolean; data: {
    summary: string;
    keyPoints: string[];
    perspectives: Array<{ persona: string; viewpoint: string }>;
  }}>(`/api/community/debates/${contentId}/ai-summary`);
  return response.data || {
    summary: "",
    keyPoints: [],
    perspectives: []
  };
}
