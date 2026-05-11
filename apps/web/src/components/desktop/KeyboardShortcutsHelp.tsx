import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Command, Search, Layout, Monitor, FileText, Maximize2 } from 'lucide-react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { cn } from '../../lib/utils';

export const KeyboardShortcutsHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { shortcuts, getShortcutsByCategory } = useKeyboardShortcuts();

  useEffect(() => {
    const handleShowHelp = () => setIsOpen(true);
    window.addEventListener('showKeyboardHelp', handleShowHelp);
    return () => window.removeEventListener('showKeyboardHelp', handleShowHelp);
  }, []);

  const categoryIcons = {
    navigation: Search,
    layout: Layout,
    media: Monitor,
    content: FileText,
    window: Maximize2
  };

  const categoryColors = {
    navigation: 'text-blue-400',
    layout: 'text-orange-400',
    media: 'text-green-400',
    content: 'text-purple-400',
    window: 'text-pink-400'
  };

  const renderKey = (key: string, ctrlKey?: boolean, metaKey?: boolean, shiftKey?: boolean) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    return (
      <div className="flex items-center gap-1">
        {ctrlKey && (
          <span className="px-2 py-1 bg-white/20 rounded text-xs font-medium">
            {isMac ? <Command className="w-3 h-3" /> : <span className="font-bold">Ctrl</span>}
          </span>
        )}
        {metaKey && (
          <span className="px-2 py-1 bg-white/20 rounded text-xs font-medium">
            <Command className="w-3 h-3" />
          </span>
        )}
        {shiftKey && (
          <span className="px-2 py-1 bg-white/20 rounded text-xs font-medium">
            <span className="font-bold">Shift</span>
          </span>
        )}
        <span className="px-2 py-1 bg-white/20 rounded text-xs font-medium">
          {key === ' ' ? 'Espace' : key.toUpperCase()}
        </span>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
        onClick={() => setIsOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Raccourcis Clavier</h2>
                <p className="text-white/60">Maîtrisez MAATFEED avec ces raccourcis puissants</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(categoryIcons).map(([category, Icon]) => (
                <div key={category} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("w-5 h-5", categoryColors[category as keyof typeof categoryColors])} />
                    <h3 className="text-lg font-semibold text-white capitalize">
                      {category === 'navigation' && 'Navigation'}
                      {category === 'layout' && 'Layout'}
                      {category === 'media' && 'Média'}
                      {category === 'content' && 'Contenu'}
                      {category === 'window' && 'Fenêtre'}
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    {getShortcutsByCategory(category as keyof typeof categoryIcons).map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-sm text-white/80">{shortcut.description}</span>
                        {renderKey(shortcut.key, shortcut.ctrlKey, shortcut.metaKey, shortcut.shiftKey)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="mt-8 p-4 bg-gradient-to-r from-orange-500/10 to-purple-500/10 rounded-xl border border-orange-500/30">
              <h4 className="text-lg font-semibold text-white mb-3">Conseils Pro</h4>
              <div className="space-y-2 text-sm text-white/80">
                <p>• Utilisez <kbd className="px-2 py-1 bg-white/20 rounded">⌘+K</kbd> pour une recherche rapide</p>
                <p>• Changez de layout avec <kbd className="px-2 py-1 bg-white/20 rounded">⌘+1/2/3/4</kbd></p>
                <p>• Contrôlez l'audio avec <kbd className="px-2 py-1 bg-white/20 rounded">⌘+Espace</kbd></p>
                <p>• Appuyez sur <kbd className="px-2 py-1 bg-white/20 rounded">Shift+?</kbd> pour afficher cette aide</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
