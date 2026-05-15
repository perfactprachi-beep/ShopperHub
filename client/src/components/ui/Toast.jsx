import { useToastStore } from '../../store/toastStore.js';

const CONFIG = {
  success: { icon: '✓', cls: 'bg-green-50 border-green-400 text-green-800' },
  error:   { icon: '✕', cls: 'bg-red-50 border-red-400 text-red-800' },
  warning: { icon: '⚠', cls: 'bg-amber-50 border-amber-400 text-amber-800' },
  info:    { icon: 'ℹ', cls: 'bg-blue-50 border-blue-400 text-blue-800' },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-80 pointer-events-none">
      {toasts.map((t) => {
        const { icon, cls } = CONFIG[t.type] ?? CONFIG.info;
        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-[var(--radius-md)] border shadow-md text-sm pointer-events-auto ${cls}`}
          >
            <span className="font-bold shrink-0 mt-0.5">{icon}</span>
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 opacity-60 hover:opacity-100 leading-none"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
