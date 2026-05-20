import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useToastStore } from '../../store/toastStore.js';
import ToastContainer from '../ui/Toast.jsx';

function IconDashboard() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}

function IconProducts() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}

function IconCategories() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,2 2,7 12,12 22,7"/>
      <polyline points="2,17 12,22 22,17"/>
      <polyline points="2,12 12,17 22,12"/>
    </svg>
  );
}

function IconBrands() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  );
}

function IconOrders() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}

function IconInventory() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function IconCoupons() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  );
}

function IconBanners() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21,15 16,10 5,21"/>
    </svg>
  );
}

function IconOffers() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
      <line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function IconPayments() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  );
}

function IconDelivery() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  );
}

function IconPages() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}

function IconArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12,19 5,12 12,5"/>
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16,17 21,12 16,7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

const NAV_ITEMS = [
  { to: '/admin',            label: 'Dashboard',  Icon: IconDashboard,  end: true },
  { to: '/admin/products',   label: 'Products',   Icon: IconProducts },
  { to: '/admin/categories', label: 'Categories', Icon: IconCategories },
  { to: '/admin/brands',     label: 'Brands',     Icon: IconBrands },
  { to: '/admin/orders',     label: 'Orders',     Icon: IconOrders },
  { to: '/admin/inventory',  label: 'Inventory',  Icon: IconInventory },
  { to: '/admin/coupons',    label: 'Coupons',    Icon: IconCoupons },
  { to: '/admin/offers',     label: 'Offers',     Icon: IconOffers },
  { to: '/admin/banners',          label: 'Banners',          Icon: IconBanners },
  { to: '/admin/users',            label: 'Users',            Icon: IconUsers },
  { to: '/admin/payment-methods',  label: 'Payment Methods',  Icon: IconPayments },
  { to: '/admin/delivery',         label: 'Delivery',         Icon: IconDelivery },
  { to: '/admin/pages',            label: 'CMS Pages',        Icon: IconPages },
];

const PAGE_TITLES = {
  '/admin':                    'Dashboard',
  '/admin/products':           'Products',
  '/admin/categories':         'Categories',
  '/admin/brands':             'Brands',
  '/admin/orders':             'Orders',
  '/admin/inventory':          'Inventory',
  '/admin/inventory/stocks':   'Stock Management',
  '/admin/inventory/low-stock': 'Low Stock Alerts',
  '/admin/inventory/warehouses': 'Warehouses',
  '/admin/inventory/logs':     'Inventory Logs',
  '/admin/coupons':            'Coupons',
  '/admin/offers':             'Offers',
  '/admin/banners':            'Banners',
  '/admin/users':              'Users',
  '/admin/payment-methods':    'Payment Methods',
  '/admin/delivery':           'Delivery',
  '/admin/pages':              'CMS Pages',
};

const PAGE_SUBTITLES = {
  '/admin':                    'Overview & analytics',
  '/admin/products':           'Manage your product catalog',
  '/admin/categories':         'Organize product categories',
  '/admin/brands':             'Manage brand listings',
  '/admin/orders':             'Track and fulfill orders',
  '/admin/inventory':          'Inventory overview & analytics',
  '/admin/inventory/stocks':   'Manage product stock levels',
  '/admin/inventory/low-stock': 'Monitor low stock items',
  '/admin/inventory/warehouses': 'Manage warehouse locations',
  '/admin/inventory/logs':     'Track inventory changes',
  '/admin/coupons':            'Discount codes & promotions',
  '/admin/offers':             'Manage product page offer messages',
  '/admin/banners':            'Homepage & promotional banners',
  '/admin/users':              'Customer accounts',
  '/admin/payment-methods':    'Configure checkout payment options',
  '/admin/delivery':           'Manage express delivery pincodes',
  '/admin/pages':              'Create and manage static content pages',
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = window.location.pathname;

  const pageTitle = Object.entries(PAGE_TITLES).reverse()
    .find(([key]) => pathname.startsWith(key))?.[1] || 'Admin';
  const pageSubtitle = Object.entries(PAGE_SUBTITLES).reverse()
    .find(([key]) => pathname.startsWith(key))?.[1] || '';

  const handleLogout = async () => {
    await logout();
    addToast('You have been logged out successfully', 'success');
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col bg-[#111111] text-white overflow-y-auto">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-white/8">
          <Link to="/" className="flex items-center gap-3">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <rect width="36" height="36" rx="9" fill="#8B1A2F"/>
              <path d="M13 16V13.5a5 5 0 0 1 10 0V16" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 16h16l-1.2 11.2A1.5 1.5 0 0 1 23.3 28H12.7a1.5 1.5 0 0 1-1.5-1.3L10 16z" fill="white" fillOpacity="0.95"/>
              <path d="M18 21v3M16.5 22.5h3" stroke="#8B1A2F" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <div>
              <p className="text-white text-[13px] font-bold tracking-wide leading-none">ShoppersHub</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-[#8B1A2F] text-white font-medium'
                    : 'text-gray-300 hover:bg-white/8 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? 'text-white/80' : 'text-gray-400'}>
                    <Icon />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 pt-2 border-t border-white/8 space-y-0.5">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/8 hover:text-white transition-colors"
          >
            <span className="text-gray-400"><IconArrowLeft /></span>
            Back to Store
          </Link>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            <h1 className="text-[15px] font-semibold text-gray-900">{pageTitle}</h1>
            {pageSubtitle && <p className="text-xs text-gray-400">{pageSubtitle}</p>}
          </div>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(o => !o)}
              className="flex items-center gap-2.5 text-sm text-gray-700 hover:text-gray-900 pl-2 pr-2.5 py-1.5 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-[#8B1A2F] text-white flex items-center justify-center text-xs font-bold">
                {user?.full_name?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="max-w-[120px] truncate text-sm font-medium text-gray-700">
                {user?.full_name || 'Admin'}
              </span>
              <svg
                className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-11 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1.5 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-800 truncate">{user?.full_name || 'Admin'}</p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{user?.email || ''}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2.5 mt-0.5"
                  >
                    <IconLogout />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
