import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useCartStore } from '../store/cartStore.js';
import { useToastStore } from '../store/toastStore.js';
import { fetchAddresses, createAddress, deleteAddress, setDefaultAddress } from '../api/addressApi.js';
import { validateCoupon } from '../api/couponsApi.js';
import { createOrder, verifyPayment } from '../api/paymentsApi.js';
import { openRazorpayModal } from '../utils/razorpayHelper.js';
import AddressForm from '../components/address/AddressForm.jsx';
import Spinner from '../components/ui/Spinner.jsx';

const STEPS = ['Address', 'Summary & Coupon', 'Payment'];

function StepBar({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors
              ${i < current  ? 'bg-red-700 border-red-700 text-white'
              : i === current ? 'border-red-700 text-red-700 bg-white'
              : 'border-gray-300 text-gray-400 bg-white'}`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-xs mt-1 whitespace-nowrap ${i === current ? 'text-red-700 font-medium' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-16 sm:w-24 h-0.5 mx-1 mb-5 transition-colors ${i < current ? 'bg-red-700' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Step 1: Address ───────────────────────────────────────────────
function AddressStep({ onNext }) {
  const [addresses, setAddresses] = useState([]);
  const [selected, setSelected]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const { addToast } = useToastStore();

  useEffect(() => {
    fetchAddresses()
      .then((list) => {
        setAddresses(list);
        const def = list.find((a) => a.is_default) || list[0];
        if (def) setSelected(def.id);
      })
      .catch(() => addToast('Failed to load addresses', 'error'))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(form) {
    setSaving(true);
    try {
      const addr = await createAddress(form);
      setAddresses((prev) => [...prev, addr]);
      setSelected(addr.id);
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
      if (selected === id) setSelected(addresses.find((a) => a.id !== id)?.id || null);
      addToast('Address removed', 'success');
    } catch {
      addToast('Failed to delete address', 'error');
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Delivery Address</h2>

      {addresses.length > 0 && (
        <div className="flex flex-col gap-3 mb-5">
          {addresses.map((addr) => (
            <label key={addr.id}
              className={`flex items-start gap-3 border rounded-xl p-4 cursor-pointer transition-colors
                ${selected === addr.id ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name="address" className="mt-1 accent-red-700"
                checked={selected === addr.id} onChange={() => setSelected(addr.id)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold uppercase tracking-wide bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {addr.label || 'Address'}
                  </span>
                  {addr.is_default && (
                    <span className="text-xs text-red-700 font-medium">Default</span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-800">{addr.full_name}</p>
                <p className="text-sm text-gray-600">
                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                  {addr.city}, {addr.state} – {addr.pincode}
                </p>
                {addr.phone && <p className="text-sm text-gray-500 mt-0.5">{addr.phone}</p>}
              </div>
              <button type="button" onClick={(e) => { e.preventDefault(); handleDelete(addr.id); }}
                className="text-gray-400 hover:text-red-500 text-xs shrink-0 mt-0.5">
                Remove
              </button>
            </label>
          ))}
        </div>
      )}

      {showForm ? (
        <div className="border border-gray-200 rounded-xl p-5 mb-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">New Address</h3>
          <AddressForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} loading={saving} />
        </div>
      ) : (
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm text-red-700 font-medium hover:underline mb-6">
          <span className="text-lg leading-none">+</span> Add New Address
        </button>
      )}

      <button
        disabled={!selected}
        onClick={() => onNext(selected)}
        className="w-full py-3 bg-red-700 text-white font-semibold rounded-xl hover:bg-red-800 transition-colors disabled:opacity-50">
        Continue
      </button>
    </div>
  );
}

// ── Step 2: Summary & Coupon ──────────────────────────────────────
function SummaryStep({ onNext, onBack }) {
  const items    = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const user     = useAuthStore((s) => s.user);
  const { addToast } = useToastStore();

  const [couponCode, setCouponCode]   = useState('');
  const [couponData, setCouponData]   = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [usePoints, setUsePoints]         = useState(false);
  const [pointsBalance]                   = useState(user?.first_citizen_points || 0);

  const afterCoupon   = subtotal - (couponData?.discount || 0);
  const maxPtsRedeem  = Math.floor(afterCoupon * 0.2);
  const pointsDiscount = usePoints ? Math.min(pointsBalance, maxPtsRedeem) : 0;
  const shipping      = 0;
  const total         = Math.max(afterCoupon - pointsDiscount + shipping, 0);

  async function applyCode() {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await validateCoupon(couponCode.trim(), subtotal);
      setCouponData({ ...res, code: couponCode.trim().toUpperCase() });
      addToast(`Coupon applied! You save ₹${res.discount}`, 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid coupon';
      setCouponError(msg);
      setCouponData(null);
    } finally { setApplyingCoupon(false); }
  }

  function removeCoupon() {
    setCouponData(null);
    setCouponCode('');
    setCouponError('');
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>

      {/* Cart items read-only */}
      <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 mb-5">
        {items.map((item) => (
          <div key={item.variantId} className="flex gap-3 p-3">
            <img src={item.image} alt={item.title}
              className="w-14 h-14 object-cover rounded-lg shrink-0 bg-gray-50" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
              <p className="text-xs text-gray-500">{item.size && `Size: ${item.size}`} {item.color && `· ${item.color}`}</p>
              <p className="text-sm text-gray-700 mt-0.5">₹{item.price.toLocaleString('en-IN')} × {item.quantity}</p>
            </div>
            <p className="text-sm font-semibold text-gray-800 shrink-0">
              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>

      {/* Coupon */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Coupon Code</h3>
        {couponData ? (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <span className="text-green-700 text-sm font-medium flex-1">
              "{couponData.code}" — saving ₹{couponData.discount}
            </span>
            <button onClick={removeCoupon} className="text-red-500 text-xs hover:underline">Remove</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && applyCode()}
              placeholder="Enter coupon code"
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
            <button onClick={applyCode} disabled={applyingCoupon || !couponCode.trim()}
              className="px-4 py-2 bg-gray-800 text-white text-sm rounded-xl hover:bg-gray-700 disabled:opacity-50 transition-colors">
              {applyingCoupon ? '…' : 'Apply'}
            </button>
          </div>
        )}
        {couponError && <p className="text-xs text-red-500 mt-1.5">{couponError}</p>}
      </div>

      {/* First Citizen Points */}
      {pointsBalance > 0 && (
        <div className="mb-5 border border-gray-200 rounded-xl px-4 py-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-gray-800">First Citizen Points</p>
              <p className="text-xs text-gray-500">Balance: {pointsBalance} pts · Redeem up to ₹{maxPtsRedeem} (20% of total)</p>
            </div>
            <input type="checkbox" checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)}
              className="w-4 h-4 accent-red-700" />
          </label>
          {usePoints && (
            <p className="text-xs text-green-700 font-medium mt-1.5">Redeeming {pointsDiscount} pts = ₹{pointsDiscount} off</p>
          )}
        </div>
      )}

      {/* Price breakdown */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        {couponData?.discount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Coupon discount</span>
            <span>− ₹{couponData.discount.toLocaleString('en-IN')}</span>
          </div>
        )}
        {pointsDiscount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Points redeemed</span>
            <span>− ₹{pointsDiscount}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className="text-green-700 font-medium">FREE</span>
        </div>
        <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900 text-base">
          <span>Total</span>
          <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
          Back
        </button>
        <button
          onClick={() => onNext({ couponId: couponData?.couponId || null, discount: couponData?.discount || 0, pointsDiscount, total, subtotal, shipping })}
          className="flex-1 py-3 bg-red-700 text-white font-semibold rounded-xl hover:bg-red-800 transition-colors">
          Continue to Payment
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Payment ───────────────────────────────────────────────
function PaymentStep({ addressId, pricingData, onBack }) {
  const user        = useAuthStore((s) => s.user);
  const clearCart   = useCartStore((s) => s.clearCart);
  const { addToast } = useToastStore();
  const navigate    = useNavigate();
  const [paying, setPaying] = useState(false);

  async function handlePay() {
    setPaying(true);
    try {
      const orderData = await createOrder({
        addressId,
        couponCode:   pricingData.couponCode || undefined,
        usePoints:    pricingData.pointsDiscount > 0,
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
              addressId,
              couponId:      pricingData.couponId || null,
              subtotal:      pricingData.subtotal,
              discount:      pricingData.discount,
              pointsDiscount: pricingData.pointsDiscount,
              shipping:      pricingData.shipping,
              total:         pricingData.total,
            });
            clearCart();
            navigate(`/order-success/${result.orderId}`);
          } catch {
            addToast('Payment recorded but order confirmation failed. Contact support.', 'error');
          } finally { setPaying(false); }
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

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment</h2>

      <div className="bg-gray-50 rounded-xl p-5 mb-6 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Order Total</span>
          <span className="font-bold text-gray-900 text-base">
            ₹{Number(pricingData.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <p className="text-xs text-gray-500">Secure payment via Razorpay. UPI, Cards, Netbanking & Wallets accepted.</p>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} disabled={paying}
          className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
          Back
        </button>
        <button onClick={handlePay} disabled={paying}
          className="flex-1 py-3 bg-red-700 text-white font-semibold rounded-xl hover:bg-red-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {paying ? (
            <><Spinner size="sm" /> Processing…</>
          ) : (
            `Pay ₹${Number(pricingData.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main Checkout Page ────────────────────────────────────────────
export default function CheckoutPage() {
  const items    = useCartStore((s) => s.items);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [addressId,   setAddressId]   = useState(null);
  const [pricingData, setPricingData] = useState(null);

  if (!items.length) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <button onClick={() => navigate('/')}
          className="px-6 py-2 bg-red-700 text-white rounded-xl hover:bg-red-800 transition-colors">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Checkout</h1>
      <StepBar current={step} />

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        {step === 0 && (
          <AddressStep
            onNext={(id) => { setAddressId(id); setStep(1); }}
          />
        )}
        {step === 1 && (
          <SummaryStep
            onNext={(pricing) => { setPricingData(pricing); setStep(2); }}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <PaymentStep
            addressId={addressId}
            pricingData={pricingData}
            onBack={() => setStep(1)}
          />
        )}
      </div>
    </div>
  );
}
