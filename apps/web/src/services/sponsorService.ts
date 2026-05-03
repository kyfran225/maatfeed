import { getJson, postJson } from "./httpClient";

export interface Sponsor {
  id: string;
  name: string;
  logo?: string;
  description: string;
  website?: string;
  ctaText?: string;
  priority?: number;
  startDate?: string;
  endDate?: string;
  stats?: {
    impressions: number;
    clicks: number;
    lastShown?: string;
  };
}

export interface SponsorStats {
  impressions: number;
  clicks: number;
  lastShown?: string;
}

/**
 * Récupérer les sponsors actifs pour le feed
 */
export async function getActiveSponsors(limit: number = 10): Promise<{ sponsors: Sponsor[] }> {
  return getJson<{ sponsors: Sponsor[] }>(`/api/sponsors/active?limit=${limit}`);
}

/**
 * Incrémenter les statistiques d'un sponsor
 */
export async function incrementSponsorStats(sponsorId: string, type: 'impressions' | 'clicks'): Promise<void> {
  await postJson(`/api/sponsors/${sponsorId}/stats`, { type });
}