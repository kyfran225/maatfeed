import { motion } from "framer-motion";
import { Reply } from "../../services/commentService";

/**
 * Resolve avatar URL for display
 */
function resolveAvatarDisplayUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http") || url.startsWith("data:")) {
    return url;
  }
  if (url.startsWith("/")) {
    return `${window.location.origin}${url}`;
  }
  return url;
}

interface ReplyListProps {
  replies: Reply[];
}

export function ReplyList({ replies }: ReplyListProps) {
  if (replies.length === 0) return null;

  return (
    <motion.div
      className="space-y-3 ml-4 pl-4 border-l border-white/10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {replies.map((reply, index) => (
        <motion.div
          key={reply.id}
          className="bg-black/20 rounded-[0.75rem] p-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          {/* Reply Header */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-sand/20 rounded-full flex items-center justify-center overflow-hidden">
              {reply.authorAvatar ? (
                <img
                  src={resolveAvatarDisplayUrl(reply.authorAvatar)}
                  alt={reply.authorName || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sand text-xs font-semibold">
                  {(reply.authorName || "User").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-white text-xs font-medium">{reply.authorName || `User ${reply.userId.slice(-6)}`}</p>
              <p className="text-sand/50 text-xs">
                {new Date(reply.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Reply Body */}
          <p className="text-sand/80 text-xs leading-relaxed whitespace-pre-wrap">
            {reply.body}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
