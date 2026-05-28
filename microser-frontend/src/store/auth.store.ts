import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../constants/api';
import { SessionUser } from '../types/domain';

type AuthState = {
  session: SessionUser | null;
  setSession: (session: SessionUser) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      logout: () => set({ session: null }),
    }),
    { name: STORAGE_KEYS.session },
  ),
);
