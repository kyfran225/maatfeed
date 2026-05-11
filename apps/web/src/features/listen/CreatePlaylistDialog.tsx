import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Music, Users, Lock, Globe } from 'lucide-react';

interface CreatePlaylistDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreatePlaylistDialog({ onClose, onSuccess }: CreatePlaylistDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    setIsLoading(true);
    
    try {
      // Simuler la création de playlist
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Réinitialiser le formulaire
      setName('');
      setDescription('');
      setIsPublic(false);
      setCoverImage(null);
      
      onSuccess();
    } catch (error) {
      console.error('Error creating playlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCoverImage(file);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 rounded-2xl border border-white/20 max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">
              Créer une playlist
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Cover Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Image de couverture
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-gray-800 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden">
                  {coverImage ? (
                    <img
                      src={URL.createObjectURL(coverImage)}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="w-8 h-8 text-gray-500" />
                  )}
                </div>
                
                <div>
                  <input
                    type="file"
                    id="cover-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="cover-upload"
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-white/20 rounded-lg hover:border-orange-500 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Choisir une image</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG jusqu'à 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Playlist Name */}
            <div>
              <label htmlFor="playlist-name" className="block text-sm font-medium text-gray-300 mb-2">
                Nom de la playlist *
              </label>
              <input
                id="playlist-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ma playlist préférée..."
                className="w-full px-4 py-3 bg-gray-800 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                required
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                {name.length}/100 caractères
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="playlist-description" className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="playlist-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez votre playlist..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length}/500 caractères
              </p>
            </div>

            {/* Privacy Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Confidentialité
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg border border-white/10 cursor-pointer hover:border-orange-500/50 transition-colors">
                  <input
                    type="radio"
                    name="privacy"
                    checked={!isPublic}
                    onChange={() => setIsPublic(false)}
                    className="w-4 h-4 text-orange-500"
                  />
                  <Lock className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Privée</p>
                    <p className="text-xs text-gray-500">Seulement vous pouvez voir cette playlist</p>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg border border-white/10 cursor-pointer hover:border-orange-500/50 transition-colors">
                  <input
                    type="radio"
                    name="privacy"
                    checked={isPublic}
                    onChange={() => setIsPublic(true)}
                    className="w-4 h-4 text-orange-500"
                  />
                  <Globe className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Publique</p>
                    <p className="text-xs text-gray-500">Tout le monde peut voir cette playlist</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!name.trim() || isLoading}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Création...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>Créer la playlist</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
