import { create } from 'zustand';

export const useUiStore = create((set) => ({
  cartOpen:       false,
  openCart:       () => set({ cartOpen: true }),
  closeCart:      () => set({ cartOpen: false }),

  loginModalOpen:  false,
  openLoginModal:  () => set({ loginModalOpen: true }),
  closeLoginModal: () => set({ loginModalOpen: false }),
}));
