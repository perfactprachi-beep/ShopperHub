import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { productsApi } from '../api/productsApi.js';
import { useFetch } from '../hooks/useFetch.js';
import FilterSidebar from '../components/product/FilterSidebar.jsx';
import SortBar from '../components/product/SortBar.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';

export default function CategoryPage() {
  const { slug } = useParams();
  const [filters, setFilters] = useState({ gender: '', minPrice: '', maxPrice: '', brand: '' });
  const [sort, setSort] = useState('newest');

  const { data, loading } = useFetch(
    () => productsApi.categoryProducts(slug, { ...filters, sort }),
    [slug, filters, sort]
  );

  const { data: brandsData } = useFetch(() => productsApi.brands(), []);
  const brands = brandsData?.data ?? [];

  const categoryName = data?.category?.name || slug?.replace(/-/g, ' ');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-8">
        <FilterSidebar filters={filters} onChange={setFilters} brands={brands} />
        <div className="flex-1 min-w-0">
          <SortBar
            value={sort}
            onChange={setSort}
            total={data?.total}
            categoryName={categoryName}
            filters={filters}
            onFilterChange={setFilters}
          />
          <ProductGrid products={data?.data} loading={loading} />
        </div>
      </div>
    </div>
  );
}
