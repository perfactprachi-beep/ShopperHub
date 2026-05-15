import { useEffect, useState } from 'react';
import ProductGrid from '../components/product/ProductGrid.jsx';
import SortBar from '../components/product/SortBar.jsx';
import api from '../api/axios.js';

export default function OffersPage() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('discount');

  useEffect(() => {
    setLoading(true);
    api
      .get('/products', { params: { minDiscount: 20, sort, limit: 20 } })
      .then(({ data }) => {
        if (data.success) {
          setProducts(data.data);
          setTotal(data.total ?? data.data.length);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sort]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header banner */}
      <div className="w-full bg-gradient-to-r from-[var(--color-accent)] to-amber-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-white/80 text-xs uppercase tracking-widest mb-2">Limited Time</p>
          <h1
            className="text-4xl font-bold text-white"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Deals &amp; Offers
          </h1>
          <p className="text-white/80 mt-2">Up to 70% off on top brands</p>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <SortBar value={sort} onChange={setSort} total={loading ? null : total} />
        <ProductGrid products={products} loading={loading} cols={4} />
      </div>
    </div>
  );
}
