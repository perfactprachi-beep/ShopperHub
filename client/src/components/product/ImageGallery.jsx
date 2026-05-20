import { useState } from 'react';
import { assetUrl } from '../../utils/assetUrl.js';
import { DEFAULT_PRODUCT_IMAGE } from '../../utils/getProductPlaceholder.js';

export default function ImageGallery({ images = [], fallbackUrl = '' }) {
  const fallback = fallbackUrl || DEFAULT_PRODUCT_IMAGE;
  const [active, setActive] = useState(0);

  if (!images.length) {
    return (
      <div className="w-full aspect-[3/4] bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
        No images
      </div>
    );
  }

  const prev = () => setActive((a) => Math.max(0, a - 1));
  const next = () => setActive((a) => Math.min(images.length - 1, a + 1));

  return (
    <div className="flex gap-3 lg:sticky lg:top-4">
      {/* Thumbnail strip */}
      <div className="hidden sm:flex flex-col gap-2 shrink-0">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setActive(i)}
            className={`w-[72px] h-[88px] border-2 overflow-hidden transition-colors shrink-0 ${
              active === i ? 'border-[#8B1A2F]' : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            <img src={assetUrl(img.url)} alt="" className="w-full h-full object-cover" onError={(e) => { if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback; }} />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="flex-1 relative overflow-hidden bg-gray-50 group">
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={assetUrl(images[active].url)}
            alt=""
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-zoom-in"
            onError={(e) => { if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback; }}
          />
        </div>

        {/* Prev / Next arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              disabled={active === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full shadow flex items-center justify-center text-xl text-gray-600 hover:bg-white disabled:opacity-30 transition-colors"
            >
              ‹
            </button>
            <button
              onClick={next}
              disabled={active === images.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full shadow flex items-center justify-center text-xl text-gray-600 hover:bg-white disabled:opacity-30 transition-colors"
            >
              ›
            </button>
          </>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  active === i ? 'bg-[#8B1A2F] w-3' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
