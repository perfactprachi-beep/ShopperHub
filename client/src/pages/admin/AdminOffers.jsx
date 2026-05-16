import { useEffect, useState } from 'react';
import { getAdminOffers, createOffer, updateOffer, deleteOffer } from '../../api/adminApi.js';

const EMPTY = {
  title: '', description: '', is_active: true, sort_order: 0, expires_at: '',
};

function OfferModal({ offer, onClose, onSaved }) {
  const [form, setForm] = useState(offer ? {
    ...offer,
    expires_at: offer.expires_at ? offer.expires_at.slice(0, 10) : '',
  } : { ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        sort_order: parseInt(form.sort_order, 10) || 0,
        expires_at: form.expires_at || null,
      };
      const saved = offer?.id
        ? await updateOffer(offer.id, payload)
        : await createOffer(payload);
      onSaved(saved, !offer?.id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {offer?.id ? 'Edit Offer' : 'Add Offer'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. 10% Off For First-Time Users"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2F]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="e.g. On orders above ₹3,000. Use code NEW10 at checkout."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2F] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sort Order</label>
              <input
                type="number"
                name="sort_order"
                value={form.sort_order}
                onChange={handleChange}
                min={0}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2F]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Expires On</label>
              <input
                type="date"
                name="expires_at"
                value={form.expires_at}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2F]"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              className="w-4 h-4 accent-[#8B1A2F]"
            />
            <span className="text-sm text-gray-700">Active (visible on site)</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-[#8B1A2F] text-white text-sm font-semibold rounded-lg hover:bg-[#6d1424] disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save Offer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminOffers() {
  const [offers, setOffers]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null); // null | 'new' | offer object
  const [deleting, setDeleting] = useState(null);

  const load = () => {
    setLoading(true);
    getAdminOffers()
      .then(setOffers)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSaved = (saved, isNew) => {
    if (isNew) {
      setOffers(prev => [saved, ...prev]);
    } else {
      setOffers(prev => prev.map(o => o.id === saved.id ? saved : o));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this offer?')) return;
    setDeleting(id);
    try {
      await deleteOffer(id);
      setOffers(prev => prev.filter(o => o.id !== id));
    } catch { alert('Delete failed'); }
    finally { setDeleting(null); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Product Page Offers</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            These appear in the "Best Offers" section on every product detail page.
          </p>
        </div>
        <button
          onClick={() => setModal('new')}
          className="px-4 py-2 bg-[#8B1A2F] text-white text-sm font-semibold rounded-lg hover:bg-[#6d1424] transition-colors flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Add Offer
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400 py-10 text-center">Loading…</div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <p className="text-3xl mb-3">🏷</p>
          <p className="text-sm font-medium text-gray-700">No offers yet</p>
          <p className="text-xs text-gray-400 mt-1">Add offers that will display on product pages</p>
          <button
            onClick={() => setModal('new')}
            className="mt-4 px-4 py-2 bg-[#8B1A2F] text-white text-sm font-semibold rounded-lg hover:bg-[#6d1424] transition-colors"
          >
            Add First Offer
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expires</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {offers.map(offer => (
                <tr key={offer.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900 max-w-[200px]">
                    {offer.title}
                  </td>
                  <td className="px-5 py-4 text-gray-500 max-w-[280px]">
                    <span className="line-clamp-2 text-xs">{offer.description || '—'}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                    {offer.expires_at
                      ? new Date(offer.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : <span className="text-gray-300">No expiry</span>}
                  </td>
                  <td className="px-5 py-4 text-gray-500">{offer.sort_order}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      offer.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${offer.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {offer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 justify-end">
                      <button
                        onClick={() => setModal(offer)}
                        className="text-xs text-gray-500 hover:text-gray-900 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(offer.id)}
                        disabled={deleting === offer.id}
                        className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                      >
                        {deleting === offer.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <OfferModal
          offer={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
