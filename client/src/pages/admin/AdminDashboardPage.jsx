import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Users,
  Building2,
  Package,
  Flag,
  CheckCircle2,
  Heart,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import adminService from '../../services/adminService';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getStats();
        if (res.success) {
          setStats(res.stats);
        }
      } catch (err) {
        toast.error('Failed to load admin statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      link: '/admin/users',
    },
    {
      title: 'Active Campuses',
      value: stats?.totalCampuses ?? 0,
      icon: Building2,
      color: 'bg-indigo-50 text-indigo-600',
      link: '/admin/campuses',
    },
    {
      title: 'Active Listings',
      value: stats?.activeListings ?? 0,
      icon: Package,
      color: 'bg-emerald-50 text-emerald-600',
      link: '/admin/listings',
    },
    {
      title: 'Items Sold',
      value: stats?.soldListings ?? 0,
      icon: CheckCircle2,
      color: 'bg-teal-50 text-teal-600',
      link: '/admin/listings?status=Sold',
    },
    {
      title: 'Free Giveaways',
      value: stats?.freeListings ?? 0,
      icon: Heart,
      color: 'bg-rose-50 text-rose-600',
      link: '/admin/listings',
    },
    {
      title: 'Pending Reports',
      value: stats?.pendingReports ?? 0,
      icon: Flag,
      color: 'bg-amber-50 text-amber-600',
      link: '/admin/reports',
      alert: (stats?.pendingReports ?? 0) > 0,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Administrator Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor multi-campus marketplace activity, user compliance, and resolution queues.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={i}
              to={card.link}
              className="card p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900">
                    {loading ? '...' : card.value}
                  </span>
                  {card.alert && (
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full animate-pulse">
                      Action Required
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center text-xs text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform">
                  View details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Navigation Panel */}
      <div className="card p-6 border border-gray-200 bg-white">
        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-600" /> Platform Quick Controls
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="p-4 rounded-xl bg-gray-50 hover:bg-indigo-50/50 border border-gray-100 transition-colors block"
          >
            <p className="font-bold text-sm text-gray-900">Manage Students</p>
            <p className="text-xs text-gray-500 mt-0.5">Suspend users or review verification</p>
          </Link>
          <Link
            to="/admin/campuses"
            className="p-4 rounded-xl bg-gray-50 hover:bg-indigo-50/50 border border-gray-100 transition-colors block"
          >
            <p className="font-bold text-sm text-gray-900">Add New Campus</p>
            <p className="text-xs text-gray-500 mt-0.5">Authorize college domains for onboarding</p>
          </Link>
          <Link
            to="/admin/reports"
            className="p-4 rounded-xl bg-gray-50 hover:bg-indigo-50/50 border border-gray-100 transition-colors block"
          >
            <p className="font-bold text-sm text-gray-900">Resolve Reports</p>
            <p className="text-xs text-gray-500 mt-0.5">Audit scam or spam complaints</p>
          </Link>
          <Link
            to="/admin/listings"
            className="p-4 rounded-xl bg-gray-50 hover:bg-indigo-50/50 border border-gray-100 transition-colors block"
          >
            <p className="font-bold text-sm text-gray-900">Audit Listings</p>
            <p className="text-xs text-gray-500 mt-0.5">Cross-campus product moderation</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
