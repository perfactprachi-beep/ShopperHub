import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { productsApi } from '../api/productsApi.js';
import { useFetch } from '../hooks/useFetch.js';
import ImageGallery from '../components/product/ImageGallery.jsx';
import VariantPicker from '../components/product/VariantPicker.jsx';
import { formatPrice } from '../utils/formatPrice.js';
import { calcFinalPrice } from '../utils/calcDiscount.js';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { getReviews, checkPurchased, addReview } from '../api/reviewsApi.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToastStore } from '../store/toastStore.js';

/* ── Star helpers ────────────────────────────────────────────────── */
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
          className="p-0 leading-none"
        >
          {(hover || value) >= n ? <StarFilled size={size} /> : <StarEmpty size={size} />}
        </button>
      ))}
    </div>
  );
}

function maskName(name) {
  if (!name) return 'Anonymous';
  const parts = name.trim().split(' ');
  return parts.map((p) => (p.length <= 1 ? p : p[0] + '*'.repeat(p.length - 1))).join(' ');
}

/* ── Reviews Section ─────────────────────────────────────────────── */
function ReviewsSection({ productId }) {
  const { isLoggedIn } = useAuth();
  const addToast = useToastStore((s) => s.addToast);
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

  // Auto-open modal if coming from order detail with ?review=1
  useEffect(() => {
    if (searchParams.get('review') === '1' && purchased) {
      setModalOpen(true);
      searchParams.delete('review');
      setSearchParams(searchParams, { replace: true });
    }
  }, [purchased]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) return addToast({ type: 'error', message: 'Please select a rating' });
    setSubmitting(true);
    try {
      const { data } = await addReview({ productId, rating, body });
      if (data.success) {
        addToast({ type: 'success', message: 'Review submitted!' });
        setModalOpen(false);
        setRating(0);
        setBody('');
        loadReviews();
      }
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Failed to submit review';
      addToast({ type: 'error', message: msg });
    } finally { setSubmitting(false); }
  }

  const totalCount = parseInt(stats?.count ?? 0, 10);
  const avg = parseFloat(stats?.average ?? 0);

  return (
    <div className="mt-12 border-t border-[var(--color-border)] pt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-heading)' }}>
          Ratings & Reviews
        </h2>
        {isLoggedIn && purchased && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-1.5 border border-[var(--color-primary)] text-[var(--color-primary)] text-sm font-medium rounded-[var(--radius-sm)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      {totalCount === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">No reviews yet. Be the first!</p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Average */}
          <div className="flex flex-col items-center justify-center min-w-[120px]">
            <span className="text-5xl font-bold text-[var(--color-text)]">{avg.toFixed(1)}</span>
            <div className="flex mt-1">
              {[1,2,3,4,5].map((n) => (
                avg >= n ? <StarFilled key={n} size={14} /> : <StarEmpty key={n} size={14} />
              ))}
            </div>
            <span className="text-xs text-[var(--color-muted)] mt-1">{totalCount} rating{totalCount !== 1 ? 's' : ''}</span>
          </div>

          {/* Breakdown */}
          <div className="flex-1 flex flex-col gap-1.5">
            {[5,4,3,2,1].map((star) => {
              const key = ['five','four','three','two','one'][5 - star];
              const count = parseInt(stats?.[key] ?? 0, 10);
              const pct = totalCount ? Math.round((count / totalCount) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-right text-[var(--color-muted)]">{star}</span>
                  <StarFilled size={10} />
                  <div className="flex-1 h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-[var(--color-muted)]">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review list */}
      <div className="flex flex-col gap-4">
        {reviews.map((r) => (
          <div key={r.id} className="border-b border-[var(--color-border)] pb-4 last:border-b-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex">{[1,2,3,4,5].map((n) => r.rating >= n ? <StarFilled key={n} size={12} /> : <StarEmpty key={n} size={12} />)}</div>
              <span className="text-xs font-medium text-[var(--color-text)]">{maskName(r.full_name)}</span>
              <span className="text-xs text-[var(--color-muted)]">·</span>
              <span className="text-xs text-[var(--color-muted)]">
                {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            {r.body && <p className="text-sm text-[var(--color-muted)]">{r.body}</p>}
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-md)] shadow-xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-[var(--color-text)] mb-4">Write a Review</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-2">Your Rating</label>
                <StarRating value={rating} onChange={setRating} size={28} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Your Review (optional)</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  placeholder="Share your experience with this product…"
                  className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-[var(--radius-sm)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
                >Cancel</button>
                <button
                  type="submit"
                  disabled={submitting || !rating}
                  className="px-5 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-[var(--radius-sm)] hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const [selected, setSelected] = useState({});
  const [searchParams] = useSearchParams();
  const { data, loading } = useFetch(() => productsApi.detail(slug), [slug]);
  const product = data?.data;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
        <div className="flex-1"><Skeleton className="w-full h-[480px]" /></div>
        <div className="w-80 space-y-4">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="py-32 text-center text-[var(--color-muted)]">Product not found.</div>;
  }

  const finalPrice = calcFinalPrice(product.base_price, product.discount_pct);
  const hasDiscount = product.discount_pct > 0;

  const primaryImage = product.images?.find(i => i.is_primary)?.url || product.images?.[0]?.url || '';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Helmet>
        <title>{product.title} – {product.brand_name}</title>
        <meta name="description" content={(product.description || '').slice(0, 155)} />
        <meta property="og:title" content={`${product.title} | ShoppersHub`} />
        <meta property="og:description" content={(product.description || '').slice(0, 155)} />
        <meta property="og:image" content={primaryImage} />
        <meta property="og:type" content="product" />
        <link rel="canonical" href={`${window.location.origin}/product/${product.slug}`} />
      </Helmet>
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Gallery */}
        <div className="flex-1">
          <ImageGallery images={product.images} />
        </div>

        {/* Info */}
        <div className="w-full lg:w-80 space-y-4">
          <p className="text-sm text-[var(--color-muted)]">{product.brand_name}</p>
          <h1 className="text-xl font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-heading)' }}>
            {product.title}
          </h1>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-[var(--color-text)]">{formatPrice(finalPrice)}</span>
            {hasDiscount && (
              <>
                <span className="text-sm text-[var(--color-muted)] line-through">{formatPrice(product.base_price)}</span>
                <span className="text-sm font-semibold text-[var(--color-error)]">{product.discount_pct}% OFF</span>
              </>
            )}
          </div>

          {product.variants?.length > 0 && (
            <VariantPicker variants={product.variants} selected={selected} onSelect={setSelected} />
          )}

          {product.description && (
            <p className="text-sm text-[var(--color-muted)] leading-relaxed border-t border-[var(--color-border)] pt-4">
              {product.description}
            </p>
          )}

          <button
            disabled={product.stock === 0}
            className="w-full py-3 bg-[var(--color-primary)] text-white font-medium rounded-[var(--radius-sm)] hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
          </button>
        </div>
      </div>

      {/* Reviews */}
      <ReviewsSection productId={product.id} />
    </div>
  );
}
