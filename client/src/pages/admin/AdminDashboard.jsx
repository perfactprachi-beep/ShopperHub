import { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { getDashboardStats } from '../../api/adminApi.js';

const STATUS_COLORS = {
  pending:   '#F59E0B',
  confirmed: '#3B82F6',
  shipped:   '#8B5CF6',
  delivered: '#10B981',
  cancelled: '#EF4444',
};

function IconCart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}

function IconRevenue() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function IconPackage() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}

function StatCard({ label, value, Icon, iconBg, iconColor, borderColor }) {
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 ${borderColor}`}>
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <span className={iconColor}><Icon /></span>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5 leading-none">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 h-24 animate-pulse border border-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return <p className="text-red-500">Failed to load dashboard stats.</p>;

  const ordersByStatus = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    count: stats.recentOrders.filter(o => o.status === s).length,
  }));

  const salesData = stats.salesByDay.map(row => ({
    day: new Date(row.day).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    revenue: parseFloat(row.revenue),
  }));

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          Icon={IconCart}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          borderColor="border-l-blue-400"
        />
        <StatCard
          label="Total Revenue"
          value={`₹${stats.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          Icon={IconRevenue}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
          borderColor="border-l-emerald-400"
        />
        <StatCard
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          Icon={IconUsers}
          iconBg="bg-violet-50"
          iconColor="text-violet-500"
          borderColor="border-l-violet-400"
        />
        <StatCard
          label="Active Products"
          value={stats.totalProducts.toLocaleString()}
          Icon={IconPackage}
          iconBg="bg-rose-50"
          iconColor="text-rose-500"
          borderColor="border-l-rose-400"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Revenue Trend</h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 30 days</p>
            </div>
          </div>
          {salesData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-300">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <p className="text-sm mt-2">No sales data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8B1A2F" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#8B1A2F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }}
                  formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8B1A2F" fill="url(#revGradient)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Orders by Status</h2>
            <p className="text-xs text-gray-400 mt-0.5">Recent orders breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ordersByStatus} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} allowDecimals={false} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} width={70} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
              <Bar dataKey="count" fill="#8B1A2F" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Recent Orders</h2>
            <p className="text-xs text-gray-400 mt-0.5">{stats.recentOrders.length} most recent</p>
          </div>
        </div>
        {stats.recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-300">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <p className="text-sm mt-2">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Order ID</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-gray-400">#{order.id}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{order.customer_name || '—'}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-800">
                      ₹{parseFloat(order.total).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                        style={{
                          backgroundColor: STATUS_COLORS[order.status] + '18',
                          color: STATUS_COLORS[order.status],
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
