export default function VariantPicker({ variants = [], selected, onSelect }) {
  const sizes  = [...new Set(variants.map(v => v.size).filter(Boolean))];
  const colors = [...new Set(variants.map(v => v.color).filter(Boolean))];

  return (
    <div className="space-y-4">
      {sizes.length > 0 && (
        <div>
          <p className="text-sm font-medium text-[var(--color-text)] mb-2">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map(size => {
              const inStock = variants.some(v => v.size === size && v.stock > 0);
              const isSelected = selected?.size === size;
              return (
                <button
                  key={size}
                  disabled={!inStock}
                  onClick={() => onSelect({ ...selected, size })}
                  className={`px-3 py-1.5 text-sm border rounded-[var(--radius-sm)] transition-colors ${
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium'
                      : inStock
                        ? 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
                        : 'border-[var(--color-border)] text-[var(--color-muted)] line-through cursor-not-allowed opacity-50'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <p className="text-sm font-medium text-[var(--color-text)] mb-2">Color</p>
          <div className="flex flex-wrap gap-2">
            {colors.map(color => {
              const isSelected = selected?.color === color;
              return (
                <button
                  key={color}
                  onClick={() => onSelect({ ...selected, color })}
                  className={`px-3 py-1.5 text-sm border rounded-[var(--radius-sm)] transition-colors capitalize ${
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium'
                      : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
