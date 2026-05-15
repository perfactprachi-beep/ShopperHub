import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from '../api/productsApi.js';
import { useFetch } from '../hooks/useFetch.js';
import { useDebounce } from '../hooks/useDebounce.js';
import ProductGrid from '../components/product/ProductGrid.jsx';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const debounced = useDebounce(q, 400);

  const { data, loading } = useFetch(
    () => productsApi.search(debounced),
    [debounced]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <input
          type="text"
          value={q}
          onChange={e => setSearchParams({ q: e.target.value })}
          placeholder="Search products…"
          autoFocus
          className="w-full max-w-xl px-4 py-2.5 border border-[var(--color-border)] rounded-[var(--radius-sm)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
        />
        {debounced && (
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {loading ? 'Searching…' : `${data?.data?.length ?? 0} results for "${debounced}"`}
          </p>
        )}
      </div>
      {debounced && <ProductGrid products={data?.data} loading={loading} />}
    </div>
  );
}
