import { useEffect, useState } from 'react';
import { getAdminUsers } from '../../api/adminApi.js';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers({ page, limit, search: search || undefined });
      setUsers(data.users);
      setTotal(data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-0 max-w-sm">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="input flex-1"
          />
          <button type="submit" className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Search
          </button>
        </form>
        {!loading && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-600">
            <span className="font-bold text-gray-800">{total}</span> users
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Gender</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Points</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(8)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-300">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <p className="text-sm text-gray-400">No users found</p>
                  </div>
                </td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#8B1A2F] text-white flex items-center justify-center text-xs font-bold">
                        {u.full_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="font-medium">{u.full_name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 text-gray-500">{u.phone || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{u.gender || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.role === 'admin' ? 'bg-[#8B1A2F]/10 text-[#8B1A2F]' : 'bg-gray-100 text-gray-600'
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-right">{u.first_citizen_points?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{u.order_count}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(u.created_at).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>{total} users</span>
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
    </div>
  );
}
