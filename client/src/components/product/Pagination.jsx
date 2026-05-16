export default function Pagination({ page, total, limit, onChange }) {
  const totalPages = Math.ceil((total || 0) / (limit || 20));
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        pages.push(i);
      } else if (i === page - delta - 1 || i === page + delta + 1) {
        pages.push('...');
      }
    }
    return pages;
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const go = (p) => { onChange(p); scrollTop(); };

  return (
    <div className="flex items-center justify-center gap-1 mt-12 mb-4">
      {/* Prev */}
      <button
        onClick={() => go(page - 1)}
        disabled={page === 1}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded hover:border-[#8B1A2F] hover:text-[#8B1A2F] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        Prev
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`dot-${i}`} className="px-2 py-2 text-sm text-gray-400 select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => go(p)}
              className={`min-w-[38px] h-[38px] text-sm font-medium rounded transition-colors border ${
                p === page
                  ? 'bg-[#8B1A2F] text-white border-[#8B1A2F]'
                  : 'text-gray-700 border-gray-200 hover:border-[#8B1A2F] hover:text-[#8B1A2F]'
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      {/* Next */}
      <button
        onClick={() => go(page + 1)}
        disabled={page === totalPages}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded hover:border-[#8B1A2F] hover:text-[#8B1A2F] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-colors"
      >
        Next
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  );
}
