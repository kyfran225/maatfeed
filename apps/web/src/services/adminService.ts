import { getJson } from "./httpClient";

export async function triggerIngestion(input: { keyword: string; limitPerProvider?: number }) {
  return getJson<{ status: string; jobId: string | number | null; keyword: string }>("/api/admin/ingest", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export interface DeleteContentRequest {
  contentId: string;
  reason?: string;
}

export interface DeleteAudioTrackRequest {
  trackId: string;
  reason?: string;
}

export interface DeleteResponse {
  success: boolean;
  data: {
    contentId?: string;
    trackId?: string;
  };
  meta?: {
    timestamp: string;
  };
}

export async function deleteContent(request: DeleteContentRequest): Promise<DeleteResponse> {
  return getJson<DeleteResponse>("/api/admin/content", {
    method: "DELETE",
    body: JSON.stringify(request)
  });
}

export async function deleteAudioTrack(request: DeleteAudioTrackRequest): Promise<DeleteResponse> {
  return getJson<DeleteResponse>("/api/admin/audio-track", {
    method: "DELETE",
    body: JSON.stringify(request)
  });
}
