import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import API_BASE from '../api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError("No reset token provided. Please request a new password reset link.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage("Password has been reset successfully! Redirecting...");
        setTimeout(() => navigate('/signin'), 2000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to authentication server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <Link to="/signin" className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors duration-200 z-20 group">
        <svg className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Sign In</span>
      </Link>

      <div className="max-w-md w-full space-y-5 relative z-10">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-200 via-teal-300 to-emerald-100 antialiased" style={{ WebkitTextFillColor: 'transparent' }}>
              Create New Password
            </span>
          </h2>
          <p className="mt-1 text-xs text-slate-400">Please enter your new secure password below</p>
        </div>

        <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-4">
          {error && <div className="text-xs text-rose-400 text-center font-semibold bg-rose-500/10 border border-rose-500/20 py-2.5 px-3 rounded-xl">{error}</div>}
          {message && <div className="text-xs text-emerald-400 text-center font-semibold bg-emerald-500/10 border border-emerald-500/20 py-2.5 px-3 rounded-xl">{message}</div>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="newPassword" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={!token || isSubmitting}
                className="block w-full px-4 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!token || isSubmitting}
                className="block w-full px-4 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={!token || isSubmitting}
              className="w-full py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
