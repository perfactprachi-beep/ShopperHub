const STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];

const STEP_LABELS = {
  pending:   'Order Placed',
  confirmed: 'Confirmed',
  shipped:   'Shipped',
  delivered: 'Delivered',
};

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function OrderStatusStepper({ status }) {
  const isCancelled = status === 'cancelled' || status === 'returned';
  const activeIdx = STEPS.indexOf(status);

  return (
    <div className="flex items-center gap-0 w-full">
      {STEPS.map((step, idx) => {
        const isPast   = activeIdx > idx;
        const isActive = activeIdx === idx && !isCancelled;
        const isFutureCancelled = isCancelled && idx > (isCancelled ? STEPS.indexOf('pending') : activeIdx);

        let circleClass = 'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ';
        if (isCancelled && idx <= activeIdx) {
          circleClass += 'bg-[var(--color-error)] border-[var(--color-error)] text-white';
        } else if (isPast) {
          circleClass += 'bg-green-500 border-green-500 text-white';
        } else if (isActive) {
          circleClass += 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white';
        } else {
          circleClass += 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-muted)]';
        }

        const lineActive = isPast && !isCancelled;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={circleClass}>
                {isCancelled && idx <= activeIdx ? <XIcon /> : isPast ? <CheckIcon /> : idx + 1}
              </div>
              <span className={`text-[10px] whitespace-nowrap ${isActive ? 'text-[var(--color-primary)] font-semibold' : isPast ? 'text-green-600' : 'text-[var(--color-muted)]'} ${isCancelled && idx <= activeIdx ? 'text-[var(--color-error)]' : ''}`}>
                {STEP_LABELS[step]}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 ${lineActive ? 'bg-green-500' : 'bg-[var(--color-border)]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
