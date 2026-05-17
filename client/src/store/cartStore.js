import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      synced: false,

      addItem: (item) => {
        const exists = get().items.find((i) => i.variantId === item.variantId);
        if (exists) {
          set((s) => ({
            items: s.items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
                : i
            ),
          }));
        } else {
          set((s) => ({ items: [...s.items, { ...item, quantity: item.quantity ?? 1 }] }));
        }
      },

      removeItem: (variantId) =>
        set((s) => ({ items: s.items.filter((i) => i.variantId !== variantId) })),

      updateQty: (variantId, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => i.variantId !== variantId)
              : s.items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
        })),

      clearCart: () => set({ items: [], synced: false }),

      setItems: (serverItems) =>
        set({
          synced: true,
          items: serverItems.map((i) => ({
            itemId:              i.itemId,
            variantId:           i.variantId,
            productId:           i.productId,
            title:               i.productTitle,
            brand:               i.brand,
            image:               i.image,
            size:                i.size,
            color:               i.color,
            price:               Number(i.unitPrice),
            quantity:            i.quantity,
            expressEligible:     i.expressEligible     ?? false,
            storePickupEligible: i.storePickupEligible ?? false,
          })),
        }),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'ss_cart' }
  )
);
