import { motion } from "framer-motion";
import { Comment } from "../../services/commentService";
import { ReplyList } from "./ReplyList";
import { ReplyComposer } from "./ReplyComposer";
import { ReportModal } from "./ReportModal";
import { useState } from "react";
import { reportComment } from "../../services/commentService";

/**
 * Resolve avatar URL for display
 * - If URL starts with http or data, use as-is (Cloudinary or base64)
 * - If URL starts with /avatars/, prepend window.location.origin to make absolute
 */
function resolveAvatarDisplayUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http") || url.startsWith("data:")) {
    return url;
  }
  // For local avatar paths, ensure they're absolute
  if (url.startsWith("/")) {
    return `${window.location.origin}${url}`;
  }
  return url;
}

interface CommentItemProps {
  comment: Comment;
  index: number;
  contentId?: string;
}

export function CommentItem({ comment, index, contentId }: CommentItemProps) {
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const isAIComment = !!comment.aiGenerated;

  const handleReport = () => {
    setShowReportModal(true);
    setReportError(null);
    setReportSuccess(false);
  };

  const handleReportSubmit = async (reason: string, description?: string) => {
    try {
      setIsReporting(true);
      
      await reportComment(comment._id || comment.id, reason as any, description);
      setReportSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setReportSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to report comment:", error);
      
      // Handle duplicate reports specifically
      if (error instanceof Error && error.message.includes("already reported")) {
        setReportError("Vous avez déjà signalé ce commentaire");
      } else {
        setReportError("Échec du signalement. Veuillez réessayer.");
      }
      
      // Clear error message after 3 seconds
      setTimeout(() => setReportError(null), 3000);
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <>
      <motion.div
        className={`rounded-[1rem] p-3 sm:p-4 ${
          isAIComment
            ? "bg-gradient-to-r from-blue-950/40 to-cyan-950/20 border border-cyan-500/30"
            : "bg-black/30 border border-white/10"
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
      {/* Comment Header */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${
            isAIComment ? "bg-cyan-500/20" : "bg-gold/20"
          }`}>
            {(comment.aiPersonaAvatar || comment.authorAvatar) ? (
              <img
                src={resolveAvatarDisplayUrl(comment.aiPersonaAvatar || comment.authorAvatar)}
                alt={comment.authorName || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className={`text-xs sm:text-sm font-semibold ${isAIComment ? "text-cyan-300" : "text-gold"}`}>
                {(comment.authorName || "User").charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="text-white text-xs sm:text-sm font-medium truncate">
              {comment.aiPersonaName || comment.authorName || `User ${comment.userId ? comment.userId.slice(-6) : 'Unknown'}`}
            </p>
            <p className="text-sand/50 text-xs truncate">
              {new Date(comment.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isAIComment && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-cyan-500/20 rounded-full">
              <span className="text-cyan-300 text-xs font-medium">IA</span>
            </div>
          )}
          {comment.debateScore > 0 && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gold/20 rounded-full">
            <span className="text-gold text-xs font-medium">
              Score: {comment.debateScore}
            </span>
          </div>
          )}
        </div>
      </div>

      {/* Comment Body */}
      <div className="mb-3 sm:mb-4">
        <p className="text-sand/90 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
          {comment.body}
        </p>
      </div>

      {/* Comment Actions */}
      <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3 flex-wrap">
        <button
          onClick={() => setShowReplyComposer(!showReplyComposer)}
          className="text-sand/60 hover:text-white text-xs sm:text-sm transition-colors"
        >
          Répondre
        </button>
        {!isAIComment && (
          <button
            onClick={handleReport}
            disabled={isReporting}
            className="text-sand/60 hover:text-red-300 text-xs sm:text-sm transition-colors disabled:opacity-50"
          >
            🚩 Signaler
          </button>
        )}
        <span className="text-sand/50 text-xs">
          {comment.replies ? comment.replies.length : 0} {comment.replies && comment.replies.length === 1 ? 'réponse' : 'réponses'}
        </span>
        {comment.hidden && (
          <span className="text-amber-300 text-xs">Masqué</span>
        )}
        
        {/* Report Status Messages */}
        {reportSuccess && (
          <span className="text-green-400 text-xs animate-fade-in">
            ✓ Commentaire signalé
          </span>
        )}
        {reportError && (
          <span className="text-red-300 text-xs animate-fade-in">
            {reportError}
          </span>
        )}
      </div>

      {/* Reply Composer */}
      {showReplyComposer && (
        <motion.div
          className="mb-3 sm:mb-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <ReplyComposer
            commentId={comment._id || comment.id}
            contentId={contentId}
            onSubmit={() => setShowReplyComposer(false)}
            onCancel={() => setShowReplyComposer(false)}
          />
        </motion.div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <ReplyList replies={comment.replies} />
      )}
    </motion.div>

    {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
        isSubmitting={isReporting}
      />
    </>
  );
}
