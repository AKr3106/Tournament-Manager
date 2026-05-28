import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const CreateAccount = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
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
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      alert('Successfully created account!');
      navigate('/signin');
    }, 1500);
  };

  const handleGoogleSignUp = () => {
    alert('Google Sign-Up initiated...');
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

      <div className="max-w-md w-full space-y-4 relative z-10">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-200 via-purple-300 to-indigo-100 antialiased" style={{ WebkitTextFillColor: 'transparent' }}>
              Create Account
            </span>
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Join the RKM Legacy League and start competing
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-4">
          
          <form className="space-y-3.5" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-4 py-2 bg-slate-950/80 border rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-300 text-sm ${
                    errors.name 
                      ? 'border-rose-500/80 focus:ring-rose-500/30' 
                      : 'border-white/10 focus:ring-indigo-500/30 focus:border-indigo-500/50'
                  }`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="mt-1 text-[11px] text-rose-400">{errors.name}</p>}
            </div>

            {/* Role Field */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value="User"
                  disabled
                  className="block w-full pl-10 pr-4 py-2 bg-slate-950/40 border border-white/5 rounded-xl text-slate-500 transition-all duration-300 text-sm cursor-not-allowed select-none font-semibold"
                />
              </div>
            </div>

            {/* Email Address */}
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

            {/* Mobile Number */}
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

            {/* Password */}
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-4 py-2 bg-slate-950/80 border rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-300 text-sm ${
                    errors.confirmPassword 
                      ? 'border-rose-500/80 focus:ring-rose-500/30' 
                      : 'border-white/10 focus:ring-indigo-500/30 focus:border-indigo-500/50'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-[11px] text-rose-400">{errors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white font-semibold text-sm transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register</span>
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
            onClick={handleGoogleSignUp}
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
            <span>Sign Up with Google</span>
          </button>

          {/* Back to Sign In */}
          <div className="text-center text-xs text-slate-400 pt-1">
            Already have an account?{' '}
            <Link to="/signin" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Sign In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
