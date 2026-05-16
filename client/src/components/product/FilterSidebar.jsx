import { useState } from 'react';

const GENDERS = ['Men', 'Women', 'Kids', 'Unisex'];
const PRICE_RANGES = [
  { label: 'Under ₹500',      min: '',    max: '500' },
  { label: '₹500 – ₹1,000',  min: '500', max: '1000' },
  { label: '₹1,000 – ₹2,000',min: '1000',max: '2000' },
  { label: '₹2,000 – ₹5,000',min: '2000',max: '5000' },
  { label: 'Above ₹5,000',   min: '5000',max: '' },
];

function AccordionSection({ title, count, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-[13px] font-semibold text-gray-800 uppercase tracking-wide flex items-center gap-2">
          {title}
          {count > 0 && (
            <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] flex items-center justify-center font-bold">
              {count}
            </span>
          )}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          className={`text-gray-500 transition-transform ${open ? 'rotate-45' : ''}`}
        >
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

export default function FilterSidebar({ filters, onChange, brands = [], activeCount = 0 }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  const selectedPriceLabel = PRICE_RANGES.find(
    r => r.min === (filters.minPrice || '') && r.max === (filters.maxPrice || '')
  )?.label || null;

  const handlePrice = (range) => {
    if (selectedPriceLabel === range.label) {
      onChange({ ...filters, minPrice: '', maxPrice: '' });
    } else {
      onChange({ ...filters, minPrice: range.min, maxPrice: range.max });
    }
  };

  const genderCount  = filters.gender ? 1 : 0;
  const priceCount   = (filters.minPrice || filters.maxPrice) ? 1 : 0;
  const brandCount   = filters.brand ? 1 : 0;
  const totalActive  = genderCount + priceCount + brandCount;

  return (
    <aside className="w-[240px] shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between py-4 border-b border-gray-200">
        <h2 className="text-[13px] font-bold uppercase tracking-wide text-gray-900 flex items-center gap-2">
          Filters
          {totalActive > 0 && (
            <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] flex items-center justify-center font-bold">
              {totalActive}
            </span>
          )}
        </h2>
        {totalActive > 0 && (
          <button
            onClick={() => onChange({ gender: '', minPrice: '', maxPrice: '', brand: '' })}
            className="text-xs text-[#8B1A2F] hover:underline font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <AccordionSection title="Brands" count={brandCount}>
          <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
            {brands.map(b => (
              <label key={b.id} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.brand === b.slug}
                  onChange={() => set('brand', filters.brand === b.slug ? '' : b.slug)}
                  className="w-4 h-4 rounded border-gray-300 accent-[#8B1A2F] cursor-pointer"
                />
                <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors">{b.name}</span>
              </label>
            ))}
          </div>
        </AccordionSection>
      )}

      {/* Gender */}
      <AccordionSection title="Department" count={genderCount} defaultOpen={true}>
        <div className="space-y-2.5">
          {GENDERS.map(g => (
            <label key={g} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.gender?.toLowerCase() === g.toLowerCase()}
                onChange={() => set('gender', filters.gender?.toLowerCase() === g.toLowerCase() ? '' : g.toLowerCase())}
                className="w-4 h-4 rounded border-gray-300 accent-[#8B1A2F] cursor-pointer"
              />
              <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors">{g}</span>
            </label>
          ))}
        </div>
      </AccordionSection>

      {/* Price */}
      <AccordionSection title="Price" count={priceCount} defaultOpen={true}>
        <div className="space-y-2.5">
          {PRICE_RANGES.map(r => (
            <label key={r.label} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedPriceLabel === r.label}
                onChange={() => handlePrice(r)}
                className="w-4 h-4 rounded border-gray-300 accent-[#8B1A2F] cursor-pointer"
              />
              <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors">{r.label}</span>
            </label>
          ))}
        </div>
        {/* Custom range */}
        <div className="flex gap-2 mt-3">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={e => set('minPrice', e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#8B1A2F]"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={e => set('maxPrice', e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#8B1A2F]"
          />
        </div>
      </AccordionSection>
    </aside>
  );
}
