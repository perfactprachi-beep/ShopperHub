import { Link } from 'react-router-dom';

export default function CategoryCard({ name, slug, imageUrl }) {
  return (
    <Link
      to={`/category/${slug}`}
      className="flex flex-col items-center gap-2 group shrink-0 w-20 lg:w-24"
    >
      <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden border-2 border-[var(--color-border)] group-hover:border-[var(--color-primary)] transition-colors bg-[var(--color-primary-light)]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl select-none">
            🛍
          </div>
        )}
      </div>
      <span className="text-xs font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors text-center leading-tight">
        {name}
      </span>
    </Link>
  );
}
