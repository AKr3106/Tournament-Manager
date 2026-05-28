import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_BASE from '../api';

const Lottery = () => {
  const [teams, setTeams] = useState([]);
  const [lotteryState, setLotteryState] = useState({
    status: "idle",
    selectedPlayers: [],
    playersPerTeam: 0,
    draftResults: {},
    draftLog: [],
    currentPick: null,
    draftPool: []
  });
  const [loading, setLoading] = useState(true);

  // Fetch teams on mount
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch(`${API_BASE}/teams`, { credentials: "include" });
        const data = await res.json();
        if (data.success) {
          setTeams(data.teams);
        }
      } catch (err) {
        console.error("Error fetching teams:", err);
      }
    };
    fetchTeams();
  }, []);

  // Poll lottery state every 2 seconds
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch(`${API_BASE}/lottery/state`, { credentials: "include" });
        const data = await res.json();
        if (data.success && data.state) {
          setLotteryState(data.state);
        }
      } catch (err) {
        console.error("Error fetching lottery state:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchState();
    const intervalId = setInterval(fetchState, 2000);

    return () => clearInterval(intervalId);
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen text-slate-50 pt-28 pb-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
        <span className="ml-3 text-slate-400 text-base">Connecting to Live Lottery...</span>
      </div>
    );
  }

  const getDraftResults = (teamIndex) => {
    if (!lotteryState.draftResults) return [];
    return lotteryState.draftResults[String(teamIndex)] || [];
  };

  const totalDrafted = Object.values(lotteryState.draftResults || {}).reduce((sum, arr) => sum + (arr ? arr.length : 0), 0);

  return (
    <div className="min-h-screen text-slate-50 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center md:text-left mb-10 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <span className="text-pink-400 font-semibold tracking-wider text-sm uppercase">Draft Center</span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-2 animate-pulse">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-pink-200 via-purple-300 to-pink-100 antialiased" style={{ WebkitTextFillColor: 'transparent' }}>
            Live Lottery
          </span>
        </h1>
        <p className="text-slate-400 mt-3 max-w-2xl text-base leading-relaxed">
          Watch players get randomly drafted into teams live in real-time.
        </p>
      </div>

      <div className="space-y-8">
        {/* IDLE / WAITING STATE */}
        {lotteryState.status === "idle" && (
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-12 text-center relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <svg className="w-16 h-16 mx-auto text-slate-500 animate-bounce mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-white">Awaiting Admin Setup</h2>
            <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
              The tournament organizer is preparing the lottery pool. Once started, teams will begin drafting live on this screen.
            </p>
          </div>
        )}

        {/* SETUP STATE */}
        {lotteryState.status === "setup" && (
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-12 text-center relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <svg className="w-16 h-16 mx-auto text-indigo-400 animate-pulse mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <h2 className="text-2xl font-bold text-white">Draft Pool Ready</h2>
            <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
              The admin has configured the pool with <strong className="text-indigo-400">{lotteryState.selectedPlayers.length}</strong> players.
              Waiting for the draft to begin...
            </p>
          </div>
        )}

        {/* STATS ROW */}
        {lotteryState.status !== "idle" && (() => {
          const teamsToDisplay = (lotteryState.selectedTeams && lotteryState.selectedTeams.length > 0)
            ? lotteryState.selectedTeams
            : teams.filter(t => t.index >= 1 && t.index <= 6);
          return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Pool Size', value: lotteryState.selectedPlayers.length, color: 'text-indigo-400' },
                { label: 'Teams', value: teamsToDisplay.length, color: 'text-purple-400' },
                { label: 'Per Team', value: lotteryState.playersPerTeam, color: 'text-pink-400' },
                { label: 'Drafted', value: totalDrafted, color: 'text-emerald-400' },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-900/30 border border-white/5 rounded-xl p-4 text-center">
                  <span className={`block text-2xl font-extrabold ${stat.color}`}>{stat.value}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</span>
                </div>
              ))}
            </div>
          );
        })()}

        {/* CURRENT PICK ANIMATION */}
        {lotteryState.currentPick && lotteryState.status === "running" && (
          <div className="bg-linear-to-r from-indigo-500/15 to-purple-500/15 border border-indigo-500/35 rounded-2xl p-8 text-center animate-pulse shadow-lg shadow-indigo-500/5 relative overflow-hidden">
            <div className="absolute -left-10 -top-10 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl"></div>
            <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
            <p className="text-xs text-indigo-400 uppercase tracking-wider font-extrabold mb-2 animate-bounce">
              ⚡ LIVE DRAFTING ⚡
            </p>
            <p className="text-3xl font-extrabold text-white tracking-wide">
              {lotteryState.currentPick.player.name}
            </p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="text-slate-400 text-sm">Drafted to →</span>
              <strong className="text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-purple-400 text-base font-extrabold">
                {lotteryState.currentPick.team["team-name"] || lotteryState.currentPick.team.teamName}
              </strong>
            </div>
          </div>
        )}

        {/* DRAFT COMPLETE BANNER */}
        {lotteryState.status === "complete" && (
          <div className="bg-linear-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/25 rounded-2xl p-8 text-center shadow-lg shadow-emerald-500/5">
            <svg className="w-12 h-12 mx-auto text-emerald-400 mb-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl font-extrabold text-white tracking-wide">Draft Complete!</p>
            <p className="text-sm text-slate-400 mt-1">All players have been successfully and fairly distributed to teams.</p>
          </div>
        )}

        {/* DRAFT RESULTS GRID */}
        {lotteryState.status !== "idle" && (() => {
          const teamsToDisplay = (lotteryState.selectedTeams && lotteryState.selectedTeams.length > 0)
            ? lotteryState.selectedTeams
            : teams.filter(t => t.index >= 1 && t.index <= 6);
          return (
            <div>
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-ping"></span>
                Live Team Rosters
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {teamsToDisplay.map((team, idx) => {
                  const roster = getDraftResults(team.index);
                  return (
                    <div key={team.index} className="bg-slate-900/30 border border-white/10 rounded-2xl overflow-hidden shadow-sm hover:border-white/20 transition-all duration-300">
                      <div className={`h-1.5 bg-linear-to-r ${teamColors[idx % teamColors.length]} opacity-70`}></div>
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-white text-sm">{team.teamName || team['team-name']}</h4>
                          <span className="text-[10px] bg-white/5 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                            {roster.length}/{lotteryState.playersPerTeam}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {roster.map((player, pIdx) => (
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
                          {Array.from({ length: Math.max(0, lotteryState.playersPerTeam - roster.length) }).map((_, i) => (
                            <div key={`empty-${i}`} className="flex items-center justify-center bg-slate-950/20 p-2.5 rounded-xl border border-dashed border-white/5 text-xs text-slate-700 italic">
                              Awaiting draw...
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* DRAFT LOG */}
        {lotteryState.draftLog && lotteryState.draftLog.length > 0 && (
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
              {lotteryState.draftLog.slice().reverse().map((entry, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-2.5 text-xs">
                  <span className="text-slate-600 font-mono w-8">#{String(lotteryState.draftLog.length - i).padStart(2, '0')}</span>
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
  );
};

export default Lottery;
