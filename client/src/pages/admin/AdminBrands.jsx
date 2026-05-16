import { useEffect, useState } from 'react';
import { getAdminBrands, createBrand, updateBrand, deleteBrand } from '../../api/adminApi.js';

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const EMPTY = { name: '', slug: '', logo_url: '', description: '' };

function BrandModal({ brand, onClose, onSaved }) {
  const [form, setForm] = useState(brand ? { ...brand } : { ...EMPTY });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: value,
      ...(name === 'name' && !brand ? { slug: slugify(value) } : {}),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = brand?.id ? await updateBrand(brand.id, form) : await createBrand(form);
      onSaved(saved, !brand?.id);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold">{brand?.id ? 'Edit Brand' : 'Add Brand'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="label">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="label">Slug</label>
            <input name="slug" value={form.slug} onChange={handleChange} className="input font-mono text-sm" />
          </div>
          <div>
            <label className="label">Logo URL</label>
            <input name="logo_url" value={form.logo_url || ''} onChange={handleChange} placeholder="https://…" className="input" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea name="description" value={form.description || ''} onChange={handleChange} rows={3} className="input resize-none" />
          </div>
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

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(undefined);

  const load = async () => {
    setLoading(true);
    try { setBrands(await getAdminBrands()); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this brand?')) return;
    await deleteBrand(id);
    setBrands(bs => bs.filter(b => b.id !== id));
  };

  const handleSaved = (saved, isNew) => {
    if (isNew) setBrands(bs => [...bs, saved]);
    else setBrands(bs => bs.map(b => b.id === saved.id ? saved : b));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setModal(null)} className="btn-primary px-4 py-2 text-sm">+ Add Brand</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Logo</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>{[...Array(5)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : brands.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No brands yet.</td></tr>
              ) : brands.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {b.logo_url
                      ? <img src={b.logo_url} alt="" className="w-10 h-10 object-contain rounded" />
                      : <div className="w-10 h-10 bg-gray-100 rounded" />
                    }
                  </td>
                  <td className="px-4 py-3 font-medium">{b.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.slug}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{b.description || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => setModal(b)} className="text-blue-600 text-xs hover:underline">Edit</button>
                      <button onClick={() => handleDelete(b.id)} className="text-red-500 text-xs hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal !== undefined && (
        <BrandModal brand={modal} onClose={() => setModal(undefined)} onSaved={handleSaved} />
      )}
    </div>
  );
}
