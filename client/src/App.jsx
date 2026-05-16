import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import ToastContainer from './components/ui/Toast.jsx';
import CartDrawer from './components/cart/CartDrawer.jsx';
import Spinner from './components/ui/Spinner.jsx';
import ProtectedRoute from './components/guards/ProtectedRoute.jsx';
import AdminRoute from './components/guards/AdminRoute.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import { useCartSync } from './hooks/useCartSync.js';
import { useUiStore } from './store/uiStore.js';

const Home              = lazy(() => import('./pages/Home.jsx'));
const LoginPage         = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage      = lazy(() => import('./pages/RegisterPage.jsx'));
const CategoryPage      = lazy(() => import('./pages/CategoryPage.jsx'));
const BrandPage         = lazy(() => import('./pages/BrandPage.jsx'));
const BrandsPage        = lazy(() => import('./pages/BrandsPage.jsx'));
const ProductDetail     = lazy(() => import('./pages/ProductDetail.jsx'));
const SearchPage        = lazy(() => import('./pages/SearchPage.jsx'));
const OffersPage        = lazy(() => import('./pages/OffersPage.jsx'));
const CartPage          = lazy(() => import('./pages/CartPage.jsx'));
const WishlistPage      = lazy(() => import('./pages/WishlistPage.jsx'));
const CheckoutPage      = lazy(() => import('./pages/CheckoutPage.jsx'));
const OrderSuccessPage  = lazy(() => import('./pages/OrderSuccessPage.jsx'));
const OrdersPage        = lazy(() => import('./pages/OrdersPage.jsx'));
const OrderDetailPage   = lazy(() => import('./pages/OrderDetailPage.jsx'));
const AccountPage       = lazy(() => import('./pages/AccountPage.jsx'));

// Admin pages
const AdminLoginPage  = lazy(() => import('./pages/admin/AdminLoginPage.jsx'));
const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminProducts   = lazy(() => import('./pages/admin/AdminProducts.jsx'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories.jsx'));
const AdminBrands     = lazy(() => import('./pages/admin/AdminBrands.jsx'));
const AdminOrders     = lazy(() => import('./pages/admin/AdminOrders.jsx'));
const AdminCoupons    = lazy(() => import('./pages/admin/AdminCoupons.jsx'));
const AdminOffers     = lazy(() => import('./pages/admin/AdminOffers.jsx'));
const AdminBanners    = lazy(() => import('./pages/admin/AdminBanners.jsx'));
const AdminUsers      = lazy(() => import('./pages/admin/AdminUsers.jsx'));
const NotFoundPage    = lazy(() => import('./pages/NotFoundPage.jsx'));

function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
    </div>
  );
}

function AdminSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Spinner size="lg" />
    </div>
  );
}

function AppShell() {
  useCartSync();
  const { cartOpen, closeCart } = useUiStore();

  return (
    <>
      <Navbar />
      <Suspense fallback={<PageSpinner />}>
        <main>
          <Routes>
            {/* Public */}
            <Route path="/"               element={<Home />} />
            <Route path="/login"          element={<LoginPage />} />
            <Route path="/register"       element={<RegisterPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/brands"         element={<BrandsPage />} />
            <Route path="/brand/:slug"    element={<BrandPage />} />
            <Route path="/product/:slug"  element={<ProductDetail />} />
            <Route path="/search"         element={<SearchPage />} />
            <Route path="/offers"         element={<OffersPage />} />

            {/* Protected */}
            <Route path="/cart"     element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/order-success/:id" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
            <Route path="/orders"    element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
            <Route path="/account"   element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/account/*" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </Suspense>
      <Footer />
      <CartDrawer isOpen={cartOpen} onClose={closeCart} />
      <ToastContainer />
    </>
  );
}

function AdminShell() {
  return (
    <AdminRoute>
      <Suspense fallback={<AdminSpinner />}>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route index          element={<AdminDashboard />} />
            <Route path="products"   element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="brands"     element={<AdminBrands />} />
            <Route path="orders"     element={<AdminOrders />} />
            <Route path="coupons"    element={<AdminCoupons />} />
            <Route path="offers"     element={<AdminOffers />} />
            <Route path="banners"    element={<AdminBanners />} />
            <Route path="users"      element={<AdminUsers />} />
          </Route>
        </Routes>
      </Suspense>
    </AdminRoute>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <Helmet
        defaultTitle="ShoppersHub — India's Fashion Destination"
        titleTemplate="%s | ShoppersHub"
      />
      <ErrorBoundary>
        <Routes>
          <Route path="/admin/login" element={<Suspense fallback={<AdminSpinner />}><AdminLoginPage /></Suspense>} />
          <Route path="/admin/*"     element={<AdminShell />} />
          <Route path="/*"           element={<AppShell />} />
        </Routes>
      </ErrorBoundary>
    </HelmetProvider>
  );
}
