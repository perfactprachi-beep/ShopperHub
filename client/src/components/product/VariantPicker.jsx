const COLOR_MAP = {
  white:  '#FFFFFF', black: '#111111', red:    '#DC2626',
  blue:   '#2563EB', navy: '#1E3A5F', green:  '#16A34A',
  yellow: '#EAB308', pink: '#EC4899', grey:   '#9CA3AF',
  gray:   '#9CA3AF', brown:'#92400E', beige:  '#D4C4A0',
  orange: '#F97316', purple:'#7C3AED',cream:  '#F5F0E8',
};

export default function VariantPicker({ variants = [], selected, onSelect }) {
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
              const swatch = COLOR_MAP[color.toLowerCase()] || '#E5E7EB';
              return (
                <button
                  key={color}
                  onClick={() => onSelect({ ...selected, color })}
                  title={color}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className={`w-9 h-9 rounded-full border-2 transition-all ${
                      isSelected ? 'border-[#8B1A2F] scale-110 shadow-md' : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{
                      backgroundColor: swatch,
                      boxShadow: color.toLowerCase() === 'white' ? 'inset 0 0 0 1px #E5E7EB' : undefined,
                    }}
                  />
                  <span className="text-[10px] text-gray-500 capitalize">{color}</span>
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
            <button className="text-xs text-[#8B1A2F] underline underline-offset-2 hover:no-underline">
              Size Guide
            </button>
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
