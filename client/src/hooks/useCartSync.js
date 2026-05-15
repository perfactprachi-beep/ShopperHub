import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth.js';
import { useCartStore } from '../store/cartStore.js';
import { useWishlistStore } from '../store/wishlistStore.js';
import { fetchCart, mergeCart } from '../api/cartApi.js';
import { fetchWishlist } from '../api/wishlistApi.js';

export function useCartSync() {
  const { isLoggedIn } = useAuth();
  const { items, setItems, clearCart, synced } = useCartStore();
  const { setAll, clear: clearWishlist } = useWishlistStore();
  const prevLoggedIn = useRef(false);

  useEffect(() => {
    const justLoggedIn  = isLoggedIn && !prevLoggedIn.current;
    const justLoggedOut = !isLoggedIn && prevLoggedIn.current;

    if (justLoggedIn) {
      const guestItems = items.map((i) => ({ variantId: i.variantId, quantity: i.quantity }));

      const syncCart = guestItems.length > 0
        ? mergeCart(guestItems).then(() => fetchCart())
        : fetchCart();

      syncCart
        .then((serverCart) => setItems(serverCart.items))
        .catch(console.error);

      fetchWishlist()
        .then((wl) => setAll(wl.map((p) => p.id)))
        .catch(console.error);
    }

    if (justLoggedOut) {
      clearCart();
      clearWishlist();
    }

    prevLoggedIn.current = isLoggedIn;
  }, [isLoggedIn]);
}
