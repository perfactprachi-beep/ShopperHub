import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

/* ── Data ────────────────────────────────────────────────────────────────── */
const CATEGORIES = [
  {
    id: 'watches',
    name: 'Watches',
    slug: 'luxe-watches',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&w=1200&q=85',
    brands: [
      { name: 'Tissot',         slug: 'luxe-watches-tissot' },
      { name: 'Michael Kors',   slug: 'luxe-watches-michael-kors' },
      { name: 'Coach',          slug: 'luxe-watches-coach' },
      { name: 'Emporio Armani', slug: 'luxe-watches-emporio-armani' },
      { name: 'GUESS',          slug: 'luxe-watches-guess' },
    ],
  },
  {
    id: 'sunglasses',
    name: 'Sunglasses',
    slug: 'luxe-sunglasses',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&w=1200&q=85',
    brands: [
      { name: 'Tom Ford', slug: 'luxe-sunglasses-tom-ford' },
      { name: 'Rayban',   slug: 'luxe-sunglasses-rayban' },
      { name: 'GUESS',    slug: 'luxe-sunglasses-guess' },
      { name: 'CARRERA',  slug: 'luxe-sunglasses-carrera' },
    ],
  },
  {
    id: 'handbags',
    name: 'Handbags',
    slug: 'luxe-handbags',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&w=1200&q=85',
    brands: [
      { name: 'ALDO',        slug: 'luxe-handbags-aldo' },
      { name: 'STEVE MADDEN',slug: 'luxe-handbags-steve-madden' },
      { name: 'GUESS',       slug: 'luxe-handbags-guess' },
      { name: 'HIDESIGN',    slug: 'luxe-handbags-hidesign' },
    ],
  },
  {
    id: 'jewellery',
    name: 'Jewellery',
    slug: 'luxe-jewellery',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&w=1200&q=85',
    brands: [
      { name: 'Swarovski',   slug: 'luxe-jewellery-swarovski' },
      { name: 'Michael Kors',slug: 'luxe-jewellery-michael-kors' },
    ],
  },
  {
    id: 'fragrances',
    name: 'Fragrances',
    slug: 'luxe-fragrances',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&w=1200&q=85',
    brands: [
      { name: 'Giorgio Armani', slug: 'luxe-fragrances-giorgio-armani' },
      { name: 'Versace',        slug: 'luxe-fragrances-versace' },
      { name: 'Burberry',       slug: 'luxe-fragrances-burberry' },
    ],
  },
  {
    id: 'skincare',
    name: 'Skin Care',
    slug: 'luxe-skin-care',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&w=1200&q=85',
    brands: [
      { name: 'Shiseido',        slug: 'luxe-skin-care-shiseido' },
      { name: 'Clarins',         slug: 'luxe-skin-care-clarins' },
      { name: 'Elizabeth Arden', slug: 'luxe-skin-care-elizabeth-arden' },
    ],
  },
  {
    id: 'makeup',
    name: 'Makeup',
    slug: 'luxe-makeup',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&w=1200&q=85',
    brands: [
      { name: 'Estee Lauder', slug: 'luxe-makeup-estee-lauder' },
      { name: 'Bobbi Brown',  slug: 'luxe-makeup-bobbi-brown' },
      { name: 'M.A.C',        slug: 'luxe-makeup-mac' },
      { name: 'Smashbox',     slug: 'luxe-makeup-smashbox' },
      { name: 'NARS',         slug: 'luxe-makeup-nars' },
      { name: 'Clinique',     slug: 'luxe-makeup-clinique' },
    ],
  },
];

/* ── Banner carousel data ────────────────────────────────────────────────── */
const BANNERS = [
  {
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&w=1600&q=90',
    eyebrow: 'Luxe Watches',
    title: 'The Art\nof Time',
    sub: 'Tissot · Michael Kors · Coach · Emporio Armani',
    cta: 'Shop Now',
    link: '/category/luxe-watches',
    align: 'left',
  },
  {
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&w=1600&q=90',
    eyebrow: 'Luxe Handbags',
    title: 'Carry\nElegance',
    sub: 'ALDO · Steve Madden · GUESS · Hidesign',
    cta: 'Shop Now',
    link: '/category/luxe-handbags',
    align: 'right',
  },
  {
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&w=1600&q=90',
    eyebrow: 'Luxe Fragrances',
    title: 'Leave a\nLasting Mark',
    sub: 'Giorgio Armani · Versace · Burberry',
    cta: 'Shop Now',
    link: '/category/luxe-fragrances',
    align: 'left',
  },
  {
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&w=1600&q=90',
    eyebrow: 'Luxe Makeup',
    title: 'Prestige\nBeauty',
    sub: 'Estee Lauder · Bobbi Brown · M.A.C · NARS',
    cta: 'Shop Now',
    link: '/category/luxe-makeup',
    align: 'right',
  },
  {
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&w=1600&q=90',
    eyebrow: 'Luxe Jewellery',
    title: 'Adorn\nYourself',
    sub: 'Swarovski · Michael Kors',
    cta: 'Shop Now',
    link: '/category/luxe-jewellery',
    align: 'left',
  },
];

/* ── Category scroller data ──────────────────────────────────────────────── */
const CAT_CARDS = [
  {
    id: 'fragrances',
    name: 'Fragrances',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&w=600&q=80',
  },
  {
    id: 'watches',
    name: 'Watches',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&w=600&q=80',
  },
  {
    id: 'makeup',
    name: 'Beauty',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&w=600&q=80',
  },
  {
    id: 'sunglasses',
    name: 'Eyewear',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&w=600&q=80',
  },
  {
    id: 'handbags',
    name: 'Bags',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&w=600&q=80',
  },
  {
    id: 'skincare',
    name: 'Skincare',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&w=600&q=80',
  },
  {
    id: 'jewellery',
    name: 'Jewellery',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&w=600&q=80',
  },
];

/* ── Category Scroller ───────────────────────────────────────────────────── */
function LuxeCategoryScroller() {
  const rowRef = useRef(null);

  const scroll = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  const scrollToSection = (id) => {
    document.getElementById(`luxe-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative bg-[#0D0D0D] py-8 px-0">
      {/* Left arrow */}
      <button
        onClick={() => scroll(-1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center border border-white/20 text-white/60 hover:text-white hover:border-white/50 bg-[#0D0D0D]/80 transition-colors"
        aria-label="Scroll left"
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      {/* Scrollable row */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto px-12 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {CAT_CARDS.map((cat) => (
          <button
            key={cat.id}
            onClick={() => scrollToSection(cat.id)}
            className="shrink-0 relative overflow-hidden group cursor-pointer"
            style={{ width: 210, height: 270 }}
          >
            <img
              src={cat.image}
              alt={cat.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            {/* Name */}
            <p className="absolute bottom-4 left-0 right-0 text-center text-white text-[13px] font-semibold tracking-widest uppercase">
              {cat.name}
            </p>
          </button>
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll(1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center border border-white/20 text-white/60 hover:text-white hover:border-white/50 bg-[#0D0D0D]/80 transition-colors"
        aria-label="Scroll right"
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  );
}

/* ── Banner Carousel ─────────────────────────────────────────────────────── */
function LuxeBannerCarousel() {
  const [slides, setSlides] = useState(BANNERS);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused]   = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    fetch('/api/banners/luxe')
      .then(r => r.json())
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data.map(b => ({
            image: b.image_url,
            eyebrow: b.eyebrow || '',
            title: b.title || '',
            sub: b.subtitle || '',
            cta: 'Shop Now',
            link: b.link || '/luxe',
            align: b.align || 'left',
          })));
        }
      })
      .catch(() => {});
  }, []);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);

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
      style={{ height: 'calc(100vh - 138px)', minHeight: 480, maxHeight: 720 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
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
          {/* Dark overlay — gradient from left or right */}
          <div className={`absolute inset-0 ${isRight
            ? 'bg-gradient-to-l from-black/80 via-black/40 to-black/10'
            : 'bg-gradient-to-r from-black/80 via-black/40 to-black/10'
          }`} />
          {/* Always darken top & bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
        </div>
      ))}

      {/* Content */}
      <div className={`absolute inset-0 z-20 flex items-center ${isRight ? 'justify-end' : 'justify-start'}`}>
        <div className={`px-10 sm:px-16 lg:px-24 max-w-lg ${isRight ? 'text-right' : 'text-left'}`}>
          <p className="text-[#C9A84C] text-[10px] uppercase tracking-[0.5em] font-bold mb-3">
            {slide.eyebrow}
          </p>
          <h2
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4 whitespace-pre-line"
            style={{ fontFamily: 'var(--font-heading, Georgia)' }}
          >
            {slide.title}
          </h2>
          <p className="text-white/50 text-sm mb-8 tracking-wide">{slide.sub}</p>
          <Link
            to={slide.link}
            className="inline-block px-10 py-3.5 border border-white text-white text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-white hover:text-black transition-all duration-200"
          >
            {slide.cta}
          </Link>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center border border-white/30 text-white hover:bg-white/15 transition-colors"
        aria-label="Previous"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center border border-white/30 text-white hover:bg-white/15 transition-colors"
        aria-label="Next"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 h-[3px] rounded-full ${i === current ? 'w-8 bg-[#C9A84C]' : 'w-3 bg-white/30'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Styled brand items (matching Shoppers Stop visual treatment) ─────────── */
const STYLED_BRANDS = [
  { name: 'VALENTINO',      style: 'font-serif tracking-[0.18em] font-light text-[15px]' },
  { name: 'MUGLER',         style: 'font-sans tracking-[0.22em] font-bold text-[14px]' },
  { name: 'COACH',          style: 'font-sans tracking-[0.15em] font-bold text-[13px]', boxed: true },
  { name: 'SWAROVSKI',      style: 'font-sans tracking-[0.2em] font-light text-[13px]' },
  { name: 'Maison Margiela',style: 'font-sans tracking-[0.05em] font-normal text-[13px]', sub: 'Paris' },
  { name: 'roberto cavalli', style: 'font-serif tracking-[0.04em] italic font-normal text-[15px]' },
  { name: 'GUCCI',          style: 'font-sans tracking-[0.35em] font-bold text-[14px]' },
  { name: 'VERSACE',        style: 'font-sans tracking-[0.25em] font-bold text-[13px]' },
  { name: 'TORY BURCH',     style: 'font-sans tracking-[0.18em] font-semibold text-[12px]' },
  { name: 'BURBERRY',       style: 'font-sans tracking-[0.15em] font-light text-[14px]' },
  { name: 'TOM FORD',       style: 'font-sans tracking-[0.22em] font-bold text-[13px]' },
  { name: 'EMPORIO ARMANI', style: 'font-sans tracking-[0.1em] font-light text-[12px]' },
];

function BrandItem({ b }) {
  return (
    <div className="shrink-0 flex flex-col items-center justify-center select-none">
      {b.boxed ? (
        <span className={`border border-white/50 px-3 py-1 text-white/80 ${b.style}`}>
          {b.name}
        </span>
      ) : (
        <>
          <span className={`text-white/75 ${b.style}`}>{b.name}</span>
          {b.sub && <span className="text-white/30 text-[8px] tracking-[0.25em] uppercase mt-0.5">{b.sub}</span>}
        </>
      )}
    </div>
  );
}

/* ── Brand ticker ─────────────────────────────────────────────────────────── */
function BrandTicker() {
  const items = [...STYLED_BRANDS, ...STYLED_BRANDS];
  return (
    <div className="overflow-hidden bg-[#0a0a0a] border-y border-white/8 py-5">
      <div
        className="flex items-center gap-16 whitespace-nowrap"
        style={{ animation: 'luxeTicker 35s linear infinite' }}
      >
        {items.map((b, i) => <BrandItem key={i} b={b} />)}
      </div>
      <style>{`@keyframes luxeTicker{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

/* ── Sticky sub-nav ───────────────────────────────────────────────────────── */
function SubNav({ active }) {
  const scrollTo = (id) => {
    document.getElementById(`luxe-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <div className="sticky top-[138px] z-20 bg-[#111] border-b border-white/8">
      <div className="max-w-7xl mx-auto px-4">
        <div
          className="flex gap-0 overflow-x-auto [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollTo(cat.id)}
              className={`shrink-0 px-6 py-4 text-[12px] font-bold uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${
                active === cat.id
                  ? 'border-[#C9A84C] text-[#C9A84C]'
                  : 'border-transparent text-white/40 hover:text-white/80'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── One category section ─────────────────────────────────────────────────── */
function CategorySection({ cat, flip }) {
  return (
    <section id={`luxe-${cat.id}`} className="border-b border-white/8">
      <div className={`grid grid-cols-1 lg:grid-cols-2 min-h-[500px] ${flip ? 'lg:[&>*:first-child]:order-2' : ''}`}>

        {/* Image */}
        <div className="relative overflow-hidden min-h-[320px]">
          <img
            src={cat.image}
            alt={cat.name}
            className="w-full h-full object-cover absolute inset-0"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          {/* Category name overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <p className="text-[#C9A84C] text-[10px] uppercase tracking-[0.4em] font-bold mb-1">Luxe</p>
            <h2
              className="text-4xl lg:text-5xl font-bold text-white leading-tight"
              style={{ fontFamily: 'var(--font-heading, Georgia)' }}
            >
              {cat.name}
            </h2>
          </div>
        </div>

        {/* Brands panel */}
        <div className="bg-[#111] flex flex-col justify-center px-8 py-12 lg:px-16">
          <p className="text-[#C9A84C] text-[10px] uppercase tracking-[0.4em] font-bold mb-8">
            Featured Brands
          </p>

          <div className="flex flex-col divide-y divide-white/6">
            {cat.brands.map((brand) => (
              <Link
                key={brand.slug}
                to={`/category/${brand.slug}`}
                className="group flex items-center justify-between py-4 first:pt-0 last:pb-0"
              >
                <span className="text-white text-[16px] font-semibold tracking-wide group-hover:text-[#C9A84C] transition-colors duration-200">
                  {brand.name}
                </span>
                <svg
                  className="w-4 h-4 text-white/20 group-hover:text-[#C9A84C] group-hover:translate-x-1 transition-all duration-200"
                  fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ))}
          </div>

          <Link
            to={`/category/${cat.slug}`}
            className="mt-10 self-start inline-block px-8 py-3 border border-[#C9A84C] text-[#C9A84C] text-[11px] font-bold uppercase tracking-widest hover:bg-[#C9A84C] hover:text-black transition-all duration-200"
          >
            Shop {cat.name} →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Trust strip ──────────────────────────────────────────────────────────── */
const TRUST = [
  {
    label: 'Authenticated',
    sub: '100% genuine products',
    icon: (
      <svg width="22" height="22" fill="none" stroke="#C9A84C" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
  },
  {
    label: 'Signature Gifting',
    sub: 'Premium packaging on every order',
    icon: (
      <svg width="22" height="22" fill="none" stroke="#C9A84C" strokeWidth="1.8" viewBox="0 0 24 24">
        <polyline points="20 12 20 22 4 22 4 12"/>
        <rect x="2" y="7" width="20" height="5"/>
        <line x1="12" y1="22" x2="12" y2="7"/>
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
      </svg>
    ),
  },
  {
    label: 'Concierge Support',
    sub: 'Personal Luxe styling advisors',
    icon: (
      <svg width="22" height="22" fill="none" stroke="#C9A84C" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    label: 'Free Delivery',
    sub: 'Complimentary on all Luxe orders',
    icon: (
      <svg width="22" height="22" fill="none" stroke="#C9A84C" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M1 3h15v13H1z"/>
        <path d="M16 8h4l3 3v5h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
];

/* ── Main ─────────────────────────────────────────────────────────────────── */
export default function LuxePage() {
  const [activeId, setActiveId] = useState('');
  const sectionsRef = useRef([]);

  /* Intersection observer to highlight active sub-nav item */
  useEffect(() => {
    const observers = [];
    CATEGORIES.forEach((cat) => {
      const el = document.getElementById(`luxe-${cat.id}`);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(cat.id); },
        { threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <>
      <Helmet>
        <title>Luxe Collection – ShoppersHub</title>
        <meta name="description" content="Discover the world's finest watches, handbags, fragrances and jewellery. Premium brands curated just for you." />
      </Helmet>

      <div className="bg-[#0D0D0D] min-h-screen">

        {/* ── Banner Carousel (matches Shoppers Stop Luxe) ── */}
        <LuxeBannerCarousel />

        {/* ── Brand ticker ── */}
        <BrandTicker />

        {/* ── Category scroller ── */}
        <LuxeCategoryScroller />

        {/* ── Sticky sub-nav ── */}
        <SubNav active={activeId} />

        {/* ── All category sections ── */}
        <div>
          {CATEGORIES.map((cat, i) => (
            <CategorySection key={cat.id} cat={cat} flip={i % 2 !== 0} />
          ))}
        </div>

        {/* ── Trust badges ── */}
        <div className="border-t border-white/8 bg-[#111] py-14">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {TRUST.map((t) => (
              <div key={t.label} className="flex flex-col items-center text-center gap-3">
                <div className="w-11 h-11 rounded-full border border-[#C9A84C]/30 flex items-center justify-center">
                  {t.icon}
                </div>
                <div>
                  <p className="text-white text-[12px] font-bold uppercase tracking-widest">{t.label}</p>
                  <p className="text-white/35 text-[11px] mt-0.5">{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
