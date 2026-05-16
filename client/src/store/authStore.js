import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      _hydrated: false,

      login: (user, accessToken) => set({ user, accessToken }),
      logout: () => set({ user: null, accessToken: null }),
      setToken: (accessToken) => set({ accessToken }),
      _setHydrated: () => set({ _hydrated: true }),
    }),
    {
      name: 'auth',
      // persist both user and accessToken so page-refresh doesn't lose the token
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken }),
      onRehydrateStorage: () => (state) => {
        state?._setHydrated();
      },
    }
  )
);
