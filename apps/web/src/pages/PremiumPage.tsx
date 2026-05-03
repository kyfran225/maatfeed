import { useEffect, useState } from "react";
import { Check, CreditCard, ShieldCheck } from "lucide-react";
import { SEO } from "../components/SEO";
import { useAuth } from "../hooks/useAuth";
import {
  createCheckout,
  getCurrentSubscription,
  getPaymentPlans,
  type PaymentPlan,
  type PaymentPlanId,
  type Subscription
} from "../services/paymentService";

export default function PremiumPage() {
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlanId>("premium_monthly");
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBilling() {
      try {
        const [plansResult, subscriptionResult] = await Promise.all([
          getPaymentPlans(),
          isAuthenticated ? getCurrentSubscription() : Promise.resolve({ subscription: null })
        ]);

        setPlans(plansResult.plans);
        setSubscription(subscriptionResult.subscription);
        setSelectedPlan(plansResult.plans[0]?.id || "premium_monthly");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Impossible de charger les offres.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadBilling();
  }, [isAuthenticated]);

  async function handleCheckout(plan: PaymentPlanId) {
    if (!isAuthenticated) {
      window.location.assign(`/auth?returnTo=${encodeURIComponent("/premium")}`);
      return;
    }

    setSelectedPlan(plan);
    setIsCheckingOut(true);
    setError(null);

    try {
      const result = await createCheckout({
        plan,
        idempotencyKey: crypto.randomUUID()
      });

      window.location.assign(result.transaction.checkoutUrl);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Impossible de démarrer le paiement.");
      setIsCheckingOut(false);
    }
  }

  return (
    <>
      <SEO pageKey="premium" />
      <section className="min-h-screen px-4 py-6 pb-28">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gold">MAATFEED Premium</p>
              <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">Abonnements</h1>
            </div>
            {subscription?.status === "active" && (
              <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
                <ShieldCheck className="h-4 w-4" />
                Actif jusqu'au {new Date(subscription.currentPeriodEnd).toLocaleDateString("fr-FR")}
              </div>
            )}
          </div>

          {error && (
            <div className="mt-5 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[0, 1].map((item) => (
                <div key={item} className="h-64 animate-pulse rounded-lg bg-white/5" />
              ))}
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
              {plans.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                const isActivePlan = subscription?.status === "active" && subscription.plan === plan.id;

                return (
                  <article
                    key={plan.id}
                    className={`rounded-lg border p-5 ${
                      isSelected
                        ? "border-gold/60 bg-gold/10"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-display text-2xl text-white">{plan.name}</h2>
                            <p className="mt-2 text-sm text-sand/70">
                          {plan.interval === "month" ? "Facturation mensuelle" : "Don unique"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-semibold text-gold">{plan.amount.toLocaleString("fr-FR")}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-sand/50">{plan.currency}</p>
                      </div>
                    </div>

                    <ul className="mt-5 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex gap-3 text-sm text-sand">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => void handleCheckout(plan.id)}
                      disabled={isCheckingOut || isActivePlan}
                      className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 text-sm font-semibold text-ink transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CreditCard className="h-4 w-4" />
                      {isActivePlan
                        ? "Offre active"
                        : isCheckingOut && isSelected
                        ? "Paiement..."
                        : plan.interval === "one_time"
                        ? "Faire un don"
                        : "Choisir"}
                    </button>
                  </article>
                );
              })}
            </div>

            <div className="mt-6 rounded-lg border border-sand/10 bg-white/[0.03] p-4 text-sm text-sand/70">
              <p className="font-semibold text-white">Soutien MAATFEED</p>
              <p className="mt-2">
                Choisis l'option « Soutien MAATFEED » pour faire un don unique. Le paiement passe par Paystack,
                sécurisé et adapté au mobile.
              </p>
            </div>

            <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-sand/70">
              Les paiements passent par une couche backend unique. Le fournisseur peut être remplacé sans changer
              l'expérience utilisateur une fois les clés PayDunya, FedaPay, Flutterwave, CinetPay ou Simiz disponibles.
            </div>
          </>
          )}

        </div>
      </section>
    </>
  );
}
