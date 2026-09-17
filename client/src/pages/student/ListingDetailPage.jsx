import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  MapPin,
  Calendar,
  User,
  GraduationCap,
  Tag,
  ArrowLeft,
  CheckCircle,
  Clock,
  Trash2,
  Edit,
  MessageSquare,
  Bookmark,
  Share2,
} from 'lucide-react';
import listingService from '../../services/listingService';
import socialService from '../../services/socialService';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, timeAgo, conditionColor, statusColor } from '../../utils/formatters';

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await listingService.getListingById(id);
        if (res.success) {
          setListing(res.listing);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load listing.');
        navigate('/marketplace');
      } finally {
        setLoading(false);
      }
    };

    const checkSavedStatus = async () => {
      try {
        const res = await socialService.checkIfSaved(id);
        if (res.success) {
          setIsSaved(res.isSaved);
        }
      } catch (err) {
        // Silent fail on saved status check
      }
    };

    fetchListing();
    checkSavedStatus();
  }, [id, navigate]);

  const isOwner = user && listing && (listing.seller?._id === user.id || user.role === 'admin');

  const handleToggleSave = async () => {
    setSaveLoading(true);
    try {
      if (isSaved) {
        await socialService.unsaveItem(id);
        setIsSaved(false);
        toast.success('Removed from saved items.');
      } else {
        await socialService.saveItem(id);
        setIsSaved(true);
        toast.success('Saved to your wishlist!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update saved status.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleContactSeller = async () => {
    try {
      const res = await socialService.getOrCreateConversation(id);
      if (res.success && res.conversation) {
        navigate(`/dashboard/messages?conversationId=${res.conversation._id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Could not start conversation.');
    }
  };

  const handleMarkAsSold = async () => {
    if (!window.confirm('Are you sure you want to mark this item as Sold?')) return;
    setStatusUpdating(true);
    try {
      const res = await listingService.updateListingStatus(id, 'Sold');
      if (res.success) {
        toast.success('Listing marked as Sold!');
        setListing((prev) => ({ ...prev, status: 'Sold' }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      const res = await listingService.deleteListing(id);
      if (res.success) {
        toast.success('Listing deleted successfully.');
        navigate('/marketplace');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete listing.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Check out this ${listing.title} on Campus Resale!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!listing) return null;

  const images =
    listing.images && listing.images.length > 0
      ? listing.images
      : [{ url: 'https://placehold.co/600x400?text=No+Image' }];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 relative">
            <img
              src={images[activeImageIndex]?.url}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            {listing.price === 0 && (
              <span className="absolute top-4 left-4 bg-emerald-500 text-white font-extrabold text-sm px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                FREE ITEM
              </span>
            )}
            <span
              className={`absolute top-4 right-4 font-bold text-xs px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm ${
                statusColor[listing.status.toLowerCase()] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {listing.status}
            </span>
          </div>

          {/* Thumbnail list */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIndex === idx
                      ? 'border-indigo-600 shadow-sm'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Listing Details & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card p-6 border border-gray-100 shadow-sm space-y-4">
            {/* Title & Price */}
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  <Tag className="w-3 h-3" /> {listing.category}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {timeAgo(listing.createdAt)}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                {listing.title}
              </h1>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-3xl font-black text-gray-900">
                  {formatPrice(listing.price)}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    conditionColor[listing.condition] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Condition: {listing.condition}
                </span>
              </div>
            </div>

            {/* Safe campus meeting location */}
            <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                  Safe Campus Meeting Point
                </p>
                <p className="text-sm font-medium text-indigo-800">{listing.meetingPoint}</p>
                <p className="text-xs text-indigo-600/80 mt-0.5">
                  Campus: {listing.campus?.campusName}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="pt-2 border-t border-gray-100">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Description
              </h2>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Actions for Buyer vs Owner */}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              {isOwner ? (
                <div className="space-y-2">
                  <div className="p-2.5 bg-amber-50 rounded-lg text-xs text-amber-800 font-medium">
                    This is your listing. You can manage or update it below.
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/listings/${listing._id}/edit`}
                      className="btn-secondary flex items-center justify-center gap-1.5 py-2 text-sm"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="flex items-center justify-center gap-1.5 py-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                  {listing.status !== 'Sold' && (
                    <button
                      onClick={handleMarkAsSold}
                      disabled={statusUpdating}
                      className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle className="w-4 h-4" /> Mark as Sold
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handleContactSeller}
                    className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base shadow-lg shadow-indigo-100"
                  >
                    <MessageSquare className="w-5 h-5" /> Contact Seller
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={handleToggleSave}
                      disabled={saveLoading}
                      className={`btn-secondary flex-1 py-2 text-xs flex items-center justify-center gap-1.5 ${
                        isSaved ? 'text-indigo-600 border-indigo-300 bg-indigo-50/50' : ''
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-indigo-600' : ''}`} />
                      {isSaved ? 'Saved' : 'Save Item'}
                    </button>
                    <button
                      onClick={handleShare}
                      className="btn-secondary flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Seller Card */}
          <div className="card p-5 border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Seller Profile
            </h3>
            <Link
              to={`/profile/${listing.seller?._id}`}
              className="flex items-center gap-3 group hover:opacity-90 transition-opacity"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-lg shrink-0">
                {listing.seller?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                  {listing.seller?.name}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                  <GraduationCap className="w-3 h-3 text-gray-400" />
                  {listing.seller?.course}{' '}
                  {listing.seller?.branch ? `· ${listing.seller?.branch}` : ''}
                </p>
                {listing.seller?.graduationYear && (
                  <p className="text-xs text-gray-400">Class of {listing.seller?.graduationYear}</p>
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
