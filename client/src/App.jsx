import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './components/guards/ProtectedRoute.jsx';
import AdminRoute from './components/guards/AdminRoute.jsx';

const Home = lazy(() => import('./pages/Home.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected (add pages as phases complete) */}
        {/* <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} /> */}
        {/* <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} /> */}
        {/* <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} /> */}
        {/* <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} /> */}

        {/* Admin (add when admin panel is built) */}
        {/* <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} /> */}
      </Routes>
    </Suspense>
  );
}
