import { Types } from "mongoose";
import { logger } from "../config/logger.js";
import { Sponsor, type ISponsor } from "../models/Sponsor.js";

export interface CreateSponsorInput {
  name: string;
  logo?: string;
  description: string;
  website?: string;
  ctaText?: string;
  priority?: number;
  startDate?: Date;
  endDate?: Date;
  createdBy: string; // User ID
}

export interface UpdateSponsorInput {
  name?: string;
  logo?: string;
  description?: string;
  website?: string;
  ctaText?: string;
  isActive?: boolean;
  priority?: number;
  endDate?: Date;
}

export interface SponsorFilters {
  isActive?: boolean;
  limit?: number;
  skip?: number;
}

/**
 * Créer un nouveau sponsor
 */
export async function createSponsor(input: CreateSponsorInput): Promise<ISponsor> {
  try {
    const sponsor = new Sponsor({
      ...input,
      createdBy: new Types.ObjectId(input.createdBy),
      startDate: input.startDate || new Date()
    });

    await sponsor.save();
    logger.info(`Sponsor créé: ${sponsor.name} (ID: ${sponsor._id})`);

    return sponsor;
  } catch (error) {
    logger.error({ error }, "Erreur lors de la création du sponsor");
    throw error;
  }
}

/**
 * Récupérer tous les sponsors actifs pour le feed
 */
export async function getActiveSponsors(limit: number = 10): Promise<ISponsor[]> {
  try {
    const now = new Date();
    logger.info({ now, limit }, "Recherche des sponsors actifs");
    
    // D'abord, compter tous les sponsors
    const totalSponsors = await Sponsor.countDocuments();
    logger.info({ totalSponsors }, "Nombre total de sponsors dans la base");
    
    // Compter les sponsors actifs
    const activeSponsorsCount = await Sponsor.countDocuments({ isActive: true });
    logger.info({ activeSponsorsCount }, "Nombre de sponsors actifs");
    
    const query = {
      isActive: true,
      startDate: { $lte: now },
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gt: now } }
      ]
    };
    
    logger.info({ query }, "Requête MongoDB pour les sponsors actifs");
    
    const sponsors = await Sponsor
      .find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit)
      .populate('createdBy', 'username email');

    logger.info({ foundSponsors: sponsors.length, sponsors: sponsors.map(s => ({ id: s._id, name: s.name, isActive: s.isActive, startDate: s.startDate, endDate: s.endDate })) }, "Sponsors trouvés");

    return sponsors;
  } catch (error) {
    logger.error({ error }, "Erreur lors de la récupération des sponsors actifs");
    throw error;
  }
}

/**
 * Récupérer un sponsor par ID
 */
export async function getSponsorById(id: string): Promise<ISponsor | null> {
  try {
    return await Sponsor.findById(id).populate('createdBy', 'username email');
  } catch (error) {
    logger.error({ error, id }, `Erreur lors de la récupération du sponsor ${id}`);
    throw error;
  }
}

/**
 * Mettre à jour un sponsor
 */
export async function updateSponsor(id: string, input: UpdateSponsorInput): Promise<ISponsor | null> {
  try {
    const sponsor = await Sponsor.findByIdAndUpdate(
      id,
      { ...input, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'username email');

    if (sponsor) {
      logger.info(`Sponsor mis à jour: ${sponsor.name} (ID: ${sponsor._id})`);
    }

    return sponsor;
  } catch (error) {
    logger.error({ error, id }, `Erreur lors de la récupération du sponsor ${id}`);
    throw error;
  }
}

/**
 * Supprimer un sponsor
 */
export async function deleteSponsor(id: string): Promise<boolean> {
  try {
    const result = await Sponsor.findByIdAndDelete(id);

    if (result) {
      logger.info(`Sponsor supprimé: ${result.name} (ID: ${result._id})`);
      return true;
    }

    return false;
  } catch (error) {
    logger.error({ error, id }, `Erreur lors de la suppression du sponsor ${id}`);
    throw error;
  }
}

/**
 * Incrémenter les statistiques d'un sponsor
 */
export async function incrementSponsorStats(id: string, type: 'impressions' | 'clicks'): Promise<void> {
  try {
    await Sponsor.findByIdAndUpdate(id, {
      $inc: { [`stats.${type}`]: 1 },
      $set: { 'stats.lastShown': new Date() }
    });
  } catch (error) {
    logger.error({ error, id }, `Erreur lors de l'incrémentation des stats du sponsor ${id}`);
    // Ne pas throw pour ne pas casser l'affichage du feed
  }
}

/**
 * Récupérer tous les sponsors (pour admin)
 */
export async function getAllSponsors(filters: SponsorFilters = {}): Promise<ISponsor[]> {
  try {
    const query: any = {};

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    const sponsors = await Sponsor
      .find(query)
      .sort({ createdAt: -1 })
      .skip(filters.skip || 0)
      .limit(filters.limit || 50)
      .populate('createdBy', 'username email');

    return sponsors;
  } catch (error) {
    logger.error({ error }, "Erreur lors de la récupération de tous les sponsors");
    throw error;
  }
}