import { CreatorModel, ICreator } from "../models/Creator";
import { PaymentTransactionModel, IPaymentTransaction } from "../models/PaymentTransaction";
import { SubscriptionModel, ISubscription } from "../models/Subscription";
import { UserModel } from "../models/User";
import { Types } from "mongoose";

// Paystack integration (mock implementation)
// In production, this would use the actual Paystack SDK
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";

export interface SponsorshipTier {
  id: string;
  name: string;
  amount: number; // in FCFA
  benefits: string[];
  isDefault: boolean;
}

export interface SponsorshipRequest {
  sponsorId: string;
  creatorId: string;
  tierId: string;
  amount: number;
  message?: string;
  isAnonymous: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number; // monthly in FCFA
  benefits: string[];
  features: string[];
  isActive: boolean;
}

export interface DonationRequest {
  donorId: string;
  creatorId: string;
  amount: number;
  message?: string;
  isAnonymous: boolean;
}

export interface MonetizationSettings {
  acceptSponsors: boolean;
  acceptSubscriptions: boolean;
  acceptDonations: boolean;
  minimumDonation: number;
  sponsorshipTiers: SponsorshipTier[];
  subscriptionPlans: SubscriptionPlan[];
  payoutSettings: {
    bankAccount: string;
    payoutFrequency: "weekly" | "monthly";
    minimumPayout: number;
  };
}

export interface MonetizationSummary {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueBreakdown: {
    sponsorships: number;
    subscriptions: number;
    donations: number;
    content: number;
  };
  activeSponsors: number;
  activeSubscribers: number;
  totalDonors: number;
  nextPayout: number;
  lastPayout: Date | null;
}

class CreatorMonetizationService {
  /**
   * Initialize monetization for a creator
   */
  async initializeMonetization(creatorId: string, settings: Partial<MonetizationSettings>): Promise<void> {
    try {
      const creator = await CreatorModel.findById(creatorId);
      if (!creator) {
        throw new Error("Creator not found");
      }

      // Update creator monetization settings
      await CreatorModel.findByIdAndUpdate(creatorId, {
        "monetization.isEnabled": true,
        "monetization.paystackAccountId": settings.payoutSettings?.bankAccount || "",
        "settings.allowCollaboration": settings.acceptSponsors || false,
        "sponsorSettings.acceptsSponsors": settings.acceptSponsors || false,
        "sponsorSettings.minimumAmount": settings.minimumDonation || 1000,
        "sponsorSettings.sponsorTiers": settings.sponsorshipTiers || this.getDefaultSponsorshipTiers()
      });

      console.log(`Monetization initialized for creator: ${creatorId}`);
    } catch (error) {
      console.error("Error initializing monetization:", error);
      throw error;
    }
  }

  /**
   * Get default sponsorship tiers
   */
  private getDefaultSponsorshipTiers(): SponsorshipTier[] {
    return [
      {
        id: "bronze",
        name: "Bronze Supporter",
        amount: 1000, // 1000 FCFA
        benefits: ["Supporter badge", "Early access to content"],
        isDefault: true
      },
      {
        id: "silver",
        name: "Silver Supporter", 
        amount: 5000, // 5000 FCFA
        benefits: ["Silver badge", "Early access", "Exclusive content"],
        isDefault: false
      },
      {
        id: "gold",
        name: "Gold Supporter",
        amount: 10000, // 10000 FCFA
        benefits: ["Gold badge", "Early access", "Exclusive content", "Monthly shoutout"],
        isDefault: false
      },
      {
        id: "platinum",
        name: "Platinum Supporter",
        amount: 25000, // 25000 FCFA
        benefits: ["Platinum badge", "All benefits", "Collaboration opportunities", "Personal thank you"],
        isDefault: false
      }
    ];
  }

  /**
   * Get default subscription plans
   */
  private getDefaultSubscriptionPlans(): SubscriptionPlan[] {
    return [
      {
        id: "basic",
        name: "Basic Supporter",
        price: 2000, // 2000 FCFA/month
        benefits: ["Ad-free experience", "Bonus content"],
        features: ["Access to supporter-only posts", "Monthly Q&A"],
        isActive: true
      },
      {
        id: "premium",
        name: "Premium Supporter",
        price: 5000, // 5000 FCFA/month
        benefits: ["All basic benefits", "Exclusive content", "Early access"],
        features: ["All basic features", "Exclusive videos", "Behind-the-scenes content", "Priority support"],
        isActive: true
      },
      {
        id: "vip",
        name: "VIP Supporter",
        price: 10000, // 10000 FCFA/month
        benefits: ["All premium benefits", "Personal interaction", "Collaboration opportunities"],
        features: ["All premium features", "One-on-one sessions", "Content collaboration", "Personalized recommendations"],
        isActive: true
      }
    ];
  }

  /**
   * Process sponsorship payment
   */
  async processSponsorship(request: SponsorshipRequest): Promise<IPaymentTransaction> {
    try {
      const creator = await CreatorModel.findById(request.creatorId);
      if (!creator || !creator.monetization.isEnabled || !creator.sponsorSettings.acceptsSponsors) {
        throw new Error("Sponsorships not available for this creator");
      }

      const tier = creator.sponsorSettings.sponsorTiers.find((t: any) => t.id === request.tierId);
      if (!tier) {
        throw new Error("Invalid sponsorship tier");
      }

      // Create payment transaction
      const transaction = new PaymentTransactionModel({
        userId: request.sponsorId,
        creatorId: request.creatorId,
        type: "sponsorship",
        amount: request.amount,
        currency: "XOF", // FCFA
        status: "pending",
        metadata: {
          tierId: request.tierId,
          tierName: tier.name,
          message: request.message,
          isAnonymous: request.isAnonymous
        }
      });

      await transaction.save();

      // Process payment with Paystack (mock implementation)
      const paymentResult = await this.processPayment(transaction._id.toString(), request.amount, "sponsorship");

      if (paymentResult.success) {
        transaction.status = "completed";
        transaction.paymentReference = paymentResult.reference;
        await transaction.save();

        // Update creator stats
        await CreatorModel.findByIdAndUpdate(request.creatorId, {
          $inc: { "monetization.totalEarnings": request.amount }
        });
      }

      return transaction;
    } catch (error) {
      console.error("Error processing sponsorship:", error);
      throw error;
    }
  }

  /**
   * Process subscription payment
   */
  async processSubscription(userId: string, creatorId: string, planId: string): Promise<ISubscription> {
    try {
      const creator = await CreatorModel.findById(creatorId);
      if (!creator || !creator.monetization.isEnabled) {
        throw new Error("Subscriptions not available for this creator");
      }

      const plans = this.getDefaultSubscriptionPlans();
      const plan = plans.find(p => p.id === planId);
      if (!plan || !plan.isActive) {
        throw new Error("Invalid subscription plan");
      }

      // Check if user already has an active subscription
      const existingSubscription = await SubscriptionModel.findOne({
        userId,
        creatorId,
        status: "active"
      });

      if (existingSubscription) {
        throw new Error("User already has an active subscription");
      }

      // Create subscription
      const subscription = new SubscriptionModel({
        userId,
        creatorId,
        planId,
        planName: plan.name,
        amount: plan.price,
        currency: "XOF",
        status: "pending",
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      });

      await subscription.save();

      // Process payment
      const paymentResult = await this.processPayment(subscription._id.toString(), plan.price, "subscription");

      if (paymentResult.success) {
        subscription.status = "active";
        subscription.paymentReference = paymentResult.reference;
        await subscription.save();

        // Create payment transaction record
        const transaction = new PaymentTransactionModel({
          userId,
          creatorId,
          type: "subscription",
          amount: plan.price,
          currency: "XOF",
          status: "completed",
          paymentReference: paymentResult.reference,
          metadata: {
            subscriptionId: subscription._id,
            planId,
            planName: plan.name
          }
        });

        await transaction.save();

        // Update creator stats
        await CreatorModel.findByIdAndUpdate(creatorId, {
          $inc: { "monetization.totalEarnings": plan.price }
        });
      }

      return subscription;
    } catch (error) {
      console.error("Error processing subscription:", error);
      throw error;
    }
  }

  /**
   * Process donation
   */
  async processDonation(request: DonationRequest): Promise<IPaymentTransaction> {
    try {
      const creator = await CreatorModel.findById(request.creatorId);
      if (!creator || !creator.monetization.isEnabled) {
        throw new Error("Donations not available for this creator");
      }

      if (request.amount < creator.sponsorSettings.minimumAmount) {
        throw new Error(`Minimum donation amount is ${creator.sponsorSettings.minimumAmount} FCFA`);
      }

      // Create payment transaction
      const transaction = new PaymentTransactionModel({
        userId: request.donorId,
        creatorId: request.creatorId,
        type: "donation",
        amount: request.amount,
        currency: "XOF",
        status: "pending",
        metadata: {
          message: request.message,
          isAnonymous: request.isAnonymous
        }
      });

      await transaction.save();

      // Process payment
      const paymentResult = await this.processPayment(transaction._id.toString(), request.amount, "donation");

      if (paymentResult.success) {
        transaction.status = "completed";
        transaction.paymentReference = paymentResult.reference;
        await transaction.save();

        // Update creator stats
        await CreatorModel.findByIdAndUpdate(request.creatorId, {
          $inc: { "monetization.totalEarnings": request.amount }
        });
      }

      return transaction;
    } catch (error) {
      console.error("Error processing donation:", error);
      throw error;
    }
  }

  /**
   * Process payment with Paystack (mock implementation)
   */
  private async processPayment(transactionId: string, amount: number, type: string): Promise<{
    success: boolean;
    reference: string;
    message?: string;
  }> {
    try {
      // Mock payment processing
      // In production, this would integrate with Paystack API
      const mockPaymentResult = {
        success: true,
        reference: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: "Payment processed successfully"
      };

      console.log(`Mock payment processed: ${type} - ${amount} FCFA - ${mockPaymentResult.reference}`);
      
      return mockPaymentResult;
    } catch (error) {
      console.error("Error processing payment:", error);
      return {
        success: false,
        reference: "",
        message: "Payment processing failed"
      };
    }
  }

  /**
   * Get monetization summary for creator
   */
  async getMonetizationSummary(creatorId: string): Promise<MonetizationSummary> {
    try {
      const creator = await CreatorModel.findById(creatorId);
      if (!creator) {
        throw new Error("Creator not found");
      }

      const now = new Date();
      const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get all transactions
      const allTransactions = await PaymentTransactionModel.find({
        creatorId,
        status: "completed"
      });

      const monthlyTransactions = await PaymentTransactionModel.find({
        creatorId,
        status: "completed",
        createdAt: { $gte: lastMonth }
      });

      // Calculate revenue breakdown
      const calculateRevenue = (transactions: any[]) => {
        const breakdown = {
          sponsorships: 0,
          subscriptions: 0,
          donations: 0,
          content: 0
        };

        transactions.forEach((transaction: any) => {
          switch (transaction.type) {
            case "sponsorship":
              breakdown.sponsorships += transaction.amount;
              break;
            case "subscription":
              breakdown.subscriptions += transaction.amount;
              break;
            case "donation":
              breakdown.donations += transaction.amount;
              break;
            case "content":
              breakdown.content += transaction.amount;
              break;
          }
        });

        return breakdown;
      };

      const totalRevenue = allTransactions.reduce((sum, t) => sum + t.amount, 0);
      const monthlyRevenue = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
      const revenueBreakdown = calculateRevenue(allTransactions);

      // Get active counts
      const activeSponsors = await PaymentTransactionModel.distinct("userId", {
        creatorId,
        type: "sponsorship",
        status: "completed",
        createdAt: { $gte: lastMonth }
      });

      const activeSubscriptions = await SubscriptionModel.countDocuments({
        creatorId,
        status: "active"
      });

      const totalDonors = await PaymentTransactionModel.distinct("userId", {
        creatorId,
        type: "donation",
        status: "completed"
      });

      return {
        totalRevenue,
        monthlyRevenue,
        revenueBreakdown,
        activeSponsors: activeSponsors.length,
        activeSubscribers: activeSubscriptions,
        totalDonors: totalDonors.length,
        nextPayout: monthlyRevenue, // Mock: next payout equals monthly revenue
        lastPayout: null // Would track actual payout dates
      };
    } catch (error) {
      console.error("Error getting monetization summary:", error);
      throw error;
    }
  }

  /**
   * Get creator's monetization settings
   */
  async getMonetizationSettings(creatorId: string): Promise<MonetizationSettings> {
    try {
      const creator = await CreatorModel.findById(creatorId);
      if (!creator) {
        throw new Error("Creator not found");
      }

      return {
        acceptSponsors: creator.sponsorSettings.acceptsSponsors,
        acceptSubscriptions: creator.monetization.isEnabled,
        acceptDonations: creator.monetization.isEnabled,
        minimumDonation: creator.sponsorSettings.minimumAmount,
        sponsorshipTiers: creator.sponsorSettings.sponsorTiers,
        subscriptionPlans: this.getDefaultSubscriptionPlans(),
        payoutSettings: {
          bankAccount: creator.monetization.paystackAccountId || "",
          payoutFrequency: "monthly",
          minimumPayout: 10000 // 10000 FCFA minimum
        }
      };
    } catch (error) {
      console.error("Error getting monetization settings:", error);
      throw error;
    }
  }

  /**
   * Update monetization settings
   */
  async updateMonetizationSettings(creatorId: string, settings: Partial<MonetizationSettings>): Promise<void> {
    try {
      const updateData: any = {};

      if (settings.acceptSponsors !== undefined) {
        updateData["sponsorSettings.acceptsSponsors"] = settings.acceptSponsors;
      }

      if (settings.acceptSubscriptions !== undefined) {
        updateData["monetization.isEnabled"] = settings.acceptSubscriptions;
      }

      if (settings.acceptDonations !== undefined) {
        updateData["monetization.isEnabled"] = settings.acceptDonations;
      }

      if (settings.minimumDonation !== undefined) {
        updateData["sponsorSettings.minimumAmount"] = settings.minimumDonation;
      }

      if (settings.sponsorshipTiers) {
        updateData["sponsorSettings.sponsorTiers"] = settings.sponsorshipTiers;
      }

      if (settings.payoutSettings?.bankAccount) {
        updateData["monetization.paystackAccountId"] = settings.payoutSettings.bankAccount;
      }

      await CreatorModel.findByIdAndUpdate(creatorId, { $set: updateData });
    } catch (error) {
      console.error("Error updating monetization settings:", error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string, creatorId: string): Promise<void> {
    try {
      const subscription = await SubscriptionModel.findOne({
        userId,
        creatorId,
        status: "active"
      });

      if (!subscription) {
        throw new Error("Active subscription not found");
      }

      subscription.status = "cancelled";
      subscription.cancelledAt = new Date();
      await subscription.save();

      console.log(`Subscription cancelled: ${userId} -> ${creatorId}`);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      throw error;
    }
  }

  /**
   * Get user's subscriptions
   */
  async getUserSubscriptions(userId: string): Promise<Array<{
    subscription: ISubscription;
    creator: ICreator;
  }>> {
    try {
      const subscriptions = await SubscriptionModel.find({
        userId,
        status: "active"
      }).populate('creatorId');

      return subscriptions.map(sub => ({
        subscription: sub,
        creator: sub.creatorId as ICreator
      }));
    } catch (error) {
      console.error("Error getting user subscriptions:", error);
      throw error;
    }
  }

  /**
   * Process recurring subscription payments
   */
  async processRecurringPayments(): Promise<void> {
    try {
      const now = new Date();
      const dueSubscriptions = await SubscriptionModel.find({
        status: "active",
        nextBillingDate: { $lte: now }
      }).populate('creatorId');

      for (const subscription of dueSubscriptions) {
        try {
          // Process recurring payment
          const paymentResult = await this.processPayment(
            subscription._id.toString(),
            subscription.amount,
            "subscription"
          );

          if (paymentResult.success) {
            // Update subscription
            subscription.nextBillingDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            subscription.lastPaymentAt = now;
            await subscription.save();

            // Create payment transaction
            const transaction = new PaymentTransactionModel({
              userId: subscription.userId,
              creatorId: subscription.creatorId,
              type: "subscription",
              amount: subscription.amount,
              currency: "XOF",
              status: "completed",
              paymentReference: paymentResult.reference,
              metadata: {
                subscriptionId: subscription._id,
                planId: subscription.planId,
                planName: subscription.planName,
                recurring: true
              }
            });

            await transaction.save();

            console.log(`Recurring payment processed for subscription: ${subscription._id}`);
          } else {
            // Mark subscription as failed
            subscription.status = "payment_failed";
            await subscription.save();
            console.error(`Recurring payment failed for subscription: ${subscription._id}`);
          }
        } catch (error) {
          console.error(`Error processing recurring payment for subscription ${subscription._id}:`, error);
        }
      }
    } catch (error) {
      console.error("Error processing recurring payments:", error);
    }
  }
}

export const creatorMonetizationService = new CreatorMonetizationService();
