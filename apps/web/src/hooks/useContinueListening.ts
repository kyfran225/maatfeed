import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface ContinueListeningItem {
  id: string;
  title: string;
  artist: string;
  coverImageUrl?: string;
  duration: number;
  progress: number; // 0-100
  lastPlayedAt: string;
  type: 'track' | 'podcast' | 'audiobook';
  playlistId?: string;
  episodeNumber?: number;
}

export function useContinueListening() {
  const {
    data: items,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['continue-listening'],
    queryFn: async (): Promise<ContinueListeningItem[]> => {
      // Simuler l'appel API - à remplacer avec le vrai service
      const mockData: ContinueListeningItem[] = [
        {
          id: '1',
          title: 'Afrobeat Vibes',
          artist: 'Various Artists',
          coverImageUrl: '/images/afrobeat-cover.jpg',
          duration: 240,
          progress: 65,
          lastPlayedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          type: 'track',
          playlistId: 'playlist-1'
        },
        {
          id: '2',
          title: 'Tech Podcast Episode 42',
          artist: 'Tech Talk Africa',
          coverImageUrl: '/images/tech-podcast.jpg',
          duration: 1800,
          progress: 30,
          lastPlayedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          type: 'podcast',
          episodeNumber: 42
        },
        {
          id: '3',
          title: 'African History Chapter 5',
          artist: 'History Audio Books',
          coverImageUrl: '/images/history-book.jpg',
          duration: 3600,
          progress: 85,
          lastPlayedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          type: 'audiobook'
        }
      ];
      
      return mockData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    continueListeningItems: items || [],
    isLoading,
    error,
    refetch
  };
}
