import { create } from 'zustand';
import { Notification } from '../types/domain';

type Theme = 'light' | 'dark';

type UiState = {
  theme: Theme;
  cartOpen: boolean;
  sidebarOpen: boolean;
  notifications: Notification[];
  toggleTheme: () => void;
  toggleCart: () => void;
  setSidebarOpen: (open: boolean) => void;
  notify: (notification: Omit<Notification, 'id'>) => void;
  dismiss: (id: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  theme: 'light',
  cartOpen: false,
  sidebarOpen: false,
  notifications: [],
  toggleTheme: () =>
    set((state) => {
      const theme = state.theme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', theme === 'dark');
      return { theme };
    }),
  toggleCart: () => set((state) => ({ cartOpen: !state.cartOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  notify: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: `${Date.now()}-${Math.random()}` },
      ].slice(-4),
    })),
  dismiss: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    })),
}));
