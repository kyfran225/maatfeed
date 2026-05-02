import { motion } from "framer-motion";
import { useState } from "react";

interface CommentComposerProps {
  onSubmit: (body: string) => Promise<boolean> | boolean;
  disabled?: boolean;
  placeholder?: string;
  errorMessage?: string | null;
  onFocusChange?: (isFocused: boolean) => void;
}

export function CommentComposer({
  onSubmit,
  disabled = false,
  placeholder = "Write a comment...",
  errorMessage = null,
  onFocusChange
}: CommentComposerProps) {
  const [body, setBody] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (body.trim() && !disabled) {
      const wasSuccessful = await onSubmit(body.trim());
      if (wasSuccessful !== false) {
        setBody("");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onFocus={() => onFocusChange?.(true)}
          onBlur={() => onFocusChange?.(false)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-black/30 border border-white/10 rounded-[0.75rem] px-3 py-2 sm:px-4 sm:py-3 text-sand/90 placeholder-sand/50 resize-none focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 disabled:opacity-50 text-sm sm:text-base"
          rows={3}
          maxLength={1000}
        />
        <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 text-xs text-sand/50">
          {body.length}/1000
        </div>
      </div>
      
      <div className="flex justify-end">
        <motion.button
          type="submit"
          disabled={!body.trim() || disabled}
          className="px-3 py-2 sm:px-4 sm:py-2 bg-gold text-ink rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: !disabled && body.trim() ? 1.05 : 1 }}
          whileTap={{ scale: !disabled && body.trim() ? 0.95 : 1 }}
        >
          {disabled ? "Publication..." : "Publier"}
        </motion.button>
      </div>

      {errorMessage && (
        <p className="text-sm text-red-300 leading-relaxed">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
