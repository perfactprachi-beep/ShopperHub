import { useState, useEffect } from 'react';
import { inventoryApi } from '../../api/inventoryApi.js';
import SearchableSelect from '../../components/ui/SearchableSelect.jsx';

export default function InventoryLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionTypeFilter, setActionTypeFilter] = useState('');
  
  const limit = 20;

  useEffect(() => {
    loadLogs();
  }, [page, actionTypeFilter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data } = await inventoryApi.getInventoryLogs({
        page,
        limit,
        action_type: actionTypeFilter || undefined
      });
      if (data.success) {
        setLogs(data.data.logs);
        setTotal(data.data.total);
      }
    } catch (error) {
      console.error('Failed to load inventory logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionTypeLabel = (actionType) => {
    const labels = {
      stock_added: 'Stock Added',
      stock_removed: 'Stock Removed',
      order_deduction: 'Order Deduction',
      return_restock: 'Return Restock',
      manual_update: 'Manual Update',
      transfer: 'Transfer'
    };
    return labels[actionType] || actionType;
  };

  const getActionTypeColor = (actionType) => {
    const colors = {
      stock_added: 'text-green-600 bg-green-50 border-green-200',
      stock_removed: 'text-red-600 bg-red-50 border-red-200',
      order_deduction: 'text-orange-600 bg-orange-50 border-orange-200',
      return_restock: 'text-blue-600 bg-blue-50 border-blue-200',
      manual_update: 'text-purple-600 bg-purple-50 border-purple-200',
      transfer: 'text-indigo-600 bg-indigo-50 border-indigo-200'
    };
    return colors[actionType] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getActionIcon = (actionType) => {
    const icons = {
      stock_added: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      ),
      stock_removed: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      ),
      order_deduction: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
      ),
      return_restock: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="1 4 1 10 7 10"/>
          <path d="M3.51 15a9 9 0 1 0 .49-3.87"/>
        </svg>
      ),
      manual_update: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      ),
      transfer: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="17 1 21 5 17 9"/>
          <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
          <polyline points="7 23 3 19 7 15"/>
          <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
        </svg>
      )
    };
    return icons[actionType] || (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
      </svg>
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Logs</h1>
          <p className="text-gray-600">Track all inventory changes and activities</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-4">
          <SearchableSelect
            value={actionTypeFilter}
            onChange={val => { setActionTypeFilter(val); setPage(1); }}
            options={[
              { value: 'stock_added',     label: 'Stock Added' },
              { value: 'stock_removed',   label: 'Stock Removed' },
              { value: 'order_deduction', label: 'Order Deduction' },
              { value: 'return_restock',  label: 'Return Restock' },
              { value: 'manual_update',   label: 'Manual Update' },
              { value: 'transfer',        label: 'Transfer' },
            ]}
            placeholder="All Actions"
            className="w-52"
          />

          <div className="ml-auto text-sm text-gray-500">
            {total} total entries
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6">
          <div className="space-y-4">
            {loading ? (
              [...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg">
                  <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
                  </div>
                  <div className="w-20 h-6 bg-gray-100 rounded animate-pulse" />
                  <div className="w-24 h-4 bg-gray-100 rounded animate-pulse" />
                </div>
              ))
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Logs Found</h3>
                <p className="text-gray-500">No inventory activities have been recorded yet.</p>
              </div>
            ) : logs.map((log) => (
              <div key={log.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${getActionTypeColor(log.action_type)}`}>
                  {getActionIcon(log.action_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 truncate">{log.product_title}</h3>
                    {(log.size || log.color) && (
                      <span className="text-sm text-gray-500">
                        ({log.size && `${log.size}`}{log.size && log.color && ', '}{log.color && `${log.color}`})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{log.warehouse_name}</span>
                    {log.admin_name && (
                      <>
                        <span>•</span>
                        <span>by {log.admin_name}</span>
                      </>
                    )}
                    {log.notes && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-xs">{log.notes}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getActionTypeColor(log.action_type)}`}>
                    {getActionTypeLabel(log.action_type)}
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-lg font-bold ${log.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {log.quantity > 0 ? '+' : ''}{log.quantity}
                  </div>
                </div>

                <div className="text-right text-sm text-gray-500 min-w-[100px]">
                  <div>{new Date(log.created_at).toLocaleDateString()}</div>
                  <div>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} entries
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
    </div>
  );
}