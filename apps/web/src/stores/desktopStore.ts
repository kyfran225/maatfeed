import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DesktopLayoutState {
  // Layout preferences
  layout: 'default' | 'creator' | 'debate' | 'immersive';
  leftSidebarCollapsed: boolean;
  rightPanelExpanded: boolean;
  activePanel: 'feed' | 'debate' | 'creator' | 'analytics';
  
  // Panel states
  panels: {
    left: {
      activeSection: 'navigation' | 'series' | 'playlists' | 'themes' | 'debates' | 'creators';
    };
    right: {
      activeSection: 'debate' | 'context' | 'analytics' | 'references';
      expanded: boolean;
    };
  };
  
  // Workspace states
  creatorWorkspace: {
    activeTool: 'upload' | 'audio' | 'series' | 'analytics' | 'ai';
    uploadProgress: number;
  };
  
  debateWorkspace: {
    mode: 'compact' | 'threaded' | 'compare';
    activeArgument: string | null;
  };
  
  // UI preferences
  preferences: {
    theme: 'dark' | 'light' | 'auto';
    animations: boolean;
    sounds: boolean;
    autoPlay: boolean;
  };
  
  // Actions
  setLayout: (layout: DesktopLayoutState['layout']) => void;
  toggleLeftSidebar: () => void;
  toggleRightPanel: () => void;
  setActivePanel: (panel: DesktopLayoutState['activePanel']) => void;
  setLeftActiveSection: (section: DesktopLayoutState['panels']['left']['activeSection']) => void;
  setRightActiveSection: (section: DesktopLayoutState['panels']['right']['activeSection']) => void;
  setCreatorActiveTool: (tool: DesktopLayoutState['creatorWorkspace']['activeTool']) => void;
  setDebateMode: (mode: DesktopLayoutState['debateWorkspace']['mode']) => void;
  setPreferences: (prefs: Partial<DesktopLayoutState['preferences']>) => void;
  resetLayout: () => void;
}

const defaultState: Omit<DesktopLayoutState, 'setLayout' | 'toggleLeftSidebar' | 'toggleRightPanel' | 'setActivePanel' | 'setLeftActiveSection' | 'setRightActiveSection' | 'setCreatorActiveTool' | 'setDebateMode' | 'setPreferences' | 'resetLayout'> = {
  layout: 'default',
  leftSidebarCollapsed: false,
  rightPanelExpanded: false,
  activePanel: 'feed',
  panels: {
    left: {
      activeSection: 'navigation'
    },
    right: {
      activeSection: 'debate',
      expanded: false
    }
  },
  creatorWorkspace: {
    activeTool: 'upload',
    uploadProgress: 0
  },
  debateWorkspace: {
    mode: 'threaded',
    activeArgument: null
  },
  preferences: {
    theme: 'dark',
    animations: true,
    sounds: true,
    autoPlay: false
  }
};

export const useDesktopStore = create<DesktopLayoutState>()(
  persist(
    (set, get) => ({
      ...defaultState,
      
      setLayout: (layout) => set({ layout }),
      
      toggleLeftSidebar: () => 
        set((state) => ({ leftSidebarCollapsed: !state.leftSidebarCollapsed })),
      
      toggleRightPanel: () =>
        set((state) => ({ 
          rightPanelExpanded: !state.rightPanelExpanded,
          panels: {
            ...state.panels,
            right: {
              ...state.panels.right,
              expanded: !state.rightPanelExpanded
            }
          }
        })),
      
      setActivePanel: (activePanel) => set({ activePanel }),
      
      setLeftActiveSection: (activeSection) =>
        set((state) => ({
          panels: {
            ...state.panels,
            left: { ...state.panels.left, activeSection }
          }
        })),
      
      setRightActiveSection: (activeSection) =>
        set((state) => ({
          panels: {
            ...state.panels,
            right: { ...state.panels.right, activeSection }
          }
        })),
      
      setCreatorActiveTool: (activeTool) =>
        set((state) => ({
          creatorWorkspace: { ...state.creatorWorkspace, activeTool }
        })),
      
      setDebateMode: (mode) =>
        set((state) => ({
          debateWorkspace: { ...state.debateWorkspace, mode }
        })),
      
      setPreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs }
        })),
      
      resetLayout: () => set(defaultState)
    }),
    {
      name: 'maatfeed-desktop-layout',
      partialize: (state) => ({
        layout: state.layout,
        leftSidebarCollapsed: state.leftSidebarCollapsed,
        rightPanelExpanded: state.rightPanelExpanded,
        preferences: state.preferences
      })
    }
  )
);
