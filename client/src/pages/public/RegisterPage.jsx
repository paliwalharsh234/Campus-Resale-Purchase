import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Building, Mail, Lock, User, Phone, GraduationCap, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import authService from '../../services/authService';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [campuses, setCampuses] = useState([]);
  const [loadingCampuses, setLoadingCampuses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState(null);
  const [devToken, setDevToken] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const selectedCampusId = watch('campusId');
  const selectedCampus = campuses.find((c) => c._id === selectedCampusId);

  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const data = await authService.getCampuses();
        if (data.success) {
          setCampuses(data.campuses || []);
        }
      } catch (err) {
        toast.error('Failed to load campuses. Please refresh or try again.');
      } finally {
        setLoadingCampuses(false);
      }
    };
    fetchCampuses();
  }, []);

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const res = await authService.register(formData);
      if (res.success) {
        toast.success(res.message);
        setRegisteredEmail(formData.email);
        if (res.devVerificationToken) {
          setDevToken(res.devVerificationToken);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  if (registeredEmail) {
    return (
      <div className="card p-8 text-center space-y-4 shadow-xl border border-gray-100">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
        <p className="text-sm text-gray-600">
          We sent a verification link to <strong className="text-gray-900">{registeredEmail}</strong>.
          Please click the link in your campus inbox to activate your account.
        </p>

        {devToken && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-left text-xs text-amber-800 space-y-2">
            <p className="font-bold flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> [Developer Testing Mode]
            </p>
            <p>Verification link:</p>
            <Link
              to={`/verify-email/${devToken}`}
              className="text-indigo-600 underline break-all font-mono"
            >
              /verify-email/{devToken}
            </Link>
          </div>
        )}

        <div className="pt-4">
          <Link to="/login" className="btn-primary inline-block w-full py-2.5">
            Proceed to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 sm:p-8 shadow-xl border border-gray-100">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Create Student Account</h1>
        <p className="text-sm text-gray-500 mt-1">Join your verified college marketplace community</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Full Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="e.g. Harsh Patel"
              className="input-field pl-9"
              {...register('name', { required: 'Full name is required' })}
            />
          </div>
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        {/* Campus Selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            College / Campus *
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <select
              className="input-field pl-9 bg-white"
              {...register('campusId', { required: 'Please select your campus' })}
              disabled={loadingCampuses}
            >
              <option value="">{loadingCampuses ? 'Loading campuses...' : 'Select your campus'}</option>
              {campuses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.campusName} (@{c.emailDomain})
                </option>
              ))}
            </select>
          </div>
          {errors.campusId && <p className="text-red-500 text-xs mt-1">{errors.campusId.message}</p>}
          {selectedCampus && (
            <p className="text-xs text-indigo-600 mt-1 font-medium">
              Allowed email domain: <span className="font-mono">@{selectedCampus.emailDomain}</span>
            </p>
          )}
        </div>

        {/* Campus Email */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Official Campus Email *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="email"
              placeholder={selectedCampus ? `username@${selectedCampus.emailDomain}` : 'student@college.edu'}
              className="input-field pl-9"
              {...register('email', {
                required: 'Campus email is required',
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: 'Invalid email address format',
                },
                validate: (val) => {
                  if (selectedCampus) {
                    const domain = val.split('@')[1]?.toLowerCase();
                    if (domain !== selectedCampus.emailDomain.toLowerCase()) {
                      return `Must be an official @${selectedCampus.emailDomain} address`;
                    }
                  }
                  return true;
                },
              })}
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="password"
              placeholder="Minimum 6 characters"
              className="input-field pl-9"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        {/* Course & Branch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Course
            </label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. B.Tech"
                className="input-field pl-9"
                {...register('course')}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Branch / Major
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. Computer Science"
                className="input-field pl-9"
                {...register('branch')}
              />
            </div>
          </div>
        </div>

        {/* Graduation Year & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Graduation Year
            </label>
            <input
              type="number"
              placeholder="e.g. 2026"
              className="input-field"
              {...register('graduationYear')}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Phone (Optional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                className="input-field pl-9"
                {...register('phone')}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 mt-4"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Create Verified Account'
          )}
        </button>
      </form>

      <div className="text-center mt-6 text-xs text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
