import { useState, useEffect, useRef } from 'react';
import { inventoryApi } from '../../api/inventoryApi.js';
import { getAdminCategories } from '../../api/adminApi.js';
import { assetUrl } from '../../utils/assetUrl.js';
import CategoryFilter from '../../components/ui/CategoryFilter.jsx';

function StockEditModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState({
    stock_quantity: item?.stock_quantity || 0,
    low_stock_threshold: item?.low_stock_threshold || 10,
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await inventoryApi.updateInventoryItem(item.id, form);
      if (data.success) {
        onSaved(data.data);
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update stock');
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
      id: item.id,
      stock_quantity: item.stock_quantity,
      product_title: item.product_title
    }))
  );
  const [saving, setSaving] = useState(false);

  const handleQuantityChange = (id, quantity) => {
    setUpdates(prev => prev.map(item => 
      item.id === id ? { ...item, stock_quantity: parseInt(quantity) || 0 } : item
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await inventoryApi.bulkUpdateInventory(updates);
      if (data.success) {
        onSaved(data.data);
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] shadow-xl flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Bulk Update Stock</h2>
          <p className="text-sm text-gray-500 mt-1">{selectedItems.length} items selected</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3">
              {updates.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.product_title}</p>
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      min="0"
                      value={item.stock_quantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-center"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
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
              {saving ? 'Updating...' : 'Update All'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StockManagement() {
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subCategoryFilter, setSubCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  
  const limit = 20;

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadInventory();
  }, [page, categoryFilter, subCategoryFilter, statusFilter]);

  const loadCategories = async () => {
    try {
      const data = await getAdminCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadInventory = async () => {
    setLoading(true);
    try {
      const { data } = await inventoryApi.getInventory({
        page,
        limit,
        search: search || undefined,
        category_id: subCategoryFilter || categoryFilter || undefined,
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
      item.id === updatedItem.id ? { ...item, ...updatedItem } : item
    ));
  };

  const handleBulkUpdated = (updatedItems) => {
    const updatedMap = new Map(updatedItems.map(item => [item.id, item]));
    setInventory(prev => prev.map(item => 
      updatedMap.has(item.id) ? { ...item, ...updatedMap.get(item.id) } : item
    ));
    setSelectedItems([]);
  };

  const toggleSelectItem = (item) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          {(search || categoryFilter || subCategoryFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setCategoryFilter('');
                setSubCategoryFilter('');
                setStatusFilter('');
                setPage(1);
                loadInventory();
              }}
              className="px-3 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear Filters
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
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
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
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.some(i => i.id === item.id)}
                      onChange={() => toggleSelectItem(item)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.image_url ? (
                        <img
                          src={assetUrl(item.image_url)}
                          alt=""
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                      )}
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
                    <span className="font-medium text-gray-900">{item.stock_quantity}</span>
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