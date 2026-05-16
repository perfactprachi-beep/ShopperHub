const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'discount',   label: 'Best Discount' },
];

export default function SortBar({ value, onChange, total, categoryName, filters, onFilterChange }) {
  const activeChips = [];

  if (filters?.gender) {
    activeChips.push({
      label: filters.gender.charAt(0).toUpperCase() + filters.gender.slice(1),
      onRemove: () => onFilterChange({ ...filters, gender: '' }),
    });
  }
  if (filters?.brand) {
    activeChips.push({
      label: filters.brand,
      onRemove: () => onFilterChange({ ...filters, brand: '' }),
    });
  }
  if (filters?.minPrice || filters?.maxPrice) {
    const label = filters.minPrice && filters.maxPrice
      ? `₹${filters.minPrice} – ₹${filters.maxPrice}`
      : filters.minPrice ? `Above ₹${filters.minPrice}` : `Under ₹${filters.maxPrice}`;
    activeChips.push({
      label,
      onRemove: () => onFilterChange({ ...filters, minPrice: '', maxPrice: '' }),
    });
  }

  return (
    <div className="mb-6">
      {/* Title + Sort row */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h1
            className="text-2xl font-semibold text-gray-900 capitalize"
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.01em' }}
          >
            {categoryName || 'Products'}
          </h1>
          {total != null && (
            <p className="text-sm text-gray-500 mt-0.5">{total} Products</p>
          )}
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm text-gray-500 font-medium">Sort By:</span>
          <div className="relative">
            <select
              value={value}
              onChange={e => onChange(e.target.value)}
              className="appearance-none text-sm font-semibold text-gray-900 bg-transparent border-none outline-none cursor-pointer pr-5"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-gray-600" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeChips.map((chip, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-400 rounded-full text-[13px] text-gray-700 bg-white"
            >
              {chip.label}
              <button onClick={chip.onRemove} className="text-gray-500 hover:text-gray-900 transition-colors">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
