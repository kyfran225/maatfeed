import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { createDebateThread } from "../../services/communityService";
import { useAuth } from "../../hooks/useAuth";

interface CreateDebateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (debate: any) => void;
}

export function CreateDebateSheet({ isOpen, onClose, onSuccess }: CreateDebateSheetProps) {
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableTags = [
    "kemet", "philosophie", "spiritualité", "religion", "histoire", "culture",
    "éducation", "technologie", "modernité", "traditions", "science",
    "société", "réforme", "décolonialisme", "renaissance", "innovation",
    "mathématiques", "reconnaissance"
  ];

  // Block body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isOpen]);

  // Reset form when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setSelectedTags([]);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      setError('Le titre et la description sont requis');
      return;
    }

    if (selectedTags.length === 0) {
      setError('Veuillez sélectionner au moins un sujet');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create the debate thread - the API will return a real contentId
      const debate = await createDebateThread({
        title: title.trim(),
        description: description.trim(),
        tags: selectedTags
      });

      if (debate) {
        onSuccess?.(debate);
        onClose();
      } else {
        setError('Échec de la création du débat. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Error creating debate:', error);
      setError('Une erreur est survenue lors de la création du débat');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-overlay="true"
          className="fixed inset-0 z-[210] flex items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-ink border-t border-white/10 rounded-t-3xl w-full h-[75vh] sm:h-[90vh] max-h-[75vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              const shouldClose = info.offset.y > 140 || info.velocity.y > 900;
              if (shouldClose) onClose();
            }}
            style={{ touchAction: 'pan-y' }}
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 flex justify-between items-center">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white">Nouveau Débat</h3>
                <p className="text-xs sm:text-sm text-sand/70 mt-1">
                  Créez un sujet de discussion pour la communauté
                </p>
              </div>
              <button
                data-close="true"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 space-y-4 sm:space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Titre du Débat *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="De quoi parle le débat ?"
                  className="w-full bg-sand/10 border border-sand/20 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-white placeholder-sand/50 focus:outline-none focus:border-gold/50 transition-colors text-sm sm:text-base"
                  maxLength={200}
                  required
                />
                <div className="text-xs text-sand/50 mt-1">
                  {title.length}/200 characters
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Fournissez le contexte et les questions pour guider la discussion..."
                  className="w-full bg-sand/10 border border-sand/20 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-white placeholder-sand/50 focus:outline-none focus:border-gold/50 transition-colors resize-none text-sm sm:text-base"
                  rows={4}
                  maxLength={1000}
                  required
                />
                <div className="text-xs text-sand/50 mt-1">
                  {description.length}/1000 characters
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Sujets * (sélectionnez au moins un)
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-gold text-ink'
                          : 'bg-sand/10 text-sand/70 hover:bg-sand/20'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-sand/50 mt-2">
                  {selectedTags.length} sujet{selectedTags.length !== 1 ? 's' : ''} sélectionné{selectedTags.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[1rem] border border-red-500/30 bg-red-500/10 p-3"
                >
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Guidelines */}
              <div className="bg-sand/5 rounded-lg p-4 border border-sand/10">
                <h4 className="text-sm font-medium text-gold mb-2">Règles du Débat</h4>
                <ul className="text-xs text-sand/70 space-y-1">
                  <li>Soyez respectueux et constructif dans vos discussions</li>
                  <li>Concentrez-vous sur la civilisation Kemet, la philosophie africaine et le patrimoine culturel</li>
                  <li>Fournissez suffisamment de contexte pour susciter des conversations significatives</li>
                  <li>Choisissez des sujets pertinents pour aider les autres à trouver votre débat</li>
                </ul>
              </div>
            </form>

            {/* Submit Button */}
            <div className="border-t border-white/10 p-4 sm:p-6">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim() || !description.trim() || selectedTags.length === 0}
                className="w-full bg-gold text-ink font-medium py-2 sm:py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold/90 text-sm sm:text-base"
              >
                {isSubmitting ? 'Création du débat...' : 'Lancer le débat'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
