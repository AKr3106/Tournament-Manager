import React from 'react';
import { Link } from 'react-router-dom';

const RulesPreview = () => {
  const previews = [
    {
      title: 'Reporting Time (3:00 PM)',
      desc: 'All teams and players must report to the field by 3:00 PM sharp. Delayed starts are not permitted.',
      icon: (
        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Match Duration',
      desc: 'Each game is 20 minutes total (10-minute halves). Half-time is short to ensure matches stay on schedule.',
      icon: (
        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: 'Lottery Draft System',
      desc: 'Rosters of 5 active players are selected live at random from the pool. No pre-made team stacks are allowed.',
      icon: (
        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      title: 'Strict Spectator Policy',
      desc: 'To adhere to venue limits, please do not invite outside spectators. Only players and organizers are permitted.',
      icon: (
        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="text-center mb-12 relative z-10">
        <span className="text-indigo-400 font-semibold tracking-wider text-sm uppercase">Quick Summary</span>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-2 text-white">League Rules Preview</h2>
        <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-lg">
          A glance at the core rules of RKM Legacy League. Make sure you are aligned before match day.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {previews.map((item, idx) => (
          <div key={idx} className="relative group overflow-hidden rounded-2xl bg-slate-900/40 border border-white/5 p-6 hover:border-indigo-500/50 hover:bg-slate-900/60 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
              {item.icon}
            </div>
            <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center mt-12 relative z-10">
        <Link to="/rules" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-semibold text-sm transition-all duration-300 transform hover:-translate-y-0.5 shadow-md">
          Read Full Rules & Guidelines
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
};

export default RulesPreview;