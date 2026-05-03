import * as httpClient from "./httpClient";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export type AudioMark = "kept" | "review";
export type AudioMarks = Record<string, AudioMark>;

/**
 * Récupère toutes les marques audio de l'utilisateur courant
 */
export async function getAudioMarks(): Promise<AudioMarks> {
  try {
    const response = await httpClient.getJson<{ data: AudioMarks }>(
      `${API_BASE}/api/audio/marks`,
      { credentials: "include" }
    );
    return response?.data ?? {};
  } catch (error) {
    console.error("Error fetching audio marks:", error);
    return {};
  }
}

/**
 * Définit une marque sur un track audio
 * @param trackId - ID du track
 * @param mark - Type de marque ('kept' ou 'review')
 */
export async function setAudioMark(
  trackId: string,
  mark: AudioMark
): Promise<{ trackId: string; mark: AudioMark; updatedAt: string } | null> {
  try {
    const response = await httpClient.postJson<{
      data: { trackId: string; mark: AudioMark; updatedAt: string };
    }>(`${API_BASE}/api/audio/marks`, { trackId, mark }, { credentials: "include" });
    return response?.data ?? null;
  } catch (error) {
    console.error("Error setting audio mark:", error);
    return null;
  }
}

/**
 * Supprime une marque d'un track audio
 * @param trackId - ID du track
 */
export async function removeAudioMark(trackId: string): Promise<boolean> {
  try {
    await httpClient.deleteJson(`${API_BASE}/api/audio/marks/${trackId}`, {
      credentials: "include"
    });
    return true;
  } catch (error) {
    console.error("Error removing audio mark:", error);
    return false;
  }
}
