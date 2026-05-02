import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CommentActionsProps {
  score: number;
  userVote: "up" | "down" | null;
  replyCount: number;
  onVote: (direction: "up" | "down") => void;
  onReply: () => void;
  onReport: () => void;
  onAIReply?: () => void;
  isReplying: boolean;
  showAIReply?: boolean;
  isAIReplying?: boolean;
  aiReplyLabel?: string;
  hasReplies?: boolean;
  isExpanded?: boolean;
  onToggleReplies?: () => void;
  replyToggleLabel?: string;
}

export function CommentActions({
  score,
  userVote,
  replyCount,
  onVote,
  onReply,
  onReport,
  onAIReply,
  isReplying,
  showAIReply = false,
  isAIReplying = false,
  aiReplyLabel = "Inviter l'IA",
  hasReplies = false,
  isExpanded = false,
  onToggleReplies,
  replyToggleLabel = "",
}: CommentActionsProps) {
  const [showActions, setShowActions] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);

  const handleReport = () => {
    if (!showReportConfirm) {
      setShowReportConfirm(true);
      setTimeout(() => setShowReportConfirm(false), 3000);
    } else {
      onReport();
      setShowReportConfirm(false);
    }
  };

  return (
    <div 
      className="px-3 sm:px-4 py-2"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
      }}
      onTouchStart={() => setShowActions(true)}
    >
      <div className={`flex items-center justify-between gap-2 transition-opacity duration-200 ${
        showActions || isReplying ? "opacity-100" : "opacity-100 sm:opacity-60"
      }`}>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center rounded-xl border border-sand/10 bg-sand/5 transition-colors hover:border-sand/20">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onVote("up")}
              aria-label="Vote positif"
              className={`rounded-l-xl p-2 transition-all ${
                userVote === "up"
                  ? "bg-ember/10 text-ember"
                  : "text-sand/50 hover:bg-ember/5 hover:text-ember"
              }`}
            >
              <svg className="h-4 w-4" fill={userVote === "up" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </motion.button>

            <span className={`min-w-[1.75rem] text-center text-sm font-semibold ${
              userVote === "up"
                ? "text-ember"
                : userVote === "down"
                  ? "text-blue-400"
                  : "text-sand/70"
            }`}>
              {score}
            </span>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onVote("down")}
              aria-label="Vote négatif"
              className={`rounded-r-xl p-2 transition-all ${
                userVote === "down"
                  ? "bg-blue-400/10 text-blue-400"
                  : "text-sand/50 hover:bg-blue-400/5 hover:text-blue-400"
              }`}
            >
              <svg className="h-4 w-4" fill={userVote === "down" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </motion.button>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onReply}
            aria-label={isReplying ? "Annuler la réponse" : `Répondre${replyCount > 0 ? ` au fil de ${replyCount} réponses` : ""}`}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-2 py-2 text-sm transition-all ${
              isReplying
                ? "border border-gold/20 bg-gold/10 text-gold"
                : "text-sand/60 hover:bg-sand/5 hover:text-sand"
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <span>{isReplying ? "Annuler" : "Répondre"}</span>
          </motion.button>

          {hasReplies && onToggleReplies && (
            <button
              onClick={onToggleReplies}
              aria-label={isExpanded ? "Masquer les réponses" : replyToggleLabel}
              aria-expanded={isExpanded}
              className="flex shrink-0 items-center gap-1.5 rounded-xl px-2 py-2 text-sm text-sand/60 transition-all hover:bg-sand/5 hover:text-sand"
            >
              <svg
                className={`h-4 w-4 ${isExpanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              <span className="hidden sm:inline">
                {isExpanded ? "Masquer les réponses" : replyToggleLabel}
              </span>
              <span className="sm:hidden">
                {isExpanded ? "Masquer" : `Voir (${replyCount})`}
              </span>
            </button>
          )}

          {showAIReply && onAIReply && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onAIReply}
              disabled={isAIReplying}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-cyan-500/10 px-2 py-2 text-sm text-cyan-400/80 transition-all hover:border-cyan-400/20 hover:bg-cyan-400/5 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              title="Répondre avec l'aide de l'IA"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {isAIReplying ? (
                <span>IA...</span>
              ) : (
                <>
                  <span className="sm:hidden">IA</span>
                  <span className="hidden sm:inline">{aiReplyLabel}</span>
                </>
              )}
            </motion.button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleReport}
            aria-label={showReportConfirm ? "Confirmer le signalement" : "Signaler le commentaire"}
            className={`shrink-0 rounded-xl p-2 transition-all ${
              showReportConfirm
                ? "border border-red-400/20 bg-red-400/10 text-red-400"
                : "text-sand/40 hover:bg-red-400/5 hover:text-red-400"
            }`}
            title={showReportConfirm ? "Confirmer le signalement" : "Signaler"}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5v14M5 5c5 0 5 2 10 2V3C10 3 10 1 5 1v4z" />
            </svg>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showReportConfirm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-xs text-red-400 bg-red-400/5 rounded-lg px-3 py-2"
          >
            Cliquez à nouveau pour confirmer le signalement
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
