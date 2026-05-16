import React, { useEffect, useState } from 'react';
import {
  getAdminCategories, createCategory, updateCategory, deleteCategory,
} from '../../api/adminApi.js';

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const EMPTY = { name: '', slug: '', parent_id: '', image_url: '', sort_order: 0 };

// ── Modal ─────────────────────────────────────────────────────────────────────
// showParentField: false when adding/editing a top-level category
function CategoryModal({ category, categories, showParentField, onClose, onSaved }) {
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
      onSaved(saved, !category?.id);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
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
              <select
                name="parent_id"
                value={form.parent_id || ''}
                onChange={handleChange}
                disabled={!category?.id && !!form.parent_id}
                className="input disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                <option value="">— None (top-level) —</option>
                {groupedParents.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.parent_id ? `    ↳ ${c.name}` : c.name}
                  </option>
                ))}
              </select>
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
          ? <img src={node.image_url} alt={node.name} className="w-10 h-10 object-cover rounded" />
          : <span className="text-gray-300 text-xs">—</span>}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-3">
          <button onClick={() => onAddChild(node)} className="text-green-600 text-xs hover:underline">+ Sub</button>
          <button onClick={() => onEdit(node)} className="text-blue-600 text-xs hover:underline">Edit</button>
          <button onClick={() => onDelete(node.id)} className="text-red-500 text-xs hover:underline">Delete</button>
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
            <button onClick={() => onEdit(node)} className="text-blue-600 text-xs hover:underline">Edit</button>
            <button onClick={() => onDelete(node.id)} className="text-red-500 text-xs hover:underline">Delete</button>
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
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(undefined);   // undefined=closed, null=new, obj=edit
  const [defaultParent, setDefaultParent] = useState(null);
  const [expanded, setExpanded] = useState({});    // { [id]: bool }

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

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Subcategories will become top-level.')) return;
    await deleteCategory(id);
    load();
  };

  const handleSaved = () => load();   // reload tree after any change

  const openNew = (parentNode = null) => {
    setDefaultParent(parentNode);
    setModal(null);
  };

  const openEdit = (cat) => {
    setDefaultParent(null);
    setModal(cat);
  };

  const toggleExpand = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  // When adding a child, pre-fill parent_id from the clicked row
  const modalInitial = modal === null && defaultParent
    ? { parent_id: defaultParent.id }   // new category pre-filled with parent
    : modal;                             // null = new blank, obj = edit existing

  const tree = buildTree(categories);

  const totalTop = tree.length;
  const totalSub = categories.length - totalTop;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-800">{totalTop}</span> parent categories ·{' '}
          <span className="font-medium text-gray-800">{totalSub}</span> subcategories
        </p>
        <button onClick={() => openNew()} className="btn-primary px-4 py-2 text-sm">
          + Add Category
        </button>
      </div>

      {/* Tree Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Loading categories…</div>
        ) : tree.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No categories yet. Add one above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1A1A1A] text-xs text-gray-300 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Category / Subcategory</th>
                  <th className="px-4 py-3 text-left">Slug</th>
                  <th className="px-4 py-3 text-right">Sort</th>
                  <th className="px-4 py-3 text-left">Image URL</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tree.map(parent => (
                  <React.Fragment key={parent.id}>
                    <ParentRow
                      node={parent}
                      expanded={!!expanded[parent.id]}
                      onToggle={() => toggleExpand(parent.id)}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onAddChild={openNew}
                    />
                    {expanded[parent.id] && parent.children.map(child => (
                      <ChildRow
                        key={child.id}
                        node={child}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onAddChild={openNew}
                      />
                    ))}
                  </React.Fragment>
                ))}
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
            // Show parent dropdown only when adding a sub OR editing an existing subcategory
            (modal === null && defaultParent !== null) ||   // clicking "+ Sub"
            (modal?.id && !!modal?.parent_id)              // editing a child category
          }
          onClose={() => { setModal(undefined); setDefaultParent(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
