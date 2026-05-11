// Export du playerStore existant en tant que audioStore pour compatibilité
export { usePlayerStore as useAudioStore } from './playerStore';

// Réexporter les types pour compatibilité
export type { Track } from './playerStore';

// Types additionnels pour les playlists
import type { Track } from './playerStore';

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  trackCount: number;
  duration: number; // total duration in seconds
  isPublic: boolean;
  isFavorite: boolean;
  isRecent: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tracks?: Track[];
}
