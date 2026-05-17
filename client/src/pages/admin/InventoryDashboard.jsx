import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inventoryApi } from '../../api/inventoryApi.js';

function StatCard({ title, value, icon, color = 'blue', trend }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value?.toLocaleString() || 0}</p>
          {trend && (
            <p className="text-xs text-gray-500 mt-1">{trend}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg border flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function RecentActivityTable({ activities, loading }) {
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
      stock_added: 'text-green-600 bg-green-50',
      stock_removed: 'text-red-600 bg-red-50',
      order_deduction: 'text-orange-600 bg-orange-50',
      return_restock: 'text-blue-600 bg-blue-50',
      manual_update: 'text-purple-600 bg-purple-50',
      transfer: 'text-indigo-600 bg-indigo-50'
    };
    return colors[actionType] || 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <div className="w-8 h-8 bg-gray-100 rounded animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
            </div>
            <div className="w-16 h-6 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getActionTypeColor(activity.action_type)}`}>
            {activity.quantity > 0 ? '+' : ''}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {activity.product_title}
              {activity.size && ` - ${activity.size}`}
              {activity.color && ` - ${activity.color}`}
            </p>
            <p className="text-xs text-gray-500">
              {getActionTypeLabel(activity.action_type)} • {activity.warehouse_name}
              {activity.admin_name && ` • by ${activity.admin_name}`}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-semibold ${activity.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {activity.quantity > 0 ? '+' : ''}{activity.quantity}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(activity.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
      {activities.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No recent activity</p>
        </div>
      )}
    </div>
  );
}

export default function InventoryDashboard() {
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data } = await inventoryApi.getDashboardStats();
      if (data.success) {
        setStats(data.data.stats);
        setRecentActivity(data.data.recent_activity);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Products"
          value={stats.total_products}
          color="blue"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          }
        />
        <StatCard
          title="In Stock"
          value={stats.in_stock_count}
          color="green"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          }
        />
        <StatCard
          title="Low Stock"
          value={stats.low_stock_count}
          color="yellow"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          }
        />
        <StatCard
          title="Out of Stock"
          value={stats.out_of_stock_count}
          color="red"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          }
        />
        <StatCard
          title="Total Warehouses"
          value={stats.total_warehouses}
          color="purple"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18"/>
              <path d="M5 21V7l8-4v18"/>
              <path d="M19 21V11l-6-4"/>
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/inventory/stocks"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Manage Stock</p>
              <p className="text-sm text-gray-500">Update inventory levels</p>
            </div>
          </Link>

          <Link
            to="/admin/inventory/low-stock"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center group-hover:bg-yellow-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Low Stock Alerts</p>
              <p className="text-sm text-gray-500">Review items needing restock</p>
            </div>
          </Link>

          <Link
            to="/admin/inventory/warehouses"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18"/>
                <path d="M5 21V7l8-4v18"/>
                <path d="M19 21V11l-6-4"/>
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Warehouses</p>
              <p className="text-sm text-gray-500">Manage warehouse locations</p>
            </div>
          </Link>

          <Link
            to="/admin/inventory/logs"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center group-hover:bg-gray-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Activity Logs</p>
              <p className="text-sm text-gray-500">Track inventory changes</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Link
            to="/admin/inventory/logs"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </Link>
        </div>
        <div className="p-6">
          <RecentActivityTable activities={recentActivity} loading={loading} />
        </div>
      </div>
    </div>
  );
}