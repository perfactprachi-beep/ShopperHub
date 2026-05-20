import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore.js';
import { useWishlistStore } from '../../store/wishlistStore.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToastStore } from '../../store/toastStore.js';
import { updateCartItem, removeCartItem } from '../../api/cartApi.js';
import { toggleWishlist } from '../../api/wishlistApi.js';
import { formatPrice } from '../../utils/formatPrice.js';
import { DEFAULT_PRODUCT_IMAGE } from '../../utils/getProductPlaceholder.js';

function IconX({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
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

export default function CartDrawer({ isOpen, onClose }) {
  const { items, removeItem, updateQty, itemCount, subtotal } = useCartStore();
  const { toggle: toggleWishlistStore, has: inWishlist } = useWishlistStore();
  const { isLoggedIn, isAdmin } = useAuth();
  const { addToast } = useToastStore();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

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
    if (!isLoggedIn) {
      addToast('Please login to save items to wishlist', 'info');
      return;
    }
    try {
      await toggleWishlist(item.productId);
      toggleWishlistStore(item.productId);
      await handleRemove(item);
      addToast('Moved to wishlist', 'success');
    } catch {
      addToast('Something went wrong', 'error');
    }
  };

  const count = itemCount();
  const total = subtotal();
  const FREE_SHIPPING = 999;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[var(--color-surface)] z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-heading)' }}>
            My Cart {count > 0 && <span className="text-[var(--color-muted)] font-normal text-sm">({count} {count === 1 ? 'item' : 'items'})</span>}
          </h2>
          <button onClick={onClose} className="text-[var(--color-muted)] hover:text-[var(--color-text)] p-1" aria-label="Close cart">
            <IconX />
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="text-6xl">🛒</div>
            <p className="text-[var(--color-muted)]">Your cart is empty</p>
            <Link
              to="/"
              onClick={onClose}
              className="px-6 py-2 bg-[var(--color-primary)] text-white text-sm rounded-[var(--radius-sm)] hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3 pb-4 border-b border-[var(--color-border)] last:border-b-0">
                  {/* Image */}
                  <div className="w-20 h-24 bg-gray-100 rounded-[var(--radius-sm)] overflow-hidden shrink-0">
                    <img
                      src={item.image || DEFAULT_PRODUCT_IMAGE}
                      alt={item.title}
                      onError={e => { if (e.currentTarget.src !== DEFAULT_PRODUCT_IMAGE) e.currentTarget.src = DEFAULT_PRODUCT_IMAGE; }}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-[var(--color-muted)] truncate">{item.brand}</p>
                        <p className="text-sm font-medium text-[var(--color-text)] line-clamp-2 leading-snug">{item.title}</p>
                        {(item.size || item.color) && (
                          <p className="text-xs text-[var(--color-muted)] mt-0.5">
                            {item.size && `Size: ${item.size}`}{item.size && item.color && ' | '}{item.color && `Color: ${item.color}`}
                          </p>
                        )}
                      </div>
                      {/* Move to wishlist — hidden for admin */}
                      {!isAdmin && (
                        <button
                          onClick={() => handleMoveToWishlist(item)}
                          className={`shrink-0 p-1 transition-colors ${inWishlist(item.productId) ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)] hover:text-[var(--color-primary)]'}`}
                          title="Move to wishlist"
                        >
                          <IconHeart size={15} filled={inWishlist(item.productId)} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-semibold text-[var(--color-text)]">{formatPrice(item.price)}</span>

                      <div className="flex items-center gap-2">
                        {/* Qty controls */}
                        <div className="flex items-center border border-[var(--color-border)] rounded-[var(--radius-sm)]">
                          <button
                            onClick={() => handleQty(item, -1)}
                            className="w-7 h-7 flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] text-base"
                          >
                            −
                          </button>
                          <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleQty(item, +1)}
                            className="w-7 h-7 flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] text-base"
                          >
                            +
                          </button>
                        </div>
                        {/* Remove */}
                        <button
                          onClick={() => handleRemove(item)}
                          className="p-1 text-[var(--color-muted)] hover:text-[var(--color-error)] transition-colors"
                          aria-label="Remove"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-[var(--color-border)] px-5 py-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-muted)]">Subtotal</span>
                <span className="font-semibold text-[var(--color-text)]">{formatPrice(total)}</span>
              </div>
              {total >= FREE_SHIPPING ? (
                <p className="text-xs text-[var(--color-success)]">✓ You qualify for FREE shipping!</p>
              ) : (
                <p className="text-xs text-[var(--color-muted)]">
                  Add {formatPrice(FREE_SHIPPING - total)} more for free shipping
                </p>
              )}
              <Link
                to="/cart"
                onClick={onClose}
                className="block w-full text-center py-3 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-[var(--radius-sm)] hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                Proceed to Checkout →
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
