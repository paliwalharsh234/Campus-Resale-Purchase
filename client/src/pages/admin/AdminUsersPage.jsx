import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Search, ShieldAlert, CheckCircle, UserCheck, AlertTriangle } from 'lucide-react';
import adminService from '../../services/adminService';
import { timeAgo } from '../../utils/formatters';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSuspended, setFilterSuspended] = useState('All');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.q = search.trim();
      if (filterSuspended === 'Active') params.isSuspended = 'false';
      if (filterSuspended === 'Suspended') params.isSuspended = 'true';

      const res = await adminService.getUsers(params);
      if (res.success) {
        setUsers(res.users || []);
      }
    } catch (err) {
      toast.error('Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filterSuspended]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleSuspend = async (userId, currentName, isSuspended) => {
    const action = isSuspended ? 'un-suspend' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} ${currentName}?`)) return;

    try {
      const res = await adminService.toggleUserSuspension(userId);
      if (res.success) {
        toast.success(res.message);
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isSuspended: res.isSuspended } : u))
        );
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update user status.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Student & User Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review student accounts across campuses, verify enrollment integrity, or suspend violators.
        </p>
      </div>

      {/* Controls */}
      <div className="card p-4 border border-gray-200 flex flex-col sm:flex-row gap-3 justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={filterSuspended}
            onChange={(e) => setFilterSuspended(e.target.value)}
            className="input-field py-2 text-xs w-auto bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Accounts</option>
            <option value="Suspended">Suspended Accounts</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Student Name</th>
                <th className="px-6 py-3">Campus</th>
                <th className="px-6 py-3">Course / Branch</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div>
                        <p className="font-bold text-gray-900">{u.name}</p>
                        <p className="text-gray-400 text-[11px] font-mono">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-indigo-900">
                        {u.campus?.campusName || 'Unknown'}
                      </span>
                      <p className="text-gray-400 text-[10px]">@{u.campus?.emailDomain}</p>
                    </td>
                    <td className="px-6 py-4">
                      {u.course || '—'} {u.branch ? `· ${u.branch}` : ''}
                      {u.graduationYear ? ` ('${u.graduationYear.toString().slice(-2)})` : ''}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.isSuspended ? (
                        <span className="inline-flex items-center gap-1 font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full text-[10px]">
                          <AlertTriangle className="w-3 h-3" /> Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px]">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleSuspend(u._id, u.name, u.isSuspended)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                            u.isSuspended
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          {u.isSuspended ? 'Reactivate' : 'Suspend'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
