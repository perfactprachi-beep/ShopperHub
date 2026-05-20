import { Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import ToastContainer from './components/ui/Toast.jsx';
import CartDrawer from './components/cart/CartDrawer.jsx';
import LoginModal from './components/ui/LoginModal.jsx';
import Spinner from './components/ui/Spinner.jsx';
import ProtectedRoute from './components/guards/ProtectedRoute.jsx';
import AdminRoute from './components/guards/AdminRoute.jsx';
import AdminBlockedRoute from './components/guards/AdminBlockedRoute.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import { useCartSync } from './hooks/useCartSync.js';
import { useUiStore } from './store/uiStore.js';

const Home              = lazy(() => import('./pages/Home.jsx'));
const RegisterPage      = lazy(() => import('./pages/RegisterPage.jsx'));
const CategoryPage      = lazy(() => import('./pages/CategoryPage.jsx'));
const LuxePage          = lazy(() => import('./pages/LuxePage.jsx'));
const MenPage           = lazy(() => import('./pages/MenPage.jsx'));
const WomenPage         = lazy(() => import('./pages/WomenPage.jsx'));
const KidsPage          = lazy(() => import('./pages/KidsPage.jsx'));
const WatchesPage       = lazy(() => import('./pages/WatchesPage.jsx'));
const HomeCategoryPage    = lazy(() => import('./pages/HomeCategoryPage.jsx'));
const BeautyCategoryPage  = lazy(() => import('./pages/BeautyCategoryPage.jsx'));
const MakeupPage          = lazy(() => import('./pages/MakeupPage.jsx'));
const GiftsPage           = lazy(() => import('./pages/GiftsPage.jsx'));
const CmsPage           = lazy(() => import('./pages/CmsPage.jsx'));
const BrandPage         = lazy(() => import('./pages/BrandPage.jsx'));
const BrandsPage        = lazy(() => import('./pages/BrandsPage.jsx'));
const ProductDetail     = lazy(() => import('./pages/ProductDetail.jsx'));
const SearchPage        = lazy(() => import('./pages/SearchPage.jsx'));
const OffersPage        = lazy(() => import('./pages/OffersPage.jsx'));
const StoreLocatorPage  = lazy(() => import('./pages/StoreLocatorPage.jsx'));
const FaqsPage          = lazy(() => import('./pages/FaqsPage.jsx'));
const ReturnsPage       = lazy(() => import('./pages/ReturnsPage.jsx'));
const ContactPage       = lazy(() => import('./pages/ContactPage.jsx'));
const CartPage          = lazy(() => import('./pages/CartPage.jsx'));
const BagPage           = lazy(() => import('./pages/BagPage.jsx'));
const WishlistPage      = lazy(() => import('./pages/WishlistPage.jsx'));
const CheckoutPage      = lazy(() => import('./pages/CheckoutPage.jsx'));
const OrderSuccessPage  = lazy(() => import('./pages/OrderSuccessPage.jsx'));
const OrdersPage        = lazy(() => import('./pages/OrdersPage.jsx'));
const OrderDetailPage   = lazy(() => import('./pages/OrderDetailPage.jsx'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage.jsx'));
const AddedToBagPage    = lazy(() => import('./pages/AddedToBagPage.jsx'));
const AccountPage       = lazy(() => import('./pages/AccountPage.jsx'));

// Admin pages
const AdminLoginPage     = lazy(() => import('./pages/admin/AdminLoginPage.jsx'));
const AdminDashboard     = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminProducts      = lazy(() => import('./pages/admin/AdminProducts.jsx'));
const AdminCategories    = lazy(() => import('./pages/admin/AdminCategories.jsx'));
const AdminBrands        = lazy(() => import('./pages/admin/AdminBrands.jsx'));
const AdminOrders        = lazy(() => import('./pages/admin/AdminOrders.jsx'));
const AdminCoupons       = lazy(() => import('./pages/admin/AdminCoupons.jsx'));
const AdminOffers        = lazy(() => import('./pages/admin/AdminOffers.jsx'));
const AdminBanners       = lazy(() => import('./pages/admin/AdminBanners.jsx'));
const AdminUsers         = lazy(() => import('./pages/admin/AdminUsers.jsx'));

// Inventory pages
const InventoryDashboard = lazy(() => import('./pages/admin/InventoryDashboard.jsx'));
const StockManagement    = lazy(() => import('./pages/admin/StockManagement.jsx'));
const LowStockAlerts     = lazy(() => import('./pages/admin/LowStockAlerts.jsx'));
const Warehouses         = lazy(() => import('./pages/admin/Warehouses.jsx'));
const InventoryLogs      = lazy(() => import('./pages/admin/InventoryLogs.jsx'));
const AdminPaymentMethods = lazy(() => import('./pages/admin/AdminPaymentMethods.jsx'));
const AdminDelivery       = lazy(() => import('./pages/admin/AdminDelivery.jsx'));
const AdminPages          = lazy(() => import('./pages/admin/AdminPages.jsx'));

const NotFoundPage       = lazy(() => import('./pages/NotFoundPage.jsx'));

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

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, search]);

  return null;
}

function AppShell() {
  useCartSync();
  const { cartOpen, closeCart, loginModalOpen, closeLoginModal, loginModalOnSuccess } = useUiStore();

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Suspense fallback={<PageSpinner />}>
        <main>
          <Routes>
            {/* Public */}
            <Route path="/"               element={<Home />} />
            <Route path="/register"       element={<RegisterPage />} />
            <Route path="/luxe"            element={<LuxePage />} />
            <Route path="/category/men"    element={<MenPage />} />
            <Route path="/category/women" element={<WomenPage />} />
            <Route path="/category/kids"     element={<KidsPage />} />
            <Route path="/category/watches" element={<WatchesPage />} />
            <Route path="/category/home"    element={<HomeCategoryPage />} />
            <Route path="/category/beauty"  element={<BeautyCategoryPage />} />
            <Route path="/category/makeup" element={<MakeupPage />} />
            <Route path="/gifts"          element={<GiftsPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/brands"         element={<BrandsPage />} />
            <Route path="/brand/:slug"    element={<BrandPage />} />
            <Route path="/product/:slug"  element={<ProductDetail />} />
            <Route path="/search"         element={<SearchPage />} />
            <Route path="/offers"         element={<OffersPage />} />
            <Route path="/stores"                    element={<StoreLocatorPage />} />
            <Route path="/account/storesandevents"   element={<StoreLocatorPage />} />
            <Route path="/faqs"           element={<FaqsPage />} />
            <Route path="/account/help"   element={<FaqsPage />} />
            <Route path="/returns"        element={<ReturnsPage />} />
            <Route path="/contact"        element={<ContactPage />} />
            <Route path="/pages/:slug"    element={<CmsPage />} />
            <Route path="/bag-added"      element={<AddedToBagPage />} />

            {/* Protected */}
            <Route path="/cart"     element={<BagPage />} />
            <Route path="/wishlist" element={<AdminBlockedRoute><ProtectedRoute><WishlistPage /></ProtectedRoute></AdminBlockedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/order-success/:id" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
            <Route path="/orders"    element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
            <Route path="/track/:id"  element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
            <Route path="/account"   element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/account/*" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </Suspense>
      <Footer />
      <CartDrawer isOpen={cartOpen} onClose={closeCart} />
      {loginModalOpen && <LoginModal onClose={closeLoginModal} onSuccess={loginModalOnSuccess} />}
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
            <Route index                    element={<AdminDashboard />} />
            <Route path="products"          element={<AdminProducts />} />
            <Route path="categories"        element={<AdminCategories />} />
            <Route path="brands"            element={<AdminBrands />} />
            <Route path="orders"            element={<AdminOrders />} />
            <Route path="inventory"          element={<InventoryDashboard />} />
            <Route path="inventory/stocks"  element={<StockManagement />} />
            <Route path="inventory/low-stock" element={<LowStockAlerts />} />
            <Route path="inventory/warehouses" element={<Warehouses />} />
            <Route path="inventory/logs"    element={<InventoryLogs />} />
            <Route path="coupons"           element={<AdminCoupons />} />
            <Route path="offers"            element={<AdminOffers />} />
            <Route path="banners"           element={<AdminBanners />} />
            <Route path="users"             element={<AdminUsers />} />
            <Route path="payment-methods"   element={<AdminPaymentMethods />} />
            <Route path="delivery"          element={<AdminDelivery />} />
            <Route path="pages"             element={<AdminPages />} />
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
