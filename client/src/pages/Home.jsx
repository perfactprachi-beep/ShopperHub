import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BannerCarousel from '../components/home/BannerCarousel.jsx';
import CategoryCard from '../components/home/CategoryCard.jsx';
import BrandStrip from '../components/home/BrandStrip.jsx';
import PromoOfferBar from '../components/home/PromoOfferBar.jsx';
import ProductCarousel from '../components/home/ProductCarousel.jsx';
import TrendingGrid from '../components/home/TrendingGrid.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { fetchHomeData } from '../api/homeApi.js';
import { useCartStore } from '../store/cartStore.js';
import { useToastStore } from '../store/toastStore.js';
import { calcFinalPrice } from '../utils/calcDiscount.js';
import { assetUrl } from '../utils/assetUrl.js';

/* ── Shared heading ─────────────────────────────────────────────────────── */
function SectionHead({ title, subtitle, viewAllTo, viewAllLabel = 'View All' }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2
          className="text-xl font-bold text-gray-900 uppercase tracking-wide"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {title}
        </h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        <div className="mt-1.5 w-10 h-[3px] bg-[#8B1A2F]" />
      </div>
      {viewAllTo && (
        <Link
          to={viewAllTo}
          className="text-xs font-semibold text-[#8B1A2F] border border-[#8B1A2F] px-3 py-1.5 hover:bg-[#8B1A2F] hover:text-white transition-colors uppercase tracking-wider"
        >
          {viewAllLabel} →
        </Link>
      )}
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 shrink-0">
      <Skeleton className="w-32 h-32 lg:w-36 lg:h-36 rounded-full" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

function Divider() {
  return <div className="border-t border-gray-100 my-2" />;
}

/* ── Brand Spotlight ────────────────────────────────────────────────────── */
const BRAND_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&w=1400&q=80',
    eyebrow: 'Technology Meets Beauty',
    brand: 'Dyson',
    desc: 'Reinvented hair care tools. Precision engineered for extraordinary results.',
    cta: 'Shop Dyson',
    link: '/search?q=dyson',
    accentColor: '#C9A84C',
  },
  {
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&w=1400&q=80',
    eyebrow: 'The Art of Time',
    brand: 'Titan',
    desc: "India's most celebrated watch brand — crafted with passion, worn with pride.",
    cta: 'Shop Titan',
    link: '/search?q=titan',
    accentColor: '#8B1A2F',
  },
  {
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&w=1400&q=80',
    eyebrow: 'New Season',
    brand: 'Women\'s Edit',
    desc: 'Curated styles for the modern woman — from workwear to weekend looks.',
    cta: 'Shop Women',
    link: '/category/women',
    accentColor: '#8B1A2F',
  },
  {
    image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&w=1400&q=80',
    eyebrow: 'Sharp. Suave. Sorted.',
    brand: 'Men\'s Collection',
    desc: 'From boardroom essentials to weekend casuals — everything a man needs.',
    cta: 'Shop Men',
    link: '/category/men',
    accentColor: '#1A3A5C',
  },
];

function BrandSpotlight() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % BRAND_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div
      className="relative overflow-hidden h-[300px] sm:h-[380px] lg:h-[460px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {BRAND_SLIDES.map((sl, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <img src={sl.image} alt={sl.brand} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 z-20 flex items-center pointer-events-none">
        <div className="max-w-7xl mx-auto w-full px-8 lg:px-16">
          <p
            className="text-xs uppercase tracking-[0.35em] font-bold mb-3 transition-all duration-500"
            style={{ color: BRAND_SLIDES[current].accentColor }}
          >
            {BRAND_SLIDES[current].eyebrow}
          </p>
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-3"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {BRAND_SLIDES[current].brand}
          </h2>
          <p className="text-white/70 text-sm max-w-xs mb-6 leading-relaxed">
            {BRAND_SLIDES[current].desc}
          </p>
          <Link
            to={BRAND_SLIDES[current].link}
            className="pointer-events-auto inline-block px-8 py-3 bg-white text-gray-900 font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors"
          >
            {BRAND_SLIDES[current].cta}
          </Link>
        </div>
      </div>

      {/* Prev / Next */}
      <button
        onClick={() => setCurrent((c) => (c - 1 + BRAND_SLIDES.length) % BRAND_SLIDES.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/30 hover:bg-black/55 text-white flex items-center justify-center text-xl leading-none transition-colors"
      >‹</button>
      <button
        onClick={() => setCurrent((c) => (c + 1) % BRAND_SLIDES.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/30 hover:bg-black/55 text-white flex items-center justify-center text-xl leading-none transition-colors"
      >›</button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {BRAND_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Occasion Shop ──────────────────────────────────────────────────────── */
const OCCASIONS = [
  { label: 'Wedding', image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&w=400&q=80', link: '/search?q=wedding' },
  { label: 'Party',   image: 'https://images.unsplash.com/photo-1510906594845-bc082582c8cc?auto=format&w=400&q=80', link: '/search?q=party' },
  { label: 'Office',  image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&w=400&q=80', link: '/search?q=formal' },
  { label: 'Casual',  image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&w=400&q=80', link: '/search?q=casual' },
  { label: 'Festive', image: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&w=400&q=80', link: '/search?q=festive' },
  { label: 'Travel',  image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&w=400&q=80', link: '/search?q=travel' },
  { label: 'Brunch',  image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&w=400&q=80', link: '/search?q=brunch' },
  { label: 'Date Night', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&w=400&q=80', link: '/search?q=evening' },
];

function OccasionShop() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <SectionHead title="Shop by Occasion" subtitle="Find the perfect outfit for every moment" />
      <div
        className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {OCCASIONS.map((occ) => (
          <Link
            key={occ.label}
            to={occ.link}
            className="shrink-0 group flex flex-col items-center gap-2.5"
          >
            <div className="w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#8B1A2F] transition-all duration-300">
              <img
                src={occ.image}
                alt={occ.label}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-400"
                loading="lazy"
              />
            </div>
            <span className="text-[12px] font-semibold text-gray-700 group-hover:text-[#8B1A2F] transition-colors uppercase tracking-wide text-center">
              {occ.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ── Editorial Campaign Banners ─────────────────────────────────────────── */
const CAMPAIGNS = [
  {
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&w=700&q=80',
    eyebrow: "Women's Season",
    title: 'New Summer\nArrivals',
    cta: 'Shop Women →',
    link: '/category/women',
    dark: true,
  },
  {
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&w=700&q=80',
    eyebrow: "Men's Collection",
    title: 'Sharp &\nStyled',
    cta: 'Shop Men →',
    link: '/category/men',
    dark: false,
  },
];

function EditorialBanners() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CAMPAIGNS.map((c) => (
          <Link
            key={c.title}
            to={c.link}
            className="group relative overflow-hidden block aspect-[4/3] sm:aspect-[3/2]"
          >
            <img
              src={c.image}
              alt={c.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className={`absolute inset-0 ${c.dark ? 'bg-gradient-to-t from-black/70 via-black/20 to-transparent' : 'bg-gradient-to-t from-black/60 via-black/15 to-transparent'}`} />
            <div className="absolute bottom-0 left-0 p-6">
              <p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-semibold mb-1">{c.eyebrow}</p>
              <h3
                className="text-white font-bold text-2xl sm:text-3xl leading-tight mb-3 whitespace-pre-line"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {c.title}
              </h3>
              <span className="inline-block text-[11px] font-bold text-white uppercase tracking-widest border-b border-white/60 pb-0.5 group-hover:border-white transition-colors">
                {c.cta}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ── Gift Cards ──────────────────────────────────────────────────────────── */
const GIFT_CARDS = [
  { label: 'For Her',  image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&w=400&q=80', link: '/search?q=women+gift', bg: 'from-rose-100 to-pink-200' },
  { label: 'For Him',  image: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&w=400&q=80', link: '/search?q=men+gift',   bg: 'from-blue-100 to-slate-200' },
  { label: 'For Kids', image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&w=400&q=80', link: '/search?q=kids+gift',  bg: 'from-yellow-100 to-amber-200' },
  { label: 'Corporate',image: 'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&w=400&q=80', link: '/search?q=corporate+gift', bg: 'from-gray-100 to-gray-200' },
];

function GiftCards() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <SectionHead title="Gift Cards" subtitle="The gift they'll always love" viewAllTo="/search?q=gift" viewAllLabel="All Gift Cards" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {GIFT_CARDS.map((g) => (
          <Link
            key={g.label}
            to={g.link}
            className="group relative overflow-hidden rounded-lg aspect-[3/4]"
          >
            <img
              src={g.image}
              alt={g.label}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white font-bold text-base uppercase tracking-wide">{g.label}</p>
              <p className="text-white/70 text-[11px] mt-0.5">Shop Now →</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ── Luxe highlight section ─────────────────────────────────────────────── */
function LuxeSection({ products, loading, onAddToBag }) {
  return (
    <div className="w-full bg-[#1A1A1A] py-14 my-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div>
            <p className="text-[#C9A84C] text-xs uppercase tracking-[0.3em] font-semibold mb-2">Exclusive</p>
            <h2
              className="text-4xl lg:text-5xl font-bold text-white mb-3"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              LUXE Collection
            </h2>
            <p className="text-gray-400 max-w-md text-sm leading-relaxed">
              Discover the world's finest watches, handbags, fragrances and jewellery.
              Premium brands. Curated just for you.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['Watches', 'Handbags', 'Fragrances', 'Jewellery'].map((cat) => (
                <Link
                  key={cat}
                  to={`/category/luxe-${cat.toLowerCase()}`}
                  className="text-[11px] text-[#C9A84C] border border-[#C9A84C]/40 px-3 py-1 rounded-full hover:bg-[#C9A84C]/10 transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
          <Link
            to="/luxe"
            className="shrink-0 px-10 py-3.5 border border-[#C9A84C] text-[#C9A84C] font-semibold text-sm uppercase tracking-widest hover:bg-[#C9A84C] hover:text-black transition-all"
          >
            Shop Luxe
          </Link>
        </div>
        <div className="[&_.product-card]:bg-[#2A2A2A] [&_.product-card]:border-[#333]">
          <ProductCarousel products={products} loading={loading} dark onAddToBag={onAddToBag} />
        </div>
      </div>
    </div>
  );
}

/* ── First Citizen loyalty ──────────────────────────────────────────────── */
function LoyaltySection() {
  return (
    <div className="w-full bg-[#8B1A2F] py-14">
      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="text-center lg:text-left">
          <p className="text-white/70 text-xs uppercase tracking-[0.25em] mb-2">Loyalty Programme</p>
          <h2
            className="text-3xl lg:text-4xl font-bold text-white"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Become a First Citizen
          </h2>
          <p className="text-white/80 mt-3 max-w-md text-sm leading-relaxed">
            Earn points on every purchase. Unlock exclusive rewards, early access and member-only deals.
          </p>
          <div className="flex flex-wrap gap-5 mt-5 justify-center lg:justify-start">
            {['Earn points on every buy', 'Exclusive member offers', 'Early sale access', 'Birthday surprises'].map((b) => (
              <span key={b} className="flex items-center gap-1.5 text-xs text-white/75">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                {b}
              </span>
            ))}
          </div>
        </div>
        <Link
          to="/register"
          className="shrink-0 px-10 py-4 bg-white text-[#8B1A2F] font-bold hover:bg-gray-100 transition-colors text-sm uppercase tracking-wider"
        >
          Join Now — It's Free
        </Link>
      </div>
    </div>
  );
}

/* ── Personal Shopper ───────────────────────────────────────────────────── */
function PersonalShopper() {
  return (
    <div
      className="relative overflow-hidden py-16"
      style={{ background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">Personal Shopping</span>
          </div>
          <h2
            className="text-3xl lg:text-4xl font-bold text-white mb-3"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Your Own Style Advisor
          </h2>
          <p className="text-white/65 text-sm max-w-md leading-relaxed mb-6">
            Get one-on-one styling help from our expert advisors — in-store or virtually.
            We'll curate looks tailored to your taste, occasion and budget.
          </p>
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <Link
              to="/personal-shopper"
              className="px-8 py-3 bg-[#C9A84C] text-black font-bold text-xs uppercase tracking-widest hover:bg-[#b8963e] transition-colors"
            >
              Book Your Advisor
            </Link>
            <Link
              to="/stores"
              className="px-8 py-3 border border-white/40 text-white font-semibold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors"
            >
              Find a Store
            </Link>
          </div>
        </div>

        {/* Right — service cards */}
        <div className="grid grid-cols-2 gap-3 shrink-0 w-full max-w-sm">
          {[
            { icon: '👗', title: 'Style Curation', desc: 'Outfits picked for your body & taste' },
            { icon: '📅', title: 'Appointments', desc: 'Book same-day or schedule ahead' },
            { icon: '🎁', title: 'Gift Help', desc: 'We find the perfect gift for anyone' },
            { icon: '✨', title: 'Wardrobe Audit', desc: 'Refresh & organise your wardrobe' },
          ].map((s) => (
            <div key={s.title} className="bg-white/8 border border-white/10 p-4 rounded-lg">
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="text-white font-semibold text-[12px]">{s.title}</p>
              <p className="text-white/50 text-[11px] mt-0.5 leading-snug">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── App Download ───────────────────────────────────────────────────────── */
function AppDownload() {
  return (
    <div className="w-full bg-gray-950 py-14">
      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-10">

        {/* Left */}
        <div className="text-center lg:text-left max-w-lg">
          <p className="text-[#C9A84C] text-xs uppercase tracking-[0.3em] font-bold mb-3">Mobile App</p>
          <h2
            className="text-3xl lg:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Shop Smarter on the App
          </h2>
          <p className="text-white/55 text-sm leading-relaxed mb-6">
            Get exclusive app-only deals, track orders in real-time, and enjoy a
            seamless shopping experience — anytime, anywhere.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-3 mb-7">
            {[
              { icon: '⚡', text: 'App-only offers' },
              { icon: '🔔', text: 'Instant alerts' },
              { icon: '📦', text: 'Live order tracking' },
              { icon: '💳', text: 'Faster checkout' },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-2">
                <span className="text-lg">{b.icon}</span>
                <span className="text-white/65 text-[12px]">{b.text}</span>
              </div>
            ))}
          </div>

          {/* Store badges */}
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/8 border border-white/15 px-5 py-3 rounded-xl hover:bg-white/15 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white shrink-0">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div>
                <p className="text-white/50 text-[9px] uppercase tracking-wider">Download on the</p>
                <p className="text-white font-semibold text-[13px] leading-tight">App Store</p>
              </div>
            </a>
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/8 border border-white/15 px-5 py-3 rounded-xl hover:bg-white/15 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0">
                <defs>
                  <linearGradient id="gp1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00C4E8"/><stop offset="100%" stopColor="#0085E5"/></linearGradient>
                  <linearGradient id="gp2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FFE000"/><stop offset="100%" stopColor="#FFBD00"/></linearGradient>
                  <linearGradient id="gp3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FF3A44"/><stop offset="100%" stopColor="#C31162"/></linearGradient>
                  <linearGradient id="gp4" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#32A071"/><stop offset="100%" stopColor="#2DA771"/></linearGradient>
                </defs>
                <path d="M3.18 23.76c.38.21.83.23 1.24.06l12.1-6.99-2.59-2.59-10.75 9.52z" fill="url(#gp1)"/>
                <path d="M21.54 10.27c-.37-.74-1.02-1.27-1.78-1.27H3.73L13.93 19l7.61-7.54c.45-.44.37-1.19 0-1.19z" fill="url(#gp2)"/>
                <path d="M3.18.24C2.8.45 2.5.87 2.5 1.4v21.2c0 .53.3.95.68 1.16l10.75-9.52-10.75-14z" fill="url(#gp3)"/>
                <path d="M16.52 9H3.73l-10-9 10 9 12.79-7.39c-.35-.36-.98-.36-1.25-.18-.37.21 0 0-.75.57z" fill="url(#gp4)"/>
              </svg>
              <div>
                <p className="text-white/50 text-[9px] uppercase tracking-wider">Get it on</p>
                <p className="text-white font-semibold text-[13px] leading-tight">Google Play</p>
              </div>
            </a>
          </div>
        </div>

        {/* Right — phone mockup */}
        <div className="relative shrink-0">
          <div className="w-[200px] h-[380px] sm:w-[240px] sm:h-[460px] bg-gradient-to-b from-[#1a1a2e] to-[#16213e] rounded-[40px] border-4 border-white/10 shadow-2xl overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&w=400&q=80"
              alt="App preview"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-4 right-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <p className="text-white text-[10px] font-bold uppercase tracking-wide">New Arrivals</p>
                <p className="text-white/70 text-[9px] mt-0.5">150+ styles added today</p>
              </div>
            </div>
          </div>
          {/* Glow */}
          <div className="absolute inset-0 -z-10 blur-3xl opacity-20 bg-[#8B1A2F] rounded-full scale-75 translate-y-10" />
        </div>
      </div>
    </div>
  );
}

/* ── Service Badges ─────────────────────────────────────────────────────── */
function ServiceBadges() {
  const badges = [
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, title: 'Free Delivery', desc: 'On orders above ₹999' },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.87"/></svg>, title: 'Easy Returns', desc: '30-day hassle-free returns' },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>, title: '100% Authentic', desc: 'Genuine products guaranteed' },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, title: 'Secure Payment', desc: 'SSL-encrypted checkout' },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, title: '100+ Stores', desc: 'Across India — shop & pickup' },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, title: 'Personal Shopper', desc: 'Expert styling assistance' },
  ];

  return (
    <div className="w-full bg-gray-50 border-y border-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((b) => (
            <div key={b.title} className="flex flex-col items-center text-center gap-2.5 py-2">
              <div className="text-[#8B1A2F]">{b.icon}</div>
              <div>
                <p className="text-[12px] font-bold text-gray-800">{b.title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Recently Viewed ────────────────────────────────────────────────────── */
function RecentlyViewed({ onAddToBag }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setItems(stored);
    } catch {}
  }, []);

  if (!items.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <SectionHead title="Recently Viewed" />
      <ProductCarousel products={items} loading={false} onAddToBag={onAddToBag} />
    </section>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────── */
export default function Home() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  const addItem = useCartStore((s) => s.addItem);
  const { addToast } = useToastStore();

  const handleAddToBag = (product) => {
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
    addToast('Added to bag!', 'success');
  };

  useEffect(() => {
    fetchHomeData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* 1 ── Hero Banner Carousel */}
      <BannerCarousel banners={data?.banners ?? []} />

      {/* 2 ── Service Badges strip */}
      <ServiceBadges />

      {/* 3 ── Promo Offer Codes */}
      <PromoOfferBar />

      <Divider />

      {/* 4 ── Shop by Category */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <SectionHead title="Shop by Category" viewAllTo="/category/men" viewAllLabel="All Categories" />
        <div
          className="flex gap-5 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <CategorySkeleton key={i} />)
            : data?.featuredCategories?.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  name={cat.name}
                  slug={cat.slug}
                  imageUrl={cat.image_url}
                />
              ))}
        </div>
      </section>

      <Divider />

      {/* 5 ── Shop by Occasion */}
      <OccasionShop />

      <Divider />

      {/* 6 ── Brand Spotlight Carousel */}
      <BrandSpotlight />

      <Divider />

      {/* 7 ── New Arrivals carousel */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <SectionHead title="New Arrivals" subtitle="Fresh styles, just in" viewAllTo="/search?sort=newest" />
        <ProductCarousel products={data?.newArrivals} loading={loading} showNew onAddToBag={handleAddToBag} />
      </section>

      {/* 8 ── Editorial Campaign Banners */}
      <EditorialBanners />

      {/* 9 ── Trending Now grid */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <SectionHead title="Trending Now" subtitle="What everyone's shopping" />
        <TrendingGrid categories={data?.trendingCategories} loading={loading} />
      </section>

      {/* 10 ── Shop the Collection (dynamic from DB) */}
      {(loading || data?.collectionBanners?.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <SectionHead title="Shop the Collection" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] rounded-xl bg-gray-100 animate-pulse" />
                ))
              : data.collectionBanners.map((col) => (
                  <Link
                    key={col.id}
                    to={col.link || '/'}
                    className="group relative rounded-xl overflow-hidden aspect-[3/4] block bg-gray-100"
                  >
                    {col.image_url && (
                      <img
                        src={col.image_url}
                        alt={col.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <span className="absolute bottom-3 left-3 right-3 text-white font-semibold text-xs leading-tight drop-shadow">
                      {col.title}
                    </span>
                  </Link>
                ))}
          </div>
        </section>
      )}

      <Divider />

      {/* 11 ── Ethnic Carnival editorial */}
      <div className="relative w-full overflow-hidden my-6">
        <img
          src="https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&w=1400&q=80"
          alt="Ethnic Carnival"
          className="w-full h-[300px] lg:h-[380px] object-cover object-top"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#5C1A3A]/90 via-[#8B1A2F]/60 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <p className="text-[#F5C6D0] text-xs uppercase tracking-[0.3em] font-semibold mb-2">Festive Season</p>
              <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                Ethnic Carnival<br />2025
              </h2>
              <p className="text-white/70 mt-3 text-sm max-w-md">
                Kurtas, Kurtis, Sarees & Lehengas — every festive look, one destination.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link to="/category/kurtas-kurtis" className="px-8 py-3 bg-white text-[#8B1A2F] font-semibold text-sm hover:bg-gray-100 transition-colors text-center">
                Shop Women
              </Link>
              <Link to="/category/kurtas" className="px-8 py-3 border border-white text-white font-semibold text-sm hover:bg-white/10 transition-colors text-center">
                Shop Men
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 12 ── Top Brands */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <SectionHead title="Top Brands" viewAllTo="/brands" viewAllLabel="All Brands" />
        <BrandStrip brands={data?.brands ?? []} />
      </section>

      <Divider />

      {/* 13 ── Top Deals carousel */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <SectionHead title="Deals Too Good To Miss" subtitle="Limited time offers — shop before they're gone" viewAllTo="/offers" viewAllLabel="All Offers" />
        <ProductCarousel products={data?.deals} loading={loading} onAddToBag={handleAddToBag} />
      </section>

      <Divider />

      {/* 14 ── Fragrance & Beauty Brands */}
      {(loading || data?.brandStrips?.fragrances?.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <SectionHead title="Fragrance & Beauty" subtitle="Luxury scents and skincare" viewAllTo="/category/skin" />
          <BrandStrip brands={data?.brandStrips?.fragrances ?? []} />
        </section>
      )}

      <Divider />

      {/* 15 ── Watch Brands */}
      {(loading || data?.brandStrips?.watches?.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <SectionHead title="Luxe Watches" subtitle="Timeless pieces from iconic brands" viewAllTo="/category/luxe-watches" />
          <BrandStrip brands={data?.brandStrips?.watches ?? []} />
        </section>
      )}

      <Divider />

      {/* 16 ── Ethnic & Festive Brands */}
      {(loading || data?.brandStrips?.ethnic?.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <SectionHead title="Ethnic & Festive Brands" subtitle="Celebrate every occasion in style" viewAllTo="/category/kurtas-kurtis" />
          <BrandStrip brands={data?.brandStrips?.ethnic ?? []} />
        </section>
      )}

      <Divider />

      {/* 17 ── Gift Cards */}
      <GiftCards />

      <Divider />

      {/* 18 ── Luxe Collection */}
      <LuxeSection products={data?.luxeProducts} loading={loading} onAddToBag={handleAddToBag} />

      {/* 19 ── First Citizen Loyalty */}
      <LoyaltySection />

      {/* 20 ── Recommended for You */}
      {(loading || data?.recommended?.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 py-10">
          <SectionHead title="Recommended for You" subtitle="Handpicked based on your style" viewAllTo="/search?sort=discount" />
          <ProductCarousel products={data?.recommended} loading={loading} onAddToBag={handleAddToBag} />
        </section>
      )}

      <Divider />

      {/* 21 ── Recently Viewed */}
      <RecentlyViewed onAddToBag={handleAddToBag} />

      {/* 22 ── Personal Shopper */}
      <PersonalShopper />

      {/* 23 ── App Download */}
      <AppDownload />

    </div>
  );
}
