import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Search, 
  Headphones, 
  Users, 
  Bookmark, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Play,
  Clock,
  TrendingUp,
  Mic,
  Video,
  FileText,
  Hash,
  Star,
  Flame,
  Sparkles
} from 'lucide-react';
import { useDesktopStore } from '../../../stores/desktopStore';
import { cn } from '../../../lib/utils';

interface LeftSidebarProps {
  collapsed?: boolean;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ collapsed = false }) => {
  const { 
    panels, 
    setLeftActiveSection, 
    setLayout,
    activePanel 
  } = useDesktopStore();

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const navigationItems = [
    { id: 'home', icon: Home, label: 'Accueil', section: 'navigation' as const },
    { id: 'search', icon: Search, label: 'Rechercher', section: 'navigation' as const },
    { id: 'feed', icon: Play, label: 'Feed', section: 'navigation' as const },
    { id: 'trending', icon: TrendingUp, label: 'Tendances', section: 'navigation' as const },
  ];

  const contentItems = [
    { id: 'audio', icon: Headphones, label: 'Audio', section: 'navigation' as const, badge: '12' },
    { id: 'video', icon: Video, label: 'Vidéo', section: 'navigation' as const, badge: '8' },
    { id: 'debates', icon: Mic, label: 'Débats', section: 'debates' as const, badge: '24' },
    { id: 'series', icon: FileText, label: 'Séries', section: 'series' as const },
  ];

  const libraryItems = [
    { id: 'playlists', icon: Bookmark, label: 'Playlists', section: 'playlists' as const },
    { id: 'themes', icon: Hash, label: 'Thèmes', section: 'themes' as const },
    { id: 'creators', icon: Users, label: 'Créateurs', section: 'creators' as const, badge: '142' },
    { id: 'following', icon: Star, label: 'Suivis', section: 'navigation' as const },
  ];

  const workspaceItems = [
    { id: 'creator', icon: Sparkles, label: 'Studio', section: 'navigation' as const, special: true },
    { id: 'debate', icon: Mic, label: 'Débat', section: 'debates' as const, special: true },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics', section: 'navigation' as const },
  ];

  const handleItemClick = (item: any) => {
    setLeftActiveSection(item.section);
    
    if (item.special) {
      if (item.id === 'creator') setLayout('creator');
      if (item.id === 'debate') setLayout('debate');
    }
  };

  const renderSection = (title: string, items: any[], sectionKey: string) => {
    if (collapsed) return null;

    return (
      <div className="mb-8">
        <h3 className="px-4 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
          {title}
        </h3>
        <div className="space-y-1">
          {items.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => handleItemClick(item)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                "w-full px-4 py-3 flex items-center gap-3 rounded-lg transition-all duration-200 relative overflow-hidden group",
                panels.left.activeSection === item.section
                  ? "bg-orange-500/20 text-orange-400 border-l-2 border-orange-500"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
                )}
              </div>
              
              <span className="flex-1 text-left text-sm font-medium">
                {item.label}
              </span>
              
              {item.badge && (
                <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/60">
                  {item.badge}
                </span>
              )}
              
              {item.special && (
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
              
              <AnimatePresence>
                {hoveredItem === item.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute right-2 w-1 h-6 bg-orange-500 rounded-full"
                  />
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  if (collapsed) {
    return (
      <div className="h-full flex flex-col items-center py-6 space-y-4">
        {navigationItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => handleItemClick(item)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200",
              panels.left.activeSection === item.section
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                : "text-white/60 hover:text-white hover:bg-white/10"
            )}
          >
            <item.icon className="w-5 h-5" />
          </motion.button>
        ))}
        
        <div className="flex-1" />
        
        <motion.button
          onClick={() => setLayout('creator')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-purple-500 text-white"
        >
          <Sparkles className="w-5 h-5" />
        </motion.button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col py-6">
      {/* Logo */}
      <div className="px-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">MAATFEED</h1>
            <p className="text-xs text-white/40">Culture Vivante</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
        {renderSection('Navigation', navigationItems, 'navigation')}
        {renderSection('Contenu', contentItems, 'content')}
        {renderSection('Bibliothèque', libraryItems, 'library')}
        {renderSection('Espaces', workspaceItems, 'workspace')}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-white">U</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Utilisateur</p>
            <p className="text-xs text-white/40">Premium</p>
          </div>
          <Settings className="w-4 h-4 text-white/40" />
        </div>
      </div>
    </div>
  );
};
