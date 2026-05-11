import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SEO } from "../components/SEO";
import { useAuth } from "../hooks/useAuth";
import { SkeletonLoader } from "../components/motion/SkeletonLoader";

export default function FeedPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <>
        <SEO pageKey="home" />
        <section className="px-4 py-6 pb-24">
          <div className="mb-6 h-9 w-52 animate-pulse rounded bg-sand/15" />
          <SkeletonLoader type="card" count={4} />
        </section>
      </>
    );
  }

  return (
    <>
      <SEO pageKey="home" />
      <section className="px-4 py-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border border-gold/15 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.24),_transparent_26%),linear-gradient(145deg,_rgba(23,17,13,1)_0%,_rgba(12,10,9,1)_50%,_rgba(22,17,14,1)_100%)] p-6 shadow-2xl shadow-black/40"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,_rgba(255,255,255,0.04),_transparent_35%,_transparent_65%,_rgba(255,255,255,0.03))]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-[11px] uppercase tracking-[0.24em] text-gold/80">Feed</p>
              <h1 className="font-display text-3xl text-gold lg:text-5xl">Flux principal</h1>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm lg:min-w-[22rem]">
              <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                <p className="text-sand/60">Contenus</p>
                <p className="mt-2 text-2xl font-semibold text-white">0</p>
              </div>
              <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                <p className="text-sand/60">Nouveautés</p>
                <p className="mt-2 text-2xl font-semibold text-white">0</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="mt-6 overflow-hidden rounded-[1.4rem] border border-white/10 bg-black/24 shadow-xl shadow-black/24 p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Feed en construction</h2>
          <p className="text-sand/72">
            Le flux principal est en cours de développement. Revenez bientôt pour découvrir les contenus disponibles.
          </p>
        </motion.section>
      </section>
    </>
  );
}
