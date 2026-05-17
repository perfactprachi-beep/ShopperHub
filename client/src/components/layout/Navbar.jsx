import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LoginModal from '../ui/LoginModal.jsx';
import { useScrollDirection } from '../../hooks/useScrollDirection.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useCartStore } from '../../store/cartStore.js';
import { useUiStore } from '../../store/uiStore.js';
import api from '../../api/axios.js';
import { getNotifications, markAllRead } from '../../api/notificationsApi.js';

const MEGA_SLUGS = new Set(['men', 'women', 'kids', 'beauty']);

const NAV_LINKS = [
  { label: 'Men',        slug: 'men' },
  { label: 'Women',      slug: 'women' },
  { label: 'Kids',       slug: 'kids' },
  { label: 'Beauty',     slug: 'beauty' },
  { label: 'Home',       slug: 'home' },
  { label: 'Brands',     href: '/brands' },
  { label: 'Offers',     href: '/offers' },
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

/* ── Main Component ─────────────────────────────────────────────────── */
export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isLoggedIn, user, logout } = useAuth();
  const scrollDir = useScrollDirection();
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
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

  const accountRef = useRef(null);
  const notifRef   = useRef(null);
  const megaTimer  = useRef(null);

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

  useEffect(() => {
    const h = (e) => { if (!accountRef.current?.contains(e.target)) setAccountOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    setSearch('');
    setMobileSearch(false);
    setMobileOpen(false);
  };

  const getChildren = useCallback(
    (slug) => categories.find((c) => c.slug === slug)?.children ?? [],
    [categories]
  );

  const showMega = (slug) => {
    clearTimeout(megaTimer.current);
    if (MEGA_SLUGS.has(slug)) setMegaSlug(slug);
    else setMegaSlug(null);
  };
  const hideMega = () => { megaTimer.current = setTimeout(() => setMegaSlug(null), 150); };
  const keepMega = () => clearTimeout(megaTimer.current);

  const isActive = (link) => {
    if (link.href) return location.pathname === link.href;
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
      <header className="hidden lg:block bg-white sticky top-0 z-40">

        {/* Announcement bar */}
        <div className="bg-[#1A1A1A] text-white text-xs py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="flex-1 text-center tracking-wide">
              Use Code: <span className="font-bold text-[#E8B04B]">NEW10</span> — For An Extra 10% Off For First-Time Users
            </p>
            <div className="flex items-center gap-4 shrink-0 text-gray-400">
              <span className="hover:text-white cursor-pointer transition-colors">Store Locator</span>
              <span className="text-gray-600">|</span>
              <span className="hover:text-white cursor-pointer transition-colors">Get The App</span>
              <span className="text-gray-600">|</span>
              <span className="hover:text-white cursor-pointer transition-colors">Help</span>
            </div>
          </div>
        </div>

        {/* Row 1 — Logo | Search | Actions */}
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-6 h-[80px]">
            {/* Logo */}
            <Link to="/" className="shrink-0">
              <span
                className="text-[36px] font-bold text-[#8B1A2F]"
                style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontVariant: 'small-caps', letterSpacing: '0.05em' }}
              >
                Shoppers<span className="text-[#1A1A1A]">Hub</span>
              </span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl ml-auto">
              <div className="relative flex items-center border border-gray-300 rounded-full overflow-hidden hover:border-[#8B1A2F] transition-colors focus-within:border-[#8B1A2F] focus-within:ring-2 focus-within:ring-[#8B1A2F]/10">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for products, brands and more…"
                  className="flex-1 pl-5 pr-4 py-2.5 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#8B1A2F] text-white hover:bg-[#6B1223] transition-colors"
                  aria-label="Search"
                >
                  <IconSearch size={18} />
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Account */}
              <div ref={accountRef} className="relative">
                <button
                  onClick={() => isLoggedIn ? setAccountOpen((v) => !v) : setLoginModal(true)}
                  className="flex items-center gap-1 text-gray-600 hover:text-[#8B1A2F] transition-colors"
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
                        <Link to="/orders"   onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700">My Orders</Link>
                        <Link to="/wishlist" onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700">Wishlist</Link>
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

              {/* Wishlist */}
              {isLoggedIn ? (
                <Link to="/wishlist" className="text-gray-600 hover:text-[#8B1A2F] transition-colors">
                  <IconHeart size={26}/>
                </Link>
              ) : (
                <button onClick={openLoginModal} className="text-gray-600 hover:text-[#8B1A2F] transition-colors">
                  <IconHeart size={26}/>
                </button>
              )}

              {/* Cart */}
              <Link to="/cart" className="relative text-gray-600 hover:text-[#8B1A2F] transition-colors">
                <IconCart size={26}/>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#8B1A2F] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Notifications */}
              {isLoggedIn && (
                <div ref={notifRef} className="relative">
                  <button onClick={() => setNotifOpen((v) => !v)} className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-[#8B1A2F] transition-colors">
                    <span className="relative">
                      <IconBell size={22}/>
                      {unread > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] font-medium">Alerts</span>
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
        <div className={`border-b border-gray-200 bg-white transition-all duration-300 ${scrollDir === 'down' ? 'shadow-none' : ''}`}>
          <nav className="max-w-7xl mx-auto px-6 flex items-center">
            {NAV_LINKS.map((link) => {
              const href    = link.href ?? `/category/${link.slug}`;
              const active  = isActive(link);
              const hasMega = MEGA_SLUGS.has(link.slug);
              return (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => showMega(link.slug)}
                  onMouseLeave={hideMega}
                >
                  <Link
                    to={href}
                    className={`inline-block px-5 py-4 text-[15px] font-semibold uppercase tracking-wider transition-colors whitespace-nowrap border-b-2 ${
                      active
                        ? 'text-[#8B1A2F] border-[#8B1A2F]'
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
          <div
            className="absolute left-0 right-0 bg-white border-b border-gray-200 shadow-xl z-30"
            onMouseEnter={keepMega}
            onMouseLeave={hideMega}
          >
            <div className="max-w-7xl mx-auto px-6 py-7">
              {getChildren(megaSlug).length > 0 ? (
                <div className="flex gap-16">
                  {/* Parent category link */}
                  <div className="min-w-[160px]">
                    <Link
                      to={`/category/${megaSlug}`}
                      onClick={() => setMegaSlug(null)}
                      className="flex items-center gap-1 text-sm font-bold text-gray-900 hover:text-[#8B1A2F] mb-3 uppercase tracking-wide"
                    >
                      {NAV_LINKS.find(l => l.slug === megaSlug)?.label}
                      <IconChevronRight size={14}/>
                    </Link>
                    <div className="flex flex-col gap-1.5">
                      {getChildren(megaSlug).slice(0, 8).map((sub) => (
                        <Link
                          key={sub.id}
                          to={`/category/${sub.slug}`}
                          onClick={() => setMegaSlug(null)}
                          className="text-[13px] text-gray-500 hover:text-[#8B1A2F] transition-colors py-0.5"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Sub-category children columns */}
                  {getChildren(megaSlug)
                    .filter(sub => sub.children?.length > 0)
                    .map((sub) => (
                      <div key={sub.id} className="min-w-[150px]">
                        <Link
                          to={`/category/${sub.slug}`}
                          onClick={() => setMegaSlug(null)}
                          className="flex items-center gap-1 text-sm font-bold text-gray-900 hover:text-[#8B1A2F] mb-3"
                        >
                          {sub.name} <IconChevronRight size={13}/>
                        </Link>
                        <div className="flex flex-col gap-1.5">
                          {sub.children.map((child) => (
                            <Link
                              key={child.id}
                              to={`/category/${child.slug}`}
                              onClick={() => setMegaSlug(null)}
                              className="text-[13px] text-gray-500 hover:text-[#8B1A2F] transition-colors py-0.5"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <div className="flex gap-16">
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
                </div>
              )}
            </div>
          </div>
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
            <Link to="/cart" className="relative text-gray-700 p-1" aria-label="Cart">
              <IconCart/>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#8B1A2F] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
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
                return (
                  <div key={link.label} className="border-b border-gray-100 last:border-b-0">
                    {hasMega && children.length > 0 ? (
                      <>
                        <button
                          onClick={() => setOpenAccordion(isOpen ? null : link.slug)}
                          className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-gray-800 uppercase tracking-wider"
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
                      <Link to={href} onClick={() => setMobileOpen(false)} className="block px-5 py-3.5 text-sm font-semibold text-gray-800 uppercase tracking-wider hover:text-[#8B1A2F]">
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
    </>
  );
}
