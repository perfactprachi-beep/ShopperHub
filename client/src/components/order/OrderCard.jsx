import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped:   'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  returned:  'bg-gray-100 text-gray-600',
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatPrice(n) {
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

export default function OrderCard({ order }) {
  const [first, ...rest] = order.items ?? [];
  const statusClass = STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600';

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 flex gap-4 hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="w-20 h-20 shrink-0 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--color-bg)]">
        {first?.image ? (
          <img src={first.image} alt={first.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)] text-xs">No img</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p className="font-medium text-sm text-[var(--color-text)] truncate">{first?.title}</p>
            {rest.length > 0 && (
              <p className="text-xs text-[var(--color-muted)] mt-0.5">+{rest.length} more item{rest.length > 1 ? 's' : ''}</p>
            )}
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 ${statusClass}`}>
            {order.status}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-muted)]">
          <span>Order #{order.id}</span>
          <span>{formatDate(order.created_at)}</span>
          <span className="font-semibold text-[var(--color-text)]">{formatPrice(order.total)}</span>
        </div>
      </div>

      {/* CTA */}
      <div className="shrink-0 flex items-center">
        <Link
          to={`/orders/${order.id}`}
          className="text-xs font-medium text-[var(--color-primary)] hover:underline whitespace-nowrap"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}
