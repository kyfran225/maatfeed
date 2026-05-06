import { SEO } from "../components/SEO";

export function MaintenancePage() {
  return (
    <>
      <SEO
        title="Maintenance - MAATFEED"
        description="MAATFEED est temporairement indisponible pendant une operation de maintenance."
        robots="noindex, nofollow"
        canonical="https://maatfeed.com/"
      />
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(197,162,76,0.18),_transparent_34%),linear-gradient(180deg,_#201713_0%,_#16120f_55%,_#0f0c0a_100%)] px-6 py-10 text-sand">
        <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl flex-col justify-center">
          <img
            alt="MAATFEED"
            className="mb-10 h-16 w-16 object-contain"
            src="/favicon_io/maafeed-home.png"
          />
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-gold">
            Maintenance
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            MAATFEED revient bientot.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-sand/78">
            L'application est temporairement en maintenance afin de stabiliser la plateforme.
            Merci de revenir un peu plus tard.
          </p>
          <div className="mt-10 h-px w-full bg-white/10" />
          <p className="mt-6 text-sm text-sand/55">
            Les services publics sont suspendus pendant cette intervention.
          </p>
        </section>
      </main>
    </>
  );
}

export default MaintenancePage;

