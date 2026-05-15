import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice.js';
import { calcFinalPrice } from '../../utils/calcDiscount.js';

export default function ProductCard({ product }) {
  const { title, slug, base_price, discount_pct, brand_name, image_url, stock } = product;
  const finalPrice = calcFinalPrice(base_price, discount_pct);
  const hasDiscount = discount_pct > 0;

  return (
    <Link to={`/product/${slug}`} className="group block bg-[var(--color-surface)] rounded-[var(--radius-md)] overflow-hidden shadow-[var(--shadow-card)] hover:shadow-md transition-shadow">
      <div className="relative overflow-hidden bg-gray-50 h-64">
        {image_url ? (
          <img
            src={image_url}
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
