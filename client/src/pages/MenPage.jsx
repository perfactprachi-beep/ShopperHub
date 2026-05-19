import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ProductCarousel from '../components/home/ProductCarousel.jsx';

/* ── Static data ─────────────────────────────────────────────────────────── */
const MEN_SECTIONS = [
  {
    id: 'casual-wear',
    slug: 'casual-wear',
    name: 'Casual Wear',
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&w=800&q=80',
    sub: 'T-Shirts · Polos · Jackets · Joggers',
  },
  {
    id: 'formal-wear',
    slug: 'formal-wear',
    name: 'Formal Wear',
    image: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&w=800&q=80',
    sub: 'Trousers · Suit Sets · Blazers & Coats',
  },
  {
    id: 'shirts',
    slug: 'shirts',
    name: 'Shirts',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&w=800&q=80',
    sub: 'Casual · Formal · Printed · Checks',
  },
  {
    id: 'athleisure',
    slug: 'athleisure',
    name: 'Athleisure',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&w=800&q=80',
    sub: 'Active T-Shirts · Track Pants · Sets',
  },
  {
    id: 'jeans',
    slug: 'jeans',
    name: 'Jeans',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&w=800&q=80',
    sub: 'Slim · Regular · Straight · Wide Leg',
  },
  {
    id: 'footwear',
    slug: 'footwear',
    name: 'Footwear',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&w=800&q=80',
    sub: 'Casual · Sports Shoes · Formal · Boots',
  },
  {
    id: 'indian-festive-wear',
    slug: 'indian-festive-wear',
    name: 'Indian & Festive',
    image: 'https://images.unsplash.com/photo-1609609800896-a7bc8fde1611?auto=format&w=800&q=80',
    sub: 'Kurtas · Kurta Sets · Nehru Jackets',
  },
  {
    id: 'accessories',
    slug: 'accessories',
    name: 'Accessories',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&w=800&q=80',
    sub: 'Belts · Wallets · Caps · Sunglasses',
  },
  {
    id: 'winterwear',
    slug: 'winterwear',
    name: 'Winterwear',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&w=800&q=80',
    sub: 'Sweaters · Jackets & Coats · Thermals',
  },
  {
    id: 'watches',
    slug: 'watches',
    name: 'Watches',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&w=800&q=80',
    sub: 'Smart Watches · Analog · Chronograph',
  },
];

const HERO_BANNERS = [
  {
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&w=1600&q=90',
    eyebrow: 'New Season',
    title: 'The Modern\nMan',
    sub: 'Fresh styles for every occasion',
    cta: 'Shop Men',
    link: '/category/casual-wear',
    align: 'left',
  },
  {
    image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&w=1600&q=90',
    eyebrow: 'Formal Collection',
    title: 'Dressed\nFor Success',
    sub: 'Suits · Blazers · Formal Trousers',
    cta: 'Shop Formals',
    link: '/category/formal-wear',
    align: 'right',
  },
  {
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&w=1600&q=90',
    eyebrow: 'Athleisure',
    title: 'Move.\nPerform.\nStyle.',
    sub: 'Active T-Shirts · Track Pants · Sets',
    cta: 'Shop Athleisure',
    link: '/category/athleisure',
    align: 'left',
  },
];

const TRUST = [
  {
    label: 'Free Delivery',
    sub: 'On orders above ₹499',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
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
    sub: 'Authentic branded products',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
  },
  {
    label: 'Secure Payments',
    sub: 'Multiple safe payment options',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
];

/* ── Hero Banner Carousel ─────────────────────────────────────────────────── */
function HeroBanner() {
  const [slides, setSlides] = useState(HERO_BANNERS);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    fetch('/api/banners/men')
      .then(r => r.json())
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data.map(b => ({
            image: b.image_url,
            eyebrow: b.eyebrow || '',
            title: b.title || '',
            sub: b.subtitle || '',
            cta: 'Shop Now',
            link: b.link || '/category/men',
            align: b.align || 'left',
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
            ? 'bg-gradient-to-l from-black/75 via-black/35 to-black/5'
            : 'bg-gradient-to-r from-black/75 via-black/35 to-black/5'
          }`} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        </div>
      ))}

      <div className={`absolute inset-0 z-20 flex items-center ${isRight ? 'justify-end' : 'justify-start'}`}>
        <div className={`px-10 sm:px-16 lg:px-24 max-w-xl ${isRight ? 'text-right' : 'text-left'}`}>
          <p className="text-white/70 text-[10px] uppercase tracking-[0.5em] font-bold mb-3">
            {slide.eyebrow}
          </p>
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4 whitespace-pre-line"
            style={{ fontFamily: 'var(--font-heading, Georgia)' }}
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

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Previous"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Next"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 h-[3px] rounded-full ${i === current ? 'w-8 bg-[#8B1A2F]' : 'w-3 bg-white/40'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Category Quick Tiles ─────────────────────────────────────────────────── */
function CategoryTiles() {
  const rowRef = useRef(null);
  const scroll = dir => rowRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });

  return (
    <div className="bg-gray-50 border-b border-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-5">
          Shop by Category
        </h2>
        <div className="relative group/row">
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 shadow text-gray-500 opacity-0 group-hover/row:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <div
            ref={rowRef}
            className="flex gap-5 overflow-x-auto [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {MEN_SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => document.getElementById(`men-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="shrink-0 flex flex-col items-center gap-2 group/tile"
              >
                <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden border-2 border-transparent group-hover/tile:border-[#8B1A2F] transition-colors duration-200">
                  <img
                    src={s.image}
                    alt={s.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/tile:scale-110"
                    loading="lazy"
                  />
                </div>
                <span className="text-[11px] font-semibold text-gray-700 whitespace-nowrap group-hover/tile:text-[#8B1A2F] transition-colors duration-200">
                  {s.name}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 shadow text-gray-500 opacity-0 group-hover/row:opacity-100 transition-opacity"
            aria-label="Scroll right"
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

/* ── Sticky Sub-nav ───────────────────────────────────────────────────────── */
function SubNav({ active }) {
  const navRef = useRef(null);

  /* Auto-scroll active chip into view */
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
          {MEN_SECTIONS.map(s => (
            <button
              key={s.id}
              data-id={s.id}
              onClick={() => document.getElementById(`men-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
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

/* ── Individual Product Section ───────────────────────────────────────────── */
function MenSection({ section }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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
  }, [section.slug]);

  return (
    <section id={`men-${section.id}`} ref={sectionRef} className="py-12 border-b border-gray-100 last:border-0">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#8B1A2F] font-bold mb-1">
              Men's
            </p>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">{section.name}</h2>
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
            No products in this category yet.{' '}
            <Link to={`/category/${section.slug}`} className="text-[#8B1A2F] underline">
              Browse all men's
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}

/* ── Promo Banner (mid-page) ──────────────────────────────────────────────── */
function PromoBanner() {
  return (
    <div className="relative overflow-hidden bg-gray-900 my-0">
      <img
        src="https://images.unsplash.com/photo-1490754516627-0cf62dfb29be?auto=format&w=1600&q=80"
        alt="Men's Collection"
        className="w-full h-64 object-cover opacity-50"
        loading="lazy"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <p className="text-white/60 text-[10px] uppercase tracking-[0.5em] font-bold mb-2">
          Exclusive Deals
        </p>
        <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4"
          style={{ fontFamily: 'var(--font-heading, Georgia)' }}
        >
          Up to 50% Off on Brands
        </h3>
        <Link
          to="/offers"
          className="inline-block px-8 py-3 border border-white text-white text-[11px] font-bold uppercase tracking-widest hover:bg-white hover:text-gray-900 transition-colors duration-200"
        >
          Explore Offers
        </Link>
      </div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────────────────── */
export default function MenPage() {
  const [activeId, setActiveId] = useState('');

  /* Track which section is in view for the subnav highlight */
  useEffect(() => {
    const observers = [];
    MEN_SECTIONS.forEach(s => {
      const el = document.getElementById(`men-${s.id}`);
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
        <title>Men's Fashion – ShoppersHub</title>
        <meta
          name="description"
          content="Shop men's clothing, footwear & accessories online. T-Shirts, Shirts, Jeans, Formals, Athleisure, Kurtas & more from top brands."
        />
      </Helmet>

      <div className="bg-white min-h-screen">
        {/* Hero */}
        <HeroBanner />

        {/* Category quick-tiles */}
        <CategoryTiles />

        {/* Sticky sub-nav */}
        <SubNav active={activeId} />

        {/* Product sections */}
        <div>
          {MEN_SECTIONS.slice(0, 3).map(s => (
            <MenSection key={s.id} section={s} />
          ))}
          <PromoBanner />
          {MEN_SECTIONS.slice(3).map(s => (
            <MenSection key={s.id} section={s} />
          ))}
        </div>

        {/* Trust strip */}
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
