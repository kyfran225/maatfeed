import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Play, RotateCcw, Search, HelpCircle } from "lucide-react";
import { SEO } from "../components/SEO";
import { useAuth } from "../hooks/useAuth";
import { useGlobalFeed } from "../hooks/useFeed";
import type { FeedResponse } from "../services/feedService";
import {
  getLearningProgress,
  updateLearningProgress,
  type LearningSummary,
} from "../services/learningProgressService";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { QuizModal } from "../components/modals/QuizModal";
import { SponsorCard } from "../components/feed/SponsorCard";
import { getActiveSponsors, incrementSponsorStats, type Sponsor } from "../services/sponsorService";

type FeedItem = FeedResponse["items"][number];
type LearningStatus = "new" | "learned" | "review";
type LearningState = Record<string, LearningStatus>;

const STORAGE_KEY = "maatfeed-learning-state";

// Sponsors fictifs pour démonstration - à remplacer par données réelles depuis l'API
const mockSponsors: Sponsor[] = [
  {
    id: "sponsor-1",
    name: "AfroTech Hub",
    logo: "https://via.placeholder.com/40x40/ffd700/000000?text=AT",
    description: "Plateforme de formation en tech pour les jeunes africains. Rejoignez notre communauté de 5000+ développeurs.",
    website: "https://afrotech-hub.com",
    ctaText: "S'inscrire"
  },
  {
    id: "sponsor-2",
    name: "Culture247",
    description: "Média panafricain dédié à la culture et aux arts contemporains. Découvrez les talents émergents du continent.",
    website: "https://culture247.africa",
    ctaText: "Explorer"
  },
  {
    id: "sponsor-3",
    name: "StartUp Africa",
    logo: "https://via.placeholder.com/40x40/ffd700/000000?text=SA",
    description: "Accélérateur de startups africaines. Investissons dans l'avenir entrepreneurial du continent.",
    website: "https://startup-africa.co",
    ctaText: "Postuler"
  }
];

function readLearningState(): LearningState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as LearningState : {};
  } catch {
    return {};
  }
}

function getStatusStyle(status?: LearningStatus) {
  if (status === "learned") {
    return "border-emerald-300/25 bg-emerald-400/10 text-emerald-100";
  }

  if (status === "review") {
    return "border-amber-300/25 bg-amber-400/10 text-amber-100";
  }

  return "border-white/10 bg-white/[0.04] text-sand/62";
}

function getStatusLabel(status?: LearningStatus) {
  if (status === "learned") return "Vu";
  if (status === "review") return "Plus tard";
  return "Nouveau";
}

function FeedItemCard({
  item,
  status,
  onSetStatus,
  onOpenQuiz,
}: {
  item: FeedItem;
  status?: LearningStatus;
  onSetStatus: (status: LearningStatus) => void;
  onOpenQuiz: (contentId: string) => void;
}) {
  return (
    <article className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.035]">
      <Link to={`/content/${item.id}`} className="block">
        <div className="relative aspect-video bg-stone/25">
          {item.thumbnailUrl ? (
            <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,_rgba(197,162,76,0.18),_rgba(24,93,83,0.2),_rgba(96,65,130,0.16))]">
              <Play className="h-8 w-8 text-sand/65" aria-hidden="true" />
            </div>
          )}
          <span className={`absolute left-2 top-2 rounded-md border px-2 py-1 text-xs ${getStatusStyle(status)}`}>
            {getStatusLabel(status)}
          </span>
        </div>
      </Link>

      <div className="p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-sand/52">
          <span>{item.sourceProvider}</span>
          <span>·</span>
          <span>{item.bucket}</span>
          {item.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-md bg-white/[0.06] px-2 py-1">
              {tag}
            </span>
          ))}
        </div>

        <Link to={`/content/${item.id}`} className="group">
          <h2 className="line-clamp-2 text-lg font-semibold leading-6 text-white group-hover:text-gold">
            {item.title}
          </h2>
        </Link>

        {(item.summary || item.description) && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-sand/70">
            {item.summary || item.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to={`/content/${item.id}`}
            className="inline-flex items-center gap-2 rounded-md bg-gold px-3 py-2 text-sm font-semibold text-ink transition hover:bg-gold/90"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            Ouvrir
          </Link>
          <button
            type="button"
            onClick={() => onSetStatus("learned")}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
              status === "learned"
                ? "border-emerald-300/35 bg-emerald-400/16 text-emerald-50"
                : "border-white/10 bg-white/[0.04] text-sand/72 hover:bg-white/[0.08]"
            }`}
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Vu
          </button>
          <button
            type="button"
            onClick={() => onSetStatus("review")}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
              status === "review"
                ? "border-amber-300/35 bg-amber-400/16 text-amber-50"
                : "border-white/10 bg-white/[0.04] text-sand/72 hover:bg-white/[0.08]"
            }`}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Plus tard
          </button>
          <button
            type="button"
            onClick={() => onOpenQuiz(item.id)}
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-sand/72 transition hover:bg-white/[0.08]"
            title="Vérifier ta compréhension"
          >
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
            Vérifier
          </button>
        </div>
      </div>
    </article>
  );
}

export function FeedPage() {
  const { isAuthenticated } = useAuth();
  const { data, isLoading, error, refetch } = useGlobalFeed({ limit: 12 });
  const items = useMemo(() => data?.items?.filter((item) => item?.id) ?? [], [data]);
  const contentIds = useMemo(() => items.map((item) => item.id), [items]);
  const [learningState, setLearningState] = useState<LearningState>({});
  const [serverSummary, setServerSummary] = useState<LearningSummary | null>(null);
  const [quizContentId, setQuizContentId] = useState<string | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>(mockSponsors); // Commencer avec les sponsors fictifs

  useEffect(() => {
    setLearningState(readLearningState());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(learningState));
  }, [learningState]);

  // Charger les sponsors depuis l'API
  useEffect(() => {
    async function loadSponsors() {
      try {
        const result = await getActiveSponsors(10);
        if (result.sponsors.length > 0) {
          setSponsors(result.sponsors);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des sponsors:", error);
        // Garder les sponsors fictifs en fallback
      }
    }

    void loadSponsors();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || contentIds.length === 0) {
      return;
    }

    let cancelled = false;

    void getLearningProgress(contentIds)
      .then((progress) => {
        if (cancelled) return;

        setServerSummary(progress.summary);
        setLearningState((current) => {
          const next = { ...current };
          for (const item of progress.items) {
            next[item.contentId] = item.status;
          }
          return next;
        });
      })
      .catch((loadError) => {
        console.error("Learning progress load failed:", loadError);
      });

    return () => {
      cancelled = true;
    };
  }, [contentIds, isAuthenticated]);

  const localMarkedCount = useMemo(
    () => items.filter((item) => learningState[item.id] === "learned" || learningState[item.id] === "review").length,
    [items, learningState]
  );

  // Combiner les items du feed avec les sponsors
  const feedWithSponsors = useMemo(() => {
    const result: (FeedItem | { type: 'sponsor'; data: Sponsor })[] = [];
    let sponsorIndex = 0;

    for (let i = 0; i < items.length; i++) {
      result.push(items[i]);

      // Insérer un sponsor tous les 4 items
      if ((i + 1) % 4 === 0 && sponsorIndex < sponsors.length) {
        result.push({
          type: 'sponsor' as const,
          data: sponsors[sponsorIndex]
        });
        sponsorIndex++;

        // Incrémenter les impressions pour ce sponsor
        void incrementSponsorStats(sponsors[sponsorIndex - 1].id, 'impressions');
      }
    }

    return result;
  }, [items, sponsors]);

  const markedCount = serverSummary ? serverSummary.learned + serverSummary.review : localMarkedCount;

  const setStatus = (itemId: string, status: LearningStatus) => {
    setLearningState((current) => ({ ...current, [itemId]: status }));

    if (!isAuthenticated) {
      return;
    }

    void updateLearningProgress({ contentId: itemId, status })
      .then((result) => {
        setServerSummary(result.summary);
        setLearningState((current) => ({
          ...current,
          [result.progress.contentId]: result.progress.status
        }));
      })
      .catch((saveError) => {
        console.error("Learning progress save failed:", saveError);
      });
  };

  return (
    <>
      <SEO pageKey="home" />
      <main className="min-h-screen px-4 pb-28 pt-4 lg:px-0 lg:pb-12" aria-label="MAATFEED">
        <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-gold/78">Pour toi</p>
            <h1 className="mt-2 font-display text-4xl text-white lg:text-5xl">MAATFEED</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-sand/68">
              Ta sélection du moment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-sand/78 transition hover:bg-white/[0.08] hover:text-white"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Chercher
            </Link>
            {markedCount > 0 && (
              <span className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-sand/62">
                {markedCount}
              </span>
            )}
          </div>
        </section>

        {isLoading && <LoadingState message="Chargement..." />}

        {error && (
          <ErrorState
            message={`Le fil n'a pas pu se charger : ${error.message}`}
            onRetry={() => void refetch()}
          />
        )}

        {!isLoading && !error && items.length === 0 && (
          <EmptyState
            title="Aucun contenu disponible"
            description="Reviens après la prochaine mise à jour."
          />
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {feedWithSponsors.map((item, index) => {
            if ('type' in item && item.type === 'sponsor') {
              return (
                <SponsorCard
                  key={`sponsor-${item.data.id}-${index}`}
                  sponsor={item.data}
                />
              );
            }

            const feedItem = item as FeedItem;
            return (
              <FeedItemCard
                key={feedItem.id}
                item={feedItem}
                status={learningState[feedItem.id]}
                onSetStatus={(status) => setStatus(feedItem.id, status)}
                onOpenQuiz={(contentId) => setQuizContentId(contentId)}
              />
            );
          })}
        </section>

        <QuizModal
          contentId={quizContentId ?? ""}
          isOpen={quizContentId != null}
          onClose={() => setQuizContentId(null)}
          onSuccess={(correct) => {
            // Quiz submission already updates learning progress via API
            if (quizContentId) {
              setLearningState((current) => ({
                ...current,
                [quizContentId]: correct ? "learned" : "review"
              }));
            }
          }}
        />
      </main>
    </>
  );
}
