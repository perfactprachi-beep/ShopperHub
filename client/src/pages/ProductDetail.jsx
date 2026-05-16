import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { productsApi } from '../api/productsApi.js';
import { useFetch } from '../hooks/useFetch.js';
import ImageGallery from '../components/product/ImageGallery.jsx';
import VariantPicker from '../components/product/VariantPicker.jsx';
import ProductCarousel from '../components/home/ProductCarousel.jsx';
import { formatPrice } from '../utils/formatPrice.js';
import { calcFinalPrice } from '../utils/calcDiscount.js';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { getReviews, checkPurchased, addReview } from '../api/reviewsApi.js';
import LoginModal from '../components/auth/LoginModal.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToastStore } from '../store/toastStore.js';
import { useCartStore } from '../store/cartStore.js';
import { useWishlistStore } from '../store/wishlistStore.js';
import { toggleWishlist } from '../api/wishlistApi.js';
import { assetUrl } from '../utils/assetUrl.js';
import { getActiveOffers } from '../api/offersApi.js';

/* ── Star helpers ──────────────────────────────────────────────────────── */
function StarFilled({ size = 16, color = '#f59e0b' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function StarEmpty({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function StarRating({ value, onChange, size = 24 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
        >
          {(hover || value) >= n ? <StarFilled size={size} /> : <StarEmpty size={size} />}
        </button>
      ))}
    </div>
  );
}

function maskName(name) {
  if (!name) return 'Anonymous';
  return name.trim().split(' ').map((p) => (p.length <= 1 ? p : p[0] + '*'.repeat(p.length - 1))).join(' ');
}

/* ── Offers section — Shoppers Stop style ──────────────────────────────── */
/* Percent SVG — fallback when no image_url (mirrors SS percentIcon.svg) */
function PercentIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.2" strokeLinecap="round">
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

function OfferRow({ offer }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50">
      {/* Image / percent-icon */}
      <div className="shrink-0 w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center overflow-hidden">
        {offer.image_url && !imgErr ? (
          <img
            src={offer.image_url}
            alt=""
            onError={() => setImgErr(true)}
            className="w-full h-full object-contain p-1.5"
          />
        ) : (
          <PercentIcon />
        )}
      </div>

      {/* Offer title — single line banner */}
      <p className="text-[13px] font-medium text-gray-800 leading-snug">{offer.title}</p>
    </div>
  );
}

function OffersSection({ categoryId }) {
  const [offers, setOffers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    getActiveOffers(categoryId)
      .then(setOffers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categoryId]);

  if (loading) return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-1">
      <div className="h-3.5 w-20 bg-gray-100 rounded animate-pulse mb-3" />
      {[1, 2].map(i => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse shrink-0" />
          <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );

  if (!offers.length) return null;

  const visible = showAll ? offers : offers.slice(0, 3);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
          <line x1="7" y1="7" x2="7.01" y2="7"/>
        </svg>
        <span className="text-[13px] font-bold text-gray-900 uppercase tracking-wide">Best Offers</span>
      </div>

      {/* Offer list */}
      <div className="px-3 py-2 space-y-1.5">
        {visible.map((o) => <OfferRow key={o.id} offer={o} />)}
      </div>

      {/* View all toggle */}
      {offers.length > 3 && (
        <button
          onClick={() => setShowAll(s => !s)}
          className="w-full flex items-center justify-center gap-1 py-2.5 text-[12px] font-semibold text-[#8B1A2F] bg-gray-50 border-t border-gray-200 hover:bg-gray-100 transition-colors"
        >
          {showAll ? 'Show Less' : `View All ${offers.length} Offers`}
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round"
            className={`transition-transform ${showAll ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      )}
    </div>
  );
}

/* ── Pincode checker ───────────────────────────────────────────────────── */
function PincodeCheck() {
  const [pin, setPin] = useState('');
  const [result, setResult] = useState(null);

  const check = () => {
    if (pin.length === 6) setResult({ ok: true });
  };

  return (
    <div className="border border-gray-200 rounded p-4">
      <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        Check Delivery
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          value={pin}
          onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setResult(null); }}
          placeholder="Enter Pincode"
          className="flex-1 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2F]"
        />
        <button
          onClick={check}
          className="px-4 py-2 border border-[#8B1A2F] text-[#8B1A2F] text-sm font-semibold hover:bg-[#8B1A2F] hover:text-white transition-colors"
        >
          Check
        </button>
      </div>
      {result && (
        <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
          Delivery available in 2–4 business days
        </p>
      )}
    </div>
  );
}

/* ── Reusable accordion ────────────────────────────────────────────────── */
function Accordion({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-800 bg-white hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span>{title}</span>
        <span className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
      </button>
      {open && <div className="border-t border-gray-100">{children}</div>}
    </div>
  );
}

/* ── Product details accordion ─────────────────────────────────────────── */
function ProductDetailsAccordion({ description }) {
  const [open, setOpen] = useState(true);
  if (!description) return null;
  return (
    <div className="border border-gray-200 rounded overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-800"
        onClick={() => setOpen((o) => !o)}
      >
        <span>Product Details</span>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="border-t border-gray-100 px-4 py-4">
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{description}</p>
        </div>
      )}
    </div>
  );
}

/* ── Similar products ──────────────────────────────────────────────────── */
function SimilarProductsSection({ categorySlug, categoryName, gender, currentId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToastStore();
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!categorySlug && !gender) { setLoading(false); return; }
    const params = categorySlug ? { category: categorySlug, limit: 13 } : { gender, limit: 13 };
    productsApi
      .list(params)
      .then(({ data }) => setProducts((data.data || []).filter((p) => p.id !== currentId).slice(0, 12)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categorySlug, gender, currentId]);

  const handleAddToBag = (product) => {
    const variant = product.variants?.[0];
    const variantId = variant?.id ?? product.id;
    const finalPrice = calcFinalPrice(product.base_price, product.discount_pct);
    addItem({
      variantId,
      productId: product.id,
      title: product.title,
      brand: product.brand_name,
      image: assetUrl(product.image_url || ''),
      size: variant?.size || null,
      color: variant?.color || null,
      price: finalPrice,
      quantity: 1,
    });
    addToast('Added to bag!', 'success');
  };

  if (!loading && !products.length) return null;

  return (
    <div className="mt-14 border-t border-gray-100 pt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
          Similar Products
        </h2>
        {categorySlug && (
          <Link
            to={`/category/${categorySlug}`}
            className="text-xs font-semibold text-[#8B1A2F] border border-[#8B1A2F] px-3 py-1.5 rounded hover:bg-[#8B1A2F] hover:text-white transition-colors uppercase tracking-wider"
          >
            View All {categoryName || ''} →
          </Link>
        )}
      </div>
      <ProductCarousel products={products} loading={loading} onAddToBag={handleAddToBag} />
    </div>
  );
}

/* ── You May Also Like ─────────────────────────────────────────────────── */
function YouMayAlsoLikeSection({ parentCategorySlug, categorySlug, gender, currentId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToastStore();
  const addItem = useCartStore((s) => s.addItem);

  // Use parent category for broader "related" picks; fall back to sub-category or gender
  const browseSlug = parentCategorySlug || categorySlug;

  useEffect(() => {
    if (!browseSlug && !gender) { setLoading(false); return; }
    const params = {
      ...(browseSlug ? { category: browseSlug } : { gender }),
      sort: 'random',
      limit: 13,
    };
    productsApi
      .list(params)
      .then(({ data }) => setProducts((data.data || []).filter((p) => p.id !== currentId).slice(0, 12)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [browseSlug, gender, currentId]);

  const handleAddToBag = (product) => {
    const variant = product.variants?.[0];
    const finalPrice = calcFinalPrice(product.base_price, product.discount_pct);
    addItem({
      variantId: variant?.id ?? product.id,
      productId: product.id,
      title:     product.title,
      brand:     product.brand_name,
      image:     assetUrl(product.image_url || ''),
      size:      variant?.size || null,
      color:     variant?.color || null,
      price:     finalPrice,
      quantity:  1,
    });
    addToast('Added to bag!', 'success');
  };

  if (!loading && !products.length) return null;

  return (
    <div className="mt-14 border-t border-gray-100 pt-10">
      <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
        You May Also Like
      </h2>
      <ProductCarousel products={products} loading={loading} onAddToBag={handleAddToBag} />
    </div>
  );
}

/* ── Reviews section ───────────────────────────────────────────────────── */
function ReviewsSection({ productId }) {
  const { isLoggedIn } = useAuth();
  const { addToast } = useToastStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [reviews, setReviews]       = useState([]);
  const [stats, setStats]           = useState(null);
  const [purchased, setPurchased]   = useState(false);
  const [modalOpen, setModalOpen]   = useState(false);
  const [rating, setRating]         = useState(0);
  const [body, setBody]             = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = () =>
    getReviews(productId).then(({ data }) => {
      if (data.success) { setReviews(data.data.reviews); setStats(data.data.stats); }
    });

  useEffect(() => {
    loadReviews();
    if (isLoggedIn) {
      checkPurchased(productId).then(({ data }) => {
        if (data.success) setPurchased(data.data.purchased);
      }).catch(() => {});
    }
  }, [productId, isLoggedIn]);

  useEffect(() => {
    if (searchParams.get('review') === '1' && purchased) {
      setModalOpen(true);
      searchParams.delete('review');
      setSearchParams(searchParams, { replace: true });
    }
  }, [purchased]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) return addToast('Please select a rating', 'error');
    setSubmitting(true);
    try {
      const { data } = await addReview({ productId, rating, body });
      if (data.success) {
        addToast('Review submitted!', 'success');
        setModalOpen(false);
        setRating(0);
        setBody('');
        loadReviews();
      }
    } catch (err) {
      addToast(err.response?.data?.message ?? 'Failed to submit review', 'error');
    } finally { setSubmitting(false); }
  }

  const totalCount = parseInt(stats?.count ?? 0, 10);
  const avg = parseFloat(stats?.average ?? 0);

  return (
    <div className="mt-12 border-t border-gray-100 pt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
          Ratings & Reviews
        </h2>
        {isLoggedIn && purchased && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 border border-[#8B1A2F] text-[#8B1A2F] text-sm font-semibold hover:bg-[#8B1A2F] hover:text-white transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      {totalCount === 0 ? (
        <p className="text-sm text-gray-400">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          <div className="flex flex-col items-center justify-center min-w-[120px]">
            <span className="text-5xl font-bold text-gray-900">{avg.toFixed(1)}</span>
            <div className="flex mt-1">
              {[1,2,3,4,5].map((n) => avg >= n ? <StarFilled key={n} size={14} /> : <StarEmpty key={n} size={14} />)}
            </div>
            <span className="text-xs text-gray-400 mt-1">{totalCount} rating{totalCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            {[5,4,3,2,1].map((star) => {
              const key = ['five','four','three','two','one'][5 - star];
              const count = parseInt(stats?.[key] ?? 0, 10);
              const pct = totalCount ? Math.round((count / totalCount) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-right text-gray-400">{star}</span>
                  <StarFilled size={10} />
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-5 text-gray-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {reviews.map((r) => (
          <div key={r.id} className="border-b border-gray-100 pb-5 last:border-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex">{[1,2,3,4,5].map((n) => r.rating >= n ? <StarFilled key={n} size={12} /> : <StarEmpty key={n} size={12} />)}</div>
              <span className="text-xs font-semibold text-gray-800">{maskName(r.full_name)}</span>
              <span className="text-xs text-gray-300">·</span>
              <span className="text-xs text-gray-400">
                {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            {r.body && <p className="text-sm text-gray-500">{r.body}</p>}
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded shadow-xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Write a Review</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Your Rating</label>
                <StarRating value={rating} onChange={setRating} size={28} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Your Review (optional)</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  placeholder="Share your experience…"
                  className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-[#8B1A2F] resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-gray-700">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !rating}
                  className="px-5 py-2 bg-[#8B1A2F] text-white text-sm font-semibold hover:bg-[#6d1424] disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Submitting…' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Loading skeleton ──────────────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Skeleton className="h-3 w-64 mb-6" />
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 flex gap-3">
          <div className="flex flex-col gap-2 shrink-0">
            {[1,2,3,4].map((i) => <Skeleton key={i} className="w-[72px] h-[88px]" />)}
          </div>
          <Skeleton className="flex-1 aspect-[3/4]" />
        </div>
        <div className="w-full lg:w-[45%] space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

/* ── Clothing category detection ───────────────────────────────────────── */
function isClothingCategory(categoryName = '', categorySlug = '') {
  const t = (categoryName + ' ' + categorySlug).toLowerCase();
  const nonClothing = [
    'footwear','shoe','sandal','sneaker','heel','boot','slipper','loafer',
    'watch','clock','smartwatch',
    'bag','handbag','clutch','wallet','backpack','purse','tote',
    'beauty','skincare','haircare','makeup','nail','fragrance','perfume','deodorant','lipstick','foundation',
    'jewel','jewelry','jewellery','sunglass','belt','sunscreen','serum','lotion','moisturizer',
  ];
  return !nonClothing.some(k => t.includes(k));
}

/* ── Size chart data ───────────────────────────────────────────────────── */
const CHARTS = {
  women: {
    cols: ['Size', 'Bust', 'Waist', 'Hip', 'Shoulder'],
    rows: [
      { s:'XS',  cm:[81.3,66.0,88.9,33.0],  in:[32.0,26.0,35.0,13.0] },
      { s:'S',   cm:[86.4,71.1,93.9,34.3],  in:[34.0,28.0,37.0,13.5] },
      { s:'M',   cm:[91.4,76.2,99.1,35.6],  in:[36.0,30.0,39.0,14.0] },
      { s:'L',   cm:[96.5,81.3,104.1,36.8], in:[38.0,32.0,41.0,14.5] },
      { s:'XL',  cm:[101.6,86.4,109.2,38.1],in:[40.0,34.0,43.0,15.0] },
      { s:'2XL', cm:[106.7,91.4,114.3,39.4],in:[42.0,36.0,45.0,15.5] },
      { s:'3XL', cm:[111.8,96.5,119.4,40.6],in:[44.0,38.0,47.0,16.0] },
    ],
  },
  men: {
    cols: ['Size', 'Chest', 'Waist', 'Hip', 'Shoulder'],
    rows: [
      { s:'XS',  cm:[86,76,90,42],    in:[33.9,29.9,35.4,16.5] },
      { s:'S',   cm:[91,81,95,43.5],  in:[35.8,31.9,37.4,17.1] },
      { s:'M',   cm:[96,86,100,45],   in:[37.8,33.9,39.4,17.7] },
      { s:'L',   cm:[101,91,105,46.5],in:[39.8,35.8,41.3,18.3] },
      { s:'XL',  cm:[106,96,110,48],  in:[41.7,37.8,43.3,18.9] },
      { s:'2XL', cm:[111,101,115,49.5],in:[43.7,39.8,45.3,19.5] },
      { s:'3XL', cm:[116,106,120,51], in:[45.7,41.7,47.2,20.1] },
    ],
  },
  kids: {
    cols: ['Age', 'Height', 'Chest', 'Waist'],
    rows: [
      { s:'2Y',  cm:[86,53,52],   in:[33.9,20.9,20.5] },
      { s:'4Y',  cm:[104,57,54],  in:[40.9,22.4,21.3] },
      { s:'6Y',  cm:[116,61,56],  in:[45.7,24.0,22.0] },
      { s:'8Y',  cm:[128,65,59],  in:[50.4,25.6,23.2] },
      { s:'10Y', cm:[140,69,62],  in:[55.1,27.2,24.4] },
      { s:'12Y', cm:[152,74,65],  in:[59.8,29.1,25.6] },
      { s:'14Y', cm:[164,79,69],  in:[64.6,31.1,27.2] },
    ],
  },
};

function getChartType(gender, categoryName = '') {
  const cat = categoryName.toLowerCase();
  const isInfant = cat.includes('infant') || cat.includes('baby') || cat.includes('newborn');
  if (isInfant) return 'infant';
  if (gender === 'kids') return 'kids';
  if (gender === 'men')  return 'men';
  return 'women';
}

/* ── Body SVG figures ──────────────────────────────────────────────────── */
function Dot({ cx, cy, n }) {
  return (
    <>
      <circle cx={cx} cy={cy} r="7.5" fill="#111111" />
      <text x={cx} y={cy + 3} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif">{n}</text>
    </>
  );
}

function WomenFigure() {
  const c = '#C8957A';
  return (
    <svg viewBox="0 0 130 278" className="h-64 mx-auto block">
      <ellipse cx="60" cy="19" rx="13" ry="17" fill={c}/>
      <path d="M54 35 Q56 40 56 46 L64 46 Q64 40 66 35 Z" fill={c}/>
      <path d="M56 46 Q28 48 18 64 Q10 80 16 96 Q22 108 28 116 Q22 128 20 140 Q22 148 28 154 L28 272 L46 272 L46 154 L74 154 L74 272 L92 272 L92 154 Q98 148 100 140 Q98 128 92 116 Q98 108 104 96 Q110 80 102 64 Q92 48 64 46 Z" fill={c}/>
      <Dot cx={108} cy={63} n={1}/>
      <Dot cx={112} cy={86} n={2}/>
      <Dot cx={108} cy={104} n={3}/>
      <Dot cx={104} cy={120} n={4}/>
      <Dot cx={108} cy={140} n={5}/>
      <Dot cx={85}  cy={178} n={6}/>
      <Dot cx={82}  cy={232} n={7}/>
    </svg>
  );
}

function MenFigure() {
  const c = '#6B9EB5';
  return (
    <svg viewBox="0 0 130 278" className="h-64 mx-auto block">
      <ellipse cx="60" cy="19" rx="14" ry="16" fill={c}/>
      <path d="M53 34 Q55 40 55 46 L65 46 Q65 40 67 34 Z" fill={c}/>
      <path d="M55 46 Q26 48 16 62 Q10 76 16 90 Q22 102 28 110 Q26 122 26 134 Q26 144 30 152 L30 272 L48 272 L48 152 L72 152 L72 272 L90 272 L90 152 Q94 144 94 134 Q94 122 92 110 Q98 102 104 90 Q110 76 104 62 Q94 48 65 46 Z" fill={c}/>
      <Dot cx={110} cy={62} n={1}/>
      <Dot cx={113} cy={84} n={2}/>
      <Dot cx={109} cy={100} n={3}/>
      <Dot cx={105} cy={118} n={4}/>
      <Dot cx={103} cy={136} n={5}/>
      <Dot cx={84}  cy={176} n={6}/>
      <Dot cx={80}  cy={232} n={7}/>
    </svg>
  );
}

function GirlFigure() {
  const c = '#C8957A';
  return (
    <svg viewBox="0 0 130 260" className="h-60 mx-auto block">
      <ellipse cx="60" cy="22" rx="15" ry="19" fill={c}/>
      <path d="M54 40 Q56 44 56 50 L64 50 Q64 44 66 40 Z" fill={c}/>
      <path d="M56 50 Q32 52 22 66 Q14 80 20 94 Q26 106 30 114 Q24 124 22 136 Q24 142 30 148 L30 255 L46 255 L46 148 L74 148 L74 255 L90 255 L90 148 Q96 142 98 136 Q96 124 90 114 Q94 106 100 94 Q106 80 98 66 Q88 52 64 50 Z" fill={c}/>
      <Dot cx={106} cy={65} n={1}/>
      <Dot cx={109} cy={86} n={2}/>
      <Dot cx={106} cy={103} n={3}/>
      <Dot cx={102} cy={118} n={4}/>
      <Dot cx={105} cy={136} n={5}/>
      <Dot cx={83}  cy={170} n={6}/>
      <Dot cx={80}  cy={220} n={7}/>
    </svg>
  );
}

function InfantFigure() {
  const s = '#555555';
  return (
    <svg viewBox="0 0 130 220" className="h-52 mx-auto block">
      <ellipse cx="60" cy="28" rx="24" ry="27" fill="none" stroke={s} strokeWidth="2"/>
      <ellipse cx="60" cy="95" rx="24" ry="32" fill="none" stroke={s} strokeWidth="2"/>
      <path d="M37 80 Q22 90 24 106" fill="none" stroke={s} strokeWidth="2"/>
      <path d="M83 80 Q98 90 96 106" fill="none" stroke={s} strokeWidth="2"/>
      <path d="M46 126 Q42 152 44 170" fill="none" stroke={s} strokeWidth="2"/>
      <ellipse cx="44" cy="175" rx="9" ry="6" fill="none" stroke={s} strokeWidth="2"/>
      <path d="M74 126 Q78 152 76 170" fill="none" stroke={s} strokeWidth="2"/>
      <ellipse cx="76" cy="175" rx="9" ry="6" fill="none" stroke={s} strokeWidth="2"/>
      <Dot cx={94} cy={68} n={1}/>
      <Dot cx={98} cy={90} n={2}/>
      <Dot cx={96} cy={107} n={3}/>
      <Dot cx={94} cy={120} n={4}/>
      <Dot cx={92} cy={132} n={5}/>
    </svg>
  );
}

/* ── Measurement guide sub-view ────────────────────────────────────────── */
const MEASURE_POINTS = {
  women: [
    { n:1, label:'Shoulder',       desc:'Measure from one shoulder tip to the other, across the back of the neck.' },
    { n:2, label:'Bust',           desc:'Stand straight, keeping the measuring tape parallel to the floor, and measure around the fullest part of your bust.' },
    { n:3, label:'Front Length',   desc:'Measure from the base of the neck, to the waistline.' },
    { n:4, label:'Waist',          desc:'Measure around the slimmest part of your waist, between your chest and hips.' },
    { n:5, label:'Hips',           desc:'Measure around the widest part of your hips. Ensure the tape is snug with no gaps.' },
    { n:6, label:'Inseam Length',  desc:'Measure from top of the inside leg at crotch to the ankle bone.' },
  ],
  men: [
    { n:1, label:'Shoulder',       desc:'Measure from one shoulder tip to the other, across the back of the neck.' },
    { n:2, label:'Chest',          desc:'Stand straight with the tape parallel to the floor and measure around the fullest part of your chest.' },
    { n:3, label:'Front Length',   desc:'Measure from the base of the neck, to the waistline.' },
    { n:4, label:'Waist',          desc:'Measure around the narrowest part of your torso, between your chest and hips.' },
    { n:5, label:'Hips',           desc:'Measure around the widest part of your hips. Ensure the tape is snug with no gaps.' },
    { n:6, label:'Inseam Length',  desc:'Measure from top of the inside leg at crotch to the ankle bone.' },
  ],
  kids: [
    { n:1, label:'Shoulder',       desc:'Measure from one shoulder tip to the other, across the back of the neck.' },
    { n:2, label:'Chest',          desc:'Stand straight with the tape parallel to the floor and measure around the fullest part of the chest.' },
    { n:3, label:'Front Length',   desc:'Measure from the base of the neck, to the waistline.' },
    { n:4, label:'Waist',          desc:'Measure around the narrowest part of the torso, between chest and hips.' },
    { n:5, label:'Hips',           desc:'Measure around the widest part of the hips. Ensure the tape is snug with no gaps.' },
    { n:6, label:'Inseam Length',  desc:'Measure from top of the inside leg at crotch to the ankle bone.' },
  ],
  infant: [
    { n:1, label:'Shoulder',       desc:'Measure from one shoulder tip to the other, across the back of the neck.' },
    { n:2, label:'Chest',          desc:'Measure around the fullest part of the chest.' },
    { n:3, label:'Front Length',   desc:'Measure from the base of the neck, to the waistline.' },
    { n:4, label:'Waist',          desc:'Measure around the narrowest part of the torso.' },
    { n:5, label:'Hips',           desc:'Measure around the widest part of the hips.' },
  ],
};

function MeasurementGuide({ chartType }) {
  const FigureMap = { women: WomenFigure, men: MenFigure, kids: GirlFigure, infant: InfantFigure };
  const Figure = FigureMap[chartType] || WomenFigure;
  const points = MEASURE_POINTS[chartType] || MEASURE_POINTS.women;
  return (
    <div>
      <div className="mb-5">
        <h3 className="text-[15px] font-bold text-gray-900 mb-1">Measurement Guide</h3>
        <p className="text-[13px] text-gray-500">To choose the correct size for you, measure your body as follows:</p>
      </div>
      <Figure />
      <div className="mt-6 space-y-3">
        {points.map(p => (
          <p key={p.n} className="text-[13px] text-gray-700 leading-relaxed">
            <span className="font-bold">{p.n}) {p.label}:</span> {p.desc}
          </p>
        ))}
      </div>
      <p className="text-[11px] text-gray-400 mt-5 leading-relaxed">
        *Measurements shown will have a tolerance of 0.5 inches / 1.25 cm
      </p>
    </div>
  );
}

/* ── Size Chart Drawer ─────────────────────────────────────────────────── */
function SizeChartDrawer({ open, onClose, product, onAddToBag }) {
  const [unit, setUnit] = useState('cm');
  const [showMeasure, setShowMeasure] = useState(false);
  const chartType = getChartType(product?.gender, product?.category_name);
  const chart = CHARTS[chartType] || CHARTS.women;
  const isCm = unit === 'cm';
  const primaryImage = product?.images?.find((i) => i.is_primary)?.url || product?.images?.[0]?.url || '';
  const finalPrice = product ? calcFinalPrice(product.base_price, product.discount_pct) : 0;

  // reset sub-view when drawer closes
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          {showMeasure ? (
            <button
              onClick={() => setShowMeasure(false)}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-[#8B1A2F] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              Back
            </button>
          ) : (
            <h2 className="text-base font-bold text-gray-900">Size Chart</h2>
          )}
          <button
            onClick={() => { onClose(); setShowMeasure(false); }}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {showMeasure ? (
            /* ── Measurement guide view ── */
            <div className="px-5 py-5">
              <MeasurementGuide chartType={chartType} />
            </div>
          ) : (
            /* ── Size table view ── */
            <>
              {/* Product strip */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
                {primaryImage && (
                  <img src={assetUrl(primaryImage)} alt={product?.title} className="w-14 h-16 object-cover rounded shrink-0"/>
                )}
                <div className="min-w-0">
                  {product?.brand_name && (
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider truncate">{product.brand_name}</p>
                  )}
                  <p className="text-[13px] font-medium text-gray-900 line-clamp-2 leading-snug">{product?.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[14px] font-bold text-gray-900">{formatPrice(finalPrice)}</span>
                    {product?.discount_pct > 0 && (
                      <>
                        <span className="text-[12px] text-gray-400 line-through">{formatPrice(product.base_price)}</span>
                        <span className="text-[12px] font-semibold text-[#2E7D32]">{product.discount_pct}% Off</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-5 py-4">
                {/* CM / IN toggle + How to Measure */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex rounded-sm border border-gray-300 overflow-hidden text-[12px] font-semibold">
                    {['cm','in'].map(u => (
                      <button
                        key={u}
                        onClick={() => setUnit(u)}
                        className={`px-4 py-1.5 uppercase transition-colors ${unit === u ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                      >
                        {u.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowMeasure(true)}
                    className="text-[12px] text-[#8B1A2F] underline underline-offset-2 hover:no-underline font-medium"
                  >
                    How to Measure?
                  </button>
                </div>

                {/* Size table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-3 py-2.5 w-8"/>
                        {chart.cols.map(col => (
                          <th key={col} className="px-3 py-2.5 text-left font-semibold text-gray-700 whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {chart.rows.map((row, i) => (
                        <tr key={row.s} className={`border-b border-gray-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                          <td className="px-3 py-3">
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300"/>
                          </td>
                          <td className="px-3 py-3 font-bold text-gray-900">{row.s}</td>
                          {(isCm ? row.cm : row.in).map((v, vi) => (
                            <td key={vi} className="px-3 py-3 text-gray-600">{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
                  * All measurements are approximate. Sizes may differ across brands.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 flex gap-3 shrink-0">
          <button
            onClick={() => { onClose(); setShowMeasure(false); }}
            className="flex-1 py-3 border-2 border-gray-300 text-gray-700 text-sm font-bold uppercase tracking-widest hover:border-gray-500 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => { onAddToBag?.(); onClose(); setShowMeasure(false); }}
            className="flex-1 py-3 bg-[#8B1A2F] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#6d1424] transition-colors"
          >
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Icon: Heart ───────────────────────────────────────────────────────── */
function IconHeart({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#8B1A2F' : 'none'} stroke={filled ? '#8B1A2F' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

/* ── Main page ─────────────────────────────────────────────────────────── */
export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selected, setSelected] = useState({});
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [isAdded, setIsAdded]       = useState(false);
  const [bagQty, setBagQty]         = useState(1);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { data, loading } = useFetch(() => productsApi.detail(slug), [slug]);
  const product = data?.data;

  const { isLoggedIn } = useAuth();
  const { addToast }   = useToastStore();
  const addItem    = useCartStore((s) => s.addItem);
  const updateQty  = useCartStore((s) => s.updateQty);
  const cartItems  = useCartStore((s) => s.items);
  const { has, toggle } = useWishlistStore();

  // Reset when navigating to a different product
  useEffect(() => { setIsAdded(false); setBagQty(1); }, [slug]);

  useEffect(() => {
    if (!product) return;
    const item = {
      id: product.id,
      title: product.name,
      slug: product.slug || slug,
      base_price: product.base_price,
      discount_pct: product.discount_pct,
      brand_name: product.brand_name,
      image_url: product.images?.find((i) => i.is_primary)?.url || product.images?.[0]?.url || '',
      stock: product.variants?.some((v) => v.stock > 0) ? 1 : 0,
    };
    try {
      const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const deduped = stored.filter((p) => p.id !== item.id);
      localStorage.setItem('recentlyViewed', JSON.stringify([item, ...deduped].slice(0, 10)));
    } catch {}
  }, [product, slug]);

  if (loading) return <LoadingSkeleton />;
  if (!product) {
    return <div className="py-32 text-center text-gray-400">Product not found.</div>;
  }

  const finalPrice = calcFinalPrice(product.base_price, product.discount_pct);
  const hasDiscount = product.discount_pct > 0;
  const primaryImage = product.images?.find((i) => i.is_primary)?.url || product.images?.[0]?.url || '';
  const wished = has(product.id);
  const inCart = isAdded || cartItems.some((i) => String(i.productId) === String(product.id));

  const sizes  = [...new Set(product.variants?.map((v) => v.size).filter(Boolean))];
  const selectedVariant = product.variants?.find((v) => {
    if (selected.size && selected.color) return v.size === selected.size && v.color === selected.color;
    if (selected.size)  return v.size === selected.size  && v.stock > 0;
    if (selected.color) return v.color === selected.color && v.stock > 0;
    return v.stock > 0;
  }) || product.variants?.[0];

  const handleAddToBag = () => {
    if (sizes.length > 0 && !selected.size) {
      addToast('Please select a size', 'error');
      return;
    }
    if (!selectedVariant) {
      addToast('No variant available', 'error');
      return;
    }
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      title:     product.title,
      brand:     product.brand_name,
      image:     assetUrl(primaryImage),
      size:      selectedVariant.size,
      color:     selectedVariant.color,
      price:     finalPrice,
      quantity:  1,
    });
    setIsAdded(true);
    setBagQty(1);
    addToast('Added to bag!', 'success');
  };

  const handleWishlist = async () => {
    if (!isLoggedIn) {
      setLoginModalOpen(true);
      return;
    }
    toggle(product.id);
    try {
      await toggleWishlist(product.id);
      addToast(wished ? 'Removed from wishlist' : 'Added to wishlist', 'success');
    } catch {
      toggle(product.id);
      addToast('Something went wrong', 'error');
    }
  };

  const breadcrumb = [
    { label: 'Home', to: '/' },
    product.gender && { label: product.gender.charAt(0).toUpperCase() + product.gender.slice(1), to: `/category/${product.gender}` },
    product.brand_name && { label: product.brand_name, to: `/brand/${product.brand_slug}` },
    { label: product.title, to: null },
  ].filter(Boolean);

  return (
    <div className="bg-white min-h-screen">
      {/* Size Chart Drawer */}
      <SizeChartDrawer
        open={sizeChartOpen}
        onClose={() => setSizeChartOpen(false)}
        product={product}
        onAddToBag={handleAddToBag}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      <Helmet>
        <title>{product.title} – {product.brand_name} | ShoppersHub</title>
        <meta name="description" content={(product.description || '').slice(0, 155)} />
        <meta property="og:image" content={primaryImage} />
        <link rel="canonical" href={`${window.location.origin}/product/${product.slug}`} />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1 text-xs text-gray-400 mb-6">
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-200">/</span>}
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-[#8B1A2F] transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-600 line-clamp-1 max-w-[200px]">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── Left: Image gallery ── */}
          <div className="w-full lg:w-[52%]">
            <ImageGallery images={product.images} />
          </div>

          {/* ── Right: Product info ── */}
          <div className="w-full lg:w-[48%] space-y-4">

            {/* 1. Brand + title + share */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {product.brand_name && (
                    <Link
                      to={`/brand/${product.brand_slug}`}
                      className="text-[11px] font-bold text-gray-500 uppercase tracking-widest hover:text-[#8B1A2F] transition-colors"
                    >
                      {product.brand_name}
                    </Link>
                  )}
                  <h1
                    className="text-[18px] lg:text-[20px] font-semibold text-gray-900 mt-0.5 leading-snug"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {product.title}
                  </h1>
                </div>
                {/* Share + Wishlist icons */}
                <div className="flex items-center gap-2 mt-0.5 shrink-0">
                  <button
                    onClick={() => navigator.share?.({ title: product.title, url: window.location.href })}
                    className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#8B1A2F] hover:border-[#8B1A2F] transition-colors"
                    aria-label="Share"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                  </button>
                  <button
                    onClick={handleWishlist}
                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                      wished
                        ? 'border-[#8B1A2F] text-[#8B1A2F] bg-red-50'
                        : 'border-gray-200 text-gray-400 hover:text-[#8B1A2F] hover:border-[#8B1A2F]'
                    }`}
                    aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <IconHeart filled={wished} />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Price block — SS style: final price + MRP strikethrough + % off */}
            <div className="pb-1">
              <div className="flex items-baseline flex-wrap gap-2">
                <span className="text-[22px] font-bold text-gray-900">{formatPrice(finalPrice)}</span>
                {hasDiscount && (
                  <>
                    <span className="text-[13px] text-gray-400">
                      MRP <span className="line-through">{formatPrice(product.base_price)}</span>
                    </span>
                    <span className="text-[13px] font-bold text-[#2E7D32]">
                      ({product.discount_pct}% OFF)
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">Inclusive of all taxes</p>
            </div>

            {/* 3. Offers — right after price, exactly like SS */}
            <OffersSection categoryId={product.category_id} />

            {/* 4. Variants (color + size) */}
            {product.variants?.length > 0 && (
              <VariantPicker
                variants={product.variants}
                selected={selected}
                onSelect={setSelected}
                onSizeChart={isClothingCategory(product.category_name, product.category_slug) ? () => setSizeChartOpen(true) : undefined}
              />
            )}

            {/* 5. CTA buttons */}
            <div className="flex flex-col gap-3 pt-1">
              {inCart ? (
                /* ── Qty stepper (bordered) + Go To Bag (dark) side by side ── */
                <div className="flex items-stretch gap-3 h-[52px]">
                  {/* Qty stepper — white bg, dark border */}
                  <div className="flex items-stretch border-2 border-gray-300 flex-1">
                    <button
                      onClick={() => {
                        const n = Math.max(1, bagQty - 1);
                        setBagQty(n);
                        updateQty(selectedVariant?.id ?? product.id, n);
                      }}
                      className="w-14 shrink-0 flex items-center justify-center bg-white text-gray-900 text-2xl hover:bg-gray-100 transition-colors"
                    >
                      −
                    </button>
                    <div className="flex-1 flex items-center justify-center bg-white border-x border-gray-300 text-gray-900 text-base font-semibold select-none">
                      {bagQty}
                    </div>
                    <button
                      onClick={() => {
                        const n = bagQty + 1;
                        setBagQty(n);
                        updateQty(selectedVariant?.id ?? product.id, n);
                      }}
                      className="w-14 shrink-0 flex items-center justify-center bg-white text-gray-900 text-2xl hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Go To Bag — dark */}
                  <button
                    onClick={() => navigate('/cart')}
                    className="flex-1 bg-[#1C1C1C] text-white font-bold text-sm tracking-widest hover:bg-black transition-colors"
                  >
                    Go To Bag
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToBag}
                  disabled={product.stock === 0}
                  className="w-full py-3.5 bg-[#8B1A2F] text-white font-bold text-sm uppercase tracking-widest hover:bg-[#6d1424] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
                </button>
              )}
            </div>

            {/* 6. Product Highlights — built-in fields + custom attributes from admin */}
            {(() => {
              // Built-in fields always pulled from the product record
              const builtin = [
                product.brand_name    && { label: 'Brand',    value: product.brand_name },
                product.gender        && { label: 'Gender',   value: product.gender.charAt(0).toUpperCase() + product.gender.slice(1) },
                product.category_name && { label: 'Category', value: product.category_name },
                                         { label: 'Pack Of',  value: '1' },
              ].filter(Boolean);

              // Custom highlights from Admin → Attributes tab (section = 'highlights')
              // Skip any whose label duplicates a built-in one (case-insensitive)
              const builtinLabels = new Set(builtin.map(r => r.label.toLowerCase()));
              const custom = (product.attributes || []).filter(
                a => (a.section || 'highlights') === 'highlights' &&
                     !builtinLabels.has(a.label.toLowerCase())
              );

              // Merge: custom attrs first (admin-defined), then built-in fields
              const rows = [...custom, ...builtin];
              if (!rows.length) return null;

              return (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                    <span className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">Product Highlights</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {rows.map(({ label, value }) => (
                      <div key={label} className="flex items-center px-4 py-2.5 gap-3">
                        <span className="text-[12px] text-gray-400 w-28 shrink-0">{label}</span>
                        <span className="text-[12px] font-medium text-gray-800 capitalize">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* 7. Delivery / pincode */}
            <PincodeCheck />

            {/* 8. 14-day returns text line — only if returnable */}
            {product.is_returnable !== false && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 .49-3.87"/></svg>
                <span><span className="font-semibold text-gray-700">14 Days</span> Easy Returns And Exchange</span>
              </div>
            )}

            {/* 9. Trust badges — 100% Authentic | Fast Delivery | Easy Return (SS style) */}
            <div className="grid border border-gray-200 rounded-xl overflow-hidden"
              style={{ gridTemplateColumns: product.is_returnable !== false ? 'repeat(3,1fr)' : 'repeat(2,1fr)' }}
            >
              {/* 100% Authentic */}
              <div className="flex flex-col items-center gap-1.5 py-4 px-2 border-r border-gray-200">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
                <span className="text-[11px] text-gray-600 font-medium text-center leading-tight">100% Authentic</span>
              </div>

              {/* Fast Delivery */}
              <div className={`flex flex-col items-center gap-1.5 py-4 px-2 ${product.is_returnable !== false ? 'border-r border-gray-200' : ''}`}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
                  <rect x="9" y="11" width="14" height="10" rx="2"/>
                  <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                </svg>
                <span className="text-[11px] text-gray-600 font-medium text-center leading-tight">Fast Delivery</span>
              </div>

              {/* Easy Return — only if product.is_returnable */}
              {product.is_returnable !== false && (
                <div className="flex flex-col items-center gap-1.5 py-4 px-2">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 .49-3.87"/>
                  </svg>
                  <span className="text-[11px] text-gray-600 font-medium text-center leading-tight">Easy Return</span>
                </div>
              )}
            </div>

            {/* 9. Product details accordion */}
            <ProductDetailsAccordion description={product.description} />

            {/* 10. Additional Details — from admin Attributes tab (section = 'details') */}
            {(() => {
              const details = (product.attributes || []).filter(
                a => (a.section || 'highlights') === 'details'
              );
              if (!details.length) return null;
              return (
                <Accordion title="Additional Details">
                  <div className="divide-y divide-gray-100">
                    {details.map(({ label, value }) => (
                      <div key={label} className="flex px-4 py-2.5 gap-3">
                        <span className="text-[12px] text-gray-400 w-36 shrink-0">{label}</span>
                        <span className="text-[12px] text-gray-700 leading-relaxed">{value}</span>
                      </div>
                    ))}
                  </div>
                </Accordion>
              );
            })()}
          </div>
        </div>

        {/* Similar Products — same sub-category */}
        <SimilarProductsSection categorySlug={product.category_slug} categoryName={product.category_name} gender={product.gender} currentId={product.id} />

        {/* You May Also Like — random picks from same parent category */}
        <YouMayAlsoLikeSection parentCategorySlug={product.parent_category_slug} categorySlug={product.category_slug} gender={product.gender} currentId={product.id} />

        {/* Reviews */}
        <ReviewsSection productId={product.id} />
      </div>
    </div>
  );
}
