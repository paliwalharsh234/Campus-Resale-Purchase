import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Eye,
  ArrowRight,
} from 'lucide-react';
import listingService from '../../services/listingService';
import { formatPrice, timeAgo, statusColor } from '../../utils/formatters';

export default function MyListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Available' | 'Sold' | 'Reserved'

  const fetchMyListings = async () => {
    try {
      const res = await listingService.getMyListings();
      if (res.success) {
        setListings(res.listings || []);
      }
    } catch (err) {
      toast.error('Failed to load your listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const handleMarkAsSold = async (id) => {
    try {
      const res = await listingService.updateListingStatus(id, 'Sold');
      if (res.success) {
        toast.success('Listing marked as Sold!');
        setListings((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: 'Sold' } : item))
        );
      }
    } catch (err) {
      toast.error('Failed to update listing status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      const res = await listingService.deleteListing(id);
      if (res.success) {
        toast.success('Listing deleted.');
        setListings((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete listing.');
    }
  };

  const filteredListings =
    activeTab === 'All'
      ? listings
      : listings.filter((item) => item.status.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" /> My Listings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your campus listings, update availability, or mark items as sold.
          </p>
        </div>
        <Link
          to="/sell"
          className="btn-primary flex items-center gap-2 py-2 px-4 text-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Item
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-3 mb-6">
        {['All', 'Available', 'Reserved', 'Sold'].map((tab) => {
          const count =
            tab === 'All'
              ? listings.length
              : listings.filter((i) => i.status.toLowerCase() === tab.toLowerCase()).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Listings table or list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-24 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="card p-12 text-center max-w-md mx-auto my-8 border border-gray-100 space-y-3">
          <Package className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No {activeTab.toLowerCase()} listings</h3>
          <p className="text-xs text-gray-500">
            You don't have any items currently in this category.
          </p>
          <div className="pt-2">
            <Link to="/sell" className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5">
              List Item Now <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 card border border-gray-100 overflow-hidden shadow-sm">
          {filteredListings.map((item) => {
            const thumb =
              item.images && item.images.length > 0
                ? item.images[0].url
                : 'https://placehold.co/100x100?text=No+Image';

            return (
              <div
                key={item._id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/70 transition-colors"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={thumb}
                    alt={item.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-gray-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          statusColor[item.status.toLowerCase()] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">
                        {item.category}
                      </span>
                    </div>
                    <Link
                      to={`/listings/${item._id}`}
                      className="font-bold text-gray-900 text-sm hover:text-indigo-600 transition-colors truncate block"
                    >
                      {item.title}
                    </Link>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-extrabold text-sm text-gray-900">
                        {formatPrice(item.price)}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        Listed {timeAgo(item.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link
                    to={`/listings/${item._id}`}
                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="View item"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/listings/${item._id}/edit`}
                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit listing"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  {item.status !== 'Sold' && (
                    <button
                      onClick={() => handleMarkAsSold(item._id)}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Sold
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
