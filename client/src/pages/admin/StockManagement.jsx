import { useState, useEffect, useRef } from 'react';
import { inventoryApi } from '../../api/inventoryApi.js';
import { getAdminCategories, getAdminBrands } from '../../api/adminApi.js';
import { assetUrl } from '../../utils/assetUrl.js';
import { DEFAULT_PRODUCT_IMAGE } from '../../utils/getProductPlaceholder.js';
import FilterDropdown from '../../components/ui/FilterDropdown.jsx';
import { useToastStore } from '../../store/toastStore.js';

function StockEditModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState({
    stock_quantity: item?.stock_quantity || 0,
    low_stock_threshold: item?.low_stock_threshold || 10,
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToastStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await inventoryApi.updateVariantStock(item.variant_id, form);
      if (data.success) {
        addToast('Stock updated successfully', 'success');
        onSaved(data.data);
        onClose();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update stock', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Update Stock</h2>
          <p className="text-sm text-gray-500 mt-1">{item?.product_title}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity
            </label>
            <input
              type="number"
              min="0"
              value={form.stock_quantity}
              onChange={(e) => setForm(f => ({ ...f, stock_quantity: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Low Stock Threshold
            </label>
            <input
              type="number"
              min="0"
              value={form.low_stock_threshold}
              onChange={(e) => setForm(f => ({ ...f, low_stock_threshold: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Reason for stock update..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Update Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BulkUpdateModal({ selectedItems, onClose, onSaved }) {
  const [updates, setUpdates] = useState(
    selectedItems.map(item => ({
      id: item.variant_id,
      stock_quantity: item.live_stock ?? item.stock_quantity ?? 0,
      product_title: item.product_title,
      size: item.size,
      color: item.color,
      image_url: item.image_url,
      status: item.status,
    }))
  );
  const [saving, setSaving] = useState(false);
  const [activeSetAll, setActiveSetAll] = useState(null);
  const { addToast } = useToastStore();

  const handleQuantityChange = (id, quantity) => {
    setActiveSetAll(null);
    setUpdates(prev => prev.map(item =>
      item.id === id ? { ...item, stock_quantity: parseInt(quantity) || 0 } : item
    ));
  };

  const setAll = (val) => {
    const n = parseInt(val);
    if (isNaN(n) || n < 0) return;
    setActiveSetAll(n);
    setUpdates(prev => prev.map(item => ({ ...item, stock_quantity: n })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await inventoryApi.bulkUpdateInventory(updates);
      if (data.success) {
        addToast(`${updates.length} item${updates.length > 1 ? 's' : ''} updated`, 'success');
        onSaved(data.data);
        onClose();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update stock', 'error');
    } finally {
      setSaving(false);
    }
  };

  const STATUS_DOT = {
    in_stock:     'bg-green-500',
    low_stock:    'bg-amber-400',
    out_of_stock: 'bg-red-500',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[88vh]">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Bulk Update Stock</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Editing stock for <span className="font-semibold text-gray-700">{updates.length}</span> selected items
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-0.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Set-all shortcut */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
          <span className="text-xs font-medium text-gray-500">Set all to:</span>
          {[0, 5, 10, 25, 50, 100].map(n => (
            <button key={n} type="button" onClick={() => setAll(n)}
              className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
                activeSetAll === n
                  ? 'bg-[#8B1A2F] border-[#8B1A2F] text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-[#8B1A2F] hover:text-[#8B1A2F]'
              }`}>
              {n}
            </button>
          ))}
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_auto] gap-4 px-6 py-2 bg-gray-50 border-b border-gray-100">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Product</span>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-28 text-center">New Stock</span>
        </div>

        {/* Items list */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {updates.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-3 hover:bg-gray-50/60 transition-colors">
                {/* Product info */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[11px] text-gray-300 font-mono w-5 text-right flex-shrink-0">{idx + 1}</span>
                  <img
                    src={item.image_url ? assetUrl(item.image_url) : DEFAULT_PRODUCT_IMAGE}
                    alt=""
                    onError={e => { if (e.currentTarget.src !== DEFAULT_PRODUCT_IMAGE) e.currentTarget.src = DEFAULT_PRODUCT_IMAGE; }}
                    className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.product_title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {(item.size || item.color) && (
                        <span className="text-xs text-gray-400">
                          {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(' · ')}
                        </span>
                      )}
                      {item.status && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[item.status] || 'bg-gray-300'}`} />
                          {item.status.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stock input */}
                <div className="w-28 flex items-center gap-1">
                  <button type="button"
                    onClick={() => handleQuantityChange(item.id, Math.max(0, item.stock_quantity - 1))}
                    className="w-7 h-8 flex items-center justify-center rounded-l-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors text-lg leading-none">
                    −
                  </button>
                  <input
                    type="number" min="0"
                    value={item.stock_quantity}
                    onChange={e => handleQuantityChange(item.id, e.target.value)}
                    className="w-12 h-8 border-y border-gray-200 text-center text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#8B1A2F] bg-white"
                  />
                  <button type="button"
                    onClick={() => handleQuantityChange(item.id, item.stock_quantity + 1)}
                    className="w-7 h-8 flex items-center justify-center rounded-r-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors text-lg leading-none">
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 flex-shrink-0">
            <span className="text-xs text-gray-400">{updates.length} item{updates.length !== 1 ? 's' : ''} will be updated</span>
            <div className="flex gap-3">
              <button type="button" onClick={onClose}
                className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-6 py-2 text-sm font-semibold bg-[#8B1A2F] text-white rounded-xl hover:bg-[#6d1424] disabled:opacity-50 transition-colors flex items-center gap-2">
                {saving ? (
                  <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/></svg>Updating…</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Update {updates.length} Items</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StockManagement() {
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subCategoryFilter, setSubCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);

  const limit = 20;

  useEffect(() => {
    Promise.all([getAdminCategories(), getAdminBrands()])
      .then(([cats, brs]) => { setCategories(cats); setBrands(brs); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadInventory();
  }, [page, categoryFilter, subCategoryFilter, brandFilter, statusFilter]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const { data } = await inventoryApi.getInventory({
        page,
        limit,
        search: search || undefined,
        category_id: subCategoryFilter || categoryFilter || undefined,
        brand_id: brandFilter || undefined,
        status: statusFilter || undefined
      });
      if (data.success) {
        setInventory(data.data.inventory);
        setTotal(data.data.total);
      }
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadInventory();
  };

  const handleItemUpdated = (updatedItem) => {
    setInventory(prev => prev.map(item =>
      item.variant_id === updatedItem.variant_id ? { ...item, ...updatedItem } : item
    ));
  };

  const handleBulkUpdated = (updatedItems) => {
    const updatedMap = new Map(updatedItems.map(item => [item.variant_id, item]));
    setInventory(prev => prev.map(item =>
      updatedMap.has(item.variant_id) ? { ...item, ...updatedMap.get(item.variant_id) } : item
    ));
    setSelectedItems([]);
  };

  const toggleSelectItem = (item) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.variant_id === item.variant_id);
      if (exists) {
        return prev.filter(i => i.variant_id !== item.variant_id);
      } else {
        return [...prev, item];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === inventory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...inventory]);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      in_stock: 'bg-green-100 text-green-800',
      low_stock: 'bg-yellow-100 text-yellow-800',
      out_of_stock: 'bg-red-100 text-red-800'
    };
    const labels = {
      in_stock: 'In Stock',
      low_stock: 'Low Stock',
      out_of_stock: 'Out of Stock'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600">Manage product inventory levels</p>
        </div>
        {selectedItems.length > 0 && (
          <button
            onClick={() => setShowBulkUpdate(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Bulk Update ({selectedItems.length})
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
          <form onSubmit={handleSearch} className="flex flex-1 min-w-[300px] max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, SKU..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
            >
              Search
            </button>
          </form>

          <FilterDropdown
            placeholder="All Brands"
            value={brandFilter}
            onChange={v => { setBrandFilter(v); setPage(1); }}
            onClear={() => { setBrandFilter(''); setPage(1); }}
            options={[{ value: '', label: 'All Brands' }, ...brands.map(b => ({ value: b.id, label: b.name }))]
            }
            searchable
          />

          <FilterDropdown
            placeholder="All Categories"
            value={categoryFilter}
            onChange={v => { setCategoryFilter(v); setSubCategoryFilter(''); setPage(1); }}
            onClear={() => { setCategoryFilter(''); setSubCategoryFilter(''); setPage(1); }}
            options={[{ value: '', label: 'All Categories' }, ...categories.filter(c => !c.parent_id).map(c => ({ value: c.id, label: c.name }))]}
            searchable
          />

          <FilterDropdown
            placeholder="All Subcategories"
            value={subCategoryFilter}
            onChange={v => { setSubCategoryFilter(v); setPage(1); }}
            onClear={() => { setSubCategoryFilter(''); setPage(1); }}
            disabled={!categoryFilter}
            options={[
              { value: '', label: 'All Subcategories' },
              ...categories.filter(c => c.parent_id && String(c.parent_id) === String(categoryFilter)).map(c => ({ value: c.id, label: c.name })),
            ]}
          />

          <FilterDropdown
            placeholder="All Status"
            value={statusFilter}
            onChange={v => { setStatusFilter(v); setPage(1); }}
            onClear={() => { setStatusFilter(''); setPage(1); }}
            options={[
              { value: '', label: 'All Status' },
              { value: 'in_stock', label: 'In Stock' },
              { value: 'low_stock', label: 'Low Stock' },
              { value: 'out_of_stock', label: 'Out of Stock' },
            ]}
          />

          {(search || categoryFilter || subCategoryFilter || brandFilter || statusFilter) && (
            <button
              onClick={() => { setSearch(''); setCategoryFilter(''); setSubCategoryFilter(''); setBrandFilter(''); setStatusFilter(''); setPage(1); }}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={inventory.length > 0 && selectedItems.length === inventory.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 accent-[#8B1A2F] rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Warehouse</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Stock</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Reserved</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(9)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                    No inventory items found
                  </td>
                </tr>
              ) : inventory.map((item) => (
                <tr key={item.variant_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.some(i => i.variant_id === item.variant_id)}
                      onChange={() => toggleSelectItem(item)}
                      className="w-4 h-4 accent-[#8B1A2F] rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image_url ? assetUrl(item.image_url) : DEFAULT_PRODUCT_IMAGE}
                        alt=""
                        onError={e => { if (e.currentTarget.src !== DEFAULT_PRODUCT_IMAGE) e.currentTarget.src = DEFAULT_PRODUCT_IMAGE; }}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{item.product_title}</p>
                        {(item.size || item.color) && (
                          <p className="text-sm text-gray-500">
                            {item.size && `Size: ${item.size}`}
                            {item.size && item.color && ' • '}
                            {item.color && `Color: ${item.color}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                    {item.variant_sku || item.sku || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.category_name || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.warehouse_name}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-medium text-gray-900">{item.live_stock ?? item.stock_quantity}</span>
                    <span className="text-xs text-gray-400 ml-1">/ {item.low_stock_threshold}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">
                    {item.reserved_quantity || 0}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Stock"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} items
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm font-medium">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {editingItem && (
        <StockEditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={handleItemUpdated}
        />
      )}

      {showBulkUpdate && (
        <BulkUpdateModal
          selectedItems={selectedItems}
          onClose={() => setShowBulkUpdate(false)}
          onSaved={handleBulkUpdated}
        />
      )}
    </div>
  );
}