import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFoundPage() {
  return (
    <>
      <Helmet><title>404 — Page Not Found</title></Helmet>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <h1
          className="text-8xl font-bold text-[var(--color-primary)] mb-4"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          404
        </h1>
        <p className="text-2xl font-semibold text-[var(--color-text)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Page Not Found
        </p>
        <p className="text-[var(--color-muted)] mb-8 max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="px-8 py-3 bg-[var(--color-primary)] text-white font-medium rounded-[var(--radius-sm)] hover:opacity-90 transition-opacity"
        >
          Go to Homepage
        </Link>
      </div>
    </>
  );
}
