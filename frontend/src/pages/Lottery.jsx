import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API_BASE from '../api';

// ─── Slot-machine roll animation (pure, no component closure) ───────────────
function runRollAnimation(pool, finalPlayer, setRollingName, setIsRolling, onComplete) {
  // Interval ladder: starts at 45ms, decays to ~530ms for maximum suspense
  const ticks = [45, 45, 60, 80, 110, 150, 200, 260, 340, 430, 530];
  let step = 0;
  const safePick = pool.length > 0 ? pool : [finalPlayer];
  const tick = () => {
    if (step < ticks.length) {
      const idx = Math.floor(Math.random() * safePick.length);
      setRollingName(safePick[idx].name);
      setTimeout(tick, ticks[step++]);
    } else {
      setRollingName(finalPlayer.name);
      setIsRolling(false);
      onComplete();
    }
  };
  tick();
}

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

  // ─── Animation State ──────────────────────────────────────────────────────
  const [isRolling, setIsRolling] = useState(false);
  const [rollingName, setRollingName] = useState('');
  const [fadingOutId, setFadingOutId] = useState(null);
  const [visiblePool, setVisiblePool] = useState([]);

  // Refs for safe access inside async polling interval closures
  const prevPickKeyRef = useRef(null);
  const isRollingRef = useRef(false);
  const visiblePoolRef = useRef([]);

  // Keep refs in sync with state
  useEffect(() => { isRollingRef.current = isRolling; }, [isRolling]);
  useEffect(() => { visiblePoolRef.current = visiblePool; }, [visiblePool]);

  // Sync visiblePool with draftPool when not animating
  useEffect(() => {
    if (!isRollingRef.current) {
      setVisiblePool(lotteryState.draftPool || []);
    }
  }, [lotteryState.draftPool]);

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

  // ─── Poll lottery state — detects new picks and triggers animation ─────────
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch(`${API_BASE}/lottery/state`, { credentials: "include" });
        const data = await res.json();
        if (data.success && data.state) {
          const newState = data.state;

          // Build a unique key for this pick (player index + log length)
          const pickKey = newState.currentPick
            ? `${newState.currentPick.player?.index}-${newState.draftLog?.length}`
            : null;

          const isNewPick =
            pickKey &&
            pickKey !== prevPickKeyRef.current &&
            newState.status === 'running';

          if (isNewPick && !isRollingRef.current) {
            const pickedPlayer = newState.currentPick.player;
            prevPickKeyRef.current = pickKey;

            // Capture pool BEFORE applying new state — pool still has the picked player
            const poolSnapshot = [...visiblePoolRef.current];

            setIsRolling(true);
            isRollingRef.current = true;

            runRollAnimation(poolSnapshot, pickedPlayer, setRollingName, setIsRolling, () => {
              isRollingRef.current = false;
              // Fade-out the picked player card from the pool board
              setFadingOutId(pickedPlayer.index);
              setTimeout(() => {
                setVisiblePool(prev => prev.filter(p => p.index !== pickedPlayer.index));
                setFadingOutId(null);
                setLotteryState(newState); // apply full server state after animation
              }, 500);
            });
          } else if (!isRollingRef.current) {
            // Normal update — no new pick or already rolling
            if (pickKey) prevPickKeyRef.current = pickKey;
            setLotteryState(newState);
          }
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
                { label: 'Pool Size', value: lotteryState.selectedPlayers?.length || 0, color: 'text-indigo-400' },
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

        {/* ─── LOTTERY DRUM ROLL DISPLAY (spectator view) ───────────────────── */}
        {lotteryState.status === "running" && rollingName && (
          <div className="bg-slate-900/50 border border-pink-500/25 rounded-2xl overflow-hidden shadow-xl shadow-pink-500/10 relative">
            <div className="absolute inset-0 bg-linear-to-br from-pink-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
            {/* Header bar */}
            <div className="px-6 py-3 border-b border-white/5 flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
              </span>
              <span className="text-xs font-extrabold text-pink-400 uppercase tracking-widest">
                {isRolling ? "🎲 Lottery Drum Rolling..." : "⚡ Pick Confirmed"}
              </span>
            </div>
            {/* Main display */}
            <div className="p-10 text-center">
              <p className={`text-5xl md:text-6xl font-extrabold tracking-tight select-none transition-all ${
                isRolling
                  ? 'text-pink-300 blur-[2px] scale-110 duration-75'
                  : 'text-white scale-100 blur-0 duration-300'
              }`}>
                {rollingName}
              </p>
              {/* Reveal: team assignment after animation */}
              {!isRolling && lotteryState.currentPick && (
                <div className="mt-5 flex items-center justify-center gap-3">
                  <span className="text-slate-400 text-sm font-medium">Drafted to</span>
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-purple-400 text-xl font-extrabold">
                    {lotteryState.currentPick?.team?.["team-name"] || lotteryState.currentPick?.team?.teamName || "Team"}
                  </span>
                </div>
              )}
              {/* Bounce dots while rolling */}
              {isRolling && (
                <div className="mt-5 flex items-center justify-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    ></span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── DRAFT POOL BOARD ─────────────────────────────────────────────── */}
        {lotteryState.status === "running" && visiblePool.length > 0 && (
          <div className="bg-slate-900/20 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Current Slot — {visiblePool.length} remaining
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {visiblePool.map(player => (
                <div
                  key={player.index}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all duration-500 ${
                    fadingOutId === player.index
                      ? 'opacity-0 scale-90 bg-pink-500/10 border-pink-500/20'
                      : 'opacity-100 bg-slate-950/40 border-white/5 hover:border-white/10'
                  }`}
                >
                  <span className="text-slate-300 font-medium truncate mr-1">{player.name}</span>
                  {posBadge(player.position)}
                </div>
              ))}
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
        {lotteryState.draftLog && lotteryState.draftLog?.length > 0 && (
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
