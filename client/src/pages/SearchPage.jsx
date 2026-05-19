import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from '../api/productsApi.js';
import { useFetch } from '../hooks/useFetch.js';
import { useDebounce } from '../hooks/useDebounce.js';
import FilterSidebar from '../components/product/FilterSidebar.jsx';
import SortBar from '../components/product/SortBar.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const debounced = useDebounce(q, 400);
  const [filters, setFilters] = useState({ gender: '', minPrice: '', maxPrice: '', brand: '' });
  const [sort, setSort] = useState('newest');

  const { data, loading } = useFetch(
    () => productsApi.search(debounced),
    [debounced]
  );

  const { data: brandsData } = useFetch(() => productsApi.brands(), []);
  const brands = brandsData?.data ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {debounced && (
        <div className="flex gap-8">
          <FilterSidebar filters={filters} onChange={setFilters} brands={brands} />
          <div className="flex-1 min-w-0">
            <SortBar
              value={sort}
              onChange={setSort}
              total={data?.data?.length}
              categoryName={`Results for "${debounced}"`}
              filters={filters}
              onFilterChange={setFilters}
            />
            <ProductGrid products={data?.data} loading={loading} />
          </div>
        </div>
      )}

      {!debounced && (
        <div className="py-20 text-center text-gray-400">
          <svg className="mx-auto mb-4" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <p className="text-sm font-medium">Start typing to search</p>
        </div>
      )}
    </div>
  );
}
