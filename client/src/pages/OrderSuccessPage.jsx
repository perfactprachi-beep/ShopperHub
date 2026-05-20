import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchOrder } from '../api/paymentsApi.js';
import { DEFAULT_PRODUCT_IMAGE } from '../utils/getProductPlaceholder.js';

function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function OrderSuccessPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder(id)
      .then(({ order, items }) => { setOrder(order); setItems(items); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Confetti burst */}
      <div className="relative flex justify-center mb-6">
        <div className="confetti-burst absolute inset-0 pointer-events-none" aria-hidden="true" />
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl shadow-sm">
          ✅
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Order Placed Successfully!</h1>
      <p className="text-gray-500 text-center mb-6">
        Thank you for shopping with ShoppersHub.
      </p>

      {!loading && order && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Order ID</span>
            <span className="font-semibold text-gray-800">#{order.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Amount Paid</span>
            <span className="font-semibold text-gray-800">
              ₹{Number(order.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Points Earned</span>
            <span className="font-semibold text-green-700">+{order.points_earned} First Citizen Points</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Estimated Delivery</span>
            <span className="font-semibold text-gray-800">{addDays(5)}</span>
          </div>

          {items.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Items</p>
              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.image || DEFAULT_PRODUCT_IMAGE}
                      alt={item.title}
                      onError={e => { if (e.currentTarget.src !== DEFAULT_PRODUCT_IMAGE) e.currentTarget.src = DEFAULT_PRODUCT_IMAGE; }}
                      className="w-12 h-12 object-cover rounded-lg bg-gray-50 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                      <p className="text-xs text-gray-500">
                        {item.size && `Size: ${item.size}`}{item.color && ` · ${item.color}`} · Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 shrink-0">
                      ₹{(Number(item.unit_price) * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-6 text-center text-gray-400 text-sm">
          Loading order details…
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/"
          className="flex-1 py-3 text-center border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
          Continue Shopping
        </Link>
        <button onClick={() => navigate(`/track/${id}`)}
          className="flex-1 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition-colors">
          Track Order #{id}
        </button>
      </div>
    </div>
  );
}
