import { useState } from 'react';

const GENDERS = ['Men', 'Women', 'Kids', 'Unisex'];

const PRICE_RANGES = [
  { label: 'Under ₹500',        min: '',    max: '500'  },
  { label: '₹500 – ₹1,000',    min: '500', max: '1000' },
  { label: '₹1,000 – ₹2,000',  min: '1000',max: '2000' },
  { label: '₹2,000 – ₹5,000',  min: '2000',max: '5000' },
  { label: 'Above ₹5,000',      min: '5000',max: ''     },
];

const DISCOUNT_OPTIONS = [
  { label: '10% and above',  value: '10' },
  { label: '20% and above',  value: '20' },
  { label: '30% and above',  value: '30' },
  { label: '50% and above',  value: '50' },
];

function AccordionSection({ title, badge, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-3.5 text-left"
      >
        <span className="text-[12px] font-bold uppercase tracking-widest text-gray-700 flex items-center gap-2">
          {title}
          {badge > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#8B1A2F] text-white text-[9px] flex items-center justify-center font-bold">
              {badge}
            </span>
          )}
        </span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

export default function FilterSidebar({ filters, onChange, brands = [], hideDepartment = false }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  const selectedPriceRange = PRICE_RANGES.find(
    (r) => r.min === (filters.minPrice || '') && r.max === (filters.maxPrice || '')
  );

  const handlePrice = (range) => {
    if (selectedPriceRange?.label === range.label) {
      onChange({ ...filters, minPrice: '', maxPrice: '' });
    } else {
      onChange({ ...filters, minPrice: range.min, maxPrice: range.max });
    }
  };

  const genderCount   = filters.gender ? 1 : 0;
  const priceCount    = (filters.minPrice || filters.maxPrice) ? 1 : 0;
  const brandCount    = filters.brand ? 1 : 0;
  const discountCount = filters.minDiscount ? 1 : 0;
  const totalActive   = genderCount + priceCount + brandCount + discountCount;

  return (
    <aside className="w-[220px] shrink-0 sticky top-[72px] self-start max-h-[calc(100vh-80px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between py-3 border-b border-gray-200 pr-2">
        <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-900 flex items-center gap-2">
          Filters
          {totalActive > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#8B1A2F] text-white text-[10px] flex items-center justify-center font-bold">
              {totalActive}
            </span>
          )}
        </h2>
        {totalActive > 0 && (
          <button
            onClick={() => onChange({ gender: '', minPrice: '', maxPrice: '', brand: '', minDiscount: '' })}
            className="text-[11px] text-[#8B1A2F] hover:underline font-semibold"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="pr-2">
        {/* Department / Gender */}
        {!hideDepartment && (
          <AccordionSection title="Department" badge={genderCount} defaultOpen>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={!filters.gender}
                  onChange={() => set('gender', '')}
                  className="w-3.5 h-3.5 rounded border-gray-300 accent-[#8B1A2F] cursor-pointer"
                />
                <span className="text-[13px] font-medium text-gray-700 group-hover:text-gray-900">All</span>
              </label>
              {GENDERS.map((g) => (
                <label key={g} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.gender?.toLowerCase() === g.toLowerCase()}
                    onChange={() =>
                      set('gender', filters.gender?.toLowerCase() === g.toLowerCase() ? '' : g.toLowerCase())
                    }
                    className="w-3.5 h-3.5 rounded border-gray-300 accent-[#8B1A2F] cursor-pointer"
                  />
                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">{g}</span>
                </label>
              ))}
            </div>
          </AccordionSection>
        )}

        {/* Brand */}
        {brands.length > 0 && (
          <AccordionSection title="Brand" badge={brandCount} defaultOpen>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={!filters.brand}
                  onChange={() => set('brand', '')}
                  className="w-3.5 h-3.5 rounded border-gray-300 accent-[#8B1A2F] cursor-pointer"
                />
                <span className="text-[13px] font-medium text-gray-700 group-hover:text-gray-900">All</span>
              </label>
              {brands.map((b) => (
                <label key={b.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.brand === b.slug}
                    onChange={() => set('brand', filters.brand === b.slug ? '' : b.slug)}
                    className="w-3.5 h-3.5 rounded border-gray-300 accent-[#8B1A2F] cursor-pointer"
                  />
                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">{b.name}</span>
                </label>
              ))}
            </div>
          </AccordionSection>
        )}

        {/* Price */}
        <AccordionSection title="Price" badge={priceCount} defaultOpen>
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={!filters.minPrice && !filters.maxPrice}
                onChange={() => onChange({ ...filters, minPrice: '', maxPrice: '' })}
                className="w-3.5 h-3.5 rounded border-gray-300 accent-[#8B1A2F] cursor-pointer"
              />
              <span className="text-[13px] font-medium text-gray-700 group-hover:text-gray-900">All</span>
            </label>
            {PRICE_RANGES.map((r) => (
              <label key={r.label} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedPriceRange?.label === r.label}
                  onChange={() => handlePrice(r)}
                  className="w-3.5 h-3.5 rounded border-gray-300 accent-[#8B1A2F] cursor-pointer"
                />
                <span className="text-[13px] text-gray-600 group-hover:text-gray-900">{r.label}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              type="number"
              placeholder="Min ₹"
              value={filters.minPrice || ''}
              onChange={(e) => set('minPrice', e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#8B1A2F]"
            />
            <input
              type="number"
              placeholder="Max ₹"
              value={filters.maxPrice || ''}
              onChange={(e) => set('maxPrice', e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#8B1A2F]"
            />
          </div>
        </AccordionSection>

        {/* Discount */}
        <AccordionSection title="Discount" badge={discountCount}>
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={!filters.minDiscount}
                onChange={() => set('minDiscount', '')}
                className="w-3.5 h-3.5 rounded border-gray-300 accent-[#8B1A2F] cursor-pointer"
              />
              <span className="text-[13px] font-medium text-gray-700 group-hover:text-gray-900">All</span>
            </label>
            {DISCOUNT_OPTIONS.map((d) => (
              <label key={d.value} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.minDiscount === d.value}
                  onChange={() => set('minDiscount', filters.minDiscount === d.value ? '' : d.value)}
                  className="w-3.5 h-3.5 rounded border-gray-300 accent-[#8B1A2F] cursor-pointer"
                />
                <span className="text-[13px] text-gray-600 group-hover:text-gray-900">{d.label}</span>
              </label>
            ))}
          </div>
        </AccordionSection>
      </div>
    </aside>
  );
}
