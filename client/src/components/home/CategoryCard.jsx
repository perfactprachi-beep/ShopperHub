import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function CategoryCard({ name, slug, imageUrl }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <Link
      to={`/category/${slug}`}
      className="flex flex-col items-center gap-3 group shrink-0 w-32 lg:w-36"
    >
      <div className="w-32 h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden border-2 border-[var(--color-border)] group-hover:border-[var(--color-primary)] transition-colors bg-[var(--color-primary-light)]">
        {imageUrl && !imgErr ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl select-none">
            🛍
          </div>
        )}
      </div>
      <span className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors text-center leading-tight">
        {name}
      </span>
    </Link>
  );
}
