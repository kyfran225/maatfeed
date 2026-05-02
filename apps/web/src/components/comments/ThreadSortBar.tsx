import { motion } from "framer-motion";
import type { SortOption } from "./CommentThread";

interface ThreadSortBarProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  rootCount: number;
  totalReplyCount: number;
}

const sortOptions: { value: SortOption; label: string; icon: string }[] = [
  { value: "relevant", label: "Plus pertinents", icon: "✨" },
  { value: "newest", label: "Plus récents", icon: "🕐" },
  { value: "popular", label: "Plus populaires", icon: "🔥" },
  { value: "debated", label: "Plus débattus", icon: "💬" },
];

const sortDescriptions: Record<SortOption, string> = {
  relevant: "Met d'abord en avant les meilleures interventions, sans laisser les réponses récentes déstabiliser tout le fil.",
  newest: "Remonte les discussions qui ont eu la dernière activité, y compris une réponse récente sous un point de vue.",
  popular: "Classe par popularité globale de la discussion: likes, poids du message source et engagement visible.",
  debated: "Met en avant les discussions où il y a le plus d'échanges, puis l'activité la plus récente.",
};

export function ThreadSortBar({
  sortBy,
  onSortChange,
  rootCount,
  totalReplyCount,
}: ThreadSortBarProps) {
  return (
    <div className="border-b border-sand/10 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="block text-sm font-medium text-white">
            {rootCount} discussion{rootCount !== 1 ? "s" : ""}
          </span>
          <span className="block text-xs text-sand/50">
            {totalReplyCount} réponse{totalReplyCount !== 1 ? "s" : ""} au total
          </span>
        </div>

        <span className="pt-1 text-[11px] uppercase tracking-[0.2em] text-sand/35 hidden sm:inline">
          Trier
        </span>
      </div>

      <div className="mt-3 overflow-x-auto pb-1">
        <div className="flex w-max items-center gap-1 rounded-xl bg-sand/5 p-1">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={`relative whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === option.value
                  ? "text-gold bg-gold/10"
                  : "text-sand/60 hover:text-sand hover:bg-sand/5"
              }`}
            >
              <span className="hidden sm:inline">{option.label}</span>
              <span className="sm:hidden">{option.icon}</span>
              {sortBy === option.value && (
                <motion.div
                  layoutId="sortIndicator"
                  className="absolute inset-0 bg-gold/5 rounded-md -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-sand/45">
        {sortDescriptions[sortBy]}
      </p>
    </div>
  );
}
