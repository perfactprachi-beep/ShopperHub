import { Link } from 'react-router-dom';

export default function BrandStrip({ brands = [] }) {
  return (
    <div
      className="flex items-center gap-4 overflow-x-auto pb-1"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {brands.map((b) => (
        <Link
          key={b.id}
          to={`/brand/${b.slug}`}
          className="shrink-0 flex items-center justify-center w-28 h-16 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] hover:shadow-sm transition-all group"
        >
          {b.logo_url ? (
            <img
              src={b.logo_url}
              alt={b.name}
              className="max-h-9 max-w-[88px] object-contain grayscale group-hover:grayscale-0 transition-all"
              loading="lazy"
            />
          ) : (
            <span className="text-xs font-semibold text-[var(--color-muted)] group-hover:text-[var(--color-primary)] text-center px-2 leading-tight">
              {b.name}
            </span>
          )}
        </Link>
      ))}

      <Link
        to="/brands"
        className="shrink-0 px-4 py-2 text-sm font-medium text-[var(--color-primary)] border border-[var(--color-primary)] rounded-[var(--radius-md)] hover:bg-[var(--color-primary-light)] transition-colors whitespace-nowrap"
      >
        View All →
      </Link>
    </div>
  );
}
