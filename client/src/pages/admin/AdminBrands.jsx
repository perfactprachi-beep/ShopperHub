import { useEffect, useRef, useState } from 'react';
import { getAdminBrands, createBrand, updateBrand, deleteBrand } from '../../api/adminApi.js';
import { assetUrl } from '../../utils/assetUrl.js';
import { useToastStore } from '../../store/toastStore.js';
import DeleteModal from '../../components/admin/DeleteModal.jsx';

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const EMPTY = { name: '', slug: '', logo_url: '', description: '' };

function BrandLogo({ url, name, size = 'md' }) {
  const [err, setErr] = useState(false);
  const cls = size === 'sm' ? 'w-10 h-10 text-xs' : 'w-16 h-16 text-sm';
  if (url && !err) {
    return (
      <img
        src={assetUrl(url) || url}
        alt={name}
        onError={() => setErr(true)}
        className={`${size === 'sm' ? 'w-10 h-10' : 'w-16 h-16'} object-contain rounded-lg bg-gray-50 p-1`}
      />
    );
  }
  return (
    <div className={`${cls} rounded-lg bg-[#8B1A2F]/10 flex items-center justify-center font-bold text-[#8B1A2F]`}>
      {name?.slice(0, 2).toUpperCase() || '?'}
    </div>
  );
}

function BrandModal({ brand, onClose, onSaved }) {
  const [form, setForm] = useState(brand ? { ...brand } : { ...EMPTY });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(brand?.logo_url ? (assetUrl(brand.logo_url) || brand.logo_url) : null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();
  const { addToast } = useToastStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: value,
      ...(name === 'name' && !brand ? { slug: slugify(value) } : {}),
    }));
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setForm(prev => ({ ...prev, logo_url: '' }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let saved;
      if (file) {
        const fd = new FormData();
        fd.append('image', file);
        Object.entries(form).forEach(([k, v]) => v != null && fd.append(k, v));
        saved = brand?.id ? await updateBrand(brand.id, fd) : await createBrand(fd);
      } else {
        saved = brand?.id ? await updateBrand(brand.id, form) : await createBrand(form);
      }
      addToast(brand?.id ? 'Brand updated' : 'Brand added', 'success');
      onSaved(saved, !brand?.id);
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Save failed', 'error');
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
          {/* Logo upload */}
          <div>
            <label className="label">Logo</label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => fileRef.current?.click()}
                className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer hover:border-[#8B1A2F] transition-colors flex items-center justify-center bg-gray-50"
              >
                {preview
                  ? <img src={preview} alt="" className="w-full h-full object-contain p-1" />
                  : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
                }
              </div>
              <div className="flex-1">
                <button onClick={() => fileRef.current?.click()} className="text-sm text-[#8B1A2F] hover:underline font-medium">
                  Upload logo image
                </button>
                <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, SVG — or paste URL below</p>
                <input
                  name="logo_url"
                  value={form.logo_url || ''}
                  onChange={e => { handleChange(e); setFile(null); setPreview(e.target.value || null); }}
                  placeholder="https://…"
                  className="input mt-2 text-xs"
                />
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>
          <div>
            <label className="label">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="label">Slug</label>
            <input name="slug" value={form.slug} onChange={handleChange} className="input font-mono text-sm" />
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { addToast } = useToastStore();

  const load = async () => {
    setLoading(true);
    try { setBrands(await getAdminBrands()); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    try {
      await deleteBrand(deleteTarget.id);
      setBrands(bs => bs.filter(b => b.id !== deleteTarget.id));
      addToast('Brand deleted', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally { setDeleteTarget(null); }
  };

  const handleSaved = (saved, isNew) => {
    if (isNew) setBrands(bs => [...bs, saved]);
    else setBrands(bs => bs.map(b => b.id === saved.id ? saved : b));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-600">
            <span className="font-bold text-gray-800">{brands.length}</span> brands
          </span>
        </div>
        <button onClick={() => setModal(null)} className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Brand
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Logo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>{[...Array(5)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : brands.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-300">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                    <p className="text-sm text-gray-400">No brands yet</p>
                  </div>
                </td></tr>
              ) : brands.map(b => (
                <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <BrandLogo url={b.logo_url} name={b.name} size="sm" />
                  </td>
                  <td className="px-4 py-3 font-medium">{b.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.slug}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{b.description || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setModal(b)} title="Edit" className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => setDeleteTarget(b)} title="Delete" className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
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
      <DeleteModal
        open={!!deleteTarget}
        title="Delete Brand"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
