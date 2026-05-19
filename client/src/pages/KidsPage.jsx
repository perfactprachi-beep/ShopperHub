import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PromoOfferBar from '../components/home/PromoOfferBar.jsx';

// ── Data ───────────────────────────────────────────────────────────────────────
const KIDS_SECTIONS = [
  { id: 'boys',        label: "Boys' Clothing",    slug: 'boys-clothing',    color: '#3B82F6' },
  { id: 'girls',       label: "Girls' Clothing",   slug: 'girls-clothing',   color: '#EC4899' },
  { id: 'footwear',    label: 'Kids Footwear',     slug: 'kids-footwear',    color: '#F97316' },
  { id: 'infants',     label: 'Infants & Toddlers',slug: 'infants-toddlers', color: '#EAB308' },
  { id: 'accessories', label: 'Accessories',       slug: 'kids-accessories', color: '#8B5CF6' },
];

const AGE_GROUPS = [
  { label: 'Baby Girl', age: '0-1', href: '/category/girls-clothing', bg: '#FCE7F3', ring: '#F9A8D4', text: '#9D174D' },
  { label: "L'il Girl", age: '1-6', href: '/category/girls-clothing', bg: '#FBCFE8', ring: '#F472B6', text: '#831843' },
  { label: 'Big Girl',  age: '6+',  href: '/category/girls-clothing', bg: '#F9A8D4', ring: '#EC4899', text: '#500724' },
  { label: 'Baby Boy',  age: '0-1', href: '/category/boys-clothing',  bg: '#DBEAFE', ring: '#93C5FD', text: '#1E3A8A' },
  { label: "L'il Boy",  age: '1-6', href: '/category/boys-clothing',  bg: '#BFDBFE', ring: '#60A5FA', text: '#1E40AF' },
  { label: 'Big Boy',   age: '6+',  href: '/category/boys-clothing',  bg: '#93C5FD', ring: '#3B82F6', text: '#1E3A8A' },
];

const EXCLUSIVE_OFFERS = [
  { code: 'STYLE35', title: 'Flat 35% Off', desc: 'For ₹400 On ₹1000, Flat ₹1000 On ₹3000', accent: '#F59E0B' },
  { code: 'LUXE',    title: 'Flat 25% Off', desc: 'On All Luxe Products ₹2000+',             accent: '#EF4444' },
  { code: 'NEW10',   title: 'Flat 10% Off', desc: 'First Time Users — Min. Order ₹3000',     accent: '#10B981' },
];

const FEATURED_BRANDS = [
  { name: 'Gini & Jony', label: 'UP TO 60% OFF', bg: '#F0FDF4', img: 'https://images.unsplash.com/photo-1519089029353-5b78a2f58aef?w=500' },
  { name: 'Peppermint',  label: 'STARTING ₹299', bg: '#FFF7ED', img: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=500' },
  { name: 'Tiffany',     label: 'STARTING ₹709', bg: '#FDF2F8', img: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=500' },
  { name: 'Jockey Kids', label: 'FLAT 30% OFF',  bg: '#EFF6FF', img: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500' },
  { name: 'U.S. Polo',   label: 'STARTING ₹399', bg: '#F5F3FF', img: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500' },
];

const MUST_HAVES = [
  { label: 'T-Shirts & Tops',       slug: 'boys-clothing',    img: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400' },
  { label: "Girls' Dresses",        slug: 'girls-clothing',   img: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400' },
  { label: "Boy's Shorts",          slug: 'boys-clothing',    img: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=400' },
  { label: 'Ethnic Wear',           slug: 'girls-clothing',   img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400' },
  { label: 'Sleepwear',             slug: 'infants-toddlers', img: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400' },
  { label: 'Kids Sunglasses',       slug: 'kids-accessories', img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400' },
  { label: 'Baby Sets',             slug: 'infants-toddlers', img: 'https://images.unsplash.com/photo-1519089029353-5b78a2f58aef?w=400' },
  { label: 'Footwear',              slug: 'kids-footwear',    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
];

const INHOUSE_BRANDS = [
  { name: 'Karte', tagline: 'Up to 70% OFF', img: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800' },
  { name: 'Stop',  tagline: 'Up to 70% OFF', img: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800' },
];

const BUDGET_TIERS = [
  { label: 'UNDER',    value: '299', color: '#3B82F6', bg: '#EFF6FF', maxPrice: 299 },
  { label: 'UNDER',    value: '499', color: '#F97316', bg: '#FFF7ED', maxPrice: 499 },
  { label: 'UNDER',    value: '699', color: '#EF4444', bg: '#FEF2F2', maxPrice: 699 },
  { label: 'UNDER',    value: '999', color: '#8B5CF6', bg: '#F5F3FF', maxPrice: 999 },
  { label: 'PACK OF',  value: '2',   color: '#EC4899', bg: '#FDF2F8', maxPrice: null },
  { label: 'PACK OF',  value: '3',   color: '#10B981', bg: '#F0FDF4', maxPrice: null },
];

// ── HeroBanner ─────────────────────────────────────────────────────────────────
function HeroBanner() {
  const [slide, setSlide] = useState(0);

  const SLIDES = [
    {
      bg: '#EBF5FF',
      img: 'https://images.unsplash.com/photo-1519089029353-5b78a2f58aef?w=1400',
      card: (
        <div className="absolute right-10 top-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl px-8 py-6 text-center w-[190px]">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">U.S. Polo Assn.</p>
          <p className="text-[11px] text-gray-400 mb-3">Styles For Playful Days</p>
          <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Starting</p>
          <p className="text-6xl font-black text-[#C8102E] leading-none mt-0.5">899</p>
          <Link to="/brand/u-s-polo-assn" className="mt-4 inline-flex items-center gap-1 text-xs border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors font-medium">
            Shop Now
          </Link>
        </div>
      ),
    },
    {
      bg: '#FDF6EE',
      img: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=1400',
      card: (
        <div className="absolute right-10 top-1/2 -translate-y-1/2 text-right">
          <p className="text-[64px] font-black italic text-[#92400E] leading-[1] tracking-tighter">NEW<br/>arrivals</p>
          <p className="text-sm text-gray-500 mt-3 font-medium">For A Wardrobe As Playful As Them</p>
          <Link to="/category/kids" className="mt-4 inline-block text-xs border-2 border-[#92400E] text-[#92400E] font-bold rounded-lg px-6 py-2 hover:bg-[#92400E] hover:text-white transition-colors">
            Shop Now
          </Link>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const s = SLIDES[slide];
  return (
    <div className="relative h-[440px] overflow-hidden" style={{ background: s.bg }}>
      <img src={s.img} alt="" className="w-full h-full object-cover object-top" />
      {s.card}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            className={`rounded-full transition-all duration-300 ${i === slide ? 'w-7 h-2 bg-[#8B1A2F]' : 'w-2 h-2 bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}

// ── AgeGroupTiles ──────────────────────────────────────────────────────────────
function AgeGroupTiles() {
  return (
    <section className="py-12 bg-white">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Styles For All Ages</h2>
      <div className="max-w-3xl mx-auto px-6 grid grid-cols-6 gap-6">
        {AGE_GROUPS.map((g) => (
          <Link key={g.label} to={g.href} className="flex flex-col items-center gap-3 group">
            {/* Sunburst badge effect */}
            <div className="relative flex items-center justify-center">
              {/* Outer spiky ring */}
              <div
                className="absolute w-[96px] h-[96px] rounded-full opacity-60 group-hover:opacity-90 transition-opacity"
                style={{
                  background: g.ring,
                  clipPath: 'polygon(50% 0%,55% 15%,65% 5%,65% 20%,80% 10%,75% 25%,92% 22%,83% 35%,100% 37%,87% 47%,100% 55%,85% 58%,95% 72%,80% 70%,85% 85%,70% 78%,68% 95%,57% 83%,50% 100%,43% 83%,32% 95%,30% 78%,15% 85%,20% 70%,5% 72%,15% 58%,0% 55%,13% 47%,0% 37%,17% 35%,8% 22%,25% 25%,20% 10%,35% 20%,35% 5%,45% 15%)',
                }}
              />
              {/* Inner circle */}
              <div
                className="relative w-[80px] h-[80px] rounded-full flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md z-10"
                style={{ background: g.bg }}
              >
                <span className="text-2xl font-black leading-none" style={{ color: g.text }}>{g.age}</span>
                <span className="text-[8px] font-extrabold uppercase tracking-widest mt-0.5" style={{ color: g.text }}>yrs</span>
              </div>
            </div>
            <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{g.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── ExclusiveOffers ────────────────────────────────────────────────────────────
function ExclusiveOffers() {
  return (
    <section className="py-6 px-4 bg-gray-50 border-y border-gray-100">
      <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4">
        {EXCLUSIVE_OFFERS.map((o) => (
          <div key={o.code} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-start gap-4">
            <div
              className="mt-0.5 w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-black"
              style={{ background: o.accent }}
            >
              %
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Use Code</span>
                <span className="text-xs font-black text-gray-900 bg-gray-100 rounded px-1.5 py-0.5">{o.code}</span>
              </div>
              <p className="text-sm font-bold text-gray-900">{o.title}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">{o.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── FeaturedBrands ─────────────────────────────────────────────────────────────
function FeaturedBrands() {
  return (
    <section className="py-12 px-4 bg-[#FFFBEB]">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-1">Featured Brands</h2>
      <p className="text-sm text-center text-gray-500 mb-8">Little Labels They'll Love</p>
      <div className="max-w-5xl mx-auto grid grid-cols-5 gap-4">
        {FEATURED_BRANDS.map((b) => (
          <Link
            key={b.name}
            to="/category/kids"
            className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            style={{ background: b.bg }}
          >
            <div className="relative overflow-hidden">
              <div className="absolute top-2.5 left-2.5 z-10 bg-black/70 text-white text-[9px] font-extrabold px-2 py-1 rounded-md tracking-wide">
                {b.label}
              </div>
              <img
                src={b.img}
                alt={b.name}
                className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-400"
              />
            </div>
            <div className="py-2.5 px-2 text-center">
              <span className="text-xs font-bold text-gray-800">{b.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── CutestMustHaves ────────────────────────────────────────────────────────────
function CutestMustHaves() {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-5xl mx-auto flex gap-5">
        {/* Headline tile */}
        <div className="w-[160px] flex-shrink-0 bg-[#FFF7ED] rounded-2xl flex items-center justify-center">
          <p className="text-[38px] font-black text-[#EA580C] leading-[1.05] text-center px-4">
            Cutest<br/>Must<br/>Haves
          </p>
        </div>

        {/* Category grid */}
        <div className="flex-1 grid grid-cols-4 gap-3">
          {MUST_HAVES.map((c) => (
            <Link key={c.label} to={`/category/${c.slug}`} className="group text-center">
              <div className="rounded-xl overflow-hidden bg-gray-50 shadow-sm group-hover:shadow-md transition-shadow mb-2">
                <img
                  src={c.img}
                  alt={c.label}
                  className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <span className="text-[11px] font-semibold text-gray-700 leading-tight block">{c.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── InHouseExclusives ──────────────────────────────────────────────────────────
function InHouseExclusives() {
  return (
    <section className="py-12 px-4 bg-[#FFFBEB]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end gap-3 mb-7">
          <div>
            <p className="text-xs font-extrabold text-[#D97706] tracking-[0.25em] uppercase mb-0.5">Kid's</p>
            <p className="text-2xl font-black text-gray-900 leading-tight">IN-HOUSE<br/>EXCLUSIVES</p>
          </div>
          <Link
            to="/category/kids"
            className="mb-1 text-sm font-semibold text-[#8B1A2F] hover:underline"
          >
            Explore All
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {INHOUSE_BRANDS.map((b) => (
            <Link key={b.name} to="/category/kids" className="group relative rounded-2xl overflow-hidden block h-56">
              <img
                src={b.img}
                alt={b.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5">
                <p className="text-white text-2xl font-black leading-none">{b.name}</p>
                <p className="text-white/80 text-sm font-semibold mt-1">{b.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── SubNav ─────────────────────────────────────────────────────────────────────
function SubNav({ active, onSelect }) {
  return (
    <div className="sticky top-[138px] z-30 bg-white border-y border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex overflow-x-auto scrollbar-none">
        {KIDS_SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              onSelect(s.id);
              document.getElementById(`kids-section-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              active === s.id
                ? 'border-[#8B1A2F] text-[#8B1A2F]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── KidsSection ────────────────────────────────────────────────────────────────
function KidsSection({ section }) {
  const [products, setProducts] = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(false);
  const [fetched, setFetched]   = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !fetched) {
        setLoading(true); setFetched(true); obs.disconnect();
        fetch(`/api/categories/${section.slug}/products?limit=8&sort=newest`)
          .then(r => r.json())
          .then(({ data, total: t }) => {
            setProducts(Array.isArray(data) ? data : []);
            setTotal(Number(t) || 0);
          })
          .catch(() => {})
          .finally(() => setLoading(false));
      }
    }, { rootMargin: '300px' });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [section.slug, fetched]);

  return (
    <section id={`kids-section-${section.id}`} ref={ref} className="py-10 px-4 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">{section.label}</h2>
          {/* Only show View All when there are more products than displayed */}
          {!loading && total > 8 && (
            <Link to={`/category/${section.slug}`} className="text-sm font-semibold text-[#8B1A2F] hover:underline">
              View All
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="aspect-[3/4] bg-gray-100 rounded-xl animate-pulse" />
                <div className="mt-2.5 h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                <div className="mt-1.5 h-3 bg-gray-100 rounded animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2 text-gray-300">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <p className="text-sm text-gray-400">Coming soon — check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {products.slice(0, 8).map((p) => {
              const sp = Math.round(p.base_price * (1 - p.discount_pct / 100));
              return (
                <Link key={p.id} to={`/product/${p.slug}`} className="group">
                  <div className="rounded-xl overflow-hidden bg-gray-50 relative mb-2.5 shadow-sm group-hover:shadow-md transition-shadow">
                    <img
                      src={p.image_url || 'https://images.unsplash.com/photo-1519089029353-5b78a2f58aef?w=400'}
                      alt={p.title}
                      className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {p.discount_pct > 0 && (
                      <span className="absolute top-2 left-2 bg-[#8B1A2F] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {p.discount_pct}% OFF
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{p.brand_name}</p>
                  <p className="text-sm text-gray-900 font-medium leading-tight line-clamp-1 mt-0.5">{p.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-gray-900">₹{sp.toLocaleString('en-IN')}</span>
                    {p.discount_pct > 0 && (
                      <span className="text-xs text-gray-400 line-through">₹{Number(p.base_price).toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ── BudgetEdit ─────────────────────────────────────────────────────────────────
function BudgetEdit() {
  return (
    <section className="py-12 px-4 bg-white">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">The Budget Edit</h2>
      <div className="max-w-4xl mx-auto grid grid-cols-6 gap-3">
        {BUDGET_TIERS.map((t, i) => (
          <Link
            key={i}
            to={t.maxPrice ? `/category/kids?maxPrice=${t.maxPrice}` : '/category/kids'}
            className="rounded-2xl py-6 px-2 text-center hover:scale-105 transition-transform shadow-sm"
            style={{ background: t.bg }}
          >
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{t.label}</p>
            <p className="text-4xl font-black leading-none mt-1" style={{ color: t.color }}>{t.value}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── TrustStrip ─────────────────────────────────────────────────────────────────
function TrustStrip() {
  const ITEMS = [
    { label: 'Free Delivery',  sub: 'On orders above ₹999',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
    { label: 'Easy Returns',   sub: '15-day hassle-free',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg> },
    { label: '100% Genuine',   sub: 'Certified authentic',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg> },
    { label: 'Secure Payment', sub: 'All major methods',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  ];
  return (
    <section className="py-8 px-4 bg-gray-50 border-t border-gray-100">
      <div className="max-w-5xl mx-auto grid grid-cols-4 gap-6">
        {ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-3 text-gray-500">
            {item.icon}
            <div>
              <p className="text-sm font-semibold text-gray-800">{item.label}</p>
              <p className="text-xs text-gray-400">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function KidsPage() {
  const [active, setActive] = useState(KIDS_SECTIONS[0].id);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActive(entry.target.id.replace('kids-section-', ''));
        }
      }
    }, { rootMargin: '-40% 0px -55% 0px' });

    KIDS_SECTIONS.forEach((s) => {
      const el = document.getElementById(`kids-section-${s.id}`);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <Helmet>
        <title>Kids Fashion — Clothing, Footwear & Accessories | ShoppersHub</title>
        <meta name="description" content="Shop kids fashion at ShoppersHub. Boys & girls clothing, footwear, accessories and infant wear. Styles for all ages 0–12 years." />
      </Helmet>

      <HeroBanner />
      <PromoOfferBar />
      <AgeGroupTiles />
      <ExclusiveOffers />
      <FeaturedBrands />
      <CutestMustHaves />
      <InHouseExclusives />
      <SubNav active={active} onSelect={setActive} />
      {KIDS_SECTIONS.map((s) => <KidsSection key={s.id} section={s} />)}
      <BudgetEdit />
      <TrustStrip />
    </>
  );
}
