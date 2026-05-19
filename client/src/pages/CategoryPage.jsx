import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { productsApi } from '../api/productsApi.js';
import { useFetch } from '../hooks/useFetch.js';
import FilterSidebar from '../components/product/FilterSidebar.jsx';
import SortBar from '../components/product/SortBar.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import Pagination from '../components/product/Pagination.jsx';

const LIMIT = 20;

function toTitleCase(str) {
  return str.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    gender: searchParams.get('gender') || '',
    minPrice: '', maxPrice: '', brand: '', minDiscount: '',
  });
  const [sort, setSort]   = useState('newest');
  const [page, setPage]   = useState(1);

  // Reset page whenever filters, sort, or slug change
  useEffect(() => { setPage(1); }, [slug, filters, sort]);

  const { data, loading } = useFetch(
    () => productsApi.categoryProducts(slug, { ...filters, sort, page, limit: LIMIT }),
    [slug, filters, sort, page]
  );

  const { data: brandsData } = useFetch(() => productsApi.brands(), []);
  const brands = brandsData?.data ?? [];

  const category      = data?.category;
  const categoryName  = category?.name || toTitleCase(slug || '');
  const total         = data?.total ?? 0;
  const subcategories = data?.subcategories ?? [];

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
  };

  return (
    <>
      <Helmet>
        <title>{categoryName} – ShoppersHub</title>
        <meta name="description" content={`Shop ${categoryName} at ShoppersHub. ${total} products available.`} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8 items-start">
          {/* Sticky Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onChange={handleFilterChange}
            brands={brands}
          />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <SortBar
              value={sort}
              onChange={handleSortChange}
              total={total}
              title={categoryName}
              subtitle={category?.parent_name || null}
              filters={filters}
              onFilterChange={handleFilterChange}
              page={page}
              limit={LIMIT}
            />

            {/* Subcategory navigation chips */}
            {subcategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {subcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    to={`/category/${sub.slug}`}
                    className="px-3 py-1.5 border border-gray-200 rounded-full text-[13px] text-gray-700 hover:border-[#8B1A2F] hover:text-[#8B1A2F] transition-colors bg-white whitespace-nowrap"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}

            <ProductGrid products={data?.data} loading={loading} />

            <Pagination
              page={page}
              total={total}
              limit={LIMIT}
              onChange={setPage}
            />
          </div>
        </div>
      </div>
    </>
  );
}
