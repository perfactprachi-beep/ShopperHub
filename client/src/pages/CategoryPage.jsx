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

export default function CategoryPage() {
  const { slug } = useParams();

  const [filters, setFilters] = useState({
    gender: '', minPrice: '', maxPrice: '', brand: '', minDiscount: '',
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

  const category     = data?.category;
  const categoryName = category?.name || toTitleCase(slug || '');
  const total        = data?.total ?? 0;

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
