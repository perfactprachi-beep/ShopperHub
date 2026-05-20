import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ProductCarousel from '../components/home/ProductCarousel.jsx';

/* ── Static data ──────────────────────────────────────────────────────────── */

const WATCH_SECTIONS = [
  { id: 'analog-watches',      slug: 'analog-watches',      name: 'Analog Watches',      sub: 'Classic · Dress · Fashion' },
  { id: 'digital-watches',     slug: 'digital-watches',     name: 'Digital Watches',     sub: 'Sports · Casual · Outdoor' },
  { id: 'smart-watches',       slug: 'smart-watches-fitness-bands',       name: 'Smart Watches',       sub: 'Fitness · GPS · Health Trackers' },
  { id: 'chronograph-watches', slug: 'chronograph-watches', name: 'Chronograph',         sub: 'Multi-dial · Racing · Aviation' },
  { id: 'luxury-watches',      slug: 'luxe-watches',      name: 'Luxury Watches',      sub: 'Premium · Swiss · Limited Edition' },
  { id: 'sports-watches',      slug: 'digital-watches',      name: 'Sports Watches',      sub: 'Dive · Running · Adventure' },
  { id: 'womens-watches',      slug: 'womens-watches',      name: "Women's Watches",     sub: 'Elegant · Bangle · Rose Gold' },
  { id: 'couple-watches',      slug: 'womens-watches',      name: 'Couple Watches',      sub: 'Matching Sets · His & Hers' },
];

const WATCH_TYPE_TILES = [
  {
    label: 'Analog',
    slug: 'analog-watches',
    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&w=400&q=80',
    offer: 'UP TO 50% OFF',
    bg: '#F9F5F0',
  },
  {
    label: 'Digital',
    slug: 'digital-watches',
    img: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&w=400&q=80',
    offer: 'UP TO 40% OFF',
    bg: '#EFF6FF',
  },
  {
    label: 'Smart Watch',
    slug: 'smart-watches-fitness-bands',
    img: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&w=400&q=80',
    offer: 'UP TO 35% OFF',
    bg: '#F0FDF4',
  },
  {
    label: 'Chronograph',
    slug: 'chronograph-watches',
    img: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&w=400&q=80',
    offer: 'UP TO 45% OFF',
    bg: '#FFF7ED',
  },
  {
    label: 'Luxury',
    slug: 'luxe-watches',
    img: 'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?auto=format&w=400&q=80',
    offer: 'UP TO 30% OFF',
    bg: '#FFFBEB',
  },
  {
    label: 'Sports',
    slug: 'digital-watches',
    img: 'https://images.unsplash.com/photo-1553818628-a7112b762f8d?auto=format&w=400&q=80',
    offer: 'UP TO 60% OFF',
    bg: '#F0F9FF',
  },
  {
    label: "Women's",
    slug: 'womens-watches',
    img: 'https://images.unsplash.com/photo-1611242322873-ec50dc2f2327?auto=format&w=400&q=80',
    offer: 'UP TO 55% OFF',
    bg: '#FDF2F8',
  },
  {
    label: 'Couple',
    slug: 'womens-watches',
    img: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&w=400&q=80',
    offer: 'UP TO 40% OFF',
    bg: '#F5F3FF',
  },
];

const FEATURED_BRANDS = [
  {
    name: 'Titan',
    offer: 'UP TO 50% OFF',
    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&w=600&q=80',
    slug: 'titan',
    bg: '#F9F5F0',
  },
  {
    name: 'Fossil',
    offer: 'UP TO 40% OFF',
    img: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&w=600&q=80',
    slug: 'fossil',
    bg: '#EFF6FF',
  },
  {
    name: 'Casio',
    offer: 'STARTING ₹799',
    img: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&w=600&q=80',
    slug: 'casio',
    bg: '#F0FDF4',
  },
  {
    name: 'Timex',
    offer: 'UP TO 45% OFF',
    img: 'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?auto=format&w=600&q=80',
    slug: 'timex',
    bg: '#FFF7ED',
  },
  {
    name: 'Tommy Hilfiger',
    offer: 'UP TO 35% OFF',
    img: 'https://images.unsplash.com/photo-1611242322873-ec50dc2f2327?auto=format&w=600&q=80',
    slug: 'tommy-hilfiger',
    bg: '#FDF2F8',
  },
];

const HERO_BANNERS = [
  {
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&w=1600&q=90',
    eyebrow: 'New Arrivals',
    title: 'Time\nDefined',
    sub: 'Explore the finest watch collections',
    cta: 'Shop Watches',
    link: '/category/watches',
    align: 'left',
    dark: true,
  },
  {
    image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&w=1600&q=90',
    eyebrow: 'Smart Collection',
    title: 'Smarter\nLiving',
    sub: 'Smart Watches · Fitness Trackers · GPS',
    cta: 'Shop Smart Watches',
    link: '/category/smart-watches-fitness-bands',
    align: 'right',
    dark: true,
  },
  {
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&w=1600&q=90',
    eyebrow: 'Luxury Series',
    title: 'Crafted\nTo Perfection',
    sub: 'Swiss · Premium · Limited Edition',
    cta: 'Explore Luxury',
    link: '/category/luxe-watches',
    align: 'left',
    dark: true,
  },
];

const EXCLUSIVE_OFFERS = [
  { code: 'WATCH20', title: 'Flat 20% Off',   desc: 'On All Watches Above ₹3000', accent: '#8B1A2F' },
  { code: 'SMART15', title: 'Flat 15% Off',   desc: 'On Smart Watches & Fitness Bands', accent: '#1D4ED8' },
  { code: 'FIRST10', title: 'Extra 10% Off',  desc: 'For First-Time Buyers, Min. ₹1999', accent: '#047857' },
];

const PRICE_BUCKETS = [
  { label: 'UNDER', value: '999',  color: '#3B82F6', bg: '#EFF6FF', link: '/category/watches?maxPrice=999' },
  { label: 'UNDER', value: '1999', color: '#8B5CF6', bg: '#F5F3FF', link: '/category/watches?maxPrice=1999' },
  { label: 'UNDER', value: '3999', color: '#F97316', bg: '#FFF7ED', link: '/category/watches?maxPrice=3999' },
  { label: 'UNDER', value: '7999', color: '#EF4444', bg: '#FEF2F2', link: '/category/watches?maxPrice=7999' },
  { label: 'ABOVE', value: '8000', color: '#C9A84C', bg: '#FFFBEB', link: '/category/luxe-watches' },
];

const COLLECTIONS = [
  {
    title: 'Dress Watches',
    subtitle: 'For The Formal Occasion',
    img: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&w=800&q=80',
    link: '/category/analog-watches',
    cta: 'Shop Now',
    align: 'left',
  },
  {
    title: 'Sports & Adventure',
    subtitle: 'Built For The Active Life',
    img: 'https://images.unsplash.com/photo-1553818628-a7112b762f8d?auto=format&w=800&q=80',
    link: '/category/digital-watches',
    cta: 'Shop Now',
    align: 'right',
  },
];

const TRUST = [
  {
    label: 'Free Delivery',
    sub: 'On orders above ₹999',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    label: 'Warranty Assured',
    sub: 'Brand warranty on all watches',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
  },
  {
    label: 'Easy Returns',
    sub: '30-day hassle-free returns',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.49"/>
      </svg>
    ),
  },
  {
    label: '100% Genuine',
    sub: 'Certified authentic products',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
  },
];

/* ── Hero Banner ──────────────────────────────────────────────────────────── */
function HeroBanner() {
  const [slides, setSlides] = useState(HERO_BANNERS);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    fetch('/api/banners/watches')
      .then(r => r.json())
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data.map(b => ({
            image: b.image_url,
            eyebrow: b.eyebrow || '',
            title: b.title || '',
            sub: b.subtitle || '',
            cta: b.cta || 'Shop Now',
            link: b.link || '/category/watches',
            align: b.align || 'left',
            dark: true,
          })));
        }
      })
      .catch(() => {});
  }, []);

  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), [slides.length]);
  const prev = () => setCurrent(c => (c - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(next, 5000);
    return () => clearInterval(timer.current);
  }, [paused, next]);

  const slide = slides[current] ?? slides[0];
  const isRight = slide?.align === 'right';

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: 'calc(100vh - 138px)', minHeight: 460, maxHeight: 680 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((b, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <img
            src={b.image}
            alt={b.eyebrow}
            className="w-full h-full object-cover"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
          <div className={`absolute inset-0 ${isRight
            ? 'bg-gradient-to-l from-black/80 via-black/40 to-black/10'
            : 'bg-gradient-to-r from-black/80 via-black/40 to-black/10'
          }`} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />
        </div>
      ))}

      <div className={`absolute inset-0 z-20 flex items-center ${isRight ? 'justify-end' : 'justify-start'}`}>
        <div className={`px-10 sm:px-16 lg:px-24 max-w-xl ${isRight ? 'text-right' : 'text-left'}`}>
          <p className="text-[#C9A84C] text-[10px] uppercase tracking-[0.5em] font-bold mb-3">
            {slide.eyebrow}
          </p>
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4 whitespace-pre-line"
            style={{ fontFamily: 'var(--font-heading, "Cormorant Garamond", Georgia, serif)' }}
          >
            {slide.title}
          </h1>
          <p className="text-white/60 text-sm mb-8 tracking-wide">{slide.sub}</p>
          <Link
            to={slide.link}
            className="inline-block px-10 py-3.5 bg-[#8B1A2F] text-white text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-[#6d1424] transition-colors duration-200"
          >
            {slide.cta}
          </Link>
        </div>
      </div>

      {/* Nav arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/25 text-white transition-colors"
        aria-label="Previous"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/25 text-white transition-colors"
        aria-label="Next"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 h-[3px] rounded-full ${i === current ? 'w-8 bg-[#C9A84C]' : 'w-3 bg-white/40'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Shop by Type (circle tiles) ──────────────────────────────────────────── */
function ShopByType() {
  const rowRef = useRef(null);
  const scroll = dir => rowRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });

  return (
    <div className="bg-white border-b border-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-6 text-center">
          Shop By Type
        </h2>
        <div className="relative group/row">
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 shadow text-gray-500 opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <div
            ref={rowRef}
            className="flex gap-6 overflow-x-auto justify-center flex-wrap sm:flex-nowrap [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {WATCH_TYPE_TILES.map(t => (
              <Link
                key={t.slug}
                to={`/category/${t.slug}`}
                className="shrink-0 flex flex-col items-center gap-2 group/tile"
              >
                <div
                  className="relative w-[80px] h-[80px] rounded-full overflow-hidden border-2 border-transparent group-hover/tile:border-[#8B1A2F] transition-colors duration-200 shadow-sm"
                  style={{ background: t.bg }}
                >
                  <img
                    src={t.img}
                    alt={t.label}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/tile:scale-110"
                    loading="lazy"
                  />
                </div>
                <span className="text-[11px] font-bold text-[#8B1A2F] text-center">{t.offer}</span>
                <span className="text-[12px] font-semibold text-gray-700 whitespace-nowrap group-hover/tile:text-[#8B1A2F] transition-colors">
                  {t.label}
                </span>
              </Link>
            ))}
          </div>

          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 shadow text-gray-500 opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Exclusive Offers Strip ───────────────────────────────────────────────── */
function ExclusiveOffers() {
  return (
    <div className="bg-amber-50 border-y border-amber-100 py-5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-amber-200">
          {EXCLUSIVE_OFFERS.map(o => (
            <div key={o.code} className="px-4 py-4 flex flex-col items-center text-center gap-1.5">
              <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Exclusive Offer</p>
              <p className="text-base font-bold text-gray-900">
                Use Code: <span style={{ color: o.accent }}>{o.code}</span>
              </p>
              <p className="text-sm font-semibold text-gray-800">{o.title}</p>
              <p className="text-[11px] text-gray-500">{o.desc}</p>
              <Link to="/offers" className="text-[11px] text-[#8B1A2F] font-semibold underline underline-offset-2 mt-1">
                View All Products
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Featured Brands ──────────────────────────────────────────────────────── */
function FeaturedBrands() {
  return (
    <section className="py-12 bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading, Georgia)' }}>
            Featured Brands
          </h2>
          <p className="text-sm text-gray-500 mt-1">The Finest Names In Timekeeping</p>
          <div className="mt-3 mx-auto w-12 h-[2px] bg-[#8B1A2F]" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {FEATURED_BRANDS.map(b => (
            <Link
              key={b.slug}
              to={`/brand/${b.slug}`}
              className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow aspect-[3/4]"
              style={{ background: b.bg }}
            >
              <img
                src={b.img}
                alt={b.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-2.5 left-2.5 bg-black/60 text-white text-[9px] font-extrabold px-2 py-1 rounded tracking-wide">
                {b.offer}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                <p className="text-white font-bold text-sm">{b.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Shop by Gender ───────────────────────────────────────────────────────── */
function ShopByGender() {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading, Georgia)' }}>
            Watches For Everyone
          </h2>
          <div className="mt-3 mx-auto w-12 h-[2px] bg-[#8B1A2F]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link
            to="/category/watches?gender=men"
            className="group relative rounded-2xl overflow-hidden h-72 shadow-sm hover:shadow-xl transition-shadow"
          >
            <img
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&w=900&q=80"
              alt="Men's Watches"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-7">
              <p className="text-white/70 text-[10px] uppercase tracking-[0.4em] font-semibold mb-1">Collection</p>
              <h3 className="text-white text-3xl font-bold" style={{ fontFamily: 'var(--font-heading, Georgia)' }}>
                Men's Watches
              </h3>
              <span className="inline-flex items-center gap-2 mt-4 text-white text-[11px] font-bold uppercase tracking-widest border border-white/50 px-5 py-2 group-hover:bg-white group-hover:text-gray-900 transition-colors">
                Shop Now
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </span>
            </div>
          </Link>

          <Link
            to="/category/womens-watches"
            className="group relative rounded-2xl overflow-hidden h-72 shadow-sm hover:shadow-xl transition-shadow"
          >
            <img
              src="https://images.unsplash.com/photo-1611242322873-ec50dc2f2327?auto=format&w=900&q=80"
              alt="Women's Watches"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-7">
              <p className="text-white/70 text-[10px] uppercase tracking-[0.4em] font-semibold mb-1">Collection</p>
              <h3 className="text-white text-3xl font-bold" style={{ fontFamily: 'var(--font-heading, Georgia)' }}>
                Women's Watches
              </h3>
              <span className="inline-flex items-center gap-2 mt-4 text-white text-[11px] font-bold uppercase tracking-widest border border-white/50 px-5 py-2 group-hover:bg-white group-hover:text-gray-900 transition-colors">
                Shop Now
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Dual Collection Banners ──────────────────────────────────────────────── */
function CollectionBanners() {
  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {COLLECTIONS.map(c => (
            <Link
              key={c.title}
              to={c.link}
              className="group relative rounded-xl overflow-hidden h-56 shadow-sm hover:shadow-lg transition-shadow"
            >
              <img
                src={c.img}
                alt={c.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className={`absolute inset-0 ${c.align === 'right'
                ? 'bg-gradient-to-l from-black/80 via-black/40 to-transparent'
                : 'bg-gradient-to-r from-black/80 via-black/40 to-transparent'
              }`} />
              <div className={`absolute inset-0 flex items-center ${c.align === 'right' ? 'justify-end pr-8' : 'justify-start pl-8'}`}>
                <div className={c.align === 'right' ? 'text-right' : 'text-left'}>
                  <p className="text-white/60 text-[10px] uppercase tracking-widest font-semibold mb-2">{c.subtitle}</p>
                  <h3 className="text-white text-2xl font-bold" style={{ fontFamily: 'var(--font-heading, Georgia)' }}>
                    {c.title}
                  </h3>
                  <span className="inline-block mt-4 text-white text-[10px] font-bold uppercase tracking-widest border border-white/50 px-4 py-2 group-hover:bg-white group-hover:text-gray-900 transition-colors">
                    {c.cta}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Budget Edit ──────────────────────────────────────────────────────────── */
function BudgetEdit() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading, Georgia)' }}>
            Shop By Budget
          </h2>
          <p className="text-sm text-gray-500 mt-1">Great timepieces for every pocket</p>
          <div className="mt-3 mx-auto w-12 h-[2px] bg-[#8B1A2F]" />
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {PRICE_BUCKETS.map((b, i) => (
            <Link
              key={i}
              to={b.link}
              className="group relative flex items-center justify-center hover:scale-105 transition-transform"
              style={{ width: 100, height: 110 }}
            >
              <div
                className="absolute inset-0 border-2 transition-colors group-hover:border-[#8B1A2F]"
                style={{
                  background: b.bg,
                  borderColor: b.color,
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
              />
              <div className="relative z-10 text-center">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500 leading-none mb-1">
                  {b.label}
                </p>
                <p className="text-[16px] font-extrabold leading-none" style={{ color: b.color }}>
                  ₹{b.value}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Sticky Sub-nav ───────────────────────────────────────────────────────── */
function SubNav({ active }) {
  const navRef = useRef(null);

  useEffect(() => {
    if (!active || !navRef.current) return;
    const btn = navRef.current.querySelector(`[data-id="${active}"]`);
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [active]);

  return (
    <div className="sticky top-[138px] z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div
          ref={navRef}
          className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          {WATCH_SECTIONS.map(s => (
            <button
              key={s.id}
              data-id={s.id}
              onClick={() => document.getElementById(`watch-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className={`shrink-0 px-5 py-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                active === s.id
                  ? 'border-[#8B1A2F] text-[#8B1A2F]'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Watch Product Section ────────────────────────────────────────────────── */
function WatchSection({ section }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fetched) {
          setLoading(true);
          setFetched(true);
          obs.disconnect();
          fetch(`/api/categories/${section.slug}/products?limit=8&sort=newest`)
            .then(r => r.json())
            .then(({ data }) => {
              const list = Array.isArray(data) ? data : (data?.products ?? []);
              setProducts(list);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
        }
      },
      { rootMargin: '300px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [section.slug, fetched]);

  return (
    <section id={`watch-${section.id}`} ref={sectionRef} className="py-12 border-b border-gray-100 last:border-0">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold mb-1">
              Watches
            </p>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight" style={{ fontFamily: 'var(--font-heading, Georgia)' }}>
              {section.name}
            </h2>
            <p className="text-sm text-gray-400 mt-1">{section.sub}</p>
          </div>
          <Link
            to={`/category/${section.slug}`}
            className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-[#8B1A2F] border border-[#8B1A2F] px-5 py-2.5 hover:bg-[#8B1A2F] hover:text-white transition-colors duration-200"
          >
            View All
          </Link>
        </div>

        <ProductCarousel products={products} loading={loading} withDrawer />

        {fetched && !loading && products.length === 0 && (
          <p className="text-gray-400 text-sm py-10 text-center">
            No products yet.{' '}
            <Link to={`/category/${section.slug}`} className="text-[#8B1A2F] underline">
              Browse all watches
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}

/* ── Promo Mid-Banner ─────────────────────────────────────────────────────── */
function PromoBanner() {
  return (
    <div className="relative overflow-hidden bg-gray-900 my-0">
      <img
        src="https://images.unsplash.com/photo-1594534475808-b18fc33b045e?auto=format&w=1600&q=80"
        alt="Luxury Watches"
        className="w-full h-64 object-cover opacity-40"
        loading="lazy"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <p className="text-[#C9A84C] text-[10px] uppercase tracking-[0.5em] font-bold mb-2">
          Luxury Collection
        </p>
        <h3
          className="text-3xl sm:text-4xl font-bold text-white mb-2"
          style={{ fontFamily: 'var(--font-heading, "Cormorant Garamond", Georgia, serif)' }}
        >
          Crafted To Perfection
        </h3>
        <p className="text-white/60 text-sm mb-6">Swiss movements · Sapphire crystal · Premium steel</p>
        <Link
          to="/category/luxury-watches"
          className="inline-block px-8 py-3 border border-[#C9A84C] text-[#C9A84C] text-[11px] font-bold uppercase tracking-widest hover:bg-[#C9A84C] hover:text-black transition-colors duration-200"
        >
          Explore Luxury
        </Link>
      </div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────────────────── */
export default function WatchesPage() {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observers = [];
    WATCH_SECTIONS.forEach(s => {
      const el = document.getElementById(`watch-${s.id}`);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(s.id); },
        { threshold: 0.2 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <>
      <Helmet>
        <title>Watches – Analog, Digital, Smart & Luxury | ShoppersHub</title>
        <meta
          name="description"
          content="Shop watches online at ShoppersHub. Analog, Digital, Smart, Chronograph, Luxury & Sports watches from top brands — Titan, Fossil, Casio, Timex & more."
        />
      </Helmet>

      <div className="bg-white min-h-screen">
        {/* 1. Hero carousel */}
        <HeroBanner />

        {/* 2. Shop by type circles */}
        <ShopByType />

        {/* 3. Exclusive offer codes */}
        <ExclusiveOffers />

        {/* 4. Featured brands */}
        <FeaturedBrands />

        {/* 5. Men's / Women's gender split */}
        <ShopByGender />

        {/* 6. Collection banners (Dress / Sports) */}
        <CollectionBanners />

        {/* 7. Budget hexagons */}
        <BudgetEdit />

        {/* 8. Sticky sub-nav */}
        <SubNav active={activeId} />

        {/* 9. Product sections — first 4 */}
        <div>
          {WATCH_SECTIONS.slice(0, 4).map(s => (
            <WatchSection key={s.id} section={s} />
          ))}
          <PromoBanner />
          {WATCH_SECTIONS.slice(4).map(s => (
            <WatchSection key={s.id} section={s} />
          ))}
        </div>

        {/* 10. Trust strip */}
        <div className="border-t border-gray-100 bg-gray-50 py-12">
          <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {TRUST.map(t => (
              <div key={t.label} className="flex flex-col items-center text-center gap-3">
                <div className="w-11 h-11 rounded-full border border-[#8B1A2F]/20 flex items-center justify-center text-[#8B1A2F]">
                  {t.icon}
                </div>
                <div>
                  <p className="text-gray-900 text-[12px] font-bold uppercase tracking-wider">{t.label}</p>
                  <p className="text-gray-400 text-[11px] mt-0.5">{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
