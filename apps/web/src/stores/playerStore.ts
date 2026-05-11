import { create } from 'zustand';

export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  coverArt?: string;
  isLocal?: boolean;
}

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
  
  // Actions
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  addToQueue: (tracks: Track[]) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: 'none' | 'one' | 'all') => void;
  setLoading: (loading: boolean) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  volume: 1,
  currentTime: 0,
  duration: 0,
  isLoading: false,
  isShuffled: false,
  repeatMode: 'none',

  playTrack: (track: Track) => {
    set({
      currentTrack: track,
      isPlaying: true,
      currentTime: 0,
    });
  },

  pauseTrack: () => {
    set({ isPlaying: false });
  },

  resumeTrack: () => {
    set({ isPlaying: true });
  },

  nextTrack: () => {
    const { currentIndex, queue, repeatMode } = get();
    
    if (queue.length === 0) return;

    let nextIndex = currentIndex + 1;
    
    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        return;
      }
    }

    set({
      currentIndex: nextIndex,
      currentTrack: queue[nextIndex],
      isPlaying: true,
      currentTime: 0,
    });
  },

  previousTrack: () => {
    const { currentIndex, queue } = get();
    
    if (queue.length === 0) return;

    let prevIndex = currentIndex - 1;
    
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }

    set({
      currentIndex: prevIndex,
      currentTrack: queue[prevIndex],
      isPlaying: true,
      currentTime: 0,
    });
  },

  setVolume: (volume: number) => {
    set({ volume: Math.max(0, Math.min(1, volume)) });
  },

  setCurrentTime: (time: number) => {
    set({ currentTime: time });
  },

  setDuration: (duration: number) => {
    set({ duration });
  },

  addToQueue: (tracks: Track[]) => {
    set((state) => ({
      queue: [...state.queue, ...tracks],
    }));
  },

  removeFromQueue: (index: number) => {
    set((state) => {
      const newQueue = state.queue.filter((_, i) => i !== index);
      const newCurrentIndex = index === state.currentIndex ? -1 : 
                              index < state.currentIndex ? state.currentIndex - 1 : 
                              state.currentIndex;
      
      return {
        queue: newQueue,
        currentIndex: newCurrentIndex,
        currentTrack: newCurrentIndex >= 0 ? newQueue[newCurrentIndex] : null,
      };
    });
  },

  clearQueue: () => {
    set({
      queue: [],
      currentIndex: -1,
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
    });
  },

  toggleShuffle: () => {
    set((state) => ({ isShuffled: !state.isShuffled }));
  },

  setRepeatMode: (mode: 'none' | 'one' | 'all') => {
    set({ repeatMode: mode });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
