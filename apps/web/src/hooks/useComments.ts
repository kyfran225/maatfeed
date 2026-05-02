import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getComments, createComment, createReply, Comment, Reply,
  likeComment, unlikeComment, likeReply, unlikeReply, reportComment, reportReply, ReplyMutationAnalytics,
  getAIPersonalities, getDebateStats, getAISummary, AIPersonality
} from "../services/commentService";
import { getDebateThread, DebateThread } from "../services/communityService";
import { fireAndForgetDiscussionAnalyticsEvent, getDiscussionAnalyticsSummary } from "../services/communityAnalyticsService";

function buildCommunityState(
  commentCount: number,
  existingCommunity?: {
    isTrending?: boolean;
    isActiveDiscussion?: boolean;
    hasDebateThread?: boolean;
    participantCount?: number;
    discussionState?: "idle" | "active" | "ready" | "debate";
    ctaKind?: "join_discussion" | "start_debate" | "join_debate" | null;
    ctaLabel?: string | null;
  }
) {
  const nextCommentCount = Math.max(0, commentCount);

  if (existingCommunity?.hasDebateThread) {
    return {
      isTrending: nextCommentCount >= 8 || (existingCommunity.participantCount || 0) >= 5,
      isActiveDiscussion: true,
      hasDebateThread: true,
      participantCount: existingCommunity.participantCount || 0,
      discussionState: "debate" as const,
      ctaKind: "join_debate" as const,
      ctaLabel: "Rejoindre le debat"
    };
  }

  return {
    isTrending: existingCommunity?.isTrending || false,
    isActiveDiscussion: existingCommunity?.isActiveDiscussion || false,
    hasDebateThread: false,
    participantCount: existingCommunity?.participantCount || 0,
    discussionState: existingCommunity?.discussionState || "idle",
    ctaKind: existingCommunity?.ctaKind ?? null,
    ctaLabel: existingCommunity?.ctaLabel ?? undefined
  };
}

function updateFeedCommentCount(oldData: any, contentId: string) {
  if (!oldData) return oldData;

  const patchItem = (item: any) => {
    if (item.id !== contentId) {
      return item;
    }

    const nextCommentCount = (item.scores?.comments || 0) + 1;
    return {
      ...item,
      scores: {
        ...item.scores,
        comments: nextCommentCount
      },
      community: {
        ...(item.community || {}),
        ...buildCommunityState(nextCommentCount, item.community)
      }
    };
  };

  if (oldData.pages) {
    return {
      ...oldData,
      pages: oldData.pages.map((page: any) => ({
        ...page,
        items: page.items?.map(patchItem)
      }))
    };
  }

  if (oldData.items) {
    return {
      ...oldData,
      items: oldData.items.map(patchItem)
    };
  }

  return oldData;
}

export function useComments(
  contentId: string,
  options?: {
    live?: boolean;
    pauseLive?: boolean;
    intervalMs?: number;
  }
) {
  return useQuery({
    queryKey: ["comments", contentId],
    queryFn: () => getComments(contentId),
    enabled: !!contentId,
    staleTime: options?.live ? 5_000 : 30_000,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: options?.live ?? true,
    refetchOnReconnect: true,
    refetchInterval: options?.live && !options?.pauseLive ? (options?.intervalMs ?? 15_000) : false,
    refetchIntervalInBackground: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1_000 * 2 ** attemptIndex, 15_000),
  });
}

export function useCreateComment(contentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => createComment(contentId, body),
    onSuccess: (newComment) => {
      // Invalidate comments query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["comments", contentId] });

      // Optimistically update feed cache to increment comment count
      // and refresh debate-related CTA flags on the card.
      // NOTE: We intentionally do NOT invalidate feed queries here to avoid
      // disruptive re-renders that would close the comment sheet or change videos.
      queryClient.setQueriesData({ queryKey: ["feed"] }, (oldData: any) =>
        updateFeedCommentCount(oldData, contentId)
      );

      // Also update the engagement cache if it exists
      queryClient.setQueryData(["engagement", contentId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          comments: (oldData.comments || 0) + 1
        };
      });
    },
    onError: (error) => {
      console.error("Failed to create comment:", error);
    }
  });
}

export function useCreateReply(contentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      body,
      replyMode,
      parentReplyId,
      replyToCommentId,
      replyToReplyId,
      analytics
    }: {
      commentId: string;
      body: string;
      replyMode?: "nested" | "flat";
      parentReplyId?: string;
      replyToCommentId?: string;
      replyToReplyId?: string;
      analytics?: ReplyMutationAnalytics;
    }) => 
      createReply(commentId, body, replyMode, { parentReplyId, replyToCommentId, replyToReplyId }),
    onSuccess: (newReply, variables) => {
      // Invalidate comments queries to refresh the thread
      queryClient.invalidateQueries({ queryKey: ["comments"] });

      // Optimistically update feed cache to increment comment count (replies count as comments)
      // NOTE: We intentionally do NOT invalidate feed queries here to avoid
      // disruptive re-renders that would close the comment sheet or change videos.
      if (contentId) {
        queryClient.setQueriesData({ queryKey: ["feed"] }, (oldData: any) =>
          updateFeedCommentCount(oldData, contentId)
        );

        // Update engagement cache
        queryClient.setQueryData(["engagement", contentId], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            comments: (oldData.comments || 0) + 1
          };
        });

        fireAndForgetDiscussionAnalyticsEvent(contentId, "discussion_reply_submitted", {
          surface: "debate_detail",
          replyMode: "flat",
          targetType: variables.analytics?.targetType || "comment",
          targetId: variables.analytics?.targetId || variables.commentId,
          parentCommentId: variables.analytics?.parentCommentId || variables.commentId
        });
      }
    },
    onError: (error) => {
      console.error("Failed to create reply:", error);
    }
  });
}

// ==================== VOTE HOOKS ====================

export function useLikeComment(contentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => likeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", contentId] });
    },
    onError: (error) => {
      console.error("Failed to like comment:", error);
    }
  });
}

export function useUnlikeComment(contentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => unlikeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", contentId] });
    },
    onError: (error) => {
      console.error("Failed to unlike comment:", error);
    }
  });
}

export function useLikeReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (replyId: string) => likeReply(replyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: (error) => {
      console.error("Failed to like reply:", error);
    }
  });
}

export function useUnlikeReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (replyId: string) => unlikeReply(replyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: (error) => {
      console.error("Failed to unlike reply:", error);
    }
  });
}

export function useReportComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, reason, description }: { commentId: string; reason: "spam" | "harassment" | "hate_speech" | "misinformation" | "inappropriate" | "other"; description?: string }) =>
      reportComment(commentId, reason, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: (error) => {
      console.error("Failed to report comment:", error);
    }
  });
}

export function useReportReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ replyId, reason, description }: { replyId: string; reason: "spam" | "harassment" | "hate_speech" | "misinformation" | "inappropriate" | "other"; description?: string }) =>
      reportReply(replyId, reason, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: (error) => {
      console.error("Failed to report reply:", error);
    }
  });
}

// ==================== DEBATE HOOKS ====================

export function useDebate(contentId: string) {
  return useQuery({
    queryKey: ["debate", contentId],
    queryFn: () => getDebateThread(contentId),
    enabled: !!contentId,
    staleTime: 60_000, // 1 minute
  });
}

export function useAIPersonalities(contentId: string) {
  return useQuery({
    queryKey: ["ai-personalities", contentId],
    queryFn: () => getAIPersonalities(contentId),
    enabled: !!contentId,
    staleTime: 5 * 60_000, // 5 minutes
  });
}

export function useDebateStats(contentId: string) {
  return useQuery({
    queryKey: ["debate-stats", contentId],
    queryFn: () => getDebateStats(contentId),
    enabled: !!contentId,
    staleTime: 60_000, // 1 minute
  });
}

export function useAISummary(contentId: string) {
  return useQuery({
    queryKey: ["ai-summary", contentId],
    queryFn: () => getAISummary(contentId),
    enabled: !!contentId,
    staleTime: 5 * 60_000, // 5 minutes
  });
}

export function useDiscussionAnalyticsSummary(contentId: string) {
  return useQuery({
    queryKey: ["discussion-analytics", contentId],
    queryFn: () => getDiscussionAnalyticsSummary(contentId),
    enabled: !!contentId,
    staleTime: 60_000,
  });
}
