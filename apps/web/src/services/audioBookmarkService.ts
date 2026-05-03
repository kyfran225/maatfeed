import { getJson, postJson } from "./httpClient";

export interface SavedAudioTrack {
  id: string;
  trackId: string;
  title: string;
  artist: string;
  mediaUrl: string;
  duration: number;
  coverImageUrl?: string;
  lastListenPosition: number;
  completionRatio: number;
  completed: boolean;
  completedAt: string | null;
  savedAt: string;
  updatedAt: string;
}

export async function getSavedAudioTracks(): Promise<SavedAudioTrack[]> {
  const response = await getJson<{ data: SavedAudioTrack[] }>("/api/audio/saved");
  return response?.data ?? [];
}

export async function saveLaterAudioTrack(trackId: string): Promise<SavedAudioTrack> {
  const response = await postJson<{ data: SavedAudioTrack }>(
    "/api/audio/saved",
    { trackId }
  );
  return response?.data ?? { id: "", trackId, title: "", artist: "", mediaUrl: "", duration: 0, lastListenPosition: 0, completionRatio: 0, completed: false, completedAt: null, savedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}

export async function updateAudioBookmark(
  trackId: string,
  update: {
    lastListenPosition?: number;
    completionRatio?: number;
    completed?: boolean;
  }
): Promise<SavedAudioTrack> {
  const response = await getJson<{ data: SavedAudioTrack }>(
    `/api/audio/saved/${trackId}`,
    {
      method: "PUT",
      body: JSON.stringify(update)
    }
  );
  return response?.data ?? { id: "", trackId, title: "", artist: "", mediaUrl: "", duration: 0, lastListenPosition: 0, completionRatio: 0, completed: false, completedAt: null, savedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}

export async function removeAudioBookmark(trackId: string): Promise<void> {
  await getJson<{ success: boolean }>(
    `/api/audio/saved/${trackId}`,
    {
      method: "DELETE"
    }
  );
}
