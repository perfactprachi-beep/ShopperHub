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
function SectionHead({ title, viewAllTo, viewAllLabel = 'View All' }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2
        className="text-xl font-bold text-gray-900 uppercase tracking-wide"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {title}
      </h2>
      {viewAllTo && (
        <Link
          to={viewAllTo}
          className="text-xs font-semibold text-[#8B1A2F] border border-[#8B1A2F] px-3 py-1.5 rounded hover:bg-[#8B1A2F] hover:text-white transition-colors uppercase tracking-wider"
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

/* ── Divider ────────────────────────────────────────────────────────────── */
function Divider() {
  return <div className="border-t border-gray-100 my-2" />;
}

/* ── Luxe highlight section ─────────────────────────────────────────────── */
function LuxeSection({ products, loading, onAddToBag }) {
  return (
    <div className="w-full bg-[#1A1A1A] py-14 my-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header row */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div>
            <p className="text-[#C9A84C] text-xs uppercase tracking-[0.3em] font-semibold mb-2">
              Exclusive
            </p>
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
            to="/category/luxe"
            className="shrink-0 px-10 py-3.5 border border-[#C9A84C] text-[#C9A84C] font-semibold text-sm uppercase tracking-widest hover:bg-[#C9A84C] hover:text-black transition-all"
          >
            Shop Luxe
          </Link>
        </div>

        {/* Product carousel — dark-themed */}
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
    <div className="w-full bg-[#8B1A2F] py-12">
      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="text-center lg:text-left">
          <p className="text-white/70 text-xs uppercase tracking-[0.25em] mb-2">
            Loyalty Programme
          </p>
          <h2
            className="text-3xl font-bold text-white"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Become a First Citizen
          </h2>
          <p className="text-white/80 mt-2 max-w-md text-sm leading-relaxed">
            Earn points on every purchase. Unlock exclusive rewards, early access
            and member-only deals.
          </p>
          <div className="flex flex-wrap gap-4 mt-4 justify-center lg:justify-start text-xs text-white/70">
            <span>✓ Earn points on every buy</span>
            <span>✓ Exclusive member offers</span>
            <span>✓ Early sale access</span>
          </div>
        </div>
        <Link
          to="/register"
          className="shrink-0 px-8 py-3 bg-white text-[#8B1A2F] font-bold rounded-sm hover:bg-gray-100 transition-colors text-sm uppercase tracking-wider"
        >
          Join Now — It's Free
        </Link>
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
      variantId:  product.id,
      productId:  product.id,
      title:      product.title,
      brand:      product.brand_name,
      image:      assetUrl(product.image_url || ''),
      size:       null,
      color:      null,
      price:      finalPrice,
      quantity:   1,
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

      {/* 2 ── Promo Offer Codes */}
      <PromoOfferBar />

      <Divider />

      {/* 3 ── Shop by Category */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <SectionHead title="Shop by Category" viewAllTo="/category/men" viewAllLabel="All Categories" />
        <div
          className="flex gap-5 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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

      {/* 4 ── New Arrivals carousel */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <SectionHead title="New Arrivals" viewAllTo="/search?sort=newest" />
        <ProductCarousel products={data?.newArrivals} loading={loading} showNew onAddToBag={handleAddToBag} />
      </section>

      <Divider />

      {/* 5 ── Trending Now grid */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <SectionHead title="Trending Now" />
        <TrendingGrid categories={data?.trendingCategories} loading={loading} />
      </section>

      {/* 6 ── Full-width editorial banner */}
      <div className="w-full my-6 bg-gradient-to-r from-[#0F3460] to-[#1A1A2E] py-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <p className="text-[#C9A84C] text-xs uppercase tracking-[0.3em] font-semibold mb-2">
              Curated for You
            </p>
            <h2
              className="text-4xl lg:text-5xl font-bold text-white leading-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Festive Season<br />Edit 2025
            </h2>
            <p className="text-white/70 mt-3 text-sm max-w-md">
              From ethnic wear to western chic — every look for every celebration.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/category/women"
              className="px-8 py-3 bg-white text-[#0F3460] font-semibold text-sm rounded hover:bg-gray-100 transition-colors text-center"
            >
              Shop Women
            </Link>
            <Link
              to="/category/men"
              className="px-8 py-3 border border-white text-white font-semibold text-sm rounded hover:bg-white/10 transition-colors text-center"
            >
              Shop Men
            </Link>
          </div>
        </div>
      </div>

      {/* 7 ── Top Brands */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <SectionHead title="Top Brands" viewAllTo="/brands" viewAllLabel="All Brands" />
        <BrandStrip brands={data?.brands ?? []} />
      </section>

      <Divider />

      {/* 8 ── Top Deals carousel */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <SectionHead title="Top Deals" viewAllTo="/offers" viewAllLabel="All Offers" />
        <ProductCarousel products={data?.deals} loading={loading} onAddToBag={handleAddToBag} />
      </section>

      {/* 9 ── Luxe Collection */}
      <LuxeSection products={data?.luxeProducts} loading={loading} onAddToBag={handleAddToBag} />

      {/* 10 ── First Citizen Loyalty */}
      <LoyaltySection />

      {/* 11 ── Recommended for You */}
      {(loading || data?.recommended?.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <SectionHead title="Recommended for You" viewAllTo="/search?sort=discount" viewAllLabel="View All" />
          <ProductCarousel products={data?.recommended} loading={loading} onAddToBag={handleAddToBag} />
        </section>
      )}

      <Divider />

      {/* 12 ── Recently Viewed */}
      <RecentlyViewed onAddToBag={handleAddToBag} />
    </div>
  );
}
