import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { productsApi } from '../api/productsApi.js';
import { useFetch } from '../hooks/useFetch.js';
import FilterSidebar from '../components/product/FilterSidebar.jsx';
import SortBar from '../components/product/SortBar.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import Pagination from '../components/product/Pagination.jsx';

const LIMIT = 20;

/* Fallback images per keyword in the slug */
const SLUG_IMAGE_MAP = {
  boys:        'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&w=400&q=80',
  girls:       'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&w=400&q=80',
  kids:        'https://images.unsplash.com/photo-1519089029353-5b78a2f58aef?auto=format&w=400&q=80',
  footwear:    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&w=400&q=80',
  infant:      'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&w=400&q=80',
  toddler:     'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&w=400&q=80',
  accessories: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&w=400&q=80',
  men:         'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&w=400&q=80',
  women:       'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&w=400&q=80',
  shirts:      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&w=400&q=80',
  jeans:       'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&w=400&q=80',
  dress:       'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&w=400&q=80',
  saree:       'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&w=400&q=80',
  kurta:       'https://images.unsplash.com/photo-1609609800896-a7bc8fde1611?auto=format&w=400&q=80',
  watch:       'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&w=400&q=80',
  beauty:      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&w=400&q=80',
  bag:         'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&w=400&q=80',
  bedding:     'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&w=400&q=80',
  kitchen:     'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&w=400&q=80',
  dining:      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&w=400&q=80',
  bath:        'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&w=400&q=80',
  living:      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&w=400&q=80',
  decor:       'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&w=400&q=80',
  casual:      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&w=400&q=80',
  formal:      'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&w=400&q=80',
  ethnic:      'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&w=400&q=80',
  sport:       'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&w=400&q=80',
  jacket:      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&w=400&q=80',
  sweater:     'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&w=400&q=80',
  default:     'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&w=400&q=80',
};

function getSubcatImage(slug) {
  const lower = (slug || '').toLowerCase();
  for (const [key, url] of Object.entries(SLUG_IMAGE_MAP)) {
    if (lower.includes(key)) return url;
  }
  return SLUG_IMAGE_MAP.default;
}

function toTitleCase(str) {
  return str.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

/* ── Subcategory visual tiles ──────────────────────────────────────────────── */
function SubcategoryTiles({ subcategories, currentSlug }) {
  if (!subcategories.length) return null;

  return (
    <div className="mb-6">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-3">
        Shop by Subcategory
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {subcategories.map((sub) => {
          const img = sub.image_url || getSubcatImage(sub.slug);
          const isActive = sub.slug === currentSlug;
          return (
            <Link
              key={sub.id}
              to={`/category/${sub.slug}`}
              className={`shrink-0 group flex flex-col items-center gap-1.5 ${isActive ? 'pointer-events-none' : ''}`}
              style={{ width: 80 }}
            >
              <div className={`w-[68px] h-[68px] rounded-full overflow-hidden border-2 transition-colors duration-200 ${
                isActive ? 'border-[#8B1A2F]' : 'border-gray-200 group-hover:border-[#8B1A2F]'
              }`}>
                <img
                  src={img}
                  alt={sub.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <span className={`text-[10px] font-semibold text-center leading-tight whitespace-normal line-clamp-2 ${
                isActive ? 'text-[#8B1A2F]' : 'text-gray-600 group-hover:text-[#8B1A2F]'
              } transition-colors`}>
                {sub.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ── Breadcrumb ────────────────────────────────────────────────────────────── */
function Breadcrumb({ category }) {
  return (
    <nav className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-4">
      <Link to="/" className="hover:text-[#8B1A2F] transition-colors">Home</Link>
      <span>/</span>
      {category?.parent_name && (
        <>
          <Link
            to={`/category/${(category.parent_slug || category.parent_name.toLowerCase().replace(/\s+/g, '-'))}`}
            className="hover:text-[#8B1A2F] transition-colors capitalize"
          >
            {category.parent_name}
          </Link>
          <span>/</span>
        </>
      )}
      <span className="text-gray-700 font-medium">{category?.name || ''}</span>
    </nav>
  );
}

/* ── Empty state ───────────────────────────────────────────────────────────── */
function EmptyState({ categoryName, subcategories }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2" className="mb-4">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
      <p className="text-gray-500 font-semibold text-base mb-1">No products found</p>
      <p className="text-gray-400 text-sm mb-5">
        {subcategories.length > 0
          ? `Try browsing a subcategory of ${categoryName}`
          : `No products in ${categoryName} yet — check back soon!`}
      </p>
      {subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {subcategories.slice(0, 6).map(sub => (
            <Link
              key={sub.id}
              to={`/category/${sub.slug}`}
              className="px-4 py-2 rounded-full border border-[#8B1A2F] text-[#8B1A2F] text-xs font-semibold hover:bg-[#8B1A2F] hover:text-white transition-colors"
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();

  const parseArray = (param) => {
    const v = searchParams.get(param);
    return v ? v.split(',').filter(Boolean) : [];
  };

  const [filters, setFilters] = useState({
    genders:     parseArray('genders'),
    minPrice:    searchParams.get('minPrice')    || '',
    maxPrice:    searchParams.get('maxPrice')    || '',
    brands:      parseArray('brands'),
    minDiscount: searchParams.get('minDiscount') || '',
  });
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [slug, filters, sort]);

  /* Sync URL query params → filters on slug change */
  useEffect(() => {
    setFilters({
      genders:     parseArray('genders'),
      minPrice:    searchParams.get('minPrice')    || '',
      maxPrice:    searchParams.get('maxPrice')    || '',
      brands:      parseArray('brands'),
      minDiscount: searchParams.get('minDiscount') || '',
    });
    setSort(searchParams.get('sort') || 'newest');
    setPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  /* Build API params — arrays sent as comma-separated strings */
  const apiParams = {
    gender:      filters.genders.length > 0 ? filters.genders.join(',') : '',
    brand:       filters.brands.length  > 0 ? filters.brands.join(',')  : '',
    minPrice:    filters.minPrice,
    maxPrice:    filters.maxPrice,
    minDiscount: filters.minDiscount,
    sort, page, limit: LIMIT,
  };

  const { data, loading } = useFetch(
    () => productsApi.categoryProducts(slug, apiParams),
    [slug, filters, sort, page]
  );

  const { data: brandsData } = useFetch(() => productsApi.brands(), []);
  const brands = brandsData?.data ?? [];

  const category      = data?.category;
  const categoryName  = category?.name || toTitleCase(slug || '');
  const total         = data?.total ?? 0;
  const subcategories = data?.subcategories ?? [];
  const products      = data?.data ?? [];

  return (
    <>
      <Helmet>
        <title>{categoryName} – ShoppersHub</title>
        <meta name="description" content={`Shop ${categoryName} at ShoppersHub. ${total} products available.`} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <Breadcrumb category={category} />

        <div className="flex gap-8 items-start">
          {/* Sticky Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            brands={brands}
          />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <SortBar
              value={sort}
              onChange={setSort}
              total={total}
              title={categoryName}
              subtitle={category?.parent_name || null}
              filters={filters}
              onFilterChange={setFilters}
              page={page}
              limit={LIMIT}
            />

            {/* Subcategory visual tiles */}
            <SubcategoryTiles subcategories={subcategories} currentSlug={slug} />

            {/* Products or empty state */}
            {!loading && products.length === 0 ? (
              <EmptyState categoryName={categoryName} subcategories={subcategories} />
            ) : (
              <>
                <ProductGrid products={products} loading={loading} />
                <Pagination
                  page={page}
                  total={total}
                  limit={LIMIT}
                  onChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
