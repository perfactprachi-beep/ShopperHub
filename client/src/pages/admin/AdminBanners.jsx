import { useEffect, useRef, useState } from 'react';
import { getAdminBanners, createBanner, updateBanner, deleteBanner } from '../../api/adminApi.js';
import { assetUrl } from '../../utils/assetUrl.js';
import { useToastStore } from '../../store/toastStore.js';
import DeleteModal from '../../components/admin/DeleteModal.jsx';

const POSITIONS = ['hero', 'mid', 'bottom', 'men', 'women', 'kids', 'luxe'];
const EMPTY = { title: '', eyebrow: '', subtitle: '', link: '', position: 'hero', align: 'left', sort_order: 0, is_active: true };

function BannerModal({ banner, onClose, onSaved }) {
  const [form, setForm] = useState(banner ? { ...banner } : { ...EMPTY });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(banner?.image_url ? assetUrl(banner.image_url) : null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();
  const { addToast } = useToastStore();

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
      addToast(banner?.id ? 'Banner updated' : 'Banner added', 'success');
      onSaved(saved, !banner?.id);
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Save failed', 'error');
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
            <label className="label">Eyebrow <span className="text-gray-400 font-normal">(small text above title, e.g. "Luxe Watches")</span></label>
            <input name="eyebrow" value={form.eyebrow || ''} onChange={handleChange} placeholder="Luxe Watches" className="input" />
          </div>
          <div>
            <label className="label">Subtitle <span className="text-gray-400 font-normal">(brand names, e.g. "Tissot · Coach")</span></label>
            <input name="subtitle" value={form.subtitle || ''} onChange={handleChange} placeholder="Tissot · Michael Kors · Coach" className="input" />
          </div>
          <div>
            <label className="label">Link URL</label>
            <input name="link" value={form.link || ''} onChange={handleChange} placeholder="/category/women" className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Position</label>
              <div className="select-wrap">
                <select name="position" value={form.position} onChange={handleChange}>
                  {POSITIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Text Align <span className="text-gray-400 font-normal">(Luxe banner)</span></label>
              <div className="select-wrap">
                <select name="align" value={form.align || 'left'} onChange={handleChange}>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="label">Sort Order</label>
            <input type="number" name="sort_order" value={form.sort_order} onChange={handleChange} min="0" className="input" />
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { addToast } = useToastStore();

  const load = async () => {
    setLoading(true);
    try { setBanners(await getAdminBanners()); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    try {
      await deleteBanner(deleteTarget.id);
      setBanners(bs => bs.filter(b => b.id !== deleteTarget.id));
      addToast('Banner deleted', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally { setDeleteTarget(null); }
  };

  const handleSaved = (saved, isNew) => {
    if (isNew) setBanners(bs => [...bs, saved]);
    else setBanners(bs => bs.map(b => b.id === saved.id ? saved : b));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-600">
            <span className="font-bold text-gray-800">{banners.length}</span> banners
          </span>
        </div>
        <button onClick={() => setModal(null)} className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Banner
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Preview</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Position</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Sort</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Active</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : banners.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-300">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
                    <p className="text-sm text-gray-400">No banners yet</p>
                  </div>
                </td></tr>
              ) : banners.map(b => (
                <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
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
        <BannerModal banner={modal} onClose={() => setModal(undefined)} onSaved={handleSaved} />
      )}
      <DeleteModal
        open={!!deleteTarget}
        title="Delete Banner"
        description={`Are you sure you want to delete "${deleteTarget?.title || 'this banner'}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
