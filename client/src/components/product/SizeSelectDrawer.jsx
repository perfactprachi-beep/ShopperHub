import { useState, useEffect } from 'react';
import { productsApi } from '../../api/productsApi.js';
import { formatPrice } from '../../utils/formatPrice.js';
import { calcFinalPrice } from '../../utils/calcDiscount.js';
import { assetUrl } from '../../utils/assetUrl.js';
import { getProductPlaceholder } from '../../utils/getProductPlaceholder.js';

const NO_SIZE_KEYWORDS = [
  'beauty','skincare','haircare','hair care','makeup','nail','fragrance',
  'perfume','deodorant','lipstick','foundation','serum','lotion','moisturizer',
  'sunscreen','toner','concealer','blush','eyeshadow','mascara','eyeliner',
  'grooming','cologne','shampoo','conditioner','body wash','face wash',
];

function isSizeRelevant(product) {
  const t = [product?.category_name, product?.category_slug, product?.title]
    .filter(Boolean).join(' ').toLowerCase();
  return !NO_SIZE_KEYWORDS.some(k => t.includes(k));
}

export default function SizeSelectDrawer({ product, onClose, onAddToBag }) {
  const [fullProduct, setFullProduct]       = useState(null);
  const [loadingVariants, setLoadingVariants] = useState(true);
  const [selectedSize, setSelectedSize]     = useState(null);

  useEffect(() => {
    if (!product?.slug) return;
    setLoadingVariants(true);
    setSelectedSize(null);
    productsApi.detail(product.slug)
      .then(({ data }) => setFullProduct(data.data))
      .catch(() => {})
      .finally(() => setLoadingVariants(false));
  }, [product?.slug]);

  if (!product) return null;

  const finalPrice    = calcFinalPrice(product.base_price, product.discount_pct);
  const sizeRelevant  = isSizeRelevant(product);
  const sizes         = sizeRelevant
    ? [...new Set((fullProduct?.variants || []).map(v => v.size).filter(Boolean))]
    : [];
  const hasSizes   = sizes.length > 0;
  const canAdd     = !loadingVariants && (!hasSizes || !!selectedSize);

  const handleAdd = () => {
    if (!canAdd) return;
    const variant = hasSizes
      ? fullProduct?.variants?.find(v => v.size === selectedSize)
      : fullProduct?.variants?.[0] ?? null;
    onAddToBag(product, variant);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {hasSizes ? 'Select Size' : 'Add To Bag'}
            </h2>
            {hasSizes && !loadingVariants && sizeRelevant && (
              <p className="text-xs text-gray-400 mt-0.5">{sizes.length} Size{sizes.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Product mini-card */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
          <img
            src={product.image_url ? assetUrl(product.image_url) : getProductPlaceholder(product)}
            alt={product.title}
            onError={e => { const p = getProductPlaceholder(product); if (e.currentTarget.src !== p) e.currentTarget.src = p; }}
            className="w-16 h-20 object-cover rounded shrink-0"
          />
          <div className="min-w-0">
            {product.brand_name && (
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider truncate">
                {product.brand_name}
              </p>
            )}
            <p className="text-[13px] font-medium text-gray-900 line-clamp-2 leading-snug mt-0.5">
              {product.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[14px] font-bold text-gray-900">{formatPrice(finalPrice)}</span>
              {product.discount_pct > 0 && (
                <>
                  <span className="text-[12px] text-gray-400 line-through">{formatPrice(product.base_price)}</span>
                  <span className="text-[12px] font-semibold text-[#2E7D32]">{product.discount_pct}% Off</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Size buttons */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loadingVariants ? (
            <div className="space-y-3">
              <div className="h-3 w-24 bg-gray-100 animate-pulse rounded" />
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-14 h-10 bg-gray-100 animate-pulse rounded" />
                ))}
              </div>
            </div>
          ) : hasSizes ? (
            <>
              <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-3">Select Size</p>
              <div className="flex gap-2 flex-wrap">
                {sizes.map(size => {
                  const variant    = fullProduct?.variants?.find(v => v.size === size);
                  const outOfStock = variant?.stock === 0;
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => !outOfStock && setSelectedSize(size)}
                      disabled={outOfStock}
                      className={`min-w-[56px] h-10 px-3 border text-[13px] font-semibold transition-colors
                        ${outOfStock
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed line-through'
                          : isSelected
                            ? 'border-[#8B1A2F] bg-[#8B1A2F] text-white'
                            : 'border-gray-300 text-gray-800 hover:border-[#8B1A2F] hover:text-[#8B1A2F]'
                        }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 shrink-0">
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className="w-full py-4 bg-[#8B1A2F] text-white font-bold text-[14px] tracking-wide hover:bg-[#6d1424] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add To Bag
          </button>
        </div>

      </div>
    </div>
  );
}
