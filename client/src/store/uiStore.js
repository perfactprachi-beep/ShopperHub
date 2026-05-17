import { create } from 'zustand';

export const useUiStore = create((set) => ({
  cartOpen:       false,
  openCart:       () => set({ cartOpen: true }),
  closeCart:      () => set({ cartOpen: false }),

  loginModalOpen:      false,
  loginModalOnSuccess: null,
  openLoginModal:      (onSuccess) => set({ loginModalOpen: true, loginModalOnSuccess: onSuccess ?? null }),
  closeLoginModal:     () => set({ loginModalOpen: false, loginModalOnSuccess: null }),
}));
