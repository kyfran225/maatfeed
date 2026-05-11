/**
 * MAATFEED Paystack Payment Service
 * Handles all payment operations through Paystack for African markets
 */

import paystack from 'paystack';
import { logger } from '../config/logger';

// Initialize Paystack with test/production key
const paystackClient = paystack(process.env.PAYSTACK_SECRET_KEY || 'sk_test_demo');

// Payment types for MAATFEED
export enum PaymentType {
  SUBSCRIPTION = 'subscription',
  DONATION = 'donation',
  TIP = 'tip',
  SPONSORSHIP = 'sponsorship',
  CONTENT_PURCHASE = 'content_purchase'
}

// Subscription plans
export interface SubscriptionPlan {
  id: string;
  name: string;
  amount: number; // in kobo (1000 = 10 FCFA)
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  description: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic-monthly',
    name: 'MAATFEED Basic',
    amount: 100000, // 1000 FCFA
    currency: 'XAF',
    interval: 'monthly',
    features: [
      'Accès illimité au contenu',
      'Création de 3 débats par mois',
      'Support par email'
    ],
    description: 'Idéal pour découvrir la plateforme'
  },
  {
    id: 'premium-monthly',
    name: 'MAATFEED Premium',
    amount: 250000, // 2500 FCFA
    currency: 'XAF',
    interval: 'monthly',
    features: [
      'Tout le plan Basic',
      'Création illimitée de débats',
      'Contenu exclusif',
      'Analytiques avancées',
      'Badge Premium'
    ],
    description: 'Pour les créateurs passionnés'
  },
  {
    id: 'creator-monthly',
    name: 'MAATFEED Creator',
    amount: 500000, // 5000 FCFA
    currency: 'XAF',
    interval: 'monthly',
    features: [
      'Tout le plan Premium',
      'Monétisation activée',
      'Revenus partagés 70/30',
      'Outils de création IA',
      'Support prioritaire'
    ],
    description: 'Pour les créateurs professionnels'
  }
];

// Payment interface
export interface PaymentRequest {
  email: string;
  amount: number; // in kobo
  currency: string;
  paymentType: PaymentType;
  userId?: string;
  creatorId?: string; // for tips and sponsorships
  contentId?: string; // for content purchase
  subscriptionPlanId?: string;
  metadata?: Record<string, any>;
  callback_url?: string;
}

export interface PaymentResponse {
  reference: string;
  authorization_url: string;
  access_code: string;
  status: string;
}

export interface PaymentVerification {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
    created_at: string;
    channel: string;
    metadata: any;
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
  };
}

/**
 * Initialize a payment transaction
 */
export async function initializePayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
  try {
    logger.info({
      msg: 'Initializing Paystack payment',
      email: paymentData.email,
      amount: paymentData.amount,
      type: paymentData.paymentType
    });

    // Build metadata for Paystack
    const metadata = {
      paymentType: paymentData.paymentType,
      userId: paymentData.userId,
      creatorId: paymentData.creatorId,
      contentId: paymentData.contentId,
      subscriptionPlanId: paymentData.subscriptionPlanId,
      platform: 'MAATFEED',
      ...paymentData.metadata
    };

    const response = await paystackClient.transaction.initialize({
      email: paymentData.email,
      amount: paymentData.amount,
      currency: paymentData.currency || 'XAF',
      reference: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: paymentData.email.split('@')[0] || 'Customer',
      callback_url: paymentData.callback_url || `${process.env.FRONTEND_URL}/payment/callback`,
      metadata,
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'] // Support African payment methods
    });

    if (!response.status) {
      throw new Error(`Paystack initialization failed: ${response.message}`);
    }

    logger.info({ msg: 'Payment initialized successfully', reference: response.data.reference, authorization_url: response.data.authorization_url });

    return {
      reference: response.data.reference,
      authorization_url: response.data.authorization_url,
      access_code: response.data.access_code,
      status: response.data.status
    };

  } catch (error) {
    logger.error({ msg: 'Payment initialization failed', error });
    throw new Error(`Payment initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify a payment transaction
 */
export async function verifyPayment(reference: string): Promise<PaymentVerification> {
  try {
    logger.info({ msg: 'Verifying Paystack payment', reference });

    const response = await paystackClient.transaction.verify(reference);

    if (!response.status) {
      throw new Error(`Payment verification failed: ${response.message}`);
    }

    logger.info({ msg: 'Payment verification completed', reference, status: response.data.status, amount: response.data.amount, paid_at: response.data.paid_at });

    return response.data;

  } catch (error) {
    logger.error({ msg: 'Payment verification failed', reference, error });
    throw new Error(`Payment verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a subscription plan (recurring payment)
 */
export async function createSubscriptionPlan(plan: SubscriptionPlan): Promise<any> {
  try {
    logger.info({ msg: 'Creating Paystack subscription plan', planId: plan.id });

    const response = await paystackClient.plan.create({
      name: plan.name,
      amount: plan.amount,
      interval: plan.interval,
      currency: plan.currency,
      description: plan.description
    });

    if (!response.status) {
      throw new Error(`Plan creation failed: ${response.message}`);
    }

    logger.info({ msg: 'Subscription plan created successfully', planCode: response.data.plan_code, planId: plan.id });

    return response.data;

  } catch (error) {
    logger.error({ msg: 'Subscription plan creation failed', planId: plan.id, error });
    throw new Error(`Plan creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Initialize a subscription payment
 */
export async function initializeSubscription(
  email: string,
  planCode: string,
  userId: string,
  amount: number,
  paymentType: PaymentType
): Promise<PaymentResponse> {
  try {
    logger.info({ msg: 'Initializing Paystack subscription', email, planCode, userId });

    const response = await paystackClient.transaction.initialize({
      email,
      amount,
      currency: 'XAF',
      reference: `SUB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: email.split('@')[0] || 'Customer',
      plan: planCode,
      callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
      metadata: {
        paymentType,
        userId,
        planCode,
        platform: 'MAATFEED'
      }
    });

    if (!response.status) {
      throw new Error(`Subscription initialization failed: ${response.message}`);
    }

    logger.info({ msg: 'Subscription initialized successfully', reference: response.data.reference, planCode });

    return {
      reference: response.data.reference,
      authorization_url: response.data.authorization_url,
      access_code: response.data.access_code,
      status: response.data.status
    };

  } catch (error) {
    logger.error({ msg: 'Subscription initialization failed', email, planCode, error });
    throw new Error(`Subscription initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Process mobile money payment (African specific)
 */
export async function processMobileMoneyPayment(
  email: string,
  amount: number,
  phone: string,
  provider: 'mtn' | 'orange' | 'airtel' | 'other',
  paymentType: PaymentType,
  metadata?: Record<string, any>
): Promise<PaymentResponse> {
  try {
    logger.info({ msg: 'Processing mobile money payment', email, amount, provider });

    const response = await paystackClient.transaction.initialize({
      email,
      amount,
      currency: 'XAF',
      reference: `MM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: email.split('@')[0] || 'Customer',
      callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
      metadata: {
        paymentType,
        provider,
        phone,
        platform: 'MAATFEED',
        ...metadata
      }
    });

    if (!response.status) {
      throw new Error(`Mobile money payment failed: ${response.message}`);
    }

    logger.info({ msg: 'Mobile money payment initiated', reference: response.data.reference, provider });

    return {
      reference: response.data.reference,
      authorization_url: response.data.authorization_url,
      access_code: response.data.access_code,
      status: response.data.status
    };

  } catch (error) {
    logger.error({ msg: 'Mobile money payment failed', email, provider, error });
    throw new Error(`Mobile money payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get transaction history for a user
 */
export async function getTransactionHistory(customerId?: string): Promise<any> {
  try {
    logger.info({ msg: 'Fetching transaction history', customerId });

    const response = await paystackClient.transaction.list();

    if (!response.status) {
      throw new Error(`Failed to fetch transactions: ${response.message}`);
    }

    logger.info({ msg: 'Transaction history fetched', count: response.data.length, customerId });

    return response.data;

  } catch (error) {
    logger.error({ msg: 'Failed to fetch transaction history', customerId, error });
    throw new Error(`Failed to fetch transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate Paystack webhook signature
 */
export function validateWebhookSignature(
  payload: string,
  signature: string
): boolean {
  try {
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET || '')
      .update(payload)
      .digest('hex');

    return hash === signature;
  } catch (error) {
    logger.error({ msg: 'Webhook signature validation failed', error });
    return false;
  }
}

/**
 * Process Paystack webhook events
 */
export async function processWebhookEvent(event: any): Promise<void> {
  try {
    logger.info({ msg: 'Processing Paystack webhook event', event: event.event, reference: event.data?.reference });

    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data);
        break;

      case 'subscription.create':
        await handleSubscriptionCreated(event.data);
        break;

      case 'subscription.disable':
        await handleSubscriptionDisabled(event.data);
        break;

      case 'invoice.payment_failed':
        await handleFailedPayment(event.data);
        break;

      default:
        logger.info({ msg: 'Unhandled webhook event', event: event.event });
    }

  } catch (error) {
    logger.error({ msg: 'Webhook processing failed', event: event.event, error });
    throw error;
  }
}

async function handleSuccessfulPayment(data: any): Promise<void> {
  // This would update user subscription, send notifications, etc.
  logger.info({ msg: 'Payment successful', reference: data.reference, amount: data.amount, customer: data.customer?.email });
}

async function handleSubscriptionCreated(data: any): Promise<void> {
  logger.info({ msg: 'Subscription created', subscription_code: data.subscription_code, customer: data.customer?.email });
}

async function handleSubscriptionDisabled(data: any): Promise<void> {
  logger.info({ msg: 'Subscription disabled', subscription_code: data.subscription_code, customer: data.customer?.email });
}

async function handleFailedPayment(data: any): Promise<void> {
  logger.info({ msg: 'Payment failed', reference: data.reference, customer: data.customer?.email });
}

export default {
  initializePayment,
  verifyPayment,
  createSubscriptionPlan,
  initializeSubscription,
  processMobileMoneyPayment,
  getTransactionHistory,
  validateWebhookSignature,
  processWebhookEvent,
  SUBSCRIPTION_PLANS,
  PaymentType
};
