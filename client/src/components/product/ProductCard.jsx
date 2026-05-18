import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice.js';
import { calcFinalPrice } from '../../utils/calcDiscount.js';
import { useWishlistStore } from '../../store/wishlistStore.js';
import { useAuth } from '../../hooks/useAuth.js';
import { assetUrl } from '../../utils/assetUrl.js';
import { useToastStore } from '../../store/toastStore.js';
import { useUiStore } from '../../store/uiStore.js';
import { toggleWishlist } from '../../api/wishlistApi.js';

function IconHeart({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#8B1A2F' : 'none'} stroke={filled ? '#8B1A2F' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function ProductCard({ product, dark = false, showNew = false, onAddToBag, openInNewTab = false, withDrawer = false }) {
  const { title, slug, base_price, discount_pct, brand_name, image_url, stock, id } = product;
  const [imgErr, setImgErr] = useState(false);

  const imageAvailable = !!image_url && !imgErr;
  const finalPrice     = imageAvailable ? calcFinalPrice(base_price, discount_pct) : base_price;
  const hasDiscount    = discount_pct > 0 && imageAvailable;

  const { isLoggedIn, isAdmin } = useAuth();
  const { addToast }   = useToastStore();
  const { has, toggle } = useWishlistStore();
  const { openLoginModal } = useUiStore();
  const navigate       = useNavigate();
  const wished         = has(id);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    toggle(id);
    try {
      await toggleWishlist(id);
      addToast(wished ? 'Removed from wishlist' : 'Added to wishlist', 'success');
    } catch {
      toggle(id);
      addToast('Something went wrong', 'error');
    }
  };

  const handleAddToBag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (withDrawer) {
      // Has variants — open the size selection drawer
      if (onAddToBag) onAddToBag(product);
    } else {
      // Navigate to product detail so the customer can pick size/variant and add from there
      navigate(`/product/${slug}`);
    }
  };

  return (
    <div className={`group flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow duration-200 ${dark ? 'bg-[#2A2A2A]' : 'bg-white'}`}>
      <Link to={`/product/${slug}`} className="block flex-1" target={openInNewTab ? '_blank' : undefined} rel={openInNewTab ? 'noopener noreferrer' : undefined}>
        {/* Image */}
        <div className={`relative overflow-hidden ${dark ? 'bg-[#222]' : 'bg-gray-50'}`} style={{ aspectRatio: '3/4' }}>
          {image_url && !imgErr ? (
            <img
              src={assetUrl(image_url)}
              alt={title}
              onError={() => setImgErr(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-sm ${dark ? 'text-gray-600' : 'text-gray-300'}`}>No image</div>
          )}

          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {showNew && (
              <span className="text-white text-[10px] font-bold px-2 py-0.5 bg-emerald-500 tracking-wide">NEW</span>
            )}
            {hasDiscount && (
              <span className={`text-[11px] font-bold px-2 py-0.5 ${dark ? 'bg-[#C9A84C] text-black' : 'bg-[#8B1A2F] text-white'}`}>
                {discount_pct}% OFF
              </span>
            )}
          </div>

          {/* Wishlist — hidden for admin */}
          {!isAdmin && (
            <button
              onClick={handleWishlist}
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              className={`absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full shadow-sm opacity-0 group-hover:opacity-100 hover:scale-110 transition-all ${dark ? 'bg-[#2A2A2A]' : 'bg-white'}`}
            >
              <IconHeart filled={wished} />
            </button>
          )}

          {stock === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider border border-gray-400 px-3 py-1">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pt-3 pb-3 px-0.5">
          {brand_name && (
            <p className={`text-[11px] font-bold uppercase tracking-wider mb-0.5 ${dark ? 'text-[#C9A84C]' : 'text-gray-900'}`}>{brand_name}</p>
          )}
          <p className={`text-[13px] line-clamp-2 leading-snug mb-2 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
          <div className="flex items-center gap-2">
            <span className={`text-[14px] font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{formatPrice(finalPrice)}</span>
            {hasDiscount && (
              <span className="text-[12px] text-gray-500 line-through">{formatPrice(base_price)}</span>
            )}
          </div>
        </div>
      </Link>

      {/* CTA area */}
      {onAddToBag && !isAdmin && (
        <button
          onClick={handleAddToBag}
          disabled={stock === 0}
          className={`w-full py-2 text-[11px] font-bold uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            dark
              ? 'bg-[#C9A84C] text-black hover:bg-[#b8943e]'
              : 'bg-[#8B1A2F] text-white hover:bg-[#6d1424]'
          }`}
        >
          {stock === 0 ? 'Out of Stock' : 'Add To Bag'}
        </button>
      )}
    </div>
  );
}
