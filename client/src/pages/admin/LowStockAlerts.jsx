import { useState, useEffect } from 'react';
import { inventoryApi } from '../../api/inventoryApi.js';
import { getAdminCategories, getAdminBrands, deleteProduct } from '../../api/adminApi.js';
import { assetUrl } from '../../utils/assetUrl.js';
import { DEFAULT_PRODUCT_IMAGE } from '../../utils/getProductPlaceholder.js';
import FilterDropdown from '../../components/ui/FilterDropdown.jsx';

function RestockModal({ item, onClose, onRestocked }) {
  const [quantity, setQuantity] = useState(item?.low_stock_threshold * 2 || 20);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const currentStock = item.live_stock ?? item.stock_quantity ?? 0;
      const newStock = currentStock + quantity;
      const { data } = await inventoryApi.updateVariantStock(item.variant_id, {
        stock_quantity: newStock,
        low_stock_threshold: item.low_stock_threshold,
        notes: notes.trim() || undefined,
      });
      if (data.success) {
        onRestocked(data.data);
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to restock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Restock Item</h2>
          <p className="text-sm text-gray-500 mt-1">{item?.product_title}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span className="text-sm font-medium">Low Stock Alert</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Current stock: {item?.live_stock ?? item?.stock_quantity} • Threshold: {item?.low_stock_threshold}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity to Add
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              New stock will be: {((item?.live_stock ?? item?.stock_quantity) || 0) + quantity}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Reason for restocking..."
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
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Restocking...' : 'Restock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LowStockAlerts() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subCategoryFilter, setSubCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [restockingItem, setRestockingItem] = useState(null);
  const [discontinuingItem, setDiscontinuingItem] = useState(null);
  const [discontinuing, setDiscontinuing] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  const limit = 20;

  useEffect(() => {
    Promise.all([getAdminCategories(), getAdminBrands()])
      .then(([cats, brs]) => { setCategories(cats); setBrands(brs); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadLowStockItems();
  }, [page, categoryFilter, subCategoryFilter, brandFilter]);

  const loadLowStockItems = async () => {
    setLoading(true);
    try {
      const { data } = await inventoryApi.getLowStockItems({
        page,
        limit,
        category_id: subCategoryFilter || categoryFilter || undefined,
        brand_id: brandFilter || undefined
      });
      if (data.success) {
        setItems(data.data.items);
        setTotal(data.data.total);
      }
    } catch (error) {
      console.error('Failed to load low stock items:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    setSuccessToast(message);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleItemRestocked = (updatedItem) => {
    const currentStock = updatedItem.live_stock ?? updatedItem.stock_quantity;
    if (currentStock > updatedItem.low_stock_threshold) {
      setItems(prev => prev.filter(item => item.variant_id !== updatedItem.variant_id));
      setTotal(prev => prev - 1);
    } else {
      setItems(prev => prev.map(item =>
        item.variant_id === updatedItem.variant_id ? { ...item, ...updatedItem } : item
      ));
    }
    showToast('Stock updated successfully!');
  };

  const handleDiscontinue = async () => {
    if (!discontinuingItem) return;
    setDiscontinuing(true);
    try {
      await deleteProduct(discontinuingItem.product_id);
      const removed = items.filter(i => i.product_id === discontinuingItem.product_id).length;
      setItems(prev => prev.filter(i => i.product_id !== discontinuingItem.product_id));
      setTotal(prev => prev - removed);
      setDiscontinuingItem(null);
    } catch {
      alert('Failed to discontinue product. Please try again.');
    } finally {
      setDiscontinuing(false);
    }
  };

  const getUrgencyLevel = (item) => {
    const stock = item.live_stock ?? item.stock_quantity;
    const ratio = stock / item.low_stock_threshold;
    if (ratio === 0) return { level: 'critical', color: 'red', label: 'Out of Stock' };
    if (ratio <= 0.5) return { level: 'high', color: 'orange', label: 'Very Low' };
    return { level: 'medium', color: 'yellow', label: 'Low Stock' };
  };

  const getUrgencyBadge = (item) => {
    const urgency = getUrgencyLevel(item);
    const colorClasses = {
      red: 'bg-red-100 text-red-800 border-red-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colorClasses[urgency.color]}`}>
        {urgency.label}
      </span>
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Low Stock Alerts</h1>
          <p className="text-gray-600">Monitor and restock items running low</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-600">Critical: {items.filter(item => getUrgencyLevel(item).level === 'critical').length}</span>
          <div className="w-3 h-3 bg-orange-500 rounded-full ml-4"></div>
          <span className="text-gray-600">High: {items.filter(item => getUrgencyLevel(item).level === 'high').length}</span>
          <div className="w-3 h-3 bg-yellow-500 rounded-full ml-4"></div>
          <span className="text-gray-600">Medium: {items.filter(item => getUrgencyLevel(item).level === 'medium').length}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <FilterDropdown
            placeholder="All Brands"
            value={brandFilter}
            onChange={v => { setBrandFilter(v); setPage(1); }}
            onClear={() => { setBrandFilter(''); setPage(1); }}
            options={[{ value: '', label: 'All Brands' }, ...brands.map(b => ({ value: b.id, label: b.name }))]}
          />

          <FilterDropdown
            placeholder="All Categories"
            value={categoryFilter}
            onChange={v => { setCategoryFilter(v); setSubCategoryFilter(''); setPage(1); }}
            onClear={() => { setCategoryFilter(''); setSubCategoryFilter(''); setPage(1); }}
            options={[{ value: '', label: 'All Categories' }, ...categories.filter(c => !c.parent_id).map(c => ({ value: c.id, label: c.name }))]}
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

          {(categoryFilter || subCategoryFilter || brandFilter) && (
            <button
              onClick={() => { setCategoryFilter(''); setSubCategoryFilter(''); setBrandFilter(''); setPage(1); }}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Clear all
            </button>
          )}

          <div className="ml-auto text-sm text-gray-500">
            {total} items need attention
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Variant</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Current Stock</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Threshold</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Stock Level</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Warehouse</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg animate-pulse shrink-0" />
                        <div className="h-4 bg-gray-100 rounded animate-pulse w-32" />
                      </div>
                    </td>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <p className="text-base font-medium text-gray-900">All Good!</p>
                    <p className="text-gray-500 text-sm mt-1">No items are currently running low on stock.</p>
                  </td>
                </tr>
              ) : items.map((item) => {
                const urgency = getUrgencyLevel(item);
                const stock = item.live_stock ?? item.stock_quantity;
                const pct = Math.min(100, Math.round((stock / item.low_stock_threshold) * 100));
                return (
                  <tr key={item.variant_id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url ? assetUrl(item.image_url) : DEFAULT_PRODUCT_IMAGE}
                          alt=""
                          onError={e => { if (e.currentTarget.src !== DEFAULT_PRODUCT_IMAGE) e.currentTarget.src = DEFAULT_PRODUCT_IMAGE; }}
                          className="w-10 h-10 object-cover rounded-lg shrink-0"
                        />
                        <span className="font-medium text-gray-900 max-w-[180px] truncate">{item.product_title}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-gray-500">{item.category_name || '—'}</td>

                    {/* Variant */}
                    <td className="px-4 py-3 text-gray-500">
                      {item.size || item.color ? (
                        <span>
                          {item.size && <span>{item.size}</span>}
                          {item.size && item.color && <span className="text-gray-300 mx-1">•</span>}
                          {item.color && <span>{item.color}</span>}
                        </span>
                      ) : '—'}
                    </td>

                    {/* Current Stock */}
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold text-base ${
                        urgency.level === 'critical' ? 'text-red-600' :
                        urgency.level === 'high' ? 'text-orange-600' : 'text-yellow-600'
                      }`}>
                        {stock}
                      </span>
                    </td>

                    {/* Threshold */}
                    <td className="px-4 py-3 text-center text-gray-600">{item.low_stock_threshold}</td>

                    {/* Stock Level Bar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              urgency.level === 'critical' ? 'bg-red-500' :
                              urgency.level === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                      </div>
                    </td>

                    {/* Warehouse */}
                    <td className="px-4 py-3 text-gray-500">{item.warehouse_name || <span className="text-gray-300 italic">Not assigned</span>}</td>

                    {/* Status Badge */}
                    <td className="px-4 py-3 text-center">{getUrgencyBadge(item)}</td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setRestockingItem(item)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors whitespace-nowrap ${
                            urgency.level === 'critical'
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-[#8B1A2F] hover:bg-[#6d1424]'
                          }`}
                        >
                          {urgency.level === 'critical' ? 'Urgent Restock' : 'Quick Restock'}
                        </button>
                        {urgency.level === 'critical' && (
                          <button
                            onClick={() => setDiscontinuingItem(item)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors whitespace-nowrap"
                          >
                            Discontinue
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} items
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                «
              </button>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-xs text-gray-400">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        page === p
                          ? 'bg-[#8B1A2F] text-white border-[#8B1A2F]'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg animate-fade-in">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span className="text-sm font-medium">{successToast}</span>
        </div>
      )}

      {/* Restock Modal */}
      {restockingItem && (
        <RestockModal
          item={restockingItem}
          onClose={() => setRestockingItem(null)}
          onRestocked={handleItemRestocked}
        />
      )}

      {/* Discontinue Confirmation */}
      {discontinuingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Discontinue Product?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium text-gray-700">{discontinuingItem.product_title}</span> will be hidden from the catalog immediately. You can re-activate it anytime from Admin → Products.
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDiscontinuingItem(null)}
                disabled={discontinuing}
                className="flex-1 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDiscontinue}
                disabled={discontinuing}
                className="flex-1 px-4 py-2 text-sm font-medium bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50"
              >
                {discontinuing ? 'Discontinuing…' : 'Yes, Discontinue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}