import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

const NAV_ITEMS = [
  { to: '/admin',           label: 'Dashboard',  icon: '🏠', end: true },
  { to: '/admin/products',  label: 'Products',   icon: '📦' },
  { to: '/admin/categories',label: 'Categories', icon: '🏷️' },
  { to: '/admin/brands',    label: 'Brands',     icon: '⭐' },
  { to: '/admin/orders',    label: 'Orders',     icon: '🛒' },
  { to: '/admin/coupons',   label: 'Coupons',    icon: '🎟️' },
  { to: '/admin/banners',   label: 'Banners',    icon: '🖼️' },
  { to: '/admin/users',     label: 'Users',      icon: '👥' },
];

const PAGE_TITLES = {
  '/admin':            'Dashboard',
  '/admin/products':   'Products',
  '/admin/categories': 'Categories',
  '/admin/brands':     'Brands',
  '/admin/orders':     'Orders',
  '/admin/coupons':    'Coupons',
  '/admin/banners':    'Banners',
  '/admin/users':      'Users',
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = window.location.pathname;
  const pageTitle = Object.entries(PAGE_TITLES).reverse()
    .find(([key]) => pathname.startsWith(key))?.[1] || 'Admin';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col bg-[#1A1A1A] text-white overflow-y-auto">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <Link to="/" className="text-xl font-bold tracking-wide text-white">
            SS <span className="text-[#8B1A2F] text-sm font-normal">Admin</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-[#8B1A2F] text-white font-medium'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Back to Store */}
        <div className="px-3 py-4 border-t border-white/10">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <span>↩</span>
            Back to Store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(o => !o)}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
            >
              <div className="w-8 h-8 rounded-full bg-[#8B1A2F] text-white flex items-center justify-center text-xs font-bold">
                {user?.full_name?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="max-w-[120px] truncate">{user?.full_name || 'Admin'}</span>
              <span className="text-xs">▾</span>
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-10 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-[#F3F4F6] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
