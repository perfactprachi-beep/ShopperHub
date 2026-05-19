import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ProductCarousel from '../components/home/ProductCarousel.jsx';
import PromoOfferBar from '../components/home/PromoOfferBar.jsx';

/* ── Static data ─────────────────────────────────────────────────────────── */
const WOMEN_SECTIONS = [
  {
    id: 'western-wear', slug: 'western-wear', name: 'Western Wear',
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&w=800&q=80',
    sub: 'Tops · Shirts · Jeans · Co-Ord Sets',
  },
  {
    id: 'ethnic-wear', slug: 'ethnic-wear', name: 'Ethnic Wear',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&w=800&q=80',
    sub: 'Kurtas · Sarees · Lehengas · Suits',
  },
  {
    id: 'dresses-jumpsuits', slug: 'dresses-jumpsuits', name: 'Dresses',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&w=800&q=80',
    sub: 'Casual · Party · Maxi · Jumpsuits',
  },
  {
    id: 'activewear', slug: 'activewear', name: 'Activewear',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&w=800&q=80',
    sub: 'Sports Tops · Leggings · Sports Bras',
  },
  {
    id: 'footwear', slug: 'footwear', name: 'Footwear',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&w=800&q=80',
    sub: 'Heels · Flats · Sneakers · Boots',
  },
  {
    id: 'handbags-accessories', slug: 'handbags-accessories', name: 'Handbags',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&w=800&q=80',
    sub: 'Handbags · Clutches · Jewellery',
  },
  {
    id: 'winterwear', slug: 'winterwear', name: 'Winterwear',
    image: 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&w=800&q=80',
    sub: 'Sweaters · Jackets · Shawls',
  },
  {
    id: 'innerwear-sleepwear', slug: 'innerwear-sleepwear', name: 'Innerwear',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&w=800&q=80',
    sub: 'Bras · Panties · Nightwear',
  },
];

const HERO_BANNERS = [
  {
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&w=1600&q=90',
    eyebrow: 'New Season',
    title: 'Fashion\nForward',
    sub: 'Fresh styles for every woman',
    cta: 'Shop Women',
    link: '/category/western-wear',
    align: 'left',
  },
  {
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&w=1600&q=90',
    eyebrow: 'Ethnic Carnival',
    title: 'Celebrate\nTradition',
    sub: 'Kurtas · Sarees · Lehengas · Suits',
    cta: 'Shop Ethnic',
    link: '/category/ethnic-wear',
    align: 'right',
  },
  {
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&w=1600&q=90',
    eyebrow: 'New Arrivals',
    title: 'Dress\nTo Impress',
    sub: 'Casual · Party · Maxi Dresses',
    cta: 'Shop Dresses',
    link: '/category/dresses-jumpsuits',
    align: 'left',
  },
];

const FEATURED_BRANDS = [
  { name: 'AND',            slug: 'and',            label: 'Contemporary Women',  image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&w=600&q=80' },
  { name: 'Allen Solly',    slug: 'allen-solly',    label: 'Smart Casual',        image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&w=600&q=80' },
  { name: 'Calvin Klein',   slug: 'calvin-klein',   label: 'Minimalist Luxury',   image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&w=600&q=80' },
  { name: "Levi's",         slug: 'levis',          label: 'Denim Essentials',    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&w=600&q=80' },
  { name: 'Tommy Hilfiger', slug: 'tommy-hilfiger', label: 'Premium Lifestyle',   image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&w=600&q=80' },
  { name: 'Puma',           slug: 'puma',           label: 'Active & Sport',      image: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?auto=format&w=600&q=80' },
];

const BEAUTY_CARDS = [
  { name: 'Skincare',    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&w=600&q=80', sub: 'Cleansers · Serums · Moisturisers' },
  { name: 'Makeup',      image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&w=600&q=80', sub: 'Foundation · Lipstick · Eyeshadow' },
  { name: 'Fragrances',  image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&w=600&q=80', sub: 'Floral · Woody · Oriental' },
];

const TRUST = [
  {
    label: 'Free Delivery',
    sub: 'On orders above ₹499',
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  },
  {
    label: 'Easy Returns',
    sub: '30-day hassle-free returns',
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.49"/></svg>,
  },
  {
    label: '100% Genuine',
    sub: 'Authentic branded products',
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  },
  {
    label: 'Secure Payments',
    sub: 'Multiple safe payment options',
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  },
];

/* ── Hero Banner Carousel ─────────────────────────────────────────────────── */
function HeroBanner() {
  const [slides, setSlides] = useState(HERO_BANNERS);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    fetch('/api/banners/women')
      .then(r => r.json())
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data.map(b => ({
            image: b.image_url, eyebrow: b.eyebrow || '', title: b.title || '',
            sub: b.subtitle || '', cta: 'Shop Now', link: b.link || '/category/women',
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
      style={{ height: 'calc(100vh - 138px)', minHeight: 460, maxHeight: 700 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((b, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <img src={b.image} alt={b.eyebrow} className="w-full h-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} />
          <div className={`absolute inset-0 ${isRight ? 'bg-gradient-to-l from-black/70 via-black/30 to-black/5' : 'bg-gradient-to-r from-black/70 via-black/30 to-black/5'}`} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        </div>
      ))}

      <div className={`absolute inset-0 z-20 flex items-center ${isRight ? 'justify-end' : 'justify-start'}`}>
        <div className={`px-10 sm:px-16 lg:px-24 max-w-xl ${isRight ? 'text-right' : 'text-left'}`}>
          <p className="text-white/70 text-[10px] uppercase tracking-[0.5em] font-bold mb-3">{slide.eyebrow}</p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4 whitespace-pre-line" style={{ fontFamily: 'var(--font-heading, Georgia)' }}>
            {slide.title}
          </h1>
          <p className="text-white/60 text-sm mb-8 tracking-wide">{slide.sub}</p>
          <Link to={slide.link} className="inline-block px-10 py-3.5 bg-[#8B1A2F] text-white text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-[#6d1424] transition-colors duration-200">
            {slide.cta}
          </Link>
        </div>
      </div>

      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors" aria-label="Previous">
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors" aria-label="Next">
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`transition-all duration-300 h-[3px] rounded-full ${i === current ? 'w-8 bg-[#8B1A2F]' : 'w-3 bg-white/40'}`} aria-label={`Slide ${i + 1}`} />
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
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-5">Shop by Category</h2>
        <div className="relative group/row">
          <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 shadow text-gray-500 opacity-0 group-hover/row:opacity-100 transition-opacity" aria-label="Scroll left">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div ref={rowRef} className="flex gap-5 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            {WOMEN_SECTIONS.map(s => (
              <button key={s.id} onClick={() => document.getElementById(`women-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="shrink-0 flex flex-col items-center gap-2 group/tile">
                <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden border-2 border-transparent group-hover/tile:border-[#8B1A2F] transition-colors duration-200">
                  <img src={s.image} alt={s.name} className="w-full h-full object-cover transition-transform duration-300 group-hover/tile:scale-110" loading="lazy" />
                </div>
                <span className="text-[11px] font-semibold text-gray-700 whitespace-nowrap group-hover/tile:text-[#8B1A2F] transition-colors duration-200">{s.name}</span>
              </button>
            ))}
          </div>
          <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 shadow text-gray-500 opacity-0 group-hover/row:opacity-100 transition-opacity" aria-label="Scroll right">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Sticky Sub-nav ───────────────────────────────────────────────────────── */
function SubNav({ active }) {
  const navRef = useRef(null);
  useEffect(() => {
    if (!active || !navRef.current) return;
    navRef.current.querySelector(`[data-id="${active}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [active]);

  return (
    <div className="sticky top-[138px] z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div ref={navRef} className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
          {WOMEN_SECTIONS.map(s => (
            <button
              key={s.id}
              data-id={s.id}
              onClick={() => document.getElementById(`women-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className={`shrink-0 px-5 py-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                active === s.id ? 'border-[#8B1A2F] text-[#8B1A2F]' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
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

/* ── Ethnic Carnival Editorial Banner ─────────────────────────────────────── */
function EthnicCarnivalBanner() {
  return (
    <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a3a1a 0%, #2d5a2d 50%, #1a3a1a 100%)' }}>
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A84C' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
      <div className="relative max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Text */}
        <div>
          <p className="text-[#C9A84C] text-[10px] uppercase tracking-[0.5em] font-bold mb-3">Limited Time</p>
          <h2 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-3 whitespace-pre-line" style={{ fontFamily: 'var(--font-heading, Georgia)' }}>
            The Ethnic{'\n'}Carnival
          </h2>
          <p className="text-white/60 text-sm mb-2 tracking-wide">Kashmiri · BIBA · Stop & More</p>
          <p className="text-[#C9A84C] text-3xl font-bold mb-6">Up to 50% Off</p>
          <p className="text-white/50 text-xs mb-8">Use code <span className="text-[#C9A84C] font-bold tracking-widest">ETHNIC350</span> for ₹350 off on ₹2000+</p>
          <Link to="/category/ethnic-wear" className="inline-block px-10 py-3.5 border border-[#C9A84C] text-[#C9A84C] text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-[#C9A84C] hover:text-black transition-all duration-200">
            Shop Now
          </Link>
        </div>
        {/* Image grid */}
        <div className="grid grid-cols-3 gap-3 h-72">
          {[
            'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&w=400&q=80',
            'https://images.unsplash.com/photo-1583391733956-6c78276477e1?auto=format&w=400&q=80',
            'https://images.unsplash.com/photo-1617627143233-46ef90f975f7?auto=format&w=400&q=80',
          ].map((src, i) => (
            <div key={i} className={`relative overflow-hidden rounded ${i === 1 ? 'mt-6' : ''}`}>
              <img src={src} alt="Ethnic wear" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
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
    <div className="py-14 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#8B1A2F] font-bold mb-1">Top Picks</p>
            <h2 className="text-2xl font-bold text-gray-900">Featured Brands</h2>
            <div className="mt-2 w-10 h-[3px] bg-[#8B1A2F]" />
          </div>
          <Link to="/brands" className="text-[11px] font-bold uppercase tracking-wider text-[#8B1A2F] border border-[#8B1A2F] px-5 py-2.5 hover:bg-[#8B1A2F] hover:text-white transition-colors duration-200">
            All Brands
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {FEATURED_BRANDS.map(b => (
            <Link key={b.slug} to={`/brand/${b.slug}`} className="group relative overflow-hidden rounded-lg aspect-[3/4]">
              <img src={b.image} alt={b.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-[13px] font-bold leading-tight">{b.name}</p>
                <p className="text-white/60 text-[10px] mt-0.5">{b.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── New Arrivals Banner ──────────────────────────────────────────────────── */
function NewArrivalsBanner() {
  return (
    <div className="relative overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&w=1600&q=80"
        alt="New Arrivals"
        className="w-full h-64 object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
      <div className="absolute inset-0 flex items-center px-10 sm:px-16">
        <div>
          <p className="text-white/60 text-[10px] uppercase tracking-[0.5em] font-bold mb-2">Just Dropped</p>
          <h3 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'var(--font-heading, Georgia)' }}>
            New<br />Arrivals
          </h3>
          <Link to="/category/women" className="inline-block px-8 py-3 bg-white text-gray-900 text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-[#8B1A2F] hover:text-white transition-colors duration-200">
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Beauty Inside-Out Teaser ─────────────────────────────────────────────── */
function BeautyTeaser() {
  return (
    <div className="py-14 bg-[#FDF6F0] border-y border-[#f0e6e0]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#8B1A2F] font-bold mb-1">Glow Up</p>
            <h2 className="text-2xl font-bold text-gray-900">Beauty Inside-Out</h2>
            <div className="mt-2 w-10 h-[3px] bg-[#8B1A2F]" />
          </div>
          <Link to="/category/beauty" className="text-[11px] font-bold uppercase tracking-wider text-[#8B1A2F] border border-[#8B1A2F] px-5 py-2.5 hover:bg-[#8B1A2F] hover:text-white transition-colors duration-200">
            Shop Beauty
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {BEAUTY_CARDS.map(c => (
            <Link key={c.name} to="/category/beauty" className="group relative overflow-hidden rounded-xl" style={{ height: 280 }}>
              <img src={c.image} alt={c.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-white font-bold text-lg leading-tight">{c.name}</p>
                <p className="text-white/60 text-xs mt-1">{c.sub}</p>
                <p className="text-[#C9A84C] text-[10px] font-bold uppercase tracking-widest mt-3 group-hover:translate-x-1 transition-transform duration-200">
                  Explore →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Luxe Teaser Strip ────────────────────────────────────────────────────── */
function LuxeStrip() {
  const BRANDS = ['VALENTINO', 'COACH', 'TOM FORD', 'SWAROVSKI', 'VERSACE', 'BURBERRY', 'EMPORIO ARMANI', 'GUCCI', 'TORY BURCH'];
  const items = [...BRANDS, ...BRANDS];
  return (
    <div className="bg-[#0D0D0D] border-y border-white/5 py-10">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="shrink-0">
          <p className="text-[#C9A84C] text-[9px] uppercase tracking-[0.5em] font-bold mb-1">Premium Collection</p>
          <h3 className="text-white text-2xl font-bold" style={{ fontFamily: 'var(--font-heading, Georgia)' }}>Discover Luxe</h3>
          <p className="text-white/40 text-xs mt-1">World's finest luxury brands</p>
          <Link to="/luxe" className="inline-block mt-4 px-7 py-2.5 border border-[#C9A84C] text-[#C9A84C] text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#C9A84C] hover:text-black transition-all duration-200">
            Switch to Luxe
          </Link>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-10 whitespace-nowrap" style={{ animation: 'womenLuxeTicker 30s linear infinite' }}>
            {items.map((b, i) => (
              <span key={i} className="text-white/25 text-[13px] font-bold tracking-[0.2em] uppercase hover:text-[#C9A84C] transition-colors cursor-default">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes womenLuxeTicker{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

/* ── Individual Product Section ───────────────────────────────────────────── */
function WomenSection({ section }) {
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
    <section id={`women-${section.id}`} ref={sectionRef} className="py-12 border-b border-gray-100 last:border-0">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#8B1A2F] font-bold mb-1">Women's</p>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">{section.name}</h2>
            <div className="mt-2 w-10 h-[3px] bg-[#8B1A2F]" />
            <p className="text-sm text-gray-400 mt-2">{section.sub}</p>
          </div>
          <Link to={`/category/${section.slug}`} className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-[#8B1A2F] border border-[#8B1A2F] px-5 py-2.5 hover:bg-[#8B1A2F] hover:text-white transition-colors duration-200">
            View All
          </Link>
        </div>
        <ProductCarousel products={products} loading={loading} withDrawer />
        {fetched && !loading && products.length === 0 && (
          <p className="text-gray-400 text-sm py-10 text-center">
            No products yet.{' '}
            <Link to={`/category/${section.slug}`} className="text-[#8B1A2F] underline">Browse all women's</Link>
          </p>
        )}
      </div>
    </section>
  );
}

/* ── Main ─────────────────────────────────────────────────────────────────── */
export default function WomenPage() {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observers = [];
    WOMEN_SECTIONS.forEach(s => {
      const el = document.getElementById(`women-${s.id}`);
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

  /* Split sections around editorial breaks */
  const firstThree = WOMEN_SECTIONS.slice(0, 3);  // western, ethnic, dresses
  const nextTwo    = WOMEN_SECTIONS.slice(3, 5);  // activewear, footwear
  const lastThree  = WOMEN_SECTIONS.slice(5);     // handbags, winterwear, innerwear

  return (
    <>
      <Helmet>
        <title>Women's Fashion – ShoppersHub</title>
        <meta name="description" content="Shop women's clothing, ethnic wear, dresses, footwear & accessories online. Top brands with great discounts." />
      </Helmet>

      <div className="bg-white min-h-screen">
        {/* ── Hero ── */}
        <HeroBanner />

        {/* ── Promo offer codes ── */}
        <PromoOfferBar />

        {/* ── Category tiles ── */}
        <CategoryTiles />

        {/* ── Sticky subnav ── */}
        <SubNav active={activeId} />

        {/* ── Western Wear + Ethnic Carnival ── */}
        <WomenSection section={WOMEN_SECTIONS[0]} />
        <EthnicCarnivalBanner />
        <WomenSection section={WOMEN_SECTIONS[1]} />
        <WomenSection section={WOMEN_SECTIONS[2]} />

        {/* ── Featured Brands ── */}
        <FeaturedBrands />

        {/* ── Activewear + New Arrivals ── */}
        <WomenSection section={WOMEN_SECTIONS[3]} />
        <NewArrivalsBanner />
        <WomenSection section={WOMEN_SECTIONS[4]} />

        {/* ── Beauty Teaser ── */}
        <BeautyTeaser />

        {/* ── Handbags, Winterwear, Innerwear ── */}
        {lastThree.map(s => <WomenSection key={s.id} section={s} />)}

        {/* ── Luxe Strip ── */}
        <LuxeStrip />

        {/* ── Trust strip ── */}
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
