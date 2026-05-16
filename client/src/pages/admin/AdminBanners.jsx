import { useEffect, useRef, useState } from 'react';
import { getAdminBanners, createBanner, updateBanner, deleteBanner } from '../../api/adminApi.js';
import { assetUrl } from '../../utils/assetUrl.js';

const POSITIONS = ['hero', 'mid', 'bottom'];
const EMPTY = { title: '', link: '', position: 'hero', sort_order: 0, is_active: true };

function BannerModal({ banner, onClose, onSaved }) {
  const [form, setForm] = useState(banner ? { ...banner } : { ...EMPTY });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(banner?.image_url ? assetUrl(banner.image_url) : null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let saved;
      if (file) {
        const fd = new FormData();
        fd.append('image', file);
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        saved = banner?.id ? await updateBanner(banner.id, fd) : await createBanner(fd);
      } else {
        saved = banner?.id ? await updateBanner(banner.id, form) : await createBanner(form);
      }
      onSaved(saved, !banner?.id);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold">{banner?.id ? 'Edit Banner' : 'Add Banner'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="px-6 py-4 space-y-4">
          {/* Image */}
          <div>
            <label className="label">Image</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:border-[#8B1A2F] transition-colors relative"
            >
              {preview
                ? <img src={preview} alt="" className="w-full h-full object-cover" />
                : <div className="flex items-center justify-center h-full text-gray-400 text-sm">Click to upload image</div>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>
          <div>
            <label className="label">Title</label>
            <input name="title" value={form.title || ''} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="label">Link URL</label>
            <input name="link" value={form.link || ''} onChange={handleChange} placeholder="/category/women" className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Position</label>
              <select name="position" value={form.position} onChange={handleChange} className="input">
                {POSITIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Sort Order</label>
              <input type="number" name="sort_order" value={form.sort_order} onChange={handleChange} min="0" className="input" />
            </div>
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

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(undefined);

  const load = async () => {
    setLoading(true);
    try { setBanners(await getAdminBanners()); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return;
    await deleteBanner(id);
    setBanners(bs => bs.filter(b => b.id !== id));
  };

  const handleSaved = (saved, isNew) => {
    if (isNew) setBanners(bs => [...bs, saved]);
    else setBanners(bs => bs.map(b => b.id === saved.id ? saved : b));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setModal(null)} className="btn-primary px-4 py-2 text-sm">+ Add Banner</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Preview</th>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Position</th>
                <th className="px-4 py-3 text-right">Sort</th>
                <th className="px-4 py-3 text-left">Active</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : banners.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No banners yet.</td></tr>
              ) : banners.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {b.image_url
                      ? <img src={assetUrl(b.image_url)} alt="" className="w-20 h-12 object-cover rounded-lg" />
                      : <div className="w-20 h-12 bg-gray-100 rounded-lg" />
                    }
                  </td>
                  <td className="px-4 py-3 font-medium">{b.title || '—'}</td>
                  <td className="px-4 py-3 capitalize">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{b.position}</span>
                  </td>
                  <td className="px-4 py-3 text-right">{b.sort_order}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {b.is_active ? 'Yes' : 'No'}
                    </span>
                  </td>
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
        <BannerModal banner={modal} onClose={() => setModal(undefined)} onSaved={handleSaved} />
      )}
    </div>
  );
}
