import type { Request, Response } from "express";
import * as donationService from "../services/donationService.js";
import type { DonationType } from "../models/Donation.js";

export function getDonationAmountsController(_request: Request, response: Response) {
  response.json({ amounts: donationService.DONATION_AMOUNTS });
}

export async function createDonationController(request: Request, response: Response) {
  const userId = response.locals.auth?.userId;

  if (!userId) {
    response.status(401).json({ error: "Authentification requise." });
    return;
  }

  const {
    creatorId,
    type,
    amount,
    message,
    isAnonymous,
    currency
  } = request.body as {
    creatorId?: string;
    type?: DonationType;
    amount?: number;
    message?: string;
    isAnonymous?: boolean;
    currency?: string;
  };

  if (!creatorId || !type || !amount) {
    response.status(400).json({ 
      error: "Champs requis: creatorId, type, amount." 
    });
    return;
  }

  try {
    const result = await donationService.createDonation({
      donorId: userId,
      creatorId,
      type,
      amount,
      message,
      isAnonymous,
      currency
    });

    response.status(201).json({
      donation: {
        id: result.donation._id.toString(),
        type: result.donation.type,
        amount: result.donation.amount,
        currency: result.donation.currency,
        message: result.donation.message,
        isAnonymous: result.donation.isAnonymous,
        status: result.donation.status,
        createdAt: result.donation.createdAt
      },
      checkoutUrl: result.checkoutUrl,
      providerReference: result.providerReference
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la création du don.";
    response.status(400).json({ error: message });
  }
}

export async function getCreatorDonationsController(request: Request, response: Response) {
  const { creatorId } = request.params;
  const {
    page = "1",
    limit = "20",
    status,
    type
  } = request.query as {
    page?: string;
    limit?: string;
    status?: string;
    type?: DonationType;
  };

  if (!creatorId) {
    response.status(400).json({ error: "creatorId requis." });
    return;
  }

  try {
    const creatorIdStr = Array.isArray(request.params.creatorId) ? request.params.creatorId[0] : request.params.creatorId;
    const result = await donationService.getCreatorDonations(creatorIdStr, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      status,
      type
    });

    response.json({
      donations: result.donations.map(donation => ({
        id: donation._id.toString(),
        donorId: donation.donorId,
        type: donation.type,
        amount: donation.amount,
        currency: donation.currency,
        message: donation.message,
        isAnonymous: donation.isAnonymous,
        status: donation.status,
        paidAt: donation.paidAt,
        createdAt: donation.createdAt,
        donor: donation.isAnonymous ? null : {
          username: (donation.donorId as any)?.username,
          avatar: (donation.donorId as any)?.avatar
        }
      })),
      pagination: result.pagination
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la récupération des dons.";
    response.status(400).json({ error: message });
  }
}

export async function getUserDonationsController(request: Request, response: Response) {
  const userId = response.locals.auth?.userId;

  if (!userId) {
    response.status(401).json({ error: "Authentification requise." });
    return;
  }

  const {
    page = "1",
    limit = "20",
    status,
    type
  } = request.query as {
    page?: string;
    limit?: string;
    status?: string;
    type?: DonationType;
  };

  try {
    const result = await donationService.getUserDonations(userId, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      status,
      type
    });

    response.json({
      donations: result.donations.map(donation => ({
        id: donation._id.toString(),
        creatorId: donation.creatorId,
        type: donation.type,
        amount: donation.amount,
        currency: donation.currency,
        message: donation.message,
        isAnonymous: donation.isAnonymous,
        status: donation.status,
        paidAt: donation.paidAt,
        createdAt: donation.createdAt,
        creator: {
          username: (donation.creatorId as any)?.username,
          avatar: (donation.creatorId as any)?.avatar
        }
      })),
      pagination: result.pagination
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la récupération des dons.";
    response.status(400).json({ error: message });
  }
}

export async function getCreatorDonationStatsController(request: Request, response: Response) {
  const { creatorId } = request.params;

  if (!creatorId) {
    response.status(400).json({ error: "creatorId requis." });
    return;
  }

  try {
    const creatorIdStr = Array.isArray(request.params.creatorId) ? request.params.creatorId[0] : request.params.creatorId;
    const stats = await donationService.getCreatorDonationStats(creatorIdStr);
    response.json({ stats });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la récupération des statistiques.";
    response.status(400).json({ error: message });
  }
}

export async function getTrendingCreatorsController(request: Request, response: Response) {
  const { limit = "10" } = request.query as { limit?: string };

  try {
    const trending = await donationService.getTrendingCreatorsByDonations(
      parseInt(limit, 10)
    );
    response.json({ trending });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la récupération des créateurs tendance.";
    response.status(400).json({ error: message });
  }
}

export async function donationWebhookController(request: Request, response: Response) {
  const { reference } = request.body as { reference?: string };

  if (!reference) {
    response.status(400).json({ error: "Référence requise." });
    return;
  }

  try {
    const donation = await donationService.processDonationPayment(reference);
    
    response.json({
      received: true,
      donationId: donation._id.toString(),
      status: donation.status
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook don invalide.";
    response.status(404).json({ error: message });
  }
}
