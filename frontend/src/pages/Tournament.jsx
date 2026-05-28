import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import TeamCard from '../components/TeamCard';
import SeasonButton from '../components/SeasonButton';
import PlayerCard from '../components/PlayerCard';
import API_BASE from '../api';

const Tournament = () => {
  const [players, setPlayers] = useState([]);
  const [dbTeams, setDbTeams] = useState([]);
  const [draftResults, setDraftResults] = useState({});
  const [lotteryStatus, setLotteryStatus] = useState('idle');
  const [selectedTeams, setSelectedTeams] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersRes, teamsRes, lotteryRes] = await Promise.all([
          fetch(`${API_BASE}/players`),
          fetch(`${API_BASE}/teams`),
          fetch(`${API_BASE}/lottery/state`, { credentials: "include" }).catch(() => null)
        ]);
        
        const playersData = await playersRes.json();
        if (playersData.success) {
          setPlayers(playersData.players);
        }

        const teamsData = await teamsRes.json();
        if (teamsData.success) {
          setDbTeams(teamsData.teams);
        }

        if (lotteryRes) {
          const lotteryData = await lotteryRes.json();
          if (lotteryData.success && lotteryData.state) {
            setDraftResults(lotteryData.state.draftResults || {});
            setLotteryStatus(lotteryData.state.status || 'idle');
            setSelectedTeams(lotteryData.state.selectedTeams || []);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const teamColorMap = [
    'from-blue-500 to-cyan-500 shadow-blue-500/20',
    'from-purple-500 to-pink-500 shadow-purple-500/20',
    'from-amber-500 to-orange-500 shadow-amber-500/20',
    'from-emerald-500 to-teal-500 shadow-emerald-500/20',
    'from-rose-500 to-red-500 shadow-rose-500/20',
    'from-indigo-500 to-violet-500 shadow-indigo-500/20'
  ];

  const isLotteryCompleted = lotteryStatus === 'complete';
  const defaultTeams = [
    { teamName: 'Team A' }, { teamName: 'Team B' }, { teamName: 'Team C' },
    { teamName: 'Team D' }, { teamName: 'Team E' }, { teamName: 'Team F' }
  ];

  // Use dbTeams if available so that the actual team names are always shown.
  // Otherwise, fallback to selectedTeams or defaultTeams.
  const displayTeams = dbTeams.length > 0
    ? [...dbTeams].sort((a, b) => a.index - b.index)
    : (isLotteryCompleted && selectedTeams.length > 0 ? selectedTeams : defaultTeams);

  // Build teams array
  const teams = displayTeams.map((t, idx) => {
    const roster = t.index ? (draftResults[String(t.index)] || []) : [];
    return {
      name: t.teamName || t['team-name'] || `Team ${idx + 1}`,
      color: teamColorMap[idx % teamColorMap.length],
      players: roster.length > 0 ? roster.map((p, pIdx) => ({
        name: p.name,
        position: p.position || 'FW',
        isCaptain: pIdx === 0
      })) : null
    };
  });

  // Fixtures score state with localStorage persistence
  const [fixtures, setFixtures] = useState(() => {
    const saved = localStorage.getItem('rkm_s2_fixtures');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved fixtures:', e);
      }
    }
    return [
      { id: 'Match 1', team1: 'Team A', team2: 'Team C', group: 'A', format: '1 v 3', score1: '', score2: '' },
      { id: 'Match 2', team1: 'Team B', team2: 'Team D', group: 'B', format: '2 v 4', score1: '', score2: '' },
      { id: 'Match 3', team1: 'Team C', team2: 'Team E', group: 'A', format: '3 v 5', score1: '', score2: '' },
      { id: 'Match 4', team1: 'Team D', team2: 'Team F', group: 'B', format: '4 v 6', score1: '', score2: '' },
      { id: 'Match 5', team1: 'Team E', team2: 'Team A', group: 'A', format: '5 v 1', score1: '', score2: '' },
      { id: 'Match 6', team1: 'Team F', team2: 'Team B', group: 'B', format: '6 v 2', score1: '', score2: '' }
    ];
  });

  // Grand Final score state with localStorage persistence
  const [finalScore, setFinalScore] = useState(() => {
    const saved = localStorage.getItem('rkm_s2_finalScore');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved finalScore:', e);
      }
    }
    return { score1: '', score2: '' };
  });

  // Trophies winners state with localStorage persistence
  const [goldenBallId, setGoldenBallId] = useState(() => localStorage.getItem('rkm_s2_goldenBallId') || '');
  const [goldenBootId, setGoldenBootId] = useState(() => localStorage.getItem('rkm_s2_goldenBootId') || '');
  const [goldenGlovesId, setGoldenGlovesId] = useState(() => localStorage.getItem('rkm_s2_goldenGlovesId') || '');
  
  // Toggle editing state
  const [isEditing, setIsEditing] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('rkm_s2_fixtures', JSON.stringify(fixtures));
  }, [fixtures]);

  // Sync fixture names with dynamic team names
  useEffect(() => {
    if (teams.length >= 6) {
      setFixtures(prev => prev.map((f, i) => {
        const mappings = [
          [0, 2], [1, 3], [2, 4], [3, 5], [4, 0], [5, 1]
        ];
        if (mappings[i]) {
          return {
            ...f,
            team1: teams[mappings[i][0]]?.name || f.team1,
            team2: teams[mappings[i][1]]?.name || f.team2
          };
        }
        return f;
      }));
    }
  }, [teams.map(t => t.name).join(',')]);

  useEffect(() => {
    localStorage.setItem('rkm_s2_finalScore', JSON.stringify(finalScore));
  }, [finalScore]);

  useEffect(() => {
    localStorage.setItem('rkm_s2_goldenBallId', goldenBallId);
  }, [goldenBallId]);

  useEffect(() => {
    localStorage.setItem('rkm_s2_goldenBootId', goldenBootId);
  }, [goldenBootId]);

  useEffect(() => {
    localStorage.setItem('rkm_s2_goldenGlovesId', goldenGlovesId);
  }, [goldenGlovesId]);

  const handleScoreChange = (index, field, value) => {
    const updated = [...fixtures];
    updated[index][field] = value === '' ? '' : parseInt(value, 10);
    setFixtures(updated);
  };

  const handleFinalScoreChange = (field, value) => {
    setFinalScore(prev => ({
      ...prev,
      [field]: value === '' ? '' : parseInt(value, 10)
    }));
  };

  // Find selected player objects
  const goldenBallPlayer = players.find(p => p.index === parseInt(goldenBallId, 10));
  const goldenBootPlayer = players.find(p => p.index === parseInt(goldenBootId, 10));
  const goldenGlovesPlayer = players.find(p => p.index === parseInt(goldenGlovesId, 10));

  // Calculate standings dynamically using real team names
  const teamBgColors = ['bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500', 'bg-indigo-500'];
  
  const calculateStandings = () => {
    const initialStats = {};
    teams.forEach((team, idx) => {
      const group = idx % 2 === 0 ? 'A' : 'B';
      initialStats[team.name] = {
        name: team.name,
        group,
        color: teamBgColors[idx % teamBgColors.length],
        played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0
      };
    });

    fixtures.forEach(match => {
      const { team1, team2, score1, score2 } = match;
      if (score1 !== '' && score2 !== '' && score1 !== null && score2 !== null && initialStats[team1] && initialStats[team2]) {
        const s1 = parseInt(score1, 10);
        const s2 = parseInt(score2, 10);

        if (!isNaN(s1) && !isNaN(s2)) {
          initialStats[team1].played += 1;
          initialStats[team2].played += 1;
          initialStats[team1].goalsFor += s1;
          initialStats[team1].goalsAgainst += s2;
          initialStats[team2].goalsFor += s2;
          initialStats[team2].goalsAgainst += s1;

          if (s1 > s2) {
            initialStats[team1].won += 1;
            initialStats[team1].points += 3;
            initialStats[team2].lost += 1;
          } else if (s1 < s2) {
            initialStats[team2].won += 1;
            initialStats[team2].points += 3;
            initialStats[team1].lost += 1;
          } else {
            initialStats[team1].drawn += 1;
            initialStats[team1].points += 1;
            initialStats[team2].drawn += 1;
            initialStats[team2].points += 1;
          }
        }
      }
    });

    const standings = Object.values(initialStats).map(team => ({
      ...team,
      goalDifference: team.goalsFor - team.goalsAgainst
    }));

    const sortTeams = (a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.name.localeCompare(b.name);
    };

    return {
      groupA: standings.filter(t => t.group === 'A').sort(sortTeams),
      groupB: standings.filter(t => t.group === 'B').sort(sortTeams)
    };
  };

  const { groupA, groupB } = calculateStandings();

  return (
    <div className="min-h-screen text-slate-50 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center md:text-left mb-12 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-20 right-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <span className="text-indigo-400 font-semibold tracking-wider text-sm uppercase">RKM LEGACY LEAGUE Season 2</span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-2">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-200 via-purple-300 to-indigo-100 antialiased" style={{ WebkitTextFillColor: 'transparent' }}>
            Tournament Details
          </span>
        </h1>
        <p className="text-slate-400 mt-4 max-w-2xl text-lg leading-relaxed">
          Welcome to the ultimate showdown. Read below to understand how teams are formed, the structure of the league, and the lottery draft system.
        </p>
      </div>

      <SeasonButton activeSeason="s2" />

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

      {/* Lottery System Detail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20 bg-slate-900/30 rounded-3xl border border-white/10 p-8 md:p-12">
        <div>
          <span className="text-indigo-400 font-semibold text-sm tracking-wider uppercase">Fair & Unpredictable</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 text-white">The Lottery Draft System</h2>
          <p className="text-slate-400 mt-4 leading-relaxed">
            To prevent stack building and ensure an equal playing field, all registered players are entered into a common pool. During the live lottery event:
          </p>
          <ul className="space-y-4 mt-6">
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold mt-1">1</span>
              <div>
                <strong className="text-slate-200">Randomized Selection:</strong> Players will be pulled from a lottery bowl or digital RNG selector one by one.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold mt-1">2</span>
              <div>
                <strong className="text-slate-200">Balanced Roster Slots:</strong> Once a team fills its 5 active roster slots, they are locked out of the lottery, and remaining players go to the other teams.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold mt-1">3</span>
              <div>
                <strong className="text-slate-200">Zero Biases:</strong> No captains' picks, no pre-made stacks. True chemistry will be forged in the fire of the tournament.
              </div>
            </li>
          </ul>
        </div>
        <div className="relative flex justify-center">
          <div className="w-72 h-72 rounded-full bg-indigo-500/10 absolute -inset-4 blur-2xl"></div>
          {/* Lottery Bowl Visualizer */}
          <div className="relative border border-white/20 bg-slate-950/80 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h4 className="font-semibold text-slate-200 mb-4 text-center pb-2 border-b border-white/10">LIVE LOTTERY SIMULATOR</h4>
            <div className="space-y-3">
              <div className="bg-slate-900 border border-white/5 p-3 rounded-lg flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">Total Players in Pool</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400">30</span>
              </div>
              <div className="bg-slate-900 border border-white/5 p-3 rounded-lg flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">Slots Per Team</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400">5</span>
              </div>
              <div className="bg-slate-900 border border-white/5 p-3 rounded-lg flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">Total Teams</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500/20 text-pink-400">6</span>
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <Link
                to="/lottery"
                className="animate-pulse px-4 py-2 bg-linear-to-r from-indigo-500 to-purple-600 rounded-lg text-xs font-bold text-white shadow-lg shadow-indigo-500/30 cursor-pointer hover:scale-105 transition-transform duration-200 block text-center"
              >
                AWAITING LIVE DRAW
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Roster / Team Overview Preview */}
      <div className="mb-20">
        <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center text-white">The Contenders</h3>
        <TeamCard teams={teams} />
      </div>

      {/* Groups & Fixtures Section */}
      <div className="mb-20 bg-slate-900/20 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center text-white">Groups & Fixtures</h3>
        
        {/* Groups Standings Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Group A Standings */}
          <div className="relative group overflow-hidden rounded-2xl bg-slate-900/30 border border-white/10 p-6 shadow-xl backdrop-blur-md">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-white/5">
              <div>
                <h4 className="font-extrabold text-xl text-indigo-400">GROUP A</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Teams 1, 3, 5 • Topper qualifies for Grand Final</p>
              </div>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider">Group 1</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 font-semibold uppercase tracking-wider text-[10px] sm:text-xs">
                    <th className="py-2.5 px-2 text-center w-8">Pos</th>
                    <th className="py-2.5 px-2">Team</th>
                    <th className="py-2.5 px-2 text-center w-8">P</th>
                    <th className="py-2.5 px-2 text-center w-8 hidden sm:table-cell">W</th>
                    <th className="py-2.5 px-2 text-center w-8 hidden sm:table-cell">D</th>
                    <th className="py-2.5 px-2 text-center w-8 hidden sm:table-cell">L</th>
                    <th className="py-2.5 px-2 text-center w-10">GD</th>
                    <th className="py-2.5 px-2 text-center w-10 font-bold text-indigo-400">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px] sm:text-xs">
                  {groupA.map((team, idx) => {
                    const isTopper = idx === 0;
                    return (
                      <tr key={team.name} className={`hover:bg-white/5 transition-colors ${isTopper ? 'bg-indigo-500/5' : ''}`}>
                        <td className="py-3 px-2 text-center font-bold text-slate-400">
                          {isTopper ? (
                            <span className="text-amber-400 font-bold" title="Group Topper (Finalist)">1🏆</span>
                          ) : (
                            idx + 1
                          )}
                        </td>
                        <td className="py-3 px-2 font-semibold text-slate-200 font-sans">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${team.color}`}></span>
                            <span>{team.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center text-slate-300">{team.played}</td>
                        <td className="py-3 px-2 text-center text-slate-400 hidden sm:table-cell">{team.won}</td>
                        <td className="py-3 px-2 text-center text-slate-400 hidden sm:table-cell">{team.drawn}</td>
                        <td className="py-3 px-2 text-center text-slate-400 hidden sm:table-cell">{team.lost}</td>
                        <td className={`py-3 px-2 text-center font-bold ${team.goalDifference > 0 ? 'text-emerald-400' : team.goalDifference < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                          {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-indigo-400 text-xs sm:text-sm">{team.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Group B Standings */}
          <div className="relative group overflow-hidden rounded-2xl bg-slate-900/30 border border-white/10 p-6 shadow-xl backdrop-blur-md">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-white/5">
              <div>
                <h4 className="font-extrabold text-xl text-purple-400">GROUP B</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Teams 2, 4, 6 • Topper qualifies for Grand Final</p>
              </div>
              <span className="text-[10px] bg-purple-500/10 text-purple-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider">Group 2</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 font-semibold uppercase tracking-wider text-[10px] sm:text-xs">
                    <th className="py-2.5 px-2 text-center w-8">Pos</th>
                    <th className="py-2.5 px-2">Team</th>
                    <th className="py-2.5 px-2 text-center w-8">P</th>
                    <th className="py-2.5 px-2 text-center w-8 hidden sm:table-cell">W</th>
                    <th className="py-2.5 px-2 text-center w-8 hidden sm:table-cell">D</th>
                    <th className="py-2.5 px-2 text-center w-8 hidden sm:table-cell">L</th>
                    <th className="py-2.5 px-2 text-center w-10">GD</th>
                    <th className="py-2.5 px-2 text-center w-10 font-bold text-purple-400">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px] sm:text-xs">
                  {groupB.map((team, idx) => {
                    const isTopper = idx === 0;
                    return (
                      <tr key={team.name} className={`hover:bg-white/5 transition-colors ${isTopper ? 'bg-purple-500/5' : ''}`}>
                        <td className="py-3 px-2 text-center font-bold text-slate-400">
                          {isTopper ? (
                            <span className="text-amber-400 font-bold" title="Group Topper (Finalist)">1🏆</span>
                          ) : (
                            idx + 1
                          )}
                        </td>
                        <td className="py-3 px-2 font-semibold text-slate-200 font-sans">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${team.color}`}></span>
                            <span>{team.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center text-slate-300">{team.played}</td>
                        <td className="py-3 px-2 text-center text-slate-400 hidden sm:table-cell">{team.won}</td>
                        <td className="py-3 px-2 text-center text-slate-400 hidden sm:table-cell">{team.drawn}</td>
                        <td className="py-3 px-2 text-center text-slate-400 hidden sm:table-cell">{team.lost}</td>
                        <td className={`py-3 px-2 text-center font-bold ${team.goalDifference > 0 ? 'text-emerald-400' : team.goalDifference < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                          {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-purple-400 text-xs sm:text-sm">{team.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Fixtures Timeline */}
        <div className="bg-slate-900/20 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-3">
            <h4 className="font-bold text-lg text-white">Fixture Schedule</h4>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-500 hover:text-white transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
            >
              {isEditing ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Finish Editing
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Update Scores / Winners
                </>
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fixtures.map((fixture, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between bg-slate-950/60 border border-white/5 rounded-2xl p-4 hover:border-indigo-500/20 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {fixture.id}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Group {fixture.group}
                  </span>
                </div>
                
                {isEditing ? (
                  <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm text-slate-200">
                    <span>{fixture.team1}</span>
                    <input
                      type="number"
                      value={fixture.score1}
                      min="0"
                      placeholder="-"
                      onChange={(e) => handleScoreChange(index, 'score1', e.target.value)}
                      className="w-10 text-center bg-slate-900 border border-white/10 rounded px-1 py-0.5 text-xs text-indigo-400 focus:outline-none focus:border-indigo-500"
                    />
                    <span className="text-[10px] text-slate-500">—</span>
                    <input
                      type="number"
                      value={fixture.score2}
                      min="0"
                      placeholder="-"
                      onChange={(e) => handleScoreChange(index, 'score2', e.target.value)}
                      className="w-10 text-center bg-slate-900 border border-white/10 rounded px-1 py-0.5 text-xs text-indigo-400 focus:outline-none focus:border-indigo-500"
                    />
                    <span>{fixture.team2}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 font-semibold text-xs sm:text-sm text-slate-200">
                    <span>{fixture.team1}</span>
                    {fixture.score1 !== '' && fixture.score2 !== '' ? (
                      <span className="text-sm font-extrabold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded font-mono">
                        {fixture.score1} — {fixture.score2}
                      </span>
                    ) : (
                      <span className="text-[10px] text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-1.5 py-0.5 rounded font-mono font-bold">VS</span>
                    )}
                    <span>{fixture.team2}</span>
                  </div>
                )}
                
                <span className="text-xs text-slate-500 font-mono hidden sm:inline">({fixture.format})</span>
              </div>
            ))}
          </div>

          {/* Grand Final Card */}
          <div className="mt-6 bg-linear-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h5 className="font-extrabold text-white text-base">Grand Final</h5>
              <p className="text-slate-400 text-xs mt-1">Decided between the top-ranked teams (toppers) of Group A and Group B.</p>
            </div>
            
            {isEditing ? (
              <div className="flex items-center gap-2 font-semibold text-xs text-slate-200">
                <span className="text-xs font-bold text-amber-400">A Topper</span>
                <input
                  type="number"
                  value={finalScore.score1}
                  min="0"
                  placeholder="-"
                  onChange={(e) => handleFinalScoreChange('score1', e.target.value)}
                  className="w-10 text-center bg-slate-900 border border-white/10 rounded px-1 py-0.5 text-xs text-amber-400 focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500">—</span>
                <input
                  type="number"
                  value={finalScore.score2}
                  min="0"
                  placeholder="-"
                  onChange={(e) => handleFinalScoreChange('score2', e.target.value)}
                  className="w-10 text-center bg-slate-900 border border-white/10 rounded px-1 py-0.5 text-xs text-amber-400 focus:outline-none focus:border-amber-500"
                />
                <span className="text-xs font-bold text-amber-400">B Topper</span>
              </div>
            ) : (
              finalScore.score1 !== '' && finalScore.score2 !== '' ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-amber-400">A Topper</span>
                  <span className="text-sm font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded font-mono border border-amber-500/20">
                    {finalScore.score1} — {finalScore.score2}
                  </span>
                  <span className="text-xs font-bold text-amber-400">B Topper</span>
                </div>
              ) : (
                <span className="px-4 py-2 bg-linear-to-r from-indigo-500 to-purple-600 rounded-xl text-xs font-bold text-white shadow-lg shadow-indigo-500/25 uppercase tracking-wider whitespace-nowrap animate-pulse">
                  Group A Topper VS Group B Topper
                </span>
              )
            )}
          </div>

        </div>
      </div>

      {/* Season 2 Individual Awards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 bg-slate-900/30 rounded-3xl border border-white/10 p-8 md:p-12 relative overflow-hidden">
        {/* Intro */}
        <div className="lg:col-span-1 flex flex-col justify-center space-y-4">
          <span className="text-indigo-400 font-semibold text-sm tracking-wider uppercase">Hall of Fame</span>
          <h2 className="text-3xl font-bold text-white">Season 2 Awards</h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Recognizing the top individual achievements on the pitch. Update the winners as the tournament progresses.
          </p>
        </div>

        {/* Awards Cards Grid */}
        <div className="lg:col-span-2 flex flex-col justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Golden Ball */}
            <div className="flex flex-col space-y-3">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider text-center flex items-center justify-center gap-1.5 bg-amber-500/10 py-1.5 rounded-lg border border-amber-500/20">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3v18M3 12h18" />
                </svg>
                Golden Ball
              </div>
              
              {isEditing && (
                <select
                  value={goldenBallId}
                  onChange={(e) => setGoldenBallId(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
                >
                  <option value="">Select Player...</option>
                  {players.map(player => (
                    <option key={player.index} value={player.index}>
                      {player.name} ({player.position})
                    </option>
                  ))}
                </select>
              )}

              {goldenBallPlayer ? (
                <PlayerCard player={goldenBallPlayer} />
              ) : (
                <div className="rounded-2xl border border-dashed border-white/5 bg-slate-950/20 p-6 text-center flex flex-col items-center justify-center min-h-35">
                  <span className="text-xs text-slate-600 italic">Awaiting Winner</span>
                </div>
              )}
            </div>

            {/* Golden Boot */}
            <div className="flex flex-col space-y-3">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider text-center flex items-center justify-center gap-1.5 bg-amber-500/10 py-1.5 rounded-lg border border-amber-500/20">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Golden Boot
              </div>
              
              {isEditing && (
                <select
                  value={goldenBootId}
                  onChange={(e) => setGoldenBootId(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
                >
                  <option value="">Select Player...</option>
                  {players.map(player => (
                    <option key={player.index} value={player.index}>
                      {player.name} ({player.position})
                    </option>
                  ))}
                </select>
              )}

              {goldenBootPlayer ? (
                <PlayerCard player={goldenBootPlayer} />
              ) : (
                <div className="rounded-2xl border border-dashed border-white/5 bg-slate-950/20 p-6 text-center flex flex-col items-center justify-center min-h-35">
                  <span className="text-xs text-slate-600 italic">Awaiting Winner</span>
                </div>
              )}
            </div>

            {/* Golden Gloves */}
            <div className="flex flex-col space-y-3">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider text-center flex items-center justify-center gap-1.5 bg-amber-500/10 py-1.5 rounded-lg border border-amber-500/20">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Golden Gloves
              </div>
              
              {isEditing && (
                <select
                  value={goldenGlovesId}
                  onChange={(e) => setGoldenGlovesId(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
                >
                  <option value="">Select Player...</option>
                  {players.map(player => (
                    <option key={player.index} value={player.index}>
                      {player.name} ({player.position})
                    </option>
                  ))}
                </select>
              )}

              {goldenGlovesPlayer ? (
                <PlayerCard player={goldenGlovesPlayer} />
              ) : (
                <div className="rounded-2xl border border-dashed border-white/5 bg-slate-950/20 p-6 text-center flex flex-col items-center justify-center min-h-35">
                  <span className="text-xs text-slate-600 italic">Awaiting Winner</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Tournament
