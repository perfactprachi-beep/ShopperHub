import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ProductCarousel from '../components/home/ProductCarousel.jsx';
import { useCartStore } from '../store/cartStore.js';
import { useToastStore } from '../store/toastStore.js';
import { calcFinalPrice } from '../utils/calcDiscount.js';
import { assetUrl } from '../utils/assetUrl.js';

/* ── ACCENT ──────────────────────────────────────────────────────────── */
const PINK = '#C2185B';
const PINK_LIGHT = '#FCE4EC';

/* ── DATA ────────────────────────────────────────────────────────────── */
const TOP_CATEGORIES = [
  { label: 'Bestsellers', slug: 'beauty',            image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80' },
  { label: 'Makeup',      slug: 'makeup',             image: 'https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=200&q=80' },
  { label: 'Skincare',    slug: 'skin',               image: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=200&q=80' },
  { label: "Men's Edit",  slug: 'mens-grooming',      image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=200&q=80' },
  { label: 'Fragrances',  slug: 'fragrances',         image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=200&q=80' },
  { label: 'Appliances',  slug: 'tools-accessories',  image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=200&q=80' },
  { label: 'Hair Care',   slug: 'hair',               image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=80' },
  { label: 'Nail Care',   slug: 'nails',              image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200&q=80' },
];

const HERO_SLIDES = [
  {
    bg: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1400&q=80',
    eyebrow: '5th May – 5th June',
    badge: 'MAY',
    title: 'SUMMER\nSALE',
    offer: 'UP TO 50% OFF',
    sub: 'Extra ₹1000 Off · Code: STYLE26',
    cta: 'Shop Now →',
    link: '/offers',
    overlay: 'from-white/80 via-white/40 to-transparent',
    textDark: true,
  },
  {
    bg: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1400&q=80',
    eyebrow: 'New Arrivals',
    badge: 'HOT',
    title: 'SUMMER\nGLOW',
    offer: 'UP TO 40% OFF',
    sub: 'On Skincare & Serums',
    cta: 'Explore Now →',
    link: '/category/skin',
    overlay: 'from-[#1a0a1e]/70 via-[#1a0a1e]/30 to-transparent',
    textDark: false,
  },
];

const EXCLUSIVE_OFFERS = [
  { code: 'STYLE26', desc: 'Flat ₹400 On ₹5000, Flat ₹1000 On ₹10000', link: '/offers' },
  { code: 'LUXE',    desc: 'Flat ₹2500 Off On ₹20000', sub: 'On selected products', link: '/offers' },
  { code: 'NEW10',   desc: 'Flat First-Time Users 10% Off On ₹3000', link: '/offers' },
];

const SCENT_BRANDS = [
  { label: 'Yves Saint Laurent', slug: 'fragrances', discount: 'STARTING ₹700', image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80' },
  { label: 'Carolina Herrera',   slug: 'fragrances', discount: 'UP TO 30% OFF',  image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&q=80' },
  { label: 'Prada',              slug: 'fragrances', discount: 'FLAT 10% OFF',   image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&q=80' },
  { label: 'Narciso Rodriguez',  slug: 'fragrances', discount: 'FLAT 10% OFF',   image: 'https://images.unsplash.com/photo-1547887538-047f814ae6bd?w=400&q=80' },
  { label: 'Dior',               slug: 'fragrances', discount: 'UP TO 30% OFF',  image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&q=80' },
  { label: 'Valentino',          slug: 'fragrances', discount: 'UP TO 25% OFF',  image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&q=80' },
];

const MOOD_CARDS = [
  { label: 'Sun-Kissed\nSkin',    slug: 'skin',      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80' },
  { label: 'Glazed &\nBlushed',   slug: 'makeup',    image: 'https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=600&q=80' },
  { label: 'Vacay\nMode',         slug: 'beauty',    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80' },
];

const BEAUTY_BRANDS = [
  { name: 'Colorbar',  discount: 'UP TO 40% OFF', slug: 'colorbar',   image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80',  bg: '#FFF0F5' },
  { name: "L'Oréal",   discount: 'UP TO 20% OFF', slug: 'loreal',     image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80',  bg: '#FFF8F0' },
  { name: 'Maybelline',discount: 'UP TO 25% OFF', slug: 'maybelline', image: 'https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=400&q=80',  bg: '#F5F0FF' },
  { name: 'Chambor',   discount: 'UP TO 30% OFF', slug: 'chambor',    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80',  bg: '#FFF0F5' },
  { name: 'Lovite',    discount: 'STARTING ₹499', slug: 'beauty',     image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&q=80',  bg: '#FFF0F0' },
];

const ROUTINE_STEPS = [
  { step: 1, label: 'Cleanse',        slug: 'face-washes',    color: '#42A5F5', image: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=200&q=80' },
  { step: 2, label: 'Tone & Refresh', slug: 'toners-mists',   color: '#66BB6A', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200&q=80' },
  { step: 3, label: 'Treat & Glow',   slug: 'face-serums',    color: '#EF5350', image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=200&q=80' },
  { step: 4, label: 'Hydrate',        slug: 'moisturizers',   color: '#26C6DA', image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&q=80' },
  { step: 5, label: 'Protect',        slug: 'sun-care',       color: '#FFA726', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&q=80' },
  { step: 6, label: 'Set & Stay Fresh', slug: 'setting-sprays', color: '#AB47BC', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&q=80' },
];

const FRAGRANCE_BRANDS = [
  { name: 'Carolina Herrera', slug: 'fragrances', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=300&q=80' },
  { name: 'Prada',            slug: 'fragrances', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=300&q=80' },
  { name: 'Narciso Rodriguez',slug: 'fragrances', image: 'https://images.unsplash.com/photo-1547887538-047f814ae6bd?w=300&q=80' },
  { name: 'Valentino',        slug: 'fragrances', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=300&q=80' },
  { name: 'Issey Miyake',     slug: 'fragrances', image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=300&q=80' },
  { name: 'Calvin Klein',     slug: 'fragrances', image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=300&q=80' },
];

const SHOW_BRANDS = [
  { name: 'Shiseido', slug: 'shiseido', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&q=80' },
  { name: 'Clarins',  slug: 'clarins',  image: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=300&q=80' },
  { name: 'Boss',     slug: 'boss',     image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&q=80' },
  { name: 'Davidoff', slug: 'davidoff', image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=300&q=80' },
  { name: 'ELLE',     slug: 'elle',     image: 'https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=300&q=80' },
];

/* ── SHARED ──────────────────────────────────────────────────────────── */
function SectionHead({ title, subtitle, viewAllTo }) {
  return (
    <div className="text-center mb-6">
      <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>{title}</h2>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      <div className="mt-2 mx-auto w-12 h-[2px]" style={{ background: PINK }} />
      {viewAllTo && (
        <Link to={viewAllTo} className="inline-block mt-3 text-[11px] font-semibold underline underline-offset-2" style={{ color: PINK }}>
          View All Products
        </Link>
      )}
    </div>
  );
}

function HorizontalScroll({ children, scrollAmount = 320 }) {
  const ref = useRef(null);
  const scroll = d => ref.current?.scrollBy({ left: d * scrollAmount, behavior: 'smooth' });
  return (
    <div className="relative group/hs">
      <button onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border border-gray-200 shadow rounded-full flex items-center justify-center text-gray-600 opacity-0 group-hover/hs:opacity-100 transition-opacity">
        ‹
      </button>
      <div ref={ref} className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {children}
      </div>
      <button onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border border-gray-200 shadow rounded-full flex items-center justify-center text-gray-600 opacity-0 group-hover/hs:opacity-100 transition-opacity">
        ›
      </button>
    </div>
  );
}

/* ── SECTION 1 — Top Category Strip ─────────────────────────────────── */
function BeautyTopStrip() {
  return (
    <div className="bg-white border-b border-gray-100 py-4">
      <div className="max-w-7xl mx-auto px-4">
        <HorizontalScroll>
          {TOP_CATEGORIES.map(cat => (
            <Link key={cat.slug} to={`/category/${cat.slug}`}
              className="shrink-0 flex flex-col items-center gap-1.5 group w-[90px]">
              <div className="relative w-[70px] h-[70px] rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-[#C2185B] transition-colors">
                <img src={cat.image} alt={cat.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
              </div>
              <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight group-hover:text-[#C2185B] transition-colors">
                {cat.label}
              </span>
            </Link>
          ))}
        </HorizontalScroll>
      </div>
    </div>
  );
}

/* ── SECTION 2 — Hero Banner ─────────────────────────────────────────── */
function BeautyHeroBanner() {
  const [idx, setIdx] = useState(0);
  const total = HERO_SLIDES.length;

  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % total), 4500);
    return () => clearInterval(id);
  }, [total]);

  const s = HERO_SLIDES[idx];
  return (
    <div className="relative overflow-hidden" style={{ height: 280, maxHeight: '40vw' }}>
      {HERO_SLIDES.map((sl, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}>
          <img src={sl.bg} alt="" className="w-full h-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} />
          <div className={`absolute inset-0 bg-gradient-to-r ${sl.overlay}`} />
        </div>
      ))}
      <div className="relative z-10 flex items-center h-full max-w-7xl mx-auto px-8 gap-8">
        <div>
          {s.eyebrow && (
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded" style={{ background: PINK, color: '#fff' }}>{s.badge}</span>
              <span className={`text-[11px] font-medium ${s.textDark ? 'text-gray-600' : 'text-white/70'}`}>{s.eyebrow}</span>
            </div>
          )}
          <h1 className={`text-4xl sm:text-5xl font-black leading-none whitespace-pre-line mb-2 ${s.textDark ? 'text-gray-900' : 'text-white'}`}
            style={{ fontFamily: 'var(--font-heading)' }}>
            {s.title}
          </h1>
          <p className={`text-xl font-bold mb-1 ${s.textDark ? 'text-gray-800' : 'text-white'}`}>{s.offer}</p>
          {s.sub && <p className={`text-xs mb-4 ${s.textDark ? 'text-gray-500' : 'text-white/70'}`}>{s.sub}</p>}
          <Link to={s.link}
            className="inline-block text-white text-sm font-bold px-6 py-2.5 rounded-full shadow transition-opacity hover:opacity-90"
            style={{ background: PINK }}>
            {s.cta}
          </Link>
        </div>
      </div>
      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
        {HERO_SLIDES.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className="w-2 h-2 rounded-full transition-all"
            style={{ background: i === idx ? PINK : '#ccc' }} />
        ))}
      </div>
    </div>
  );
}

/* ── SECTION 3 — Exclusive Offers ───────────────────────────────────── */
function ExclusiveOffers() {
  return (
    <div className="border-y border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {EXCLUSIVE_OFFERS.map(o => (
            <Link key={o.code} to={o.link}
              className="flex flex-col gap-0.5 p-4 rounded-xl border border-pink-100 hover:border-[#C2185B] transition-colors"
              style={{ background: PINK_LIGHT }}>
              <span className="text-[11px] text-gray-500 font-medium uppercase tracking-widest">Use Code–</span>
              <span className="text-lg font-black tracking-widest" style={{ color: PINK }}>{o.code}</span>
              <span className="text-[12px] text-gray-600 leading-snug">{o.desc}</span>
              {o.sub && <span className="text-[11px] text-gray-400">{o.sub}</span>}
              <span className="mt-1 text-[11px] font-semibold underline underline-offset-2" style={{ color: PINK }}>View All Products</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── SECTION 4 — Brand Feature Banner (Dyson) ───────────────────────── */
function BrandFeatureBanner() {
  return (
    <div className="my-4">
      <Link to="/search?q=dyson" className="group block">
        <div className="relative overflow-hidden" style={{ height: 220 }}>
          <img
            src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1400&q=80"
            alt="Dyson"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent" />
          <div className="absolute inset-0 flex items-center px-8 sm:px-16">
            <div>
              <p className="text-2xl font-black tracking-[0.3em] text-gray-900 mb-1">dyson</p>
              <p className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">UP TO 30% OFF</p>
              <p className="text-lg font-bold text-gray-700">+ GET EXTRA <span className="text-[#C2185B]">₹2500 OFF</span></p>
              <div className="mt-3 inline-flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">USE CODE:</span>
                <span className="bg-gray-900 text-white font-black text-base px-4 py-1 rounded tracking-[0.2em]">LUXE</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ── SECTION 5 — Summer Scent Sale ──────────────────────────────────── */
function ScentSale() {
  return (
    <div className="py-8" style={{ background: 'linear-gradient(135deg, #fff5f8 0%, #fce4ec 100%)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] mb-1" style={{ color: PINK }}>Handpicked Just for You</p>
          <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>Summer Scent Sale</h2>
          <div className="mt-2 mx-auto w-12 h-[2px]" style={{ background: PINK }} />
        </div>
        <HorizontalScroll>
          {SCENT_BRANDS.map(b => (
            <Link key={b.label} to={`/category/${b.slug}`}
              className="shrink-0 group flex flex-col items-center"
              style={{ width: 150 }}>
              {/* Carnival-style card */}
              <div className="relative w-full rounded-xl overflow-hidden border-2 border-pink-200 group-hover:border-[#C2185B] transition-colors bg-white"
                style={{ height: 160 }}>
                <img src={b.image} alt={b.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {/* Discount badge */}
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <span className="inline-block text-white font-black text-[11px] px-2 py-0.5 rounded" style={{ background: PINK }}>
                    {b.discount}
                  </span>
                </div>
              </div>
              <span className="mt-2 text-[11px] font-semibold text-gray-700 text-center leading-tight group-hover:text-[#C2185B] transition-colors">
                {b.label}
              </span>
            </Link>
          ))}
        </HorizontalScroll>
        <div className="text-center mt-4">
          <Link to="/category/fragrances"
            className="inline-block text-sm font-bold px-8 py-2.5 rounded-full border-2 transition-colors hover:text-white"
            style={{ borderColor: PINK, color: PINK }}
            onMouseEnter={e => { e.currentTarget.style.background = PINK; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
            View All Fragrances →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── SECTION 6 — Full-width Brand Showcase Banner ───────────────────── */
function BrandShowcaseBanner() {
  return (
    <div className="my-4">
      <Link to="/category/fragrances" className="group block">
        <div className="relative overflow-hidden" style={{ height: 260 }}>
          <img
            src="https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1400&q=80"
            alt="Versace Crystal Emerald"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10,20,10,0.85) 40%, rgba(0,0,0,0.2) 100%)' }} />
          <div className="absolute inset-0 flex flex-col justify-end px-8 sm:px-16 pb-10">
            <p className="text-white/60 text-[11px] uppercase tracking-[0.3em] font-bold mb-1">VERSACE</p>
            <h2 className="text-white text-3xl sm:text-4xl font-black leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              CRYSTAL EMERALD
            </h2>
            <p className="text-white/70 text-sm font-medium mt-1 tracking-wider">MODERN FLORAL MUSKY</p>
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ── SECTION 7 — Beauty Gifting Guide (live products) ───────────────── */
function BeautyGiftingGuide({ onAddToBag }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories/beauty/products?limit=12&sort=newest')
      .then(r => r.json())
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data?.products ?? []);
        setProducts(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <SectionHead title="Beauty Gifting Guide" subtitle="Curated picks for every skin type" viewAllTo="/category/beauty" />
      <ProductCarousel products={products} loading={loading} withDrawer onAddToBag={onAddToBag} />
    </section>
  );
}

/* ── SECTION 8 — Shop By Summer Mood ────────────────────────────────── */
function ShopByMood() {
  return (
    <div className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-6">
          <p className="text-[11px] uppercase tracking-[0.3em] font-bold mb-1" style={{ color: PINK }}>SHOP BY</p>
          <h2 className="text-2xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>SUMMER MOOD</h2>
          <div className="mt-2 mx-auto w-12 h-[2px]" style={{ background: PINK }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {MOOD_CARDS.map(m => (
            <Link key={m.label} to={`/category/${m.slug}`}
              className="group relative overflow-hidden rounded-2xl" style={{ height: 280 }}>
              <img src={m.image} alt={m.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              {/* Pink bow decoration */}
              <div className="absolute top-3 right-3">
                <svg width="32" height="22" viewBox="0 0 32 22" fill="none">
                  <ellipse cx="10" cy="11" rx="9" ry="7" fill="#F48FB1" opacity="0.9"/>
                  <ellipse cx="22" cy="11" rx="9" ry="7" fill="#F48FB1" opacity="0.9"/>
                  <ellipse cx="16" cy="11" rx="4" ry="4" fill="#E91E8C"/>
                  <line x1="16" y1="15" x2="12" y2="22" stroke="#F48FB1" strokeWidth="2"/>
                  <line x1="16" y1="15" x2="20" y2="22" stroke="#F48FB1" strokeWidth="2"/>
                </svg>
              </div>
              <div className="absolute bottom-5 left-0 right-0 text-center">
                <p className="text-white font-bold text-lg whitespace-pre-line drop-shadow leading-tight">{m.label}</p>
                <span className="mt-2 inline-block text-[11px] font-bold px-4 py-1 rounded-full border border-white text-white group-hover:bg-white group-hover:text-[#C2185B] transition-colors">
                  Shop Now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── SECTION 9 — Heatproof Glam Banner ──────────────────────────────── */
function HeatproofGlamBanner() {
  return (
    <Link to="/category/makeup" className="group block my-4">
      <div className="relative overflow-hidden" style={{ height: 140 }}>
        <img
          src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1400&q=80"
          alt="Heatproof Glam"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(194,24,91,0.85) 0%, rgba(194,24,91,0.4) 60%, transparent 100%)' }} />
        <div className="absolute inset-0 flex items-center px-8 sm:px-16">
          <h2 className="text-white font-black tracking-[0.15em] text-3xl sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', textShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>
            H E A T P R O O F &nbsp; G L A M
          </h2>
        </div>
      </div>
    </Link>
  );
}

/* ── SECTION 10 — Beauty Brands Grid ────────────────────────────────── */
function BeautyBrandsGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <SectionHead title="Top Beauty Brands" viewAllTo="/category/beauty" />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {BEAUTY_BRANDS.map(b => (
          <Link key={b.name} to={`/search?q=${b.slug}`}
            className="group flex flex-col items-center rounded-xl overflow-hidden border border-gray-100 hover:border-[#C2185B] transition-colors"
            style={{ background: b.bg }}>
            <div className="w-full aspect-square overflow-hidden">
              <img src={b.image} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
            </div>
            <div className="p-2 text-center">
              <p className="text-xs font-black text-gray-900 uppercase tracking-wide">{b.name}</p>
              <p className="text-[11px] font-bold mt-0.5" style={{ color: PINK }}>{b.discount}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ── SECTION 11 — Build Your Routine ────────────────────────────────── */
function BuildRoutine() {
  return (
    <div className="py-10" style={{ background: PINK_LIGHT }}>
      <div className="max-w-7xl mx-auto px-4">
        <SectionHead title="Build Your Summer Routine" subtitle="6 simple steps to glowing skin" />
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {ROUTINE_STEPS.map(s => (
            <Link key={s.step} to={`/category/${s.slug}`}
              className="group flex flex-col items-center gap-2 text-center">
              <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden border-4 border-white shadow-md group-hover:scale-105 transition-transform">
                <img src={s.image} alt={s.label} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow"
                  style={{ background: s.color }}>
                  {s.step}
                </div>
              </div>
              <p className="text-[11px] font-semibold text-gray-700 group-hover:text-[#C2185B] transition-colors leading-tight">
                Step #{s.step}<br /><span className="text-gray-500 font-normal">{s.label}</span>
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── SECTION 12 — Summer Fragrance Bar ──────────────────────────────── */
function FragranceBar() {
  return (
    <div className="py-10" style={{ background: '#0D0D0D' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>Summer Fragrance Bar</h2>
          <p className="text-xs text-white/40 mt-1">Breezy florals, zesty citrus, and sun-kissed musks that feel like summer in a bottle.</p>
          <div className="mt-2 mx-auto w-12 h-[2px]" style={{ background: PINK }} />
        </div>
        <HorizontalScroll scrollAmount={280}>
          {FRAGRANCE_BRANDS.map(b => (
            <Link key={b.name} to={`/category/${b.slug}`}
              className="shrink-0 group flex flex-col items-center gap-2"
              style={{ width: 160 }}>
              <div className="w-full rounded-xl overflow-hidden border border-white/10 group-hover:border-[#C2185B] transition-colors"
                style={{ height: 180 }}>
                <img src={b.image} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              </div>
              <span className="text-[11px] font-semibold text-white/70 text-center leading-tight group-hover:text-white transition-colors">
                {b.name}
              </span>
            </Link>
          ))}
        </HorizontalScroll>
        <div className="text-center mt-6">
          <Link to="/category/fragrances"
            className="inline-block text-sm font-bold px-8 py-2.5 rounded-full border border-white/30 text-white hover:border-[#C2185B] hover:text-[#F48FB1] transition-colors">
            View All →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── SECTION 13 — Best-in-Show Brands ───────────────────────────────── */
function BestInShowBrands() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <SectionHead title="Best-in-Show Brands" subtitle="Icons of beauty, curated for you" />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {SHOW_BRANDS.map(b => (
          <Link key={b.name} to={`/search?q=${b.slug}`}
            className="group relative overflow-hidden rounded-xl border border-gray-100 hover:border-[#C2185B] transition-colors"
            style={{ height: 140 }}>
            <img src={b.image} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <span className="text-white font-black text-sm uppercase tracking-wider drop-shadow">{b.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ── MAIN PAGE ───────────────────────────────────────────────────────── */
export default function BeautyCategoryPage() {
  const addItem      = useCartStore((s) => s.addItem);
  const { addToast } = useToastStore();

  const handleAddToBag = useCallback((product) => {
    const finalPrice = calcFinalPrice(product.base_price, product.discount_pct);
    addItem({
      variantId: product.id,
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
  }, [addItem, addToast]);

  return (
    <>
      <Helmet>
        <title>Beauty – ShoppersHub</title>
        <meta name="description" content="Shop beauty online — Makeup, Skincare, Fragrance, Hair Care and more at ShoppersHub." />
      </Helmet>

      <div className="bg-white min-h-screen">
        {/* 1. Category icon strip */}
        <BeautyTopStrip />

        {/* 2. Hero banner carousel */}
        <BeautyHeroBanner />

        {/* 3. Exclusive offer codes */}
        <ExclusiveOffers />

        {/* 4. Dyson brand feature banner */}
        <BrandFeatureBanner />

        {/* 5. Summer Scent Sale horizontal scroll */}
        <ScentSale />

        {/* 6. Versace full-width brand showcase */}
        <BrandShowcaseBanner />

        {/* 7. Beauty Gifting Guide — live products */}
        <BeautyGiftingGuide onAddToBag={handleAddToBag} />

        {/* 8. Shop By Summer Mood */}
        <ShopByMood />

        {/* 9. Heatproof Glam banner */}
        <HeatproofGlamBanner />

        {/* 10. Top beauty brand tiles */}
        <BeautyBrandsGrid />

        {/* 11. Build Your Summer Routine */}
        <BuildRoutine />

        {/* 12. Summer Fragrance Bar */}
        <FragranceBar />

        {/* 13. Best-in-Show Brands */}
        <BestInShowBrands />
      </div>
    </>
  );
}
