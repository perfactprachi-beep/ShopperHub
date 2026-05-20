import { useState, useEffect, useRef } from 'react';

export default function FilterDropdown({ value, onChange, onClear, placeholder, options, disabled = false, searchable = false }) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const ref      = useRef(null);
  const inputRef = useRef(null);
  const active = Boolean(value) && !disabled;
  const label  = active ? options.find(o => String(o.value) === String(value))?.label : null;

  const listOptions = options.slice(1); // skip the "All" placeholder option
  const filtered = searchable && query.trim()
    ? listOptions.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : listOptions;

  useEffect(() => {
    const h = e => { if (!ref.current?.contains(e.target)) { setOpen(false); setQuery(''); } };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (open && searchable) setTimeout(() => inputRef.current?.focus(), 50);
    if (!open) setQuery('');
  }, [open, searchable]);

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50 text-xs font-medium text-gray-300 cursor-not-allowed opacity-50"
      >
        <span>{placeholder}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      {active ? (
        <div className="flex items-center gap-0 rounded-md border border-[#8B1A2F]/40 bg-[#8B1A2F]/5 overflow-hidden">
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 text-xs font-medium text-[#8B1A2F] max-w-[140px]"
          >
            <span className="truncate">{label}</span>
          </button>
          <button
            type="button"
            onClick={() => { onClear(); setOpen(false); }}
            className="pr-2 pl-0.5 py-1.5 text-[#8B1A2F]/60 hover:text-[#8B1A2F] transition-colors border-l border-[#8B1A2F]/20"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300 text-xs font-medium text-gray-500 transition-all"
        >
          <span>{placeholder}</span>
          <svg className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      )}

      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-30 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[200px] overflow-hidden">
          {/* Search box — only when searchable */}
          {searchable && (
            <div className="p-2 border-b border-gray-100">
              <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-200 focus-within:border-[#8B1A2F] focus-within:ring-1 focus-within:ring-[#8B1A2F]/20">
                <svg className="w-3 h-3 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search…"
                  className="flex-1 text-xs bg-transparent outline-none placeholder-gray-400"
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto overscroll-contain py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-xs text-gray-400 text-center">No results found</p>
            ) : filtered.map(opt => (
              <button
                key={opt.value ?? '__all__'}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); setQuery(''); }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  String(value) === String(opt.value)
                    ? 'bg-[#8B1A2F]/8 text-[#8B1A2F] font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
