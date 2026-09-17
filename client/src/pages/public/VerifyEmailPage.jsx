import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react';
import authService from '../../services/authService';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }

    const verify = async () => {
      try {
        const res = await authService.verifyEmail(token);
        if (res.success) {
          setStatus('success');
          setMessage(res.message || 'Campus email verified successfully!');
        } else {
          setStatus('error');
          setMessage(res.message || 'Verification failed.');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Verification link is invalid or expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-8 text-center shadow-xl">
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-gray-900">Verifying Campus Email...</h2>
            <p className="text-sm text-gray-500">Please hold on while we confirm your credentials.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Account Activated!</h2>
            <p className="text-sm text-gray-600">{message}</p>
            <div className="pt-4">
              <Link
                to="/login"
                className="btn-primary inline-flex items-center justify-center gap-2 w-full py-2.5"
              >
                Sign In Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
            <p className="text-sm text-gray-600">{message}</p>
            <div className="pt-4 space-y-2">
              <Link to="/register" className="btn-primary block w-full py-2.5">
                Register Again
              </Link>
              <Link to="/login" className="btn-secondary block w-full py-2.5 text-center">
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
