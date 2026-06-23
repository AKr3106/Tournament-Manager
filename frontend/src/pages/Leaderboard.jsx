import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_BASE from '../api';

// ── helpers ──────────────────────────────────────────────────────────────────

const getRankStyle = (rank) => {
  if (rank === 1) return 'text-amber-400 font-black';
  if (rank === 2) return 'text-slate-300 font-bold';
  if (rank === 3) return 'text-amber-600 font-bold';
  return 'text-slate-500 font-semibold';
};

const RankBadge = ({ rank }) => {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return <span className={`font-mono text-sm ${getRankStyle(rank)}`}>#{rank}</span>;
};

const posBadge = (pos) => {
  const styles = {
    FW: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    DF: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    GK: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${styles[pos] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
      {pos}
    </span>
  );
};

// ── stat aggregator ───────────────────────────────────────────────────────────

const buildStats = (fixtures, finalMatch) => {
  const goals = {};   
  const assists = {}; 

  const process = (match) => {
    if (!match) return;
    (match.scorers || []).forEach(({ index, name }) => {
      if (!index) return;
      if (!goals[index]) goals[index] = { name, position: 'FW', count: 0 };
      goals[index].count += 1;
    });
    (match.assists || []).forEach(({ index, name }) => {
      if (!index) return;
      if (!assists[index]) assists[index] = { name, position: 'FW', count: 0 };
      assists[index].count += 1;
    });
  };

  fixtures.forEach(process);
  if (finalMatch) process(finalMatch);

  const toRanked = (map) =>
    Object.entries(map)
      .map(([index, data]) => ({ index: parseInt(index, 10), ...data }))
      .sort((a, b) => b.count - a.count);

  return { goalsList: toRanked(goals), assistsList: toRanked(assists) };
};

// ── table ─────────────────────────────────────────────────────────────────────

const StatTable = ({ title, emoji, data, accentColor, players, showFull }) => {
  // Merge positions from players API
  const enriched = data.map((row) => {
    const found = players.find((p) => p.index === row.index);
    return { ...row, position: found?.position || row.position };
  });

  // Filter out users who have 0 goals/assists, then slice to top 5 if full view is toggled off
  const filteredData = enriched.filter(row => row.count > 0);
  const displayedData = showFull ? filteredData : filteredData.slice(0, 5);

  return (
    <div className="bg-slate-900/30 border border-white/10 rounded-2xl overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
        <span className="text-xl">{emoji}</span>
        <h2 className={`text-lg font-extrabold ${accentColor}`}>{title}</h2>
        <span className="ml-auto text-xs text-slate-500 font-mono">
          Showing {displayedData.length} of {filteredData.length}
        </span>
      </div>

      {displayedData.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-slate-600 text-sm">No recorded data matches this criteria.</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {displayedData.map((row, idx) => {
            const rank = idx + 1;
            return (
              <div
                key={row.index}
                className={`flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-white/[0.02] ${rank === 1 ? 'bg-amber-500/5' : ''}`}
              >
                <div className="w-8 text-center shrink-0">
                  <RankBadge rank={rank} />
                </div>

                <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shrink-0 text-slate-400 text-xs font-bold">
                  {row.name ? row.name.charAt(0).toUpperCase() : '?'}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-100 truncate">{row.name}</p>
                  <div className="mt-0.5">{posBadge(row.position)}</div>
                </div>

                <div className={`shrink-0 text-2xl font-black font-mono ${rank === 1 ? 'text-amber-400' : accentColor}`}>
                  {row.count}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── main page ─────────────────────────────────────────────────────────────────

const Leaderboard = () => {
  const [selectedSeason, setSelectedSeason] = useState('s2');
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);
  
  const [players, setPlayers] = useState([]);
  const [goalsList, setGoalsList] = useState([]);
  const [assistsList, setAssistsList] = useState([]);

  const recompute = () => {
    // If user tries to load s1, return empty data (since it's locked/blocked)
    if (selectedSeason === 's1') {
      setGoalsList([]);
      setAssistsList([]);
      return;
    }

    const raw = localStorage.getItem('rkm_s2_fixtures');
    const rawFinal = localStorage.getItem('rkm_s2_finalMatch');
    const fixtures = raw ? JSON.parse(raw) : [];
    const finalMatch = rawFinal ? JSON.parse(rawFinal) : null;
    
    const { goalsList: g, assistsList: a } = buildStats(fixtures, finalMatch);
    setGoalsList(g);
    setAssistsList(a);
  };

  useEffect(() => {
    fetch(`${API_BASE}/players`)
      .then((r) => r.json())
      .then((d) => d.success && setPlayers(d.players))
      .catch(console.error);

    recompute();

    window.addEventListener('storage', recompute);
    window.addEventListener('local-ui-storage-update', recompute);
    
    return () => {
      window.removeEventListener('storage', recompute);
      window.removeEventListener('local-ui-storage-update', recompute);
    };
  }, [selectedSeason]);

  const totalGoals = goalsList.reduce((s, r) => s + r.count, 0);
  const totalAssists = assistsList.reduce((s, r) => s + r.count, 0);

  return (
    <div className="min-h-screen text-slate-50 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* ── Season Selector Bar ── */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-slate-900/80 border border-white/10 p-1 rounded-xl shadow-xl">
          <button
            type="button"
            disabled
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg text-slate-500 bg-slate-950/40 cursor-not-allowed border border-dashed border-white/5"
            title="Season 1 Archive Locked"
          >
            🔒 Season 1
          </button>
          <button
            type="button"
            onClick={() => setSelectedSeason('s2')}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              selectedSeason === 's2'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Season 2 (Live)
          </button>
        </div>
      </div>

      {/* ── Page Header ── */}
      <div className="text-center mb-12 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <span className="text-indigo-400 font-semibold tracking-wider text-sm uppercase">Active: Season 2 Stats</span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-2">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-200 via-purple-300 to-indigo-100 antialiased" style={{ WebkitTextFillColor: 'transparent' }}>
            Leaderboard
          </span>
        </h1>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Goals Scored',   value: totalGoals,           color: 'text-rose-400' },
          { label: 'Assists Made',   value: totalAssists,         color: 'text-cyan-400' },
          { label: 'Top Scorer',     value: goalsList[0]?.name   || '—', color: 'text-amber-400' },
          { label: 'Top Assist',     value: assistsList[0]?.name || '—', color: 'text-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/30 border border-white/10 rounded-xl p-4 text-center">
            <span className={`block text-xl font-extrabold truncate ${stat.color}`}>{stat.value}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1 block">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ── Full Leaderboard Toggle Selector Controls ── */}
      <div className="flex justify-end mb-6">
        <button
          type="button"
          onClick={() => setShowFullLeaderboard(!showFullLeaderboard)}
          className="px-4 py-2 text-xs bg-slate-900 border border-white/10 rounded-xl font-bold text-slate-200 hover:bg-slate-800 transition"
        >
          {showFullLeaderboard ? '👁️ Show Top 5 Only' : '📊 View Full Leaderboard'}
        </button>
      </div>

      {/* ── Two Tables Side by Side ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <StatTable title="Top Scorers" emoji="⚽" data={goalsList} accentColor="text-rose-400" players={players} showFull={showFullLeaderboard} />
        <StatTable title="Top Assist Providers" emoji="👟" data={assistsList} accentColor="text-cyan-400" players={players} showFull={showFullLeaderboard} />
      </div>

      <div className="flex justify-center">
        <Link to="/players" className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:shadow-lg transition-all duration-300">
          View All Players
        </Link>
      </div>
    </div>
  );
};

export default Leaderboard;