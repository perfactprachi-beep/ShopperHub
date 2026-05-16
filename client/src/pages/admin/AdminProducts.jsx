import { useEffect, useRef, useState } from 'react';
import {
  getAdminProducts, createProduct, updateProduct, deleteProduct,
  getProductVariants, addVariant, updateVariant, deleteVariant,
  getProductImages, uploadImages, deleteImage, setPrimaryImage,
} from '../../api/adminApi.js';
import { getAdminCategories } from '../../api/adminApi.js';
import { getAdminBrands } from '../../api/adminApi.js';
import { assetUrl } from '../../utils/assetUrl.js';

const EMPTY_PRODUCT = {
  title: '', slug: '', brand_id: '', category_id: '', gender: '',
  base_price: '', discount_pct: 0, description: '', status: 'active', stock: 0,
};

const EMPTY_VARIANT = { size: '', color: '', sku: '', stock: 0, extra_price: 0 };

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── ProductFormModal ──────────────────────────────────────────────────────────
function ProductFormModal({ product, onClose, onSaved }) {
  const [tab, setTab] = useState('basic');
  const [form, setForm] = useState(product ? { ...product } : EMPTY_PRODUCT);
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [saving, setSaving] = useState(false);
  const [variantForm, setVariantForm] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    Promise.all([getAdminCategories(), getAdminBrands()])
      .then(([cats, brs]) => { setCategories(cats); setBrands(brs); });
    if (product?.id) {
      Promise.all([getProductVariants(product.id), getProductImages(product.id)])
        .then(([v, imgs]) => { setVariants(v); setImages(imgs); });
    }
  }, [product?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: value,
      ...(name === 'title' && !product ? { slug: slugify(value) } : {}),
    }));
  };

  const handleBasicSave = async () => {
    setSaving(true);
    try {
      const saved = product?.id
        ? await updateProduct(product.id, form)
        : await createProduct(form);
      onSaved(saved, !product?.id);
      if (!product?.id) onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAddVariant = async () => {
    if (!product?.id) { alert('Save the product first'); return; }
    try {
      const v = await addVariant(product.id, variantForm || EMPTY_VARIANT);
      setVariants(vs => [...vs, v]);
      setVariantForm(null);
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleUpdateVariant = async (id) => {
    try {
      const updated = await updateVariant(id, variantForm);
      setVariants(vs => vs.map(v => v.id === id ? updated : v));
      setVariantForm(null);
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleDeleteVariant = async (id) => {
    if (!confirm('Delete this variant?')) return;
    await deleteVariant(id);
    setVariants(vs => vs.filter(v => v.id !== id));
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length || !product?.id) { alert('Save the product first'); return; }
    const fd = new FormData();
    for (const f of files) fd.append('images', f);
    setUploadingImages(true);
    try {
      const newImgs = await uploadImages(product.id, fd);
      setImages(imgs => [...imgs, ...newImgs]);
    } catch (err) { alert(err.response?.data?.message || 'Upload failed'); }
    finally { setUploadingImages(false); e.target.value = ''; }
  };

  const handleDeleteImage = async (id) => {
    await deleteImage(id);
    setImages(imgs => imgs.filter(i => i.id !== id));
  };

  const handleSetPrimary = async (id) => {
    if (!product?.id) return;
    await setPrimaryImage(id, product.id);
    setImages(imgs => imgs.map(i => ({ ...i, is_primary: i.id === id })));
  };

  const TABS = ['basic', 'variants', 'images'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            {product?.id ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                tab === t ? 'bg-[#8B1A2F] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t === 'basic' ? 'Basic Info' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Basic Info */}
          {tab === 'basic' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Title</label>
                <input name="title" value={form.title} onChange={handleChange} className="input" />
              </div>
              <div className="col-span-2">
                <label className="label">Slug</label>
                <input name="slug" value={form.slug} onChange={handleChange} className="input font-mono text-sm" />
              </div>
              <div>
                <label className="label">Brand</label>
                <select name="brand_id" value={form.brand_id || ''} onChange={handleChange} className="input">
                  <option value="">— Select Brand —</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Category</label>
                <select name="category_id" value={form.category_id || ''} onChange={handleChange} className="input">
                  <option value="">— Select Category —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Gender</label>
                <select name="gender" value={form.gender || ''} onChange={handleChange} className="input">
                  <option value="">— None —</option>
                  {['men','women','kids','unisex'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="input">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="label">Base Price (₹)</label>
                <input type="number" name="base_price" value={form.base_price} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Discount %</label>
                <input type="number" name="discount_pct" value={form.discount_pct} onChange={handleChange} min="0" max="100" className="input" />
              </div>
              <div>
                <label className="label">Stock</label>
                <input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" className="input" />
              </div>
              <div className="col-span-2">
                <label className="label">Description</label>
                <textarea name="description" value={form.description || ''} onChange={handleChange} rows={4} className="input resize-none" />
              </div>
            </div>
          )}

          {/* Variants */}
          {tab === 'variants' && (
            <div>
              <table className="w-full text-sm mb-4">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">Size</th>
                    <th className="px-3 py-2 text-left">Color</th>
                    <th className="px-3 py-2 text-left">SKU</th>
                    <th className="px-3 py-2 text-right">Stock</th>
                    <th className="px-3 py-2 text-right">+Price</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {variants.map(v => (
                    <tr key={v.id}>
                      {variantForm?.id === v.id ? (
                        <>
                          <td className="px-3 py-1"><input value={variantForm.size||''} onChange={e=>setVariantForm(f=>({...f,size:e.target.value}))} className="input py-1 text-xs w-full" /></td>
                          <td className="px-3 py-1"><input value={variantForm.color||''} onChange={e=>setVariantForm(f=>({...f,color:e.target.value}))} className="input py-1 text-xs w-full" /></td>
                          <td className="px-3 py-1"><input value={variantForm.sku||''} onChange={e=>setVariantForm(f=>({...f,sku:e.target.value}))} className="input py-1 text-xs w-full" /></td>
                          <td className="px-3 py-1"><input type="number" value={variantForm.stock||0} onChange={e=>setVariantForm(f=>({...f,stock:e.target.value}))} className="input py-1 text-xs w-20 text-right" /></td>
                          <td className="px-3 py-1"><input type="number" value={variantForm.extra_price||0} onChange={e=>setVariantForm(f=>({...f,extra_price:e.target.value}))} className="input py-1 text-xs w-20 text-right" /></td>
                          <td className="px-3 py-1 flex gap-1">
                            <button onClick={() => handleUpdateVariant(v.id)} className="text-green-600 text-xs hover:underline">Save</button>
                            <button onClick={() => setVariantForm(null)} className="text-gray-400 text-xs hover:underline">Cancel</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-3 py-2">{v.size || '—'}</td>
                          <td className="px-3 py-2">{v.color || '—'}</td>
                          <td className="px-3 py-2 font-mono text-xs">{v.sku || '—'}</td>
                          <td className="px-3 py-2 text-right">{v.stock}</td>
                          <td className="px-3 py-2 text-right">+₹{v.extra_price}</td>
                          <td className="px-3 py-2 flex gap-2">
                            <button onClick={() => setVariantForm({...v})} className="text-blue-600 text-xs hover:underline">Edit</button>
                            <button onClick={() => handleDeleteVariant(v.id)} className="text-red-500 text-xs hover:underline">Del</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {variantForm && !variantForm.id && (
                    <tr>
                      <td className="px-3 py-1"><input value={variantForm.size||''} onChange={e=>setVariantForm(f=>({...f,size:e.target.value}))} placeholder="Size" className="input py-1 text-xs w-full" /></td>
                      <td className="px-3 py-1"><input value={variantForm.color||''} onChange={e=>setVariantForm(f=>({...f,color:e.target.value}))} placeholder="Color" className="input py-1 text-xs w-full" /></td>
                      <td className="px-3 py-1"><input value={variantForm.sku||''} onChange={e=>setVariantForm(f=>({...f,sku:e.target.value}))} placeholder="SKU" className="input py-1 text-xs w-full" /></td>
                      <td className="px-3 py-1"><input type="number" value={variantForm.stock||0} onChange={e=>setVariantForm(f=>({...f,stock:e.target.value}))} className="input py-1 text-xs w-20 text-right" /></td>
                      <td className="px-3 py-1"><input type="number" value={variantForm.extra_price||0} onChange={e=>setVariantForm(f=>({...f,extra_price:e.target.value}))} className="input py-1 text-xs w-20 text-right" /></td>
                      <td className="px-3 py-1 flex gap-1">
                        <button onClick={handleAddVariant} className="text-green-600 text-xs hover:underline">Add</button>
                        <button onClick={() => setVariantForm(null)} className="text-gray-400 text-xs hover:underline">Cancel</button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {!variantForm && (
                <button onClick={() => setVariantForm({...EMPTY_VARIANT})} className="text-sm text-[#8B1A2F] hover:underline">+ Add Variant</button>
              )}
            </div>
          )}

          {/* Images */}
          {tab === 'images' && (
            <div>
              <div className="flex flex-wrap gap-3 mb-4">
                {images.map(img => (
                  <div key={img.id} className="relative group w-24 h-24">
                    <img src={assetUrl(img.url)} alt="" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                    {img.is_primary && (
                      <span className="absolute top-1 left-1 bg-yellow-400 text-xs px-1 rounded">★</span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center gap-2 transition-opacity">
                      {!img.is_primary && (
                        <button onClick={() => handleSetPrimary(img.id)} title="Set primary" className="text-yellow-300 text-sm">★</button>
                      )}
                      <button onClick={() => handleDeleteImage(img.id)} title="Delete" className="text-red-400 text-sm">🗑</button>
                    </div>
                  </div>
                ))}
                {images.length < 6 && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadingImages}
                    className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-[#8B1A2F] hover:text-[#8B1A2F] transition-colors text-2xl"
                  >
                    {uploadingImages ? '…' : '+'}
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
              <p className="text-xs text-gray-400">Up to 6 images · 5 MB each · ★ = primary</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {tab === 'basic' && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
            <button onClick={handleBasicSave} disabled={saving} className="btn-primary px-5 py-2 text-sm">
              {saving ? 'Saving…' : product?.id ? 'Update' : 'Create'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [modalProduct, setModalProduct] = useState(undefined); // undefined=closed, null=new, obj=edit

  const limit = 20;

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAdminProducts({ page, limit, search: search || undefined, status });
      setProducts(data.products);
      setTotal(data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this product?')) return;
    await deleteProduct(id);
    load();
  };

  const handleToggleStatus = async (product) => {
    await updateProduct(product.id, { ...product, status: product.status === 'active' ? 'inactive' : 'active' });
    load();
  };

  const handleSaved = (saved, isNew) => {
    if (isNew) { load(); setModalProduct(undefined); }
    else { setProducts(ps => ps.map(p => p.id === saved.id ? { ...p, ...saved } : p)); setModalProduct(undefined); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-0">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="input flex-1 max-w-xs"
          />
          <button type="submit" className="btn-primary px-4 py-2 text-sm">Search</button>
        </form>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input w-36">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button onClick={() => setModalProduct(null)} className="btn-primary px-4 py-2 text-sm whitespace-nowrap">
          + Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Image</th>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Brand</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No products found.</td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {p.image_url
                      ? <img src={assetUrl(p.image_url)} alt="" className="w-10 h-10 object-cover rounded-lg" />
                      : <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                    }
                  </td>
                  <td className="px-4 py-3 font-medium max-w-[160px] truncate">{p.title}</td>
                  <td className="px-4 py-3 text-gray-500">{p.brand_name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{p.category_name || '—'}</td>
                  <td className="px-4 py-3 text-right">₹{parseFloat(p.base_price).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-right">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setModalProduct(p)} className="text-blue-600 text-xs hover:underline">Edit</button>
                      <button onClick={() => handleToggleStatus(p)} className="text-amber-600 text-xs hover:underline">
                        {p.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 text-xs hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>{total} products</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-3 py-1 rounded border disabled:opacity-40">←</button>
              <span className="px-3 py-1">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="px-3 py-1 rounded border disabled:opacity-40">→</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalProduct !== undefined && (
        <ProductFormModal
          product={modalProduct}
          onClose={() => setModalProduct(undefined)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
