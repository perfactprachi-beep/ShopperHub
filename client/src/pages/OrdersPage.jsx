import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../api/ordersApi.js';
import OrderCard from '../components/order/OrderCard.jsx';
import Spinner from '../components/ui/Spinner.jsx';

const TABS = [
  { label: 'All',       filter: null },
  { label: 'Active',    filter: ['pending', 'confirmed', 'shipped'] },
  { label: 'Delivered', filter: ['delivered'] },
  { label: 'Cancelled', filter: ['cancelled', 'returned'] },
];

const PAGE_SIZE = 8;

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [tab, setTab]       = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getOrders({ page, limit: PAGE_SIZE })
      .then(({ data }) => {
        if (data.success) {
          setOrders(data.data.orders);
          setTotal(data.data.total);
        }
      })
      .finally(() => setLoading(false));
  }, [page]);

  const filtered = TABS[tab].filter
    ? orders.filter((o) => TABS[tab].filter.includes(o.status))
    : orders;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
        My Orders
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--color-border)] mb-6">
        {TABS.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setTab(i)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === i
                ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[var(--color-muted)] text-lg mb-4">No orders yet</p>
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-[var(--color-primary)] text-white rounded-[var(--radius-sm)] text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {filtered.map((order) => <OrderCard key={order.id} order={order} />)}
          </div>

          {/* Pagination — only shown on All tab */}
          {tab === 0 && totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-1.5 text-sm border border-[var(--color-border)] rounded-[var(--radius-sm)] disabled:opacity-40 hover:bg-[var(--color-bg)]"
              >
                Prev
              </button>
              <span className="px-3 py-1.5 text-sm text-[var(--color-muted)]">
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-1.5 text-sm border border-[var(--color-border)] rounded-[var(--radius-sm)] disabled:opacity-40 hover:bg-[var(--color-bg)]"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
