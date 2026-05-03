import type { Request, Response } from "express";
import * as paymentService from "../services/paymentService.js";
import type { PaymentPlan, PaymentProvider } from "../models/PaymentTransaction.js";

export function getPaymentPlansController(_request: Request, response: Response) {
  response.json({ plans: Object.values(paymentService.paymentPlans) });
}

export async function createCheckoutController(request: Request, response: Response) {
  const userId = response.locals.auth?.userId;

  if (!userId) {
    response.status(401).json({ error: "Authentification requise." });
    return;
  }

  const { plan, provider, idempotencyKey } = request.body as {
    plan?: PaymentPlan;
    provider?: PaymentProvider;
    idempotencyKey?: string;
  };

  if (!plan) {
    response.status(400).json({ error: "Plan requis." });
    return;
  }

  try {
    const result = await paymentService.createCheckout({
      userId,
      plan,
      provider,
      idempotencyKey
    });

    response.status(201).json({
      transaction: {
        id: result.transaction._id.toString(),
        provider: result.transaction.provider,
        plan: result.transaction.plan,
        amount: result.transaction.amount,
        currency: result.transaction.currency,
        status: result.transaction.status,
        checkoutUrl: result.checkoutUrl,
        expiresAt: result.transaction.expiresAt
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la création du paiement.";
    response.status(400).json({ error: message });
  }
}

export async function getCurrentSubscriptionController(request: Request, response: Response) {
  const userId = response.locals.auth?.userId;

  if (!userId) {
    response.status(401).json({ error: "Authentification requise." });
    return;
  }

  const subscription = await paymentService.getCurrentSubscription(userId);
  response.json({ subscription });
}

export async function getPaymentHistoryController(request: Request, response: Response) {
  const userId = response.locals.auth?.userId;

  if (!userId) {
    response.status(401).json({ error: "Authentification requise." });
    return;
  }

  const transactions = await paymentService.listUserTransactions(userId);
  response.json({ transactions });
}

export async function paymentWebhookController(request: Request, response: Response) {
  const provider = request.params.provider as PaymentProvider;
  const { providerReference, status, metadata } = request.body as {
    providerReference?: string;
    status?: string;
    metadata?: Record<string, unknown>;
  };

  if (!providerReference) {
    response.status(400).json({ error: "providerReference requis." });
    return;
  }

  if (status !== "paid") {
    response.json({ received: true, ignored: true });
    return;
  }

  try {
    const transaction = await paymentService.markTransactionPaid({
      provider,
      providerReference,
      metadata
    });

    response.json({
      received: true,
      transactionId: transaction._id.toString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook paiement invalide.";
    response.status(404).json({ error: message });
  }
}
