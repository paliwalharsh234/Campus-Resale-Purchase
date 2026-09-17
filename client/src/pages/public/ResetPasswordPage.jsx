import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import authService from '../../services/authService';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const newPassword = watch('password');

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const res = await authService.resetPassword(token, formData.password);
      if (res.success) {
        toast.success(res.message);
        setSuccess(true);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reset password. Link may be invalid or expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-6 sm:p-8 shadow-xl border border-gray-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Set New Password</h1>
          <p className="text-sm text-gray-500 mt-1">Choose a secure password for your account</p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Password Reset Complete!</h2>
            <p className="text-sm text-gray-600">
              Your password has been changed. You can now log in with your updated credentials.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="btn-primary inline-flex items-center justify-center gap-2 w-full py-2.5"
              >
                Go to Login <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  className="input-field pl-9"
                  {...register('password', {
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Must be at least 6 characters' },
                  })}
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="input-field pl-9"
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: (val) => val === newPassword || 'Passwords do not match',
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
