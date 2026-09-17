import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import authService from '../../services/authService';

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const res = await authService.forgotPassword(formData.email);
      if (res.success) {
        toast.success(res.message);
        setSubmitted(true);
        if (res.devResetToken) {
          setDevToken(res.devResetToken);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit reset request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-6 sm:p-8 shadow-xl border border-gray-100">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Forgot Password?</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter your registered college email to receive a password reset link.
        </p>
      </div>

      {submitted ? (
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm text-gray-600">
            If an account with that email exists, we've sent password reset instructions to your inbox.
          </p>

          {devToken && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-left text-xs text-amber-800 space-y-2">
              <p className="font-bold flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> [Developer Testing Mode]
              </p>
              <p>Reset password link:</p>
              <Link
                to={`/reset-password/${devToken}`}
                className="text-indigo-600 underline break-all font-mono"
              >
                /reset-password/{devToken}
              </Link>
            </div>
          )}

          <div className="pt-2">
            <Link to="/login" className="btn-secondary inline-block w-full py-2.5">
              Return to Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Registered College Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                placeholder="student@college.edu"
                className="input-field pl-9"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: 'Invalid email address',
                  },
                })}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Send Reset Link'
            )}
          </button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
