# MAATFEED - Payment Strategy

## Decision

Use a payment aggregator first. Do not make the MVP depend on direct Orange Money or MTN Mobile Money API access.

Direct operator integrations can be added later behind the same internal payment routes if MAATFEED reaches enough volume to justify the administrative work.

## Why

- Direct Orange/MTN API access is usually slower to obtain and harder to maintain.
- Aggregators reduce launch risk by providing one checkout flow for several rails.
- The product needs revenue validation before optimizing provider costs.
- A provider-agnostic backend keeps the frontend stable if the provider changes.

## Current Implementation

Backend:

- `GET /api/payments/plans`
- `POST /api/payments/checkout`
- `GET /api/payments/subscription`
- `GET /api/payments/history`
- `POST /api/payments/webhooks/:provider`

Frontend:

- `/premium`
- `apps/web/src/services/paymentService.ts`

Database:

- `PaymentTransaction`
- `Subscription`

Supported provider identifiers:

- `manual`
- `paydunya`
- `fedapay`
- `flutterwave`
- `cinetpay`
- `simiz`

The default provider is `manual` until a real provider account is configured.

## Recommended Provider Order

1. Paystack for fast onboarding, mobile money support, and simple payout flow in francophone Africa.
2. PayDunya or FedaPay for Francophone West Africa and Senegal-first testing.
3. Flutterwave if broader pan-African coverage and card support matter more than local specificity.
4. CinetPay or PayTech as alternatives if onboarding, fees, or country coverage are better for the operating entity.
5. Direct Wave/Orange/MTN only after traction, transaction volume, and legal/KYC readiness.

## Required Before Production Payments

- Validate merchant account and KYC with the chosen provider.
- Replace `PAYMENT_PROVIDER=manual` with the chosen provider.
- Implement the provider-specific checkout adapter in `paymentService.ts`.
- Verify webhook signatures with the provider's documented method.
- Run sandbox transactions end to end.
- Reconcile paid transactions against provider dashboard exports.

## Environment Variables

See `.env.example` for the supported payment variables.
