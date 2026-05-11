import { useEffect, useCallback } from 'react';
import { useDesktopStore } from '../stores/desktopStore';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  category: 'navigation' | 'layout' | 'media' | 'content' | 'window';
}

export const useKeyboardShortcuts = () => {
  const {
    layout,
    leftSidebarCollapsed,
    rightPanelExpanded,
    setLayout,
    toggleLeftSidebar,
    toggleRightPanel,
    setActivePanel,
    setLeftActiveSection,
    setRightActiveSection,
    resetLayout
  } = useDesktopStore();

  // Layout shortcuts
  const handleLayoutDefault = useCallback(() => setLayout('default'), [setLayout]);
  const handleLayoutCreator = useCallback(() => setLayout('creator'), [setLayout]);
  const handleLayoutDebate = useCallback(() => setLayout('debate'), [setLayout]);
  const handleLayoutImmersive = useCallback(() => setLayout('immersive'), [setLayout]);

  // Panel shortcuts
  const handleToggleSidebar = useCallback(() => toggleLeftSidebar(), [toggleLeftSidebar]);
  const handleToggleRightPanel = useCallback(() => toggleRightPanel(), [toggleRightPanel]);

  // Navigation shortcuts
  const handleFocusFeed = useCallback(() => setActivePanel('feed'), [setActivePanel]);
  const handleFocusDebate = useCallback(() => setActivePanel('debate'), [setActivePanel]);
  const handleFocusCreator = useCallback(() => setActivePanel('creator'), [setActivePanel]);
  const handleFocusAnalytics = useCallback(() => setActivePanel('analytics'), [setActivePanel]);

  // Content shortcuts
  const handleNewContent = useCallback(() => {
    if (layout === 'creator') {
      setLeftActiveSection('navigation');
    } else {
      setLayout('creator');
    }
  }, [layout, setLayout, setLeftActiveSection]);

  const handleNewDebate = useCallback(() => {
    if (layout === 'debate') {
      // Focus debate input
    } else {
      setLayout('debate');
    }
  }, [layout, setLayout]);

  // Window shortcuts
  const handleResetLayout = useCallback(() => resetLayout(), [resetLayout]);
  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const shortcuts: KeyboardShortcut[] = [
    // Layout Navigation
    {
      key: '1',
      ctrlKey: true,
      metaKey: true,
      action: handleLayoutDefault,
      description: 'Basculer vers layout Feed',
      category: 'layout'
    },
    {
      key: '2',
      ctrlKey: true,
      metaKey: true,
      action: handleLayoutCreator,
      description: 'Basculer vers layout Studio',
      category: 'layout'
    },
    {
      key: '3',
      ctrlKey: true,
      metaKey: true,
      action: handleLayoutDebate,
      description: 'Basculer vers layout Débat',
      category: 'layout'
    },
    {
      key: '4',
      ctrlKey: true,
      metaKey: true,
      action: handleLayoutImmersive,
      description: 'Basculer vers layout Immersif',
      category: 'layout'
    },

    // Panel Control
    {
      key: 'b',
      ctrlKey: true,
      metaKey: true,
      action: handleToggleSidebar,
      description: 'Afficher/Masquer sidebar gauche',
      category: 'layout'
    },
    {
      key: 'e',
      ctrlKey: true,
      metaKey: true,
      action: handleToggleRightPanel,
      description: 'Afficher/Masquer panel droit',
      category: 'layout'
    },

    // Quick Navigation
    {
      key: 'g',
      ctrlKey: true,
      metaKey: true,
      action: handleFocusFeed,
      description: 'Aller au Feed',
      category: 'navigation'
    },
    {
      key: 'd',
      ctrlKey: true,
      metaKey: true,
      action: handleFocusDebate,
      description: 'Aller aux Débats',
      category: 'navigation'
    },
    {
      key: 'c',
      ctrlKey: true,
      metaKey: true,
      action: handleFocusCreator,
      description: 'Aller au Studio',
      category: 'navigation'
    },
    {
      key: 'a',
      ctrlKey: true,
      metaKey: true,
      action: handleFocusAnalytics,
      description: 'Aller aux Analytics',
      category: 'navigation'
    },

    // Content Creation
    {
      key: 'n',
      ctrlKey: true,
      metaKey: true,
      action: handleNewContent,
      description: 'Nouveau contenu',
      category: 'content'
    },
    {
      key: 'd',
      ctrlKey: true,
      metaKey: true,
      shiftKey: true,
      action: handleNewDebate,
      description: 'Nouveau débat',
      category: 'content'
    },

    // Window Management
    {
      key: 'r',
      ctrlKey: true,
      metaKey: true,
      action: handleResetLayout,
      description: 'Réinitialiser layout',
      category: 'window'
    },
    {
      key: 'f',
      ctrlKey: true,
      metaKey: true,
      shiftKey: true,
      action: handleFullscreen,
      description: 'Plein écran',
      category: 'window'
    },

    // Media Control (Global)
    {
      key: ' ',
      ctrlKey: true,
      metaKey: true,
      action: () => {
        // Toggle play/pause for audio player
        const event = new CustomEvent('togglePlayPause');
        window.dispatchEvent(event);
      },
      description: 'Lecture/Pause audio',
      category: 'media'
    },
    {
      key: 'ArrowRight',
      ctrlKey: true,
      metaKey: true,
      action: () => {
        // Next track
        const event = new CustomEvent('nextTrack');
        window.dispatchEvent(event);
      },
      description: 'Piste suivante',
      category: 'media'
    },
    {
      key: 'ArrowLeft',
      ctrlKey: true,
      metaKey: true,
      action: () => {
        // Previous track
        const event = new CustomEvent('previousTrack');
        window.dispatchEvent(event);
      },
      description: 'Piste précédente',
      category: 'media'
    },

    // Search
    {
      key: 'k',
      ctrlKey: true,
      metaKey: true,
      action: () => {
        // Focus search input
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="rechercher"], input[placeholder*="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      },
      description: 'Recherche rapide',
      category: 'navigation'
    },

    // Help
    {
      key: '?',
      shiftKey: true,
      action: () => {
        // Show keyboard shortcuts help
        const event = new CustomEvent('showKeyboardHelp');
        window.dispatchEvent(event);
      },
      description: 'Afficher les raccourcis',
      category: 'navigation'
    }
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const matchingShortcut = shortcuts.find(shortcut => {
        const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const metaMatches = shortcut.metaKey ? event.metaKey : !event.metaKey;
        const shiftMatches = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.altKey ? event.altKey : !event.altKey;

        return keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches;
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  // Return shortcuts for help display
  return {
    shortcuts,
    getShortcutsByCategory: (category: KeyboardShortcut['category']) => 
      shortcuts.filter(s => s.category === category)
  };
};
