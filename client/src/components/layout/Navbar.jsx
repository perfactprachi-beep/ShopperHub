import { useState, useEffect, useRef, useCallback } from 'react';
import { assetUrl } from '../../utils/assetUrl.js';
import { getProductPlaceholder } from '../../utils/getProductPlaceholder.js';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LoginModal from '../ui/LoginModal.jsx';
import { useScrollDirection } from '../../hooks/useScrollDirection.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useCartStore } from '../../store/cartStore.js';
import { useWishlistStore } from '../../store/wishlistStore.js';
import { useUiStore } from '../../store/uiStore.js';
import api from '../../api/axios.js';
import { getNotifications, markAllRead } from '../../api/notificationsApi.js';
import { checkPincode } from '../../api/storesApi.js';

const MEGA_SLUGS = new Set(['men', 'women', 'kids', 'beauty', 'home', 'luxe']);

const TRENDING_SEARCHES = ['Kids', 'Shirts', 'T-Shirts', 'Formals', 'Watches', 'Sunglasses', 'Dresses', 'Jeans'];

const BEST_SELLING_CATEGORIES = [
  { label: 'Men',    href: '/category/men' },
  { label: 'Women',  href: '/category/women' },
  { label: 'Kids',   href: '/category/kids' },
  { label: 'Beauty', href: '/category/beauty' },
  { label: 'Home',   href: '/category/home' },
  { label: 'Gifts',  href: '/search?q=gifts' },
];

const NAV_LINKS = [
  { label: 'Bargains',   href: '/offers',              accent: '#E8223A' },
  { label: 'Men',        slug: 'men' },
  { label: 'Women',      slug: 'women' },
  { label: 'Kids',       slug: 'kids' },
  { label: 'Beauty',     slug: 'beauty' },
  { label: 'Watches',    href: '/category/watches' },
  { label: 'Home',       slug: 'home' },
  { label: 'Gifts',      href: '/search?q=gifts' },
  { label: 'Luxe',       slug: 'luxe', href: '/luxe',    accent: '#C9A84C' },
  { label: 'Brands',     href: '/brands' },
];

/* ── Icons ──────────────────────────────────────────────────────────── */
function IconSearch({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
function IconHeart({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}
function IconCart({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}
function IconUser({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function IconMenu({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
function IconX({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}
function IconChevronDown({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}
function IconBell({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}
function IconChevronRight({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}
function IconPin({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

/* ── Main Component ─────────────────────────────────────────────────── */
export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isLoggedIn, isAdmin, user, logout } = useAuth();
  const scrollDir = useScrollDirection();
  const cartItems    = useCartStore((s) => s.items);
  const cartCount    = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const wishCount    = useWishlistStore((s) => s.productIds.length);
  const { openCart, openLoginModal } = useUiStore();

  const [search, setSearch]           = useState('');
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [loginModal, setLoginModal]   = useState(false);
  const [megaSlug, setMegaSlug]       = useState(null);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [categories, setCategories]   = useState([]);
  const [notifOpen, setNotifOpen]     = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]           = useState(0);

  const [searchOpen, setSearchOpen]           = useState(false);
  const [suggestionProducts, setSuggestionProducts] = useState([]);
  const [popularBrands, setPopularBrands]     = useState([]);
  const [recentSearches, setRecentSearches]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('ss_recent_searches') || '[]'); } catch { return []; }
  });

  const accountRef      = useRef(null);
  const notifRef        = useRef(null);
  const megaTimer       = useRef(null);
  const searchRef       = useRef(null);
  const debounceRef     = useRef(null);

  const [savedLocation, setSavedLocation] = useState(() => {
    try { return JSON.parse(localStorage.getItem('shoppers_location')); } catch { return null; }
  });
  const [locationOpen, setLocationOpen] = useState(false);
  const [pinInput,     setPinInput]     = useState('');
  const [pinLoading,   setPinLoading]   = useState(false);
  const [pinResult,    setPinResult]    = useState(null);

  useEffect(() => {
    api.get('/categories').then(({ data }) => {
      if (data.success) setCategories(data.data);
    }).catch(() => {});
  }, []);

  const fetchNotifs = useCallback(() => {
    if (!isLoggedIn) return;
    getNotifications().then(({ data }) => {
      if (data.success) {
        setNotifications(data.data.notifications);
        setUnread(data.data.unread);
      }
    }).catch(() => {});
  }, [isLoggedIn]);

  useEffect(() => {
    fetchNotifs();
    const id = setInterval(fetchNotifs, 60000);
    return () => clearInterval(id);
  }, [fetchNotifs]);

  useEffect(() => {
    const h = (e) => { if (!notifRef.current?.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const fetchSuggestions = useCallback((q) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get('/search/suggestions', { params: { q: q || '' } });
        if (data.success) setSuggestionProducts(data.data.products);
      } catch {}
    }, q ? 300 : 0);
  }, []);

  useEffect(() => {
    if (searchOpen && popularBrands.length === 0) {
      api.get('/brands').then(({ data }) => {
        if (data.success) setPopularBrands(data.data.slice(0, 5));
      }).catch(() => {});
    }
  }, [searchOpen, popularBrands.length]);

  useEffect(() => {
    const h = (e) => { if (!searchRef.current?.contains(e.target)) setSearchOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    const h = (e) => { if (!accountRef.current?.contains(e.target)) setAccountOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handlePinCheck = async () => {
    if (!/^\d{6}$/.test(pinInput)) return;
    setPinLoading(true);
    try {
      const res = await checkPincode(pinInput);
      setPinResult({ ...res.data.data, pincode: pinInput });
    } catch {
      setPinResult({ available: false, reason: 'Unable to check pincode', pincode: pinInput });
    } finally {
      setPinLoading(false);
    }
  };

  const handleSaveLocation = () => {
    if (!pinResult?.city) return;
    const loc = { pincode: pinInput, city: pinResult.city };
    localStorage.setItem('shoppers_location', JSON.stringify(loc));
    setSavedLocation(loc);
    setLocationOpen(false);
    setPinInput('');
    setPinResult(null);
  };

  const handleClearLocation = () => {
    localStorage.removeItem('shoppers_location');
    setSavedLocation(null);
    setLocationOpen(false);
  };

  useEffect(() => {
    document.body.style.overflow = (mobileOpen || locationOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen, locationOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('ss_recent_searches', JSON.stringify(updated));
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setSearch('');
    setSearchOpen(false);
    setMobileSearch(false);
    setMobileOpen(false);
  };

  const handleTrendingClick = (term) => {
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setSearchOpen(false);
    setSearch('');
  };

  const handleRecentClick = (term) => {
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setSearchOpen(false);
    setSearch('');
  };

  const removeRecent = (term, e) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    localStorage.setItem('ss_recent_searches', JSON.stringify(updated));
  };

  const getChildren = useCallback(
    (slug) => categories.find((c) => c.slug === slug)?.children ?? [],
    [categories]
  );

  const isLuxe = location.pathname === '/luxe';

  const showMega = (slug) => {
    clearTimeout(megaTimer.current);
    if (isLuxe && slug === 'luxe') return;
    if (MEGA_SLUGS.has(slug)) setMegaSlug(slug);
    else setMegaSlug(null);
  };
  const hideMega = () => { megaTimer.current = setTimeout(() => setMegaSlug(null), 150); };
  const keepMega = () => clearTimeout(megaTimer.current);

  const isActive = (link) => {
    if (link.href) {
      const [path, qs] = link.href.split('?');
      if (qs) return location.pathname === path && location.search === `?${qs}`;
      return location.pathname === path;
    }
    return location.pathname.startsWith(`/category/${link.slug}`);
  };

  /* ── Minimal checkout header (cart page only) ── */
  if (location.pathname === '/cart') {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/">
            <span
              className="text-[30px] font-bold text-[#8B1A2F]"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontVariant: 'small-caps', letterSpacing: '0.05em' }}
            >
              Shoppers<span className="text-[#1A1A1A]">Hub</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span className="font-semibold uppercase tracking-wide text-[12px]">100% Secure Checkout</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* ── Desktop ─────────────────────────────────────────────── */}
      <header className={`hidden lg:block sticky top-0 z-40 ${isLuxe ? 'bg-[#0D0D0D]' : 'bg-white'}`}>

        {/* Announcement bar */}
        <div className="bg-[#111820] px-6 text-xs text-white xl:px-10">
          <div className="mx-auto flex h-11 max-w-[1920px] items-center justify-between">
            <p className="tracking-wide">
              Use Code: <span className="font-bold text-[#E8B04B]">NEW10</span> — For An Extra 10% Off For First-Time Users
            </p>
            <div className="flex items-center gap-4 shrink-0 text-gray-300">
              <Link to="/stores" className="hover:text-white cursor-pointer transition-colors">Store Locator</Link>
              <span className="text-gray-600">|</span>
              <span className="hover:text-white cursor-pointer transition-colors">Help</span>
            </div>
          </div>
        </div>

        {/* Row 1 — Logo | Search | Actions */}
        <div className={`border-b ${isLuxe ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="mx-auto flex h-[76px] max-w-[1920px] items-center gap-4 px-6 xl:gap-5 xl:px-10">
            {/* Logo */}
            <Link to="/" className="shrink-0 leading-none">
              <span
                className="text-[34px] font-bold"
                style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontVariant: 'small-caps',
                  letterSpacing: '0.05em',
                  color: isLuxe ? '#C9A84C' : '#8B1A2F',
                }}
              >
                Shoppers<span style={{ color: isLuxe ? '#fff' : '#1A1A1A' }}>Hub</span>
              </span>
            </Link>

            {/* Location trigger */}
            <div className="flex min-w-0 shrink-0 items-center">
              <div className={`mr-4 h-7 w-px ${isLuxe ? 'bg-white/15' : 'bg-gray-200'}`} />
              <button
                onClick={() => { setLocationOpen(true); setPinInput(''); setPinResult(null); }}
                className={`flex h-10 items-center gap-1.5 transition-colors ${isLuxe ? 'text-white/60 hover:text-[#C9A84C]' : 'text-gray-600 hover:text-[#8B1A2F]'}`}
              >
                <IconPin size={15} />
                <span className="max-w-[150px] truncate text-[14px] font-medium xl:max-w-[210px]">
                  {savedLocation ? `${savedLocation.pincode} — ${savedLocation.city}` : 'Select Location'}
                </span>
                <IconChevronDown size={12} />
              </button>
            </div>

            {/* Search */}
            <div ref={searchRef} className="ml-auto relative w-[clamp(300px,34vw,600px)] shrink-0">
              <form onSubmit={handleSearch}>
                <div className={`relative flex h-[50px] items-center border transition-colors ${
                  isLuxe
                    ? 'border-white/15 bg-white/5 hover:border-white/30 focus-within:border-[#C9A84C] focus-within:ring-2 focus-within:ring-[#C9A84C]/10'
                    : searchOpen
                      ? 'border-[#8B1A2F] bg-white ring-2 ring-[#8B1A2F]/10'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300 focus-within:border-[#8B1A2F] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#8B1A2F]/10'
                }`}>
                  <span className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${isLuxe ? 'text-white/30' : 'text-gray-400'}`}>
                    <IconSearch size={18} />
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); fetchSuggestions(e.target.value); }}
                    onFocus={() => { setSearchOpen(true); fetchSuggestions(search); }}
                    onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
                    placeholder="Search products, brands and more..."
                    className={`h-full w-full bg-transparent pl-12 pr-4 text-[15px] outline-none ${isLuxe ? 'text-white placeholder:text-white/30' : 'text-gray-800 placeholder:text-gray-500'}`}
                  />
                  <button type="submit" className="sr-only" aria-label="Search">Search</button>
                </div>
              </form>

              {/* ── Search Dropdown ── */}
              {searchOpen && !isLuxe && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[1020px] bg-white shadow-2xl border border-gray-200 overflow-hidden"
                  style={{ borderRadius: '0 0 12px 12px' }}
                >
                  <div className="flex min-h-[340px]">

                    {/* ── Left: Recent + Trending ── */}
                    <div className="w-[270px] shrink-0 border-r border-gray-100 py-6 px-5">

                      {/* Recent Searches */}
                      {recentSearches.length > 0 && (
                        <div className="mb-6">
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Recent Search</p>
                          <div className="flex flex-wrap gap-2">
                            {recentSearches.map((s) => (
                              <button
                                key={s}
                                onClick={() => handleRecentClick(s)}
                                className="group flex items-center gap-1 pl-3 pr-2 py-1.5 border border-gray-300 rounded-full text-[13px] text-gray-700 hover:border-gray-800 hover:text-gray-900 transition-colors bg-white"
                              >
                                {s}
                                <span
                                  onClick={(e) => removeRecent(s, e)}
                                  className="text-gray-300 hover:text-red-400 ml-1 text-xs leading-none transition-colors"
                                >✕</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Trending Searches */}
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Trending Searches</p>
                      <ul className="space-y-0">
                        {TRENDING_SEARCHES.map((s) => (
                          <li key={s}>
                            <button
                              onClick={() => handleTrendingClick(s)}
                              className="w-full text-left py-2 text-[14px] text-gray-800 hover:text-[#8B1A2F] transition-colors"
                            >
                              {s}
                            </button>
                          </li>
                        ))}
                      </ul>

                      {/* Best Selling Categories */}
                      <div className="mt-6">
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Best Selling Categories</p>
                        <div className="flex flex-wrap gap-2">
                          {BEST_SELLING_CATEGORIES.map((cat) => (
                            <Link
                              key={cat.label}
                              to={cat.href}
                              onClick={() => setSearchOpen(false)}
                              className="px-3 py-1.5 border border-gray-300 rounded-full text-[13px] text-gray-700 hover:border-[#8B1A2F] hover:text-[#8B1A2F] transition-colors bg-white"
                            >
                              {cat.label}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Popular Brands */}
                      {popularBrands.length > 0 && (
                        <div className="mt-5">
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Popular Brands</p>
                          <div className="flex flex-wrap gap-2">
                            {popularBrands.map((b) => (
                              <Link
                                key={b.id}
                                to={`/brands/${b.slug}`}
                                onClick={() => setSearchOpen(false)}
                                className="px-3 py-1.5 border border-gray-200 rounded-full text-[13px] font-semibold text-gray-800 hover:border-[#8B1A2F] hover:text-[#8B1A2F] transition-colors bg-white"
                              >
                                {b.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── Right: Trending Products ── */}
                    <div className="flex-1 py-6 px-6">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Trending Products</p>

                      {suggestionProducts.length === 0 ? (
                        <div className="h-48 flex flex-col items-center justify-center gap-2 text-gray-300">
                          <IconSearch size={32} />
                          <p className="text-sm text-gray-400">Start typing to find products</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-5 gap-3">
                          {suggestionProducts.map((p) => {
                            const sp = Math.round(p.base_price * (1 - p.discount_pct / 100));
                            return (
                              <Link
                                key={p.id}
                                to={`/product/${p.slug}`}
                                onClick={() => setSearchOpen(false)}
                                className="group block"
                              >
                                {/* Portrait image */}
                                <div className="aspect-[3/4] rounded-md overflow-hidden bg-gray-100 mb-2">
                                  <img
                                    src={p.image_url ? assetUrl(p.image_url) : getProductPlaceholder(p)}
                                    alt={p.title}
                                    onError={(e) => { e.currentTarget.src = getProductPlaceholder(p); }}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>

                                {/* Brand + Title */}
                                <p className="text-[11px] text-gray-800 leading-snug line-clamp-2">
                                  <span className="font-bold">{p.brand_name} </span>
                                  {p.title}
                                </p>

                                {/* Pricing */}
                                <div className="flex items-center gap-1 mt-1 flex-wrap">
                                  <span className="text-[12px] font-bold text-gray-900">₹{sp.toLocaleString('en-IN')}</span>
                                  {p.discount_pct > 0 && (
                                    <span className="text-[11px] font-semibold text-[#E8223A]">{p.discount_pct}% Off</span>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {/* View all results */}
                      {search.trim().length > 0 && (
                        <Link
                          to={`/search?q=${encodeURIComponent(search.trim())}`}
                          onClick={() => {
                            const q = search.trim();
                            const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
                            setRecentSearches(updated);
                            localStorage.setItem('ss_recent_searches', JSON.stringify(updated));
                            setSearch('');
                            setSearchOpen(false);
                          }}
                          className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 border-t border-gray-100 text-[13px] text-gray-500 hover:text-[#8B1A2F] transition-colors"
                        >
                          <IconSearch size={14} />
                          View all results for "<span className="font-semibold text-gray-800">{search.trim()}</span>"
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-3 xl:gap-4">
              {/* Account */}
              <div ref={accountRef} className="relative">
                <button
                  onClick={() => isLoggedIn ? setAccountOpen((v) => !v) : setLoginModal(true)}
                  className={`flex h-10 items-center justify-center gap-1 transition-colors ${isLuxe ? 'text-white/70 hover:text-[#C9A84C]' : 'text-gray-600 hover:text-[#8B1A2F]'}`}
                >
                  <IconUser size={26} />
                  <IconChevronDown size={12} />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                    {isLoggedIn ? (
                      <>
                        <div className="px-4 py-2.5 border-b border-gray-100">
                          <p className="text-xs font-semibold text-gray-800 truncate">{user.full_name}</p>
                          <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                        </div>
                        {!isAdmin && (
                          <>
                            <Link to="/orders"   onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700">My Orders</Link>
                            <Link to="/wishlist" onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700">Wishlist</Link>
                          </>
                        )}
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700">Admin Dashboard</Link>
                        )}
                        <Link to="/account"  onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700">My Account</Link>
                        <div className="border-t border-gray-100"/>
                        <button onClick={() => { logout(); setAccountOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">Logout</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setAccountOpen(false); setLoginModal(true); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700">Login</button>
                        <Link to="/register" onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700">Register</Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist — hidden for admin */}
              {!isAdmin && (
                isLoggedIn ? (
                  <Link to="/wishlist" className={`relative flex h-10 w-10 items-center justify-center transition-colors ${isLuxe ? 'text-white/70 hover:text-[#C9A84C]' : 'text-gray-600 hover:text-[#8B1A2F]'}`}>
                    <IconHeart size={26}/>
                    {wishCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#8B1A2F] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center leading-none">
                        {wishCount > 99 ? '99+' : wishCount}
                      </span>
                    )}
                  </Link>
                ) : (
                  <button onClick={openLoginModal} className={`flex h-10 w-10 items-center justify-center transition-colors ${isLuxe ? 'text-white/70 hover:text-[#C9A84C]' : 'text-gray-600 hover:text-[#8B1A2F]'}`}>
                    <IconHeart size={26}/>
                  </button>
                )
              )}

              {/* Cart — hidden for admin */}
              {!isAdmin && (
                <Link to="/cart" className={`relative flex h-10 w-10 items-center justify-center transition-colors ${isLuxe ? 'text-white/70 hover:text-[#C9A84C]' : 'text-gray-600 hover:text-[#8B1A2F]'}`}>
                  <IconCart size={26}/>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#8B1A2F] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center leading-none">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Notifications */}
              {isLoggedIn && (
                <div ref={notifRef} className="relative">
                  <button onClick={() => setNotifOpen((v) => !v)} className={`relative flex h-10 w-10 items-center justify-center transition-colors ${isLuxe ? 'text-white/70 hover:text-[#C9A84C]' : 'text-gray-600 hover:text-[#8B1A2F]'}`}>
                    <IconBell size={26}/>
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center leading-none">
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                        <span className="text-sm font-semibold text-gray-800">Notifications</span>
                        {unread > 0 && (
                          <button onClick={() => { markAllRead().then(fetchNotifs).catch(() => {}); }} className="text-xs text-[#8B1A2F] hover:underline">Mark all read</button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="px-4 py-6 text-sm text-gray-400 text-center">No notifications</p>
                        ) : notifications.slice(0, 10).map((n) => (
                          <div key={n.id} className={`px-4 py-3 border-b border-gray-50 last:border-b-0 text-sm ${!n.is_read ? 'bg-blue-50' : ''}`}>
                            <p className={!n.is_read ? 'text-gray-800 font-medium' : 'text-gray-500'}>{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {new Date(n.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2 — Category nav */}
        <div className={`border-b transition-all duration-300 ${isLuxe ? 'border-white/10 bg-[#0D0D0D]' : 'border-gray-200 bg-white'}`}>
          <nav className="mx-auto flex h-[62px] max-w-[1920px] items-center justify-center px-6 xl:px-10">
            {NAV_LINKS.map((link) => {
              const href    = link.href ?? `/category/${link.slug}`;
              const active  = isActive(link);
              const color   = active ? (link.accent ?? (isLuxe ? '#C9A84C' : '#8B1A2F')) : (link.accent ?? null);
              return (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => showMega(link.slug)}
                  onMouseLeave={hideMega}
                >
                  <Link
                    to={href}
                    style={color ? { color, borderColor: active ? color : 'transparent' } : undefined}
                    className={`inline-flex h-[62px] items-center px-4 text-[14px] font-semibold uppercase tracking-wider transition-colors whitespace-nowrap border-b-2 xl:px-5 ${
                      color
                        ? 'hover:opacity-80'
                        : active
                          ? isLuxe ? 'text-[#C9A84C] border-[#C9A84C]' : 'text-[#8B1A2F] border-[#8B1A2F]'
                          : isLuxe
                            ? 'text-white/60 border-transparent hover:text-white hover:border-white/40'
                            : 'text-gray-700 border-transparent hover:text-[#8B1A2F] hover:border-[#8B1A2F]'
                    }`}
                  >
                    {link.label}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Mega Menu */}
        {megaSlug && (
          megaSlug === 'luxe' ? (
            /* ── Luxe Mega Menu (dark/gold) ── */
            <div
              className="absolute left-0 right-0 z-30 shadow-2xl"
              style={{ background: '#111' }}
              onMouseEnter={keepMega}
              onMouseLeave={hideMega}
            >
              <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Category columns only — no header, no footer CTA */}
                <div className="grid grid-cols-4 lg:grid-cols-7 gap-6">
                  {getChildren('luxe').map((sub) => (
                    <div key={sub.id}>
                      <Link
                        to={`/category/${sub.slug}`}
                        onClick={() => setMegaSlug(null)}
                        className="flex items-center gap-1 text-[12px] font-bold uppercase tracking-wider mb-3 transition-opacity hover:opacity-70"
                        style={{ color: '#C9A84C' }}
                      >
                        {sub.name} <IconChevronRight size={11} />
                      </Link>
                      <div className="flex flex-col gap-1.5">
                        {(sub.children ?? []).map((child) => (
                          <Link
                            key={child.id}
                            to={`/category/${child.slug}`}
                            onClick={() => setMegaSlug(null)}
                            className="text-[13px] text-white/60 hover:text-white transition-colors py-0.5"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ── Standard Mega Menu (white) ── */
            <div
              className="absolute left-0 right-0 bg-white border-b border-gray-200 shadow-xl z-30"
              onMouseEnter={keepMega}
              onMouseLeave={hideMega}
            >
              <div className="max-w-7xl mx-auto px-6 py-7">
                {getChildren(megaSlug).length > 0 ? (
                  <div className="columns-4 gap-8">
                    {getChildren(megaSlug).map((sub) => (
                      <div key={sub.id} className="break-inside-avoid mb-7">
                        <Link
                          to={`/category/${sub.slug}`}
                          onClick={() => setMegaSlug(null)}
                          className="flex items-center gap-1 text-[13px] font-bold text-gray-900 hover:text-[#8B1A2F] mb-1.5 uppercase tracking-wide group"
                        >
                          {sub.name}
                          <span className="text-gray-400 group-hover:text-[#8B1A2F] transition-colors">
                            <IconChevronRight size={12}/>
                          </span>
                        </Link>
                        {sub.children && sub.children.length > 0 && (
                          <div className="flex flex-col">
                            {sub.children.map((child) => (
                              <Link
                                key={child.id}
                                to={`/category/${child.slug}`}
                                onClick={() => setMegaSlug(null)}
                                className="text-[13px] text-gray-500 hover:text-[#8B1A2F] transition-colors py-[3px] leading-snug"
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <Link
                      to={`/category/${megaSlug}`}
                      onClick={() => setMegaSlug(null)}
                      className="flex items-center gap-1 text-sm font-bold text-gray-900 hover:text-[#8B1A2F] mb-3 uppercase tracking-wide"
                    >
                      {NAV_LINKS.find(l => l.slug === megaSlug)?.label}
                      <IconChevronRight size={14}/>
                    </Link>
                    <p className="text-sm text-gray-400">No subcategories yet.</p>
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </header>

      {/* ── Mobile header ───────────────────────────────────────── */}
      <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        {/* Announcement bar */}
        <div className="bg-[#1A1A1A] text-white text-[10px] py-1.5 text-center tracking-wide">
          Use Code: <span className="font-bold text-[#E8B04B]">NEW10</span> — Extra 10% Off For First-Time Users
        </div>

        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => setMobileOpen(true)} className="text-gray-700 p-1" aria-label="Open menu">
            <IconMenu/>
          </button>
          <Link to="/" className="flex-1 text-center">
            <span className="text-[26px] font-bold text-[#8B1A2F]" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontVariant: 'small-caps', letterSpacing: '0.05em' }}>
              Shoppers<span className="text-[#1A1A1A]">Hub</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSearch((v) => !v)} className="text-gray-700 p-1" aria-label="Search">
              <IconSearch/>
            </button>
            {!isAdmin && (
              <Link to="/cart" className="relative text-gray-700 p-1" aria-label="Cart">
                <IconCart/>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#8B1A2F] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center leading-none">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>

        {mobileSearch && (
          <form onSubmit={handleSearch} className="px-4 pb-3">
            <div className="relative flex items-center border border-gray-300 rounded-full overflow-hidden focus-within:border-[#8B1A2F]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                autoFocus
                className="flex-1 pl-4 pr-3 py-2 text-sm outline-none bg-transparent"
              />
              <button type="submit" className="px-4 py-2 bg-[#8B1A2F] text-white">
                <IconSearch size={15}/>
              </button>
            </div>
          </form>
        )}
      </header>

      {/* ── Login Modal ─────────────────────────────────────────── */}
      {loginModal && (
        <LoginModal onClose={() => setLoginModal(false)} />
      )}

      {/* ── Mobile Drawer ───────────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)}/>
          <div className="w-72 max-w-[85vw] bg-white h-full overflow-y-auto shadow-xl flex flex-col order-first">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-[#1A1A1A]">
              <span className="text-[22px] font-bold text-[#8B1A2F]" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontVariant: 'small-caps', letterSpacing: '0.05em' }}>
                Shoppers<span className="text-white">Hub</span>
              </span>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400" aria-label="Close">
                <IconX/>
              </button>
            </div>

            {/* Auth */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              {isLoggedIn ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Hi, {user.full_name?.split(' ')[0] || 'User'}</p>
                    <p className="text-[11px] text-gray-400">{user.email}</p>
                  </div>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="text-xs text-red-600 font-medium">Logout</button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => { setMobileOpen(false); setLoginModal(true); }} className="flex-1 text-center py-2 text-sm border border-[#8B1A2F] text-[#8B1A2F] rounded font-medium">Login</button>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-sm bg-[#8B1A2F] text-white rounded font-medium">Register</Link>
                </div>
              )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-0 py-0">
              {NAV_LINKS.map((link) => {
                const href      = link.href ?? `/category/${link.slug}`;
                const hasMega   = MEGA_SLUGS.has(link.slug);
                const children  = hasMega ? getChildren(link.slug) : [];
                const isOpen    = openAccordion === link.slug;
                const labelStyle = link.accent ? { color: link.accent } : undefined;
                return (
                  <div key={link.label} className="border-b border-gray-100 last:border-b-0">
                    {hasMega && children.length > 0 ? (
                      <>
                        <button
                          onClick={() => setOpenAccordion(isOpen ? null : link.slug)}
                          className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-gray-800 uppercase tracking-wider"
                          style={labelStyle}
                        >
                          {link.label}
                          <span className={`transition-transform text-gray-400 ${isOpen ? 'rotate-180' : ''}`}>
                            <IconChevronDown/>
                          </span>
                        </button>
                        {isOpen && (
                          <div className="bg-gray-50 pb-2">
                            <Link to={href} onClick={() => setMobileOpen(false)} className="block px-8 py-2 text-sm text-[#8B1A2F] font-semibold">
                              View All {link.label}
                            </Link>
                            {children.map((sub) => (
                              <Link key={sub.id} to={`/category/${sub.slug}`} onClick={() => setMobileOpen(false)} className="block px-8 py-2 text-sm text-gray-500 hover:text-[#8B1A2F]">
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link to={href} onClick={() => setMobileOpen(false)} className="block px-5 py-3.5 text-sm font-semibold text-gray-800 uppercase tracking-wider hover:text-[#8B1A2F]" style={labelStyle}>
                        {link.label}
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Footer links */}
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
              <Link to="/orders"  onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-600 hover:text-[#8B1A2F]">My Orders</Link>
              <Link to="/account" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-600 hover:text-[#8B1A2F]">My Account</Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Location Drawer ─────────────────────────────────────── */}
      {/* Backdrop */}
      {locationOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setLocationOpen(false)} />
      )}

      {/* Drawer — slides in from the left */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${locationOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Select Delivery Location</h2>
            <p className="text-xs text-gray-400 mt-0.5">Enter pincode to check delivery</p>
          </div>
          <button
            onClick={() => setLocationOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* Current location chip */}
          {savedLocation && (
            <div className="flex items-center gap-3 p-3 bg-[#8B1A2F]/5 border border-[#8B1A2F]/20 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-[#8B1A2F]/10 flex items-center justify-center shrink-0">
                <IconPin size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Current location</p>
                <p className="text-sm font-semibold text-gray-900">{savedLocation.pincode} — {savedLocation.city}</p>
              </div>
              <button
                onClick={handleClearLocation}
                className="text-xs text-red-400 hover:text-red-600 font-medium shrink-0 transition-colors"
              >
                Remove
              </button>
            </div>
          )}

          {/* Pincode input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Enter Pincode</label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 380051"
                value={pinInput}
                onChange={e => { setPinInput(e.target.value.replace(/\D/g, '')); setPinResult(null); }}
                onKeyDown={e => e.key === 'Enter' && handlePinCheck()}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#8B1A2F] focus:ring-2 focus:ring-[#8B1A2F]/10"
              />
              <button
                onClick={handlePinCheck}
                disabled={pinLoading || pinInput.length !== 6}
                className="px-4 py-2.5 bg-[#8B1A2F] text-white text-sm font-bold rounded-lg disabled:opacity-40 hover:bg-[#6d1424] transition-colors"
              >
                {pinLoading ? '…' : 'Check'}
              </button>
            </div>
          </div>

          {/* Result */}
          {pinResult && (
            <div className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm ${
              pinResult.available
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <span className="text-lg leading-none mt-0.5">{pinResult.available ? '✓' : '✗'}</span>
              <div>
                {pinResult.available
                  ? <><p className="font-semibold">{pinResult.city}</p><p className="text-xs mt-0.5 opacity-80">Express delivery in {pinResult.delivery_hrs} hrs</p></>
                  : <p>{pinResult.reason}</p>
                }
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {pinResult?.city && (
          <div className="border-t border-gray-100 px-5 py-4">
            <button
              onClick={handleSaveLocation}
              className="w-full py-3.5 bg-[#8B1A2F] text-white text-sm font-bold rounded-xl hover:bg-[#6d1424] transition-colors tracking-wide"
            >
              Set as My Location
            </button>
          </div>
        )}
      </div>
    </>
  );
}
