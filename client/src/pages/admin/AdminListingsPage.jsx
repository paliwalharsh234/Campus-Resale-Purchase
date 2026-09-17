import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Search, Trash2, Eye, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import { formatPrice, timeAgo, statusColor } from '../../utils/formatters';

export default function AdminListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.q = search.trim();
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await adminService.getListings(params);
      if (res.success) {
        setListings(res.listings || []);
      }
    } catch (err) {
      toast.error('Failed to load listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently remove "${title}"?`)) return;

    try {
      const res = await adminService.deleteListing(id);
      if (res.success) {
        toast.success(res.message);
        setListings((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      toast.error('Failed to remove listing.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Listings Moderation</h1>
        <p className="text-sm text-gray-500 mt-1">
          Inspect and moderate listings across all college campuses. Remove illicit or unauthorized goods.
        </p>
      </div>

      {/* Controls */}
      <div className="card p-4 border border-gray-200 flex flex-col sm:flex-row gap-3 justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field py-2 text-xs w-auto bg-white"
        >
          <option value="All">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Reserved">Reserved</option>
          <option value="Sold">Sold</option>
        </select>
      </div>

      {/* Table */}
      <div className="card border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Item</th>
                <th className="px-6 py-3">Campus</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Seller</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    Loading listings...
                  </td>
                </tr>
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No listings found.
                  </td>
                </tr>
              ) : (
                listings.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            item.images?.[0]?.url ||
                            'https://placehold.co/100x100?text=No+Image'
                          }
                          alt={item.title}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{item.title}</p>
                          <p className="text-gray-400 text-[11px]">{item.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-indigo-900">
                      {item.campus?.campusName || 'General'}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-gray-900">
                      {formatPrice(item.price)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{item.seller?.name || 'Unknown'}</p>
                      <p className="text-gray-400 text-[10px]">{item.seller?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                          statusColor[item.status.toLowerCase()] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/listings/${item._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100"
                          title="Open listing"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item._id, item.title)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                          title="Remove listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
