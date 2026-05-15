const GENDERS = ['men', 'women', 'kids', 'unisex'];

export default function FilterSidebar({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <aside className="w-56 shrink-0 space-y-6">
      {/* Gender */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-text)] mb-2 uppercase tracking-wide">Gender</h3>
        <div className="space-y-1">
          {GENDERS.map(g => (
            <label key={g} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value={g}
                checked={filters.gender === g}
                onChange={() => set('gender', g)}
                className="accent-[var(--color-primary)]"
              />
              <span className="text-sm capitalize text-[var(--color-text)]">{g}</span>
            </label>
          ))}
          {filters.gender && (
            <button onClick={() => set('gender', '')} className="text-xs text-[var(--color-primary)] hover:underline mt-1">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-text)] mb-2 uppercase tracking-wide">Price</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={e => set('minPrice', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--color-primary)]"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={e => set('maxPrice', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>
      </div>
    </aside>
  );
}
