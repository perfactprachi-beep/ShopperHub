import { create } from 'zustand';

export const useWishlistStore = create((set, get) => ({
  productIds: [],

  has: (productId) => get().productIds.includes(Number(productId)),

  toggle: (productId) => {
    const id = Number(productId);
    set((s) => ({
      productIds: s.productIds.includes(id)
        ? s.productIds.filter((x) => x !== id)
        : [...s.productIds, id],
    }));
  },

  setAll: (ids) => set({ productIds: ids.map(Number) }),

  clear: () => set({ productIds: [] }),
}));
