const SIZE_CLS = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-4',
  lg: 'w-12 h-12 border-4',
};

export default function Spinner({ size = 'md' }) {
  const cls = typeof size === 'string' ? (SIZE_CLS[size] ?? SIZE_CLS.md) : `w-${size} h-${size} border-4`;
  return (
    <div className={`${cls} border-[var(--color-primary)] border-t-transparent rounded-full animate-spin`} />
  );
}
