import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_BASE from '../api';

const Hero = () => {
    const [lotteryActive, setLotteryActive] = useState(false);

    useEffect(() => {
        const checkLotteryState = async () => {
            try {
                const res = await fetch(`${API_BASE}/lottery/state`, { credentials: "include" });
                const data = await res.json();
                if (data.success && data.state) {
                    // If lottery is in setup or running phase, it's live
                    if (data.state.status === "setup" || data.state.status === "running") {
                        setLotteryActive(true);
                    } else {
                        setLotteryActive(false);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch lottery state:", err);
            }
        };
        
        checkLotteryState();
        // Optionally poll every few seconds
        const interval = setInterval(checkLotteryState, 3000);
        return () => clearInterval(interval);
    }, []);
    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
        <div className="text-center py-15 space-y-6 max-w-3xl px-4 md:px-8">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight py-10">
            Welcome to <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-500 antialiased" style={{ WebkitTextFillColor: 'transparent' }}>RKM Legacy League</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed px-4 pb-4">
            The ultimate football league organized by the students of RKM. Relive the glory, compete on the pitch, and celebrate our grand student reunion.
          </p>
          
          <div className="flex justify-center mt-8">
              {lotteryActive && (
                  <Link 
                      to="/lottery" 
                      className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 border border-pink-500/30 rounded-full hover:bg-slate-800 transition-all duration-300 shadow-[0_0_20px_rgba(236,72,153,0.15)] hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:-translate-y-1 overflow-hidden"
                  >
                      <div className="absolute inset-0 w-full h-full bg-linear-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                      </span>
                      <span className="relative text-pink-400 font-extrabold uppercase tracking-widest text-sm">
                          Lottery is Live
                      </span>
                      <svg className="w-5 h-5 text-pink-400 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                  </Link>
              )}
          </div>
        </div>
      </div>
    )
}

export default Hero