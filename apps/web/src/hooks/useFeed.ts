import { useQuery, useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { getGlobalFeed, getPersonalizedFeed, FeedResponse, FeedParams } from "../services/feedService";
import { useAuth } from "./useAuth";

export function useGlobalFeed(params?: FeedParams) {
  return useQuery({
    queryKey: ["feed", "global", params],
    queryFn: () => getGlobalFeed(params),
    staleTime: 2 * 60_000,
    gcTime: 15 * 60_000,
    refetchOnMount: false,
  });
}

export function useInfiniteGlobalFeed() {
  return useInfiniteQuery({
    queryKey: ["feed", "global", "infinite"],
    queryFn: ({ pageParam }: { pageParam: string | null }) => getGlobalFeed({ cursor: pageParam, limit: 10 }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 2 * 60_000,
    gcTime: 15 * 60_000,
    refetchOnMount: false,
  });
}

export function usePersonalizedFeed(params?: FeedParams) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["feed", "personalized", profile?.id, params],
    queryFn: () => getPersonalizedFeed(params),
    enabled: !!profile, // Only run when authenticated
    staleTime: 2 * 60_000,
    gcTime: 15 * 60_000,
    refetchOnMount: false,
  });
}

export function useInfinitePersonalizedFeed() {
  const { profile } = useAuth();
  
  return useInfiniteQuery({
    queryKey: ["feed", "personalized", profile?.id, "infinite"],
    queryFn: ({ pageParam }: { pageParam: string | null }) => getPersonalizedFeed({ cursor: pageParam, limit: 10 }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!profile,
    staleTime: 2 * 60_000,
    gcTime: 15 * 60_000,
    refetchOnMount: false,
  });
}
