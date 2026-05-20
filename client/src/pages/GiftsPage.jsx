import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ProductCarousel from '../components/home/ProductCarousel.jsx';
import { useCartStore } from '../store/cartStore.js';
import { useToastStore } from '../store/toastStore.js';
import { calcFinalPrice } from '../utils/calcDiscount.js';
import { assetUrl } from '../utils/assetUrl.js';

/* ─── DATA ─────────────────────────────────────────────────────────────────── */

const GIFT_PERSONAS = [
  {
    label: 'Culturally\nRooted Mom',
    sub: 'Gifts as timeless as her love',
    link: '/search?q=ethnic+gifts',
    image: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?auto=format&w=400&q=80',
  },
  {
    label: 'The Ritual\nQueen',
    sub: 'Thoughtful picks for her precious moments',
    link: '/search?q=beauty+gifts',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&w=400&q=80',
  },
  {
    label: 'Modern\nDiva Mom',
    sub: 'Give her the luxury she deserves',
    link: '/search?q=luxury+gifts',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&w=400&q=80',
  },
  {
    label: 'Jet-Set\nMom',
    sub: 'Travel-ready gifts, just like her',
    link: '/search?q=travel+gifts',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&w=400&q=80',
  },
  {
    label: 'The Go-Getter\nMom',
    sub: 'Gift the gear that keeps up with her hustle',
    link: '/search?q=corporate+gifts',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&w=400&q=80',
  },
];

const BUDGET_TIERS = [
  { label: 'UNDER', value: '₹999',  max: 999,  link: '/search?q=gifts&maxPrice=999' },
  { label: 'UNDER', value: '₹999',  max: 999,  link: '/search?q=gifts&maxPrice=999' },
  { label: 'UNDER', value: '₹1999', max: 1999, link: '/search?q=gifts&maxPrice=1999' },
  { label: 'UNDER', value: '₹2999', max: 2999, link: '/search?q=gifts&maxPrice=2999' },
  { label: 'UNDER', value: '₹3999', max: 3999, link: '/search?q=gifts&maxPrice=3999' },
  { label: 'UNDER', value: '₹4999', max: 4999, link: '/search?q=gifts&maxPrice=4999' },
];

const HOME_GIFT_TILES = [
  { label: 'Décor',       sub: 'UP TO 40% OFF',      link: '/category/home-decor',      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&w=400&q=80' },
  { label: 'Kitchenware', sub: 'FLAT 10-20% OFF',    link: '/category/kitchen',         image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&w=400&q=80' },
  { label: 'Cookware',    sub: 'UP TO 20% OFF',      link: '/category/cookware-bakeware',image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&w=400&q=80' },
  { label: 'Dinner Sets', sub: 'MIN. 20% OFF',       link: '/category/dinnerware',      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&w=400&q=80' },
  { label: 'Drinkware',   sub: 'UP TO 30% OFF',      link: '/category/drinkware',       image: 'https://images.unsplash.com/photo-1534650075489-c2f8c5e85b74?auto=format&w=400&q=80' },
];

const SPECIAL_ONES = [
  { label: 'For\nHIM',     link: '/search?q=men+gifts',        color: '#1A3A5C' },
  { label: 'For\nMOM',     link: '/search?q=women+gifts',      color: '#8B1A2F' },
  { label: 'For\nSIBLING', link: '/search?q=gifts',            color: '#D97706' },
  { label: 'For\nHER',     link: '/search?q=women+gifts',      color: '#BE185D' },
  { label: 'For\nDAD',     link: '/search?q=men+gifts',        color: '#065F46' },
  { label: 'For\nBESTIE', link: '/search?q=gifts',             color: '#7C3AED' },
];

/* ─── SHARED ────────────────────────────────────────────────────────────────── */

function SectionHead({ title, titleBold, subtitle }) {
  return (
    <div className="text-center mb-7">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
        {title}{titleBold && <span className="font-black"> {titleBold}</span>}
      </h2>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      <div className="mt-2 mx-auto w-10 h-[2px] bg-[#8B1A2F]" />
    </div>
  );
}

function HScroll({ children, gap = 4 }) {
  const ref = useRef(null);
  const scroll = d => ref.current?.scrollBy({ left: d * 300, behavior: 'smooth' });
  return (
    <div className="relative group/hs">
      <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border border-gray-200 shadow rounded-full flex items-center justify-center text-gray-600 opacity-0 group-hover/hs:opacity-100 transition-opacity">‹</button>
      <div ref={ref} className={`flex gap-${gap} overflow-x-auto pb-1`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {children}
      </div>
      <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border border-gray-200 shadow rounded-full flex items-center justify-center text-gray-600 opacity-0 group-hover/hs:opacity-100 transition-opacity">›</button>
    </div>
  );
}

/* ─── SECTION 1 — Hero Banner ────────────────────────────────────────────────── */
function HeroBanner() {
  const [slides, setSlides] = useState([
    {
      image: 'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&w=1600&q=90',
      eyebrow: 'Special Collection',
      title: 'GIFTS\nOF LOVE',
      sub: 'Shop From 500+ Premium Brands',
      cta: 'SHOP NOW',
      link: '/search?q=gifts',
      align: 'right',
      accent: '#C9A84C',
    },
    {
      image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&w=1600&q=90',
      eyebrow: 'For Every Occasion',
      title: 'THE PERFECT\nGIFT AWAITS',
      sub: 'Curated selections for every personality',
      cta: 'EXPLORE NOW',
      link: '/search?q=gifts',
      align: 'left',
      accent: '#8B1A2F',
    },
  ]);
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    fetch('/api/banners/gifts').then(r => r.json()).then(({ data }) => {
      if (Array.isArray(data) && data.length > 0) {
        setSlides(data.map(b => ({
          image: b.image_url,
          eyebrow: b.eyebrow || '',
          title: b.title || '',
          sub: b.subtitle || '',
          cta: 'SHOP NOW',
          link: b.link || '/search?q=gifts',
          align: b.align || 'right',
          accent: '#C9A84C',
        })));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setCur(c => (c + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  const sl = slides[cur];
  const isRight = sl?.align === 'right';

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: 'clamp(300px, 45vw, 520px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((b, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === cur ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <img src={b.image} alt={b.eyebrow} className="w-full h-full object-cover object-top" loading={i === 0 ? 'eager' : 'lazy'} />
          <div className={`absolute inset-0 ${isRight ? 'bg-gradient-to-l from-black/70 via-black/30 to-transparent' : 'bg-gradient-to-r from-black/70 via-black/30 to-transparent'}`} />
        </div>
      ))}

      {/* Content */}
      <div className={`absolute inset-0 z-20 flex items-center ${isRight ? 'justify-end' : 'justify-start'} px-10 sm:px-16 lg:px-24`}>
        <div className={`max-w-sm ${isRight ? 'text-right' : 'text-left'}`}>
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-3" style={{ color: sl?.accent || '#C9A84C' }}>
            {sl?.eyebrow}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-3 whitespace-pre-line"
            style={{ fontFamily: 'var(--font-heading)' }}>
            {sl?.title}
          </h1>
          <p className="text-white/70 text-sm mb-6">{sl?.sub}</p>
          <Link to={sl?.link || '/search?q=gifts'}
            className="inline-block px-8 py-3 font-bold text-[11px] uppercase tracking-widest border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-colors">
            {sl?.cta}
          </Link>
        </div>
      </div>

      {/* Arrows */}
      <button onClick={() => setCur(c => (c - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-black/30 hover:bg-black/50 text-white flex items-center justify-center text-xl transition-colors">‹</button>
      <button onClick={() => setCur(c => (c + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-black/30 hover:bg-black/50 text-white flex items-center justify-center text-xl transition-colors">›</button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCur(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === cur ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />
        ))}
      </div>
    </div>
  );
}

/* ─── SECTION 2 — Gift Personas ──────────────────────────────────────────────── */
function GiftPersonas() {
  return (
    <section className="bg-[#f5f0eb] py-10">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHead title="The Most Beautiful Thank You" subtitle="Gifts That Say It All at Up To 50% Off" />
        <HScroll gap={5}>
          {GIFT_PERSONAS.map(p => (
            <Link key={p.label} to={p.link}
              className="group shrink-0 flex flex-col items-center text-center gap-3"
              style={{ width: 160 }}>
              <div className="relative w-[130px] h-[160px] overflow-hidden rounded-xl border-2 border-transparent group-hover:border-[#8B1A2F] transition-colors shadow-md">
                <img src={p.image} alt={p.label.replace('\n', ' ')}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-400" loading="lazy" />
                {/* Gold corner decoration */}
                <div className="absolute top-0 left-0 w-0 h-0 border-l-[20px] border-l-[#C9A84C] border-b-[20px] border-b-transparent" />
                <div className="absolute top-0 right-0 w-0 h-0 border-r-[20px] border-r-[#C9A84C] border-b-[20px] border-b-transparent" />
                <div className="absolute bottom-0 left-0 w-0 h-0 border-l-[20px] border-l-[#C9A84C] border-t-[20px] border-t-transparent" />
                <div className="absolute bottom-0 right-0 w-0 h-0 border-r-[20px] border-r-[#C9A84C] border-t-[20px] border-t-transparent" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-gray-900 leading-snug whitespace-pre-line group-hover:text-[#8B1A2F] transition-colors">
                  {p.label}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{p.sub}</p>
              </div>
            </Link>
          ))}
        </HScroll>
      </div>
    </section>
  );
}

/* ─── SECTION 3 — Gift Sets Banner ───────────────────────────────────────────── */
function GiftSetsBanner() {
  return (
    <Link to="/search?q=gift+sets" className="group block">
      <div className="relative overflow-hidden" style={{ height: 180 }}>
        <img
          src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&w=1600&q=80"
          alt="Gift Sets"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#B5451B]/90 via-[#C9520E]/70 to-[#E07B2A]/50" />
        {/* Decorative danglers */}
        <div className="absolute top-0 left-8 flex flex-col items-center">
          <div className="w-px h-8 bg-[#C9A84C]" />
          <div className="w-5 h-5 rounded-full bg-[#C9A84C] flex items-center justify-center">
            <div className="w-3 h-3 rounded-full border-2 border-white" />
          </div>
        </div>
        <div className="absolute top-0 right-8 flex flex-col items-center">
          <div className="w-px h-10 bg-[#C9A84C]" />
          <div className="w-5 h-5 rounded-full bg-[#C9A84C] flex items-center justify-center">
            <div className="w-3 h-3 rounded-full border-2 border-white" />
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-white/80 text-[10px] uppercase tracking-[0.4em] font-semibold mb-1">Exclusive</p>
          <h2 className="text-5xl sm:text-6xl font-black italic text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Gift Sets
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-px bg-white/50" />
            <span className="inline-block px-6 py-2 border-2 border-white text-white font-bold text-[11px] uppercase tracking-widest group-hover:bg-white group-hover:text-gray-900 transition-colors">
              SHOP NOW
            </span>
            <div className="w-12 h-px bg-white/50" />
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── SECTION 4 — Gifts For Every Budget ─────────────────────────────────────── */
function GiftsForBudget() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <SectionHead title="Gifts For Every Budget" />
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {BUDGET_TIERS.map((t, i) => (
          <Link key={i} to={t.link}
            className="group flex flex-col items-center justify-center gap-1 py-6 bg-white border-2 border-[#8B1A2F]/20 hover:border-[#8B1A2F] hover:bg-[#8B1A2F] transition-all duration-200 rounded-lg shadow-sm hover:shadow-md">
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400 group-hover:text-white/70 transition-colors">
              {t.label}
            </p>
            <p className="text-2xl font-black text-[#8B1A2F] group-hover:text-white transition-colors leading-none">
              {t.value}
            </p>
            <div className="w-4 h-4 rounded-full border-2 border-[#8B1A2F]/30 group-hover:border-white/50 flex items-center justify-center mt-1 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-[#8B1A2F]/40 group-hover:bg-white/60 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ─── SECTION 5 — Wedding Season Banner ─────────────────────────────────────── */
function WeddingBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-4">
      <SectionHead title="Head Into" titleBold="The Wedding Season" />
      <Link to="/search?q=wedding+gifts" className="group block">
        <div className="relative overflow-hidden rounded-xl" style={{ height: 260 }}>
          <img
            src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&w=1400&q=80"
            alt="Wedding Season"
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* Decorative bells */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-12 pointer-events-none">
            {['-12', '12'].map((x, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-px h-6 bg-[#C9A84C]" />
                <svg width="24" height="28" viewBox="0 0 24 28" fill="#C9A84C">
                  <path d="M12 2C8 2 5 5 5 9v8l-2 3h18l-2-3V9c0-4-3-7-7-7z"/>
                  <ellipse cx="12" cy="22" rx="3" ry="2.5" fill="#B8963E"/>
                  <circle cx="12" cy="25" r="1.5" fill="#B8963E"/>
                </svg>
              </div>
            ))}
          </div>

          <div className="absolute inset-0 bg-gradient-to-l from-[#FFF8F0]/95 via-[#FFF8F0]/60 to-transparent" />
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-right max-w-[240px]">
            <h3 className="text-5xl font-black italic text-[#8B1A2F] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              Wedding
            </h3>
            <p className="text-gray-600 text-sm font-medium mb-4">Big Surprises For Their Big Day</p>
            <span className="inline-block px-6 py-2.5 bg-[#8B1A2F] text-white font-bold text-[11px] uppercase tracking-widest group-hover:bg-[#6d1424] transition-colors">
              SHOP NOW
            </span>
          </div>
          {/* Floral decorations */}
          <div className="absolute bottom-4 right-[240px] text-4xl pointer-events-none select-none opacity-60">🌻</div>
          <div className="absolute bottom-0 left-4 text-3xl pointer-events-none select-none opacity-40">🌿</div>
        </div>
      </Link>
    </section>
  );
}

/* ─── SECTION 6 — Luxe Surprises ────────────────────────────────────────────── */
function LuxeSurprises() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-4">
      <SectionHead title="Luxe Surprises" />
      <Link to="/luxe" className="group block">
        <div className="relative overflow-hidden rounded-xl" style={{ height: 200 }}>
          <div className="absolute inset-0 grid grid-cols-2">
            {/* Left — product */}
            <div className="relative overflow-hidden bg-[#D4B896]">
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&w=600&q=80"
                alt="Luxe watch"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#FBEEE0]/30" />
            </div>
            {/* Right — text */}
            <div className="bg-[#FBEEE0] flex flex-col items-start justify-center px-8">
              <p className="text-gray-400 text-[10px] uppercase tracking-widest font-semibold mb-1">Golden Times Of Celebration</p>
              {/* Brand logos */}
              <div className="flex items-center gap-3 mb-4">
                <span className="font-black text-gray-900 text-sm tracking-wider border border-gray-900 px-2 py-0.5">AX</span>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-gray-800 leading-none">ARMANI EXCHANGE</p>
                  <p className="text-[10px] text-gray-500 leading-none">MICHAEL KORS</p>
                </div>
                <span className="text-gray-400 text-xs">& More</span>
              </div>
              <span className="inline-block px-6 py-2.5 bg-gray-900 text-white font-bold text-[11px] uppercase tracking-widest group-hover:bg-gray-700 transition-colors">
                SHOP NOW
              </span>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}

/* ─── SECTION 7 — Products Carousel ─────────────────────────────────────────── */
function GiftProducts({ onAddToBag }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products/search?q=gifts&limit=10')
      .then(r => r.json())
      .then(({ data }) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && !products.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <SectionHead title="Handpicked Gifts" subtitle="Curated with love for every occasion" />
      <ProductCarousel products={products} loading={loading} withDrawer onAddToBag={onAddToBag} />
    </section>
  );
}

/* ─── SECTION 8 — Gifts That Feel Like Home ──────────────────────────────────── */
function HomeGifts() {
  const ref = useRef(null);
  const scroll = d => ref.current?.scrollBy({ left: d * 280, behavior: 'smooth' });

  return (
    <section className="py-10 bg-[#f5f0eb]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Label */}
          <div className="shrink-0 flex items-center justify-center sm:w-[160px] sm:h-[200px]">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-black text-gray-900 leading-snug" style={{ fontFamily: 'var(--font-heading)' }}>
                Gifts That<br />
                <span className="text-[#8B1A2F]">Feel Like</span><br />
                Home
              </p>
            </div>
          </div>

          {/* Scrollable tiles */}
          <div className="flex-1 relative group/hs">
            <button onClick={() => scroll(-1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-200 shadow rounded-full flex items-center justify-center text-gray-600 opacity-0 group-hover/hs:opacity-100 transition-opacity">‹</button>
            <div ref={ref} className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {HOME_GIFT_TILES.map(tile => (
                <Link key={tile.label} to={tile.link}
                  className="group shrink-0 relative overflow-hidden rounded-xl"
                  style={{ width: 170, height: 200 }}>
                  <img src={tile.image} alt={tile.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-bold text-sm leading-tight">{tile.label}</p>
                    <p className="text-[#FFD700] font-bold text-[11px] mt-0.5">{tile.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
            <button onClick={() => scroll(1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-200 shadow rounded-full flex items-center justify-center text-gray-600 opacity-0 group-hover/hs:opacity-100 transition-opacity">›</button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── SECTION 9 — Gifts For Your Special Ones ────────────────────────────────── */
function SpecialOnes() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <SectionHead title="Gifts For" titleBold="Your Special Ones" />
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {SPECIAL_ONES.map(s => (
          <Link key={s.label} to={s.link}
            className="group flex flex-col items-center gap-3">
            {/* Gift box illustration */}
            <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow"
              style={{ background: s.color }}>
              {/* Box body */}
              <div className="absolute inset-x-3 bottom-3 top-1/2 rounded-sm" style={{ background: `${s.color}cc` }}>
                <div className="absolute inset-0 rounded-sm border-2 border-white/20" />
              </div>
              {/* Lid */}
              <div className="absolute inset-x-2 top-[38%] h-[22%] rounded-sm" style={{ background: s.color }}>
                <div className="absolute inset-0 rounded-sm border-2 border-white/30" />
              </div>
              {/* Ribbon vertical */}
              <div className="absolute left-1/2 -translate-x-1/2 top-[38%] bottom-3 w-[10%] bg-white/40 rounded-sm" />
              {/* Ribbon horizontal on lid */}
              <div className="absolute inset-x-2 top-[48%] h-[6%] bg-white/40 rounded-sm" />
              {/* Bow */}
              <div className="absolute top-[28%] left-1/2 -translate-x-1/2 flex gap-1">
                <div className="w-5 h-4 rounded-full border-[3px] border-white/70" style={{ borderRadius: '50% 50% 0 50%', transform: 'rotate(-30deg)' }} />
                <div className="w-5 h-4 rounded-full border-[3px] border-white/70" style={{ borderRadius: '50% 50% 50% 0', transform: 'rotate(30deg)' }} />
              </div>
              {/* Shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20" />
            </div>
            <span className="text-[11px] font-bold text-gray-800 text-center whitespace-pre-line leading-tight group-hover:text-[#8B1A2F] transition-colors">
              {s.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ─── SECTION 10 — Gift Cards ────────────────────────────────────────────────── */
function GiftCards() {
  return (
    <Link to="/search?q=gift+cards" className="group block">
      <div className="relative overflow-hidden" style={{ height: 180 }}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#F5C842] via-[#E8A500] to-[#D4920A]" />

        {/* Card illustration */}
        <div className="absolute left-1/3 top-1/2 -translate-y-1/2 -translate-x-1/2">
          <div className="relative w-[120px] h-[80px] rounded-xl shadow-2xl overflow-hidden transform -rotate-6 group-hover:rotate-0 transition-transform duration-500"
            style={{ background: 'linear-gradient(135deg, #8B1A2F, #C43A58)' }}>
            <div className="absolute inset-0 flex flex-col justify-between p-3">
              <div className="text-white text-[8px] font-bold uppercase tracking-widest">ShoppersHub</div>
              <div className="text-white/80 text-[7px]">Gift Card</div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20" />
          </div>
        </div>

        {/* Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-gray-900/50 text-[10px] uppercase tracking-[0.4em] font-bold mb-1">ShoppersHub</p>
          <h2 className="text-5xl sm:text-6xl font-black italic text-gray-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Gift Cards
          </h2>
          <p className="text-gray-700 text-sm font-medium mb-4">Handpicked Treasure Troves</p>
          <span className="inline-block px-8 py-3 bg-[#8B1A2F] text-white font-bold text-[11px] uppercase tracking-widest group-hover:bg-[#6d1424] transition-colors shadow-lg">
            SHOP NOW
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── MAIN PAGE ───────────────────────────────────────────────────────────────── */
export default function GiftsPage() {
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
        <title>Gifts — ShoppersHub</title>
        <meta name="description" content="Shop the perfect gifts for every occasion and every budget at ShoppersHub. 500+ premium brands, gift sets, wedding gifts, and more." />
      </Helmet>

      <div className="bg-white min-h-screen">
        {/* 1 — Hero Banner */}
        <HeroBanner />

        {/* 2 — Gift Personas */}
        <GiftPersonas />

        {/* 3 — Gift Sets full-width banner */}
        <GiftSetsBanner />

        {/* 4 — Gifts For Every Budget */}
        <GiftsForBudget />

        {/* 5 — Wedding Season */}
        <WeddingBanner />

        {/* 6 — Luxe Surprises */}
        <LuxeSurprises />

        {/* 7 — Product carousel */}
        <GiftProducts onAddToBag={handleAddToBag} />

        {/* 8 — Home Gifts */}
        <HomeGifts />

        {/* 9 — Gifts For Your Special Ones */}
        <SpecialOnes />

        {/* 10 — Gift Cards full-width */}
        <GiftCards />
      </div>
    </>
  );
}
