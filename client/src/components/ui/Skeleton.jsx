export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 rounded-[var(--radius-sm)] ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-md)] overflow-hidden shadow-[var(--shadow-card)]">
      <Skeleton className="w-full h-64" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
