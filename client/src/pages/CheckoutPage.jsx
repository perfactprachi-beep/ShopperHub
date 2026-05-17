import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useCartStore } from '../store/cartStore.js';
import { useToastStore } from '../store/toastStore.js';
import { fetchAddresses, createAddress, deleteAddress } from '../api/addressApi.js';
import { getPaymentMethods, createOrder, createCodOrder, verifyPayment } from '../api/paymentsApi.js';
import { openRazorpayModal } from '../utils/razorpayHelper.js';
import AddressForm from '../components/address/AddressForm.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { DeliveryMethodStep } from '../components/checkout/DeliveryMethodStep.jsx';

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
    { label: 'Bag',      done: true,       active: false       },
    { label: 'Delivery', done: step > 0,   active: step === 0  },
    { label: 'Address',  done: step > 1,   active: step === 1  },
    { label: 'Payment',  done: false,       active: step === 2  },
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
function PriceSidebar({ items, couponData, step, selectedAddressId, selectedDelivery, onContinue, paying }) {
  const [showItems, setShowItems] = useState(false);

  const subtotal      = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalMRP      = items.reduce((s, i) => s + (i.mrp || i.price) * i.quantity, 0);
  const offerDiscount = totalMRP - subtotal;
  const couponDiscount = Number(couponData?.discount ?? couponData?.discountAmount ?? 0);
  const shipping      = calcShipping(selectedDelivery, subtotal);
  const grandTotal    = Math.max(0, subtotal - couponDiscount + shipping);
  const totalSavings  = offerDiscount + couponDiscount;

  const canContinue = step === 0 ? false : step === 1 ? !!selectedAddressId : true;
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
              <img src={item.image} alt={item.title} className="w-10 h-14 object-cover shrink-0 bg-gray-50" />
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
              ? 'Select Delivery Method Above'
              : step === 1
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
function DeliveryOptions({ items, subtotal, selected, onChange }) {
  return (
    <div className="mb-7">
      <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">
        Delivery Options
      </h2>

      <div className="space-y-2">
        {DELIVERY_CONFIG.map((opt) => {
          // Determine availability dynamically
          let available = opt.alwaysAvailable;
          let ineligibleItems = [];

          if (!opt.alwaysAvailable && opt.eligibilityKey) {
            ineligibleItems = items.filter((i) => !i[opt.eligibilityKey]);
            available = ineligibleItems.length === 0;
          }

          // Compute displayed shipping price for this option
          const shippingCost = calcShipping(opt.id, subtotal);
          const priceLabel =
            opt.id === 'standard'
              ? shippingCost === 0 ? 'FREE' : `₹${shippingCost}`
              : opt.price === 0 ? 'FREE' : `₹${opt.price}`;

          const isSelected = selected === opt.id;

          return (
            <div
              key={opt.id}
              onClick={() => available && onChange(opt.id)}
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
                  <p className="text-[11px] text-gray-400 italic mt-0.5">
                    {ineligibleItems.length > 0
                      ? `${ineligibleItems.length} item${ineligibleItems.length > 1 ? 's are' : ' is'} not eligible for this option`
                      : `Not available for some items`}
                  </p>
                )}
              </div>

              {/* Right indicator */}
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
          );
        })}
      </div>
    </div>
  );
}

// ── Address step ──────────────────────────────────────────────────────────────
function AddressStep({ items, subtotal, selectedDelivery, onDeliveryChange, selectedId, onSelect }) {
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
        if (def) onSelect(def.id);
      })
      .catch(() => addToast('Failed to load addresses', 'error'))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(form) {
    setSaving(true);
    try {
      const addr = await createAddress(form);
      setAddresses((prev) => [...prev, addr]);
      onSelect(addr.id);
      setShowForm(false);
      addToast('Address added', 'success');
    } catch {
      addToast('Failed to add address', 'error');
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      if (selectedId === id) onSelect(addresses.find((a) => a.id !== id)?.id ?? null);
      addToast('Address removed', 'success');
    } catch {
      addToast('Failed to delete address', 'error');
    }
  }

  return (
    <div>
      {/* Dynamic delivery options */}
      <DeliveryOptions
        items={items}
        subtotal={subtotal}
        selected={selectedDelivery}
        onChange={onDeliveryChange}
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
                    onClick={() => onSelect(addr.id)}
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

// ── Payment method icons ──────────────────────────────────────────────────────
const METHOD_ICONS = {
  card: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  cash: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="2" y="6" width="20" height="12" rx="2"/>
      <circle cx="12" cy="12" r="3"/>
      <path d="M6 12h.01M18 12h.01"/>
    </svg>
  ),
  upi: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  wallet: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/>
      <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><circle cx="18" cy="12" r="2"/>
    </svg>
  ),
  bank: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M3 22V9M21 22V9M12 2L2 9h20L12 2zM6 22V9M18 22V9M10 22V9M14 22V9"/>
    </svg>
  ),
};

// ── Payment step ──────────────────────────────────────────────────────────────
function PaymentStep({ onBack, methods, selectedCode, onSelect, loadingMethods }) {
  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[12px] text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Address
      </button>

      <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-5">
        Payment Method
      </h2>

      {loadingMethods ? (
        <div className="flex justify-center py-10 text-gray-400 text-[13px]">Loading payment options…</div>
      ) : methods.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 p-6 text-center text-[13px] text-gray-500">
          No payment methods available. Please contact support.
        </div>
      ) : (
        <div className="space-y-2">
          {methods.map((method) => {
            const isSelected = selectedCode === method.code;
            return (
              <div
                key={method.code}
                onClick={() => onSelect(method.code)}
                className={`flex items-center gap-4 border p-4 cursor-pointer transition-all ${
                  isSelected ? 'border-gray-900 bg-white' : 'border-gray-200 bg-white hover:border-gray-400'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                  {METHOD_ICONS[method.icon_type] || METHOD_ICONS.card}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-800">{method.name}</p>
                  {method.description && (
                    <p className="text-[11px] text-gray-400 mt-0.5">{method.description}</p>
                  )}
                </div>
                <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? 'border-gray-900' : 'border-gray-400'
                }`}>
                  {isSelected && <div className="w-[8px] h-[8px] rounded-full bg-gray-900" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
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
  const [deliveryData, setDeliveryData]           = useState({ deliveryMethod: 'express_delivery', store: null });
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedDelivery, setSelectedDelivery]   = useState('standard');
  const [paying, setPaying]                       = useState(false);
  const [paymentMethods, setPaymentMethods]       = useState([]);
  const [loadingMethods, setLoadingMethods]       = useState(true);
  const [selectedPaymentCode, setSelectedPaymentCode] = useState('');

  const couponData = navState?.coupon ?? null;

  useEffect(() => {
    getPaymentMethods()
      .then((methods) => {
        setPaymentMethods(methods);
        if (methods.length > 0) setSelectedPaymentCode(methods[0].code);
      })
      .catch(() => {})
      .finally(() => setLoadingMethods(false));
  }, []);

  const subtotal       = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const couponDiscount = Number(couponData?.discount ?? couponData?.discountAmount ?? 0);
  const shipping       = calcShipping(selectedDelivery, subtotal);
  const grandTotal     = Math.max(0, subtotal - couponDiscount + shipping);

  async function handlePay() {
    setPaying(true);
    try {
      if (selectedPaymentCode === 'cod') {
        const result = await createCodOrder({
          addressId:      selectedAddressId,
          couponCode:     couponData?.code || undefined,
          usePoints:      false,
          deliveryType:   selectedDelivery,
          deliveryMethod: deliveryData.deliveryMethod,
          storeId:        deliveryData.store?.id || null,
        });
        clearCart();
        navigate(`/track/${result.orderId}`);
        return;
      }

      // Razorpay (and any future online gateway)
      const orderData = await createOrder({
        addressId:      selectedAddressId,
        couponCode:     couponData?.code || undefined,
        usePoints:      false,
        deliveryType:   selectedDelivery,
        deliveryMethod: deliveryData.deliveryMethod,
        storeId:        deliveryData.store?.id || null,
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
              deliveryMethod: deliveryData.deliveryMethod,
              storeId:        deliveryData.store?.id || null,
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
    if (step === 1) {
      if (!selectedAddressId) {
        addToast('Please select or add a delivery address', 'info');
        return;
      }
      setStep(2);
    } else if (step === 2) {
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
              <DeliveryMethodStep
                onNext={(data) => {
                  setDeliveryData(data);
                  if (data.deliveryMethod === 'store_pickup') setSelectedDelivery('store_pickup');
                  setStep(1);
                }}
              />
            )}
            {step === 1 && (
              <AddressStep
                items={items}
                subtotal={subtotal}
                selectedDelivery={selectedDelivery}
                onDeliveryChange={setSelectedDelivery}
                selectedId={selectedAddressId}
                onSelect={setSelectedAddressId}
              />
            )}
            {step === 2 && (
              <PaymentStep
                onBack={() => setStep(1)}
                methods={paymentMethods}
                selectedCode={selectedPaymentCode}
                onSelect={setSelectedPaymentCode}
                loadingMethods={loadingMethods}
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
              onContinue={handleContinue}
              paying={paying}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
