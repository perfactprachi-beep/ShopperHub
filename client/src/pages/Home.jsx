import { useEffect, useState } from 'react';
import BannerCarousel from '../components/home/BannerCarousel.jsx';
import CategoryCard from '../components/home/CategoryCard.jsx';
import BrandStrip from '../components/home/BrandStrip.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { Link } from 'react-router-dom';
import { fetchHomeData } from '../api/homeApi.js';

function SectionHeading({ children }) {
  return (
    <h2
      className="text-2xl font-bold text-[var(--color-text)] mb-6"
      style={{ fontFamily: 'var(--font-heading)' }}
    >
      {children}
    </h2>
  );
}

function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <Skeleton className="w-20 h-20 lg:w-24 lg:h-24 rounded-full" />
      <Skeleton className="h-3 w-14" />
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* 1. Banner Carousel — full width */}
      <BannerCarousel banners={data?.banners ?? []} />

      {/* 2. Category strip */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2
          className="text-xl font-semibold text-[var(--color-text)] mb-5"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Shop by Category
        </h2>
        <div
          className="flex gap-6 overflow-x-auto pb-2"
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

      {/* 3. New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <SectionHeading>New Arrivals</SectionHeading>
          <Link
            to="/category/all"
            className="text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            View all →
          </Link>
        </div>
        <ProductGrid products={data?.newArrivals} loading={loading} cols={4} />
      </section>

      {/* 4. Promo banner — full width CTA */}
      <div className="w-full my-6 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] py-14">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <p className="text-white/70 text-sm uppercase tracking-widest mb-2">Exclusive Collection</p>
            <h2
              className="text-3xl lg:text-4xl font-bold text-white"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Summer Edit 2024
            </h2>
            <p className="text-white/80 mt-2">Curated looks for every occasion</p>
          </div>
          <Link
            to="/category/women"
            className="shrink-0 px-8 py-3 bg-white text-[var(--color-primary)] font-semibold rounded-[var(--radius-sm)] hover:bg-[var(--color-primary-light)] transition-colors text-sm"
          >
            Shop Now
          </Link>
        </div>
      </div>

      {/* 5. Brand Strip */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2
          className="text-xl font-semibold text-[var(--color-text)] mb-5"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Top Brands
        </h2>
        <BrandStrip brands={data?.brands ?? []} />
      </section>

      {/* 6. Top Deals */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <SectionHeading>Top Deals</SectionHeading>
          <Link
            to="/offers"
            className="text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            View all offers →
          </Link>
        </div>
        <ProductGrid products={data?.deals} loading={loading} cols={4} />
      </section>

      {/* 7. First Citizen promo */}
      <section className="w-full bg-[var(--color-accent)] my-6 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <p className="text-white/80 text-xs uppercase tracking-widest mb-1">Loyalty Programme</p>
            <h2
              className="text-3xl font-bold text-white"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Become a First Citizen
            </h2>
            <p className="text-white/80 mt-2 max-w-md">
              Earn points on every purchase. Unlock exclusive rewards, early access and member-only deals.
            </p>
          </div>
          <Link
            to="/register"
            className="shrink-0 px-8 py-3 bg-white text-[var(--color-accent)] font-bold rounded-[var(--radius-sm)] hover:opacity-90 transition-opacity text-sm"
          >
            Join Now — It's Free
          </Link>
        </div>
      </section>
    </div>
  );
}
