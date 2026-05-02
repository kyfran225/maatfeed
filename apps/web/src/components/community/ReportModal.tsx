import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, description?: string) => Promise<void>;
  isSubmitting: boolean;
}

const reportReasons = [
  { value: "spam", label: "Spam", description: "Contenu indésirable ou promotionnel" },
  { value: "harassment", label: "Harcèlement", description: "Attacks ou menaces envers une personne" },
  { value: "hate_speech", label: "Discours haineux", description: "Contenu discriminatoire ou haineux" },
  { value: "misinformation", label: "Désinformation", description: "Information fausse ou trompeuse" },
  { value: "inappropriate", label: "Contenu inapproprié", description: "Contenu choquant ou inadapté" },
  { value: "other", label: "Autre", description: "Autre raison non listée" }
];

export function ReportModal({ isOpen, onClose, onSubmit, isSubmitting }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) return;
    
    await onSubmit(selectedReason, description.trim() || undefined);
    setSelectedReason("");
    setDescription("");
    onClose();
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedReason("");
      setDescription("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md bg-black/90 border border-white/20 rounded-2xl p-6 z-50 overflow-y-auto max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-semibold">Signaler le commentaire</h2>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-sand/60 hover:text-white transition-colors disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Reason Selection */}
              <div>
                <label className="block text-sand/80 text-sm font-medium mb-3">
                  Raison du signalement
                </label>
                <div className="space-y-2">
                  {reportReasons.map((reason) => (
                    <label
                      key={reason.value}
                      className="flex items-start gap-3 p-3 rounded-lg border border-white/10 hover:border-white/20 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={reason.value}
                        checked={selectedReason === reason.value}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        disabled={isSubmitting}
                        className="mt-1 text-cyan-500 focus:ring-cyan-500 focus:border-cyan-500"
                      />
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{reason.label}</div>
                        <div className="text-sand/60 text-xs mt-1">{reason.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description (optional) */}
              <div>
                <label htmlFor="description" className="block text-sand/80 text-sm font-medium mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Ajoutez plus de détails si nécessaire..."
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder-sand/50 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none"
                  rows={3}
                  maxLength={500}
                />
                <div className="text-sand/50 text-xs mt-1 text-right">
                  {description.length}/500
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!selectedReason || isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Signalement..." : "Signaler"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
