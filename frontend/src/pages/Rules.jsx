import React from 'react';

const Rules = () => {
  const matchRules = [
    {
      id: '01',
      title: 'Reporting Time (3:00 PM)',
      english: 'Everyone must arrive at the venue by 3:00 PM sharp. Please do not be late. No extra time or extensions will be provided.',
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: '02',
      title: 'Water & Hydration',
      english: 'Everyone must carry their own water bottle. Water will be available at the venue but it must be purchased.',
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14v4m0 0L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      id: '03',
      title: 'Match Duration (10+10 Mins)',
      english: 'Matches will be 20 minutes total (two 10-minute halves). Absolutely no time-wasting or delay during the half-time transition.',
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: '04',
      title: 'Quick Match Transitions',
      english: 'No time-wasting is allowed between matches. Keep transition times strictly to what is needed for photos and the coin toss.',
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
        </svg>
      )
    },
    {
      id: '05',
      title: 'Final Break',
      english: 'A short recovery break will be permitted only directly before the grand final match.',
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      id: '06',
      title: 'Spectator Limits',
      english: 'Please do not invite any outside spectators or non-playing guests to the venue to help us keep limits manageable.',
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    {
      id: '07',
      title: 'Tournament & Final Format',
      english: 'Teams 1, 3, and 5 are placed in Group A, and teams 2, 4, and 6 in Group B. Group stages follow a round-robin format (1v3, 2v4, 3v5, 4v6, 5v1, 6v2). The Grand Final will be contested between the toppers (top-ranked teams) of Group A and Group B.',
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    }
  ];

  const lotteryRules = [
    {
      title: 'Randomized Player Selection',
      desc: 'All registered players are placed in a common pool. Players are drawn one by one using a randomized selection process to assign them to teams.'
    },
    {
      title: 'Balanced 5-Player Rosters',
      desc: 'Each team will have exactly 5 active players. Once a team reaches its 5-player quota, they are excluded from the lottery draw.'
    },
    {
      title: 'No Pre-selected Stacks',
      desc: 'There are no pre-made teams, captain selections, or stacked line-ups. RKM Legacy League emphasizes fairness, balance, and bonding on the field.'
    }
  ];

  return (
    <div className="min-h-screen text-slate-50 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="text-center mb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <span className="text-indigo-400 font-semibold tracking-wider text-sm uppercase">Official Guidelines</span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-2">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-200 via-purple-300 to-indigo-100 antialiased" style={{ WebkitTextFillColor: 'transparent' }}>
            Rules & Guidelines
          </span>
        </h1>
        <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-lg leading-relaxed">
          Please read and strictly follow the guidelines below to ensure a smooth, competitive, and enjoyable reunion tournament on the field.
        </p>
      </div>

      {/* Match Day Guidelines Grid */}
      <div className="mb-20">
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-8 text-center sm:text-left">
          Match Day Regulations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matchRules.map((rule) => (
            <div 
              key={rule.id} 
              className="relative group overflow-hidden rounded-2xl bg-slate-900/40 border border-white/5 p-6 hover:border-indigo-500/50 hover:bg-slate-900/70 transition-all duration-300 shadow-lg"
            >
              {/* Highlight background element */}
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/5 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  {rule.icon}
                </div>
                <span className="text-slate-600 font-mono text-sm font-bold group-hover:text-indigo-500/50 transition-colors">
                  #{rule.id}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-3 tracking-tight">
                {rule.title}
              </h3>
              
              {/* English Description */}
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                {rule.english}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Lottery & Team Selection Rules */}
      <div className="bg-slate-900/30 rounded-3xl border border-white/10 p-8 md:p-12 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-indigo-400 font-semibold tracking-wider text-xs uppercase">How Rosters are Decided</span>
            <h2 className="text-2xl md:text-4xl font-bold mt-1 text-white">The Lottery Draft System</h2>
            <p className="text-slate-400 mt-2 text-sm md:text-base">
              RKM Legacy League focuses on balance, fairness, and new team bonds. Here is how our team selection draft works:
            </p>
          </div>

          <div className="space-y-6">
            {lotteryRules.map((rule, idx) => (
              <div 
                key={idx} 
                className="bg-slate-950/60 border border-white/5 rounded-2xl p-5 md:p-6 hover:border-white/10 transition-colors duration-300 flex gap-4"
              >
                <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base md:text-lg mb-1">{rule.title}</h3>
                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Rules;