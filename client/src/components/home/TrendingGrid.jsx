import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '../ui/Skeleton.jsx';

const GENDER_OVERRIDE = {
  Footwear: 'women',
};

function TrendingCard({ name, slug, imageUrl }) {
  const [err, setErr] = useState(false);
  const gender = GENDER_OVERRIDE[name];
  const to = gender ? `/category/${slug}?gender=${gender}` : `/category/${slug}`;
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-lg bg-gray-100 aspect-square block"
    >
      {imageUrl && !err ? (
        <img
          src={imageUrl}
          alt={name}
          onError={() => setErr(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
      )}
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <span className="absolute bottom-3 left-3 right-3 text-white font-semibold text-sm leading-tight drop-shadow">
        {name}
      </span>
    </Link>
  );
}

export default function TrendingGrid({ categories = [], loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  if (!categories.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {categories.map((cat) => (
        <TrendingCard
          key={cat.id}
          name={cat.name}
          slug={cat.slug}
          imageUrl={cat.image_url}
        />
      ))}
    </div>
  );
}
