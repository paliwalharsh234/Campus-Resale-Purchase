import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bookmark, PackageX, Trash2, ArrowRight } from 'lucide-react';
import socialService from '../../services/socialService';
import ProductCard from '../../components/listings/ProductCard';

export default function SavedItemsPage() {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      const res = await socialService.getSavedItems();
      if (res.success) {
        setSavedItems(res.savedItems || []);
      }
    } catch (err) {
      toast.error('Failed to load saved items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (e, listingId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await socialService.unsaveItem(listingId);
      toast.success('Removed from saved items');
      setSavedItems((prev) => prev.filter((item) => item._id !== listingId));
    } catch (err) {
      toast.error('Could not remove item');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-indigo-600" /> Saved Items
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Items from your campus that you've bookmarked for later.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-64 animate-pulse bg-gray-200/60 rounded-xl" />
          ))}
        </div>
      ) : savedItems.length === 0 ? (
        <div className="card p-12 text-center max-w-md mx-auto my-8 border border-gray-100 space-y-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No saved items yet</h3>
          <p className="text-xs text-gray-500">
            Browse items on the marketplace and click "Save Item" to bookmark them here.
          </p>
          <div className="pt-2">
            <Link to="/marketplace" className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5">
              Explore Marketplace <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {savedItems.map((listing) => (
            <div key={listing._id} className="relative group">
              <ProductCard listing={listing} />
              <button
                onClick={(e) => handleRemove(e, listing._id)}
                className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-full shadow transition-colors"
                title="Remove from wishlist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
