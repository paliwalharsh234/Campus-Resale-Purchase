import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, GraduationCap, MapPin, Calendar, Package, ArrowLeft } from 'lucide-react';
import socialService from '../../services/socialService';
import ProductCard from '../../components/listings/ProductCard';

export default function ProfilePage() {
  const { id } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If no ID param provided, we can fetch own profile or use id
    const targetId = id;
    if (!targetId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await socialService.getUserProfile(targetId);
        if (res.success) {
          setProfileUser(res.user);
          setUserListings(res.listings || []);
        }
      } catch (err) {
        toast.error('Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-sm">User profile could not be found.</p>
        <Link to="/marketplace" className="btn-secondary text-xs mt-4 inline-block">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
      </Link>

      {/* User Header Card */}
      <div className="card p-6 sm:p-8 border border-gray-100 shadow-sm mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-3xl shrink-0 shadow-inner">
          {profileUser.profileImage ? (
            <img
              src={profileUser.profileImage}
              alt={profileUser.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            profileUser.name?.[0]?.toUpperCase()
          )}
        </div>

        <div className="flex-1 min-w-0">
          <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1">
            🎓 Verified Campus Student
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900">{profileUser.name}</h1>
          <p className="text-sm text-gray-600 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
            <GraduationCap className="w-4 h-4 text-gray-400" />
            {profileUser.course} {profileUser.branch ? `· ${profileUser.branch}` : ''}
            {profileUser.graduationYear ? ` (Class of ${profileUser.graduationYear})` : ''}
          </p>
          <p className="text-xs text-gray-400 mt-1 flex items-center justify-center sm:justify-start gap-1">
            <MapPin className="w-3 h-3" /> {profileUser.campus?.campusName}
          </p>
        </div>
      </div>

      {/* User's Active Listings */}
      <div>
        <h2 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-600" /> Active Listings ({userListings.length})
        </h2>

        {userListings.length === 0 ? (
          <div className="card p-8 text-center text-xs text-gray-400">
            This student has no other active listings at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {userListings.map((listing) => (
              <ProductCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
