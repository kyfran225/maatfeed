import type { MouseEvent } from "react";
import { motion } from "framer-motion";

interface CommentHeaderProps {
  authorName?: string;
  authorAvatar?: string | null;
  isAI?: boolean;
  aiPersonaName?: string | null;
  isCreator?: boolean;
  createdAt: string;
  debateScore?: number;
  qualityScore?: number;
  isFlatReply?: boolean;
  replyTargetAuthorName?: string | null;
  onReplyTargetClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onShare?: () => void;
  shareCopied?: boolean;
}

export function CommentHeader({
  authorName,
  authorAvatar,
  isAI,
  aiPersonaName,
  isCreator,
  createdAt,
  debateScore,
  qualityScore,
  isFlatReply,
  replyTargetAuthorName,
  onReplyTargetClick,
  onShare,
  shareCopied = false,
}: CommentHeaderProps) {
  const displayName = isAI ? (aiPersonaName || "IA MAAT") : (authorName || "Utilisateur");
  const displayAvatar = authorAvatar || "/avatars/users/maat-avatar-homme-64.png";
  
  // Determine if this is a high-quality comment
  const isHighQuality = (qualityScore || 0) > 0.7 || (debateScore || 0) > 20;
  const isTopContributor = (debateScore || 0) > 30;

  return (
    <div className="flex items-start gap-3 p-3 sm:p-4 pb-2">
      {/* Avatar */}
      <div className={`relative flex-shrink-0 w-10 h-10 rounded-full overflow-hidden ${
        isAI 
          ? "ring-2 ring-cyan-500/30" 
          : isTopContributor 
            ? "ring-2 ring-gold/30"
            : ""
      }`}>
        <img
          src={displayAvatar}
          alt={displayName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/avatars/users/maat-avatar-homme-64.png";
          }}
        />
        {isAI && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-ink" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Name */}
          <span className={`font-medium text-sm ${
            isAI ? "text-cyan-300" : "text-white"
          }`}>
            {displayName}
          </span>

          {/* AI Badge */}
          {isAI && (
            <span className="px-1.5 py-0.5 bg-blue-500/20 rounded text-[10px] font-medium text-blue-300">
              IA
            </span>
          )}

          {/* Creator Badge */}
          {isCreator && (
            <span className="px-1.5 py-0.5 bg-gold/20 rounded text-[10px] font-medium text-gold flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Créateur
            </span>
          )}

          {/* Top Contributor Badge */}
          {!isAI && isTopContributor && (
            <span className="px-1.5 py-0.5 bg-teal-500/20 rounded text-[10px] font-medium text-teal-300 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Expert
            </span>
          )}

          {/* Quality Badge */}
          {isHighQuality && !isAI && !isTopContributor && (
            <span className="px-1.5 py-0.5 bg-purple-500/20 rounded text-[10px] font-medium text-purple-300">
              Qualité
            </span>
          )}
        </div>

        {/* Flat reply indicator */}
        {isFlatReply && replyTargetAuthorName && (
          <div className="mt-1 text-xs text-sand/45">
            <span>Réponse à </span>
            {onReplyTargetClick ? (
              <button
                type="button"
                onClick={onReplyTargetClick}
                className="font-medium text-gold/85 hover:text-gold transition-colors"
              >
                @{formatHandle(replyTargetAuthorName)}
              </button>
            ) : (
              <span className="font-medium text-sand/65">@{formatHandle(replyTargetAuthorName)}</span>
            )}
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-2 mt-0.5 text-xs text-sand/50">
          <span>{formatTimeAgo(createdAt)}</span>
          {(debateScore || 0) > 0 && (
            <>
              <span>·</span>
              <span className="text-sand/40">Débat {debateScore}</span>
            </>
          )}
        </div>
      </div>

      {onShare && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onShare}
          aria-label={shareCopied ? "Lien copié" : "Copier le lien du commentaire"}
          className={`shrink-0 rounded-xl p-2 transition-all ${
            shareCopied
              ? "text-green-400 bg-green-400/10"
              : "text-sand/40 hover:bg-sand/5 hover:text-sand"
          }`}
          title={shareCopied ? "Lien copié" : "Copier le lien"}
        >
          {shareCopied ? (
            <motion.svg
              key="check"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </motion.svg>
          ) : (
            <motion.svg
              key="share"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </motion.svg>
          )}
        </motion.button>
      )}
    </div>
  );
}

function formatHandle(name: string): string {
  return name.trim().replace(/^@+/, "");
}

function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 365) {
    const years = Math.floor(diffDays / 365);
    return `Il y a ${years} an${years > 1 ? "s" : ""}`;
  }
  if (diffDays > 30) {
    const months = Math.floor(diffDays / 30);
    return `Il y a ${months} mois`;
  }
  if (diffDays > 0) return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
  if (diffHours > 0) return `Il y a ${diffHours}h`;
  if (diffMin > 0) return `Il y a ${diffMin}min`;
  return "À l'instant";
}
