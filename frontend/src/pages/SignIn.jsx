import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SignIn = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('user'); // 'user' or 'admin'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mobile: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      alert(`Successfully logged in as ${role === 'admin' ? 'Admin' : 'Normal User'}!`);
      navigate('/');
    }, 1500);
  };

  const handleGoogleSignIn = () => {
    alert('Google Sign-In initiated...');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Back button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors duration-200 z-20 group"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Home</span>
      </Link>

      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full space-y-5 relative z-10">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-200 via-purple-300 to-indigo-100 antialiased" style={{ WebkitTextFillColor: 'transparent' }}>
              Welcome Back
            </span>
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Sign in to access your RKM Legacy League account
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-4">
          
          {/* Role Toggle Selector */}
          <div className="flex p-1 bg-slate-950 border border-white/5 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 ${
                role === 'user'
                  ? 'bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
               User
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 ${
                role === 'admin'
                  ? 'bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Admin 
            </button>
          </div>

          <form className="space-y-3.5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-4 py-2 bg-slate-950/80 border rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-300 text-sm ${
                    errors.email 
                      ? 'border-rose-500/80 focus:ring-rose-500/30' 
                      : 'border-white/10 focus:ring-indigo-500/30 focus:border-indigo-500/50'
                  }`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-[11px] text-rose-400">{errors.email}</p>}
            </div>

            {/* Mobile Number Field */}
            <div>
              <label htmlFor="mobile" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  autoComplete="tel"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-4 py-2 bg-slate-950/80 border rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-300 text-sm ${
                    errors.mobile 
                      ? 'border-rose-500/80 focus:ring-rose-500/30' 
                      : 'border-white/10 focus:ring-indigo-500/30 focus:border-indigo-500/50'
                  }`}
                  placeholder="10-digit number"
                />
              </div>
              {errors.mobile && <p className="mt-1 text-[11px] text-rose-400">{errors.mobile}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-4 py-2 bg-slate-950/80 border rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-300 text-sm ${
                    errors.password 
                      ? 'border-rose-500/80 focus:ring-rose-500/30' 
                      : 'border-white/10 focus:ring-indigo-500/30 focus:border-indigo-500/50'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-[11px] text-rose-400">{errors.password}</p>}
            </div>

            {/* Remember/ForgotPassword options (Admin vs Normal User context) */}
            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-300">
                <input type="checkbox" className="rounded bg-slate-950 border-white/10 text-indigo-500 focus:ring-0 focus:ring-offset-0" />
                <span>Keep me signed in</span>
              </label>
              <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white font-semibold text-sm transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In as {role === 'admin' ? 'Admin' : 'User'}</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-white/5"></div>
            <span className="shrink mx-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">or</span>
            <div className="grow border-t border-white/5"></div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:bg-slate-900/50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.336 0 3.327 2.682 1.386 6.605l3.88 3.16z"
              />
              <path
                fill="#4285F4"
                d="M23.518 12.303c0-.796-.068-1.59-.209-2.363H12v4.51h6.468a5.536 5.536 0 0 1-2.4 3.636v3.014h3.863c2.264-2.086 3.587-5.16 3.587-8.797z"
              />
              <path
                fill="#FBBC05"
                d="M5.266 14.235A7.098 7.098 0 0 1 4.909 12c0-.79.13-1.555.357-2.235L1.386 6.605A11.948 11.948 0 0 0 0 12c0 1.92.455 3.727 1.255 5.345l4.01-3.11z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.973-1.077 7.964-2.923l-3.863-3.014c-1.077.723-2.464 1.155-4.1 1.155-3.177 0-5.877-2.145-6.836-5.032l-4.01 3.11C3.123 21.055 7.155 24 12 24z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
          
          {/* New User? Create Account */}
          <div className="text-center text-xs text-slate-400 pt-1">
            New user?{' '}
            <Link to="/create-account" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Create an account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignIn;
