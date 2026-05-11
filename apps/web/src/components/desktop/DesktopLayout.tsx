import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesktopStore } from '../../stores/desktopStore';
import { useResponsive } from '../../hooks/useResponsive';
import { cn } from '../../lib/utils';

// Panel Components
import { LeftSidebar } from './panels/LeftSidebar';
import { MainFeed } from './panels/MainFeed';
import { RightContextPanel } from './panels/RightContextPanel';
import { PersistentPlayer } from './panels/PersistentPlayer';
import { CreatorWorkspace } from './panels/CreatorWorkspace';
import { DebateWorkspace } from './panels/DebateWorkspace';

interface DesktopLayoutProps {
  children?: React.ReactNode;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children }) => {
  const { isDesktop, isTablet, isLargeDesktop } = useResponsive();
  const [layout, setLayout] = useState<'default' | 'creator' | 'debate' | 'immersive'>('default');
  const [rightPanelExpanded, setRightPanelExpanded] = useState(false);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            setLeftSidebarCollapsed(!leftSidebarCollapsed);
            break;
          case 'e':
            e.preventDefault();
            setRightPanelExpanded(!rightPanelExpanded);
            break;
          case '1':
            e.preventDefault();
            setLayout('default');
            break;
          case '2':
            e.preventDefault();
            setLayout('creator');
            break;
          case '3':
            e.preventDefault();
            setLayout('debate');
            break;
          case '4':
            e.preventDefault();
            setLayout('immersive');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [leftSidebarCollapsed, rightPanelExpanded]);

  if (!isDesktop && !isTablet) {
    return <div className="min-h-screen bg-black">{children}</div>;
  }

  const getLayoutClasses = () => {
    const base = "min-h-screen bg-black text-white overflow-hidden relative";
    
    if (layout === 'immersive') {
      return cn(base, "grid grid-cols-1");
    }
    
    if (layout === 'creator') {
      return cn(base, "grid grid-cols-12 gap-0");
    }
    
    if (layout === 'debate') {
      return cn(base, "grid grid-cols-12 gap-0");
    }
    
    // Default layout
    return cn(base, "grid grid-cols-12 gap-0");
  };

  const getPanelWidths = () => {
    if (isLargeDesktop) {
      return {
        left: leftSidebarCollapsed ? 'w-16' : 'w-80',
        main: rightPanelExpanded ? 'col-span-6' : 'col-span-7',
        right: rightPanelExpanded ? 'col-span-5' : 'col-span-4'
      };
    }
    
    return {
      left: leftSidebarCollapsed ? 'w-16' : 'w-64',
      main: rightPanelExpanded ? 'col-span-6' : 'col-span-8',
      right: rightPanelExpanded ? 'col-span-4' : 'col-span-3'
    };
  };

  const widths = getPanelWidths();

  return (
    <div ref={containerRef} className={getLayoutClasses()}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/20 via-black to-purple-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Layout Selector */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2">
          {(['default', 'creator', 'debate', 'immersive'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setLayout(mode)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300",
                layout === mode 
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25" 
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              {mode === 'default' && 'Feed'}
              {mode === 'creator' && 'Studio'}
              {mode === 'debate' && 'Débat'}
              {mode === 'immersive' && 'Immersif'}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {layout === 'default' && (
          <motion.div
            key="default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-12 gap-0 w-full"
          >
            {/* Left Sidebar */}
            <motion.div
              initial={{ width: leftSidebarCollapsed ? 64 : 320 }}
              animate={{ width: leftSidebarCollapsed ? 64 : 320 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="relative border-r border-white/5 bg-black/40 backdrop-blur-sm"
            >
              <LeftSidebar collapsed={leftSidebarCollapsed} />
            </motion.div>

            {/* Main Feed */}
            <div className={cn("relative", widths.main)}>
              <MainFeed />
            </div>

            {/* Right Context Panel */}
            <motion.div
              initial={{ width: rightPanelExpanded ? '50%' : '33.33%' }}
              animate={{ width: rightPanelExpanded ? '50%' : '33.33%' }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="relative border-l border-white/5 bg-black/20 backdrop-blur-sm"
            >
              <RightContextPanel 
                expanded={rightPanelExpanded}
                onToggleExpand={() => setRightPanelExpanded(!rightPanelExpanded)}
              />
            </motion.div>
          </motion.div>
        )}

        {layout === 'creator' && (
          <motion.div
            key="creator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <CreatorWorkspace />
          </motion.div>
        )}

        {layout === 'debate' && (
          <motion.div
            key="debate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <DebateWorkspace />
          </motion.div>
        )}

        {layout === 'immersive' && (
          <motion.div
            key="immersive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <MainFeed immersive={true} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Audio Player */}
      <PersistentPlayer />

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
          title="Raccourcis clavier (⌘+B: Sidebar, ⌘+E: Panel, ⌘+1-4: Layouts)"
        >
          <span className="text-xs font-medium">?</span>
        </button>
      </div>
    </div>
  );
};

export default DesktopLayout;
