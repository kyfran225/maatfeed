import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { interactionService, type EngagementData } from "../services/interactionService";

export interface EngagementResponse extends EngagementData {
  userHasLiked: boolean;
  userHasSaved: boolean;
}

export function useEngagement(contentId: string) {
  return useQuery<EngagementResponse, Error>({
    queryKey: ["engagement", contentId],
    queryFn: async () => {
      const response = await interactionService.getEngagement(contentId);
      return response as EngagementResponse;
    },
    enabled: !!contentId,
    staleTime: 30_000, // 30 seconds
  });
}

export function useOptimisticLike(contentId: string) {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: () => interactionService.likeContent(contentId),
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["engagement", contentId] });

      // Snapshot previous value
      const previousEngagement = queryClient.getQueryData<EngagementResponse>(["engagement", contentId]);

      // Optimistically update to new value
      if (previousEngagement) {
        queryClient.setQueryData<EngagementResponse>(["engagement", contentId], {
          ...previousEngagement,
          userHasLiked: !previousEngagement.userHasLiked,
          likes: previousEngagement.userHasLiked
            ? Math.max(0, previousEngagement.likes - 1)
            : previousEngagement.likes + 1,
        });
      }

      return { previousEngagement };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousEngagement) {
        queryClient.setQueryData(["engagement", contentId], context.previousEngagement);
      }
    },
    onSettled: () => {
      // Refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["engagement", contentId] });
    },
  });

  return likeMutation;
}

export function useOptimisticSave(contentId: string) {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: () => interactionService.saveContent(contentId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["engagement", contentId] });
      const previousEngagement = queryClient.getQueryData<EngagementResponse>(["engagement", contentId]);

      if (previousEngagement) {
        queryClient.setQueryData<EngagementResponse>(["engagement", contentId], {
          ...previousEngagement,
          userHasSaved: !previousEngagement.userHasSaved,
          saves: previousEngagement.userHasSaved
            ? Math.max(0, previousEngagement.saves - 1)
            : previousEngagement.saves + 1,
        });
      }

      return { previousEngagement };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousEngagement) {
        queryClient.setQueryData(["engagement", contentId], context.previousEngagement);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["engagement", contentId] });
    },
  });

  return saveMutation;
}
