import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { productsApi } from '../api/productsApi.js';
import { useFetch } from '../hooks/useFetch.js';
import ImageGallery from '../components/product/ImageGallery.jsx';
import VariantPicker from '../components/product/VariantPicker.jsx';
import { formatPrice } from '../utils/formatPrice.js';
import { calcFinalPrice } from '../utils/calcDiscount.js';
import { Skeleton } from '../components/ui/Skeleton.jsx';

export default function ProductDetail() {
  const { slug } = useParams();
  const [selected, setSelected] = useState({});
  const { data, loading } = useFetch(() => productsApi.detail(slug), [slug]);
  const product = data?.data;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
        <div className="flex-1"><Skeleton className="w-full h-[480px]" /></div>
        <div className="w-80 space-y-4">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="py-32 text-center text-[var(--color-muted)]">Product not found.</div>;
  }

  const finalPrice = calcFinalPrice(product.base_price, product.discount_pct);
  const hasDiscount = product.discount_pct > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Gallery */}
        <div className="flex-1">
          <ImageGallery images={product.images} />
        </div>

        {/* Info */}
        <div className="w-full lg:w-80 space-y-4">
          <p className="text-sm text-[var(--color-muted)]">{product.brand_name}</p>
          <h1 className="text-xl font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-heading)' }}>
            {product.title}
          </h1>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-[var(--color-text)]">{formatPrice(finalPrice)}</span>
            {hasDiscount && (
              <>
                <span className="text-sm text-[var(--color-muted)] line-through">{formatPrice(product.base_price)}</span>
                <span className="text-sm font-semibold text-[var(--color-error)]">{product.discount_pct}% OFF</span>
              </>
            )}
          </div>

          {product.variants?.length > 0 && (
            <VariantPicker variants={product.variants} selected={selected} onSelect={setSelected} />
          )}

          {product.description && (
            <p className="text-sm text-[var(--color-muted)] leading-relaxed border-t border-[var(--color-border)] pt-4">
              {product.description}
            </p>
          )}

          <button
            disabled={product.stock === 0}
            className="w-full py-3 bg-[var(--color-primary)] text-white font-medium rounded-[var(--radius-sm)] hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
          </button>
        </div>
      </div>
    </div>
  );
}
