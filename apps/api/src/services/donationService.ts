/**
 * MAATFEED Donation Service
 * Handles tips, donations, and support payments between users
 */

import crypto from "node:crypto";
import { Types } from "mongoose";
import { logger } from "../config/logger.js";
import { DonationModel, type IDonation, type DonationType } from "../models/Donation.js";
import { UserModel } from "../models/User.js";
import { initializePayment, verifyPayment, PaymentType } from "./paystackService.js";

export interface CreateDonationInput {
  donorId: string;
  creatorId: string;
  type: DonationType;
  amount: number;
  message?: string;
  isAnonymous?: boolean;
  currency?: string;
}

export interface DonationResult {
  donation: IDonation;
  checkoutUrl: string;
  providerReference: string;
}

// Predefined donation amounts for quick selection
export const DONATION_AMOUNTS = [
  { amount: 500, label: "500 FCFA", description: "Petit soutien" },
  { amount: 1000, label: "1k FCFA", description: "Soutien régulier" },
  { amount: 2500, label: "2.5k FCFA", description: "Bon soutien" },
  { amount: 5000, label: "5k FCFA", description: "Grand soutien" },
  { amount: 10000, label: "10k FCFA", description: "Soutien premium" }
];

/**
 * Create a new donation/tip transaction
 */
export async function createDonation(input: CreateDonationInput): Promise<DonationResult> {
  try {
    // Validate donor and creator exist
    const [donor, creator] = await Promise.all([
      UserModel.findById(input.donorId),
      UserModel.findById(input.creatorId)
    ]);

    if (!donor) {
      throw new Error("Donateur non trouvé");
    }

    if (!creator) {
      throw new Error("Créateur non trouvé");
    }

    if (input.donorId === input.creatorId) {
      throw new Error("Impossible de faire un don à soi-même");
    }

    // Validate amount
    if (input.amount < 100) {
      throw new Error("Le montant minimum est de 100 FCFA");
    }

    if (input.amount > 1000000) {
      throw new Error("Le montant maximum est de 10,000 FCFA");
    }

    // Create donation record
    const donation = await DonationModel.create({
      donorId: new Types.ObjectId(input.donorId),
      creatorId: new Types.ObjectId(input.creatorId),
      type: input.type,
      amount: input.amount,
      currency: input.currency || "XAF",
      message: input.message?.trim(),
      isAnonymous: input.isAnonymous || false,
      status: "pending",
      provider: "paystack",
      metadata: {
        platform: "MAATFEED",
        userAgent: "web"
      }
    });

    // Initialize payment with Paystack
    const paymentResult = await initializePayment({
      email: donor.email,
      amount: input.amount * 100, // Convert to kobo
      currency: input.currency || "XAF",
      paymentType: PaymentType.DONATION,
      userId: input.donorId,
      creatorId: input.creatorId,
      metadata: {
        donationId: donation._id.toString(),
        type: input.type,
        isAnonymous: input.isAnonymous
      },
      callback_url: `${process.env.FRONTEND_URL}/donation/success`
    });

    // Update donation with payment reference
    donation.providerReference = paymentResult.reference;
    await donation.save();

    logger.info({
      msg: "Donation created successfully",
      donationId: donation._id,
      donorId: input.donorId,
      creatorId: input.creatorId,
      amount: input.amount,
      type: input.type
    });

    return {
      donation,
      checkoutUrl: paymentResult.authorization_url,
      providerReference: paymentResult.reference
    };

  } catch (error) {
    logger.error({
      msg: "Failed to create donation",
      error: error instanceof Error ? error.message : "Unknown error",
      input
    });
    throw error;
  }
}

/**
 * Process successful donation payment
 */
export async function processDonationPayment(providerReference: string): Promise<IDonation> {
  try {
    // Find donation by provider reference
    const donation = await DonationModel.findOne({ providerReference });
    
    if (!donation) {
      throw new Error("Donation non trouvée");
    }

    if (donation.status === "completed") {
      return donation;
    }

    // Verify payment with Paystack
    const verification = await verifyPayment(providerReference);
    
    if (!verification.status || verification.data.status !== "success") {
      throw new Error("Paiement non vérifié");
    }

    // Update donation status
    donation.status = "completed";
    donation.paidAt = new Date();
    donation.metadata = {
      ...donation.metadata,
      verificationData: verification.data,
      paidAt: verification.data.paid_at
    };
    
    await donation.save();

    // Update creator's total earnings
    await UserModel.findByIdAndUpdate(
      donation.creatorId,
      {
        $inc: { totalEarnings: donation.amount },
        $push: {
          earnings: {
            amount: donation.amount,
            type: donation.type,
            donationId: donation._id,
            date: new Date()
          }
        }
      }
    );

    logger.info({
      msg: "Donation payment processed successfully",
      donationId: donation._id,
      creatorId: donation.creatorId,
      amount: donation.amount
    });

    return donation;

  } catch (error) {
    logger.error({
      msg: "Failed to process donation payment",
      providerReference,
      error: error instanceof Error ? error.message : "Unknown error"
    });
    throw error;
  }
}

/**
 * Get donations for a creator
 */
export async function getCreatorDonations(
  creatorId: string,
  options: {
    page?: number;
    limit?: number;
    status?: string;
    type?: DonationType;
  } = {}
) {
  const { page = 1, limit = 20, status, type } = options;
  const skip = (page - 1) * limit;

  const query: any = { creatorId: new Types.ObjectId(creatorId) };
  
  if (status) {
    query.status = status;
  }
  
  if (type) {
    query.type = type;
  }

  const [donations, total] = await Promise.all([
    DonationModel.find(query)
      .populate("donorId", "username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    DonationModel.countDocuments(query)
  ]);

  return {
    donations,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

/**
 * Get donations made by a user
 */
export async function getUserDonations(
  donorId: string,
  options: {
    page?: number;
    limit?: number;
    status?: string;
    type?: DonationType;
  } = {}
) {
  const { page = 1, limit = 20, status, type } = options;
  const skip = (page - 1) * limit;

  const query: any = { donorId: new Types.ObjectId(donorId) };
  
  if (status) {
    query.status = status;
  }
  
  if (type) {
    query.type = type;
  }

  const [donations, total] = await Promise.all([
    DonationModel.find(query)
      .populate("creatorId", "username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    DonationModel.countDocuments(query)
  ]);

  return {
    donations,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

/**
 * Get donation statistics for a creator
 */
export async function getCreatorDonationStats(creatorId: string) {
  const stats = await DonationModel.aggregate([
    { $match: { creatorId: new Types.ObjectId(creatorId), status: "completed" } },
    {
      $group: {
        _id: "$type",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
        averageAmount: { $avg: "$amount" }
      }
    }
  ]);

  const totalStats = await DonationModel.aggregate([
    { $match: { creatorId: new Types.ObjectId(creatorId), status: "completed" } },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
        averageAmount: { $avg: "$amount" }
      }
    }
  ]);

  return {
    byType: stats,
    total: totalStats[0] || { totalAmount: 0, count: 0, averageAmount: 0 }
  };
}

/**
 * Get trending creators by donations
 */
export async function getTrendingCreatorsByDonations(limit: number = 10) {
  const trending = await DonationModel.aggregate([
    { $match: { status: "completed", createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
    {
      $group: {
        _id: "$creatorId",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
        uniqueDonors: { $addToSet: "$donorId" }
      }
    },
    {
      $addFields: {
        uniqueDonorCount: { $size: "$uniqueDonors" }
      }
    },
    { $sort: { totalAmount: -1, uniqueDonorCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "creator"
      }
    },
    { $unwind: "$creator" },
    {
      $project: {
        creatorId: "$_id",
        username: "$creator.username",
        avatar: "$creator.avatar",
        totalAmount: 1,
        count: 1,
        uniqueDonorCount: 1
      }
    }
  ]);

  return trending;
}

export default {
  createDonation,
  processDonationPayment,
  getCreatorDonations,
  getUserDonations,
  getCreatorDonationStats,
  getTrendingCreatorsByDonations,
  DONATION_AMOUNTS
};
