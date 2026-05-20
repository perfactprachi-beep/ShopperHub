import { useEffect, useMemo, useState } from 'react';
import { getAdminOffers, createOffer, updateOffer, deleteOffer, getAdminCategories } from '../../api/adminApi.js';
import { useToastStore } from '../../store/toastStore.js';
import DeleteModal from '../../components/admin/DeleteModal.jsx';
import SearchableSelect from '../../components/ui/SearchableSelect.jsx';

const EMPTY = {
  title: '', description: '', code: '', image_url: '', is_active: true, sort_order: 0,
  expires_at: '', category_id: '',
};

function IconEdit() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}
function IconTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}

function OfferModal({ offer, onClose, onSaved }) {
  const initParentId = (cat_id, cats) => {
    if (!cat_id) return '';
    const cat = cats.find(c => c.id === Number(cat_id));
    if (!cat) return '';
    return cat.parent_id ? String(cat.parent_id) : String(cat.id);
  };

  const [form, setForm] = useState(offer ? {
    ...offer,
    code:      offer.code      ?? '',
    image_url: offer.image_url ?? '',
    expires_at: offer.expires_at ? offer.expires_at.slice(0, 10) : '',
    category_id: offer.category_id ?? '',
  } : { ...EMPTY });
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const { addToast }            = useToastStore();
  const [categories, setCategories] = useState([]);
  const [parentId, setParentId] = useState(''); // tracks selected parent independently

  useEffect(() => {
    getAdminCategories().then(cats => {
      setCategories(cats);
      // restore parent selection when editing an existing offer
      if (offer?.category_id) {
        setParentId(initParentId(offer.category_id, cats));
      }
    }).catch(() => {});
  }, []);

  const parentCategories = useMemo(
    () => categories.filter(c => !c.parent_id),
    [categories]
  );

  const subCategories = useMemo(
    () => categories.filter(c => c.parent_id && String(c.parent_id) === parentId),
    [categories, parentId]
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleParentChange = (pid) => {
    setParentId(pid);
    const hasSubs = categories.some(c => c.parent_id && String(c.parent_id) === pid);
    setForm(f => ({ ...f, category_id: pid && !hasSubs ? pid : '' }));
  };

  const handleSubChange = (val) => {
    setForm(f => ({ ...f, category_id: val }));
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
        category_id: form.category_id ? Number(form.category_id) : null,
      };
      const saved = offer?.id
        ? await updateOffer(offer.id, payload)
        : await createOffer(payload);
      addToast(offer?.id ? 'Offer updated' : 'Offer created', 'success');
      onSaved(saved, !offer?.id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const sel = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2F] bg-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-gray-900">
            {offer?.id ? 'Edit Offer' : 'Add Offer'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
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
              required maxLength={200}
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
              maxLength={1000}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Coupon Code
              <span className="text-gray-400 font-normal ml-1">(optional — shown with copy button)</span>
            </label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="e.g. NEW10"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2F] uppercase tracking-widest"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Offer Image / Logo URL
              <span className="text-gray-400 font-normal ml-1">(optional — bank logo, card icon, etc.)</span>
            </label>
            <input
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              placeholder="https://example.com/hdfc-logo.png"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A2F]"
            />
            {form.image_url && (
              <div className="mt-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={form.image_url}
                    alt="preview"
                    className="w-full h-full object-contain p-1"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <span className="text-[11px] text-gray-400">Image preview</span>
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Category
              <span className="text-gray-400 font-normal ml-1">(optional — blank = all products)</span>
            </label>
            <SearchableSelect
              value={parentId}
              onChange={handleParentChange}
              options={parentCategories.map(c => ({ value: String(c.id), label: c.name }))}
              placeholder="All Categories"
            />
          </div>

          {/* Subcategory — always rendered when a parent is chosen */}
          {parentId && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Subcategory</label>
              {subCategories.length > 0 ? (
                <SearchableSelect
                  value={String(form.category_id || '')}
                  onChange={handleSubChange}
                  options={subCategories.map(c => ({ value: String(c.id), label: c.name }))}
                  placeholder="All subcategories of this category"
                />
              ) : (
                <p className="text-xs text-gray-400 py-2 px-3 border border-gray-100 rounded-lg bg-gray-50">
                  No subcategories — offer will apply to the whole category.
                </p>
              )}
            </div>
          )}

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
                min={new Date().toISOString().slice(0, 10)}
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

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
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
  const [offers, setOffers]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);
  const [deleting, setDeleting]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { addToast } = useToastStore();

  const load = () => {
    setLoading(true);
    getAdminOffers()
      .then(res => setOffers(res))
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

  const handleDelete = async () => {
    setDeleting(deleteTarget.id);
    try {
      await deleteOffer(deleteTarget.id);
      setOffers(prev => prev.filter(o => o.id !== deleteTarget.id));
      addToast('Offer deleted', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally { setDeleting(null); setDeleteTarget(null); }
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
                <th className="px-5 py-3 w-14" />
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expires</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {offers.map(offer => (
                <tr key={offer.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="w-10 h-10 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                      {offer.image_url ? (
                        <img src={offer.image_url} alt="" className="w-full h-full object-contain p-1" onError={(e) => { e.target.style.display='none'; }} />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-900 max-w-[200px]">
                    {offer.title}
                  </td>
                  <td className="px-5 py-4">
                    {offer.code ? (
                      <span className="inline-block border border-dashed border-[#2E7D32] bg-[#F1F8F1] text-[#2E7D32] text-[11px] font-bold tracking-widest px-2.5 py-1 rounded">
                        {offer.code}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-500 max-w-[280px]">
                    <span className="line-clamp-2 text-xs">{offer.description || '—'}</span>
                  </td>
                  <td className="px-5 py-4">
                    {offer.category_name ? (
                      <div className="inline-flex flex-col gap-1 text-xs">
                        {offer.parent_name && (
                          <div className="flex items-center gap-1">
                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded">
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>
                              {offer.parent_name}
                            </span>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                          </div>
                        )}
                        <span className="inline-flex items-center gap-1 bg-[#8B1A2F]/10 text-[#8B1A2F] font-semibold px-2 py-0.5 rounded">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                          {offer.category_name}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-400 font-medium px-2.5 py-0.5 rounded-full">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        All Products
                      </span>
                    )}
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
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setModal(offer)}
                        title="Edit"
                        className="p-2 rounded-lg text-gray-400 hover:text-[#8B1A2F] hover:bg-red-50 transition-colors"
                      >
                        <IconEdit />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(offer)}
                        disabled={deleting === offer.id}
                        title="Delete"
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                      >
                        {deleting === offer.id
                          ? <span className="text-xs">…</span>
                          : <IconTrash />}
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
      <DeleteModal
        open={!!deleteTarget}
        title="Delete Offer"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
