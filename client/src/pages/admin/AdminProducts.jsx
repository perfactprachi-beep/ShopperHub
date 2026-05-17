import { useEffect, useRef, useState, useCallback } from 'react';
import {
  getAdminProducts, createProduct, updateProduct, deleteProduct,
  getProductVariants, addVariant, updateVariant, deleteVariant,
  getProductImages, uploadImages, deleteImage, setPrimaryImage,
  getProductAttributes, addProductAttribute, updateProductAttribute, deleteProductAttribute,
} from '../../api/adminApi.js';
import { getAdminCategories } from '../../api/adminApi.js';
import { getAdminBrands } from '../../api/adminApi.js';
import { assetUrl } from '../../utils/assetUrl.js';
import FilterDropdown from '../../components/ui/FilterDropdown.jsx';
import { useToastStore } from '../../store/toastStore.js';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';

const EMPTY_PRODUCT = {
  title: '', slug: '', brand_id: '', category_id: '', gender: '',
  base_price: '', discount_pct: 10, description: '', status: 'active', stock: 0,
  is_deal: false, is_returnable: true,
};

const EMPTY_VARIANT   = { size: '', color: '', sku: '', stock: 0, extra_price: 0 };
const EMPTY_ATTRIBUTE = { label: '', value: '', sort_order: 0, section: 'highlights' };

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── ProductFormModal ──────────────────────────────────────────────────────────
function ProductFormModal({ product, onClose, onSaved }) {
  const { addToast } = useToastStore();
  const [tab, setTab] = useState('basic');
  const [form, setForm] = useState(product ? { ...product } : EMPTY_PRODUCT);
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [saving, setSaving] = useState(false);
  const [variantForm, setVariantForm] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [attributes, setAttributes] = useState([]);
  const [attrForm, setAttrForm] = useState(null);
  const [attrEditing, setAttrEditing] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    Promise.all([getAdminCategories(), getAdminBrands()])
      .then(([cats, brs]) => { setCategories(cats); setBrands(brs); });
    if (product?.id) {
      Promise.all([
        getProductVariants(product.id),
        getProductImages(product.id),
        getProductAttributes(product.id),
      ]).then(([v, imgs, attrs]) => { setVariants(v); setImages(imgs); setAttributes(attrs); });
    }
  }, [product?.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'title' && !product ? { slug: slugify(value) } : {}),
    }));
  };

  const handleBasicSave = async () => {
    setSaving(true);
    try {
      const saved = product?.id
        ? await updateProduct(product.id, form)
        : await createProduct(form);
      addToast(product?.id ? 'Product updated' : 'Product created', 'success');
      onSaved(saved, !product?.id);
      if (!product?.id) onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddVariant = async () => {
    if (!product?.id) { addToast('Save the product first', 'warning'); return; }
    try {
      const v = await addVariant(product.id, variantForm || EMPTY_VARIANT);
      setVariants(vs => [...vs, v]);
      setVariantForm(null);
      addToast('Variant added', 'success');
    } catch (err) { addToast(err.response?.data?.message || 'Error', 'error'); }
  };

  const handleUpdateVariant = async (id) => {
    try {
      const updated = await updateVariant(id, variantForm);
      setVariants(vs => vs.map(v => v.id === id ? updated : v));
      setVariantForm(null);
      addToast('Variant updated', 'success');
    } catch (err) { addToast(err.response?.data?.message || 'Error', 'error'); }
  };

  const handleDeleteVariant = (id) => {
    setConfirmAction({
      title: 'Delete variant?',
      onConfirm: async () => {
        await deleteVariant(id);
        setVariants(vs => vs.filter(v => v.id !== id));
        addToast('Variant deleted', 'success');
      },
    });
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length || !product?.id) { addToast('Save the product first', 'warning'); return; }
    const fd = new FormData();
    for (const f of files) fd.append('images', f);
    setUploadingImages(true);
    try {
      const newImgs = await uploadImages(product.id, fd);
      setImages(imgs => [...imgs, ...newImgs]);
      addToast('Images uploaded', 'success');
    } catch (err) { addToast(err.response?.data?.message || 'Upload failed', 'error'); }
    finally { setUploadingImages(false); e.target.value = ''; }
  };

  const handleDeleteImage = (id) => {
    setConfirmAction({
      title: 'Delete this image?',
      onConfirm: async () => {
        try {
          await deleteImage(id);
          setImages(imgs => imgs.filter(i => i.id !== id));
          addToast('Image deleted', 'success');
        } catch (err) {
          addToast(err.response?.data?.message || 'Delete failed', 'error');
        }
      },
    });
  };

  const handleSetPrimary = async (id) => {
    if (!product?.id) return;
    await setPrimaryImage(id, product.id);
    setImages(imgs => imgs.map(i => ({ ...i, is_primary: i.id === id })));
  };

  // ── Attribute handlers ────────────────────────────────────────────────
  const handleAddAttribute = async () => {
    if (!product?.id) { addToast('Save the product first', 'warning'); return; }
    if (!attrForm?.label?.trim() || !attrForm?.value?.trim()) { addToast('Label and value are required', 'warning'); return; }
    try {
      const saved = await addProductAttribute(product.id, attrForm);
      setAttributes(a => [...a, saved]);
      setAttrForm(null);
      addToast('Attribute added', 'success');
    } catch (err) { addToast(err.response?.data?.message || 'Error', 'error'); }
  };

  const handleUpdateAttribute = async () => {
    try {
      const updated = await updateProductAttribute(attrEditing, attrForm);
      setAttributes(a => a.map(x => x.id === attrEditing ? updated : x));
      setAttrForm(null); setAttrEditing(null);
      addToast('Attribute updated', 'success');
    } catch (err) { addToast(err.response?.data?.message || 'Error', 'error'); }
  };

  const handleDeleteAttribute = (id) => {
    setConfirmAction({
      title: 'Delete this attribute?',
      onConfirm: async () => {
        await deleteProductAttribute(id);
        setAttributes(a => a.filter(x => x.id !== id));
        addToast('Attribute deleted', 'success');
      },
    });
  };

  const TABS = ['basic', 'variants', 'images', 'attributes'];

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
                <div className="select-wrap">
                  <select name="brand_id" value={form.brand_id || ''} onChange={handleChange}>
                    <option value="">— Select Brand —</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Category</label>
                <div className="select-wrap">
                  <select name="category_id" value={form.category_id || ''} onChange={handleChange}>
                    <option value="">— Select Category —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Gender</label>
                <div className="select-wrap">
                  <select name="gender" value={form.gender || ''} onChange={handleChange}>
                    <option value="">— None —</option>
                    {['men','women','kids','unisex'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Status</label>
                <div className="select-wrap">
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
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

              {/* Top Deals toggle */}
              <div className="col-span-2">
                <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  form.is_deal ? 'border-[#8B1A2F] bg-[#8B1A2F]/5' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="checkbox" name="is_deal" checked={!!form.is_deal} onChange={handleChange} className="w-4 h-4 accent-[#8B1A2F] shrink-0" />
                  <div>
                    <p className={`text-sm font-semibold ${form.is_deal ? 'text-[#8B1A2F]' : 'text-gray-700'}`}>Feature in Top Deals</p>
                    <p className="text-xs text-gray-400 mt-0.5">This product will appear in the "Top Deals" section on the homepage</p>
                  </div>
                  {form.is_deal && (
                    <span className="ml-auto shrink-0 inline-flex items-center gap-1 bg-[#8B1A2F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      Deal
                    </span>
                  )}
                </label>
              </div>

              {/* Returnable toggle */}
              <div className="col-span-2">
                <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  form.is_returnable ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="checkbox" name="is_returnable" checked={form.is_returnable !== false} onChange={handleChange} className="w-4 h-4 accent-green-600 shrink-0" />
                  <div>
                    <p className={`text-sm font-semibold ${form.is_returnable ? 'text-green-700' : 'text-gray-500'}`}>Easy Return Eligible</p>
                    <p className="text-xs text-gray-400 mt-0.5">Shows "Easy Return" trust badge on the product page. Uncheck for non-returnable items.</p>
                  </div>
                  <span className={`ml-auto shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    form.is_returnable !== false ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {form.is_returnable !== false ? '14-Day Return' : 'No Return'}
                  </span>
                </label>
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
                            <button onClick={() => setVariantForm({...v})} title="Edit" className="p-1 rounded text-blue-600 hover:bg-blue-50 transition-colors">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button onClick={() => handleDeleteVariant(v.id)} title="Delete" className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                            </button>
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
              {/* Image grid */}
              <div className="flex flex-wrap gap-3 mb-4">
                {images.map(img => (
                  <div key={img.id} className="relative w-24 h-24 group">
                    <img
                      src={assetUrl(img.url)}
                      alt=""
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                    {/* Primary badge */}
                    {img.is_primary && (
                      <span className="absolute top-1 left-1 bg-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded shadow">★</span>
                    )}
                    {/* Delete button — always visible */}
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      title="Delete image"
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow transition-colors"
                    >
                      ✕
                    </button>
                    {/* Set primary on hover */}
                    {!img.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(img.id)}
                        title="Set as primary"
                        className="absolute bottom-1 left-1 right-1 bg-black/60 hover:bg-black/80 text-yellow-300 text-[10px] font-medium py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Set Primary
                      </button>
                    )}
                  </div>
                ))}

                {/* Upload slot */}
                {images.length < 6 && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadingImages}
                    className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-[#8B1A2F] hover:text-[#8B1A2F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingImages
                      ? <><span className="text-lg animate-spin">↻</span><span className="text-[10px]">Uploading</span></>
                      : <><span className="text-2xl leading-none">+</span><span className="text-[10px]">Add Image</span></>
                    }
                  </button>
                )}
              </div>

              <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />

              <p className="text-xs text-gray-400">{images.length}/6 images · 5 MB each · ★ = primary</p>
            </div>
          )}

          {/* Attributes */}
          {tab === 'attributes' && (
            <div className="space-y-5">
              {!product?.id && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Save the product first (Basic Info) to add attributes.
                </p>
              )}

              {[
                {
                  section: 'highlights',
                  title: 'Product Highlights',
                  subtitle: 'Shown in the highlights table (Pattern, Neckline, Fit, Fabric…)',
                  suggestions: ['Pattern','Neckline','Fit','Fabric','Sleeve','Occasion','Pack Of'],
                },
                {
                  section: 'details',
                  title: 'Additional Details',
                  subtitle: 'Shown in the details accordion (Origin, Manufacturer, Care, Net Qty…)',
                  suggestions: ['Country of Origin','Manufacturer','Care Instructions','Net Quantity','Product Code','Material','Warranty'],
                },
              ].map(({ section, title, subtitle, suggestions }) => {
                const sectionAttrs = attributes.filter(a => (a.section || 'highlights') === section);
                const isAddingHere = attrForm && !attrEditing && attrForm.section === section;

                return (
                  <div key={section} className="border border-gray-200 rounded-xl overflow-hidden">
                    {/* Section header */}
                    <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                      <p className="text-xs font-bold text-gray-800">{title}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
                    </div>

                    <div className="p-3 space-y-2">
                      {/* Existing rows */}
                      {sectionAttrs.length > 0 && (
                        <table className="w-full text-xs">
                          <tbody className="divide-y divide-gray-50">
                            {sectionAttrs.map(attr => (
                              <tr key={attr.id} className="group">
                                {attrEditing === attr.id ? (
                                  <>
                                    <td className="py-1.5 pr-2 w-1/3">
                                      <input value={attrForm.label} onChange={e => setAttrForm(f => ({ ...f, label: e.target.value }))} className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#8B1A2F]" />
                                    </td>
                                    <td className="py-1.5 pr-2">
                                      <input value={attrForm.value} onChange={e => setAttrForm(f => ({ ...f, value: e.target.value }))} className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#8B1A2F]" />
                                    </td>
                                    <td className="py-1.5 w-20">
                                      <div className="flex gap-1">
                                        <button onClick={handleUpdateAttribute} className="px-2 py-1 bg-[#8B1A2F] text-white rounded text-[10px] hover:bg-[#6d1424]">Save</button>
                                        <button onClick={() => { setAttrEditing(null); setAttrForm(null); }} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px]">✕</button>
                                      </div>
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className="py-2 pr-3 font-medium text-gray-700 w-1/3">{attr.label}</td>
                                    <td className="py-2 text-gray-500 capitalize">{attr.value}</td>
                                    <td className="py-2 w-16 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="flex gap-2">
                                        <button onClick={() => { setAttrEditing(attr.id); setAttrForm({ label: attr.label, value: attr.value, sort_order: attr.sort_order, section: attr.section }); }} className="text-[#8B1A2F] hover:underline text-[10px]">Edit</button>
                                        <button onClick={() => handleDeleteAttribute(attr.id)} className="text-red-400 hover:text-red-600 text-[10px]">Del</button>
                                      </div>
                                    </td>
                                  </>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {/* Inline add form */}
                      {product?.id && isAddingHere && (
                        <div className="flex gap-2 items-end pt-1">
                          <div className="flex-1">
                            <input placeholder="Label" value={attrForm.label} onChange={e => setAttrForm(f => ({ ...f, label: e.target.value }))} className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#8B1A2F] mb-1" />
                            <input placeholder="Value" value={attrForm.value} onChange={e => setAttrForm(f => ({ ...f, value: e.target.value }))} className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#8B1A2F]" />
                          </div>
                          <div className="flex flex-col gap-1 shrink-0">
                            <button onClick={handleAddAttribute} className="px-3 py-1.5 bg-[#8B1A2F] text-white rounded text-xs hover:bg-[#6d1424]">Add</button>
                            <button onClick={() => setAttrForm(null)} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded text-xs">✕</button>
                          </div>
                        </div>
                      )}

                      {/* Quick-add suggestions */}
                      {product?.id && !isAddingHere && !attrEditing && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {suggestions.map(s => (
                            <button
                              key={s}
                              onClick={() => setAttrForm({ label: s, value: '', sort_order: sectionAttrs.length, section })}
                              className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full hover:bg-[#8B1A2F]/10 hover:text-[#8B1A2F] transition-colors"
                            >
                              + {s}
                            </button>
                          ))}
                          <button
                            onClick={() => setAttrForm({ label: '', value: '', sort_order: sectionAttrs.length, section })}
                            className="text-[10px] px-2 py-0.5 border border-dashed border-gray-300 text-gray-400 rounded-full hover:border-[#8B1A2F] hover:text-[#8B1A2F] transition-colors"
                          >
                            + Custom
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
          {tab === 'basic' && (
            <button onClick={handleBasicSave} disabled={saving} className="btn-primary px-5 py-2 text-sm">
              {saving ? 'Saving…' : product?.id ? 'Update' : 'Create'}
            </button>
          )}
          {tab === 'variants' && (
            <button onClick={onClose} className="btn-primary px-5 py-2 text-sm">Done</button>
          )}
          {tab === 'images' && (
            <button onClick={onClose} className="btn-primary px-5 py-2 text-sm">Submit</button>
          )}
        </div>
      </div>
      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.title}
          onConfirm={async () => { await confirmAction.onConfirm(); setConfirmAction(null); }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminProducts() {
  const { addToast } = useToastStore();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dealFilter, setDealFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalProduct, setModalProduct] = useState(undefined);
  const [confirmId, setConfirmId] = useState(null);

  const limit = 20;

  useEffect(() => {
    Promise.all([getAdminBrands(), getAdminCategories()])
      .then(([brs, cats]) => { setBrands(brs); setCategories(cats); })
      .catch(() => {});
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAdminProducts({
        page, limit,
        search: search || undefined,
        status,
        brand_id: brandFilter || undefined,
        category_id: categoryFilter || undefined,
        is_deal: dealFilter || undefined,
      });
      setProducts(data.products);
      setTotal(data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, status, brandFilter, categoryFilter, dealFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleDelete = (id) => {
    setConfirmId(id);
  };

  const doDelete = async () => {
    try {
      await deleteProduct(confirmId);
      addToast('Product deactivated', 'success');
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally { setConfirmId(null); }
  };

  const handleToggleStatus = async (product) => {
    try {
      const next = product.status === 'active' ? 'inactive' : 'active';
      await updateProduct(product.id, { ...product, status: next });
      addToast(`Product set to ${next}`, 'success');
      load();
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  const handleSaved = (saved, isNew) => {
    addToast(isNew ? 'Product created' : 'Product updated', 'success');
    if (isNew) { load(); setModalProduct(undefined); }
    else { setProducts(ps => ps.map(p => p.id === saved.id ? { ...p, ...saved } : p)); setModalProduct(undefined); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">

        {/* Search */}
        <form onSubmit={handleSearch} className="flex flex-1 min-w-[220px] max-w-sm">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-l-lg outline-none focus:border-[#8B1A2F] focus:ring-2 focus:ring-[#8B1A2F]/10 bg-gray-50 transition-colors"
            />
          </div>
          <button type="submit" className="px-4 py-2 text-sm font-medium bg-[#8B1A2F] text-white rounded-r-lg hover:bg-[#6B1223] transition-colors">
            Search
          </button>
        </form>

        {/* Divider */}
        <div className="h-7 w-px bg-gray-200 hidden sm:block" />

        {/* Brand filter */}
        <FilterDropdown
          value={brandFilter}
          onChange={v => { setBrandFilter(v); setPage(1); }}
          onClear={() => { setBrandFilter(''); setPage(1); }}
          placeholder="Brand"
          options={[{ value: '', label: 'All Brands' }, ...brands.map(b => ({ value: b.id, label: b.name }))]}
        />

        {/* Category filter */}
        <FilterDropdown
          value={categoryFilter}
          onChange={v => { setCategoryFilter(v); setPage(1); }}
          onClear={() => { setCategoryFilter(''); setPage(1); }}
          placeholder="Category"
          options={[{ value: '', label: 'All Categories' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
        />

        {/* Status filter */}
        <FilterDropdown
          value={status === 'all' ? '' : status}
          onChange={v => { setStatus(v || 'all'); setPage(1); }}
          onClear={() => { setStatus('all'); setPage(1); }}
          placeholder="Status"
          options={[
            { value: '', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />

        {/* Top Deals filter */}
        <button
          onClick={() => { setDealFilter(d => d ? '' : 'true'); setPage(1); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
            dealFilter
              ? 'border-[#8B1A2F] bg-[#8B1A2F] text-white'
              : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-white hover:border-gray-300'
          }`}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          Top Deals
        </button>

        {/* Clear all */}
        {(brandFilter || categoryFilter || status !== 'all' || dealFilter) && (
          <button
            onClick={() => { setBrandFilter(''); setCategoryFilter(''); setStatus('all'); setDealFilter(''); setPage(1); }}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Clear all
          </button>
        )}

        {/* Add button — right edge */}
        <button onClick={() => setModalProduct(null)} className="btn-primary px-4 py-2 text-sm whitespace-nowrap flex items-center gap-1.5 ml-auto">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Image</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Brand</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Deal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(9)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No products found.</td></tr>
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
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={async () => {
                        try {
                          await updateProduct(p.id, { ...p, is_deal: !p.is_deal });
                          setProducts(ps => ps.map(x => x.id === p.id ? { ...x, is_deal: !x.is_deal } : x));
                          addToast(!p.is_deal ? 'Added to Top Deals' : 'Removed from Top Deals', 'success');
                        } catch { addToast('Update failed', 'error'); }
                      }}
                      title={p.is_deal ? 'Remove from Top Deals' : 'Add to Top Deals'}
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                        p.is_deal
                          ? 'bg-[#8B1A2F] text-white hover:bg-[#6d1424]'
                          : 'bg-gray-100 text-gray-400 hover:bg-[#8B1A2F]/10 hover:text-[#8B1A2F]'
                      }`}
                    >
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      {p.is_deal ? 'Deal' : 'Add'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setModalProduct(p)} title="Edit" className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => handleToggleStatus(p)} title={p.status === 'active' ? 'Deactivate' : 'Activate'} className="p-1.5 rounded-md text-amber-600 hover:bg-amber-50 transition-colors">
                        {p.status === 'active'
                          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                      </button>
                      <button onClick={() => handleDelete(p.id)} title="Delete" className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
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
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="p-1.5 rounded border disabled:opacity-40 hover:bg-gray-50 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>
              </button>
              <span className="px-3 py-1 text-xs font-medium">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="p-1.5 rounded border disabled:opacity-40 hover:bg-gray-50 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9,18 15,12 9,6"/></svg>
              </button>
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

      {confirmId && (
        <ConfirmDialog
          title="Deactivate this product?"
          message="The product will be hidden from the store."
          confirmLabel="Deactivate"
          onConfirm={doDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
