import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ProductCarousel from '../components/home/ProductCarousel.jsx';
import PromoOfferBar from '../components/home/PromoOfferBar.jsx';

const PINK = '#C2185B';

/* ── Static data ─────────────────────────────────────────────────────────── */
const MAKEUP_SECTIONS = [
  {
    id: 'face',
    slug: 'face',
    name: 'Face',
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&w=800&q=80',
    sub: 'Foundation · Concealer · Blush · Highlighter',
  },
  {
    id: 'eyes',
    slug: 'eyes',
    name: 'Eyes',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&w=800&q=80',
    sub: 'Kajal · Eyeliner · Mascara · Eye Shadow',
  },
  {
    id: 'lips',
    slug: 'lips',
    name: 'Lips',
    image: 'https://images.unsplash.com/photo-1586495777744-4e6232bf2656?auto=format&w=800&q=80',
    sub: 'Lipstick · Lip Gloss · Lip Liner · Lip Balm',
  },
  {
    id: 'nails',
    slug: 'nails',
    name: 'Nails',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&w=800&q=80',
    sub: 'Nail Polish · Nail Art · Nail Care & Tools',
  },
];

const HERO_BANNERS = [
  {
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&w=1600&q=90',
    eyebrow: 'New Arrivals',
    title: 'Glam\nUp',
    sub: 'Premium makeup for every look',
    cta: 'Shop Face',
    link: '/category/face',
    align: 'left',
  },
  {
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&w=1600&q=90',
    eyebrow: 'Eye Collection',
    title: 'Define\nYour\nGaze',
    sub: 'Kajal · Mascara · Eye Shadow',
    cta: 'Shop Eyes',
    link: '/category/eyes',
    align: 'right',
  },
  {
    image: 'https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?auto=format&w=1600&q=90',
    eyebrow: 'Lip Edit',
    title: 'Bold\nLips',
    sub: 'Lipstick · Gloss · Liner',
    cta: 'Shop Lips',
    link: '/category/lips',
    align: 'left',
  },
];

const FEATURED_BRANDS = [
  { name: 'Colorbar',   slug: 'colorbar',   label: 'Vibrant Colour',    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&w=600&q=80' },
  { name: "L'Oréal",    slug: 'loreal',     label: 'Paris Glamour',     image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&w=600&q=80' },
  { name: 'Maybelline', slug: 'maybelline', label: 'Maybe She\'s Born With It', image: 'https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?auto=format&w=600&q=80' },
  { name: 'M.A.C',      slug: 'mac',        label: 'Pro Artist Picks',  image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&w=600&q=80' },
  { name: 'Chambor',    slug: 'chambor',    label: 'Long-Lasting',      image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&w=600&q=80' },
  { name: 'NYX',        slug: 'nyx',        label: 'Bold & Playful',    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&w=600&q=80' },
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
    fetch('/api/banners/makeup')
      .then(r => r.json())
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data.map(b => ({
            image: b.image_url, eyebrow: b.eyebrow || '', title: b.title || '',
            sub: b.subtitle || '', cta: 'Shop Now', link: b.link || '/category/makeup',
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
        <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <img src={b.image} alt={b.eyebrow} className="w-full h-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} />
          <div className={`absolute inset-0 ${isRight ? 'bg-gradient-to-l from-black/75 via-black/35 to-black/5' : 'bg-gradient-to-r from-black/75 via-black/35 to-black/5'}`} />
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
          <Link to={slide.link} className="inline-block px-10 py-3.5 text-white text-[11px] font-bold uppercase tracking-[0.25em] transition-colors duration-200"
            style={{ background: PINK }}>
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
          <button key={i} onClick={() => setCurrent(i)} className="transition-all duration-300 h-[3px] rounded-full" style={{ width: i === current ? 32 : 12, background: i === current ? PINK : 'rgba(255,255,255,0.4)' }} aria-label={`Slide ${i + 1}`} />
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
    <div className="border-b border-gray-100 py-8" style={{ background: '#FFF5F8' }}>
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-5">Shop by Category</h2>
        <div className="relative group/row">
          <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 shadow text-gray-500 opacity-0 group-hover/row:opacity-100 transition-opacity" aria-label="Scroll left">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div ref={rowRef} className="flex gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            {MAKEUP_SECTIONS.map(s => (
              <button key={s.id} onClick={() => document.getElementById(`makeup-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="shrink-0 flex flex-col items-center gap-2 group/tile">
                <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden border-2 border-transparent group-hover/tile:border-[#C2185B] transition-colors duration-200">
                  <img src={s.image} alt={s.name} className="w-full h-full object-cover transition-transform duration-300 group-hover/tile:scale-110" loading="lazy" />
                </div>
                <span className="text-[11px] font-semibold text-gray-700 whitespace-nowrap group-hover/tile:text-[#C2185B] transition-colors duration-200">{s.name}</span>
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
          {MAKEUP_SECTIONS.map(s => (
            <button
              key={s.id}
              data-id={s.id}
              onClick={() => document.getElementById(`makeup-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className={`shrink-0 px-6 py-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                active === s.id ? 'border-[#C2185B] text-[#C2185B]' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
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

/* ── New Arrivals (queries 'makeup' parent slug) ──────────────────────────── */
function NewArrivalsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          obs.disconnect();
          setLoading(true);
          fetch('/api/categories/makeup/products?limit=8&sort=newest')
            .then(r => r.json())
            .then(({ data }) => setProducts(Array.isArray(data) ? data : []))
            .catch(() => {})
            .finally(() => setLoading(false));
        }
      },
      { rootMargin: '300px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (!loading && products.length === 0) return <div ref={ref} />;

  return (
    <section ref={ref} className="py-12 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: PINK }}>Just In</p>
            <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
            <div className="mt-2 w-10 h-[3px]" style={{ background: PINK }} />
          </div>
          <Link
            to="/category/makeup"
            className="shrink-0 text-[11px] font-bold uppercase tracking-wider border px-5 py-2.5 transition-colors duration-200 hover:text-white"
            style={{ color: PINK, borderColor: PINK }}
            onMouseEnter={e => { e.currentTarget.style.background = PINK; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            View All
          </Link>
        </div>
        <ProductCarousel products={products} loading={loading} withDrawer />
      </div>
    </section>
  );
}

/* ── Individual Product Section ───────────────────────────────────────────── */
function MakeupSection({ section }) {
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
    <section id={`makeup-${section.id}`} ref={sectionRef} className="py-12 border-b border-gray-100 last:border-0">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: PINK }}>Makeup</p>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">{section.name}</h2>
            <div className="mt-2 w-10 h-[3px]" style={{ background: PINK }} />
            <p className="text-sm text-gray-400 mt-2">{section.sub}</p>
          </div>
          <Link
            to={`/category/${section.slug}`}
            className="shrink-0 text-[11px] font-bold uppercase tracking-wider border px-5 py-2.5 transition-colors duration-200 hover:text-white"
            style={{ color: PINK, borderColor: PINK }}
            onMouseEnter={e => { e.currentTarget.style.background = PINK; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            View All
          </Link>
        </div>
        <ProductCarousel products={products} loading={loading} withDrawer />
        {fetched && !loading && products.length === 0 && (
          <p className="text-gray-400 text-sm py-10 text-center">
            No products yet.{' '}
            <Link to={`/category/${section.slug}`} className="underline" style={{ color: PINK }}>Browse all makeup</Link>
          </p>
        )}
      </div>
    </section>
  );
}

/* ── Mid-page Editorial Banner ────────────────────────────────────────────── */
function EditorialBanner() {
  return (
    <div className="relative overflow-hidden my-0">
      <img
        src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&w=1600&q=80"
        alt="Makeup Collection"
        className="w-full h-64 object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(194,24,91,0.85) 0%, rgba(194,24,91,0.4) 60%, transparent 100%)' }} />
      <div className="absolute inset-0 flex flex-col items-start justify-center px-10 sm:px-20">
        <p className="text-white/70 text-[10px] uppercase tracking-[0.5em] font-bold mb-2">Exclusive Deals</p>
        <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-heading, Georgia)' }}>
          Up to 50% Off<br />on Top Brands
        </h3>
        <Link
          to="/offers"
          className="inline-block px-8 py-3 border border-white text-white text-[11px] font-bold uppercase tracking-widest hover:bg-white transition-colors duration-200"
          style={{ '--hover-color': PINK }}
          onMouseEnter={e => { e.currentTarget.style.color = PINK; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'white'; }}
        >
          Explore Offers
        </Link>
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
            <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: PINK }}>Top Picks</p>
            <h2 className="text-2xl font-bold text-gray-900">Featured Brands</h2>
            <div className="mt-2 w-10 h-[3px]" style={{ background: PINK }} />
          </div>
          <Link to="/brands" className="text-[11px] font-bold uppercase tracking-wider border px-5 py-2.5 transition-colors duration-200" style={{ color: PINK, borderColor: PINK }}
            onMouseEnter={e => { e.currentTarget.style.background = PINK; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = PINK; }}>
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

/* ── Main ─────────────────────────────────────────────────────────────────── */
export default function MakeupPage() {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observers = [];
    MAKEUP_SECTIONS.forEach(s => {
      const el = document.getElementById(`makeup-${s.id}`);
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
        <title>Makeup – ShoppersHub</title>
        <meta name="description" content="Shop makeup online — Face, Eyes, Lips, Nails from top brands like Colorbar, L'Oréal, Maybelline, M.A.C and more." />
      </Helmet>

      <div className="bg-white min-h-screen">
        <HeroBanner />
        <PromoOfferBar />
        <CategoryTiles />
        <SubNav active={activeId} />

        <NewArrivalsSection />
        <MakeupSection section={MAKEUP_SECTIONS[0]} />
        <MakeupSection section={MAKEUP_SECTIONS[1]} />
        <EditorialBanner />
        <MakeupSection section={MAKEUP_SECTIONS[2]} />
        <FeaturedBrands />
        <MakeupSection section={MAKEUP_SECTIONS[3]} />

        <div className="border-t border-gray-100 bg-gray-50 py-12">
          <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {TRUST.map(t => (
              <div key={t.label} className="flex flex-col items-center text-center gap-3">
                <div className="w-11 h-11 rounded-full border flex items-center justify-center" style={{ borderColor: `${PINK}33`, color: PINK }}>
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
