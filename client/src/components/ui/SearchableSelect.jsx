import { useEffect, useRef, useState } from 'react';

/**
 * SearchableSelect — a drop-in replacement for <select> with a live search box.
 *
 * Props:
 *   value        – current selected value (string/number)
 *   onChange     – (value) => void
 *   options      – [{ value, label, indent? }]
 *   placeholder  – text shown when nothing is selected
 *   disabled     – boolean
 *   className    – extra class on the trigger button
 */
export default function SearchableSelect({
  value, onChange, options = [], placeholder = '— Select —', disabled = false, className = '',
}) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const containerRef          = useRef();
  const inputRef              = useRef();

  const selected = options.find(o => String(o.value) === String(value));

  const filtered = query.trim()
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); }
    else       { setQuery(''); }
  }, [open]);

  // close on outside click
  useEffect(() => {
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (val) => { onChange(val); setOpen(false); };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm border rounded-lg bg-white transition-colors
          ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:border-[#8B1A2F]'}
          ${open ? 'border-[#8B1A2F] ring-2 ring-[#8B1A2F]/20' : 'border-gray-200'}
        `}
      >
        <span className={selected ? 'text-gray-900 truncate' : 'text-gray-400 truncate'}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* Search box */}
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-200 focus-within:border-[#8B1A2F] focus-within:ring-1 focus-within:ring-[#8B1A2F]/20">
              <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search…"
                className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <ul className="max-h-52 overflow-y-auto py-1">
            {/* Clear option */}
            <li>
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-50 transition-colors ${!value ? 'bg-gray-50 font-medium' : ''}`}
              >
                {placeholder}
              </button>
            </li>

            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-gray-400">No results found</li>
            ) : filtered.map(o => (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(o.value)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-[#8B1A2F]/5 hover:text-[#8B1A2F]
                    ${String(o.value) === String(value) ? 'bg-[#8B1A2F]/8 text-[#8B1A2F] font-medium' : 'text-gray-700'}
                    ${o.indent ? 'pl-7' : ''}
                  `}
                >
                  {o.indent && <span className="text-gray-300 mr-1">↳</span>}
                  {o.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
