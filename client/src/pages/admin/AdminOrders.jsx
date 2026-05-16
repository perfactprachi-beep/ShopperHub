import { useEffect, useState } from 'react';
import { getAdminOrders, updateOrderStatus } from '../../api/adminApi.js';

const STATUSES = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped:   'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const limit = 20;

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAdminOrders({ page, limit, status: activeTab === 'all' ? undefined : activeTab });
      setOrders(data.orders);
      setTotal(data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, activeTab]);

  const handleStatusChange = async (orderId, status) => {
    setUpdating(orderId);
    try {
      const updated = await updateOrderStatus(orderId, status);
      setOrders(os => os.map(o => o.id === orderId ? { ...o, status: updated.status } : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally { setUpdating(null); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => { setActiveTab(s); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                activeTab === s
                  ? 'bg-[#8B1A2F] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {s === 'all' ? 'All Orders' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        {!loading && (
          <span className="text-xs text-gray-400">{total} {activeTab === 'all' ? 'total' : activeTab} orders</span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Items</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-300">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    <p className="text-sm text-gray-400">No orders found</p>
                  </div>
                </td></tr>
              ) : orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">#{order.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{order.customer_name || '—'}</div>
                    <div className="text-xs text-gray-400">{order.customer_email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right">{order.item_count}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    ₹{parseFloat(order.total).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-500'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="select-wrap w-32">
                      <select
                        value={order.status}
                        disabled={updating === order.id || order.status === 'cancelled' || order.status === 'delivered'}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        className="disabled:opacity-50 text-xs"
                      >
                        {['pending','confirmed','shipped','delivered','cancelled'].map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>{total} orders</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="p-1.5 rounded border disabled:opacity-40 hover:bg-gray-50 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>
              </button>
              <span className="px-3 py-1 text-xs font-medium">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="p-1.5 rounded border disabled:opacity-40 hover:bg-gray-50 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9,18 15,12 9,6"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
