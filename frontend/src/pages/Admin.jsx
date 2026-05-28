import React, { useState, useEffect } from 'react'
import Lottery from './Lottery';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('players');

  // ─── Player Management State ───
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('rkm_admin_players');
    return saved ? JSON.parse(saved) : [];
  });
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPosition, setNewPlayerPosition] = useState('FW');

  // ─── Team Management State ───
  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem('rkm_admin_teams');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTeamName, setNewTeamName] = useState('');

  // ─── Lottery Draft State ───
  const [draftResults, setDraftResults] = useState(() => {
    const saved = localStorage.getItem('rkm_admin_draft');
    return saved ? JSON.parse(saved) : {};
  });

  // ─── Persist to localStorage ───
  useEffect(() => {
    localStorage.setItem('rkm_admin_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('rkm_admin_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('rkm_admin_draft', JSON.stringify(draftResults));
  }, [draftResults]);

  // Sync draftResults from localStorage if updated in another tab/window
  useEffect(() => {
    const handleStorageChange = () => {
      const savedDraft = localStorage.getItem('rkm_admin_draft');
      if (savedDraft) setDraftResults(JSON.parse(savedDraft));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ─── Player Handlers ───
  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;
    const nextIndex = players.length > 0 ? Math.max(...players.map(p => p.index)) + 1 : 1;
    setPlayers([...players, { index: nextIndex, name: newPlayerName.trim(), position: newPlayerPosition }]);
    setNewPlayerName('');
  };

  const handleRemovePlayer = (index) => {
    setPlayers(players.filter(p => p.index !== index));
  };

  // ─── Team Handlers ───
  const handleAddTeam = () => {
    if (!newTeamName.trim()) return;
    const nextIndex = teams.length > 0 ? Math.max(...teams.map(t => t.index)) + 1 : 1;
    setTeams([...teams, { index: nextIndex, 'team-name': newTeamName.trim() }]);
    setNewTeamName('');
  };

  const handleRemoveTeam = (index) => {
    setTeams(teams.filter(t => t.index !== index));
    const updated = { ...draftResults };
    delete updated[index];
    setDraftResults(updated);
  };


  // Position badge helper
  const posBadge = (pos) => {
    const styles = {
      FW: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      DF: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      GK: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
    const labels = { FW: 'Forward', DF: 'Defender', GK: 'Goalkeeper' };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${styles[pos] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
        {labels[pos] || pos}
      </span>
    );
  };

  const tabs = [
    { id: 'players', label: 'Players', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { id: 'teams', label: 'Teams', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )},
  ];

  // Team color palette for the draft cards
  const teamColors = [
    'from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-amber-500 to-orange-500',
    'from-emerald-500 to-teal-500', 'from-rose-500 to-red-500', 'from-indigo-500 to-violet-500',
    'from-sky-500 to-blue-500', 'from-lime-500 to-green-500'
  ];

  return (
    <>
      <div className="min-h-screen text-slate-50 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center md:text-left mb-10 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <span className="text-indigo-400 font-semibold tracking-wider text-sm uppercase">Organizer Dashboard</span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-2">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-200 via-purple-300 to-indigo-100 antialiased" style={{ WebkitTextFillColor: 'transparent' }}>
            Admin Panel
          </span>
        </h1>
        <p className="text-slate-400 mt-3 max-w-2xl text-base leading-relaxed">
          Manage players and configure teams from this control centre.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex p-1 bg-slate-900/60 border border-white/5 rounded-xl gap-1 mb-10 max-w-lg">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* TAB: PLAYERS                                */}
      {/* ═══════════════════════════════════════════ */}
      {activeTab === 'players' && (
        <div className="space-y-8">
          {/* Add Player Form */}
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Player
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                placeholder="Player name..."
                className="flex-1 bg-slate-950/60 border border-white/10 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
              />
              <select
                value={newPlayerPosition}
                onChange={(e) => setNewPlayerPosition(e.target.value)}
                className="bg-slate-950/60 border border-white/10 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 cursor-pointer"
              >
                <option value="FW">Forward (FW)</option>
                <option value="DF">Defender (DF)</option>
                <option value="GK">Goalkeeper (GK)</option>
              </select>
              <button
                onClick={handleAddPlayer}
                disabled={!newPlayerName.trim()}
                className="px-6 py-2.5 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none cursor-pointer"
              >
                Add Player
              </button>
            </div>
          </div>

          {/* Player Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Players', value: players.length, color: 'text-indigo-400' },
              { label: 'Forwards', value: players.filter(p => p.position === 'FW').length, color: 'text-rose-400' },
              { label: 'Defenders', value: players.filter(p => p.position === 'DF').length, color: 'text-emerald-400' },
              { label: 'Goalkeepers', value: players.filter(p => p.position === 'GK').length, color: 'text-amber-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-900/30 border border-white/5 rounded-xl p-4 text-center">
                <span className={`block text-2xl font-extrabold ${stat.color}`}>{stat.value}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Player List */}
          <div className="bg-slate-900/20 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Registered Players ({players.length})</h3>
            </div>
            {players.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <svg className="w-12 h-12 mx-auto text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-slate-600 text-sm">No players registered yet. Add your first player above.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {players.map((player, idx) => (
                  <div key={player.index} className="flex items-center justify-between px-6 py-3.5 hover:bg-white/2 transition-colors group">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-slate-600 w-8">#{String(player.index).padStart(2, '0')}</span>
                      <div className="w-9 h-9 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center text-indigo-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-slate-200">{player.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {posBadge(player.position)}
                      <button
                        onClick={() => handleRemovePlayer(player.index)}
                        className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 hover:bg-rose-500/20 transition-all duration-200 cursor-pointer"
                        title="Remove player"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* TAB: TEAMS                                  */}
      {/* ═══════════════════════════════════════════ */}
      {activeTab === 'teams' && (
        <div className="space-y-8">
          {/* Add Team Form */}
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Team
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTeam()}
                placeholder="Team name..."
                className="flex-1 bg-slate-950/60 border border-white/10 focus:border-purple-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
              />
              <button
                onClick={handleAddTeam}
                disabled={!newTeamName.trim()}
                className="px-6 py-2.5 rounded-xl bg-linear-to-r from-purple-500 to-pink-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none cursor-pointer"
              >
                Add Team
              </button>
            </div>
          </div>

          {/* Teams Grid */}
          {teams.length === 0 ? (
            <div className="bg-slate-900/20 border border-white/10 rounded-2xl px-6 py-16 text-center">
              <svg className="w-12 h-12 mx-auto text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-slate-600 text-sm">No teams created yet. Add your first team above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {teams.map((team, idx) => (
                <div key={team.index} className="relative group bg-slate-900/30 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-linear-to-r ${teamColors[idx % teamColors.length]} opacity-60`}></div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold font-mono">Team {team.index}</span>
                      <h3 className="text-lg font-bold text-white mt-1">{team['team-name']}</h3>
                    </div>
                    <button
                      onClick={() => handleRemoveTeam(team.index)}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 hover:bg-rose-500/20 transition-all duration-200 cursor-pointer"
                      title="Remove team"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {/* Show drafted players if any */}
                  {draftResults[team.index] && draftResults[team.index].length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                      {draftResults[team.index].map((player, pIdx) => (
                        <div key={player.index} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-mono">#{String(player.index).padStart(2, '0')}</span>
                            <span className={`text-slate-300 ${pIdx === 0 ? 'font-bold' : ''}`}>
                              {player.name} {pIdx === 0 && <span className="text-amber-400 text-[10px]">(C)</span>}
                            </span>
                          </div>
                          {posBadge(player.position)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      </div>
      <Lottery />
    </>
  )
}

export default Admin