import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore.js';
import { useWishlistStore } from '../store/wishlistStore.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToastStore } from '../store/toastStore.js';
import { updateCartItem, removeCartItem } from '../api/cartApi.js';
import { toggleWishlist } from '../api/wishlistApi.js';
import { fetchCart } from '../api/cartApi.js';
import { formatPrice } from '../utils/formatPrice.js';
import ProductGrid from '../components/product/ProductGrid.jsx';
import api from '../api/axios.js';

function IconTrash({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  );
}
function IconHeart({ size = 16, filled }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

const FREE_SHIPPING = 999;

export default function CartPage() {
  const { items, removeItem, updateQty, setItems, subtotal, itemCount } = useCartStore();
  const { toggle: toggleWishlistStore, has: inWishlist } = useWishlistStore();
  const { isLoggedIn } = useAuth();
  const { addToast } = useToastStore();
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(true);

  // Sync from server when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchCart()
        .then((data) => setItems(data.items))
        .catch(console.error);
    }
  }, [isLoggedIn]);

  // Fetch recommendations
  useEffect(() => {
    api.get('/products', { params: { sort: 'newest', limit: 4 } })
      .then(({ data }) => { if (data.success) setRecommendations(data.data); })
      .catch(console.error)
      .finally(() => setRecLoading(false));
  }, []);

  const handleQty = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      if (!window.confirm('Remove this item from cart?')) return;
      if (isLoggedIn && item.itemId) {
        try { await removeCartItem(item.itemId); } catch { /* ignore */ }
      }
      removeItem(item.variantId);
      return;
    }
    if (isLoggedIn && item.itemId) {
      try { await updateCartItem(item.itemId, { quantity: newQty }); } catch { /* ignore */ }
    }
    updateQty(item.variantId, newQty);
  };

  const handleRemove = async (item) => {
    if (isLoggedIn && item.itemId) {
      try { await removeCartItem(item.itemId); } catch { /* ignore */ }
    }
    removeItem(item.variantId);
  };

  const handleMoveToWishlist = async (item) => {
    try {
      await toggleWishlist(item.productId);
      toggleWishlistStore(item.productId);
      await handleRemove(item);
      addToast('Moved to wishlist', 'success');
    } catch {
      addToast('Something went wrong', 'error');
    }
  };

  const total = subtotal();
  const count = itemCount();
  const shipping = total >= FREE_SHIPPING ? 0 : 99;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center gap-5 px-4">
        <div className="text-7xl">🛒</div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-heading)' }}>
          Your cart is empty
        </h1>
        <p className="text-[var(--color-muted)] text-sm">Looks like you haven't added anything yet.</p>
        <Link to="/" className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-[var(--radius-sm)] hover:bg-[var(--color-primary-dark)] transition-colors text-sm font-medium">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
          My Cart <span className="text-[var(--color-muted)] font-normal text-lg">({count} {count === 1 ? 'item' : 'items'})</span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart items */}
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div key={item.variantId} className="bg-[var(--color-surface)] rounded-[var(--radius-md)] shadow-[var(--shadow-card)] p-4 flex gap-4">
                {/* Image */}
                <div className="w-24 h-28 bg-gray-100 rounded-[var(--radius-sm)] overflow-hidden shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)] text-xs">No img</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-[var(--color-muted)]">{item.brand}</p>
                      <p className="text-sm font-medium text-[var(--color-text)] line-clamp-2">{item.title}</p>
                      {(item.size || item.color) && (
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">
                          {item.size && `Size: ${item.size}`}{item.size && item.color && ' | '}{item.color && `Color: ${item.color}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleMoveToWishlist(item)}
                        title="Move to wishlist"
                        className={`p-1.5 transition-colors ${inWishlist(item.productId) ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)] hover:text-[var(--color-primary)]'}`}
                      >
                        <IconHeart size={16} filled={inWishlist(item.productId)} />
                      </button>
                      <button
                        onClick={() => handleRemove(item)}
                        title="Remove"
                        className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-error)] transition-colors"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="font-semibold text-[var(--color-text)]">{formatPrice(item.price * item.quantity)}</span>
                    <div className="flex items-center border border-[var(--color-border)] rounded-[var(--radius-sm)]">
                      <button onClick={() => handleQty(item, -1)} className="w-8 h-8 flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)]">−</button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => handleQty(item, +1)} className="w-8 h-8 flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)]">+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-md)] shadow-[var(--shadow-card)] p-5 sticky top-24">
              <h2 className="text-base font-semibold text-[var(--color-text)] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                Price Details
              </h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-[var(--color-muted)]">
                  <span>Price ({count} {count === 1 ? 'item' : 'items'})</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-[var(--color-muted)]">
                  <span>Discount</span>
                  <span className="text-[var(--color-success)]">− ₹0</span>
                </div>
                <div className="flex justify-between text-[var(--color-muted)]">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-[var(--color-success)]' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                <div className="border-t border-[var(--color-border)] pt-2.5 flex justify-between font-semibold text-[var(--color-text)] text-base">
                  <span>Total</span>
                  <span>{formatPrice(total + shipping)}</span>
                </div>
              </div>
              {total < FREE_SHIPPING && (
                <p className="text-xs text-[var(--color-muted)] mt-3">
                  Add {formatPrice(FREE_SHIPPING - total)} more for free shipping
                </p>
              )}
              <Link
                to="/checkout"
                className="mt-4 block w-full text-center py-3 bg-[var(--color-primary)] text-white font-semibold text-sm rounded-[var(--radius-sm)] hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <section className="mt-14">
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
            You Might Also Like
          </h2>
          <ProductGrid products={recommendations} loading={recLoading} cols={4} />
        </section>
      </div>
    </div>
  );
}
