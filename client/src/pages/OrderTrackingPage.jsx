import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../api/ordersApi.js';
import Spinner from '../components/ui/Spinner.jsx';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}
function formatPrice(n) {
  return `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}
function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

const TRACK_STEPS = [
  { key: 'pending',   label: 'Order Placed',    icon: '📋' },
  { key: 'confirmed', label: 'Order Confirmed', icon: '✅' },
  { key: 'shipped',   label: 'Shipped',         icon: '🚚' },
  { key: 'delivered', label: 'Delivered',       icon: '🏠' },
];

const STATUS_ORDER = ['pending', 'confirmed', 'shipped', 'delivered'];

function getActiveIndex(status) {
  if (status === 'cancelled' || status === 'returned') return -1;
  const idx = STATUS_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
}

/* ── Vertical tracking timeline ──────────────────────────────────────────── */
function TrackingTimeline({ status, placedAt }) {
  const activeIdx   = getActiveIndex(status);
  const isCancelled = status === 'cancelled' || status === 'returned';

  return (
    <div className="relative pl-0">
      {TRACK_STEPS.map((step, idx) => {
        const isDone    = !isCancelled && activeIdx > idx;
        const isActive  = !isCancelled && activeIdx === idx;
        const isLast    = idx === TRACK_STEPS.length - 1;

        return (
          <div key={step.key} className="flex gap-4">
            {/* Line + dot column */}
            <div className="flex flex-col items-center">
              {/* Dot */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 text-base
                ${isDone    ? 'bg-green-500 text-white shadow-sm' :
                  isActive  ? 'bg-[#8B1A2F] text-white shadow-md ring-4 ring-red-100' :
                  isCancelled && idx <= activeIdx ? 'bg-red-400 text-white' :
                  'bg-gray-100 text-gray-400'}`}
              >
                {isDone ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <span>{step.icon}</span>
                )}
              </div>
              {/* Connector line */}
              {!isLast && (
                <div className={`w-0.5 flex-1 my-1 min-h-[28px] ${isDone ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>

            {/* Text content */}
            <div className={`pb-6 ${isLast ? '' : ''}`}>
              <p className={`text-[14px] font-bold ${
                isActive ? 'text-[#8B1A2F]' :
                isDone   ? 'text-green-700' :
                isCancelled && idx <= getActiveIndex('pending') ? 'text-red-500' :
                'text-gray-400'
              }`}>
                {step.label}
              </p>
              {isActive && (
                <p className="text-[12px] text-gray-500 mt-0.5">In progress</p>
              )}
              {isDone && placedAt && idx === 0 && (
                <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(placedAt)}</p>
              )}
            </div>
          </div>
        );
      })}

      {/* Cancelled state overlay text */}
      {isCancelled && (
        <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded text-[13px] font-semibold text-red-600">
          {status === 'returned' ? 'Order Returned' : 'Order Cancelled'}
        </div>
      )}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderById(id)
      .then(({ data }) => { if (data.success) setOrder(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-24 text-gray-400">
        <p className="text-lg font-semibold mb-2">Order not found</p>
        <Link to="/orders" className="text-[#8B1A2F] text-sm hover:underline">← Back to My Orders</Link>
      </div>
    );
  }

  const isDelivered = order.status === 'delivered';
  const activeIdx   = getActiveIndex(order.status);
  const estDelivery = addDays(5 - activeIdx < 1 ? 1 : 5 - activeIdx);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
              Track Order
            </h1>
            <p className="text-[13px] text-gray-500 mt-0.5">Order #ORD-{order.id} · Placed on {formatDate(order.created_at)}</p>
          </div>
          <Link
            to="/orders"
            className="text-[12px] font-semibold text-[#8B1A2F] border border-[#8B1A2F] px-3 py-1.5 hover:bg-[#8B1A2F] hover:text-white transition-colors"
          >
            ← My Orders
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left: Tracking timeline ── */}
          <div className="w-full lg:w-[340px] shrink-0">

            {/* Delivery banner */}
            <div className={`px-5 py-4 mb-4 ${isDelivered ? 'bg-green-600' : 'bg-[#8B1A2F]'} text-white`}>
              <p className="text-[11px] font-semibold uppercase tracking-widest opacity-80 mb-1">
                {isDelivered ? 'Delivered On' : 'Estimated Delivery'}
              </p>
              <p className="text-[18px] font-bold">{estDelivery}</p>
            </div>

            {/* Timeline card */}
            <div className="bg-white border border-gray-200 px-5 py-5">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Order Status</p>
              <TrackingTimeline status={order.status} placedAt={order.created_at} />
            </div>

            {/* Delivery address */}
            {(order.address_full_name || order.line1) && (
              <div className="bg-white border border-gray-200 px-5 py-4 mt-4">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Delivering To</p>
                {order.address_full_name && (
                  <p className="text-[13px] font-semibold text-gray-800">{order.address_full_name}</p>
                )}
                <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">
                  {[order.line1, order.line2, order.city, order.state, order.pincode].filter(Boolean).join(', ')}
                </p>
                {order.label && (
                  <span className="mt-2 inline-block text-[10px] border border-gray-200 px-1.5 py-0.5 text-gray-500 capitalize rounded">
                    {order.label}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ── Right: Order items + summary ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Items */}
            <div className="bg-white border border-gray-200">
              <div className="px-5 py-3 border-b border-gray-100">
                <p className="text-[13px] font-bold text-gray-800 uppercase tracking-wide">
                  {(order.items ?? []).length} {(order.items ?? []).length === 1 ? 'Item' : 'Items'} in this Order
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {(order.items ?? []).map((item) => (
                  <div key={item.id} className="flex gap-3 px-5 py-4 items-start">
                    {/* Image */}
                    <div className="w-[70px] h-[88px] shrink-0 bg-gray-100 overflow-hidden">
                      {item.image
                        ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gray-200" />
                      }
                    </div>
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      {item.brand && (
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{item.brand}</p>
                      )}
                      <p className="text-[13px] font-medium text-gray-900 leading-snug line-clamp-2">{item.title}</p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {[item.size && `Size: ${item.size}`, item.color].filter(Boolean).join(' · ')} · Qty: {item.quantity}
                      </p>
                      <p className="text-[13px] font-bold text-gray-900 mt-1.5">
                        {formatPrice(Number(item.unit_price) * item.quantity)}
                      </p>
                    </div>
                    {/* Review link if delivered */}
                    {isDelivered && item.slug && (
                      <Link
                        to={`/product/${item.slug}?review=1`}
                        className="shrink-0 text-[11px] text-[#8B1A2F] border border-[#8B1A2F] px-2 py-1 hover:bg-[#8B1A2F] hover:text-white transition-colors mt-1"
                      >
                        Rate
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Price summary */}
            <div className="bg-white border border-gray-200 px-5 py-4">
              <p className="text-[13px] font-bold text-gray-800 uppercase tracking-wide mb-3">Price Summary</p>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">{formatPrice(order.subtotal)}</span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-[#8B1A2F]">
                    <span>Discount</span>
                    <span className="font-medium">− {formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-gray-900">
                    {Number(order.shipping) === 0 ? 'Free' : formatPrice(order.shipping)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900">
                  <span>Total Paid</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link
              to="/"
              className="block w-full py-3.5 text-center bg-gray-900 text-white font-bold text-sm tracking-widest hover:bg-black transition-colors"
            >
              Continue Shopping
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
