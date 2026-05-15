import ProductCard from './ProductCard.jsx';
import { ProductCardSkeleton } from '../ui/Skeleton.jsx';

export default function ProductGrid({ products, loading, cols = 4 }) {
  const colClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }[cols] || 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';

  if (loading) {
    return (
      <div className={`grid ${colClass} gap-4`}>
        {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="py-16 text-center text-[var(--color-muted)]">
        No products found.
      </div>
    );
  }

  return (
    <div className={`grid ${colClass} gap-4`}>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
