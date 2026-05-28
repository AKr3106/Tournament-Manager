import React from 'react';

const About = () => {
  const values = [
    {
      title: 'Fair Competition',
      description: 'Our unique Lottery Draft System ensures all teams are balanced. No stacked rosters, just pure athletic football skill and raw coordination on the pitch.',
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: 'RKM Reunion',
      description: 'Arranged by the students of RKM, this tournament functions as a grand reunion of old friends, classmates, and teammates to celebrate our shared bond.',
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      title: 'Football Excellence',
      description: 'Providing a premium tournament experience with comprehensive statistics tracking, interactive fixtures, and live standings.',
      icon: (
        <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ];

  const milestones = [
    { year: 'Phase 1', title: 'Community Pooling', desc: 'Registered 30+ core competitive football players from the RKM student body.' },
    { year: 'Phase 2', title: 'Lottery Draft Draw', desc: 'Conducted live randomized team selection for 6 balanced groups.' },
    { year: 'Phase 3', title: 'Championship Season', desc: 'Round-robin brackets culminating in the Grand Finals.' }
  ];

  return (
    <div className="min-h-screen text-slate-50 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <span className="text-indigo-400 font-semibold tracking-wider text-sm uppercase">Who We Are</span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-2">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-200 via-purple-300 to-indigo-100 antialiased" style={{ WebkitTextFillColor: 'transparent' }}>
            About RKM Legacy League
          </span>
        </h1>
        <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-lg leading-relaxed">
          Bringing the RKM community back to the pitch. Organized by the students of RKM, this annual football tournament serves as both a premium competitive league and a grand reunion for friends and classmates.
        </p>
      </div>

      {/* Main Info Block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white tracking-tight">Our Mission</h2>
          <p className="text-slate-400 leading-relaxed text-lg">
            The RKM Legacy League was founded by the students of RKM to bring our football community together on the pitch. Unlike traditional tournaments where pre-stacked teams dominate, we promote absolute fairness, athletic excellence, and a shared environment of alumni reunion.
          </p>
          <p className="text-slate-400 leading-relaxed text-lg">
            By introducing our signature **Lottery Draft System**, we randomize the rosters to ensure balanced competition. It is a true test of leadership, communication, and adaptability as players coordinate with new teammates to create football history.
          </p>
        </div>
        <div className="relative rounded-3xl bg-slate-900/30 border border-white/10 p-8 shadow-2xl backdrop-blur-md overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
          <h3 className="text-xl font-bold text-white mb-4">League Format at a Glance</h3>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <span className="text-slate-300">6 Teams competing round-robin</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <span className="text-slate-300">5 Active players per roster</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
              <span className="text-slate-300">Fully randomized lottery selection</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
              <span className="text-slate-300">Statistics tracking and leaderboards</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Core Values Grid */}
      <div className="mb-24">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center mb-12">Core Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((val, idx) => (
            <div key={idx} className="relative group overflow-hidden rounded-2xl bg-slate-900/50 border border-white/10 p-8 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {val.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{val.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">{val.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Section */}
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight text-center mb-12">How We Execute</h2>
        <div className="relative border-l border-white/10 max-w-3xl mx-auto pl-6 sm:pl-8 space-y-12">
          {milestones.map((ms, idx) => (
            <div key={idx} className="relative group">
              {/* timeline node dot */}
              <div className="absolute -left-7.75 sm:-left-9.75 top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-indigo-500 group-hover:bg-indigo-500 transition-colors duration-300"></div>
              
              <span className="text-indigo-400 font-bold text-sm tracking-wider uppercase block">{ms.year}</span>
              <h3 className="text-xl font-bold text-white mt-1">{ms.title}</h3>
              <p className="text-slate-400 mt-2 text-base leading-relaxed">{ms.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default About;
