import { useEffect, useRef, useState } from 'react';
import api from '../../api/axios.js';
import { useToastStore } from '../../store/toastStore.js';
import DeleteModal from '../../components/admin/DeleteModal.jsx';

/* ── helpers ─────────────────────────────────────────────────────────────── */
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const EMPTY = {
  title: '', slug: '', excerpt: '', content: '',
  meta_title: '', meta_description: '', status: 'published',
};

/* ── Page modal ──────────────────────────────────────────────────────────── */
function PageModal({ page, onClose, onSaved }) {
  const [form, setForm] = useState(page ? { ...page } : { ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [slugManual, setSlugManual] = useState(!!page);
  const titleRef = useRef(null);
  const { addToast } = useToastStore();

  useEffect(() => { titleRef.current?.focus(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleTitle = (v) => {
    set('title', v);
    if (!slugManual) set('slug', slugify(v));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) return;
    setSaving(true);
    try {
      const { data } = page?.id
        ? await api.put(`/admin/pages/${page.id}`, form)
        : await api.post('/admin/pages', form);
      addToast(page?.id ? 'Page updated' : 'Page created', 'success');
      onSaved(data.data, !page?.id);
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Save failed', 'error');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold">{page?.id ? 'Edit Page' : 'Add Page'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Title + Slug */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Title *</label>
              <input
                ref={titleRef}
                value={form.title}
                onChange={e => handleTitle(e.target.value)}
                className="input"
                placeholder="About Us"
              />
            </div>
            <div>
              <label className="label">Slug *</label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#8B1A2F]/30 focus-within:border-[#8B1A2F] bg-white transition-colors">
                <span className="px-2.5 text-gray-400 text-xs bg-gray-50 border-r border-gray-200 py-2 whitespace-nowrap select-none">/pages/</span>
                <input
                  value={form.slug}
                  onChange={e => { setSlugManual(true); set('slug', slugify(e.target.value)); }}
                  className="flex-1 px-3 py-2 text-sm outline-none placeholder-gray-400 bg-white"
                  placeholder="about-us"
                />
              </div>
            </div>
          </div>

          {/* Status toggle */}
          <div className="flex items-center gap-3">
            <label className="label mb-0">Status</label>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
              {['published', 'draft'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  className={`px-4 py-1.5 capitalize text-sm transition-colors ${
                    form.status === s ? 'bg-[#8B1A2F] text-white font-medium' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="label">
              Excerpt <span className="text-gray-400 font-normal">(short description shown in footer / cards)</span>
            </label>
            <input
              value={form.excerpt}
              onChange={e => set('excerpt', e.target.value)}
              className="input"
              placeholder="A brief summary of this page…"
            />
          </div>

          {/* Content */}
          <div>
            <label className="label">
              Content <span className="text-gray-400 font-normal">(HTML — use &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;)</span>
            </label>
            <textarea
              value={form.content}
              onChange={e => set('content', e.target.value)}
              rows={12}
              className="input resize-y font-mono text-xs leading-relaxed"
              placeholder="<h2>Our Story</h2><p>Content here…</p>"
            />
          </div>

          {/* SEO */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">SEO</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Meta Title</label>
                <input
                  value={form.meta_title || ''}
                  onChange={e => set('meta_title', e.target.value)}
                  className="input"
                  placeholder="About Us | ShoppersHub"
                />
              </div>
              <div>
                <label className="label">Meta Description</label>
                <input
                  value={form.meta_description || ''}
                  onChange={e => set('meta_description', e.target.value)}
                  className="input"
                  placeholder="Short description for search engines…"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim() || !form.slug.trim()}
            className="btn-primary px-5 py-2 text-sm"
          >
            {saving ? 'Saving…' : page?.id ? 'Save Changes' : 'Create Page'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────────────────── */
export default function AdminPages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(undefined);        // undefined = closed, null = new, obj = edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { addToast } = useToastStore();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/pages');
      setPages(data.data || []);
    } catch {
      addToast('Failed to load pages', 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSaved = (saved, isNew) => {
    if (isNew) setPages(ps => [...ps, saved]);
    else setPages(ps => ps.map(p => p.id === saved.id ? saved : p));
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/pages/${deleteTarget.id}`);
      setPages(ps => ps.filter(p => p.id !== deleteTarget.id));
      addToast('Page deleted', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally { setDeleteTarget(null); }
  };

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-600">
            <span className="font-bold text-gray-800">{pages.length}</span> pages
          </span>
        </div>
        <button
          onClick={() => setModal(null)}
          className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Page
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">URL</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Updated</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-300">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                      <p className="text-sm text-gray-400">No pages yet</p>
                    </div>
                  </td>
                </tr>
              ) : pages.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{p.title}</p>
                    {p.excerpt && (
                      <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{p.excerpt}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`/pages/${p.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline font-mono"
                    >
                      /pages/{p.slug}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{fmt(p.updated_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setModal(p)}
                        title="Edit"
                        className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        title="Delete"
                        className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
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
        <PageModal
          page={modal}
          onClose={() => setModal(undefined)}
          onSaved={handleSaved}
        />
      )}

      <DeleteModal
        open={!!deleteTarget}
        title="Delete Page"
        description={`Are you sure you want to delete "${deleteTarget?.title || 'this page'}"? The URL /pages/${deleteTarget?.slug} will stop working.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
