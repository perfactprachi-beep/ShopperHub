import { Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-[var(--color-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
                ShopperHub
              </h1>
              <p className="mt-2 text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-body)' }}>
                Phase 0 — scaffold running
              </p>
            </div>
          </div>
        }
      />
    </Routes>
  );
}
