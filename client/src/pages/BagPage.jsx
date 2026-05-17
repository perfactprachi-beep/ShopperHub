import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore.js';
import { useWishlistStore } from '../store/wishlistStore.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToastStore } from '../store/toastStore.js';
import { useUiStore } from '../store/uiStore.js';
import { updateCartItem, removeCartItem, fetchCart } from '../api/cartApi.js';
import { toggleWishlist } from '../api/wishlistApi.js';
import { validateCoupon, getActiveCoupons } from '../api/couponsApi.js';
import { fetchAddresses, createAddress } from '../api/addressApi.js';
import { formatPrice } from '../utils/formatPrice.js';
import AddressForm from '../components/address/AddressForm.jsx';
import Spinner from '../components/ui/Spinner.jsx';

const FREE_SHIPPING_THRESHOLD = 999;
const DELIVERY_FEE = 99;

/* ── Delete confirmation modal ────────────────────────────────────────────── */
function DeleteConfirmModal({ item, onConfirm, onCancel }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-[360px] shadow-2xl animate-[fadeUp_0.18s_ease-out]">
        {/* Top bar */}
        <div className="h-1 bg-[#8B1A2F] w-full" />

        <div className="px-6 pt-6 pb-5">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8B1A2F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-[16px] font-bold text-gray-900 text-center mb-1">Remove from Bag?</h2>
          <p className="text-[12px] text-gray-400 text-center mb-5">This item will be removed from your bag.</p>

          {/* Product preview */}
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 p-3 mb-6">
            {item.image && (
              <img src={item.image} alt={item.title} className="w-12 h-16 object-cover shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              {item.brand && (
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{item.brand}</p>
              )}
              <p className="text-[12px] font-medium text-gray-900 leading-snug line-clamp-2">{item.title}</p>
              {(item.size || item.color) && (
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {item.size && `Size: ${item.size}`}
                  {item.size && item.color && ' · '}
                  {item.color && item.color}
                </p>
              )}
              <p className="text-[13px] font-bold text-gray-900 mt-1">{formatPrice(item.price)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 border border-gray-300 text-gray-700 text-[12px] font-bold uppercase tracking-widest hover:border-gray-500 transition-colors"
            >
              Keep in Bag
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 bg-[#8B1A2F] text-white text-[12px] font-bold uppercase tracking-widest hover:bg-[#6d1424] transition-colors"
            >
              Yes, Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function deliveryDate() {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ── Checkout stepper ─────────────────────────────────────────────────────── */
function CheckoutStepper({ active = 0 }) {
  const steps = ['Bag', 'Address', 'Payment'];
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-center gap-0">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition-colors ${
                i < active
                  ? 'bg-[#8B1A2F] border-[#8B1A2F] text-white'
                  : i === active
                    ? 'border-gray-900 text-gray-900'
                    : 'border-gray-300 text-gray-400'
              }`}>
                {i < active
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : i + 1}
              </div>
              <span className={`text-[11px] mt-1.5 font-semibold whitespace-nowrap ${
                i === active ? 'text-gray-900' : i < active ? 'text-[#8B1A2F]' : 'text-gray-400'
              }`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-28 sm:w-48 h-0.5 mx-2 mb-4 ${i < active ? 'bg-[#8B1A2F]' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Free delivery progress bar ───────────────────────────────────────────── */
function FreeDeliveryBar({ total }) {
  if (total >= FREE_SHIPPING_THRESHOLD) {
    return (
      <div className="bg-green-50 border border-green-200 px-4 py-2.5 flex items-center gap-2 text-[13px] text-green-700 font-semibold mb-3">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        Yay! You get FREE delivery on this order.
      </div>
    );
  }
  const remaining = FREE_SHIPPING_THRESHOLD - total;
  const pct = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
  return (
    <div className="bg-white border border-gray-200 px-4 py-3 mb-3">
      <p className="text-[12px] text-gray-600 mb-1.5">
        Add <span className="font-bold text-[#8B1A2F]">{formatPrice(remaining)}</span> more for{' '}
        <span className="font-bold text-gray-900">FREE delivery</span>
      </p>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-[#8B1A2F] rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ── Cart item card ───────────────────────────────────────────────────────── */
function CartItem({ item, onQty, onRemove, onMoveToWishlist }) {
  const mrp = item.mrp || item.price;
  const hasDiscount = mrp > item.price;
  const discountPct = hasDiscount ? Math.round(((mrp - item.price) / mrp) * 100) : 0;

  return (
    <div className="bg-white border border-gray-200">
      <div className="flex gap-4 p-4">
        {/* Product image */}
        <Link
          to={item.slug ? `/product/${item.slug}` : '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <div className="w-[90px] h-[120px] bg-gray-50 overflow-hidden border border-gray-100">
            {item.image
              ? <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              : <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">No image</div>
            }
          </div>
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Brand + remove */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {item.brand && (
                <p className="text-[14px] font-bold text-gray-900 uppercase tracking-wide leading-tight">{item.brand}</p>
              )}
              <p className="text-[12px] text-gray-500 mt-0.5 leading-snug line-clamp-2">{item.title}</p>
            </div>
            <button
              onClick={() => onRemove(item)}
              className="shrink-0 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#8B1A2F] transition-colors"
              aria-label="Remove"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>

          {/* Color | Size */}
          {(item.color || item.size) && (
            <div className="flex items-center gap-3 mt-2 text-[12px] text-gray-600">
              {item.color && (
                <span className="capitalize">
                  <span className="text-gray-400">Color:</span> {item.color}
                </span>
              )}
              {item.size && (
                <span>
                  <span className="text-gray-400">Size:</span> <span className="font-semibold text-gray-900">{item.size}</span>
                </span>
              )}
            </div>
          )}

          {/* Price row */}
          <div className="flex items-center gap-2 mt-2.5">
            <span className="text-[15px] font-bold text-gray-900">{formatPrice(item.price)}</span>
            {hasDiscount && (
              <>
                <span className="text-[12px] text-gray-400 line-through">{formatPrice(mrp)}</span>
                <span className="text-[12px] font-bold text-[#2E7D32]">{discountPct}% Off</span>
              </>
            )}
          </div>

          {/* Qty stepper */}
          <div className="flex items-stretch border border-gray-300 h-8 w-fit mt-3">
            <button
              onClick={() => onQty(item, -1)}
              className="w-9 flex items-center justify-center text-gray-700 hover:bg-gray-50 text-lg font-light transition-colors select-none"
            >
              −
            </button>
            <div className="w-9 flex items-center justify-center text-[13px] font-bold border-x border-gray-300 text-gray-900">
              {item.quantity}
            </div>
            <button
              onClick={() => onQty(item, +1)}
              className="w-9 flex items-center justify-center text-gray-700 hover:bg-gray-50 text-lg font-light transition-colors select-none"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Bottom strip: promo + delivery + wishlist */}
      <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {hasDiscount && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B1A2F] bg-red-50 border border-red-100 px-2 py-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              1 Promotion Applied &gt;
            </span>
          )}
          <p className="text-[11px] text-gray-400">
            Delivery by <span className="font-semibold text-gray-600">{deliveryDate()}</span>
          </p>
        </div>
        <button
          onClick={() => onMoveToWishlist(item)}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 hover:text-[#8B1A2F] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          MOVE TO WISHLIST
        </button>
      </div>
    </div>
  );
}

/* ── Coupon input ─────────────────────────────────────────────────────────── */
function CouponSection({ cartTotal, onCouponApplied, appliedCoupon, onCouponRemove }) {
  const [code, setCode]           = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [coupons, setCoupons]     = useState([]);
  const [showList, setShowList]   = useState(false);
  const { addToast } = useToastStore();

  useEffect(() => {
    getActiveCoupons().then(setCoupons).catch(() => {});
  }, []);

  const applyCode = async (trimmed) => {
    if (!trimmed) return;
    setLoading(true);
    setError('');
    try {
      const res = await validateCoupon(trimmed, cartTotal);
      onCouponApplied({ ...res, code: trimmed, discountAmount: res.discount ?? res.discountAmount ?? 0 });
      setCode('');
      setShowList(false);
      addToast(`Coupon "${trimmed}" applied!`, 'success');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid or expired coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => applyCode(code.trim().toUpperCase());

  const couponLabel = (c) => {
    if (c.type === 'flat') return `Flat ₹${c.value} off`;
    return `${c.value}% off`;
  };

  /* ── Applied state ── */
  if (appliedCoupon) {
    return (
      <div className="bg-white border border-gray-200">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B1A2F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          <span className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">Coupon Applied</span>
        </div>
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 border-dashed px-3 py-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span className="text-[13px] font-bold text-green-800 tracking-widest">{appliedCoupon.code}</span>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-green-700">
                You save {formatPrice(appliedCoupon.discountAmount)}
              </p>
              <p className="text-[11px] text-gray-400">Discount applied to total</p>
            </div>
          </div>
          <button
            onClick={onCouponRemove}
            className="shrink-0 text-[11px] font-bold text-[#8B1A2F] border border-[#8B1A2F]/40 px-3 py-1.5 hover:bg-[#8B1A2F] hover:text-white transition-colors uppercase tracking-wide"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  /* ── Input + available coupons state ── */
  return (
    <div className="bg-white border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
          <line x1="7" y1="7" x2="7.01" y2="7"/>
        </svg>
        <span className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">Apply Coupon</span>
        {coupons.length > 0 && (
          <button
            onClick={() => setShowList((v) => !v)}
            className="ml-auto text-[11px] font-semibold text-[#8B1A2F] hover:underline underline-offset-2 flex items-center gap-1"
          >
            {showList ? 'Hide' : `${coupons.length} Available`}
            <svg
              width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              className={`transition-transform duration-200 ${showList ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        )}
      </div>

      {/* Input row */}
      <div className="px-4 py-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            placeholder="Enter coupon code"
            className="flex-1 border border-gray-300 px-3 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-[#8B1A2F] uppercase tracking-widest placeholder:font-normal placeholder:tracking-normal"
          />
          <button
            onClick={handleApply}
            disabled={loading || !code.trim()}
            className="px-5 py-2.5 bg-[#8B1A2F] text-white text-[12px] font-bold uppercase tracking-widest hover:bg-[#6d1424] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? '…' : 'Apply'}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-[11px] text-red-600 flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </p>
        )}
      </div>

      {/* Available coupons list */}
      {showList && coupons.length > 0 && (
        <div className="border-t border-gray-100 px-4 pb-3 space-y-2.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-3">Available Coupons</p>
          {coupons.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 border border-dashed border-gray-200 p-3 hover:border-[#8B1A2F]/40 transition-colors">
              <div className="flex-1 min-w-0">
                {/* Code chip */}
                <div className="inline-flex items-center gap-1.5 bg-[#8B1A2F]/[0.06] border border-[#8B1A2F]/25 px-2.5 py-1 mb-1.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8B1A2F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                  </svg>
                  <span className="text-[12px] font-bold text-[#8B1A2F] tracking-widest">{c.code}</span>
                </div>
                {/* Description */}
                <p className="text-[12px] font-semibold text-gray-800">{couponLabel(c)}</p>
                {c.min_order > 0 && (
                  <p className="text-[11px] text-gray-400 mt-0.5">Min. order {formatPrice(c.min_order)}</p>
                )}
              </div>
              <button
                onClick={() => applyCode(c.code)}
                disabled={loading}
                className="shrink-0 text-[12px] font-bold text-[#8B1A2F] border border-[#8B1A2F] px-4 py-2 hover:bg-[#8B1A2F] hover:text-white transition-colors uppercase tracking-wide disabled:opacity-40"
              >
                Apply
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Price summary panel ──────────────────────────────────────────────────── */
function PricePanel({ items, cartTotal, shipping, appliedCoupon, onCouponApplied, onCouponRemove, onPlaceOrder }) {
  const totalMRP       = items.reduce((sum, i) => sum + (i.mrp || i.price) * i.quantity, 0);
  const offerDiscount  = totalMRP - cartTotal;
  const couponDiscount = Number(appliedCoupon?.discountAmount ?? appliedCoupon?.discount ?? 0);
  const grandTotal     = Math.max(0, cartTotal - couponDiscount + shipping);
  const totalSavings   = offerDiscount + couponDiscount;

  return (
    <div className="space-y-3">
      {/* Coupon */}
      <CouponSection
        cartTotal={cartTotal}
        onCouponApplied={onCouponApplied}
        appliedCoupon={appliedCoupon}
        onCouponRemove={onCouponRemove}
      />

      {/* Price Details */}
      <div className="bg-white border border-gray-200">
        <div className="px-5 pt-4 pb-2">
          <h2 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-4">Price Details</h2>

          <div className="space-y-3 text-[13px]">
            <div className="flex justify-between">
              <span className="text-gray-600">Total MRP</span>
              <span className="font-medium text-gray-900">{formatPrice(totalMRP)}</span>
            </div>

            {offerDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Discount on MRP</span>
                <span className="font-semibold text-[#2E7D32]">− {formatPrice(offerDiscount)}</span>
              </div>
            )}

            {couponDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Coupon
                  {appliedCoupon?.code && (
                    <span className="ml-1.5 text-[10px] font-bold text-[#8B1A2F] bg-red-50 border border-red-100 px-1.5 py-0.5 tracking-wider">
                      {appliedCoupon.code}
                    </span>
                  )}
                </span>
                <span className="font-semibold text-[#2E7D32]">− {formatPrice(couponDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span className={`font-semibold ${shipping === 0 ? 'text-[#2E7D32]' : 'text-gray-900'}`}>
                {shipping === 0 ? 'FREE' : formatPrice(shipping)}
              </span>
            </div>
          </div>
        </div>

        {/* Divider + Total */}
        <div className="mx-5 border-t border-dashed border-gray-200 my-3" />
        <div className="px-5 pb-4 flex justify-between items-center">
          <span className="text-[14px] font-bold text-gray-900">Total Payable</span>
          <span className="text-[18px] font-bold text-gray-900">{formatPrice(grandTotal)}</span>
        </div>

        {/* Savings banner */}
        {totalSavings > 0 && (
          <div className="mx-5 mb-4 py-2.5 px-3 bg-green-50 border border-green-200 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span className="text-[12px] font-bold text-green-700">
              You will save {formatPrice(totalSavings)} on this order!
            </span>
          </div>
        )}

        {/* Place Order */}
        <div className="px-5 pb-5">
          <button
            onClick={onPlaceOrder}
            className="w-full py-4 bg-[#8B1A2F] text-white font-bold text-[13px] tracking-[0.12em] uppercase hover:bg-[#6d1424] transition-colors"
          >
            PLACE ORDER
          </button>
        </div>
      </div>

      {/* Trust badges */}
      <div className="bg-white border border-gray-200 px-4 py-3 grid grid-cols-3 divide-x divide-gray-100">
        {[
          { svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>, label: '100% Authentic' },
          { svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, label: 'Secure Payment' },
          { svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.87"/></svg>, label: 'Easy Returns' },
        ].map(({ svg, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 py-2 px-1">
            {svg}
            <span className="text-[10px] font-medium text-gray-500 text-center leading-tight">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Deliver-to card (inline, left column) ───────────────────────────────── */
function AddressCard({ addr, onChangeClick, isLoggedIn, onLoginClick }) {
  const PinIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );

  if (!isLoggedIn) {
    return (
      <div className="bg-white border border-gray-200">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          <PinIcon />
          <span className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">Deliver To</span>
        </div>
        <div className="px-4 py-4 flex items-center justify-between gap-4">
          <p className="text-[13px] text-gray-500">Please select a delivery address to continue.</p>
          <button
            onClick={onChangeClick}
            className="shrink-0 px-5 py-2 border border-[#8B1A2F] text-[#8B1A2F] text-[12px] font-bold uppercase tracking-widest hover:bg-[#8B1A2F] hover:text-white transition-colors"
          >
            Select Address
          </button>
        </div>
      </div>
    );
  }

  if (!addr) {
    return (
      <div className="bg-white border border-gray-200">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          <PinIcon />
          <span className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">Deliver To</span>
        </div>
        <div className="px-4 py-4 flex items-center justify-between gap-4">
          <p className="text-[13px] text-gray-500">No address selected. Please select a delivery address.</p>
          <button
            onClick={onChangeClick}
            className="shrink-0 px-5 py-2 border border-[#8B1A2F] text-[#8B1A2F] text-[12px] font-bold uppercase tracking-widest hover:bg-[#8B1A2F] hover:text-white transition-colors"
          >
            SELECT ADDRESS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200">
      {/* Strip header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#8B1A2F" stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          <span className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">Deliver To</span>
        </div>
        <button
          onClick={onChangeClick}
          className="text-[12px] font-bold text-[#8B1A2F] hover:underline underline-offset-2 transition-colors"
        >
          CHANGE
        </button>
      </div>
      {/* Address body */}
      <div className="px-4 py-3 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#8B1A2F]/10 text-[#8B1A2F] uppercase tracking-wide rounded-sm">
              {addr.label || 'Home'}
            </span>
            {addr.is_default && (
              <span className="text-[10px] text-gray-400 font-medium">Default</span>
            )}
          </div>
          <p className="text-[13px] font-bold text-gray-900">
            {addr.full_name}
            {addr.phone && <span className="font-normal text-gray-500 ml-2 text-[12px]">{addr.phone}</span>}
          </p>
          <p className="text-[12px] text-gray-500 mt-0.5 leading-snug">
            {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} – {addr.pincode}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Address selection drawer ─────────────────────────────────────────────── */
function AddressDrawer({ open, onClose, addresses, selectedId, onSelect, onAddAddress, loading, saving, isLoggedIn, onRequireLogin }) {
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!open) setShowForm(false);
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-[70] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-[15px] font-bold text-gray-900 uppercase tracking-wide">Select Delivery Address</h2>
            {addresses.length > 0 && !loading && (
              <p className="text-[11px] text-gray-400 mt-0.5">{addresses.length} saved {addresses.length === 1 ? 'address' : 'addresses'}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <div className="px-5 py-4 space-y-3">

              {/* Address cards */}
              {addresses.map((addr) => {
                const isSelected = selectedId === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => onSelect(addr)}
                    className={`border p-4 cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'border-[#8B1A2F] bg-[#8B1A2F]/[0.03]'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Custom radio */}
                      <div className={`mt-0.5 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'border-[#8B1A2F]' : 'border-gray-400'
                      }`}>
                        {isSelected && <div className="w-[8px] h-[8px] rounded-full bg-[#8B1A2F]" />}
                      </div>

                      {/* Address info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide ${
                            isSelected
                              ? 'bg-[#8B1A2F]/10 text-[#8B1A2F]'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {addr.label || 'Home'}
                          </span>
                          {addr.is_default && (
                            <span className="text-[10px] font-semibold text-[#8B1A2F] border border-[#8B1A2F]/30 px-1.5 py-0.5">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] font-bold text-gray-900 leading-snug">
                          {addr.full_name}
                        </p>
                        <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''},{' '}
                          {addr.city}, {addr.state} – {addr.pincode}
                        </p>
                        {addr.phone && (
                          <p className="text-[12px] text-gray-400 mt-0.5">
                            Mobile: <span className="font-medium text-gray-600">{addr.phone}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add New Address */}
              {!showForm ? (
                <button
                  onClick={() => {
                    if (!isLoggedIn) { onRequireLogin?.(); return; }
                    setShowForm(true);
                  }}
                  className="w-full flex items-center gap-2.5 p-4 border border-dashed border-gray-300 text-[13px] font-semibold text-[#8B1A2F] hover:border-[#8B1A2F] hover:bg-red-50/40 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full border-2 border-[#8B1A2F] flex items-center justify-center shrink-0">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </div>
                  ADD NEW ADDRESS
                </button>
              ) : (
                <div className="border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[13px] font-bold text-gray-800 uppercase tracking-wide">New Address</h3>
                    <button
                      onClick={() => setShowForm(false)}
                      className="text-[11px] text-gray-500 hover:text-gray-800 underline underline-offset-2"
                    >
                      Cancel
                    </button>
                  </div>
                  <AddressForm
                    onSubmit={(form) => onAddAddress(form, () => setShowForm(false))}
                    onCancel={() => setShowForm(false)}
                    loading={saving}
                  />
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer — DELIVER HERE */}
        {selectedId && !showForm && (
          <div className="border-t border-gray-200 px-5 py-4 bg-white shrink-0">
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-[#8B1A2F] text-white font-bold text-[13px] uppercase tracking-[0.12em] hover:bg-[#6d1424] transition-colors"
            >
              DELIVER HERE
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Empty state ──────────────────────────────────────────────────────────── */
function EmptyBag() {
  return (
    <>
      <CheckoutStepper active={0} />
      <div className="min-h-[65vh] bg-gray-50 flex flex-col items-center justify-center gap-5 px-4">
        <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1" strokeLinecap="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
          Your Bag is Empty
        </h1>
        <p className="text-gray-400 text-sm">Looks like you haven't added anything yet.</p>
        <Link
          to="/"
          className="mt-2 px-8 py-3 bg-[#8B1A2F] text-white font-bold text-sm uppercase tracking-widest hover:bg-[#6d1424] transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </>
  );
}

/* ── Main page ────────────────────────────────────────────────────────────── */
export default function BagPage() {
  const { items, removeItem, updateQty, setItems, subtotal, itemCount } = useCartStore();
  const { toggle: toggleWL, has: inWL } = useWishlistStore();
  const { isLoggedIn } = useAuth();
  const { addToast }   = useToastStore();
  const { openLoginModal } = useUiStore();
  const navigate       = useNavigate();

  const [appliedCoupon, setAppliedCoupon]     = useState(null);
  const [addresses, setAddresses]             = useState([]);
  const [selectedAddr, setSelectedAddr]       = useState(null);
  const [addrDrawerOpen, setAddrDrawerOpen]   = useState(false);
  const [addrLoading, setAddrLoading]         = useState(false);
  const [addrSaving, setAddrSaving]           = useState(false);
  const [itemToDelete, setItemToDelete]       = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchCart().then((data) => setItems(data.items)).catch(() => {});
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    setAddrLoading(true);
    fetchAddresses()
      .then((list) => {
        setAddresses(list);
        const def = list.find((a) => a.is_default) || list[0];
        if (def) setSelectedAddr(def);
      })
      .catch(() => {})
      .finally(() => setAddrLoading(false));
  }, [isLoggedIn]);

  const handleAddAddress = async (form, onSuccess) => {
    if (!isLoggedIn) { openLoginModal(); return; }
    setAddrSaving(true);
    try {
      const addr = await createAddress(form);
      setAddresses((prev) => [...prev, addr]);
      setSelectedAddr(addr);
      onSuccess?.();
      addToast('Address added', 'success');
    } catch {
      addToast('Failed to add address', 'error');
    } finally {
      setAddrSaving(false);
    }
  };

  const handleQty = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      setItemToDelete(item);
      return;
    }
    if (isLoggedIn && item.itemId) { try { await updateCartItem(item.itemId, { quantity: newQty }); } catch {} }
    updateQty(item.variantId, newQty);
  };

  const handleRemove = (item) => {
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    if (isLoggedIn && itemToDelete.itemId) { try { await removeCartItem(itemToDelete.itemId); } catch {} }
    removeItem(itemToDelete.variantId);
    addToast('Item removed from bag', 'success');
    setItemToDelete(null);
  };

  const handleMoveToWishlist = async (item) => {
    if (!isLoggedIn) { openLoginModal(); return; }
    if (!inWL(item.productId)) {
      toggleWL(item.productId);
      try { await toggleWishlist(item.productId); } catch { toggleWL(item.productId); }
    }
    await handleRemove(item);
    addToast('Moved to wishlist', 'success');
  };

  const handlePlaceOrder = () => {
    if (!isLoggedIn) { openLoginModal(); return; }
    if (!selectedAddr) { setAddrDrawerOpen(true); addToast('Please select a delivery address', 'info'); return; }
    navigate('/checkout', { state: { coupon: appliedCoupon || null } });
  };

  const cartTotal  = subtotal();
  const count      = itemCount();
  const shipping   = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : DELIVERY_FEE;

  if (items.length === 0) return <EmptyBag />;

  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutStepper active={0} />

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Heading */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[18px] font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
            My Bag
            <span className="ml-2 text-[14px] font-normal text-gray-400">({count} {count === 1 ? 'item' : 'items'})</span>
          </h1>
          <Link to="/" className="text-[12px] font-semibold text-[#8B1A2F] hover:underline underline-offset-2">
            + Continue Shopping
          </Link>
        </div>

        {/* Deliver To — full width, always visible below the title */}
        <div className="mb-4">
          <AddressCard
            addr={selectedAddr}
            isLoggedIn={isLoggedIn}
            onChangeClick={() => setAddrDrawerOpen(true)}
            onLoginClick={openLoginModal}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ── Left: item list ── */}
          <div className="flex-1 min-w-0 space-y-3">
            <FreeDeliveryBar total={cartTotal} />

            {items.map((item) => (
              <CartItem
                key={item.variantId}
                item={item}
                onQty={handleQty}
                onRemove={handleRemove}
                onMoveToWishlist={handleMoveToWishlist}
              />
            ))}

          </div>

          {/* ── Right: price panel ── */}
          <div className="w-full lg:w-[360px] shrink-0 sticky top-20">
            <PricePanel
              items={items}
              cartTotal={cartTotal}
              shipping={shipping}
              appliedCoupon={appliedCoupon}
              onCouponApplied={setAppliedCoupon}
              onCouponRemove={() => setAppliedCoupon(null)}
              onPlaceOrder={handlePlaceOrder}
            />
          </div>

        </div>
      </div>

      <AddressDrawer
        open={addrDrawerOpen}
        onClose={() => setAddrDrawerOpen(false)}
        addresses={addresses}
        selectedId={selectedAddr?.id}
        onSelect={(addr) => setSelectedAddr(addr)}
        onAddAddress={handleAddAddress}
        loading={addrLoading}
        saving={addrSaving}
        isLoggedIn={isLoggedIn}
        onRequireLogin={() => { setAddrDrawerOpen(false); openLoginModal(); }}
      />

      <DeleteConfirmModal
        item={itemToDelete}
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
