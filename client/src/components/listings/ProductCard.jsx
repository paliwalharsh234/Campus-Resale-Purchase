import { Link } from 'react-router-dom';
import { Clock, MapPin, Tag } from 'lucide-react';
import { formatPrice, timeAgo, conditionColor } from '../../utils/formatters';

export default function ProductCard({ listing }) {
  const imageUrl =
    listing.images && listing.images.length > 0
      ? listing.images[0].url
      : 'https://placehold.co/600x400?text=No+Image';

  const isFree = listing.price === 0;

  return (
    <Link
      to={`/listings/${listing._id}`}
      className="group card overflow-hidden flex flex-col hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-indigo-100"
    >
      {/* Product Image Box */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Free Badge / Condition */}
        {isFree ? (
          <span className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            FREE
          </span>
        ) : (
          <span className="absolute top-2.5 left-2.5 bg-gray-900/80 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
            {formatPrice(listing.price)}
          </span>
        )}

        <span
          className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${
            conditionColor[listing.condition] || 'bg-white text-gray-700'
          }`}
        >
          {listing.condition}
        </span>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
            <span className="font-medium text-indigo-600 uppercase tracking-wider">
              {listing.category}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {timeAgo(listing.createdAt)}
            </span>
          </div>

          <h3 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {listing.title}
          </h3>

          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-base font-black ${isFree ? 'text-emerald-600' : 'text-gray-900'}`}>
              {formatPrice(listing.price)}
            </span>
          </div>
        </div>

        {/* Meeting Location & Seller Footer */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">
              {listing.seller?.name?.[0]?.toUpperCase() || 'S'}
            </div>
            <span className="truncate font-medium text-gray-700 text-[11px]">
              {listing.seller?.name || 'Student'}
            </span>
          </div>

          <span className="text-[11px] text-gray-400 truncate flex items-center gap-1 max-w-[120px]">
            <MapPin className="w-3 h-3 shrink-0" />
            {listing.meetingPoint}
          </span>
        </div>
      </div>
    </Link>
  );
}
