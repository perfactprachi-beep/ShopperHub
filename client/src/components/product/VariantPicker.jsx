const COLOR_MAP = {
  white:  '#FFFFFF', black: '#111111', red:    '#DC2626',
  blue:   '#2563EB', navy: '#1E3A5F', green:  '#16A34A',
  yellow: '#EAB308', pink: '#EC4899', grey:   '#9CA3AF',
  gray:   '#9CA3AF', brown:'#92400E', beige:  '#D4C4A0',
  orange: '#F97316', purple:'#7C3AED', cream: '#F5F0E8',
  gold:   '#D4AF37', silver:'#C0C0C0', maroon:'#800000',
  teal:   '#0D9488', olive: '#6B7C43', tan:   '#D2B48C',
  khaki:  '#C3B091', coral: '#FF6B6B', cyan:  '#06B6D4',
  indigo: '#4F46E5', violet:'#7C3AED', rose:  '#F43F5E',
};

function swatchStyle(color) {
  const words = color.toLowerCase().split(/[\s/\-&+]+/).filter(Boolean);
  const hexes = words.map((w) => COLOR_MAP[w]).filter(Boolean);
  if (hexes.length === 0) return { backgroundColor: '#E5E7EB' };
  if (hexes.length === 1) return { backgroundColor: hexes[0] };
  return { background: `linear-gradient(135deg, ${hexes[0]} 50%, ${hexes[1]} 50%)` };
}

export default function VariantPicker({ variants = [], selected, onSelect, onSizeChart }) {
  const sizes  = [...new Set(variants.map((v) => v.size).filter(Boolean))];
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];

  return (
    <div className="space-y-5">
      {/* Color swatches */}
      {colors.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-3">
            Color:{' '}
            <span className="font-normal text-gray-600 capitalize">{selected?.color || ''}</span>
          </p>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => {
              const isSelected = selected?.color === color;
              const isWhite = color.toLowerCase() === 'white';
              return (
                <button
                  key={color}
                  onClick={() => onSelect({ ...selected, color })}
                  title={color}
                  className="flex flex-col items-center gap-1 group"
                >
                  {/* Outer ring — maroon when selected, transparent otherwise */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'ring-2 ring-[#8B1A2F] ring-offset-2'
                        : 'ring-1 ring-gray-200 ring-offset-1 group-hover:ring-gray-400'
                    }`}
                  >
                    {/* Inner swatch circle */}
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{
                        ...swatchStyle(color),
                        boxShadow: isWhite ? 'inset 0 0 0 1px #E5E7EB' : undefined,
                      }}
                    />
                  </div>
                  <span className={`text-[10px] capitalize transition-colors ${isSelected ? 'text-[#8B1A2F] font-semibold' : 'text-gray-500'}`}>
                    {color}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size chips */}
      {sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-800">
              Size:{' '}
              <span className="font-normal text-gray-600">{selected?.size || 'Select'}</span>
            </p>
            {onSizeChart && (
              <button
                onClick={onSizeChart}
                className="flex items-center gap-1 text-xs text-[#8B1A2F] underline underline-offset-2 hover:no-underline"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10H3M21 6H3M21 14H3M21 18H3"/></svg>
                Size Chart
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const inStock = variants.some((v) => v.size === size && v.stock > 0);
              const isSelected = selected?.size === size;
              return (
                <button
                  key={size}
                  disabled={!inStock}
                  onClick={() => onSelect({ ...selected, size })}
                  className={`min-w-[48px] h-[48px] px-3 text-sm border-2 font-medium transition-all ${
                    isSelected
                      ? 'border-[#8B1A2F] bg-[#8B1A2F] text-white'
                      : inStock
                      ? 'border-gray-200 text-gray-800 hover:border-[#8B1A2F] hover:text-[#8B1A2F]'
                      : 'border-gray-100 text-gray-300 line-through cursor-not-allowed'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
