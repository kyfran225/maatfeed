import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postJson } from "../services/httpClient";

interface InteractionResponse {
  success: boolean;
  data: {
    contentId: string;
    action: string;
    timestamp: string;
  };
}

interface WatchTrackingData {
  contentId: string;
  watchDurationMs: number;
  completionRatio: number;
}

export function useInteractions(contentId: string) {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: () => postJson<InteractionResponse>("/api/interactions/like", { contentId }),
    onSuccess: () => {
      // Invalidate engagement query to sync like status with server
      // This ensures the engagement cache reflects the current state
      queryClient.invalidateQueries({ queryKey: ["engagement", contentId] });
    },
    onError: (error) => {
      console.error("Failed to like content:", error);
    }
  });

  const saveMutation = useMutation({
    mutationFn: () => postJson<InteractionResponse>("/api/interactions/save", { contentId }),
    onSuccess: () => {
      // Invalidate engagement query to sync save status with server
      queryClient.invalidateQueries({ queryKey: ["engagement", contentId] });
    },
    onError: (error) => {
      console.error("Failed to save content:", error);
    }
  });

  const shareMutation = useMutation({
    mutationFn: () => postJson<InteractionResponse>("/api/interactions/share", { contentId }),
    onSuccess: () => {
      // Invalidate engagement query to refresh share count from server
      queryClient.invalidateQueries({ queryKey: ["engagement", contentId] });
    },
    onError: (error) => {
      console.error("Failed to share content:", error);
    }
  });

  const watchMutation = useMutation({
    mutationFn: (data: WatchTrackingData) => postJson<InteractionResponse>("/api/interactions/watch", data),
    onSuccess: () => {
      // Watch tracking doesn't need immediate UI update, but affects ranking
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (error) => {
      console.error("Failed to track watch:", error);
    }
  });

  return {
    likeMutation,
    saveMutation,
    shareMutation,
    watchMutation
  };
}
