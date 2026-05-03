import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SEO } from "../components/SEO";
import { getTopDebates, TopDebate } from "../services/communityService";
import { DebateCard } from "../components/community/DebateCard";
import { CreateDebateSheet } from "../components/community/CreateDebateSheet";
import { CommunityAnalytics } from "../components/community/CommunityAnalytics";
import { useAuth } from "../hooks/useAuth";
import {
  requestLearningCoach,
  submitLearningCoachFeedback,
  type LearningCoachResult
} from "../services/learningProgressService";
import { SkeletonLoader } from "../components/motion/SkeletonLoader";
import { TouchFeedback } from "../components/motion/TouchFeedback";


export default function CommunityPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [showCreateDebateSheet, setShowCreateDebateSheet] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [topDebates, setTopDebates] = useState<TopDebate[]>([]);
  const [filteredDebates, setFilteredDebates] = useState<TopDebate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'score' | 'participants' | 'recent'>('score');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [coachDebateId, setCoachDebateId] = useState<string>('');
  const [coachAnswer, setCoachAnswer] = useState('');
  const [coachResult, setCoachResult] = useState<LearningCoachResult | null>(null);
  const [isCoaching, setIsCoaching] = useState(false);
  const [coachError, setCoachError] = useState<string | null>(null);
  const [coachFeedbackSent, setCoachFeedbackSent] = useState<'accepted' | 'rejected' | null>(null);
  const [coachFeedbackError, setCoachFeedbackError] = useState<string | null>(null);

  // Load top debates from API
  useEffect(() => {
    const loadDebates = async () => {
      try {
        const debates = await getTopDebates(50);
        setTopDebates(debates);
        setFilteredDebates(debates);
      } catch (error) {
        console.error('Failed to load top debates:', error);
        setTopDebates([]);
        setFilteredDebates([]);
      } finally {
        setLoading(false);
      }
    };

    loadDebates();
  }, []);

  // Filter and sort debates
  useEffect(() => {
    let filtered = [...topDebates];

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(debate => 
        debate.tags.includes(selectedTag)
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(debate => 
        debate.title.toLowerCase().includes(query) ||
        debate.description.toLowerCase().includes(query) ||
        debate.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort debates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.debateScore - a.debateScore;
        case 'participants':
          return b.participantCount - a.participantCount;
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredDebates(filtered);
  }, [topDebates, selectedTag, searchQuery, sortBy]);

  // Get all unique tags
  const allTags = Array.from(new Set(
    topDebates.flatMap(debate => debate.tags)
  )).sort();

  // Calculate statistics
  const totalParticipants = topDebates.reduce((sum, debate) => sum + debate.participantCount, 0);
  const averageScore = topDebates.length > 0 
    ? topDebates.reduce((sum, debate) => sum + debate.debateScore, 0) / topDebates.length 
    : 0;
  const activeDebates = topDebates.filter(debate => debate.debateScore > 10).length;

  const handleOpenDebate = (contentId: string) => {
    navigate(`/debate/${contentId}`);
  };

  const handleCreateDebateSuccess = (newDebate: any) => {
    // Refresh the debates list to include the new one
    const loadDebates = async () => {
      try {
        const debates = await getTopDebates(50);
        setTopDebates(debates);
        setFilteredDebates(debates);
      } catch (error) {
        console.error('Failed to refresh debates:', error);
      }
    };
    loadDebates();
  };

  const selectedCoachDebate = topDebates.find((debate) => debate.contentId === coachDebateId) ?? topDebates[0] ?? null;

  const handleCoach = async () => {
    if (!profile) {
      setCoachError("Connecte-toi pour utiliser la correction.");
      return;
    }

    if (!coachAnswer.trim()) {
      setCoachError("Écris une réponse.");
      return;
    }

    setIsCoaching(true);
    setCoachError(null);
    setCoachResult(null);
    setCoachFeedbackSent(null);
    setCoachFeedbackError(null);

    try {
      const result = await requestLearningCoach({
        answer: coachAnswer,
        contextTitle: selectedCoachDebate?.title,
        contextDescription: selectedCoachDebate?.description
      });
      setCoachResult(result);
    } catch (error) {
      setCoachError(error instanceof Error ? error.message : "Correction indisponible.");
    } finally {
      setIsCoaching(false);
    }
  };

  const handleCoachFeedback = async (accepted: boolean) => {
    if (!coachResult?.suggestionId) {
      setCoachFeedbackError("Aucune suggestion disponible pour ce retour.");
      return;
    }

    setCoachFeedbackError(null);

    try {
      await submitLearningCoachFeedback({
        suggestionId: coachResult.suggestionId,
        accepted
      });
      setCoachFeedbackSent(accepted ? "accepted" : "rejected");
    } catch (error) {
      setCoachFeedbackError(error instanceof Error ? error.message : "Impossible d'enregistrer ton feedback.");
    }
  };

  if (loading) {
    return (
      <section className="px-4 py-6 pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="h-8 bg-sand/20 rounded w-32 mb-4 animate-pulse"></div>
          <SkeletonLoader type="list" count={3} />
        </motion.div>
      </section>
    );
  }

  return (
    <>
      <SEO pageKey="community" />
      <section className="px-4 py-6 pb-24">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex-1">
            <h1 className="font-display text-2xl sm:text-3xl text-gold">Échanges</h1>
          </div>
          <div className="flex flex-row sm:flex-col gap-2 sm:gap-0">
            {profile && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => setShowCreateDebateSheet(true)}
                className="bg-gold text-ink px-3 sm:px-4 py-2 rounded-lg font-medium text-sm hover:bg-gold/90 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Nouveau</span>
                <span className="sm:hidden">+</span>
              </motion.button>
            )}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="bg-sand/20 text-gold px-3 sm:px-4 py-2 rounded-lg font-medium text-sm hover:bg-sand/30 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
                <span className="hidden sm:inline">Stats</span>
              <span className="sm:hidden">📊</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Statistics */}
      {topDebates.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-2 sm:gap-4 mb-6"
        >
          <div className="bg-sand/10 rounded-lg p-2 sm:p-3 text-center">
            <div className="text-lg sm:text-2xl font-bold text-gold">{topDebates.length}</div>
            <div className="text-xs text-sand/60">Sujets</div>
          </div>
          <div className="bg-sand/10 rounded-lg p-2 sm:p-3 text-center">
            <div className="text-lg sm:text-2xl font-bold text-gold">{totalParticipants}</div>
            <div className="text-xs text-sand/60">Participants</div>
          </div>
          <div className="bg-sand/10 rounded-lg p-2 sm:p-3 text-center">
            <div className="text-lg sm:text-2xl font-bold text-gold">{averageScore.toFixed(1)}</div>
            <div className="text-xs text-sand/60">Score</div>
          </div>
        </motion.div>
      )}

      {/* Search and Filters */}
      {topDebates.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mb-6 rounded-lg border border-white/10 bg-white/[0.04] p-4"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start">
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.18em] text-gold/75">Avis rapide</p>
              <textarea
                value={coachAnswer}
                onChange={(event) => setCoachAnswer(event.target.value)}
                rows={3}
                maxLength={600}
                placeholder="Écris ta réponse..."
                className="mt-3 w-full resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-sm leading-6 text-white placeholder:text-sand/42 focus:border-gold/45 focus:outline-none"
              />
            </div>

            <div className="w-full md:w-72">
              <select
                value={coachDebateId || topDebates[0]?.contentId || ""}
                onChange={(event) => setCoachDebateId(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-sand focus:border-gold/45 focus:outline-none"
              >
                {topDebates.slice(0, 8).map((debate) => (
                  <option key={debate.contentId} value={debate.contentId}>
                    {debate.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleCoach}
                disabled={isCoaching}
                className="mt-3 w-full rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCoaching ? "Correction..." : "Corriger"}
              </button>
            </div>
          </div>

          {(coachResult || coachError) && (
            <div className="mt-4 rounded-lg border border-white/10 bg-black/18 p-3 text-sm leading-6">
              {coachError ? (
                <p className="text-amber-100">{coachError}</p>
              ) : coachResult ? (
                <div className="space-y-4">
                  <div className="grid gap-2 md:grid-cols-3">
                    <p className="text-sand/80"><span className="text-emerald-200">OK</span> {coachResult.feedback}</p>
                    <p className="text-sand/80"><span className="text-amber-200">Point</span> {coachResult.gap}</p>
                    <p className="text-sand/80"><span className="text-cyan-200">Suite</span> {coachResult.nextQuestion}</p>
                  </div>

                  {coachResult.suggestionId && !coachFeedbackSent && (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <p className="text-sand/70">Ce retour permet d’améliorer le coach IA.</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleCoachFeedback(true)}
                          className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-emerald-400"
                        >
                          J'accepte
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCoachFeedback(false)}
                          className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-amber-400"
                        >
                          Je rejette
                        </button>
                      </div>
                    </div>
                  )}

                  {coachFeedbackSent && (
                    <p className="text-sand/80">
                      {coachFeedbackSent === "accepted"
                        ? "Merci, ta correction IA est enregistrée !"
                        : "Merci, ton retour est pris en compte."}
                    </p>
                  )}

                  {coachFeedbackError && (
                    <p className="text-rose-200">{coachFeedbackError}</p>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </motion.section>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 space-y-4"
      >
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-sand/10 border border-sand/20 rounded-lg px-4 py-3 pl-10 text-white placeholder-sand/50 focus:outline-none focus:border-gold/50 transition-colors"
          />
          <svg className="absolute left-3 top-3.5 w-4 h-4 text-sand/50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedTag === null
                  ? 'bg-gold text-ink'
                  : 'bg-sand/10 text-sand/70 hover:bg-sand/20'
              }`}
            >
              Tous les Sujets
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-gold text-ink'
                    : 'bg-sand/10 text-sand/70 hover:bg-sand/20'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Sort and View Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-sand/60">Trier par:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-sand/10 border border-sand/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-gold/50"
            >
              <option value="score">Clarté du débat</option>
              <option value="participants">Participants</option>
              <option value="recent">Plus Récent</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-gold text-ink' : 'bg-sand/10 text-sand/70'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-gold text-ink' : 'bg-sand/10 text-sand/70'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Results Count */}
      {searchQuery || selectedTag ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 text-sm text-sand/60"
        >
          {filteredDebates.length} sur {topDebates.length} questions
        </motion.div>
      ) : null}

      {/* Debates List/Grid */}
      {filteredDebates.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          {topDebates.length === 0 ? (
            <>
              <p className="text-sand/60 mb-4">Aucune question active pour le moment. Interagis avec les contenus pour lancer les premiers ateliers.</p>
              <div className="text-xs text-sand/50">Les discussions apparaissent quand un contenu mérite une explication collective.</div>
            </>
          ) : (
            <p className="text-sand/60">Aucun débat ne correspond à vos filtres. Essayez d'ajuster votre recherche ou vos critères de filtrage.</p>
          )}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.05 }}
          className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}
        >
          {filteredDebates.map((debate, index) => (
            <motion.div
              key={debate.contentId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <TouchFeedback hapticType="medium" minTouchSize>
                <DebateCard
                  debate={debate}
                  onOpen={() => handleOpenDebate(debate.contentId)}
                />
              </TouchFeedback>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Analytics Section */}
      {showAnalytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6"
        >
          <CommunityAnalytics debates={topDebates} />
        </motion.div>
      )}

      {/* Create Debate Sheet */}
      <CreateDebateSheet
        isOpen={showCreateDebateSheet}
        onClose={() => setShowCreateDebateSheet(false)}
        onSuccess={handleCreateDebateSuccess}
      />

    </section>
    </>
  );
}
