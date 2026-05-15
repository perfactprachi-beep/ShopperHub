import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlistStore } from '../store/wishlistStore.js';
import { useCartStore } from '../store/cartStore.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToastStore } from '../store/toastStore.js';
import { fetchWishlist, removeFromWishlist } from '../api/wishlistApi.js';
import { formatPrice } from '../utils/formatPrice.js';
import { calcFinalPrice } from '../utils/calcDiscount.js';
import { Skeleton } from '../components/ui/Skeleton.jsx';

function IconTrash({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  );
}

function WishlistCard({ product, onRemove, onMoveToCart }) {
  const finalPrice = calcFinalPrice(product.base_price, product.discount_pct);
  const hasDiscount = product.discount_pct > 0;

  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-md)] shadow-[var(--shadow-card)] overflow-hidden group">
      <Link to={`/product/${product.slug}`} className="block relative overflow-hidden h-56 bg-gray-50">
        {product.image_url ? (
          <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)] text-sm">No image</div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-[var(--color-error)] text-white text-xs font-semibold px-2 py-0.5 rounded-[var(--radius-sm)]">
            {product.discount_pct}% OFF
          </span>
        )}
      </Link>

      <div className="p-3">
        <p className="text-xs text-[var(--color-muted)] mb-0.5">{product.brand_name}</p>
        <p className="text-sm font-medium text-[var(--color-text)] line-clamp-2 leading-snug">{product.title}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-sm font-semibold">{formatPrice(finalPrice)}</span>
          {hasDiscount && <span className="text-xs text-[var(--color-muted)] line-through">{formatPrice(product.base_price)}</span>}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onMoveToCart(product)}
            className="flex-1 py-2 text-xs font-semibold bg-[var(--color-primary)] text-white rounded-[var(--radius-sm)] hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Move to Cart
          </button>
          <button
            onClick={() => onRemove(product.id)}
            className="p-2 text-[var(--color-muted)] hover:text-[var(--color-error)] border border-[var(--color-border)] rounded-[var(--radius-sm)] transition-colors"
            aria-label="Remove"
          >
            <IconTrash />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toggle: toggleWishlistStore } = useWishlistStore();
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      toggleWishlistStore(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      addToast('Removed from wishlist', 'info');
    } catch {
      addToast('Something went wrong', 'error');
    }
  };

  const handleMoveToCart = (product) => {
    // Navigate to product page to pick variant; for products, redirect to detail
    navigate(`/product/${product.slug}`);
    addToast('Select a size/variant to add to cart', 'info');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
          My Wishlist {!loading && products.length > 0 && (
            <span className="text-[var(--color-muted)] font-normal text-lg">({products.length} {products.length === 1 ? 'item' : 'items'})</span>
          )}
        </h1>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[var(--color-surface)] rounded-[var(--radius-md)] overflow-hidden">
                <Skeleton className="h-56 w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-8 w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="text-6xl">♡</div>
            <h2 className="text-xl font-semibold text-[var(--color-text)]">Your wishlist is empty</h2>
            <p className="text-[var(--color-muted)] text-sm">Save items you love to buy them later.</p>
            <Link
              to="/"
              className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-[var(--radius-sm)] hover:bg-[var(--color-primary-dark)] transition-colors text-sm font-medium"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <WishlistCard
                key={product.id}
                product={product}
                onRemove={handleRemove}
                onMoveToCart={handleMoveToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
