import React from 'react';

const PlayerCard = ({ player }) => {
  // If no player is passed, render a skeleton/placeholder
  if (!player) {
    return (
      <div className="relative group rounded-2xl bg-slate-900/30 border border-white/5 p-6 animate-pulse">
        <div className="w-12 h-12 rounded-full bg-slate-800 mb-4"></div>
        <div className="h-4 bg-slate-800 rounded w-2/3 mb-2"></div>
        <div className="h-3 bg-slate-800 rounded w-1/3"></div>
      </div>
    );
  }

  const { index, name, position } = player;

  // Determine colors based on position
  const getPositionStyles = (pos) => {
    switch (pos?.toUpperCase()) {
      case 'FW':
        return {
          label: 'Forward',
          badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          glow: 'group-hover:border-rose-500/30 group-hover:shadow-rose-500/5'
        };
      case 'DF':
        return {
          label: 'Defender',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          glow: 'group-hover:border-emerald-500/30 group-hover:shadow-emerald-500/5'
        };
      case 'GK':
        return {
          label: 'Goalkeeper',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          glow: 'group-hover:border-amber-500/30 group-hover:shadow-amber-500/5'
        };
      default:
        return {
          label: pos || 'Player',
          badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
          glow: 'group-hover:border-indigo-500/30 group-hover:shadow-indigo-500/5'
        };
    }
  };

  const posStyles = getPositionStyles(position);
  const formattedIndex = index ? String(index).padStart(2, '0') : '00';

  return (
    <div className={`group relative rounded-2xl bg-slate-900/40 border border-white/5 p-6 hover:bg-slate-900/60 transition-all duration-300 shadow-md hover:shadow-xl ${posStyles.glow}`}>
      
      {/* Index Number */}
      <span className="absolute top-4 right-4 text-xs font-mono font-bold text-slate-600 tracking-wider">
        #{formattedIndex}
      </span>

      <div className="flex flex-col items-center text-center">
        {/* Profile Avatar Icon */}
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center text-indigo-400 group-hover:scale-105 group-hover:border-indigo-500/30 transition-all duration-300 shadow-inner">
            <svg className="w-8 h-8 opacity-75 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          {/* Subtle status dot or indicator */}
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-indigo-500 border-2 border-slate-900 rounded-full shadow-md"></span>
        </div>

        {/* Player Name */}
        <h3 className="font-bold text-lg text-slate-200 group-hover:text-white transition-colors duration-200 line-clamp-1 mb-2">
          {name}
        </h3>

        {/* Position Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${posStyles.badge} tracking-wide uppercase`}>
          {posStyles.label}
        </span>
      </div>
    </div>
  );
};

export default PlayerCard;