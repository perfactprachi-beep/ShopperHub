import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

export default function BrandPage() {
  const { slug } = useParams();

  const [filters, setFilters] = useState({
    gender: '', minPrice: '', maxPrice: '', brand: '', minDiscount: '',
  });
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  // Reset page when slug, filters, or sort change
  useEffect(() => { setPage(1); }, [slug, filters, sort]);

  const { data, loading } = useFetch(
    () => productsApi.brandProducts(slug, { ...filters, sort, page, limit: LIMIT }),
    [slug, filters, sort, page]
  );

  const brand     = data?.brand;
  const brandName = brand?.name || toTitleCase(slug || '');
  const total     = data?.total ?? 0;

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
  };

  return (
    <>
      <Helmet>
        <title>{brandName} – ShoppersHub</title>
        <meta name="description" content={`Shop ${brandName} products at ShoppersHub. ${total} products available.`} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Brand header */}
        {(brand?.logo_url || brand?.description) && (
          <div className="flex items-center gap-5 mb-8 pb-6 border-b border-gray-100">
            {brand?.logo_url && (
              <img
                src={brand.logo_url}
                alt={brandName}
                className="h-12 object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
            {brand?.description && (
              <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
                {brand.description}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-8 items-start">
          {/* Sticky Filter Sidebar — no brand filter on brand page */}
          <FilterSidebar
            filters={filters}
            onChange={handleFilterChange}
            brands={[]}
            hideDepartment={false}
          />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <SortBar
              value={sort}
              onChange={handleSortChange}
              total={total}
              title={brandName}
              subtitle="Brand"
              filters={filters}
              onFilterChange={handleFilterChange}
              page={page}
              limit={LIMIT}
            />

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
