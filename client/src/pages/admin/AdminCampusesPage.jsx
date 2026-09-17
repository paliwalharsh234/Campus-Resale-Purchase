import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Building2, Plus, CheckCircle, XCircle, MapPin, Globe } from 'lucide-react';
import adminService from '../../services/adminService';

export default function AdminCampusesPage() {
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchCampuses = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCampuses();
      if (res.success) {
        setCampuses(res.campuses || []);
      }
    } catch (err) {
      toast.error('Failed to load campuses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampuses();
  }, []);

  const handleToggleStatus = async (campusId) => {
    try {
      const res = await adminService.toggleCampusStatus(campusId);
      if (res.success) {
        toast.success(res.message);
        setCampuses((prev) =>
          prev.map((c) => (c._id === campusId ? { ...c, isActive: res.isActive } : c))
        );
      }
    } catch (err) {
      toast.error('Failed to update campus status.');
    }
  };

  const onSubmitNewCampus = async (formData) => {
    setSubmitting(true);
    try {
      const res = await adminService.addCampus(formData);
      if (res.success) {
        toast.success(res.message);
        reset();
        setShowAddModal(false);
        fetchCampuses();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add campus.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Campus Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Authorize college email domains for student onboarding and configure institutional hubs.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 py-2 px-4 text-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Campus
        </button>
      </div>

      {/* Campus Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-48 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : campuses.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          No campuses configured yet. Click "Add New Campus" to start.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campuses.map((c) => (
            <div
              key={c._id}
              className="card p-6 border border-gray-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-gray-900 line-clamp-1">
                  {c.campusName}
                </h3>

                <div className="mt-2 space-y-1 text-xs text-gray-500">
                  <p className="flex items-center gap-1 font-mono text-indigo-600 font-semibold">
                    <Globe className="w-3.5 h-3.5 text-gray-400" /> @{c.emailDomain}
                  </p>
                  {(c.city || c.state) && (
                    <p className="flex items-center gap-1 text-gray-400">
                      <MapPin className="w-3.5 h-3.5" /> {c.city ? `${c.city}, ` : ''}
                      {c.state}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end">
                <button
                  onClick={() => handleToggleStatus(c._id)}
                  className={`text-xs font-bold py-1.5 px-3 rounded-lg transition-colors ${
                    c.isActive
                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {c.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Campus Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card max-w-lg w-full p-6 sm:p-8 bg-white shadow-2xl space-y-4">
            <h2 className="text-xl font-black text-gray-900">Add New Campus</h2>
            <p className="text-xs text-gray-500">
              Enter official college information and required email domain suffix.
            </p>

            <form onSubmit={handleSubmit(onSubmitNewCampus)} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Campus / College Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. BITS Pilani"
                  className="input-field"
                  {...register('campusName', { required: 'Name is required' })}
                />
                {errors.campusName && (
                  <p className="text-red-500 text-xs mt-1">{errors.campusName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Approved Email Domain *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-mono text-sm">@</span>
                  <input
                    type="text"
                    placeholder="pilani.bits-pilani.ac.in"
                    className="input-field pl-7 font-mono"
                    {...register('emailDomain', {
                      required: 'Domain is required',
                      pattern: {
                        value: /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: 'Enter valid domain (e.g. college.edu or iitb.ac.in)',
                      },
                    })}
                  />
                </div>
                {errors.emailDomain && (
                  <p className="text-red-500 text-xs mt-1">{errors.emailDomain.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input type="text" placeholder="Pilani" className="input-field" {...register('city')} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="Rajasthan"
                    className="input-field"
                    {...register('state')}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs py-2 px-4"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs py-2 px-4"
                >
                  {submitting ? 'Creating Campus...' : 'Create Campus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
