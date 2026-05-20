import { useEffect, useState } from 'react';
import {
  getAdminPaymentMethods, createPaymentMethod,
  updatePaymentMethod, deletePaymentMethod,
} from '../../api/adminApi.js';
import { useToastStore } from '../../store/toastStore.js';
import DeleteModal from '../../components/admin/DeleteModal.jsx';
import SearchableSelect from '../../components/ui/SearchableSelect.jsx';

const ICON_OPTIONS = [
  { value: 'card',   label: 'Card / Online' },
  { value: 'cash',   label: 'Cash' },
  { value: 'upi',    label: 'UPI' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'bank',   label: 'Bank Transfer' },
];

const EMPTY = {
  name: '', code: '', description: '', icon_type: 'card',
  is_active: true, sort_order: 0,
};

function MethodModal({ method, onClose, onSaved }) {
  const [form, setForm] = useState(method ? { ...method } : { ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const { addToast } = useToastStore();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      setErr('Name and Code are required.');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      const payload = { ...form, sort_order: Number(form.sort_order) || 0 };
      const saved = method?.id
        ? await updatePaymentMethod(method.id, payload)
        : await createPaymentMethod(payload);
      addToast(method?.id ? 'Payment method updated' : 'Payment method added', 'success');
      onSaved(saved, !method?.id);
      onClose();
    } catch (e) {
      setErr(e.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold">
            {method?.id ? 'Edit Payment Method' : 'Add Payment Method'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {err && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{err}</p>}

          <div>
            <label className="label">Display Name *</label>
            <input name="name" value={form.name} onChange={handleChange}
              placeholder="e.g. Cash on Delivery" className="input" required maxLength={100} />
          </div>

          <div>
            <label className="label">Code (unique key) *</label>
            <input name="code" value={form.code} onChange={handleChange}
              placeholder="e.g. cod" className="input lowercase"
              disabled={!!method?.id} required maxLength={50} />
            {!method?.id && (
              <p className="text-[11px] text-gray-400 mt-1">
                Use <strong>razorpay</strong> to trigger the Razorpay gateway, <strong>cod</strong> for cash on delivery. Cannot be changed after creation.
              </p>
            )}
          </div>

          <div>
            <label className="label">Description</label>
            <input name="description" value={form.description} onChange={handleChange}
              placeholder="Short description shown to customers" className="input" maxLength={300} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Icon Type</label>
              <SearchableSelect
                value={form.icon_type}
                onChange={val => setForm(f => ({ ...f, icon_type: val || 'card' }))}
                options={ICON_OPTIONS}
                placeholder="— Select Icon —"
              />
            </div>
            <div>
              <label className="label">Sort Order</label>
              <input type="number" name="sort_order" value={form.sort_order}
                onChange={handleChange} min="0" className="input" />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" name="is_active" checked={form.is_active}
              onChange={handleChange} className="w-4 h-4 rounded accent-[#8B1A2F]" />
            <span className="text-sm text-gray-700">Active (visible to customers)</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 text-sm bg-[#8B1A2F] text-white rounded-lg font-medium hover:bg-[#6d1424] transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

const ICON_MAP = {
  card: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  cash: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="2" y="6" width="20" height="12" rx="2"/>
      <circle cx="12" cy="12" r="3"/>
      <path d="M6 12h.01M18 12h.01"/>
    </svg>
  ),
  upi: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  wallet: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/>
      <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><circle cx="18" cy="12" r="2"/>
    </svg>
  ),
  bank: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M3 22V9M21 22V9M12 2L2 9h20L12 2zM6 22V9M18 22V9M10 22V9M14 22V9"/>
    </svg>
  ),
};

export default function AdminPaymentMethods() {
  const [methods, setMethods]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);
  const [deleting, setDeleting]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { addToast } = useToastStore();

  useEffect(() => {
    getAdminPaymentMethods()
      .then(res => setMethods(res))
      .catch(() => addToast('Failed to load payment methods', 'error'))
      .finally(() => setLoading(false));
  }, []);

  function handleSaved(saved, isNew) {
    setMethods(prev =>
      isNew ? [...prev, saved] : prev.map(m => (m.id === saved.id ? saved : m))
    );
  }

  async function handleDelete() {
    setDeleting(deleteTarget.id);
    try {
      await deletePaymentMethod(deleteTarget.id);
      setMethods(prev => prev.filter(m => m.id !== deleteTarget.id));
      addToast('Payment method deleted', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally { setDeleting(null); setDeleteTarget(null); }
  }

  async function handleToggle(method) {
    try {
      const updated = await updatePaymentMethod(method.id, { is_active: !method.is_active });
      setMethods(prev => prev.map(m => (m.id === updated.id ? updated : m)));
      addToast(`Payment method ${updated.is_active ? 'activated' : 'deactivated'}`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage which payment options appear on the checkout page
          </p>
        </div>
        <button
          onClick={() => setModal({ method: undefined })}
          className="flex items-center gap-2 px-4 py-2 bg-[#8B1A2F] text-white text-sm font-medium rounded-lg hover:bg-[#6d1424] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Method
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-gray-400">Loading…</div>
      ) : methods.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 text-gray-400">
          No payment methods yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Method</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Code</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {methods.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                        {ICON_MAP[m.icon_type] || ICON_MAP.card}
                      </div>
                      <span className="font-medium text-gray-900">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {m.code}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 max-w-[220px] truncate">{m.description || '—'}</td>
                  <td className="px-5 py-4 text-gray-600">{m.sort_order}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleToggle(m)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                        m.is_active
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${m.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {m.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setModal({ method: m })}
                        className="text-xs text-[#8B1A2F] hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(m)}
                        disabled={deleting === m.id}
                        className="flex items-center gap-1 text-xs text-red-500 hover:underline font-medium disabled:opacity-40"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        {deleting === m.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <MethodModal
          method={modal.method}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
      <DeleteModal
        open={!!deleteTarget}
        title="Delete Payment Method"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
