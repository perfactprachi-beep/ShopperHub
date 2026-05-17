import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToastStore } from '../store/toastStore.js';
import { updateCartItem, removeCartItem, fetchCart } from '../api/cartApi.js';
import { fetchAddresses, createAddress } from '../api/addressApi.js';
import { formatPrice } from '../utils/formatPrice.js';
import AddressForm from '../components/address/AddressForm.jsx';

const FREE_SHIPPING = 999;

function deliveryLabel() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/* ── Checkout stepper ────────────────────────────────────────────────────── */
function CheckoutSteps() {
  const navigate = useNavigate();
  const steps = [
    { label: 'Bag',     to: null },
    { label: 'Address', to: '/checkout' },
    { label: 'Payment', to: '/checkout' },
  ];
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-center gap-0">
        {steps.map(({ label, to }, i) => (
          <div key={label} className="flex items-center">
            <div
              className={`flex flex-col items-center ${to ? 'cursor-pointer' : ''}`}
              onClick={() => to && navigate(to)}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                i === 0 ? 'border-gray-800' : 'border-gray-300 hover:border-gray-500'
              }`}>
                {i === 0 && <div className="w-3 h-3 rounded-full bg-gray-800" />}
              </div>
              <span className={`text-[11px] mt-1.5 whitespace-nowrap transition-colors ${
                i === 0 ? 'font-semibold text-gray-800' : 'text-gray-400 hover:text-gray-600'
              }`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-32 sm:w-52 h-px bg-gray-300 mx-2 mb-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Cart item card ──────────────────────────────────────────────────────── */
function CartItem({ item, onQty, onRemove }) {
  const mrp = item.mrp || item.price;
  const hasDiscount = mrp > item.price;
  const discountPct = hasDiscount ? Math.round(((mrp - item.price) / mrp) * 100) : 0;
  const delivery = deliveryLabel();

  return (
    <div className="bg-white border border-gray-200 p-4">
      <div className="flex gap-3">
        {/* Image */}
        <Link to={item.slug ? `/product/${item.slug}` : '#'} className="shrink-0">
          <div className="w-[90px] h-[115px] bg-gray-100 overflow-hidden">
            {item.image
              ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">No image</div>
            }
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Brand + title + remove */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {item.brand && (
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">{item.brand}</p>
              )}
              <Link to={item.slug ? `/product/${item.slug}` : '#'} className="text-[13px] font-medium text-gray-900 leading-snug line-clamp-2 hover:underline underline-offset-2">
                {item.title}
              </Link>
            </div>
            <button
              onClick={() => onRemove(item)}
              className="shrink-0 text-gray-400 hover:text-gray-700 transition-colors p-0.5"
              aria-label="Remove"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Color + Size */}
          {(item.color || item.size) && (
            <div className="flex items-center gap-2 mt-1.5 text-[12px] text-gray-600">
              {item.color && <span className="capitalize">{item.color}</span>}
              {item.color && item.size && <span className="text-gray-300">|</span>}
              {item.size && (
                <div className="flex items-center gap-1">
                  <span>Size:</span>
                  <select className="text-[12px] font-semibold text-gray-800 bg-white border border-gray-300 rounded-sm px-1.5 py-0.5 outline-none cursor-pointer">
                    <option>{item.size}</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Price row */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[15px] font-bold text-gray-900">{formatPrice(item.price)}</span>
            {hasDiscount && (
              <>
                <span className="text-[12px] text-gray-400 line-through">{formatPrice(mrp)}</span>
                <span className="text-[12px] font-bold text-[#8B1A2F]">{discountPct}% Off</span>
              </>
            )}
          </div>

          {/* Bottom: qty + promo badge + delivery */}
          <div className="mt-2.5 flex items-end justify-between gap-2 flex-wrap">
            {/* Qty stepper */}
            <div className="flex items-stretch border border-gray-300 h-8">
              <button
                onClick={() => onQty(item, -1)}
                className="w-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 text-lg font-light transition-colors"
              >
                −
              </button>
              <div className="w-8 flex items-center justify-center text-sm font-semibold border-x border-gray-300 text-gray-900">
                {item.quantity}
              </div>
              <button
                onClick={() => onQty(item, +1)}
                className="w-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 text-lg font-light transition-colors"
              >
                +
              </button>
            </div>

            {/* Promo + delivery */}
            <div className="text-right">
              {hasDiscount && (
                <div className="flex items-center justify-end mb-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B1A2F] bg-red-50 border border-red-100 px-2 py-0.5">
                    🏷 1 Promotion applied &gt;
                  </span>
                </div>
              )}
              <p className="text-[11px] text-gray-500">
                Estimated Delivery by <span className="font-semibold text-gray-700">{delivery}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Price details panel ─────────────────────────────────────────────────── */
function PricePanel({ items, total, shipping }) {
  const navigate = useNavigate();
  const totalMRP = items.reduce((sum, i) => sum + (i.mrp || i.price) * i.quantity, 0);
  const offerDiscount = totalMRP - total;
  const grandTotal = total + shipping;

  return (
    <div className="border border-gray-200 bg-white">
      {/* Best coupons header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          <span className="text-[13px] font-semibold text-gray-800">Best coupons for you</span>
        </div>
        <button className="flex items-center gap-0.5 text-[12px] font-semibold text-gray-700 hover:text-[#8B1A2F] transition-colors">
          All Coupons
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      {/* Price Details */}
      <div className="px-5 pt-4 pb-3">
        <h2 className="text-[13px] font-bold text-gray-800 mb-4">Price Details</h2>

        <div className="space-y-3 text-[13px]">
          <div className="flex justify-between text-gray-600">
            <span>Total MRP</span>
            <span className="font-medium text-gray-900">{formatPrice(totalMRP)}</span>
          </div>

          {offerDiscount > 0 && (
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-600">Offer Discount</span>
              <span className="font-medium text-[#8B1A2F]">- {formatPrice(offerDiscount)}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span className={shipping === 0 ? 'font-medium text-gray-800' : 'font-medium text-gray-900'}>
              {shipping === 0 ? 'Free' : formatPrice(shipping)}
            </span>
          </div>
        </div>

        {/* Divider + total */}
        <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between">
          <span className="text-[14px] font-bold text-gray-900">Total Payable amount</span>
          <span className="text-[14px] font-bold text-gray-900">{formatPrice(grandTotal)}</span>
        </div>

        {/* Savings banner */}
        {offerDiscount > 0 && (
          <div className="mt-3 py-2 text-center border border-green-100 bg-green-50">
            <span className="text-[12px] font-bold text-green-700">
              YOU SAVED {formatPrice(offerDiscount)} ON THIS ORDER!
            </span>
          </div>
        )}
      </div>

      {/* Place Order */}
      <div className="px-5 pb-5">
        <button
          onClick={() => navigate('/checkout')}
          className="w-full py-3.5 bg-gray-900 text-white font-bold text-sm tracking-widest hover:bg-black transition-colors"
        >
          Place Order
        </button>
      </div>
    </div>
  );
}

/* ── Address select modal ────────────────────────────────────────────────── */
function AddressSelectModal({ onClose, onSelect }) {
  const [addresses, setAddresses] = useState([]);
  const [chosen, setChosen]       = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [loading, setLoading]     = useState(true);
  const { addToast } = useToastStore();

  useEffect(() => {
    fetchAddresses()
      .then((list) => { setAddresses(list || []); if (list?.length === 0) setShowForm(true); })
      .catch(() => setShowForm(true))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveAddress = async (data) => {
    setSaving(true);
    try {
      const saved = await createAddress(data);
      setAddresses((prev) => [...prev, saved]);
      setChosen(saved);
      setShowForm(false);
      addToast('Address saved!', 'success');
    } catch {
      addToast('Failed to save address', 'error');
    } finally { setSaving(false); }
  };

  const handleConfirm = () => {
    if (!chosen) { addToast('Please select an address', 'error'); return; }
    onSelect(chosen);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-[15px] font-bold text-gray-900">
            {showForm ? 'Add New Address' : 'Select Delivery Address'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-[#8B1A2F] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : showForm ? (
            <AddressForm
              onSubmit={handleSaveAddress}
              onCancel={addresses.length ? () => setShowForm(false) : null}
              loading={saving}
            />
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    chosen?.id === addr.id ? 'border-[#8B1A2F] bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={chosen?.id === addr.id}
                    onChange={() => setChosen(addr)}
                    className="mt-0.5 accent-[#8B1A2F]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-bold text-[#8B1A2F] uppercase bg-red-50 border border-red-100 px-2 py-0.5 rounded-sm">{addr.label || 'Home'}</span>
                      <span className="text-[13px] font-semibold text-gray-900">{addr.full_name}</span>
                    </div>
                    <p className="text-[12px] text-gray-600 leading-snug">
                      {[addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
                    </p>
                    {addr.phone && <p className="text-[12px] text-gray-500 mt-0.5">📞 {addr.phone}</p>}
                  </div>
                </label>
              ))}

              {/* Add new */}
              <button
                onClick={() => setShowForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 text-[13px] font-semibold text-gray-600 rounded-lg hover:border-[#8B1A2F] hover:text-[#8B1A2F] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add New Address
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!showForm && !loading && (
          <div className="px-5 py-4 border-t border-gray-100 shrink-0">
            <button
              onClick={handleConfirm}
              disabled={!chosen}
              className="w-full py-3 bg-[#8B1A2F] text-white font-bold text-sm tracking-wide hover:bg-[#6d1424] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Deliver Here
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function CartPage() {
  const { items, removeItem, updateQty, setItems, subtotal, itemCount } = useCartStore();
  const { isLoggedIn } = useAuth();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchCart().then((data) => setItems(data.items)).catch(console.error);
    }
  }, [isLoggedIn]);

  const handleQty = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      if (!window.confirm('Remove this item from cart?')) return;
      if (isLoggedIn && item.itemId) { try { await removeCartItem(item.itemId); } catch {} }
      removeItem(item.variantId);
      return;
    }
    if (isLoggedIn && item.itemId) { try { await updateCartItem(item.itemId, { quantity: newQty }); } catch {} }
    updateQty(item.variantId, newQty);
  };

  const handleRemove = async (item) => {
    if (isLoggedIn && item.itemId) { try { await removeCartItem(item.itemId); } catch {} }
    removeItem(item.variantId);
    addToast('Item removed from bag', 'success');
  };

  const total    = subtotal();
  const count    = itemCount();
  const shipping = total >= FREE_SHIPPING ? 0 : 99;

  /* Empty state */
  if (items.length === 0) {
    return (
      <>
        <CheckoutSteps />
        <div className="min-h-[60vh] bg-gray-50 flex flex-col items-center justify-center gap-5 px-4">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2" strokeLinecap="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>Your Bag is Empty</h1>
          <p className="text-gray-500 text-sm">Looks like you haven't added anything yet.</p>
          <Link to="/" className="px-8 py-3 bg-[#8B1A2F] text-white font-bold text-sm uppercase tracking-widest hover:bg-[#6d1424] transition-colors">
            Continue Shopping
          </Link>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutSteps />

      <div className="max-w-6xl mx-auto px-4 py-5">

        {/* Address bar */}
        <div className="bg-white border border-gray-200 px-4 py-3 flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 min-w-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8B1A2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {selectedAddress ? (
              <span className="text-[13px] text-gray-800 truncate">
                <span className="font-semibold">{selectedAddress.full_name}</span>
                {' — '}{[selectedAddress.line1, selectedAddress.city, selectedAddress.pincode].filter(Boolean).join(', ')}
              </span>
            ) : (
              <span className="text-[13px] text-[#8B1A2F]">Please select a delivery address.</span>
            )}
          </div>
          <button
            onClick={() => setAddrModalOpen(true)}
            className="shrink-0 ml-3 px-4 py-1.5 border border-gray-800 text-gray-900 text-[12px] font-semibold hover:bg-gray-50 transition-colors"
          >
            {selectedAddress ? 'Change' : 'Select Address'}
          </button>
        </div>

        {addrModalOpen && (
          <AddressSelectModal
            onClose={() => setAddrModalOpen(false)}
            onSelect={(addr) => setSelectedAddress(addr)}
          />
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left: item list ── */}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-700 mb-3">{count} {count === 1 ? 'Item' : 'Items'}</p>
            <div className="space-y-2">
              {items.map((item) => (
                <CartItem
                  key={item.variantId}
                  item={item}
                  onQty={handleQty}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </div>

          {/* ── Right: price panel ── */}
          <div className="w-full lg:w-[340px] shrink-0 sticky top-20">
            <PricePanel items={items} total={total} shipping={shipping} />
          </div>

        </div>
      </div>
    </div>
  );
}
