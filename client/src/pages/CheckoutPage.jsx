import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useCartStore } from '../store/cartStore.js';
import { useToastStore } from '../store/toastStore.js';
import { fetchAddresses, createAddress, deleteAddress } from '../api/addressApi.js';
import { createOrder, verifyPayment } from '../api/paymentsApi.js';
import { openRazorpayModal } from '../utils/razorpayHelper.js';
import { checkPincode } from '../api/storesApi.js';
import AddressForm from '../components/address/AddressForm.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { PincodeChecker } from '../components/checkout/PincodeChecker.jsx';
import { StorePicker } from '../components/checkout/StorePicker.jsx';
import { DEFAULT_PRODUCT_IMAGE } from '../utils/getProductPlaceholder.js';

const FREE_SHIPPING_THRESHOLD = 999;

// Mirror the server-side calcShipping so the sidebar always shows the correct price
function calcShipping(deliveryType, subtotal) {
  if (deliveryType === 'express')      return 199;
  if (deliveryType === 'store_pickup') return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99;
}

// ── Stepper ───────────────────────────────────────────────────────────────────
function StepBar({ step }) {
  const nodes = [
    { label: 'Bag',     done: true,       active: false       },
    { label: 'Address', done: step > 0,   active: step === 0  },
    { label: 'Payment', done: false,       active: step === 1  },
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-center">
        {nodes.map(({ label, done, active }, i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                done
                  ? 'bg-gray-900 border-gray-900 text-white'
                  : active
                    ? 'border-gray-800 bg-white'
                    : 'border-gray-300 bg-white'
              }`}>
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : active ? (
                  <div className="w-3 h-3 rounded-full bg-gray-900" />
                ) : null}
              </div>
              <span className={`text-[11px] mt-1.5 font-semibold uppercase tracking-wide whitespace-nowrap ${
                done || active ? 'text-gray-900' : 'text-gray-300'
              }`}>
                {label}
              </span>
            </div>
            {i < nodes.length - 1 && (
              <div className={`w-24 sm:w-40 h-px mx-3 mb-5 ${done ? 'bg-gray-800' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Price Sidebar ─────────────────────────────────────────────────────────────
function PriceSidebar({ items, couponData, step, selectedAddressId, selectedDelivery, selectedStore, onContinue, paying }) {
  const [showItems, setShowItems] = useState(false);

  const subtotal      = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalMRP      = items.reduce((s, i) => s + (i.mrp || i.price) * i.quantity, 0);
  const offerDiscount = totalMRP - subtotal;
  const couponDiscount = Number(couponData?.discount ?? couponData?.discountAmount ?? 0);
  const shipping      = calcShipping(selectedDelivery, subtotal);
  const grandTotal    = Math.max(0, subtotal - couponDiscount + shipping);
  const totalSavings  = offerDiscount + couponDiscount;

  const canContinue = step === 0
    ? (!!selectedAddressId && (selectedDelivery !== 'store_pickup' || !!selectedStore))
    : true;
  const fmt = (n) => n.toLocaleString('en-IN', { minimumFractionDigits: 2 });

  return (
    <div className="bg-white border border-gray-200 sticky top-20">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="text-[13px] font-bold text-gray-800 uppercase tracking-wider">Price Details</h3>
        <button
          onClick={() => setShowItems(v => !v)}
          className="text-[12px] text-[#8B1A2F] font-semibold hover:underline underline-offset-2"
        >
          View {items.length} {items.length === 1 ? 'Item' : 'Items'}
        </button>
      </div>

      {/* Expandable items */}
      {showItems && (
        <div className="border-b border-gray-100 divide-y divide-gray-50 max-h-60 overflow-y-auto">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-3 px-5 py-3">
              <img src={item.image || DEFAULT_PRODUCT_IMAGE} alt={item.title} onError={e => { if (e.currentTarget.src !== DEFAULT_PRODUCT_IMAGE) e.currentTarget.src = DEFAULT_PRODUCT_IMAGE; }} className="w-10 h-14 object-cover shrink-0 bg-gray-50" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-gray-700 line-clamp-2">{item.title}</p>
                {(item.size || item.color) && (
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {[item.size, item.color].filter(Boolean).join(' · ')}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[12px] font-bold text-gray-900">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Breakdown */}
      <div className="px-5 py-4 space-y-3 text-[13px]">
        <div className="flex justify-between">
          <span className="text-gray-600">Total MRP</span>
          <span className="text-gray-900">₹{fmt(totalMRP)}</span>
        </div>
        {offerDiscount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Offer Discount</span>
            <span className="font-semibold text-green-600">− ₹{fmt(offerDiscount)}</span>
          </div>
        )}
        {couponDiscount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600 flex items-center gap-1.5">
              Coupon Discount
              {couponData?.code && (
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-normal">
                  {couponData.code}
                </span>
              )}
            </span>
            <span className="font-semibold text-green-600">− ₹{fmt(couponDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Fee</span>
          <span className={shipping === 0 ? 'text-green-600 font-semibold' : 'text-gray-900'}>
            {shipping === 0 ? 'Free' : `₹${shipping}`}
          </span>
        </div>
      </div>

      <div className="mx-5 border-t border-gray-200" />

      {/* Total */}
      <div className="px-5 py-4 flex justify-between items-center">
        <span className="text-[13px] font-bold text-gray-900">Total Payable amount</span>
        <span className="text-[20px] font-bold text-gray-900">₹{fmt(grandTotal)}</span>
      </div>

      {/* Savings */}
      {totalSavings > 0 && (
        <div className="mx-5 mb-4 py-2 px-3 bg-green-50 border border-green-100 text-center">
          <p className="text-[11px] text-green-700 font-semibold tracking-wide">
            YOU SAVED <span className="font-bold">₹{fmt(totalSavings)}</span> ON THIS ORDER!
          </p>
        </div>
      )}


      {/* CTA */}
      <div className="px-5 pb-5">
        <button
          onClick={onContinue}
          disabled={!canContinue || paying}
          className={`w-full py-3.5 font-bold text-[13px] uppercase tracking-wider transition-colors ${
            !canContinue || paying
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[#8B1A2F] text-white hover:bg-[#6d1424] cursor-pointer'
          }`}
        >
          {paying
            ? 'Processing…'
            : step === 0
              ? 'Continue'
              : `Pay ₹${fmt(grandTotal)}`}
        </button>
      </div>
    </div>
  );
}

// ── Delivery option config ────────────────────────────────────────────────────
const DELIVERY_CONFIG = [
  {
    id:    'standard',
    label: 'Standard Delivery',
    price: null,           // calculated dynamically
    days:  '5–7 business days',
    alwaysAvailable: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    id:    'express',
    label: 'Express Delivery',
    price: 199,
    days:  '1–2 business days',
    alwaysAvailable: false,
    eligibilityKey: 'expressEligible',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    id:    'store_pickup',
    label: 'Express Store Pickup',
    price: 0,
    days:  'Ready in 2 hours',
    alwaysAvailable: false,
    eligibilityKey: 'storePickupEligible',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
];

// ── Delivery Options section ──────────────────────────────────────────────────
function DeliveryOptions({ subtotal, selected, onChange, onStoreSelect, expressAvailable }) {
  const [pickupPincode, setPickupPincode] = useState('');
  const [confirmedPincode, setConfirmedPincode] = useState('');

  function handleChange(id) {
    onChange(id);
    if (id !== 'store_pickup') {
      setPickupPincode('');
      setConfirmedPincode('');
      onStoreSelect?.(null);
    }
  }

  return (
    <div className="mb-7">
      <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">
        Delivery Options
      </h2>

      <div className="space-y-2">
        {DELIVERY_CONFIG.map((opt) => {
          let available = opt.alwaysAvailable;
          let unavailableReason = '';

          if (!opt.alwaysAvailable) {
            if (opt.id === 'express') {
              available = expressAvailable === true;
              unavailableReason = expressAvailable === null
                ? 'Checking availability for your pincode…'
                : 'Not available at your delivery pincode';
            } else if (opt.id === 'store_pickup') {
              available = true; // always show store pickup; handled separately
            }
          }

          const shippingCost = calcShipping(opt.id, subtotal);
          const priceLabel =
            opt.id === 'standard'
              ? shippingCost === 0 ? 'FREE' : `₹${shippingCost}`
              : opt.price === 0 ? 'FREE' : `₹${opt.price}`;

          const isSelected = selected === opt.id;

          return (
            <div key={opt.id}>
              {/* Option row */}
              <div
                onClick={() => available && handleChange(opt.id)}
                className={`flex items-center gap-4 border p-4 transition-all ${
                  !available
                    ? 'border-gray-100 bg-gray-50/60 opacity-55 cursor-not-allowed'
                    : isSelected
                      ? 'border-gray-900 bg-white cursor-pointer'
                      : 'border-gray-200 bg-white hover:border-gray-400 cursor-pointer'
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  available ? 'bg-gray-100 text-gray-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {opt.icon}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-[13px] font-semibold ${available ? 'text-gray-800' : 'text-gray-400'}`}>
                      {opt.label}
                    </p>
                    {available && (
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        opt.price === 0 || (opt.id === 'standard' && shippingCost === 0)
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {priceLabel}
                      </span>
                    )}
                  </div>
                  {available ? (
                    <p className="text-[11px] text-gray-400 mt-0.5">{opt.days}</p>
                  ) : (
                    <p className="text-[11px] text-gray-400 italic mt-0.5">{unavailableReason}</p>
                  )}
                </div>

                {/* Radio */}
                {available ? (
                  <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'border-gray-900' : 'border-gray-400'
                  }`}>
                    {isSelected && <div className="w-[8px] h-[8px] rounded-full bg-gray-900" />}
                  </div>
                ) : (
                  <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300 shrink-0" />
                )}
              </div>

              {/* ── Express: show delivery time info when selected ── */}
              {isSelected && opt.id === 'express' && available && (
                <div className="border border-t-0 border-gray-900 bg-green-50 px-4 py-3">
                  <p className="text-[12px] text-green-700 font-semibold">
                    Express Delivery available at your pincode — estimated 1–2 business days
                  </p>
                </div>
              )}

              {/* ── Store Pickup: inline store finder ── */}
              {isSelected && opt.id === 'store_pickup' && available && (
                <div className="border border-t-0 border-gray-900 bg-gray-50 px-4 pb-4">
                  <p className="text-[11px] text-gray-500 pt-3 mb-1">
                    Enter your pincode to find nearby stores:
                  </p>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter pincode"
                      value={pickupPincode}
                      onChange={(e) => {
                        setPickupPincode(e.target.value.replace(/\D/g, ''));
                        setConfirmedPincode('');
                        onStoreSelect?.(null);
                      }}
                      className="flex-1 border border-gray-300 px-3 py-2 text-[13px] focus:outline-none focus:border-gray-800"
                    />
                    <button
                      onClick={() => { if (pickupPincode.length === 6) setConfirmedPincode(pickupPincode); }}
                      disabled={pickupPincode.length !== 6}
                      className="px-4 py-2 bg-[#8B1A2F] text-white text-[12px] font-bold uppercase tracking-wider disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#6d1424] transition-colors"
                    >
                      Find Stores
                    </button>
                  </div>
                  {confirmedPincode && (
                    <StorePicker
                      pincode={confirmedPincode}
                      onSelect={(store) => onStoreSelect?.(store)}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Address step ──────────────────────────────────────────────────────────────
function AddressStep({ subtotal, selectedDelivery, onDeliveryChange, selectedId, onSelect, onStoreSelect, expressAvailable }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const { addToast } = useToastStore();

  useEffect(() => {
    fetchAddresses()
      .then((list) => {
        setAddresses(list);
        const def = list.find((a) => a.is_default) || list[0];
        if (def) onSelect(def.id, def.pincode);
      })
      .catch(() => addToast('Failed to load addresses', 'error'))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(form) {
    setSaving(true);
    try {
      const addr = await createAddress(form);
      setAddresses((prev) => [...prev, addr]);
      onSelect(addr.id, addr.pincode);
      setShowForm(false);
      addToast('Address added', 'success');
    } catch {
      addToast('Failed to add address', 'error');
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    try {
      await deleteAddress(id);
      const remaining = addresses.filter((a) => a.id !== id);
      setAddresses(remaining);
      if (selectedId === id) {
        const next = remaining[0] ?? null;
        onSelect(next?.id ?? null, next?.pincode ?? null);
      }
      addToast('Address removed', 'success');
    } catch {
      addToast('Failed to delete address', 'error');
    }
  }

  return (
    <div>
      {/* Dynamic delivery options */}
      <DeliveryOptions
        subtotal={subtotal}
        selected={selectedDelivery}
        onChange={onDeliveryChange}
        onStoreSelect={onStoreSelect}
        expressAvailable={expressAvailable}
      />

      {/* Warning — no address yet */}
      {!loading && !selectedId && (
        <p className="text-[13px] text-[#8B1A2F] font-medium mb-4">
          Please add an address to proceed
        </p>
      )}

      {/* Delivery Address */}
      <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">
        Delivery Address
      </h2>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Empty state */}
          {addresses.length === 0 && !showForm && (
            <div className="text-center py-10 px-6 bg-gray-50 border border-gray-100 mb-5">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-200">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="w-full h-full">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <p className="text-[14px] font-semibold text-gray-700 mb-1">No Saved Address found</p>
              <p className="text-[12px] text-gray-400 leading-relaxed">
                You haven&apos;t saved any addresses.{' '}
                <span className="text-gray-600">Tell us where we can find you.</span>
              </p>
            </div>
          )}

          {/* Address cards */}
          {addresses.length > 0 && (
            <div className="space-y-3 mb-5">
              {addresses.map((addr) => {
                const isSelected = selectedId === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => onSelect(addr.id, addr.pincode)}
                    className={`border p-4 cursor-pointer transition-all ${
                      isSelected ? 'border-gray-900 bg-white' : 'border-gray-200 bg-white hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'border-gray-900' : 'border-gray-400'
                      }`}>
                        {isSelected && <div className="w-[8px] h-[8px] rounded-full bg-gray-900" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide ${
                            isSelected ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {addr.label || 'Home'}
                          </span>
                          {addr.is_default && (
                            <span className="text-[10px] text-gray-400 font-medium">Default</span>
                          )}
                        </div>
                        <p className="text-[13px] font-semibold text-gray-900">
                          {addr.full_name}
                          {addr.phone && (
                            <span className="font-normal text-gray-500 ml-2 text-[12px]">{addr.phone}</span>
                          )}
                        </p>
                        <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''},{' '}
                          {addr.city}, {addr.state} – {addr.pincode}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDelete(addr.id); }}
                        className="shrink-0 text-[11px] text-gray-400 hover:text-red-500 transition-colors mt-0.5"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Address */}
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 border border-[#8B1A2F] text-[#8B1A2F] px-5 py-2.5 text-[12px] font-bold uppercase tracking-widest hover:bg-[#8B1A2F] hover:text-white transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Address
            </button>
          ) : (
            <div className="border border-gray-200 p-5 mt-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-bold text-gray-800 uppercase tracking-wide">New Address</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-[11px] text-gray-500 hover:text-gray-800 underline underline-offset-2"
                >
                  Cancel
                </button>
              </div>
              <AddressForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} loading={saving} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Delivery Estimates ────────────────────────────────────────────────────────
function DeliveryEstimates({ items, deliveryType }) {
  const daysMap = { express: 2, store_pickup: 0, standard: 7 };
  const days = daysMap[deliveryType] ?? 7;
  const estDate = new Date();
  estDate.setDate(estDate.getDate() + days);
  const label = estDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="mb-7">
      <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">
        Delivery Estimates
      </h2>
      <div className="divide-y divide-gray-100 border border-gray-100">
        {items.map((item) => (
          <div key={item.variantId} className="flex items-center gap-3 px-4 py-3">
            <img
              src={item.image || DEFAULT_PRODUCT_IMAGE}
              alt={item.title}
              onError={e => { if (e.currentTarget.src !== DEFAULT_PRODUCT_IMAGE) e.currentTarget.src = DEFAULT_PRODUCT_IMAGE; }}
              className="w-14 h-14 object-cover shrink-0 bg-gray-50"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-gray-700 line-clamp-1">{item.title}</p>
              {(item.size || item.color) && (
                <p className="text-[11px] text-gray-400">{[item.size, item.color].filter(Boolean).join(' · ')}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Estimated Delivery</p>
              <p className="text-[12px] font-semibold text-gray-800">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Payment step ──────────────────────────────────────────────────────────────
function PaymentStep({ onBack, items, deliveryType }) {
  return (
    <div>
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-700 mb-8 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Address
      </button>

      {/* Delivery Estimates */}
      <DeliveryEstimates items={items} deliveryType={deliveryType} />

      {/* Page heading */}
      <div className="mb-7">
        <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">Online Payment</h2>
        <p className="text-[12px] text-gray-400 mt-1">Select a payment method to complete your order</p>
      </div>

      {/* Security banner */}
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 px-4 py-3 mb-6">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <polyline points="9 12 11 14 15 10"/>
        </svg>
        <div>
          <p className="text-[12px] font-semibold text-green-800">100% Secure Payments</p>
          <p className="text-[11px] text-green-600 mt-0.5">All transactions are SSL encrypted and protected</p>
        </div>
      </div>

      {/* Payment option card */}
      <div className="border-2 border-[#8B1A2F] p-5 mb-6">
        <div className="flex items-start gap-4">

          {/* Selected radio */}
          <div className="mt-0.5 w-[18px] h-[18px] rounded-full border-2 border-[#8B1A2F] flex items-center justify-center shrink-0">
            <div className="w-[8px] h-[8px] rounded-full bg-[#8B1A2F]" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[14px] font-bold text-gray-900">Cards</p>
              <span className="text-[10px] text-gray-400 font-medium">(Credit / Debit)</span>
            </div>

            <p className="text-[11px] text-gray-400 mb-4">
              Visa · Mastercard · RuPay · American Express
            </p>

            {/* Accepted card logos */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center justify-center h-7 px-2.5 border border-gray-200 bg-white rounded-sm text-[10px] font-black tracking-wider text-[#1A1F71]">
                VISA
              </span>
              <span className="inline-flex items-center justify-center h-7 px-1.5 border border-gray-200 bg-white rounded-sm">
                <span className="w-4 h-4 rounded-full bg-[#EB001B] inline-block" />
                <span className="w-4 h-4 rounded-full bg-[#F79E1B] inline-block -ml-2 opacity-90" />
              </span>
              <span className="inline-flex items-center justify-center h-7 px-2 border border-gray-200 bg-white rounded-sm text-[9px] font-black" style={{ color: '#1a5ea8' }}>
                RuPay
              </span>
              <span className="inline-flex items-center justify-center h-7 px-2 border border-gray-200 bg-white rounded-sm text-[9px] font-bold" style={{ color: '#097939' }}>
                UPI
              </span>
              <span className="inline-flex items-center justify-center h-7 px-2 border border-gray-200 bg-white rounded-sm text-[9px] font-medium text-gray-500">
                Net Banking
              </span>
              <span className="inline-flex items-center justify-center h-7 px-2 border border-gray-200 bg-white rounded-sm text-[9px] font-medium text-gray-500">
                EMI
              </span>
            </div>
          </div>
        </div>
      </div>


      {/* Powered by Razorpay */}
      <div className="flex items-center justify-center gap-2">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span className="text-[11px] text-gray-400">Payments secured by</span>
        <span className="text-[11px] font-black" style={{ color: '#072654', fontFamily: 'Arial, sans-serif' }}>Razorpay</span>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const items      = useCartStore((s) => s.items);
  const user       = useAuthStore((s) => s.user);
  const clearCart  = useCartStore((s) => s.clearCart);
  const { addToast } = useToastStore();
  const navigate   = useNavigate();
  const { state: navState } = useLocation();

  const [step, setStep]                           = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddressPincode, setSelectedAddressPincode] = useState(null);
  const [selectedDelivery, setSelectedDelivery]   = useState('standard');
  const [selectedStore, setSelectedStore]         = useState(null);
  const [paying, setPaying]                       = useState(false);
  const [expressAvailable, setExpressAvailable]   = useState(null);

  const couponData = navState?.coupon ?? null;

  // Auto-check express availability whenever selected address changes
  useEffect(() => {
    const pin = selectedAddressPincode ? String(selectedAddressPincode).trim() : null;
    if (!pin) { setExpressAvailable(null); return; }

    let cancelled = false;
    setExpressAvailable(null);
    checkPincode(pin)
      .then((res) => {
        if (cancelled) return;
        const available = res.data?.data?.available ?? false;
        setExpressAvailable(available);
        // Reset to standard if express was selected but pincode doesn't support it
        if (!available) setSelectedDelivery((d) => d === 'express' ? 'standard' : d);
      })
      .catch(() => {
        if (!cancelled) setExpressAvailable(false);
      });

    return () => { cancelled = true; };
  }, [selectedAddressPincode]);

  function handleAddressSelect(addressId, pincode) {
    setSelectedAddressId(addressId);
    setSelectedAddressPincode(pincode ? String(pincode).trim() : null);
  }

  const subtotal       = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const couponDiscount = Number(couponData?.discount ?? couponData?.discountAmount ?? 0);
  const shipping       = calcShipping(selectedDelivery, subtotal);
  const grandTotal     = Math.max(0, subtotal - couponDiscount + shipping);

  async function handlePay() {
    setPaying(true);
    try {
      const orderData = await createOrder({
        addressId:    selectedAddressId,
        couponCode:   couponData?.code || undefined,
        usePoints:    false,
        deliveryType: selectedDelivery,
      });

      openRazorpayModal({
        orderId:  orderData.razorpayOrderId,
        amount:   orderData.amount,
        currency: orderData.currency,
        keyId:    orderData.keyId,
        user,
        onSuccess: async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
          try {
            const result = await verifyPayment({
              razorpayOrderId,
              razorpayPaymentId,
              razorpaySignature,
              addressId:      selectedAddressId,
              couponId:       couponData?.couponId || null,
              subtotal,
              discount:       couponDiscount,
              pointsDiscount: 0,
              shipping,
              total:          grandTotal,
              deliveryType:   selectedDelivery,
              deliveryMethod: selectedDelivery === 'express' ? 'express_delivery'
                            : selectedDelivery === 'store_pickup' ? 'store_pickup'
                            : 'standard_delivery',
              storeId:        selectedStore?.id ?? null,
            });
            clearCart();
            navigate(`/track/${result.orderId}`);
          } catch {
            addToast('Payment recorded but order confirmation failed. Contact support.', 'error');
          } finally {
            setPaying(false);
          }
        },
        onFailure: (msg) => {
          addToast(msg || 'Payment failed. Please try again.', 'error');
          setPaying(false);
        },
      });
    } catch (err) {
      addToast(err.response?.data?.message || 'Could not initiate payment', 'error');
      setPaying(false);
    }
  }

  function handleContinue() {
    if (step === 0) {
      if (!selectedAddressId) {
        addToast('Please select or add a delivery address', 'info');
        return;
      }
      setStep(1);
    } else if (step === 1) {
      handlePay();
    }
  }

  if (!items.length) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-[#8B1A2F] text-white font-bold text-sm uppercase tracking-widest hover:bg-[#6d1424] transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StepBar step={step} />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ── Left: main content ── */}
          <div className="flex-1 min-w-0 bg-white border border-gray-200 p-6">
            {step === 0 && (
              <AddressStep
                subtotal={subtotal}
                selectedDelivery={selectedDelivery}
                onDeliveryChange={setSelectedDelivery}
                selectedId={selectedAddressId}
                onSelect={handleAddressSelect}
                onStoreSelect={setSelectedStore}
                expressAvailable={expressAvailable}
              />
            )}
            {step === 1 && (
              <PaymentStep
                onBack={() => setStep(0)}
                items={items}
                deliveryType={selectedDelivery}
              />
            )}
          </div>

          {/* ── Right: price sidebar ── */}
          <div className="w-full lg:w-[340px] shrink-0">
            <PriceSidebar
              items={items}
              couponData={couponData}
              step={step}
              selectedAddressId={selectedAddressId}
              selectedDelivery={selectedDelivery}
              selectedStore={selectedStore}
              onContinue={handleContinue}
              paying={paying}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
