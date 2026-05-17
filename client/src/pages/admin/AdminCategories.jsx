import React, { useEffect, useState } from 'react';
import {
  getAdminCategories, createCategory, updateCategory, deleteCategory,
} from '../../api/adminApi.js';
import FilterDropdown from '../../components/ui/FilterDropdown.jsx';
import { useToastStore } from '../../store/toastStore.js';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const EMPTY = { name: '', slug: '', parent_id: '', image_url: '', sort_order: 0 };

// ── Modal ─────────────────────────────────────────────────────────────────────
// showParentField: false when adding/editing a top-level category
function CategoryModal({ category, categories, showParentField, onClose, onSaved }) {
  const { addToast } = useToastStore();
  const [form, setForm] = useState({
    ...EMPTY,
    ...(category?.id ? category : {}),
    parent_id: category?.parent_id ?? '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: value,
      ...(name === 'name' && !category?.id ? { slug: slugify(value) } : {}),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, parent_id: form.parent_id || null };
      const saved = category?.id
        ? await updateCategory(category.id, payload)
        : await createCategory(payload);
      addToast(category?.id ? 'Category updated' : 'Category created', 'success');
      onSaved(saved, !category?.id);
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Save failed', 'error');
    } finally { setSaving(false); }
  };

  // Build a parent-id lookup so we can detect depth
  const parentIdSet = new Set(categories.filter(c => !c.parent_id).map(c => c.id));

  // Show L1 (top-level) and L2 (direct children of L1) — excludes itself
  const parents = categories.filter(c =>
    c.id !== category?.id &&
    (!c.parent_id || parentIdSet.has(c.parent_id))
  );

  // Group for display: L1 first, then L2 indented under their parent
  const l1 = parents.filter(c => !c.parent_id);
  const l2ByParent = {};
  parents.filter(c => c.parent_id).forEach(c => {
    if (!l2ByParent[c.parent_id]) l2ByParent[c.parent_id] = [];
    l2ByParent[c.parent_id].push(c);
  });
  const groupedParents = l1.flatMap(p => [p, ...(l2ByParent[p.id] || [])]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold">
            {category?.id
              ? (category.parent_id ? 'Edit Subcategory' : 'Edit Category')
              : (showParentField ? 'Add Subcategory' : 'Add Category')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="label">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="e.g. Casual Wear" />
          </div>
          <div>
            <label className="label">Slug</label>
            <input name="slug" value={form.slug} onChange={handleChange} className="input font-mono text-sm" />
          </div>
          {showParentField && (
            <div>
              <label className="label">Parent Category</label>
              <div className="select-wrap">
                <select
                  name="parent_id"
                  value={form.parent_id || ''}
                  onChange={handleChange}
                  disabled={!category?.id && !!form.parent_id}
                  className="disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  <option value="">— None (top-level) —</option>
                  {groupedParents.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.parent_id ? `    ↳ ${c.name}` : c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <div>
            <label className="label">Image URL</label>
            <input name="image_url" value={form.image_url || ''} onChange={handleChange} placeholder="https://…" className="input" />
          </div>
          <div>
            <label className="label">Sort Order</label>
            <input type="number" name="sort_order" value={form.sort_order} onChange={handleChange} min="0" className="input" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary px-5 py-2 text-sm">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Build tree from flat list ─────────────────────────────────────────────────
function buildTree(flat) {
  const map = {};
  flat.forEach(c => { map[c.id] = { ...c, children: [] }; });
  const roots = [];
  flat.forEach(c => {
    if (c.parent_id && map[c.parent_id]) {
      map[c.parent_id].children.push(map[c.id]);
    } else if (!c.parent_id) {
      roots.push(map[c.id]);
    }
  });
  return roots;
}

// ── Parent section row ────────────────────────────────────────────────────────
function ParentRow({ node, onEdit, onDelete, onAddChild, expanded, onToggle }) {
  return (
    <tr className="bg-gray-50 border-t-2 border-gray-200">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 text-xs"
          >
            {expanded ? '▾' : '▸'}
          </button>
          <span className="font-semibold text-gray-800">{node.name}</span>
          <span className="ml-1 text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full">
            {node.children.length}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-gray-400">{node.slug}</td>
      <td className="px-4 py-3 text-right text-xs text-gray-400">{node.sort_order ?? '—'}</td>
      <td className="px-4 py-3">
        {node.image_url
          ? <img src={node.image_url} alt={node.name} className="w-10 h-10 object-cover rounded" onError={e => { e.currentTarget.style.display='none'; }} />
          : <span className="text-gray-300 text-xs">—</span>}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-3">
          <button onClick={() => onAddChild(node)} title="Add subcategory" className="p-1.5 rounded-md text-green-600 hover:bg-green-50 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button onClick={() => onEdit(node)} title="Edit" className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button onClick={() => onDelete(node.id)} title="Delete" className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Child row (L2) ────────────────────────────────────────────────────────────
function ChildRow({ node, onEdit, onDelete, onAddChild, depth = 1 }) {
  const indent = depth * 24;
  return (
    <>
      <tr className="hover:bg-blue-50/40 border-t border-gray-100">
        <td className="px-4 py-2.5" style={{ paddingLeft: `${indent + 16}px` }}>
          <div className="flex items-center gap-2">
            <span className="text-gray-300 text-xs select-none">└</span>
            <span className="text-sm text-gray-700">{node.name}</span>
            {node.children?.length > 0 && (
              <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                {node.children.length}
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{node.slug}</td>
        <td className="px-4 py-2.5 text-right text-xs text-gray-400">{node.sort_order}</td>
        <td className="px-4 py-2.5">
          {node.image_url
            ? <img src={node.image_url} alt={node.name} className="w-10 h-10 object-cover rounded" />
            : <span className="text-gray-300 text-xs">—</span>}
        </td>
        <td className="px-4 py-2.5">
          <div className="flex gap-3">
            {depth < 2 && (
              <button onClick={() => onAddChild(node)} className="text-green-600 text-xs hover:underline">+ Sub</button>
            )}
            <button onClick={() => onEdit(node)} title="Edit" className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button onClick={() => onDelete(node.id)} title="Delete" className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
      {node.children?.map(child => (
        <ChildRow key={child.id} node={child} onEdit={onEdit} onDelete={onDelete} onAddChild={onAddChild} depth={depth + 1} />
      ))}
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminCategories() {
  const { addToast } = useToastStore();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(undefined);
  const [defaultParent, setDefaultParent] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubCategory, setFilterSubCategory] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAdminCategories();
      setCategories(data);
      // auto-expand all top-level on first load
      const exp = {};
      data.filter(c => !c.parent_id).forEach(c => { exp[c.id] = true; });
      setExpanded(exp);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = (id) => setConfirmId(id);

  const doDelete = async () => {
    try {
      await deleteCategory(confirmId);
      addToast('Category deleted', 'success');
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally { setConfirmId(null); }
  };

  const handleSaved = () => load();

  const openNew = (parentNode = null) => {
    setDefaultParent(parentNode);
    setModal(null);
  };

  const openEdit = (cat) => {
    setDefaultParent(null);
    setModal(cat);
  };

  const toggleExpand = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const handleCategoryFilter = (val) => {
    setFilterCategory(val);
    setFilterSubCategory('');
    // auto-expand selected parent
    if (val) setExpanded(e => ({ ...e, [Number(val)]: true }));
  };

  const clearFilters = () => {
    setFilterCategory('');
    setFilterSubCategory('');
  };

  const modalInitial = modal === null && defaultParent
    ? { parent_id: defaultParent.id }
    : modal;

  const tree = buildTree(categories);

  // ── Derived filter data ───────────────────────────────────────────────────────
  const topLevel = tree;  // all parent nodes
  const subOptions = filterCategory
    ? (tree.find(p => p.id === Number(filterCategory))?.children ?? [])
    : [];

  // Filter the tree for display
  const filteredTree = filterCategory
    ? tree.filter(p => p.id === Number(filterCategory))
    : tree;

  const totalTop = tree.length;
  const totalSub = categories.length - totalTop;
  const isFiltered = filterCategory || filterSubCategory;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <FilterDropdown
            placeholder="All Categories"
            value={filterCategory}
            onChange={handleCategoryFilter}
            onClear={clearFilters}
            options={[{ value: '', label: 'All Categories' }, ...topLevel.map(p => ({ value: p.id, label: p.name }))]}
          />

          <FilterDropdown
            placeholder="All Subcategories"
            value={filterSubCategory}
            onChange={v => setFilterSubCategory(v)}
            onClear={() => setFilterSubCategory('')}
            disabled={!filterCategory}
            options={[{ value: '', label: 'All Subcategories' }, ...subOptions.map(c => ({ value: c.id, label: c.name }))]}
          />

          {isFiltered && (
            <button
              onClick={clearFilters}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Clear
            </button>
          )}

          <div className="flex items-center gap-2 ml-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-600">
              <span className="font-bold text-gray-800">{totalTop}</span> categories
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-600">
              <span className="font-bold text-gray-800">{totalSub}</span> subcategories
            </span>
          </div>
        </div>

        <button onClick={() => openNew()} className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Category
        </button>
      </div>

      {/* Tree Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Loading categories…</div>
        ) : filteredTree.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No categories found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category / Subcategory</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Slug</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Sort</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTree.map(parent => {
                  // If a subcategory is selected, only show that child
                  const visibleChildren = filterSubCategory
                    ? parent.children.filter(c => c.id === Number(filterSubCategory))
                    : parent.children;
                  const isExpanded = filterCategory ? true : !!expanded[parent.id];

                  return (
                    <React.Fragment key={parent.id}>
                      <ParentRow
                        node={{ ...parent, children: visibleChildren }}
                        expanded={isExpanded}
                        onToggle={() => toggleExpand(parent.id)}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onAddChild={openNew}
                      />
                      {isExpanded && visibleChildren.map(child => (
                        <ChildRow
                          key={child.id}
                          node={child}
                          onEdit={openEdit}
                          onDelete={handleDelete}
                          onAddChild={openNew}
                        />
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal !== undefined && (
        <CategoryModal
          category={modalInitial}
          categories={categories}
          showParentField={
            (modal === null && defaultParent !== null) ||
            (modal?.id && !!modal?.parent_id)
          }
          onClose={() => { setModal(undefined); setDefaultParent(null); }}
          onSaved={handleSaved}
        />
      )}

      {confirmId && (
        <ConfirmDialog
          title="Delete this category?"
          message="Subcategories will become top-level."
          onConfirm={doDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
