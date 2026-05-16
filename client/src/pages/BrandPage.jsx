import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { productsApi } from '../api/productsApi.js';
import { useFetch } from '../hooks/useFetch.js';
import FilterSidebar from '../components/product/FilterSidebar.jsx';
import SortBar from '../components/product/SortBar.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';

export default function BrandPage() {
  const { slug } = useParams();
  const [filters, setFilters] = useState({ gender: '', minPrice: '', maxPrice: '', brand: '' });
  const [sort, setSort] = useState('newest');

  const { data, loading } = useFetch(
    () => productsApi.brandProducts(slug, { ...filters, sort }),
    [slug, filters, sort]
  );

  const brandName = data?.brand?.name || slug?.replace(/-/g, ' ');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {data?.brand?.description && (
        <p className="text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4">
          {data.brand.description}
        </p>
      )}
      <div className="flex gap-8">
        <FilterSidebar filters={filters} onChange={setFilters} brands={[]} />
        <div className="flex-1 min-w-0">
          <SortBar
            value={sort}
            onChange={setSort}
            total={data?.total}
            categoryName={brandName}
            filters={filters}
            onFilterChange={setFilters}
          />
          <ProductGrid products={data?.data} loading={loading} />
        </div>
      </div>
    </div>
  );
}
