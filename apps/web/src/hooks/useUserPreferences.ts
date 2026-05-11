import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface UserPreferences {
  id: string;
  userId: string;
  interests: string[];
  preferredFormats: ('audio' | 'video' | 'podcast' | 'audiobook')[];
  language: string;
  autoPlay: boolean;
  highQuality: boolean;
  dataSaver: boolean;
  notifications: {
    newReleases: boolean;
    recommendations: boolean;
    social: boolean;
  };
  totalListeningTime: number; // in minutes
  favoriteTracksCount: number;
  recentlyPlayed: string[];
  createdAt: string;
  updatedAt: string;
}

const defaultPreferences: Partial<UserPreferences> = {
  interests: [],
  preferredFormats: ['audio', 'video'],
  language: 'fr',
  autoPlay: true,
  highQuality: false,
  dataSaver: false,
  notifications: {
    newReleases: true,
    recommendations: true,
    social: false
  },
  totalListeningTime: 0,
  favoriteTracksCount: 0,
  recentlyPlayed: []
};

export function useUserPreferences() {
  const queryClient = useQueryClient();

  const {
    data: preferences,
    isLoading,
    error
  } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: async (): Promise<UserPreferences> => {
      // Simuler l'appel API - à remplacer avec le vrai service
      const mockData: UserPreferences = {
        id: 'pref-1',
        userId: 'user-1',
        interests: ['afrobeat', 'tech', 'history', 'podcasts'],
        preferredFormats: ['audio', 'podcast'],
        language: 'fr',
        autoPlay: true,
        highQuality: false,
        dataSaver: true,
        notifications: {
          newReleases: true,
          recommendations: true,
          social: false
        },
        totalListeningTime: 1250, // ~20 hours
        favoriteTracksCount: 47,
        recentlyPlayed: ['track-1', 'track-2', 'track-3'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return mockData;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<UserPreferences>): Promise<UserPreferences> => {
      // Simuler l'appel API
      const updatedPreferences = {
        ...preferences,
        ...updates,
        updatedAt: new Date().toISOString()
      } as UserPreferences;
      
      return updatedPreferences;
    },
    onSuccess: (updatedPreferences) => {
      queryClient.setQueryData(['user-preferences'], updatedPreferences);
    }
  });

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    updatePreferencesMutation.mutate(updates);
  };

  const addInterest = (interest: string) => {
    if (!preferences?.interests.includes(interest)) {
      updatePreferences({
        interests: [...(preferences?.interests || []), interest]
      });
    }
  };

  const removeInterest = (interest: string) => {
    if (preferences?.interests.includes(interest)) {
      updatePreferences({
        interests: preferences.interests.filter(i => i !== interest)
      });
    }
  };

  const addRecentlyPlayed = (trackId: string) => {
    const recentlyPlayed = [
      trackId,
      ...(preferences?.recentlyPlayed || []).filter(id => id !== trackId)
    ].slice(0, 50); // Keep only last 50

    updatePreferences({ recentlyPlayed });
  };

  const incrementListeningTime = (minutes: number) => {
    updatePreferences({
      totalListeningTime: (preferences?.totalListeningTime || 0) + minutes
    });
  };

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    addInterest,
    removeInterest,
    addRecentlyPlayed,
    incrementListeningTime,
    isUpdating: updatePreferencesMutation.isPending
  };
}
