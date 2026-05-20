import { useState, useMemo } from 'react';

const GENDERS = ['Men', 'Women', 'Kids', 'Unisex'];

const PRICE_RANGES = [
  { label: 'Under ₹500',       min: '',     max: '500'  },
  { label: '₹500 – ₹1,000',   min: '500',  max: '1000' },
  { label: '₹1,000 – ₹2,000', min: '1000', max: '2000' },
  { label: '₹2,000 – ₹5,000', min: '2000', max: '5000' },
  { label: 'Above ₹5,000',     min: '5000', max: ''     },
];

const DISCOUNT_OPTIONS = [
  { label: '10% and above', value: '10' },
  { label: '20% and above', value: '20' },
  { label: '30% and above', value: '30' },
  { label: '50% and above', value: '50' },
];

/* ── Custom checkbox ──────────────────────────────────────────────────────── */
function CheckRow({ label, checked, isAll = false, onChange }) {
  return (
    <label
      className={`flex items-center gap-2.5 cursor-pointer group px-2 py-[7px] rounded-lg transition-colors select-none ${
        checked ? (isAll ? 'bg-[#8B1A2F]/8' : 'bg-[#8B1A2F]/5') : 'hover:bg-gray-50'
      }`}
    >
      {/* Box */}
      <span className={`relative flex-shrink-0 w-[15px] h-[15px] rounded-[3px] border-2 transition-all flex items-center justify-center ${
        checked ? 'bg-[#8B1A2F] border-[#8B1A2F]' : 'bg-white border-gray-300 group-hover:border-[#8B1A2F]/60'
      }`}>
        {checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <polyline points="1,3.5 3.5,6 8,1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </span>

      <span className={`text-[13px] flex-1 leading-snug transition-colors ${
        checked
          ? isAll ? 'font-bold text-[#8B1A2F]' : 'font-semibold text-gray-900'
          : 'text-gray-600 group-hover:text-gray-900'
      }`}>
        {label}
      </span>
    </label>
  );
}

/* ── Accordion ────────────────────────────────────────────────────────────── */
function Section({ title, badge, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-3.5 px-1 text-left"
      >
        <span className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-700">{title}</span>
          {badge > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#8B1A2F] text-white text-[9px] flex items-center justify-center font-bold">
              {badge}
            </span>
          )}
        </span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && <div className="pb-3 -mx-1">{children}</div>}
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────────────────── */
export default function FilterSidebar({ filters, onChange, brands = [], hideDepartment = false }) {
  const [brandQuery, setBrandQuery] = useState('');
  const set = (key, val) => onChange({ ...filters, [key]: val });

  /* ── Department (multi-select array) ──
     genders = [] means "All"
     Clicking "All"  → clears array (show all)
     Clicking a item → toggle it in array; never auto-select "All"
  ── */
  const genders        = filters.genders ?? [];
  const isAllGenders   = genders.length === 0;

  const toggleGender = (g) => {
    const lower = g.toLowerCase();
    const next  = genders.includes(lower)
      ? genders.filter(x => x !== lower)   // uncheck → remove from array
      : [...genders, lower];               // check   → add to array
    set('genders', next);
  };

  /* ── Brand (multi-select array) ──
     brands = [] means "All"
  ── */
  const selBrands    = filters.brands ?? [];
  const isAllBrands  = selBrands.length === 0;

  const toggleBrand = (slug) => {
    const next = selBrands.includes(slug)
      ? selBrands.filter(s => s !== slug)
      : [...selBrands, slug];
    set('brands', next);
  };

  /* ── Price ── */
  const selPrice = PRICE_RANGES.find(
    r => r.min === (filters.minPrice || '') && r.max === (filters.maxPrice || '')
  );
  const handlePrice = (range) => {
    if (selPrice?.label === range.label) onChange({ ...filters, minPrice: '', maxPrice: '' });
    else onChange({ ...filters, minPrice: range.min, maxPrice: range.max });
  };

  /* ── Badge counts ── */
  const genderBadge   = genders.length;
  const brandBadge    = selBrands.length;
  const priceBadge    = (filters.minPrice || filters.maxPrice) ? 1 : 0;
  const discountBadge = filters.minDiscount ? 1 : 0;
  const totalActive   = (genderBadge > 0 ? 1 : 0) + (brandBadge > 0 ? 1 : 0) + priceBadge + discountBadge;

  const visibleBrands = useMemo(() =>
    brandQuery.trim()
      ? brands.filter(b => b.name.toLowerCase().includes(brandQuery.toLowerCase()))
      : brands,
    [brands, brandQuery]
  );

  return (
    <aside className="w-[230px] shrink-0 sticky top-[72px] self-start max-h-[calc(100vh-80px)] overflow-y-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-2">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B1A2F" strokeWidth="2.5" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          <h2 className="text-[12px] font-black uppercase tracking-widest text-gray-900">Filters</h2>
          {totalActive > 0 && (
            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#8B1A2F] text-white text-[10px] flex items-center justify-center font-bold">
              {totalActive}
            </span>
          )}
        </div>
        {totalActive > 0 && (
          <button
            onClick={() => onChange({ genders: [], minPrice: '', maxPrice: '', brands: [], minDiscount: '' })}
            className="text-[11px] text-[#8B1A2F] hover:text-[#6d1424] font-semibold underline underline-offset-2"
          >
            Clear All
          </button>
        )}
      </div>

      {/* ── Active chips ── */}
      {totalActive > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {genders.map(g => (
            <button
              key={g}
              onClick={() => set('genders', genders.filter(x => x !== g))}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#8B1A2F] text-white text-[10px] font-semibold rounded-full hover:bg-[#6d1424] transition-colors"
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          ))}
          {selBrands.map(s => (
            <button
              key={s}
              onClick={() => set('brands', selBrands.filter(x => x !== s))}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#8B1A2F] text-white text-[10px] font-semibold rounded-full hover:bg-[#6d1424] transition-colors"
            >
              {s.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* ── Filter sections card ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden px-3">

        {/* Department */}
        {!hideDepartment && (
          <Section title="Department" badge={genderBadge} defaultOpen>
            <div className="space-y-0.5">
              {/* ALL — checked only when nothing else is selected */}
              <CheckRow
                label="All"
                isAll
                checked={isAllGenders}
                onChange={() => set('genders', [])}
              />
              {GENDERS.map(g => (
                <CheckRow
                  key={g}
                  label={g}
                  checked={genders.includes(g.toLowerCase())}
                  onChange={() => toggleGender(g)}
                />
              ))}
            </div>
          </Section>
        )}

        {/* Brand */}
        {brands.length > 0 && (
          <Section title="Brand" badge={brandBadge} defaultOpen>
            {brands.length > 5 && (
              <div className="flex items-center gap-1.5 mx-2 mb-2 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-200 focus-within:border-[#8B1A2F] focus-within:ring-1 focus-within:ring-[#8B1A2F]/20">
                <svg className="w-3 h-3 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  value={brandQuery}
                  onChange={e => setBrandQuery(e.target.value)}
                  placeholder="Search brands…"
                  className="flex-1 text-[12px] bg-transparent outline-none placeholder-gray-400"
                />
                {brandQuery && (
                  <button onClick={() => setBrandQuery('')} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
            )}
            <div className="space-y-0.5 max-h-52 overflow-y-auto">
              {!brandQuery && (
                <CheckRow
                  label="All"
                  isAll
                  checked={isAllBrands}
                  onChange={() => set('brands', [])}
                />
              )}
              {visibleBrands.length === 0 ? (
                <p className="text-[12px] text-gray-400 px-2 py-1">No brands found</p>
              ) : visibleBrands.map(b => (
                <CheckRow
                  key={b.id}
                  label={b.name}
                  checked={selBrands.includes(b.slug)}
                  onChange={() => toggleBrand(b.slug)}
                />
              ))}
            </div>
          </Section>
        )}

        {/* Price */}
        <Section title="Price" badge={priceBadge} defaultOpen>
          <div className="space-y-0.5 mb-2">
            <CheckRow
              label="All"
              isAll
              checked={!filters.minPrice && !filters.maxPrice}
              onChange={() => onChange({ ...filters, minPrice: '', maxPrice: '' })}
            />
            {PRICE_RANGES.map(r => (
              <CheckRow
                key={r.label}
                label={r.label}
                checked={selPrice?.label === r.label}
                onChange={() => handlePrice(r)}
              />
            ))}
          </div>
          <div className="flex gap-2 px-2 mt-1">
            <input
              type="number"
              placeholder="Min ₹"
              value={filters.minPrice || ''}
              onChange={e => set('minPrice', e.target.value)}
              className="w-full px-2 py-1.5 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:border-[#8B1A2F]"
            />
            <input
              type="number"
              placeholder="Max ₹"
              value={filters.maxPrice || ''}
              onChange={e => set('maxPrice', e.target.value)}
              className="w-full px-2 py-1.5 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:border-[#8B1A2F]"
            />
          </div>
        </Section>

        {/* Discount */}
        <Section title="Discount" badge={discountBadge}>
          <div className="space-y-0.5">
            <CheckRow
              label="All"
              isAll
              checked={!filters.minDiscount}
              onChange={() => set('minDiscount', '')}
            />
            {DISCOUNT_OPTIONS.map(d => (
              <CheckRow
                key={d.value}
                label={d.label}
                checked={filters.minDiscount === d.value}
                onChange={() => set('minDiscount', filters.minDiscount === d.value ? '' : d.value)}
              />
            ))}
          </div>
        </Section>

      </div>
    </aside>
  );
}
