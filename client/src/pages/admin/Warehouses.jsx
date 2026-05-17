import { useState, useEffect } from 'react';
import { inventoryApi } from '../../api/inventoryApi.js';

function WarehouseModal({ warehouse, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: warehouse?.name || '',
    location: warehouse?.location || '',
    manager_name: warehouse?.manager_name || '',
    contact_number: warehouse?.contact_number || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = warehouse?.id 
        ? await inventoryApi.updateWarehouse(warehouse.id, form)
        : await inventoryApi.createWarehouse(form);
      
      if (data.success) {
        onSaved(data.data);
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save warehouse');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {warehouse?.id ? 'Edit Warehouse' : 'Add New Warehouse'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warehouse Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
              placeholder="Main Warehouse"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
              placeholder="Mumbai, Maharashtra"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manager Name
            </label>
            <input
              type="text"
              value={form.manager_name}
              onChange={(e) => setForm(f => ({ ...f, manager_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number
            </label>
            <input
              type="tel"
              value={form.contact_number}
              onChange={(e) => setForm(f => ({ ...f, contact_number: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="+91 9876543210"
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
              {saving ? 'Saving...' : warehouse?.id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalWarehouse, setModalWarehouse] = useState(undefined); // undefined=closed, null=new, obj=edit

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    setLoading(true);
    try {
      const { data } = await inventoryApi.getWarehouses();
      if (data.success) {
        setWarehouses(data.data);
      }
    } catch (error) {
      console.error('Failed to load warehouses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWarehouseSaved = (savedWarehouse) => {
    if (modalWarehouse?.id) {
      // Update existing
      setWarehouses(prev => prev.map(w => 
        w.id === savedWarehouse.id ? savedWarehouse : w
      ));
    } else {
      // Add new
      setWarehouses(prev => [savedWarehouse, ...prev]);
    }
  };

  const handleDeleteWarehouse = async (warehouse) => {
    if (!confirm(`Are you sure you want to delete "${warehouse.name}"?`)) return;
    
    try {
      const { data } = await inventoryApi.deleteWarehouse(warehouse.id);
      if (data.success) {
        setWarehouses(prev => prev.filter(w => w.id !== warehouse.id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete warehouse');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouses</h1>
          <p className="text-gray-600">Manage warehouse locations and details</p>
        </div>
        <button
          onClick={() => setModalWarehouse(null)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Warehouse
        </button>
      </div>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-100 rounded flex-1 animate-pulse" />
                  <div className="h-8 bg-gray-100 rounded w-16 animate-pulse" />
                </div>
              </div>
            </div>
          ))
        ) : warehouses.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18"/>
                <path d="M5 21V7l8-4v18"/>
                <path d="M19 21V11l-6-4"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Warehouses</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first warehouse location.</p>
            <button
              onClick={() => setModalWarehouse(null)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Warehouse
            </button>
          </div>
        ) : warehouses.map((warehouse) => (
          <div key={warehouse.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18"/>
                  <path d="M5 21V7l8-4v18"/>
                  <path d="M19 21V11l-6-4"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{warehouse.name}</h3>
                <p className="text-sm text-gray-500 truncate">{warehouse.location}</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {warehouse.manager_name && (
                <div className="flex items-center gap-2 text-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span className="text-gray-600">Manager:</span>
                  <span className="font-medium text-gray-900">{warehouse.manager_name}</span>
                </div>
              )}
              
              {warehouse.contact_number && (
                <div className="flex items-center gap-2 text-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <span className="text-gray-600">Contact:</span>
                  <span className="font-medium text-gray-900">{warehouse.contact_number}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{warehouse.inventory_count || 0}</p>
                  <p className="text-xs text-gray-500">Products</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{warehouse.total_stock || 0}</p>
                  <p className="text-xs text-gray-500">Total Stock</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setModalWarehouse(warehouse)}
                className="flex-1 px-3 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteWarehouse(warehouse)}
                className="px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalWarehouse !== undefined && (
        <WarehouseModal
          warehouse={modalWarehouse}
          onClose={() => setModalWarehouse(undefined)}
          onSaved={handleWarehouseSaved}
        />
      )}
    </div>
  );
}