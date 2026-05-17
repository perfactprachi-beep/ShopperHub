import { useState, useEffect } from 'react';
import { inventoryApi } from '../../api/inventoryApi.js';
import { getAdminCategories } from '../../api/adminApi.js';
import { assetUrl } from '../../utils/assetUrl.js';
import CategoryFilter from '../../components/ui/CategoryFilter.jsx';

function RestockModal({ item, onClose, onRestocked }) {
  const [quantity, setQuantity] = useState(item?.low_stock_threshold * 2 || 20);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await inventoryApi.adjustStock(item.id, {
        quantity_change: quantity,
        action_type: 'stock_added',
        notes: notes || 'Restock from low stock alert'
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
              Current stock: {item?.stock_quantity} • Threshold: {item?.low_stock_threshold}
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
              New stock will be: {(item?.stock_quantity || 0) + quantity}
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
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subCategoryFilter, setSubCategoryFilter] = useState('');
  const [restockingItem, setRestockingItem] = useState(null);
  
  const limit = 20;

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadLowStockItems();
  }, [page, categoryFilter, subCategoryFilter]);

  const loadCategories = async () => {
    try {
      const data = await getAdminCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadLowStockItems = async () => {
    setLoading(true);
    try {
      const { data } = await inventoryApi.getLowStockItems({
        page,
        limit,
        category_id: subCategoryFilter || categoryFilter || undefined
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

  const handleItemRestocked = (updatedItem) => {
    // Remove item from low stock list if it's no longer low stock
    if (updatedItem.stock_quantity > updatedItem.low_stock_threshold) {
      setItems(prev => prev.filter(item => item.id !== updatedItem.id));
      setTotal(prev => prev - 1);
    } else {
      // Update the item in the list
      setItems(prev => prev.map(item => 
        item.id === updatedItem.id ? { ...item, ...updatedItem } : item
      ));
    }
  };

  const getUrgencyLevel = (item) => {
    const ratio = item.stock_quantity / item.low_stock_threshold;
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
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-4">
          <CategoryFilter
            categories={categories}
            selectedCategory={categoryFilter}
            selectedSubCategory={subCategoryFilter}
            onCategoryChange={(catId) => {
              setCategoryFilter(catId);
              setSubCategoryFilter('');
              setPage(1);
            }}
            onSubCategoryChange={(subCatId) => {
              setSubCategoryFilter(subCatId);
              setPage(1);
            }}
          />

          {(categoryFilter || subCategoryFilter) && (
            <button
              onClick={() => {
                setCategoryFilter('');
                setSubCategoryFilter('');
                setPage(1);
              }}
              className="px-3 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear Filter
            </button>
          )}

          <div className="ml-auto text-sm text-gray-500">
            {total} items need attention
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-100 rounded animate-pulse" />
                <div className="h-8 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Good!</h3>
            <p className="text-gray-500">No items are currently running low on stock.</p>
          </div>
        ) : items.map((item) => {
          const urgency = getUrgencyLevel(item);
          return (
            <div key={item.id} className={`bg-white rounded-xl border shadow-sm p-6 ${
              urgency.level === 'critical' ? 'border-red-200 bg-red-50/30' :
              urgency.level === 'high' ? 'border-orange-200 bg-orange-50/30' :
              'border-yellow-200 bg-yellow-50/30'
            }`}>
              <div className="flex items-start gap-4 mb-4">
                {item.image_url ? (
                  <img
                    src={assetUrl(item.image_url)}
                    alt=""
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21,15 16,10 5,21"/>
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{item.product_title}</h3>
                  <p className="text-sm text-gray-500">{item.category_name}</p>
                  {(item.size || item.color) && (
                    <p className="text-xs text-gray-400 mt-1">
                      {item.size && `Size: ${item.size}`}
                      {item.size && item.color && ' • '}
                      {item.color && `Color: ${item.color}`}
                    </p>
                  )}
                </div>
                {getUrgencyBadge(item)}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Stock:</span>
                  <span className={`font-medium ${urgency.level === 'critical' ? 'text-red-600' : 'text-gray-900'}`}>
                    {item.stock_quantity}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Threshold:</span>
                  <span className="font-medium text-gray-900">{item.low_stock_threshold}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Warehouse:</span>
                  <span className="font-medium text-gray-900">{item.warehouse_name}</span>
                </div>

                {/* Stock Level Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Stock Level</span>
                    <span>{Math.round((item.stock_quantity / item.low_stock_threshold) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        urgency.level === 'critical' ? 'bg-red-500' :
                        urgency.level === 'high' ? 'bg-orange-500' :
                        'bg-yellow-500'
                      }`}
                      style={{ width: `${Math.min(100, (item.stock_quantity / item.low_stock_threshold) * 100)}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setRestockingItem(item)}
                  className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                    urgency.level === 'critical' 
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {urgency.level === 'critical' ? 'Urgent Restock' : 'Quick Restock'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm font-medium">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
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
    </div>
  );
}