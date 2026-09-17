import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AlertCircle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import { timeAgo } from '../../utils/formatters';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Pending');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await adminService.getReports(statusFilter === 'All' ? null : statusFilter);
      if (res.success) {
        setReports(res.reports || []);
      }
    } catch (err) {
      toast.error('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      const res = await adminService.updateReportStatus(reportId, newStatus);
      if (res.success) {
        toast.success(res.message);
        setReports((prev) =>
          prev.map((r) => (r._id === reportId ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      toast.error('Failed to update report status.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Reports & Compliance</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review community reports regarding scams, fake listings, spam, or abusive behavior.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-3">
        {['Pending', 'Reviewed', 'Resolved', 'Dismissed', 'All'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === st
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-28 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="card p-12 text-center text-gray-400 max-w-md mx-auto my-8 space-y-2">
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">Queue is clear!</h3>
          <p className="text-xs text-gray-400">
            No {statusFilter.toLowerCase()} complaints to display.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((rep) => (
            <div
              key={rep._id}
              className="card p-5 border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-xs bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full">
                    {rep.reason}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      rep.status === 'Pending'
                        ? 'bg-amber-100 text-amber-800'
                        : rep.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {rep.status}
                  </span>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Reported {timeAgo(rep.createdAt)}
                  </span>
                </div>

                <p className="text-xs font-semibold text-gray-800">"{rep.description}"</p>

                <div className="text-[11px] text-gray-500 flex items-center gap-4 flex-wrap pt-1">
                  <span>
                    Reported by: <strong className="text-gray-700">{rep.reporter?.name}</strong> (
                    {rep.reporter?.email})
                  </span>
                  {rep.reportedUser && (
                    <span>
                      Offender:{' '}
                      <strong className="text-gray-700">{rep.reportedUser?.name}</strong>{' '}
                      {rep.reportedUser?.isSuspended && (
                        <span className="text-red-500 font-bold">[SUSPENDED]</span>
                      )}
                    </span>
                  )}
                </div>

                {rep.listing && (
                  <div className="pt-2">
                    <Link
                      to={`/listings/${rep.listing._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline bg-indigo-50/70 px-2 py-1 rounded"
                    >
                      <ExternalLink className="w-3 h-3" /> View Flagged Listing: "
                      {rep.listing.title}"
                    </Link>
                  </div>
                )}
              </div>

              {/* Status Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {rep.status !== 'Resolved' && (
                  <button
                    onClick={() => handleUpdateStatus(rep._id, 'Resolved')}
                    className="btn-primary text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700"
                  >
                    Mark Resolved
                  </button>
                )}
                {rep.status !== 'Dismissed' && (
                  <button
                    onClick={() => handleUpdateStatus(rep._id, 'Dismissed')}
                    className="btn-secondary text-xs py-1.5 px-3 hover:bg-gray-100"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
