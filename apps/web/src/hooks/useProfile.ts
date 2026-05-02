import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updatePreferences, completeOnboarding, getSavedContent, type UpdatePreferencesInput } from "../services/profileService";

export function useProfile() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    retry: false
  });

  const savedContentQuery = useQuery({
    queryKey: ["savedContent"],
    queryFn: getSavedContent,
    enabled: false // Only fetch when needed
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (input: UpdatePreferencesInput) => updatePreferences(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    refetchProfile: profileQuery.refetch,
    savedContent: savedContentQuery.data,
    fetchSavedContent: savedContentQuery.refetch,
    updatePreferences: updatePreferencesMutation.mutateAsync,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
    completeOnboarding: completeOnboardingMutation.mutateAsync,
    isCompletingOnboarding: completeOnboardingMutation.isPending
  };
}
