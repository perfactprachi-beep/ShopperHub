import SearchableSelect from '../ui/SearchableSelect.jsx';

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

  /* Department — one chip per selected gender */
  (filters?.genders ?? []).forEach(g => {
    activeChips.push({
      label: g.charAt(0).toUpperCase() + g.slice(1),
      onRemove: () => onFilterChange({ ...filters, genders: (filters.genders ?? []).filter(x => x !== g) }),
    });
  });

  /* Brand — one chip per selected brand */
  (filters?.brands ?? []).forEach(slug => {
    activeChips.push({
      label: toTitleCase(slug),
      onRemove: () => onFilterChange({ ...filters, brands: (filters.brands ?? []).filter(s => s !== slug) }),
    });
  });

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
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Sort by</span>
          <SearchableSelect
            value={value}
            onChange={val => onChange(val || 'newest')}
            options={SORT_OPTIONS}
            placeholder="Select sort"
            className="w-44"
          />
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
              onClick={() => onFilterChange({ genders: [], minPrice: '', maxPrice: '', brands: [], minDiscount: '' })}
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
