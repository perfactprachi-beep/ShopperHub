import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function Home() {
  const { isLoggedIn, user, logout } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-[var(--color-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
          ShopperHub
        </h1>
        {isLoggedIn ? (
          <>
            <p className="text-[var(--color-muted)]">Welcome, {user.full_name || user.email}</p>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm bg-[var(--color-primary)] text-white rounded-[var(--radius-sm)] hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <div className="flex gap-3 justify-center">
            <Link to="/login" className="px-4 py-2 text-sm bg-[var(--color-primary)] text-white rounded-[var(--radius-sm)] hover:bg-[var(--color-primary-dark)] transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="px-4 py-2 text-sm border border-[var(--color-primary)] text-[var(--color-primary)] rounded-[var(--radius-sm)] hover:bg-[var(--color-primary-light)] transition-colors">
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
