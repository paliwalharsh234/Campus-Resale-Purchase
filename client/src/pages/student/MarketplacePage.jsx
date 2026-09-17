import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Plus,
  ShoppingBag,
  Sparkles,
  RotateCcw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  PackageX,
} from 'lucide-react';
import listingService from '../../services/listingService';
import ProductCard from '../../components/listings/ProductCard';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  'All',
  'Electronics',
  'Books',
  'Furniture',
  'Cycles',
  'Vehicles',
  'Clothing',
  'Hostel Items',
  'Study Materials',
  'Accessories',
  'Sports',
  'Appliances',
  'Other',
];

const CONDITIONS = ['All', 'New', 'Like New', 'Good', 'Fair', 'Used'];

export default function MarketplacePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Read URL query params or defaults
  const currentQuery = searchParams.get('q') || '';
  const currentCategory = searchParams.get('category') || 'All';
  const currentCondition = searchParams.get('condition') || 'All';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentFreeOnly = searchParams.get('freeOnly') === 'true';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Local state for search bar input to prevent excessive refetches while typing
  const [searchInput, setSearchInput] = useState(currentQuery);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12,
        sort: currentSort,
      };

      if (currentQuery) params.q = currentQuery;
      if (currentCategory && currentCategory !== 'All') params.category = currentCategory;
      if (currentCondition && currentCondition !== 'All') params.condition = currentCondition;
      if (currentFreeOnly) {
        params.freeOnly = true;
      } else {
        if (currentMinPrice) params.minPrice = currentMinPrice;
        if (currentMaxPrice) params.maxPrice = currentMaxPrice;
      }

      const res = await listingService.getListings(params);
      if (res.success) {
        setListings(res.listings || []);
        setTotalCount(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching marketplace listings:', err);
    } finally {
      setLoading(false);
    }
  }, [
    currentQuery,
    currentCategory,
    currentCondition,
    currentMinPrice,
    currentMaxPrice,
    currentFreeOnly,
    currentSort,
    currentPage,
  ]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Update query params helper
  const updateFilter = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.keys(updates).forEach((key) => {
      const val = updates[key];
      if (val === null || val === undefined || val === '' || val === 'All' || val === false) {
        newParams.delete(key);
      } else {
        newParams.set(key, val);
      }
    });
    // Reset to page 1 on filter changes unless page itself is being changed
    if (!('page' in updates)) {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter({ q: searchInput.trim() });
  };

  const resetAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Campus Banner / Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white mb-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block bg-white/20 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            🎓 {user?.campus?.campusName || 'Your Campus Marketplace'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Campus Marketplace
          </h1>
          <p className="text-indigo-100 text-sm mt-1 max-w-xl">
            Browse verified listings from students at your college. Transact safely within campus.
          </p>
        </div>
        <Link
          to="/sell"
          className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-md flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Sell an Item
        </Link>
      </div>

      {/* Category Horizontal Pill Filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = currentCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => updateFilter({ category: cat })}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Search Bar & Secondary Controls */}
      <div className="card p-4 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border border-gray-100">
        {/* Search input form */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items by title or description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input-field pl-9 pr-20"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filters and Sort */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Free items only toggle */}
          <label
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
              currentFreeOnly
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <input
              type="checkbox"
              checked={currentFreeOnly}
              onChange={(e) => updateFilter({ freeOnly: e.target.checked })}
              className="w-3.5 h-3.5 text-emerald-600 rounded"
            />
            <span>Free Only (₹0)</span>
          </label>

          {/* Condition selector */}
          <select
            value={currentCondition}
            onChange={(e) => updateFilter({ condition: e.target.value })}
            className="input-field py-2 text-xs w-auto bg-white"
          >
            <option value="All">All Conditions</option>
            {CONDITIONS.filter((c) => c !== 'All').map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Sort selector */}
          <div className="relative">
            <select
              value={currentSort}
              onChange={(e) => updateFilter({ sort: e.target.value })}
              className="input-field py-2 text-xs w-auto bg-white pr-7"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Reset Filters button */}
          {(currentQuery ||
            currentCategory !== 'All' ||
            currentCondition !== 'All' ||
            currentFreeOnly ||
            currentMinPrice ||
            currentMaxPrice ||
            currentSort !== 'newest') && (
            <button
              onClick={resetAllFilters}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs flex items-center gap-1 font-medium"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid & Results Info */}
      <div className="mb-4 flex items-center justify-between text-xs text-gray-500">
        <p>
          Showing <span className="font-bold text-gray-900">{listings.length}</span> of{' '}
          <span className="font-bold text-gray-900">{totalCount}</span> listings
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card h-72 animate-pulse bg-gray-200/70 rounded-xl" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        /* Empty State */
        <div className="card p-12 text-center border border-gray-100 max-w-lg mx-auto my-12 space-y-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <PackageX className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No items found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            We couldn't find any listings matching your search or filters in your campus marketplace.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button onClick={resetAllFilters} className="btn-secondary text-xs py-2 px-4">
              Clear Filters
            </button>
            <Link to="/sell" className="btn-primary text-xs py-2 px-4">
              List an Item
            </Link>
          </div>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((item) => (
            <ProductCard key={item._id} listing={item} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            disabled={currentPage <= 1}
            onClick={() => updateFilter({ page: currentPage - 1 })}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>
          <span className="text-xs font-semibold text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => updateFilter({ page: currentPage + 1 })}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      )}
    </div>
  );
}
