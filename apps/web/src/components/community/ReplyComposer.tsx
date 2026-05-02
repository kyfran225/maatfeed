import { motion } from "framer-motion";
import { useState } from "react";
import { useCreateReply } from "../../hooks/useComments";

interface ReplyComposerProps {
  commentId: string;
  contentId?: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export function ReplyComposer({ commentId, contentId, onSubmit, onCancel }: ReplyComposerProps) {
  const [body, setBody] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const createReplyMutation = useCreateReply(contentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (body.trim() && !createReplyMutation.isPending) {
      setSubmitError(null);

      try {
        await createReplyMutation.mutateAsync({ commentId, body: body.trim(), replyMode: "flat" });
        setBody("");
        onSubmit();
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Échec de publication de la réponse.");
      }
    }
  };

  return (
    <motion.div
      className="bg-black/20 rounded-[0.75rem] p-3"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a reply..."
            disabled={createReplyMutation.isPending}
            className="w-full bg-black/30 border border-white/10 rounded-[0.5rem] px-3 py-2 text-sand/90 placeholder-sand/50 resize-none focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 disabled:opacity-50 text-xs"
            rows={2}
            maxLength={500}
          />
          <div className="absolute bottom-1 right-1 text-xs text-sand/50">
            {body.length}/500
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-sand/45">
          Votre réponse sera publiée sous ce point de vue. Le contexte `@username` restera cliquable.
        </p>

        {submitError && (
          <p className="text-xs leading-relaxed text-red-300">
            {submitError}
          </p>
        )}
        
        <div className="flex gap-2">
          <motion.button
            type="button"
            onClick={onCancel}
            disabled={createReplyMutation.isPending}
            className="px-3 py-1 bg-white/10 text-sand/70 rounded-full text-xs font-medium disabled:opacity-50"
            whileHover={{ scale: !createReplyMutation.isPending ? 1.05 : 1 }}
            whileTap={{ scale: !createReplyMutation.isPending ? 0.95 : 1 }}
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            disabled={!body.trim() || createReplyMutation.isPending}
            className="px-3 py-1 bg-gold text-ink rounded-full text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: !createReplyMutation.isPending && body.trim() ? 1.05 : 1 }}
            whileTap={{ scale: !createReplyMutation.isPending && body.trim() ? 0.95 : 1 }}
          >
            {createReplyMutation.isPending ? "Replying..." : "Reply"}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
