import React, { useState } from 'react';
import playersData from '../assets/team_list.json';
import PlayerCard from '../components/PlayerCard';

const Players = () => {
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering Logic
  const filteredPlayers = playersData.filter((player) => {
    const matchesFilter = filter === 'ALL' || player.position.toUpperCase() === filter;
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen text-slate-50 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="text-center mb-12 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <span className="text-indigo-400 font-semibold tracking-wider text-sm uppercase">Draft Pool</span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-2">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-200 via-purple-300 to-indigo-100 antialiased" style={{ WebkitTextFillColor: 'transparent' }}>
            Registered Players
          </span>
        </h1>
        <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-lg">
          Meet the 30 elite players waiting for the live lottery draw. Filter by positions or search names.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 bg-slate-900/40 border border-white/5 p-4 rounded-2xl backdrop-blur-md">
        
        {/* Position Filter Tabs */}
        <div className="flex p-1 bg-slate-950 border border-white/5 rounded-xl gap-1 overflow-x-auto">
          {['ALL', 'FW', 'DF', 'GK'].map((pos) => {
            const labelMap = { ALL: 'All', FW: 'Forwards', DF: 'Defenders', GK: 'Goalkeepers' };
            return (
              <button
                key={pos}
                type="button"
                onClick={() => setFilter(pos)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                  filter === pos
                    ? 'bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {labelMap[pos]}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative max-w-xs w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 bg-slate-950 border border-white/10 focus:border-indigo-500/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
            placeholder="Search players..."
          />
        </div>
      </div>

      {/* Grid rendering */}
      {filteredPlayers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPlayers.map((player) => (
            <PlayerCard key={player.index} player={player} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/20 border border-dashed border-white/10 rounded-2xl">
          <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-semibold text-slate-400 text-lg">No players found</h3>
          <p className="text-slate-600 text-sm mt-1">Try resetting your filter or adjusting your search term.</p>
        </div>
      )}
    </div>
  );
};

export default Players;