const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'discount',   label: 'Best Discount' },
];

function toTitleCase(str) {
  return str
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function SortBar({ value, onChange, total, title, subtitle, filters, onFilterChange, page, limit }) {
  const activeChips = [];

  if (filters?.gender) {
    activeChips.push({
      label: filters.gender.charAt(0).toUpperCase() + filters.gender.slice(1),
      onRemove: () => onFilterChange({ ...filters, gender: '' }),
    });
  }
  if (filters?.brand) {
    activeChips.push({
      label: toTitleCase(filters.brand),
      onRemove: () => onFilterChange({ ...filters, brand: '' }),
    });
  }
  if (filters?.minPrice || filters?.maxPrice) {
    const label = filters.minPrice && filters.maxPrice
      ? `₹${filters.minPrice} – ₹${filters.maxPrice}`
      : filters.minPrice
      ? `Above ₹${filters.minPrice}`
      : `Under ₹${filters.maxPrice}`;
    activeChips.push({
      label,
      onRemove: () => onFilterChange({ ...filters, minPrice: '', maxPrice: '' }),
    });
  }
  if (filters?.minDiscount) {
    activeChips.push({
      label: `${filters.minDiscount}%+ Off`,
      onRemove: () => onFilterChange({ ...filters, minDiscount: '' }),
    });
  }

  const totalPages = total && limit ? Math.ceil(total / limit) : null;

  return (
    <div className="mb-5">
      {/* Title row */}
      <div className="flex items-end justify-between gap-4 mb-3">
        <div>
          <h1
            className="text-2xl font-bold text-gray-900 leading-tight"
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.01em' }}
          >
            {title || 'Products'}
          </h1>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wider">{subtitle}</p>
          )}
          {total != null && (
            <p className="text-xs text-gray-500 mt-1">
              {total} {total === 1 ? 'Product' : 'Products'}
              {totalPages && page ? ` · Page ${page} of ${totalPages}` : ''}
            </p>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 shrink-0 border border-gray-200 rounded px-3 py-2 bg-white">
          <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Sort by</span>
          <div className="relative">
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="appearance-none text-xs font-semibold text-gray-900 bg-transparent border-none outline-none cursor-pointer pr-4"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-gray-500"
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeChips.map((chip, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#8B1A2F]/5 border border-[#8B1A2F]/20 rounded-full text-xs text-[#8B1A2F] font-medium"
            >
              {chip.label}
              <button
                onClick={chip.onRemove}
                className="hover:text-[#6d1424] transition-colors ml-0.5"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </span>
          ))}
          {activeChips.length > 1 && (
            <button
              onClick={() => onFilterChange({ gender: '', minPrice: '', maxPrice: '', brand: '', minDiscount: '' })}
              className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
