import type { PropsWithChildren } from "react";
import { RequireAuth } from "./RequireAuth";
import { useAuth } from "../../hooks/useAuth";

function AdminGate({ children }: PropsWithChildren) {
  const { profile, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <section className="px-4 py-6 text-sand/70">Checking session...</section>;
  }

  if (profile?.role !== "admin") {
    return (
      <section className="mx-auto max-w-xl px-4 py-10 text-sand">
        <h1 className="font-display text-2xl text-gold">Acces refuse</h1>
        <p className="mt-3 text-sand/75">
          Ce tableau de bord est reserve aux comptes administrateur.
        </p>
      </section>
    );
  }

  return <>{children}</>;
}

export function RequireAdmin({ children }: PropsWithChildren) {
  return (
    <RequireAuth>
      <AdminGate>{children}</AdminGate>
    </RequireAuth>
  );
}
