import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice.js';
import { calcFinalPrice } from '../../utils/calcDiscount.js';
import { useWishlistStore } from '../../store/wishlistStore.js';
import { useAuth } from '../../hooks/useAuth.js';
import { assetUrl } from '../../utils/assetUrl.js';
import { useToastStore } from '../../store/toastStore.js';
import { toggleWishlist } from '../../api/wishlistApi.js';

function IconHeart({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function ProductCard({ product }) {
  const { title, slug, base_price, discount_pct, brand_name, image_url, stock, id } = product;
  const finalPrice = calcFinalPrice(base_price, discount_pct);
  const hasDiscount = discount_pct > 0;

  const { isLoggedIn } = useAuth();
  const { addToast } = useToastStore();
  const { has, toggle } = useWishlistStore();
  const navigate = useNavigate();

  const wished = has(id);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      addToast('Please login to save items', 'info');
      navigate('/login');
      return;
    }

    toggle(id);
    try {
      await toggleWishlist(id);
      addToast(wished ? 'Removed from wishlist' : 'Added to wishlist', 'success');
    } catch {
      toggle(id); // revert on error
      addToast('Something went wrong', 'error');
    }
  };

  return (
    <Link to={`/product/${slug}`} className="group block bg-[var(--color-surface)] rounded-[var(--radius-md)] overflow-hidden shadow-[var(--shadow-card)] hover:shadow-md transition-shadow">
      <div className="relative overflow-hidden bg-gray-50 h-64">
        {image_url ? (
          <img
            src={assetUrl(image_url)}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)] text-sm">No image</div>
        )}

        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-[var(--color-error)] text-white text-xs font-semibold px-2 py-0.5 rounded-[var(--radius-sm)]">
            {discount_pct}% OFF
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm ${wished ? 'bg-[var(--color-primary)] text-white' : 'bg-white/80 text-[var(--color-muted)] hover:text-[var(--color-primary)]'}`}
        >
          <IconHeart filled={wished} />
        </button>

        {stock === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-sm font-medium text-[var(--color-muted)]">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-xs text-[var(--color-muted)] mb-0.5">{brand_name}</p>
        <p className="text-sm font-medium text-[var(--color-text)] line-clamp-2 leading-snug">{title}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--color-text)]">{formatPrice(finalPrice)}</span>
          {hasDiscount && (
            <span className="text-xs text-[var(--color-muted)] line-through">{formatPrice(base_price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
