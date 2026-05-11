import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useCreatePlaylist } from "../../hooks/useAudio";

interface CreatePlaylistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  availableTrackIds?: string[];
}

export function CreatePlaylistDialog({ isOpen, onClose, availableTrackIds = [] }: CreatePlaylistDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState("");
  const createPlaylistMutation = useCreatePlaylist();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    const tagArray = tags.split(",").map(tag => tag.trim()).filter(Boolean);
    
    createPlaylistMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      trackIds: availableTrackIds,
      isPublic,
      tags: tagArray
    }, {
      onSuccess: () => {
        onClose();
        // Reset form
        setName("");
        setDescription("");
        setIsPublic(false);
        setTags("");
      }
    });
  };

  const handleClose = () => {
    if (!createPlaylistMutation.isPending) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-ink border border-white/10 rounded-[1.5rem] p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Create Playlist</h3>
              <button
                onClick={handleClose}
                disabled={createPlaylistMutation.isPending}
                className="text-sand/50 hover:text-white transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Playlist Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter playlist name"
                  disabled={createPlaylistMutation.isPending}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-sand/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 disabled:opacity-50"
                  maxLength={100}
                  required
                />
                <div className="mt-1 text-xs text-sand/50">
                  {name.length}/100
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  disabled={createPlaylistMutation.isPending}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-sand/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 disabled:opacity-50 resize-none"
                  rows={3}
                  maxLength={500}
                />
                <div className="mt-1 text-xs text-sand/50">
                  {description.length}/500
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="kemet, spiritual, educational (comma separated)"
                  disabled={createPlaylistMutation.isPending}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-sand/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 disabled:opacity-50"
                />
              </div>

              {/* Public Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white">
                  Make Public
                </label>
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  disabled={createPlaylistMutation.isPending}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isPublic ? 'bg-gold' : 'bg-white/10'
                  } disabled:opacity-50`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isPublic ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Track Count Info */}
              {availableTrackIds.length > 0 && (
                <div className="text-xs text-sand/50 bg-white/5 rounded-lg p-2">
                  {availableTrackIds.length} tracks will be added to this playlist
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={createPlaylistMutation.isPending}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || createPlaylistMutation.isPending}
                  className="flex-1 py-3 bg-gold hover:bg-gold/90 text-ink rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createPlaylistMutation.isPending ? 'Creating...' : 'Create Playlist'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
