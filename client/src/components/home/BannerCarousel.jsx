import { useState, useEffect, useRef, useCallback } from 'react';
import { Skeleton } from '../ui/Skeleton.jsx';
import { assetUrl } from '../../utils/assetUrl.js';

const BANNER_FALLBACK = 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&w=1200&q=80';

function ArrowBtn({ onClick, dir, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`absolute ${dir === 'prev' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 hover:bg-black/55 text-white flex items-center justify-center text-xl leading-none transition-colors`}
    >
      {dir === 'prev' ? '‹' : '›'}
    </button>
  );
}

export default function BannerCarousel({ banners = [] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % banners.length),
    [banners.length]
  );
  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);

  useEffect(() => {
    if (paused || banners.length <= 1) return;
    timer.current = setInterval(next, 4000);
    return () => clearInterval(timer.current);
  }, [paused, banners.length, next]);

  if (!banners.length) {
    return <Skeleton className="w-full aspect-[4/3] lg:aspect-[16/5]" />;
  }

  return (
    <div
      className="relative w-full overflow-hidden aspect-[4/3] lg:aspect-[16/5] bg-gray-100"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          aria-hidden={i !== current}
        >
          {b.link ? (
            <a href={b.link} className="block w-full h-full">
              <img src={assetUrl(b.image_url)} alt={b.title ?? ''} className="w-full h-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} onError={e => { e.currentTarget.src = BANNER_FALLBACK; }} />
            </a>
          ) : (
            <img src={assetUrl(b.image_url)} alt={b.title ?? ''} className="w-full h-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} onError={e => { e.currentTarget.src = BANNER_FALLBACK; }} />
          )}
        </div>
      ))}

      {/* Arrows */}
      {banners.length > 1 && (
        <>
          <ArrowBtn onClick={prev} dir="prev" label="Previous slide" />
          <ArrowBtn onClick={next} dir="next" label="Next slide" />
        </>
      )}

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-5 bg-white' : 'w-2 bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
