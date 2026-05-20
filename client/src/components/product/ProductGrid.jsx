import ProductCard from './ProductCard.jsx';
import { ProductCardSkeleton } from '../ui/Skeleton.jsx';
import { useCartStore } from '../../store/cartStore.js';
import { useToastStore } from '../../store/toastStore.js';
import { calcFinalPrice } from '../../utils/calcDiscount.js';
import { assetUrl } from '../../utils/assetUrl.js';

export default function ProductGrid({ products, loading, cols = 4 }) {
  const addItem    = useCartStore((s) => s.addItem);
  const { addToast } = useToastStore();

  const handleAddToBag = (product) => {
    const finalPrice = calcFinalPrice(product.base_price, product.discount_pct);
    addItem({
      variantId: null,
      productId: product.id,
      title:     product.title,
      brand:     product.brand_name,
      image:     assetUrl(product.image_url || ''),
      size:      null,
      color:     null,
      price:     finalPrice,
      quantity:  1,
    });
    addToast(`${product.title} added to bag!`, 'success');
  };

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
      <div className="py-20 text-center">
        <svg className="mx-auto mb-4 text-gray-200" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <p className="text-sm text-gray-400 font-medium">No products found</p>
      </div>
    );
  }

  return (
    <div className={`grid ${colClass} gap-x-4 gap-y-8`}>
      {products.map(p => (
        <ProductCard key={p.id} product={p} onAddToBag={handleAddToBag} />
      ))}
    </div>
  );
}
