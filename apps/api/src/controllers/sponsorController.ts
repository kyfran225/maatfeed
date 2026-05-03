import type { Request, Response } from "express";
import * as sponsorService from "../services/sponsorService.js";
import type { CreateSponsorInput, UpdateSponsorInput, SponsorFilters } from "../services/sponsorService.js";

/**
 * GET /api/sponsors/active - Récupérer les sponsors actifs pour le feed
 */
export async function getActiveSponsorsController(request: Request, response: Response) {
  try {
    const limit = parseInt(request.query.limit as string) || 10;
    const sponsors = await sponsorService.getActiveSponsors(limit);

    response.json({
      sponsors: sponsors.map(sponsor => ({
        id: sponsor._id.toString(),
        name: sponsor.name,
        logo: sponsor.logo,
        description: sponsor.description,
        website: sponsor.website,
        ctaText: sponsor.ctaText,
        priority: sponsor.priority,
        startDate: sponsor.startDate,
        endDate: sponsor.endDate,
        stats: sponsor.stats
      }))
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des sponsors actifs:", error);
    response.status(500).json({ error: "Erreur interne du serveur" });
  }
}

/**
 * GET /api/sponsors - Récupérer tous les sponsors (admin)
 */
export async function getAllSponsorsController(request: Request, response: Response) {
  try {
    const filters: SponsorFilters = {
      isActive: request.query.isActive === 'true' ? true : request.query.isActive === 'false' ? false : undefined,
      limit: parseInt(request.query.limit as string) || 50,
      skip: parseInt(request.query.skip as string) || 0
    };

    const sponsors = await sponsorService.getAllSponsors(filters);

    response.json({
      sponsors: sponsors.map(sponsor => ({
        id: sponsor._id.toString(),
        name: sponsor.name,
        logo: sponsor.logo,
        description: sponsor.description,
        website: sponsor.website,
        ctaText: sponsor.ctaText,
        isActive: sponsor.isActive,
        priority: sponsor.priority,
        startDate: sponsor.startDate,
        endDate: sponsor.endDate,
        createdAt: sponsor.createdAt,
        updatedAt: sponsor.updatedAt,
        createdBy: {
          id: sponsor.createdBy.toString(),
          username: (sponsor.createdBy as any).username,
          email: (sponsor.createdBy as any).email
        },
        stats: sponsor.stats
      }))
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des sponsors:", error);
    response.status(500).json({ error: "Erreur interne du serveur" });
  }
}

/**
 * GET /api/sponsors/:id - Récupérer un sponsor par ID
 */
export async function getSponsorController(request: Request, response: Response) {
  const { id } = request.params;

  if (Array.isArray(id)) {
    response.status(400).json({ error: "ID invalide" });
    return;
  }

  try {
    const sponsor = await sponsorService.getSponsorById(id);

    if (!sponsor) {
      response.status(404).json({ error: "Sponsor non trouvé" });
      return;
    }

    response.json({
      sponsor: {
        id: sponsor._id.toString(),
        name: sponsor.name,
        logo: sponsor.logo,
        description: sponsor.description,
        website: sponsor.website,
        ctaText: sponsor.ctaText,
        isActive: sponsor.isActive,
        priority: sponsor.priority,
        startDate: sponsor.startDate,
        endDate: sponsor.endDate,
        createdAt: sponsor.createdAt,
        updatedAt: sponsor.updatedAt,
        createdBy: {
          id: sponsor.createdBy.toString(),
          username: (sponsor.createdBy as any).username,
          email: (sponsor.createdBy as any).email
        },
        stats: sponsor.stats
      }
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération du sponsor ${id}:`, error);
    response.status(500).json({ error: "Erreur interne du serveur" });
  }
}

/**
 * POST /api/sponsors - Créer un nouveau sponsor
 */
export async function createSponsorController(request: Request, response: Response) {
  const userId = response.locals.auth?.userId;

  if (!userId) {
    response.status(401).json({ error: "Authentification requise." });
    return;
  }

  const input: CreateSponsorInput = {
    ...request.body,
    createdBy: userId
  };

  // Validation basique
  if (!input.name || !input.description) {
    response.status(400).json({ error: "Nom et description requis." });
    return;
  }

  try {
    const sponsor = await sponsorService.createSponsor(input);

    response.status(201).json({
      sponsor: {
        id: sponsor._id.toString(),
        name: sponsor.name,
        logo: sponsor.logo,
        description: sponsor.description,
        website: sponsor.website,
        ctaText: sponsor.ctaText,
        isActive: sponsor.isActive,
        priority: sponsor.priority,
        startDate: sponsor.startDate,
        endDate: sponsor.endDate,
        createdAt: sponsor.createdAt,
        stats: sponsor.stats
      }
    });
  } catch (error) {
    console.error("Erreur lors de la création du sponsor:", error);
    response.status(500).json({ error: "Erreur interne du serveur" });
  }
}

/**
 * PUT /api/sponsors/:id - Mettre à jour un sponsor
 */
export async function updateSponsorController(request: Request, response: Response) {
  const userId = response.locals.auth?.userId;
  const { id } = request.params;

  if (!userId) {
    response.status(401).json({ error: "Authentification requise." });
    return;
  }

  if (Array.isArray(id)) {
    response.status(400).json({ error: "ID invalide" });
    return;
  }

  // TODO: Vérifier que l'utilisateur est admin
  // if (!await isUserAdmin(userId)) {
  //   response.status(403).json({ error: "Accès administrateur requis." });
  //   return;
  // }

  const input: UpdateSponsorInput = request.body;

  try {
    const sponsor = await sponsorService.updateSponsor(id, input);

    if (!sponsor) {
      response.status(404).json({ error: "Sponsor non trouvé" });
      return;
    }

    response.json({
      sponsor: {
        id: sponsor._id.toString(),
        name: sponsor.name,
        logo: sponsor.logo,
        description: sponsor.description,
        website: sponsor.website,
        ctaText: sponsor.ctaText,
        isActive: sponsor.isActive,
        priority: sponsor.priority,
        startDate: sponsor.startDate,
        endDate: sponsor.endDate,
        updatedAt: sponsor.updatedAt,
        stats: sponsor.stats
      }
    });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du sponsor ${id}:`, error);
    response.status(500).json({ error: "Erreur interne du serveur" });
  }
}

/**
 * DELETE /api/sponsors/:id - Supprimer un sponsor
 */
export async function deleteSponsorController(request: Request, response: Response) {
  const userId = response.locals.auth?.userId;
  const { id } = request.params;

  if (!userId) {
    response.status(401).json({ error: "Authentification requise." });
    return;
  }

  if (Array.isArray(id)) {
    response.status(400).json({ error: "ID invalide" });
    return;
  }

  // TODO: Vérifier que l'utilisateur est admin
  // if (!await isUserAdmin(userId)) {
  //   response.status(403).json({ error: "Accès administrateur requis." });
  //   return;
  // }

  try {
    const deleted = await sponsorService.deleteSponsor(id);

    if (!deleted) {
      response.status(404).json({ error: "Sponsor non trouvé" });
      return;
    }

    response.status(204).send();
  } catch (error) {
    console.error(`Erreur lors de la suppression du sponsor ${id}:`, error);
    response.status(500).json({ error: "Erreur interne du serveur" });
  }
}

/**
 * POST /api/sponsors/:id/stats - Incrémenter les statistiques d'un sponsor
 */
export async function incrementSponsorStatsController(request: Request, response: Response) {
  const { id } = request.params;
  const { type } = request.body as { type?: 'impressions' | 'clicks' };

  if (Array.isArray(id)) {
    response.status(400).json({ error: "ID invalide" });
    return;
  }

  if (!type || !['impressions', 'clicks'].includes(type)) {
    response.status(400).json({ error: "Type de statistique invalide. Utilisez 'impressions' ou 'clicks'." });
    return;
  }

  try {
    await sponsorService.incrementSponsorStats(id, type);
    response.status(200).json({ success: true });
  } catch (error) {
    console.error(`Erreur lors de l'incrémentation des stats du sponsor ${id}:`, error);
    response.status(500).json({ error: "Erreur interne du serveur" });
  }
}