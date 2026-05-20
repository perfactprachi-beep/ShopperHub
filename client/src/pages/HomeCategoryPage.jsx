import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ProductCarousel from '../components/home/ProductCarousel.jsx';
import { useCartStore } from '../store/cartStore.js';
import { useToastStore } from '../store/toastStore.js';
import { calcFinalPrice } from '../utils/calcDiscount.js';
import { assetUrl } from '../utils/assetUrl.js';

/* ─────────────────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────────────────── */

const TOP_CATEGORIES = [
  { label: 'Dining',      slug: 'dining',       discount: 'UP TO\n50% OFF', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&w=200&q=80' },
  { label: 'Kitchen',     slug: 'kitchen',      discount: 'UP TO\n40% OFF', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&w=200&q=80' },
  { label: 'Bedding',     slug: 'bedding',      discount: 'UP TO\n60% OFF', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&w=200&q=80' },
  { label: 'Decor',       slug: 'home-decor',   discount: 'UP TO\n50% OFF', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&w=200&q=80' },
  { label: 'Appliances',  slug: 'kitchen-appliances', discount: 'UP TO\n45% OFF', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&w=200&q=80' },
  { label: 'Living',      slug: 'living',       discount: 'UP TO\n55% OFF', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&w=200&q=80' },
  { label: 'Bath &\nLaundry', slug: 'bath-laundry', discount: 'UP TO\n50% OFF', image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&w=200&q=80' },
];

const HOME_BRANDS = [
  {
    name: 'Rosemoor8',
    brand: 'ROSEMOOR8',
    eyebrow: 'Decor · IRIS',
    discount: 'UP TO 70% OFF',
    cta: 'SHOP NOW',
    link: '/search?q=rosemoor',
    bg: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&w=1200&q=80',
    accent: '#C9A84C',
  },
  {
    name: 'Borosil',
    brand: 'BOROSIL',
    eyebrow: 'Kitchen · Dining',
    discount: 'UP TO 50% OFF',
    cta: 'SHOP NOW',
    link: '/search?q=borosil',
    bg: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&w=1200&q=80',
    accent: '#e84c4c',
  },
  {
    name: 'Raymond Home',
    brand: 'RAYMOND HOME',
    eyebrow: 'Bedding · Living',
    discount: 'UP TO 60% OFF',
    cta: 'SHOP NOW',
    link: '/search?q=raymond+home',
    bg: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&w=1200&q=80',
    accent: '#8B1A2F',
  },
];

const EXCLUSIVE_OFFERS = [
  { code: 'STYLE26', desc: 'For ₹400 On ₹5000, For ₹1000 On ₹10000', link: '/offers' },
  { code: 'LUXE',    desc: 'For ₹2500 Off On ₹20000', sub: 'On selected products', link: '/offers' },
  { code: 'NEW10',   desc: 'For First-Time Users 10% Off On ₹3000', link: '/offers' },
];

const HOSTING_GRID = [
  { label: 'Appliances',  slug: 'kitchen-appliances', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&w=400&q=80' },
  { label: 'Bed & Bath',  slug: 'bath-laundry',       image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&w=400&q=80' },
  { label: 'Cookware',    slug: 'cookware-bakeware',  image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&w=400&q=80' },
  { label: 'Cutlery',     slug: 'cutlery',            image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&w=400&q=80' },
  { label: 'Drinkware',   slug: 'drinkware',          image: 'https://images.unsplash.com/photo-1534650075489-c2f8c5e85b74?auto=format&w=400&q=80' },
  { label: 'Decor',       slug: 'home-decor',         image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&w=400&q=80' },
  { label: 'Dinnerware',  slug: 'dinnerware',         image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&w=400&q=80' },
  { label: 'Living',      slug: 'living',             image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&w=400&q=80' },
];

const TRENDS = [
  { label: 'Boho Chic',       image: 'https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?auto=format&w=600&q=80', slug: 'home-decor' },
  { label: 'Blue Tones',      image: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&w=600&q=80', slug: 'living' },
  { label: 'Floral Prints',   image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&w=600&q=80', slug: 'cushions-covers' },
  { label: 'Minimal Modern',  image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&w=600&q=80', slug: 'living' },
  { label: 'Earthy Tones',    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&w=600&q=80', slug: 'bedding' },
];

const FOOD_SECTIONS = [
  { label: 'Tea & Coffee',  discount: 'UP TO 50% OFF', slug: 'drinkware',  image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&w=400&q=80' },
  { label: 'Dinnerware',    discount: 'UP TO 50% OFF', slug: 'dinnerware', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&w=400&q=80' },
  { label: 'Drinkware',     discount: 'STARTING ₹175', slug: 'drinkware',  image: 'https://images.unsplash.com/photo-1534650075489-c2f8c5e85b74?auto=format&w=400&q=80' },
  { label: 'Cutlery',       discount: 'UP TO 20% OFF', slug: 'cutlery',    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&w=400&q=80' },
  { label: 'Serveware',     discount: 'UP TO 50% OFF', slug: 'serveware',  image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&w=400&q=80' },
];

const BEDROOM_SECTIONS = [
  { label: 'Breezy Bedding Essentials', discount: 'UP TO 60% OFF', slug: 'bedding',           image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&w=600&q=80' },
  { label: 'Cushions & Comfort',        discount: 'UP TO 50% OFF', slug: 'cushions-covers',    image: 'https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?auto=format&w=600&q=80' },
  { label: 'Our Curtain Collection',    discount: 'UP TO 70% OFF', slug: 'curtains',           image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&w=600&q=80' },
  { label: 'Wrap Into Comfort',         discount: 'UP TO 50% OFF', slug: 'quilts-comforters',  image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&w=600&q=80' },
  { label: 'For Restful Nights & Fresh Mornings', discount: 'UP TO 50% OFF', slug: 'pillows', image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&w=600&q=80' },
];

const DECOR_TRENDS = [
  { label: 'Garden',        discount: 'UP TO 50% OFF', slug: 'home-decor',  image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&w=400&q=80' },
  { label: 'Figurines',     discount: 'UP TO 70% OFF', slug: 'home-decor',  image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&w=400&q=80' },
  { label: 'Aromas & Oils', discount: 'UP TO 50% OFF', slug: 'home-decor',  image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&w=400&q=80' },
  { label: 'Candle Holders',discount: 'UP TO 70% OFF', slug: 'home-decor',  image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&w=400&q=80' },
  { label: 'Vase & Flowers',discount: 'UP TO 70% OFF', slug: 'home-decor',  image: 'https://images.unsplash.com/photo-1487530811015-780f73d8e00a?auto=format&w=400&q=80' },
];

const PRICE_BUCKETS = [
  { label: '₹499',  link: '/category/home?maxPrice=499' },
  { label: '₹799',  link: '/category/home?maxPrice=799' },
  { label: '₹999',  link: '/category/home?maxPrice=999' },
  { label: '₹1999', link: '/category/home?maxPrice=1999' },
  { label: '₹2499', link: '/category/home?maxPrice=2499' },
  { label: '₹2999', link: '/category/home?maxPrice=2999' },
  { label: '₹3999', link: '/category/home?maxPrice=3999' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED HELPERS
───────────────────────────────────────────────────────────────────────────── */

function SectionHead({ title, subtitle, viewAllTo }) {
  return (
    <div className="text-center mb-6">
      <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
        {title}
      </h2>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      <div className="mt-2 mx-auto w-12 h-[2px] bg-[#8B1A2F]" />
      {viewAllTo && (
        <Link to={viewAllTo} className="inline-block mt-3 text-[11px] text-[#8B1A2F] font-semibold underline underline-offset-2">
          View All Products
        </Link>
      )}
    </div>
  );
}

function HorizontalScroll({ children }) {
  const ref = useRef(null);
  const scroll = d => ref.current?.scrollBy({ left: d * 320, behavior: 'smooth' });
  return (
    <div className="relative group/hs">
      <button
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border border-gray-200 shadow rounded-full flex items-center justify-center text-gray-600 opacity-0 group-hover/hs:opacity-100 transition-opacity"
      >‹</button>
      <div ref={ref} className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {children}
      </div>
      <button
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border border-gray-200 shadow rounded-full flex items-center justify-center text-gray-600 opacity-0 group-hover/hs:opacity-100 transition-opacity"
      >›</button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 1 — Top Category Strip
───────────────────────────────────────────────────────────────────────────── */
function TopCategoryStrip() {
  return (
    <div className="bg-white border-b border-gray-100 py-4">
      <div className="max-w-7xl mx-auto px-4">
        <HorizontalScroll>
          {TOP_CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="shrink-0 flex flex-col items-center gap-1.5 group w-[90px]"
            >
              <div className="relative w-[70px] h-[70px] rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-[#8B1A2F] transition-colors">
                <img src={cat.image} alt={cat.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              </div>
              <span className="text-[10px] font-bold text-[#8B1A2F] text-center whitespace-pre-line leading-tight">
                {cat.discount}
              </span>
              <span className="text-[11px] font-semibold text-gray-700 text-center whitespace-pre-line leading-tight group-hover:text-[#8B1A2F] transition-colors">
                {cat.label}
              </span>
            </Link>
          ))}
        </HorizontalScroll>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 2 — Favourite Home Labels (brand carousel)
───────────────────────────────────────────────────────────────────────────── */
function FavouriteLabels() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % HOME_BRANDS.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  const brand = HOME_BRANDS[current];

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <SectionHead title="Favourite Home Labels" />
      <div
        className="relative overflow-hidden rounded-xl"
        style={{ height: 220 }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {HOME_BRANDS.map((b, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <img src={b.bg} alt={b.name} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-black/10" />
          </div>
        ))}

        {/* Brand info card — right side */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 bg-white rounded-lg shadow-lg px-8 py-5 min-w-[220px] text-center">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">{brand.eyebrow}</p>
          <p className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{brand.brand}</p>
          <p className="text-2xl font-extrabold mb-3" style={{ color: brand.accent }}>{brand.discount}</p>
          <Link
            to={brand.link}
            className="inline-block px-6 py-2 text-white text-[11px] font-bold uppercase tracking-widest transition-colors rounded"
            style={{ background: brand.accent }}
          >
            {brand.cta}
          </Link>
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {HOME_BRANDS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
            />
          ))}
        </div>

        {/* Arrows */}
        <button
          onClick={() => setCurrent(c => (c - 1 + HOME_BRANDS.length) % HOME_BRANDS.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center text-lg"
        >‹</button>
        <button
          onClick={() => setCurrent(c => (c + 1) % HOME_BRANDS.length)}
          className="absolute right-[270px] top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center text-lg"
        >›</button>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 3 — Exclusive Offers
───────────────────────────────────────────────────────────────────────────── */
function ExclusiveOffers() {
  return (
    <div className="bg-amber-50 border-y border-amber-100 py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-amber-200">
          {EXCLUSIVE_OFFERS.map(offer => (
            <div key={offer.code} className="px-4 py-3 flex flex-col items-center text-center gap-1">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Exclusive Offers</p>
              <p className="text-base font-bold text-gray-900">
                Use Code: <span className="text-[#8B1A2F]">{offer.code}</span>
              </p>
              <p className="text-[11px] text-gray-500">{offer.desc}</p>
              {offer.sub && <p className="text-[10px] text-gray-400 italic">{offer.sub}</p>}
              <Link to={offer.link} className="text-[11px] text-[#8B1A2F] font-semibold underline underline-offset-2 mt-1">
                View All Products
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 4 — Seasonal Home Refresh (product carousel)
───────────────────────────────────────────────────────────────────────────── */
function SeasonalRefresh({ onAddToBag }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories/home/products?limit=10&sort=newest')
      .then(r => r.json())
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data?.products ?? []);
        setProducts(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <SectionHead title="Seasonal Home Refresh" viewAllTo="/category/home" />
      <ProductCarousel products={products} loading={loading} withDrawer onAddToBag={onAddToBag} />
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 5 — Weekend Hosting Essentials banner + 8-tile grid
───────────────────────────────────────────────────────────────────────────── */
function WeekendHosting() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Banner */}
      <Link to="/search?q=hosting" className="group block mb-6">
        <div className="relative rounded-xl overflow-hidden h-[130px] sm:h-[160px]">
          <img
            src="https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&w=1400&q=80"
            alt="Weekend Hosting Essentials"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex items-center px-8 gap-6">
            <div>
              <p className="text-white/80 text-[10px] uppercase tracking-widest font-semibold">Sponsored by</p>
              <p className="text-white font-bold text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-heading)' }}>
                Weekend<br />Hosting Essentials
              </p>
              <p className="text-white/70 text-xs mt-1">Curated For The Perfect Weekend Get-Together</p>
            </div>
            <div className="ml-auto text-right">
              <div className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-lg px-6 py-3">
                <p className="text-white font-bold text-3xl sm:text-4xl leading-none">UP TO</p>
                <p className="text-[#FFD700] font-extrabold text-4xl sm:text-5xl leading-none">50%</p>
                <p className="text-white font-bold text-lg">OFF</p>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* 8-tile grid */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {HOSTING_GRID.map(tile => (
          <Link
            key={tile.slug}
            to={`/category/${tile.slug}`}
            className="group flex flex-col items-center gap-1.5"
          >
            <div className="w-full aspect-square rounded-lg overflow-hidden border border-gray-100 group-hover:border-[#8B1A2F] transition-colors">
              <img
                src={tile.image}
                alt={tile.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <span className="text-[11px] font-semibold text-gray-700 group-hover:text-[#8B1A2F] transition-colors text-center leading-tight">
              {tile.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 6 — New Trends To Bring Home (horizontal scroll)
───────────────────────────────────────────────────────────────────────────── */
function NewTrends() {
  return (
    <div className="bg-[#f5ede0] py-10 my-4">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHead title="New Trends To Bring Home" />
        <HorizontalScroll>
          {TRENDS.map(t => (
            <Link
              key={t.label}
              to={`/category/${t.slug}`}
              className="group shrink-0 relative overflow-hidden rounded-xl"
              style={{ width: 200, height: 260 }}
            >
              <img src={t.image} alt={t.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <span className="absolute bottom-4 left-0 right-0 text-center text-white font-bold text-sm drop-shadow">
                {t.label}
              </span>
            </Link>
          ))}
        </HorizontalScroll>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 7 — Make Memories Over Food (dining subcategories)
───────────────────────────────────────────────────────────────────────────── */
function MemoriesOverFood() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <SectionHead title="Make Memories Over Food" subtitle="Where Every Meal Becomes a Story" />
      <HorizontalScroll>
        {FOOD_SECTIONS.map(item => (
          <Link
            key={item.slug + item.label}
            to={`/category/${item.slug}`}
            className="group shrink-0 relative rounded-xl overflow-hidden"
            style={{ width: 160, height: 200 }}
          >
            <img src={item.image} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute top-2 left-2">
              <span className="bg-[#8B1A2F] text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                {item.label}
              </span>
            </div>
            <div className="absolute bottom-3 left-3 right-3 text-center">
              <p className="text-white font-bold text-[11px] leading-snug">{item.discount}</p>
            </div>
          </Link>
        ))}
      </HorizontalScroll>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 8 — Summer Bedroom & Living Refresh
───────────────────────────────────────────────────────────────────────────── */
function BedroomRefresh() {
  return (
    <section className="bg-[#f0f4f0] py-10 my-4">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHead title="Summer Bedroom & Living Refresh" subtitle="Refresh Your Space For Sunnier Days" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {BEDROOM_SECTIONS.map(item => (
            <Link
              key={item.slug + item.label}
              to={`/category/${item.slug}`}
              className="group relative rounded-xl overflow-hidden aspect-[3/4]"
            >
              <img src={item.image} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-[11px] font-semibold leading-snug mb-1">{item.label}</p>
                <p className="text-[#FFD700] text-[10px] font-bold">{item.discount}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 9 — Decor Trends To Know
───────────────────────────────────────────────────────────────────────────── */
function DecorTrends() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <SectionHead title="Decor Trends To Know" />
      <HorizontalScroll>
        {DECOR_TRENDS.map(item => (
          <Link
            key={item.label}
            to={`/category/${item.slug}`}
            className="group shrink-0 flex flex-col items-center gap-2"
            style={{ width: 140 }}
          >
            <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-[#8B1A2F] transition-colors">
              <img src={item.image} alt={item.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
            </div>
            <p className="text-[12px] font-semibold text-gray-800 text-center group-hover:text-[#8B1A2F] transition-colors">{item.label}</p>
            <p className="text-[11px] font-bold text-[#8B1A2F]">{item.discount}</p>
          </Link>
        ))}
      </HorizontalScroll>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 10 — Wallet-Friendly Buys (price hexagons)
───────────────────────────────────────────────────────────────────────────── */
function WalletFriendly() {
  const navigate = useNavigate();
  return (
    <div className="bg-[#f8f4ee] border-y border-amber-100 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHead title="Wallet-Friendly Buys" subtitle="Great finds at every budget" />
        <div className="flex flex-wrap justify-center gap-4">
          {PRICE_BUCKETS.map(b => (
            <button
              key={b.label}
              onClick={() => navigate(b.link)}
              className="group relative flex items-center justify-center transition-transform hover:scale-105"
              style={{ width: 90, height: 100 }}
            >
              {/* Hexagon via clip-path */}
              <div
                className="absolute inset-0 bg-white border-2 border-[#C9A84C] group-hover:bg-[#8B1A2F] group-hover:border-[#8B1A2F] transition-colors"
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              />
              <div className="relative z-10 text-center">
                <p className="text-[10px] font-semibold text-gray-500 group-hover:text-white transition-colors uppercase tracking-wider leading-none mb-0.5">
                  UNDER
                </p>
                <p className="text-[15px] font-extrabold text-gray-900 group-hover:text-white transition-colors leading-none">
                  {b.label}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 11 — Bottom full category grid (all subcategories)
───────────────────────────────────────────────────────────────────────────── */
const ALL_SUBCATEGORIES = [
  { group: 'Bedding', items: [
    { name: 'Bed Sheets',                slug: 'bed-sheets',          image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&w=400&q=80' },
    { name: 'Quilts Comforters & Dohars', slug: 'quilts-comforters',  image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&w=400&q=80' },
    { name: 'Pillows',                   slug: 'pillows',             image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&w=400&q=80' },
    { name: 'Covers & Protectors',       slug: 'covers-protectors',   image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&w=400&q=80' },
    { name: 'Diwan Sets',                slug: 'diwan-sets',          image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&w=400&q=80' },
  ]},
  { group: 'Living', items: [
    { name: 'Cushions & Covers',   slug: 'cushions-covers',  image: 'https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?auto=format&w=400&q=80' },
    { name: 'Curtains',            slug: 'curtains',         image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&w=400&q=80' },
    { name: 'Floor Coverings',     slug: 'floor-coverings',  image: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&w=400&q=80' },
    { name: 'Sofa Covers & Throws',slug: 'sofa-covers-throws',image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&w=400&q=80' },
    { name: 'Home Décor',          slug: 'home-decor',       image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&w=400&q=80' },
  ]},
  { group: 'Dining', items: [
    { name: 'Dinnerware',  slug: 'dinnerware', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&w=400&q=80' },
    { name: 'Serveware',   slug: 'serveware',  image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&w=400&q=80' },
    { name: 'Table Tops',  slug: 'table-tops', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&w=400&q=80' },
    { name: 'Cutlery',     slug: 'cutlery',    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&w=400&q=80' },
    { name: 'Drinkware',   slug: 'drinkware',  image: 'https://images.unsplash.com/photo-1534650075489-c2f8c5e85b74?auto=format&w=400&q=80' },
  ]},
  { group: 'Bath & Laundry', items: [
    { name: 'Towels',                slug: 'towels',              image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&w=400&q=80' },
    { name: 'Bath Rugs & Mats',      slug: 'bath-rugs-mats',      image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&w=400&q=80' },
    { name: 'Shower Curtains',       slug: 'shower-curtains',     image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&w=400&q=80' },
    { name: 'Bathroom Accessories',  slug: 'bathroom-accessories',image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&w=400&q=80' },
    { name: 'Laundry Bags & Baskets',slug: 'laundry-bags-baskets',image: 'https://images.unsplash.com/photo-1604709177225-055f99402ea3?auto=format&w=400&q=80' },
  ]},
  { group: 'Kitchen', items: [
    { name: 'Cookware & Bakeware', slug: 'cookware-bakeware', image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&w=400&q=80' },
    { name: 'Food Preps & Tools',  slug: 'food-preps-tools',  image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&w=400&q=80' },
    { name: 'Storage Solution',    slug: 'storage-solution',  image: 'https://images.unsplash.com/photo-1595351298020-038700609878?auto=format&w=400&q=80' },
    { name: 'Kitchen Linens',      slug: 'table-kitchen-linens', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&w=400&q=80' },
    { name: 'Kitchen Appliances',  slug: 'kitchen-appliances',image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&w=400&q=80' },
  ]},
];

function GetYourHome() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <SectionHead title="Get Your Home" subtitle="Shop every category" />
      <div className="space-y-8">
        {ALL_SUBCATEGORIES.map(group => (
          <div key={group.group}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{group.group}</h3>
              <Link to={`/category/${group.group.toLowerCase().replace(' & ', '-').replace(' ', '-')}`} className="text-[11px] text-[#8B1A2F] font-semibold">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {group.items.map(item => (
                <Link
                  key={item.slug}
                  to={`/category/${item.slug}`}
                  className="group flex flex-col items-center gap-1.5 text-center"
                >
                  <div className="w-full aspect-square rounded-lg overflow-hidden border border-gray-100 group-hover:border-[#8B1A2F] transition-colors">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-700 group-hover:text-[#8B1A2F] transition-colors leading-tight">
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function HomeCategoryPage() {
  const addItem    = useCartStore((s) => s.addItem);
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
        <title>Home – ShoppersHub</title>
        <meta
          name="description"
          content="Shop home essentials online — Bedding, Bath & Laundry, Living, Dining, Kitchen and more at ShoppersHub."
        />
      </Helmet>

      <div className="bg-white min-h-screen">
        {/* 1. Category icon strip */}
        <TopCategoryStrip />

        {/* 2. Favourite Home Labels brand carousel */}
        <FavouriteLabels />

        {/* 3. Exclusive Offer codes */}
        <ExclusiveOffers />

        {/* 4. Seasonal Home Refresh — products from DB */}
        <SeasonalRefresh onAddToBag={handleAddToBag} />

        {/* 5. Weekend Hosting Essentials banner + 8 tiles */}
        <WeekendHosting />

        {/* 6. New Trends To Bring Home */}
        <NewTrends />

        {/* 7. Make Memories Over Food */}
        <MemoriesOverFood />

        {/* 8. Summer Bedroom & Living Refresh */}
        <BedroomRefresh />

        {/* 9. Decor Trends To Know */}
        <DecorTrends />

        {/* 10. Wallet-Friendly Buys */}
        <WalletFriendly />

        {/* 11. Get Your Home — full subcategory grid */}
        <GetYourHome />
      </div>
    </>
  );
}
