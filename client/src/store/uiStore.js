import { create } from 'zustand';

export const useUiStore = create((set) => ({
  cartOpen: false,
  openCart:  () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
}));
