import { create } from 'zustand';

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  notificationsOpen: boolean;
  currentModal: string | null;
  loading: {
    global: boolean;
    feed: boolean;
    audio: boolean;
    auth: boolean;
  };
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleNotifications: () => void;
  setNotificationsOpen: (open: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  setLoading: (key: keyof UIState['loading'], loading: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'dark',
  sidebarOpen: false,
  mobileMenuOpen: false,
  notificationsOpen: false,
  currentModal: null,
  loading: {
    global: false,
    feed: false,
    audio: false,
    auth: false,
  },

  setTheme: (theme: 'light' | 'dark') => {
    set({ theme });
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open });
  },

  toggleMobileMenu: () => {
    set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen }));
  },

  setMobileMenuOpen: (open: boolean) => {
    set({ mobileMenuOpen: open });
  },

  toggleNotifications: () => {
    set((state) => ({ notificationsOpen: !state.notificationsOpen }));
  },

  setNotificationsOpen: (open: boolean) => {
    set({ notificationsOpen: open });
  },

  openModal: (modalId: string) => {
    set({ currentModal: modalId });
  },

  closeModal: () => {
    set({ currentModal: null });
  },

  setLoading: (key: keyof UIState['loading'], loading: boolean) => {
    set((state) => ({
      loading: {
        ...state.loading,
        [key]: loading,
      },
    }));
  },

  setGlobalLoading: (loading: boolean) => {
    set((state) => ({
      loading: {
        ...state.loading,
        global: loading,
      },
    }));
  },
}));
