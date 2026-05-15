const OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'discount',   label: 'Best Discount' },
];

export default function SortBar({ value, onChange, total }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm text-[var(--color-muted)]">
        {total != null ? `${total} products` : ''}
      </p>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="text-sm border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-1.5 focus:outline-none focus:border-[var(--color-primary)]"
      >
        {OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
