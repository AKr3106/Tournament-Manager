import { Link } from 'react-router-dom'

const Error = () => {
  return (
    <div className="min-h-screen text-slate-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative blurred orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 text-center max-w-xl mx-auto">
        
        {/* Large 404 number */}
        <div className="relative mb-6">
          <h1 className="text-[10rem] sm:text-[14rem] font-black leading-none tracking-tighter select-none">
            <span
              className="bg-clip-text text-transparent bg-linear-to-b from-slate-700 via-slate-800 to-slate-900 antialiased"
              style={{ WebkitTextFillColor: 'transparent' }}
            >
              404
            </span>
          </h1>

          {/* Overlay glowing text */}
          <h1
            className="absolute inset-0 text-[10rem] sm:text-[14rem] font-black leading-none tracking-tighter select-none bg-clip-text text-transparent bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 antialiased opacity-60"
            style={{ WebkitTextFillColor: 'transparent' }}
          >
            404
          </h1>
        </div>

        {/* Divider line */}
        <div className="w-24 h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full mx-auto mb-8 opacity-80"></div>

        {/* Message */}
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
          Page Not Found
        </h2>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-10 max-w-md mx-auto">
          Looks like this page went offside. The content you're looking for doesn't exist or has been moved.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Subtle football reference */}
        <div className="mt-16 flex items-center justify-center gap-2 text-slate-600 text-xs font-mono uppercase tracking-widest">
          <svg className="w-3.5 h-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Error Code: 404 — Out of bounds
        </div>
      </div>
    </div>
  )
}

export default Error