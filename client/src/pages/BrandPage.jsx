import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { productsApi } from '../api/productsApi.js';
import { useFetch } from '../hooks/useFetch.js';
import FilterSidebar from '../components/product/FilterSidebar.jsx';
import SortBar from '../components/product/SortBar.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';

export default function BrandPage() {
  const { slug } = useParams();
  const [filters, setFilters] = useState({ gender: '', minPrice: '', maxPrice: '' });
  const [sort, setSort] = useState('newest');

  const { data, loading } = useFetch(
    () => productsApi.brandProducts(slug, { ...filters, sort }),
    [slug, filters, sort]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
        {data?.brand?.name || slug}
      </h1>
      {data?.brand?.description && (
        <p className="text-sm text-[var(--color-muted)] mb-6">{data.brand.description}</p>
      )}
      <div className="flex gap-8 mt-6">
        <FilterSidebar filters={filters} onChange={setFilters} />
        <div className="flex-1">
          <SortBar value={sort} onChange={setSort} total={data?.total} />
          <ProductGrid products={data?.data} loading={loading} />
        </div>
      </div>
    </div>
  );
}
