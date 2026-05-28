import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const Lottery = () => {
  // ─── Load state from localStorage ───
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('rkm_admin_players');
    return saved ? JSON.parse(saved) : [];
  });

  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem('rkm_admin_teams');
    return saved ? JSON.parse(saved) : [];
  });

  // ─── Lottery Draft State ───
  const [draftPool, setDraftPool] = useState([]);
  const [draftResults, setDraftResults] = useState(() => {
    const saved = localStorage.getItem('rkm_admin_draft');
    return saved ? JSON.parse(saved) : {};
  });
  const [isDrafting, setIsDrafting] = useState(false);
  const [currentPick, setCurrentPick] = useState(null);
  const [draftLog, setDraftLog] = useState([]);

  // ─── Persist results to localStorage ───
  useEffect(() => {
    localStorage.setItem('rkm_admin_draft', JSON.stringify(draftResults));
  }, [draftResults]);

  // Sync players/teams if updated in another tab/window
  useEffect(() => {
    const handleStorageChange = () => {
      const savedPlayers = localStorage.getItem('rkm_admin_players');
      const savedTeams = localStorage.getItem('rkm_admin_teams');
      if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
      if (savedTeams) setTeams(JSON.parse(savedTeams));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ─── Lottery Draft Handlers ───
  const playersPerTeam = teams.length > 0 ? Math.floor(players.length / teams.length) : 0;

  const initDraft = () => {
    if (teams.length < 2 || players.length < teams.length) return;
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    setDraftPool(shuffled);
    const emptyResults = {};
    teams.forEach(t => { emptyResults[t.index] = []; });
    setDraftResults(emptyResults);
    setDraftLog([]);
    setCurrentPick(null);
    setIsDrafting(true);
  };

  const drawNextPlayer = () => {
    if (draftPool.length === 0) {
      setIsDrafting(false);
      return;
    }
    // Find team with fewest players
    const teamOrder = teams
      .map(t => ({ ...t, count: (draftResults[t.index] || []).length }))
      .filter(t => t.count < playersPerTeam)
      .sort((a, b) => a.count - b.count || a.index - b.index);

    if (teamOrder.length === 0) {
      setIsDrafting(false);
      return;
    }

    const targetTeam = teamOrder[0];
    const player = draftPool[0];

    setCurrentPick({ player, team: targetTeam });

    setTimeout(() => {
      setDraftResults(prev => ({
        ...prev,
        [targetTeam.index]: [...(prev[targetTeam.index] || []), player]
      }));
      setDraftPool(prev => prev.slice(1));
      setDraftLog(prev => [...prev, { player: player.name, team: targetTeam['team-name'] }]);
      setCurrentPick(null);
    }, 1200);
  };

  const resetDraft = () => {
    setDraftResults({});
    setDraftPool([]);
    setDraftLog([]);
    setCurrentPick(null);
    setIsDrafting(false);
  };

  const totalDrafted = Object.values(draftResults).reduce((sum, arr) => sum + arr.length, 0);
  const isDraftComplete = isDrafting && draftPool.length === 0 && totalDrafted > 0;

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

  // Team color palette for the draft cards
  const teamColors = [
    'from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-amber-500 to-orange-500',
    'from-emerald-500 to-teal-500', 'from-rose-500 to-red-500', 'from-indigo-500 to-violet-500',
    'from-sky-500 to-blue-500', 'from-lime-500 to-green-500'
  ];

  return (
    <div className="min-h-screen text-slate-50 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center md:text-left mb-10 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <span className="text-pink-400 font-semibold tracking-wider text-sm uppercase">Draft Center</span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-2">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-pink-200 via-purple-300 to-pink-100 antialiased" style={{ WebkitTextFillColor: 'transparent' }}>
            Live Lottery
          </span>
        </h1>
        <p className="text-slate-400 mt-3 max-w-2xl text-base leading-relaxed">
          Run the randomized draft lottery to automatically and fairly distribute players into teams.
        </p>
      </div>

      <div className="space-y-8">
        {/* Draft Controls */}
        <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Live Lottery Draft
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Shuffle all registered players randomly and assign them to teams.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!isDrafting ? (
                <button
                  onClick={initDraft}
                  disabled={teams.length < 2 || players.length < teams.length}
                  className="px-5 py-2.5 rounded-xl bg-linear-to-r from-pink-500 to-rose-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none cursor-pointer flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Draft
                </button>
              ) : (
                <button
                  onClick={drawNextPlayer}
                  disabled={currentPick !== null || draftPool.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none cursor-pointer flex items-center gap-2 animate-pulse"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Draw Next ({draftPool.length} left)
                </button>
              )}
              {(isDrafting || totalDrafted > 0) && (
                <button
                  onClick={resetDraft}
                  className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 font-semibold text-sm transition-all duration-300 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Pre-check warnings */}
          {(teams.length < 2 || players.length < teams.length) && !isDrafting && (
            <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 text-amber-400 text-xs md:text-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>
                  You need at least <strong>2 teams</strong> and more players than teams to start the draft. <br />
                  <span className="text-slate-400">Currently: {teams.length} team(s), {players.length} player(s).</span>
                </span>
              </div>

            </div>
          )}
        </div>

        {/* Draft Status */}
        {teams.length >= 2 && players.length >= teams.length && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Pool Size', value: players.length, color: 'text-indigo-400' },
              { label: 'Teams', value: teams.length, color: 'text-purple-400' },
              { label: 'Per Team', value: playersPerTeam, color: 'text-pink-400' },
              { label: 'Drafted', value: totalDrafted, color: 'text-emerald-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-900/30 border border-white/5 rounded-xl p-4 text-center">
                <span className={`block text-2xl font-extrabold ${stat.color}`}>{stat.value}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Current Pick Animation */}
        {currentPick && (
          <div className="bg-linear-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6 text-center animate-pulse">
            <p className="text-xs text-indigo-400 uppercase tracking-wider font-bold mb-2">Now Drafting...</p>
            <p className="text-2xl font-extrabold text-white">{currentPick.player.name}</p>
            <p className="text-sm text-slate-400 mt-1">
              → {currentPick.team['team-name']}
            </p>
          </div>
        )}

        {/* Draft Complete Banner */}
        {isDraftComplete && (
          <div className="bg-linear-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
            <svg className="w-10 h-10 mx-auto text-emerald-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-bold text-white">Draft Complete!</p>
            <p className="text-sm text-slate-400 mt-1">All {totalDrafted} players have been assigned to {teams.length} teams.</p>
          </div>
        )}

        {/* Draft Results Grid */}
        {totalDrafted > 0 && (
          <div>
            <h3 className="text-lg font-bold text-white mb-5">Draft Results</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {teams.map((team, idx) => (
                <div key={team.index} className="bg-slate-900/30 border border-white/10 rounded-2xl overflow-hidden">
                  <div className={`h-1.5 bg-linear-to-r ${teamColors[idx % teamColors.length]} opacity-70`}></div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-white text-sm">{team['team-name']}</h4>
                      <span className="text-[10px] bg-white/5 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                        {(draftResults[team.index] || []).length}/{playersPerTeam}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {(draftResults[team.index] || []).map((player, pIdx) => (
                        <div key={player.index} className="flex items-center justify-between bg-slate-950/40 p-2.5 rounded-xl border border-white/5 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-mono">#{String(player.index).padStart(2, '0')}</span>
                            <span className={`text-slate-200 ${pIdx === 0 ? 'font-bold' : ''}`}>
                              {player.name}
                              {pIdx === 0 && <span className="ml-1 text-amber-400 text-[10px] font-bold">(C)</span>}
                            </span>
                          </div>
                          {posBadge(player.position)}
                        </div>
                      ))}
                      {/* Empty slots */}
                      {Array.from({ length: Math.max(0, playersPerTeam - (draftResults[team.index] || []).length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="flex items-center justify-center bg-slate-950/20 p-2.5 rounded-xl border border-dashed border-white/5 text-xs text-slate-700 italic">
                          Awaiting draw...
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Draft Log */}
        {draftLog.length > 0 && (
          <div className="bg-slate-900/20 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Draft Log
              </h3>
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-white/5">
              {draftLog.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-2.5 text-xs">
                  <span className="text-slate-600 font-mono w-8">#{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-slate-300 font-semibold">{entry.player}</span>
                  <svg className="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-indigo-400 font-semibold">{entry.team}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Lottery
