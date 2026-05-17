import { useRef } from 'react';
import ProductCard from '../product/ProductCard.jsx';
import { Skeleton } from '../ui/Skeleton.jsx';

function ChevronBtn({ dir, onClick, dark }) {
  return (
    <button
      onClick={onClick}
      aria-label={dir === 'prev' ? 'Scroll left' : 'Scroll right'}
      className={`absolute ${dir === 'prev' ? '-left-4' : '-right-4'} top-1/3 -translate-y-1/2 z-10
        w-9 h-9 rounded-full shadow-md flex items-center justify-center text-xl leading-none
        opacity-0 group-hover:opacity-100 transition-all
        ${dark
          ? 'bg-[#2A2A2A] border border-[#C9A84C]/50 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black'
          : 'bg-white border border-gray-200 text-gray-600 hover:text-[#8B1A2F] hover:border-[#8B1A2F]'
        }`}
    >
      {dir === 'prev' ? '‹' : '›'}
    </button>
  );
}

export default function ProductCarousel({ products, loading, dark = false, showNew = false, onAddToBag, openInNewTab = false, withDrawer = false }) {
  const ref = useRef(null);

  const scroll = (dir) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir * 240, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="shrink-0 w-52">
            <Skeleton className={`w-full rounded-none ${dark ? 'bg-[#2A2A2A]' : ''}`} style={{ aspectRatio: '3/4' }} />
            <Skeleton className={`h-3 w-2/3 mt-3 ${dark ? 'bg-[#2A2A2A]' : ''}`} />
            <Skeleton className={`h-3 w-1/2 mt-1.5 ${dark ? 'bg-[#2A2A2A]' : ''}`} />
          </div>
        ))}
      </div>
    );
  }

  if (!products?.length) return null;

  return (
    <div className="relative group">
      <ChevronBtn dir="prev" onClick={() => scroll(-1)} dark={dark} />
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((p) => (
          <div key={p.id} className="shrink-0 w-52 flex flex-col">
            <ProductCard product={p} dark={dark} showNew={showNew} onAddToBag={onAddToBag} openInNewTab={openInNewTab} withDrawer={withDrawer} />
          </div>
        ))}
      </div>
      <ChevronBtn dir="next" onClick={() => scroll(1)} dark={dark} />
    </div>
  );
}
