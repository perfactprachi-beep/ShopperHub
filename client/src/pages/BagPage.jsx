import React, { useEffect, useRef, useState } from 'react';
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
import { calcFinalPrice } from '../utils/calcDiscount.js';
import { assetUrl } from '../utils/assetUrl.js';
import { getProductPlaceholder, DEFAULT_PRODUCT_IMAGE } from '../utils/getProductPlaceholder.js';
import AddressForm from '../components/address/AddressForm.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import api from '../api/axios.js';

const FREE_SHIPPING_THRESHOLD = 999;
const DELIVERY_FEE = 99;

/* ── Estimated delivery date ──────────────────────────────────────────────── */
function deliveryDate() {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/* ── Checkout Stepper ─────────────────────────────────────────────────────── */
function CheckoutStepper({ active = 0 }) {
  const steps = ['Bag', 'Address', 'Payment'];
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-center gap-0">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition-colors ${
                i < active ? 'bg-[#8B1A2F] border-[#8B1A2F] text-white'
                  : i === active ? 'border-gray-900 text-gray-900'
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

/* ── Delivery Address bar ─────────────────────────────────────────────────── */
function DeliveryAddressBar({ addr, isLoggedIn, onSelectClick }) {
  const pincode = addr?.pincode || '';
  return (
    <div className="bg-white border border-gray-200 flex items-center justify-between px-4 py-3 mb-4">
      <div className="flex items-center gap-2 text-[13px] text-gray-700">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8B1A2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <span className="text-gray-400">Delivery Address:</span>
        {addr ? (
          <span className="font-semibold text-gray-900">
            {pincode && `${pincode} — `}{addr.city || addr.full_name}
          </span>
        ) : (
          <span className="text-gray-400">Not selected</span>
        )}
      </div>
      <button
        onClick={onSelectClick}
        className="text-[12px] font-bold border border-[#8B1A2F] text-[#8B1A2F] px-4 py-1.5 hover:bg-[#8B1A2F] hover:text-white transition-colors uppercase tracking-wide shrink-0"
      >
        {addr ? 'Change' : 'Select Address'}
      </button>
    </div>
  );
}

/* ── Delete Confirmation Modal ────────────────────────────────────────────── */
function DeleteConfirmModal({ item, onConfirm, onCancel }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white w-full max-w-[360px] shadow-2xl">
        <div className="h-1 bg-[#8B1A2F] w-full" />
        <div className="px-6 pt-6 pb-5">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8B1A2F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </div>
          </div>
          <h2 className="text-[16px] font-bold text-gray-900 text-center mb-1">Remove from Bag?</h2>
          <p className="text-[12px] text-gray-400 text-center mb-5">This item will be removed from your bag.</p>
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 p-3 mb-6">
            <img
              src={item.image || DEFAULT_PRODUCT_IMAGE}
              alt={item.title}
              onError={e => { if (e.currentTarget.src !== DEFAULT_PRODUCT_IMAGE) e.currentTarget.src = DEFAULT_PRODUCT_IMAGE; }}
              className="w-12 h-16 object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              {item.brand && <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{item.brand}</p>}
              <p className="text-[12px] font-medium text-gray-900 leading-snug line-clamp-2">{item.title}</p>
              <p className="text-[13px] font-bold text-gray-900 mt-1">{formatPrice(item.price)}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onCancel}
              className="flex-1 py-3 border border-gray-300 text-gray-700 text-[12px] font-bold uppercase tracking-widest hover:border-gray-500 transition-colors">
              Keep in Bag
            </button>
            <button onClick={onConfirm}
              className="flex-1 py-3 bg-[#8B1A2F] text-white text-[12px] font-bold uppercase tracking-widest hover:bg-[#6d1424] transition-colors">
              Yes, Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Cart Item Card ───────────────────────────────────────────────────────── */
function CartItem({ item, onQty, onRemove, onMoveToWishlist }) {
  const mrp = item.mrp || item.price;
  const hasDiscount = mrp > item.price;
  const discountPct = hasDiscount ? Math.round(((mrp - item.price) / mrp) * 100) : 0;
  const isOOS = (item.stock ?? 1) === 0;
  const imgSrc = item.image || getProductPlaceholder({ title: item.title, brand_name: item.brand });

  return (
    <div className={`bg-white border-b ${isOOS ? 'border-red-200' : 'border-gray-200'}`}>
      {isOOS && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border-b border-red-100 text-[12px] font-semibold text-red-600">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Out of Stock — please remove this item to proceed
        </div>
      )}

      <div className="flex gap-4 p-4">
        {/* Image */}
        <Link to={item.slug ? `/product/${item.slug}` : '#'} target="_blank" rel="noopener noreferrer" className="shrink-0">
          <div className="w-[90px] h-[120px] bg-gray-50 overflow-hidden border border-gray-100">
            <img
              src={imgSrc}
              alt={item.title}
              onError={e => { e.currentTarget.src = getProductPlaceholder({ title: item.title, brand_name: item.brand }); }}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Brand + title + X */}
          <div className="flex items-start justify-between gap-3">
            <p className="text-[14px] leading-snug text-[#1A1A1A] flex-1 min-w-0">
              {item.brand && (
                <span className="font-bold">{item.brand} </span>
              )}
              <span className="font-normal text-[#555555]">{item.title}</span>
            </p>
            <button
              onClick={() => onRemove(item)}
              className="shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors mt-0.5"
              aria-label="Remove"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Color · Size */}
          {(item.color || item.size) && (
            <div className="flex items-center gap-2 mt-2 text-[13px] text-[#555555]">
              {item.color && <span className="capitalize">{item.color}</span>}
              {item.color && item.size && <span className="text-gray-300 text-xs">|</span>}
              {item.size && (
                <span className="flex items-center gap-0.5">
                  Size: <span className="font-medium text-[#1A1A1A] ml-0.5">{item.size}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              )}
            </div>
          )}

          {/* Qty stepper */}
          <div className="flex items-center border border-gray-300 w-fit mt-3" style={{ height: 34 }}>
            <button
              onClick={() => onQty(item, -1)}
              disabled={isOOS}
              className="w-9 h-full flex items-center justify-center text-[#8B1A2F] text-lg font-medium hover:bg-gray-50 transition-colors select-none disabled:opacity-40"
            >−</button>
            <div className="w-9 h-full flex items-center justify-center text-[14px] font-semibold border-x border-gray-300 text-[#1A1A1A]">
              {item.quantity}
            </div>
            <button
              onClick={() => onQty(item, +1)}
              disabled={isOOS || (item.stock != null && item.quantity >= item.stock)}
              className="w-9 h-full flex items-center justify-center text-[#8B1A2F] text-lg font-medium hover:bg-gray-50 transition-colors select-none disabled:opacity-40"
            >+</button>
          </div>

          {/* Price row */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-[16px] font-bold text-[#1A1A1A]">{formatPrice(item.price)}</span>
            {hasDiscount && (
              <>
                <span className="text-[13px] text-[#999999] line-through">{formatPrice(mrp)}</span>
                <span className="text-[#999999] text-xs">|</span>
                <span className="text-[13px] font-semibold text-[#20B2AA]">{discountPct}% Off</span>
              </>
            )}
          </div>

          {/* Promo badge */}
          {hasDiscount && (
            <div className="mt-2.5">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#C8860A] bg-[#FFFBF0] border border-[#F5DFA0] px-2.5 py-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                1 Promotion applied &rsaquo;
              </span>
            </div>
          )}

          {/* Delivery */}
          <p className="text-[12px] text-[#999999] mt-2">
            Estimated Delivery by <span className="font-semibold text-[#555555]">{deliveryDate()}</span>
          </p>

          {/* Move to wishlist */}
          {onMoveToWishlist && (
            <button
              onClick={() => onMoveToWishlist(item)}
              className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#999999] hover:text-[#8B1A2F] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              Move to Wishlist
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Best Coupons For You ─────────────────────────────────────────────────── */
function BestCouponsSection({ cartTotal, onCouponApplied, appliedCoupon, onCouponRemove }) {
  const [code, setCode]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [coupons, setCoupons]   = useState([]);
  const [showInput, setShowInput] = useState(false);
  const { addToast } = useToastStore();

  useEffect(() => { getActiveCoupons().then(setCoupons).catch(() => {}); }, []);

  const applyCode = async (trimmed) => {
    if (!trimmed) return;
    setLoading(true); setError('');
    try {
      const res = await validateCoupon(trimmed, cartTotal);
      onCouponApplied({ ...res, code: trimmed, discountAmount: res.discount ?? res.discountAmount ?? 0 });
      setCode(''); setShowInput(false);
      addToast(`Coupon "${trimmed}" applied!`, 'success');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid or expired coupon');
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          <span className="text-[13px] font-bold text-gray-800">Best coupons for you</span>
        </div>
        <button
          onClick={() => setShowInput(v => !v)}
          className="text-[12px] font-semibold text-[#8B1A2F] hover:underline"
        >
          All Coupons &rsaquo;
        </button>
      </div>

      {/* Applied coupon inline */}
      {appliedCoupon ? (
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span className="text-[13px] font-bold text-gray-800">{appliedCoupon.code} Applied</span>
            <span className="text-[12px] text-green-600 font-semibold">−{formatPrice(appliedCoupon.discountAmount)}</span>
          </div>
          <button
            onClick={onCouponRemove}
            className="text-[12px] font-bold text-red-500 hover:text-red-700 transition-colors"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="px-4 py-3">
          {/* Quick coupon chips */}
          {!showInput && coupons.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {coupons.slice(0, 3).map(c => (
                <button
                  key={c.id}
                  onClick={() => applyCode(c.code)}
                  disabled={loading}
                  className="flex items-center gap-1.5 border border-dashed border-[#8B1A2F]/40 text-[11px] font-bold text-[#8B1A2F] px-2.5 py-1 hover:bg-red-50 transition-colors disabled:opacity-40"
                >
                  {c.code}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          {showInput && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && applyCode(code.trim())}
                  placeholder="Enter coupon code"
                  autoFocus
                  className="flex-1 border border-gray-300 px-3 py-2 text-[13px] font-semibold uppercase tracking-widest placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:border-[#8B1A2F]"
                />
                <button
                  onClick={() => applyCode(code.trim())}
                  disabled={loading || !code.trim()}
                  className="px-4 py-2 bg-[#8B1A2F] text-white text-[12px] font-bold uppercase tracking-wide hover:bg-[#6d1424] transition-colors disabled:opacity-40"
                >
                  {loading ? '…' : 'Apply'}
                </button>
              </div>
              {error && <p className="text-[11px] text-red-600">{error}</p>}
            </div>
          )}

          {!showInput && (
            <button
              onClick={() => setShowInput(true)}
              className="text-[12px] text-[#8B1A2F] font-semibold hover:underline"
            >
              + Enter coupon code
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Membership Upgrade ───────────────────────────────────────────────────── */
function MembershipUpgrade() {
  return (
    <div className="bg-white border border-gray-200">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <span className="text-[13px] font-bold text-gray-800">Upgrade Membership</span>
        <div className="ml-auto flex items-center gap-1 text-[11px] text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          2 Points = ₹1
        </div>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">
        {/* Current tier */}
        <div className="rounded-lg p-3" style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #E8C96A 100%)' }}>
          <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest mb-1">CURRENT</p>
          <p className="text-[12px] font-black text-white uppercase tracking-wider leading-tight">GOLDEN<br/>GLOW</p>
          <div className="mt-2">
            <p className="text-[9px] text-white/70">Now Earning</p>
            <p className="text-[18px] font-black text-white leading-none">266 <span className="text-[10px] font-normal">pts</span></p>
          </div>
        </div>
        {/* Upgrade tier */}
        <div className="rounded-lg p-3 border border-gray-200 bg-gray-50 flex flex-col">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">UPGRADE TO</p>
          <p className="text-[12px] font-black text-gray-600 uppercase tracking-wider leading-tight">PLATINUM<br/>AURA</p>
          <div className="mt-2">
            <p className="text-[9px] text-gray-400">Could Earn</p>
            <p className="text-[18px] font-black text-gray-800 leading-none">399 <span className="text-[10px] font-normal">pts</span></p>
          </div>
          <div className="mt-2 self-start bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
            At Just ₹499 <span className="text-[10px] font-black">+</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Price Details Panel ──────────────────────────────────────────────────── */
function PricePanel({ items, cartTotal, shipping, appliedCoupon, onCouponApplied, onCouponRemove, onPlaceOrder, hasOosItems }) {
  const totalMRP       = items.reduce((sum, i) => sum + (i.mrp || i.price) * i.quantity, 0);
  const offerDiscount  = totalMRP - cartTotal;
  const couponDiscount = Number(appliedCoupon?.discountAmount ?? appliedCoupon?.discount ?? 0);
  const grandTotal     = Math.max(0, cartTotal - couponDiscount + shipping);
  const totalSavings   = offerDiscount + couponDiscount + (shipping === 0 && cartTotal > 0 ? DELIVERY_FEE : 0);

  return (
    <div className="space-y-3">
      {/* Best coupons */}
      <BestCouponsSection
        cartTotal={cartTotal}
        onCouponApplied={onCouponApplied}
        appliedCoupon={appliedCoupon}
        onCouponRemove={onCouponRemove}
      />

      {/* Membership upgrade */}
      <MembershipUpgrade />

      {/* Price Details */}
      <div className="bg-white border border-gray-200">
        <div className="px-5 pt-4 pb-3">
          <h2 className="text-[13px] font-bold text-gray-700 mb-4">Price Details</h2>

          <div className="space-y-3 text-[13px]">
            <div className="flex justify-between">
              <span className="text-gray-600">Total MRP</span>
              <span className="font-medium text-gray-900">{formatPrice(totalMRP)}</span>
            </div>
            {offerDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Offer Discount</span>
                <span className="font-semibold text-[#E8223A]">−{formatPrice(offerDiscount)}</span>
              </div>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Coupon Discount
                  {appliedCoupon?.code && (
                    <span className="ml-1.5 text-[10px] font-bold text-[#8B1A2F] bg-red-50 border border-red-100 px-1.5 py-0.5">
                      {appliedCoupon.code}
                    </span>
                  )}
                </span>
                <span className="font-semibold text-[#E8223A]">−{formatPrice(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span className={`font-semibold ${shipping === 0 ? 'text-[#2E7D32]' : 'text-gray-900'}`}>
                {shipping === 0 ? 'Free' : formatPrice(shipping)}
              </span>
            </div>
          </div>
        </div>

        {/* Divider + Total */}
        <div className="mx-5 border-t border-gray-200 my-2" />
        <div className="px-5 pb-3 flex justify-between items-baseline">
          <span className="text-[14px] font-bold text-gray-900">Total Payable amount</span>
          <span className="text-[18px] font-bold text-gray-900">{formatPrice(grandTotal)}</span>
        </div>

        {/* Savings banner */}
        {totalSavings > 0 && (
          <div className="mx-5 mb-4 py-2 px-3 bg-green-50 border border-green-200 text-center">
            <span className="text-[12px] font-bold text-green-700 uppercase tracking-wide">
              YOU SAVED {formatPrice(totalSavings)} ON THIS ORDER!
            </span>
          </div>
        )}

        {/* Place Order */}
        <div className="px-5 pb-5">
          {hasOosItems && (
            <p className="text-[11px] text-red-600 text-center mb-2 font-medium">
              Remove out-of-stock items to place your order
            </p>
          )}
          <button
            onClick={onPlaceOrder}
            disabled={hasOosItems}
            className="w-full py-4 bg-gray-900 text-white font-bold text-[14px] tracking-[0.1em] uppercase hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Place Order
          </button>
        </div>
      </div>

      {/* Trust badges */}
      <div className="bg-white border border-gray-200 px-4 py-3 grid grid-cols-3 divide-x divide-gray-100">
        {[
          { label: '100% Authentic', icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/> },
          { label: 'Secure Payment', icon: <><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></> },
          { label: 'Easy Returns',   icon: <><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.87"/></> },
        ].map(({ label, icon }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 py-2 px-1">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
            <span className="text-[10px] font-medium text-gray-500 text-center leading-tight">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Address Drawer ───────────────────────────────────────────────────────── */
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-[15px] font-bold text-gray-900 uppercase tracking-wide">Select Delivery Address</h2>
            {addresses.length > 0 && !loading && (
              <p className="text-[11px] text-gray-400 mt-0.5">{addresses.length} saved {addresses.length === 1 ? 'address' : 'addresses'}</p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <div className="px-5 py-4 space-y-3">
              {addresses.map(addr => {
                const isSelected = selectedId === addr.id;
                return (
                  <div key={addr.id} onClick={() => onSelect(addr)}
                    className={`border p-4 cursor-pointer transition-all ${isSelected ? 'border-[#8B1A2F] bg-[#8B1A2F]/[0.03]' : 'border-gray-200 hover:border-gray-400'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-[#8B1A2F]' : 'border-gray-400'}`}>
                        {isSelected && <div className="w-[8px] h-[8px] rounded-full bg-[#8B1A2F]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide ${isSelected ? 'bg-[#8B1A2F]/10 text-[#8B1A2F]' : 'bg-gray-100 text-gray-500'}`}>
                            {addr.label || 'Home'}
                          </span>
                          {addr.is_default && <span className="text-[10px] font-semibold text-[#8B1A2F] border border-[#8B1A2F]/30 px-1.5 py-0.5">Default</span>}
                        </div>
                        <p className="text-[13px] font-bold text-gray-900">{addr.full_name}</p>
                        <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} – {addr.pincode}
                        </p>
                        {addr.phone && <p className="text-[12px] text-gray-400 mt-0.5">Mobile: <span className="font-medium text-gray-600">{addr.phone}</span></p>}
                      </div>
                    </div>
                  </div>
                );
              })}

              {!showForm ? (
                <button
                  onClick={() => { if (!isLoggedIn) { onRequireLogin?.(); return; } setShowForm(true); }}
                  className="w-full flex items-center gap-2.5 p-4 border border-dashed border-gray-300 text-[13px] font-semibold text-[#8B1A2F] hover:border-[#8B1A2F] hover:bg-red-50/40 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full border-2 border-[#8B1A2F] flex items-center justify-center shrink-0">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </div>
                  ADD NEW ADDRESS
                </button>
              ) : (
                <div className="border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[13px] font-bold text-gray-800 uppercase tracking-wide">New Address</h3>
                    <button onClick={() => setShowForm(false)} className="text-[11px] text-gray-500 hover:text-gray-800 underline underline-offset-2">Cancel</button>
                  </div>
                  <AddressForm onSubmit={(form) => onAddAddress(form, () => setShowForm(false))} onCancel={() => setShowForm(false)} loading={saving} />
                </div>
              )}
            </div>
          )}
        </div>

        {selectedId && !showForm && (
          <div className="border-t border-gray-200 px-5 py-4 bg-white shrink-0">
            <button onClick={onClose} className="w-full py-3.5 bg-[#8B1A2F] text-white font-bold text-[13px] uppercase tracking-[0.12em] hover:bg-[#6d1424] transition-colors">
              DELIVER HERE
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Product Carousel (Recommended / Add More) ────────────────────────────── */
function ProductCarouselSection({ title, products, loading, onAddToCart }) {
  const scrollRef = useRef(null);
  const scroll = dir => scrollRef.current?.scrollBy({ left: dir * 580, behavior: 'smooth' });

  if (!loading && !products.length) return null;

  return (
    <section className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B1A2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          <h2 className="text-[14px] font-bold text-gray-900 uppercase tracking-widest">{title}</h2>
        </div>

        <div className="relative">
          <button onClick={() => scroll(-1)}
            className="absolute left-0 top-[42%] -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 bg-white border border-gray-200 shadow-md flex items-center justify-center hover:border-[#8B1A2F] hover:text-[#8B1A2F] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="shrink-0 w-[160px]">
                    <div className="w-full aspect-[3/4] bg-gray-100 animate-pulse rounded" />
                    <div className="mt-2 h-3 bg-gray-100 animate-pulse rounded w-3/4" />
                    <div className="mt-1.5 h-3 bg-gray-100 animate-pulse rounded w-1/2" />
                  </div>
                ))
              : products.map(p => {
                  const finalPrice  = calcFinalPrice(p.base_price, p.discount_pct);
                  const discountPct = p.discount_pct > 0 ? Math.round(p.discount_pct) : 0;
                  return (
                    <div key={p.id} className="shrink-0 w-[155px] sm:w-[170px] group">
                      <Link to={`/product/${p.slug}`} className="block relative overflow-hidden bg-gray-50 aspect-[3/4]">
                        <img
                          src={p.image_url ? assetUrl(p.image_url) : getProductPlaceholder(p)}
                          alt={p.title}
                          onError={e => { e.currentTarget.src = getProductPlaceholder(p); }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {discountPct > 0 && (
                          <span className="absolute top-2 left-2 bg-[#E8223A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                            {discountPct}% OFF
                          </span>
                        )}
                        <button
                          onClick={e => { e.preventDefault(); }}
                          className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                        </button>
                      </Link>
                      <div className="mt-2">
                        {p.brand_name && <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide truncate">{p.brand_name}</p>}
                        <p className="text-[12px] text-gray-700 line-clamp-2 mt-0.5 leading-snug">{p.title}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-[13px] font-bold text-gray-900">{formatPrice(finalPrice)}</span>
                          {discountPct > 0 && (
                            <>
                              <span className="text-[11px] text-gray-400 line-through">{formatPrice(p.base_price)}</span>
                              <span className="text-[11px] font-semibold text-[#E8223A]">{discountPct}% Off</span>
                            </>
                          )}
                        </div>
                        {discountPct > 0 && <p className="text-[10px] text-green-600 font-semibold mt-0.5">1 Offer Available</p>}
                      </div>
                      <button
                        onClick={() => onAddToCart(p, finalPrice)}
                        className="mt-2 w-full py-2 border border-gray-300 text-gray-700 text-[11px] font-bold uppercase tracking-wider hover:border-[#8B1A2F] hover:text-[#8B1A2F] transition-colors"
                      >
                        Add to Bag
                      </button>
                    </div>
                  );
                })}
          </div>

          <button onClick={() => scroll(1)}
            className="absolute right-0 top-[42%] -translate-y-1/2 translate-x-3 z-10 w-9 h-9 bg-white border border-gray-200 shadow-md flex items-center justify-center hover:border-[#8B1A2F] hover:text-[#8B1A2F] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── Empty state ──────────────────────────────────────────────────────────── */
function EmptyBag() {
  return (
    <>
      <CheckoutStepper active={0} />
      <div className="min-h-[65vh] bg-gray-50 flex flex-col items-center justify-center gap-5 px-4">
        <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1" strokeLinecap="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>Your Bag is Empty</h1>
        <p className="text-gray-400 text-sm">Looks like you haven't added anything yet.</p>
        <Link to="/" className="mt-2 px-8 py-3 bg-[#8B1A2F] text-white font-bold text-sm uppercase tracking-widest hover:bg-[#6d1424] transition-colors">
          Continue Shopping
        </Link>
      </div>
    </>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function BagPage() {
  const { items, addItem, removeItem, updateQty, setItems, subtotal, itemCount } = useCartStore();
  const { toggle: toggleWL, has: inWL } = useWishlistStore();
  const { isLoggedIn, isAdmin } = useAuth();
  const { addToast }   = useToastStore();
  const { openLoginModal } = useUiStore();
  const navigate       = useNavigate();

  const [appliedCoupon, setAppliedCoupon]   = useState(null);
  const [addresses, setAddresses]           = useState([]);
  const [selectedAddr, setSelectedAddr]     = useState(null);
  const [addrDrawerOpen, setAddrDrawerOpen] = useState(false);
  const [addrLoading, setAddrLoading]       = useState(false);
  const [addrSaving, setAddrSaving]         = useState(false);
  const [itemToDelete, setItemToDelete]     = useState(null);
  const [recommended, setRecommended]       = useState([]);
  const [deals, setDeals]                   = useState([]);
  const [prodLoading, setProdLoading]       = useState(true);

  useEffect(() => {
    if (isLoggedIn) fetchCart().then(d => setItems(d.items)).catch(() => {});
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    setAddrLoading(true);
    fetchAddresses()
      .then(list => {
        setAddresses(list);
        const def = list.find(a => a.is_default) || list[0];
        if (def) setSelectedAddr(def);
      })
      .catch(() => {})
      .finally(() => setAddrLoading(false));
  }, [isLoggedIn]);

  useEffect(() => {
    api.get('/home')
      .then(({ data }) => {
        setRecommended(data.data?.recommended?.slice(0, 10) ?? []);
        setDeals(data.data?.deals?.slice(0, 10) ?? []);
      })
      .catch(() => {})
      .finally(() => setProdLoading(false));
  }, []);

  const handleAddAddress = async (form, onSuccess) => {
    if (!isLoggedIn) { openLoginModal(); return; }
    setAddrSaving(true);
    try {
      const addr = await createAddress(form);
      setAddresses(prev => [...prev, addr]);
      setSelectedAddr(addr);
      onSuccess?.();
      addToast('Address added', 'success');
    } catch { addToast('Failed to add address', 'error'); }
    finally { setAddrSaving(false); }
  };

  const handleQty = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty <= 0) { setItemToDelete(item); return; }
    if (isLoggedIn && item.itemId) { try { await updateCartItem(item.itemId, { quantity: newQty }); } catch {} }
    updateQty(item.variantId, newQty);
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
    setItemToDelete(item);
    addToast('Moved to wishlist', 'success');
  };

  const handleAddToCart = (product, finalPrice) => {
    addItem({
      variantId: product.id, productId: product.id,
      title: product.title, brand: product.brand_name,
      image: assetUrl(product.image_url || ''),
      size: null, color: null, price: finalPrice, quantity: 1,
    });
    addToast('Added to bag!', 'success');
  };

  const handlePlaceOrder = () => {
    if (!isLoggedIn) {
      openLoginModal(() => navigate('/checkout', { state: { coupon: appliedCoupon || null } }));
      return;
    }
    navigate('/checkout', { state: { coupon: appliedCoupon || null } });
  };

  const cartTotal   = subtotal();
  const count       = itemCount();
  const shipping    = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : DELIVERY_FEE;
  const hasOosItems = items.some(i => (i.stock ?? 1) === 0);

  if (items.length === 0) return <EmptyBag />;

  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutStepper active={0} />

      <div className="max-w-6xl mx-auto px-4 py-5">

        {/* Delivery Address bar */}
        <DeliveryAddressBar
          addr={selectedAddr}
          isLoggedIn={isLoggedIn}
          onSelectClick={() => {
            if (!isLoggedIn) { openLoginModal(); return; }
            setAddrDrawerOpen(true);
          }}
        />

        {/* Item count */}
        <p className="text-[13px] font-semibold text-gray-700 mb-3">{count} {count === 1 ? 'Item' : 'Items'}</p>

        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ── Left: items list ── */}
          <div className="flex-1 min-w-0 space-y-3">

            {/* Free shipping progress */}
            {cartTotal < FREE_SHIPPING_THRESHOLD && (
              <div className="bg-white border border-gray-200 px-4 py-3">
                <p className="text-[12px] text-gray-600 mb-1.5">
                  Add <span className="font-bold text-[#8B1A2F]">{formatPrice(FREE_SHIPPING_THRESHOLD - cartTotal)}</span> more for{' '}
                  <span className="font-bold text-gray-900">FREE delivery</span>
                </p>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#8B1A2F] rounded-full transition-all" style={{ width: `${Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }} />
                </div>
              </div>
            )}
            {cartTotal >= FREE_SHIPPING_THRESHOLD && (
              <div className="bg-green-50 border border-green-200 px-4 py-2.5 flex items-center gap-2 text-[13px] text-green-700 font-semibold">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                Yay! You get FREE delivery on this order.
              </div>
            )}

            <div className="bg-white border border-gray-200 overflow-hidden">
              {items.map(item => (
                <CartItem
                  key={item.variantId}
                  item={item}
                  onQty={handleQty}
                  onRemove={setItemToDelete}
                  onMoveToWishlist={isAdmin ? undefined : handleMoveToWishlist}
                />
              ))}
            </div>

            <div className="text-center pt-2">
              <Link to="/" className="text-[12px] font-semibold text-[#8B1A2F] hover:underline underline-offset-2">
                + Continue Shopping
              </Link>
            </div>
          </div>

          {/* ── Right: price panel ── */}
          <div className="w-full lg:w-[340px] shrink-0 sticky top-20">
            <PricePanel
              items={items}
              cartTotal={cartTotal}
              shipping={shipping}
              appliedCoupon={appliedCoupon}
              onCouponApplied={setAppliedCoupon}
              onCouponRemove={() => setAppliedCoupon(null)}
              onPlaceOrder={handlePlaceOrder}
              hasOosItems={hasOosItems}
            />
          </div>
        </div>
      </div>

      {/* Recommended For You */}
      <ProductCarouselSection
        title="Recommended For You"
        products={recommended}
        loading={prodLoading}
        onAddToCart={handleAddToCart}
      />

      {/* Add More to Save More */}
      <ProductCarouselSection
        title="Add More to Save More"
        products={deals}
        loading={prodLoading}
        onAddToCart={handleAddToCart}
      />

      <AddressDrawer
        open={addrDrawerOpen}
        onClose={() => setAddrDrawerOpen(false)}
        addresses={addresses}
        selectedId={selectedAddr?.id}
        onSelect={addr => { setSelectedAddr(addr); }}
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
