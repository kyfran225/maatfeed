import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAudioTracks, getPlaylists, createPlaylist, getAutoPlaylist, getAudioDiscovery } from "../services/audioService";
import { useAudioPlayerContext } from "../contexts/AudioPlayerContext";

export function useAudioTracks(limit = 50) {
  return useQuery({
    queryKey: ["audio", "tracks", limit],
    queryFn: () => getAudioTracks(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePlaylists() {
  return useQuery({
    queryKey: ["audio", "playlists"],
    queryFn: () => getPlaylists(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      name: string;
      description?: string;
      trackIds?: string[];
      isPublic?: boolean;
      tags?: string[];
    }) => createPlaylist(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audio", "playlists"] });
    },
    onError: (error) => {
      console.error("Failed to create playlist:", error);
    }
  });
}

export function useAutoPlaylist(config?: {
  genre?: string;
  minPlayCount?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["audio", "auto-playlist", config],
    queryFn: () => getAutoPlaylist(config),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!config, // Only run if config is provided
  });
}

export function useAudioDiscovery(limit = 6) {
  return useQuery({
    queryKey: ["audio", "discovery", limit],
    queryFn: () => getAudioDiscovery(limit),
    staleTime: 2 * 60 * 1000,
  });
}

export function useAudioPlayer() {
  return useAudioPlayerContext();
}
