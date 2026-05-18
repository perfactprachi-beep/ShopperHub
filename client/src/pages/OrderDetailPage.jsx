import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getOrderById, cancelOrder } from '../api/ordersApi.js';
import OrderStatusStepper from '../components/order/OrderStatusStepper.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { useToastStore } from '../store/toastStore.js';

function formatPrice(n) {
  return `₹${Number(n).toLocaleString('en-IN')}`;
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const PAYMENT_STATUS_COLORS = {
  paid:    'text-green-600',
  pending: 'text-yellow-600',
  failed:  'text-red-600',
};

function CancelConfirmModal({ order, onConfirm, onClose, cancelling }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-[360px] shadow-2xl">
        <div className="h-1 bg-[#8B1A2F] w-full" />
        <div className="px-6 pt-6 pb-5">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8B1A2F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
          </div>
          <h2 className="text-[16px] font-bold text-gray-900 text-center mb-1">Cancel This Order?</h2>
          <p className="text-[12px] text-gray-400 text-center mb-5">
            Order <span className="font-semibold text-gray-600">#ORD-{order.id}</span> will be cancelled and your payment will be refunded if applicable.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={cancelling}
              className="flex-1 py-3 border border-gray-300 text-gray-700 text-[12px] font-bold uppercase tracking-widest hover:border-gray-500 transition-colors disabled:opacity-50"
            >
              Keep Order
            </button>
            <button
              onClick={onConfirm}
              disabled={cancelling}
              className="flex-1 py-3 bg-[#8B1A2F] text-white text-[12px] font-bold uppercase tracking-widest hover:bg-[#6d1424] transition-colors disabled:opacity-50"
            >
              {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const showSuccess = searchParams.get('success') === 'true';
  const addToast = useToastStore((s) => s.addToast);

  const [order, setOrder]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    getOrderById(id)
      .then(({ data }) => { if (data.success) setOrder(data.data); })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleCancel() {
    setCancelling(true);
    try {
      const { data } = await cancelOrder(id);
      if (data.success) {
        setOrder((o) => ({ ...o, status: 'cancelled' }));
        addToast('Order cancelled successfully', 'success');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to cancel order';
      addToast(msg, 'error');
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!order)  return <div className="text-center py-20 text-[var(--color-muted)]">Order not found.</div>;

  const canCancel = ['pending', 'confirmed'].includes(order.status);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Success banner */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-[var(--radius-md)] text-green-800 text-sm font-medium">
          🎉 Payment successful! Your order has been placed.
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-heading)' }}>
            Order #ORD-{order.id}
          </h1>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">Placed on {formatDate(order.created_at)}</p>
        </div>
        <Link to="/orders" className="text-sm text-[var(--color-primary)] hover:underline">← My Orders</Link>
      </div>

      {/* Status Stepper */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5 mb-4">
        <OrderStatusStepper status={order.status} />
      </div>

      {/* Store Pickup Details */}
      {order.delivery_method === 'store_pickup' && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 mb-4">
          <h2 className="text-sm font-semibold text-[var(--color-text)] mb-3">Store Pickup Details</h2>
          <div className="flex flex-col gap-1.5 text-sm text-[var(--color-muted)]">
            {order.store_name && (
              <div className="flex gap-2"><span>Store:</span><span className="text-[var(--color-text)] font-medium">{order.store_name}</span></div>
            )}
            {order.store_address && (
              <div className="flex gap-2"><span>Address:</span><span>{order.store_address}</span></div>
            )}
            {order.store_timing && (
              <div className="flex gap-2"><span>Timing:</span><span>{order.store_timing}</span></div>
            )}
            {order.pickup_pin && (
              <div className="flex items-center gap-2 mt-1">
                <span>Pickup PIN:</span>
                <span className="text-[var(--color-primary)] font-bold text-xl tracking-widest">{order.pickup_pin}</span>
                <span className="text-xs">(show this at store)</span>
              </div>
            )}
            {order.pickup_status && (
              <div className="flex items-center gap-2 mt-1">
                <span>Status:</span>
                <span className={`font-semibold capitalize px-2 py-0.5 rounded text-xs ${
                  order.pickup_status === 'ready'     ? 'bg-green-50 text-green-700' :
                  order.pickup_status === 'collected' ? 'bg-gray-100 text-gray-600' :
                  order.pickup_status === 'expired'   ? 'bg-red-50 text-red-600' :
                  'bg-yellow-50 text-yellow-700'
                }`}>{order.pickup_status}</span>
              </div>
            )}
          </div>
          {order.pickup_status !== 'ready' && order.pickup_status !== 'collected' && (
            <p className="text-xs text-[var(--color-muted)] mt-3 leading-relaxed">
              We'll notify you when your order is ready for pickup. Orders held for 7 days from confirmation.
            </p>
          )}
        </div>
      )}

      {/* Delivery Address */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 mb-4">
        <h2 className="text-sm font-semibold text-[var(--color-text)] mb-2">Delivery Address</h2>
        <p className="text-sm text-[var(--color-text)]">
          {order.address_full_name && <strong>{order.address_full_name}</strong>}
          {order.address_phone && <span className="text-[var(--color-muted)]"> · {order.address_phone}</span>}
        </p>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">
          {[order.line1, order.line2, order.city, order.state, order.pincode].filter(Boolean).join(', ')}
        </p>
        {order.label && (
          <span className="mt-1 inline-block text-[10px] border border-[var(--color-border)] rounded px-1.5 py-0.5 text-[var(--color-muted)] capitalize">{order.label}</span>
        )}
      </div>

      {/* Items */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 mb-4">
        <h2 className="text-sm font-semibold text-[var(--color-text)] mb-3">Items</h2>
        <div className="flex flex-col gap-3">
          {(order.items ?? []).map((item) => (
            <div key={item.id} className="flex gap-3 items-start">
              <div className="w-14 h-14 shrink-0 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--color-bg)]">
                {item.image
                  ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-[var(--color-border)]" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text)] truncate">{item.title}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  {[item.size, item.color].filter(Boolean).join(' · ')} · Qty {item.quantity}
                </p>
                <p className="text-sm font-semibold text-[var(--color-text)] mt-0.5">{formatPrice(item.unit_price * item.quantity)}</p>
              </div>
              {order.status === 'delivered' && (
                <Link
                  to={`/product/${item.slug}?review=1`}
                  className="text-xs text-[var(--color-primary)] hover:underline shrink-0 mt-1"
                >
                  Write a Review
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Price Summary */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 mb-4">
        <h2 className="text-sm font-semibold text-[var(--color-text)] mb-3">Price Summary</h2>
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between text-[var(--color-muted)]">
            <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
          </div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span><span>−{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-[var(--color-muted)]">
            <span>Shipping</span><span>{Number(order.shipping) === 0 ? 'Free' : formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between font-bold text-[var(--color-text)] border-t border-[var(--color-border)] pt-2 mt-1">
            <span>Total</span><span>{formatPrice(order.total)}</span>
          </div>
          {order.points_earned > 0 && (
            <p className="text-xs text-amber-600 mt-1">+{order.points_earned} First Citizen points earned</p>
          )}
        </div>
      </div>

      {/* Payment Info */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 mb-4">
        <h2 className="text-sm font-semibold text-[var(--color-text)] mb-2">Payment</h2>
        <div className="text-sm text-[var(--color-muted)] flex flex-col gap-1">
          <div className="flex justify-between">
            <span>Method</span>
            <span className="capitalize text-[var(--color-text)]">{order.payment_method?.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span>Status</span>
            <span className={`font-medium capitalize ${PAYMENT_STATUS_COLORS[order.payment_status] ?? ''}`}>{order.payment_status}</span>
          </div>
          {order.razorpay_order_id && (
            <div className="flex justify-between">
              <span>Razorpay ID</span>
              <span className="text-[var(--color-text)] font-mono text-xs">{order.razorpay_order_id}</span>
            </div>
          )}
        </div>
      </div>

      {/* Cancel */}
      {canCancel && (
        <button
          onClick={() => setShowCancelModal(true)}
          className="w-full py-2.5 text-sm font-medium border border-[var(--color-error)] text-[var(--color-error)] rounded-[var(--radius-md)] hover:bg-red-50 transition-colors"
        >
          Cancel Order
        </button>
      )}

      {showCancelModal && (
        <CancelConfirmModal
          order={order}
          onConfirm={handleCancel}
          onClose={() => !cancelling && setShowCancelModal(false)}
          cancelling={cancelling}
        />
      )}
    </div>
  );
}
