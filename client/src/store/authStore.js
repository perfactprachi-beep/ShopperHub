import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,

      login: (user, accessToken) => set({ user, accessToken }),
      logout: () => set({ user: null, accessToken: null }),
      setToken: (accessToken) => set({ accessToken }),
    }),
    {
      name: 'auth',
      partialize: (s) => ({ user: s.user }),
    }
  )
);
