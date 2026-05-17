import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { productsApi } from '../api/productsApi.js';
import { useFetch } from '../hooks/useFetch.js';
import ImageGallery from '../components/product/ImageGallery.jsx';
import VariantPicker from '../components/product/VariantPicker.jsx';
import { formatPrice } from '../utils/formatPrice.js';
import { calcFinalPrice } from '../utils/calcDiscount.js';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { useCartStore } from '../store/cartStore.js';
import { useWishlistStore } from '../store/wishlistStore.js';
import { useToastStore } from '../store/toastStore.js';
import { useAuth } from '../hooks/useAuth.js';
import { useUiStore } from '../store/uiStore.js';
import { toggleWishlist } from '../api/wishlistApi.js';
import { assetUrl } from '../utils/assetUrl.js';
import { getActiveOffers } from '../api/offersApi.js';
import ProductCarousel from '../components/home/ProductCarousel.jsx';
import SizeSelectDrawer from '../components/product/SizeSelectDrawer.jsx';

/* ── reused helpers (same as ProductDetail) ─────────────────────────────── */
function PercentIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.2" strokeLinecap="round">
      <line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}
function OfferRow({ offer }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50">
      <div className="shrink-0 w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center overflow-hidden">
        {offer.image_url && !imgErr
          ? <img src={offer.image_url} alt="" onError={() => setImgErr(true)} className="w-full h-full object-contain p-1.5" />
          : <PercentIcon />}
      </div>
      <p className="text-[13px] font-medium text-gray-800 leading-snug">{offer.title}</p>
    </div>
  );
}
function OffersSection({ categoryId }) {
  const [offers, setOffers]   = useState([]);
  const [showAll, setShowAll] = useState(false);
  useEffect(() => { getActiveOffers(categoryId).then(setOffers).catch(() => {}); }, [categoryId]);
  if (!offers.length) return null;
  const visible = showAll ? offers : offers.slice(0, 3);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
          <line x1="7" y1="7" x2="7.01" y2="7"/>
        </svg>
        <span className="text-[13px] font-bold text-gray-900 uppercase tracking-wide">Best Offers</span>
      </div>
      <div className="px-3 py-2 space-y-1.5">
        {visible.map((o) => <OfferRow key={o.id} offer={o} />)}
      </div>
      {offers.length > 3 && (
        <button onClick={() => setShowAll(s => !s)}
          className="w-full flex items-center justify-center gap-1 py-2.5 text-[12px] font-semibold text-[#8B1A2F] bg-gray-50 border-t border-gray-200 hover:bg-gray-100 transition-colors">
          {showAll ? 'Show Less' : `View All ${offers.length} Offers`}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={showAll ? 'rotate-180' : ''}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      )}
    </div>
  );
}
function PincodeCheck() {
  const [pin, setPin] = useState('');
  const [result, setResult] = useState(null);
  return (
    <div className="border border-gray-200 rounded p-4">
      <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        Check Delivery
      </p>
      <div className="flex gap-2">
        <input type="text" maxLength={6} value={pin}
          onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setResult(null); }}
          placeholder="Enter Pincode"
          className="flex-1 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2F]" />
        <button onClick={() => pin.length === 6 && setResult(true)}
          className="px-4 py-2 border border-[#8B1A2F] text-[#8B1A2F] text-sm font-semibold hover:bg-[#8B1A2F] hover:text-white transition-colors">
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
function ProductDetailsAccordion({ description }) {
  const [open, setOpen] = useState(true);
  if (!description) return null;
  return (
    <div className="border border-gray-200 rounded overflow-hidden">
      <button className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-800"
        onClick={() => setOpen(o => !o)}>
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
function IconHeart({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#8B1A2F' : 'none'} stroke={filled ? '#8B1A2F' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
/* ── Similar Products ────────────────────────────────────────────────────── */
function SimilarProductsSection({ categorySlug, parentCategorySlug, categoryName, gender, currentId }) {
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [drawerProduct, setDrawerProduct] = useState(null);
  const { addToast } = useToastStore();
  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigate();

  useEffect(() => {
    if (!categorySlug && !parentCategorySlug && !gender) { setLoading(false); return; }

    async function fetchSimilar() {
      const tryFetch = async (params) => {
        const { data } = await productsApi.list(params);
        return (data.data || []).filter((p) => p.id !== currentId);
      };
      try {
        let results = categorySlug ? await tryFetch({ category: categorySlug, limit: 25 }) : [];
        if (results.length < 4 && parentCategorySlug && parentCategorySlug !== categorySlug)
          results = await tryFetch({ category: parentCategorySlug, limit: 25 });
        if (results.length < 4 && gender)
          results = await tryFetch({ gender, limit: 25 });
        setProducts(results.slice(0, 12));
      } catch { setProducts([]); }
      finally { setLoading(false); }
    }
    fetchSimilar();
  }, [categorySlug, parentCategorySlug, gender, currentId]);

  const handleDrawerAdd = (product, variant) => {
    addItem({
      variantId:    variant?.id ?? product.id,
      productId:    product.id,
      title:        product.title,
      brand:        product.brand_name,
      image:        assetUrl(product.image_url || ''),
      size:         variant?.size || null,
      color:        variant?.color || null,
      price:        calcFinalPrice(product.base_price, product.discount_pct),
      mrp:          product.base_price,
      discount_pct: product.discount_pct,
      quantity:     1,
    });
    navigate('/bag-added', { state: { product: { slug: product.slug } } });
  };

  if (!loading && !products.length) return null;

  return (
    <div className="mt-14 border-t border-gray-100 pt-10">
      {drawerProduct && (
        <SizeSelectDrawer
          product={drawerProduct}
          onClose={() => setDrawerProduct(null)}
          onAddToBag={handleDrawerAdd}
        />
      )}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
          Similar Products
        </h2>
        {categorySlug && (
          <Link to={`/category/${categorySlug}`}
            className="text-xs font-semibold text-[#8B1A2F] border border-[#8B1A2F] px-3 py-1.5 rounded hover:bg-[#8B1A2F] hover:text-white transition-colors uppercase tracking-wider">
            View All {categoryName || ''} →
          </Link>
        )}
      </div>
      <ProductCarousel products={products} loading={loading} onAddToBag={setDrawerProduct} openInNewTab withDrawer />
    </div>
  );
}

/* ── You May Also Like ───────────────────────────────────────────────────── */
function YouMayAlsoLikeSection({ parentCategorySlug, categorySlug, gender, currentId }) {
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [drawerProduct, setDrawerProduct] = useState(null);
  const { addToast } = useToastStore();
  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigate();

  const browseSlug = parentCategorySlug || categorySlug;

  useEffect(() => {
    if (!browseSlug && !gender) { setLoading(false); return; }

    async function fetchYMAL() {
      const tryFetch = async (params) => {
        const { data } = await productsApi.list(params);
        return (data.data || []).filter((p) => p.id !== currentId);
      };
      try {
        let results = browseSlug
          ? await tryFetch({ category: browseSlug, sort: 'random', limit: 25 })
          : [];
        if (results.length < 4 && gender)
          results = await tryFetch({ gender, sort: 'random', limit: 25 });
        setProducts(results.slice(0, 12));
      } catch { setProducts([]); }
      finally { setLoading(false); }
    }
    fetchYMAL();
  }, [browseSlug, gender, currentId]);

  const handleDrawerAdd = (product, variant) => {
    addItem({
      variantId:    variant?.id ?? product.id,
      productId:    product.id,
      title:        product.title,
      brand:        product.brand_name,
      image:        assetUrl(product.image_url || ''),
      size:         variant?.size || null,
      color:        variant?.color || null,
      price:        calcFinalPrice(product.base_price, product.discount_pct),
      mrp:          product.base_price,
      discount_pct: product.discount_pct,
      quantity:     1,
    });
    navigate('/bag-added', { state: { product: { slug: product.slug } } });
  };

  if (!loading && !products.length) return null;

  return (
    <div className="mt-14 border-t border-gray-100 pt-10">
      {drawerProduct && (
        <SizeSelectDrawer
          product={drawerProduct}
          onClose={() => setDrawerProduct(null)}
          onAddToBag={handleDrawerAdd}
        />
      )}
      <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
        You May Also Like
      </h2>
      <ProductCarousel products={products} loading={loading} onAddToBag={setDrawerProduct} openInNewTab withDrawer />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Skeleton className="h-3 w-64 mb-6" />
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 flex gap-3">
          <div className="flex flex-col gap-2 shrink-0">{[1,2,3,4].map(i => <Skeleton key={i} className="w-[72px] h-[88px]" />)}</div>
          <Skeleton className="flex-1 aspect-[3/4]" />
        </div>
        <div className="w-full lg:w-[45%] space-y-4">
          <Skeleton className="h-4 w-28" /><Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-8 w-40" /><Skeleton className="h-14 w-full" /><Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function AddedToBagPage() {
  const navigate      = useNavigate();
  const { state }     = useLocation();
  const cartSlug      = state?.product?.slug;
  const cartVariantId = state?.product?.variantId;
  const cartSize      = state?.product?.size;
  const cartColor     = state?.product?.color;

  const [qty, setQty]     = useState(1);
  const [selected, setSelected] = useState(() => {
    const init = {};
    if (cartSize)  init.size  = cartSize;
    if (cartColor) init.color = cartColor;
    return init;
  });

  // Disable browser back button: capture phase runs before React Router's listener,
  // stopImmediatePropagation prevents React Router from also handling the pop.
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const block = (e) => {
      e.stopImmediatePropagation();
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', block, true);
    return () => window.removeEventListener('popstate', block, true);
  }, []);

  const updateQty = useCartStore((s) => s.updateQty);
  const { has, toggle } = useWishlistStore();
  const { addToast } = useToastStore();
  const { openLoginModal } = useUiStore();
  const { isLoggedIn } = useAuth();

  const { data, loading } = useFetch(
    () => cartSlug ? productsApi.detail(cartSlug) : Promise.resolve(null),
    [cartSlug],
  );
  const product = data?.data;

  useEffect(() => {
    if (!cartSlug) navigate('/', { replace: true });
  }, [cartSlug]);

  if (loading) return <LoadingSkeleton />;
  if (!product) return null;

  const finalPrice   = calcFinalPrice(product.base_price, product.discount_pct);
  const hasDiscount  = product.discount_pct > 0;
  const primaryImage = product.images?.find(i => i.is_primary)?.url || product.images?.[0]?.url || '';
  const wished       = has(product.id);

  const handleQty = (delta) => {
    const next = Math.max(1, qty + delta);
    setQty(next);
    updateQty(cartVariantId ?? product.id, next);
  };

  const handleWishlist = async () => {
    if (!isLoggedIn) { openLoginModal(); return; }
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
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1 text-xs text-gray-400 mb-6">
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-200">/</span>}
              {crumb.to
                ? <Link to={crumb.to} className="hover:text-[#8B1A2F] transition-colors">{crumb.label}</Link>
                : <span className="text-gray-600 line-clamp-1 max-w-[200px]">{crumb.label}</span>}
            </span>
          ))}
        </nav>

        {/* Two-column layout — identical to ProductDetail */}
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── Left: Image gallery ── */}
          <div className="w-full lg:w-[52%]">
            <ImageGallery images={product.images} />
          </div>

          {/* ── Right: Product info ── */}
          <div className="w-full lg:w-[48%] space-y-4">

            {/* Brand + title + share + wishlist */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {product.brand_name && (
                    <Link to={`/brand/${product.brand_slug}`}
                      className="text-[11px] font-bold text-gray-500 uppercase tracking-widest hover:text-[#8B1A2F] transition-colors">
                      {product.brand_name}
                    </Link>
                  )}
                  <h1 className="text-[18px] lg:text-[20px] font-semibold text-gray-900 mt-0.5 leading-snug" style={{ fontFamily: 'var(--font-heading)' }}>
                    {product.title}
                  </h1>
                </div>
                <div className="flex items-center gap-2 mt-0.5 shrink-0">
                  <button onClick={() => navigator.share?.({ title: product.title, url: window.location.href })}
                    className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#8B1A2F] hover:border-[#8B1A2F] transition-colors" aria-label="Share">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                  </button>
                  <button onClick={handleWishlist}
                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${wished ? 'border-[#8B1A2F] text-[#8B1A2F] bg-red-50' : 'border-gray-200 text-gray-400 hover:text-[#8B1A2F] hover:border-[#8B1A2F]'}`}
                    aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}>
                    <IconHeart filled={wished} />
                  </button>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="pb-1">
              <div className="flex items-baseline flex-wrap gap-2">
                <span className="text-[22px] font-bold text-gray-900">{formatPrice(finalPrice)}</span>
                {hasDiscount && (
                  <>
                    <span className="text-[13px] text-gray-400">MRP <span className="line-through">{formatPrice(product.base_price)}</span></span>
                    <span className="text-[13px] font-bold text-[#2E7D32]">({product.discount_pct}% OFF)</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">Inclusive of all taxes</p>
            </div>

            {/* Offers */}
            <OffersSection categoryId={product.category_id} />

            {/* Variants */}
            {product.variants?.length > 0 && (
              <VariantPicker variants={product.variants} selected={selected} onSelect={setSelected} />
            )}

            {/* ── CTA: [− qty +]  [Go To Bag] ── */}
            <div className="flex items-stretch gap-3 pt-1">
              {/* Qty stepper — same height/flex as Go To Bag */}
              <div className="flex items-stretch border-2 border-gray-300 flex-1 h-[52px]">
                <button onClick={() => handleQty(-1)}
                  className="w-14 flex items-center justify-center text-gray-800 text-2xl font-light hover:bg-gray-100 transition-colors select-none">
                  −
                </button>
                <div className="flex-1 flex items-center justify-center text-[15px] font-semibold text-gray-900 border-x border-gray-300">
                  {qty}
                </div>
                <button onClick={() => handleQty(+1)}
                  className="w-14 flex items-center justify-center text-gray-800 text-2xl font-light hover:bg-gray-100 transition-colors select-none">
                  +
                </button>
              </div>

              {/* Go To Bag — same size, same maroon colour as Add To Bag */}
              <button onClick={() => navigate('/cart')}
                className="flex-1 h-[52px] bg-[#8B1A2F] text-white font-bold text-[14px] tracking-wide hover:bg-[#6d1424] transition-colors">
                Go To Bag
              </button>
            </div>

            {/* Delivery */}
            <PincodeCheck />

            {/* 14-day returns */}
            {product.is_returnable !== false && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 .49-3.87"/></svg>
                <span><span className="font-semibold text-gray-700">14 Days</span> Easy Returns And Exchange</span>
              </div>
            )}

            {/* Trust badges */}
            <div className="grid border border-gray-200 rounded-xl overflow-hidden"
              style={{ gridTemplateColumns: product.is_returnable !== false ? 'repeat(3,1fr)' : 'repeat(2,1fr)' }}>
              <div className="flex flex-col items-center gap-1.5 py-4 px-2 border-r border-gray-200">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
                </svg>
                <span className="text-[11px] text-gray-600 font-medium text-center leading-tight">100% Authentic</span>
              </div>
              <div className={`flex flex-col items-center gap-1.5 py-4 px-2 ${product.is_returnable !== false ? 'border-r border-gray-200' : ''}`}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
                  <rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                </svg>
                <span className="text-[11px] text-gray-600 font-medium text-center leading-tight">Fast Delivery</span>
              </div>
              {product.is_returnable !== false && (
                <div className="flex flex-col items-center gap-1.5 py-4 px-2">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.87"/>
                  </svg>
                  <span className="text-[11px] text-gray-600 font-medium text-center leading-tight">Easy Return</span>
                </div>
              )}
            </div>

            {/* Product details accordion */}
            <ProductDetailsAccordion description={product.description} />

          </div>
        </div>

        {/* Similar Products */}
        <SimilarProductsSection
          categorySlug={product.category_slug}
          parentCategorySlug={product.parent_category_slug}
          categoryName={product.category_name}
          gender={product.gender}
          currentId={product.id}
        />

        {/* You May Also Like */}
        <YouMayAlsoLikeSection
          parentCategorySlug={product.parent_category_slug}
          categorySlug={product.category_slug}
          gender={product.gender}
          currentId={product.id}
        />

      </div>
    </div>
  );
}
