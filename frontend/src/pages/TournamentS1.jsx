import { useState, useEffect } from 'react'
import TeamCard from '../components/TeamCard';
import SeasonButton from '../components/SeasonButton';
import PlayerCard from '../components/PlayerCard';
import API_BASE from '../api';

const TournamentS1 = () => {
  const [players, setPlayers] = useState([]);
  const [teamNames, setTeamNames] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const playersRes = await fetch(`${API_BASE}/players`);
        const playersData = await playersRes.json();

        if (playersData.success) {
          setPlayers(playersData.players);
        }
        
        // Hardcoded Season 1 teams instead of live DB (which is for Season 2)
        setTeamNames([
          { 'team-name': 'Dream Makers' },
          { 'team-name': 'Goal Digger FC' },
          { 'team-name': 'Gladiator FC' },
          { 'team-name': 'Victorious Five' },
          { 'team-name': 'Pancha Pandav' },
          { 'team-name': 'Atletico FC' }
        ]);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const goldenBallBootPlayer = players.find(p => p.index === 16);
  const goldenGlovesPlayer = players.find(p => p.index === 17);
  const colors = [
    'from-blue-500 to-cyan-500 shadow-blue-500/20',
    'from-purple-500 to-pink-500 shadow-purple-500/20',
    'from-amber-500 to-orange-500 shadow-amber-500/20',
    'from-emerald-500 to-teal-500 shadow-emerald-500/20',
    'from-rose-500 to-red-500 shadow-rose-500/20',
    'from-indigo-500 to-violet-500 shadow-indigo-500/20'
  ];

  const teams = teamNames.map((t, idx) => {
    const startIdx = idx * 5;
    const teamPlayers = players.slice(startIdx, startIdx + 5).map(player => ({
      ...player,
      isCaptain: [1, 6, 11, 16, 21, 26].includes(player.index)
    }));

    return {
      name: t['team-name'],
      color: colors[idx % colors.length],
      players: teamPlayers
    };
  });

  return (
    <div className="min-h-screen text-slate-50 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center md:text-left mb-12 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-20 right-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <span className="text-indigo-400 font-semibold tracking-wider text-sm uppercase">RKM LEGACY LEAGUE Season 1</span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-2">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-200 via-purple-300 to-indigo-100 antialiased" style={{ WebkitTextFillColor: 'transparent' }}>
            Tournament Details
          </span>
        </h1>
        <p className="text-slate-400 mt-4 max-w-2xl text-lg leading-relaxed">
          Welcome to the ultimate showdown. Read below to understand how teams are formed, the structure of the league, and the lottery draft system.
        </p>
      </div>

      <SeasonButton activeSeason="s1" />

      {/* Stats / Highlight Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="relative group overflow-hidden rounded-2xl bg-slate-900/50 border border-white/10 p-8 hover:border-indigo-500/50 transition-all duration-300">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/10 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
          <div className="text-indigo-400 mb-2">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-3xl font-extrabold text-white">6 Teams</h3>
          <p className="text-slate-400 mt-2">Competing for the ultimate glory in a round-robin league format.</p>
        </div>

        <div className="relative group overflow-hidden rounded-2xl bg-slate-900/50 border border-white/10 p-8 hover:border-indigo-500/50 transition-all duration-300">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-purple-500/10 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
          <div className="text-purple-400 mb-2">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-3xl font-extrabold text-white">5 Players / Team</h3>
          <p className="text-slate-400 mt-2">Exactly 5 active players per roster. No subs, pure synergy, high stakes.</p>
        </div>

        <div className="relative group overflow-hidden rounded-2xl bg-slate-900/50 border border-white/10 p-8 hover:border-indigo-500/50 transition-all duration-300">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-pink-500/10 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
          <div className="text-pink-400 mb-2">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h3 className="text-3xl font-extrabold text-white">Lottery Draft</h3>
          <p className="text-slate-400 mt-2">Rosters are decided entirely via a live, randomized lottery draw for absolute fairness.</p>
        </div>
      </div>

      {/* Roster / Team Overview Preview */}
      <div className="mb-20">
        <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center text-white">The Contenders</h3>
        <TeamCard teams={teams} />
      </div>

      {/* Season 1 Recap & Awards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 bg-slate-900/30 rounded-3xl border border-white/10 p-8 md:p-12 relative overflow-hidden">
        {/* Final Match Info */}
        <div className="lg:col-span-1 flex flex-col justify-center space-y-4">
          <span className="text-indigo-400 font-semibold text-sm tracking-wider uppercase">The Grand Finale</span>
          <h2 className="text-3xl font-bold text-white">Season 1 Final</h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            An intense, legendary battle on the pitch that was decided by the narrowest of margins in a dramatic penalty shootout.
          </p>
          <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Match Score</div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-semibold text-slate-400">Goal Digger FC</span>
              <span className="text-xl font-extrabold text-white my-0.5">0 — 0</span>
              <span className="text-xs text-slate-400 font-mono font-bold">(2 — 3 Pen)</span>
              <span className="text-sm font-semibold text-indigo-400 mt-1">Victorious Five</span>
            </div>
            <div className="mt-3 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/25 uppercase flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm0 0H4v5a8 8 0 008 8h0a8 8 0 008-8V8h-8z" />
              </svg>
              Champions: Victorious Five
            </div>
          </div>
        </div>

        {/* Awards Section */}
        <div className="lg:col-span-2 flex flex-col justify-center">
          <span className="text-indigo-400 font-semibold text-sm tracking-wider uppercase mb-1">Hall of Fame</span>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Individual Awards</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Golden Ball Card */}
            <div className="flex flex-col space-y-2">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider text-center flex items-center justify-center gap-1.5 bg-amber-500/10 py-1.5 rounded-lg border border-amber-500/20">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3v18M3 12h18" />
                </svg>
                Golden Ball
              </div>
              <PlayerCard player={goldenBallBootPlayer} />
            </div>

            {/* Golden Boot Card */}
            <div className="flex flex-col space-y-2">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider text-center flex items-center justify-center gap-1.5 bg-amber-500/10 py-1.5 rounded-lg border border-amber-500/20">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Golden Boot
              </div>
              <PlayerCard player={goldenBallBootPlayer} />
            </div>

            {/* Golden Gloves Card */}
            <div className="flex flex-col space-y-2">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider text-center flex items-center justify-center gap-1.5 bg-amber-500/10 py-1.5 rounded-lg border border-amber-500/20">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Golden Gloves
              </div>
              <PlayerCard player={goldenGlovesPlayer} />
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default TournamentS1
