import { useEffect, useState } from 'react';
import { getAdminCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../api/adminApi.js';

const EMPTY = {
  code: '', type: 'flat', value: '', min_order: 0,
  max_uses: '', expires_at: '', is_active: true,
};

function CouponModal({ coupon, onClose, onSaved }) {
  const [form, setForm] = useState(coupon ? {
    ...coupon,
    expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 10) : '',
  } : { ...EMPTY });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        value: parseFloat(form.value),
        min_order: parseFloat(form.min_order) || 0,
        max_uses: form.max_uses ? parseInt(form.max_uses, 10) : null,
        expires_at: form.expires_at || null,
      };
      const saved = coupon?.id ? await updateCoupon(coupon.id, payload) : await createCoupon(payload);
      onSaved(saved, !coupon?.id);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold">{coupon?.id ? 'Edit Coupon' : 'Add Coupon'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="label">Code</label>
            <input name="code" value={form.code} onChange={handleChange} placeholder="SAVE20" className="input uppercase" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select name="type" value={form.type} onChange={handleChange} className="input">
                <option value="flat">Flat (₹)</option>
                <option value="percent">Percent (%)</option>
              </select>
            </div>
            <div>
              <label className="label">Value</label>
              <input type="number" name="value" value={form.value} onChange={handleChange} min="0" className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Min Order (₹)</label>
              <input type="number" name="min_order" value={form.min_order} onChange={handleChange} min="0" className="input" />
            </div>
            <div>
              <label className="label">Max Uses</label>
              <input type="number" name="max_uses" value={form.max_uses} onChange={handleChange} min="1" placeholder="Unlimited" className="input" />
            </div>
          </div>
          <div>
            <label className="label">Expires At</label>
            <input type="date" name="expires_at" value={form.expires_at} onChange={handleChange} className="input" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 accent-[#8B1A2F]" />
            <span className="text-sm">Active</span>
          </label>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary px-5 py-2 text-sm">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(undefined);

  const load = async () => {
    setLoading(true);
    try { setCoupons(await getAdminCoupons()); }
    catch { setCoupons([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await deleteCoupon(id);
      setCoupons(cs => cs.filter(c => c.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSaved = (saved, isNew) => {
    if (isNew) setCoupons(cs => [saved, ...cs]);
    else setCoupons(cs => cs.map(c => c.id === saved.id ? saved : c));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setModal(null)} className="btn-primary px-4 py-2 text-sm">+ Add Coupon</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-right">Value</th>
                <th className="px-4 py-3 text-right">Min Order</th>
                <th className="px-4 py-3 text-right">Usage</th>
                <th className="px-4 py-3 text-left">Expiry</th>
                <th className="px-4 py-3 text-left">Active</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>{[...Array(8)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : coupons.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No coupons yet.</td></tr>
              ) : coupons.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-bold text-[#8B1A2F]">{c.code}</td>
                  <td className="px-4 py-3 capitalize">{c.type}</td>
                  <td className="px-4 py-3 text-right">{c.type === 'flat' ? `₹${c.value}` : `${c.value}%`}</td>
                  <td className="px-4 py-3 text-right">₹{c.min_order}</td>
                  <td className="px-4 py-3 text-right">{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ''}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.is_active ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => setModal(c)} className="text-blue-600 text-xs hover:underline">Edit</button>
                      <button onClick={() => handleDelete(c.id)} className="text-red-500 text-xs hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal !== undefined && (
        <CouponModal coupon={modal} onClose={() => setModal(undefined)} onSaved={handleSaved} />
      )}
    </div>
  );
}
