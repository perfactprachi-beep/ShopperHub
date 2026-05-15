import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useScrollDirection } from '../../hooks/useScrollDirection.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useCartStore } from '../../store/cartStore.js';
import { useUiStore } from '../../store/uiStore.js';
import api from '../../api/axios.js';

const MEGA_SLUGS = new Set(['men', 'women', 'kids']);

const NAV_LINKS = [
  { label: 'Men',          slug: 'men' },
  { label: 'Women',        slug: 'women' },
  { label: 'Kids',         slug: 'kids' },
  { label: 'Beauty',       slug: 'beauty' },
  { label: 'Home & Decor', slug: 'home-decor' },
  { label: 'Brands',       href: '/brands' },
  { label: 'Offers',       href: '/offers' },
];

/* ── SVG icons ──────────────────────────────────────────────────── */
function IconSearch({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IconHeart({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function IconCart({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
function IconUser({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconMenu({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
function IconX({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconChevronDown({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/* ── Main Component ─────────────────────────────────────────────── */
export default function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const scrollDir = useScrollDirection();
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const { openCart } = useUiStore();

  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [megaSlug, setMegaSlug] = useState(null);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [categories, setCategories] = useState([]);

  const accountRef = useRef(null);
  const megaTimer = useRef(null);

  useEffect(() => {
    api.get('/categories').then(({ data }) => {
      if (data.success) setCategories(data.data);
    }).catch(() => {});
  }, []);

  // Close account dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!accountRef.current?.contains(e.target)) setAccountOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Lock body scroll when mobile drawer open
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
  };
  const hideMega = () => {
    megaTimer.current = setTimeout(() => setMegaSlug(null), 120);
  };
  const keepMega = () => clearTimeout(megaTimer.current);

  return (
    <>
      {/* ── Desktop header ─────────────────────────────────────── */}
      <header className="hidden lg:block bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-40 shadow-sm">
        {/* Row 1 */}
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 h-16">
          {/* Logo */}
          <Link to="/" className="shrink-0 mr-2">
            <span
              className="text-2xl font-bold text-[var(--color-primary)] tracking-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Shoppers<span className="text-[var(--color-accent)]">Hub</span>
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for products, brands and more…"
                className="w-full pl-4 pr-10 py-2 text-sm border border-[var(--color-border)] rounded-full focus:outline-none focus:border-[var(--color-primary)] bg-[var(--color-bg)]"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-primary)]"
                aria-label="Search"
              >
                <IconSearch size={18} />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-5 ml-auto shrink-0">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="flex flex-col items-center text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
              aria-label="Wishlist"
            >
              <IconHeart size={22} />
              <span className="text-[10px] mt-0.5">Wishlist</span>
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className="flex flex-col items-center text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors relative"
              aria-label="Cart"
            >
              <span className="relative">
                <IconCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[var(--color-error)] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </span>
              <span className="text-[10px] mt-0.5">Cart</span>
            </button>

            {/* Account */}
            <div ref={accountRef} className="relative">
              <button
                onClick={() => setAccountOpen((v) => !v)}
                className="flex flex-col items-center text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
              >
                <IconUser size={22} />
                <span className="text-[10px] mt-0.5 flex items-center gap-0.5">
                  {isLoggedIn ? (user.full_name?.split(' ')[0] || 'Account') : 'Account'}
                  <IconChevronDown size={10} />
                </span>
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-lg overflow-hidden z-50">
                  {isLoggedIn ? (
                    <>
                      <Link to="/account/orders"  onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-[var(--color-bg)] text-[var(--color-text)]">My Orders</Link>
                      <Link to="/wishlist"         onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-[var(--color-bg)] text-[var(--color-text)]">Wishlist</Link>
                      <Link to="/account/profile"  onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-[var(--color-bg)] text-[var(--color-text)]">Profile</Link>
                      <div className="border-t border-[var(--color-border)]" />
                      <button
                        onClick={() => { logout(); setAccountOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-error)] hover:bg-[var(--color-bg)]"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login"    onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-[var(--color-bg)] text-[var(--color-text)]">Login</Link>
                      <Link to="/register" onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-[var(--color-bg)] text-[var(--color-text)]">Register</Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2 — category nav (hides on scroll down) */}
        <div
          className={`border-t border-[var(--color-border)] transition-all duration-300 overflow-visible ${scrollDir === 'down' ? '-translate-y-full opacity-0 h-0' : 'translate-y-0 opacity-100'}`}
        >
          <nav className="max-w-7xl mx-auto px-4 flex items-center relative">
            {NAV_LINKS.map((link) => {
              const href = link.href ?? `/category/${link.slug}`;
              return (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => showMega(link.slug)}
                  onMouseLeave={hideMega}
                >
                  <Link
                    to={href}
                    className="inline-block px-4 py-3 text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors whitespace-nowrap"
                  >
                    {link.label}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Mega Menu */}
          {megaSlug && (
            <div
              className="absolute left-0 right-0 bg-[var(--color-surface)] border-t border-b border-[var(--color-border)] shadow-lg z-30"
              onMouseEnter={keepMega}
              onMouseLeave={hideMega}
            >
              <div className="max-w-7xl mx-auto px-4 py-6">
                {getChildren(megaSlug).length > 0 ? (
                  <div className="grid grid-cols-3 gap-x-8 gap-y-2">
                    {getChildren(megaSlug).map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/category/${sub.slug}`}
                        onClick={() => setMegaSlug(null)}
                        className="text-sm text-[var(--color-text)] hover:text-[var(--color-primary)] py-1 transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-muted)]">No sub-categories yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Mobile header ──────────────────────────────────────── */}
      <header className="lg:hidden bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3 px-4 h-14">
          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="text-[var(--color-text)] p-1"
            aria-label="Open menu"
          >
            <IconMenu />
          </button>

          {/* Logo */}
          <Link to="/" className="flex-1 text-center">
            <span
              className="text-xl font-bold text-[var(--color-primary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Shoppers<span className="text-[var(--color-accent)]">Hub</span>
            </span>
          </Link>

          {/* Search toggle + cart */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSearch((v) => !v)}
              className="text-[var(--color-text)] p-1"
              aria-label="Search"
            >
              <IconSearch />
            </button>
            <button onClick={openCart} className="relative text-[var(--color-text)] p-1" aria-label="Cart">
              <IconCart />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--color-error)] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {mobileSearch && (
          <form onSubmit={handleSearch} className="px-4 pb-3">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                autoFocus
                className="w-full pl-4 pr-10 py-2 text-sm border border-[var(--color-border)] rounded-full focus:outline-none focus:border-[var(--color-primary)] bg-[var(--color-bg)]"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                <IconSearch size={16} />
              </button>
            </div>
          </form>
        )}
      </header>

      {/* ── Mobile Drawer ──────────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer panel */}
          <div className="w-72 max-w-[85vw] bg-[var(--color-surface)] h-full overflow-y-auto shadow-xl flex flex-col order-first">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--color-border)]">
              <span
                className="text-lg font-bold text-[var(--color-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Shoppers<span className="text-[var(--color-accent)]">Hub</span>
              </span>
              <button onClick={() => setMobileOpen(false)} className="text-[var(--color-muted)]" aria-label="Close menu">
                <IconX />
              </button>
            </div>

            {/* Auth links */}
            <div className="px-4 py-3 border-b border-[var(--color-border)]">
              {isLoggedIn ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--color-text)]">Hi, {user.full_name?.split(' ')[0] || 'User'}</span>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="text-sm text-[var(--color-error)]"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link to="/login"    onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-sm border border-[var(--color-primary)] text-[var(--color-primary)] rounded-[var(--radius-sm)]">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-sm bg-[var(--color-primary)] text-white rounded-[var(--radius-sm)]">Register</Link>
                </div>
              )}
            </div>

            {/* Category tree accordion */}
            <nav className="flex-1 px-4 py-2">
              {NAV_LINKS.map((link) => {
                const href = link.href ?? `/category/${link.slug}`;
                const hasMega = MEGA_SLUGS.has(link.slug);
                const children = hasMega ? getChildren(link.slug) : [];
                const isOpen = openAccordion === link.slug;

                return (
                  <div key={link.label} className="border-b border-[var(--color-border)] last:border-b-0">
                    {hasMega && children.length > 0 ? (
                      <>
                        <button
                          onClick={() => setOpenAccordion(isOpen ? null : link.slug)}
                          className="w-full flex items-center justify-between py-3 text-sm font-medium text-[var(--color-text)]"
                        >
                          {link.label}
                          <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                            <IconChevronDown />
                          </span>
                        </button>
                        {isOpen && (
                          <div className="pb-2 pl-3 flex flex-col gap-0.5">
                            <Link
                              to={href}
                              onClick={() => setMobileOpen(false)}
                              className="py-2 text-sm text-[var(--color-primary)] font-medium"
                            >
                              View all {link.label}
                            </Link>
                            {children.map((sub) => (
                              <Link
                                key={sub.id}
                                to={`/category/${sub.slug}`}
                                onClick={() => setMobileOpen(false)}
                                className="py-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)]"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        to={href}
                        onClick={() => setMobileOpen(false)}
                        className="block py-3 text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)]"
                      >
                        {link.label}
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
