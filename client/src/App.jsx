import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import ToastContainer from './components/ui/Toast.jsx';
import Spinner from './components/ui/Spinner.jsx';
import ProtectedRoute from './components/guards/ProtectedRoute.jsx';

const Home          = lazy(() => import('./pages/Home.jsx'));
const LoginPage     = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage  = lazy(() => import('./pages/RegisterPage.jsx'));
const CategoryPage  = lazy(() => import('./pages/CategoryPage.jsx'));
const BrandPage     = lazy(() => import('./pages/BrandPage.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const SearchPage    = lazy(() => import('./pages/SearchPage.jsx'));
const OffersPage    = lazy(() => import('./pages/OffersPage.jsx'));

function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
    </div>
  );
}

export default function App() {
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
            <Route path="/brand/:slug"    element={<BrandPage />} />
            <Route path="/product/:slug"  element={<ProductDetail />} />
            <Route path="/search"         element={<SearchPage />} />
            <Route path="/offers"         element={<OffersPage />} />

            {/* Protected (add as phases complete) */}
            {/* <Route path="/cart"     element={<ProtectedRoute><CartPage /></ProtectedRoute>} /> */}
            {/* <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} /> */}
            {/* <Route path="/orders"   element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} /> */}
            {/* <Route path="/account"  element={<ProtectedRoute><AccountPage /></ProtectedRoute>} /> */}
          </Routes>
        </main>
      </Suspense>
      <Footer />
      <ToastContainer />
    </>
  );
}
