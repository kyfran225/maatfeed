import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";

export function NotFoundPage() {
  return (
    <>
      <SEO pageKey="notFound" />
      <section className="px-4 py-6">
      <h1 className="font-display text-3xl text-gold">Route Non Trouvée</h1>
      <p className="mt-3 text-sand/75">Cette route est en dehors de l'interface actuelle de MAAT FEED.</p>
      <Link to="/" className="mt-4 inline-flex rounded-full bg-gold px-4 py-2 text-ink">
        Retour au Fil
      </Link>
    </section>
    </>
  );
}
