import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface InlineReplyInputProps {
  placeholder?: string;
  onSubmit: (body: string) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  onDraftChange?: (value: string) => void;
}

export function InlineReplyInput({
  placeholder = "Écrire une réponse...",
  onSubmit,
  onCancel,
  autoFocus = false,
  onDraftChange,
}: InlineReplyInputProps) {
  const [text, setText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim());
      setText("");
      onDraftChange?.("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      onDraftChange?.("");
      onCancel?.();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border transition-all duration-200 ${
        isFocused 
          ? "bg-ink border-gold/30 ring-1 ring-gold/20" 
          : "bg-sand/5 border-sand/20"
      }`}
    >
      <div className="p-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onDraftChange?.(e.target.value);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onDraftChange?.("");
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-white placeholder-sand/40 resize-none outline-none min-h-[60px]"
          rows={2}
        />
      </div>

      <div className="border-t border-sand/10 px-3 py-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className="max-w-xl text-[11px] leading-relaxed text-sand/45">
              Votre réponse sera publiée sous ce point de vue. Le contexte `@username` restera cliquable.
            </p>

            <span className="hidden sm:inline text-xs text-sand/40">
              <kbd className="px-1.5 py-0.5 bg-sand/10 rounded text-[10px]">Enter</kbd> envoyer
            </span>
          </div>

          <div className="flex items-center justify-end gap-2">
            {onCancel && (
              <button
                onClick={() => {
                  onDraftChange?.("");
                  onCancel();
                }}
                className="px-3 py-1.5 text-xs text-sand/60 hover:text-sand transition-colors"
              >
                Annuler
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="px-4 py-1.5 bg-gold text-ink text-xs font-medium rounded-lg hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Répondre
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
