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
        if (playersData.success) setPlayers(playersData.players);

        const teamsData = await teamsRes.json();
        if (teamsData.success) setDbTeams(teamsData.teams);

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
    'from-blue-500 to-cyan-500 shadow-blue-500/20', 'from-purple-500 to-pink-500 shadow-purple-500/20',
    'from-amber-500 to-orange-500 shadow-amber-500/20', 'from-emerald-500 to-teal-500 shadow-emerald-500/20',
    'from-rose-500 to-red-500 shadow-rose-500/20', 'from-indigo-500 to-violet-500 shadow-indigo-500/20'
  ];

  const isLotteryCompleted = lotteryStatus === 'complete';
  const defaultTeams = [
    { teamName: 'Team A' }, { teamName: 'Team B' }, { teamName: 'Team C' },
    { teamName: 'Team D' }, { teamName: 'Team E' }, { teamName: 'Team F' }
  ];

  const displayTeams = dbTeams.length > 0
    ? (selectedTeams.length > 0
      ? [...dbTeams].filter(dt => selectedTeams.some(st => st.index === dt.index)).sort((a, b) => a.index - b.index)
      : [...dbTeams].filter(dt => dt.index >= 1 && dt.index <= 6).sort((a, b) => a.index - b.index))
    : (isLotteryCompleted && selectedTeams.length > 0 ? selectedTeams : defaultTeams);

  const teams = displayTeams.map((t, idx) => {
    const roster = t.index ? (draftResults[String(t.index)] || []) : [];
    return {
      name: t.teamName || t['team-name'] || `Team ${idx + 1}`,
      color: teamColorMap[idx % teamColorMap.length],
      players: roster.length > 0 ? roster.map((p, pIdx) => ({ name: p.name, position: p.position || 'FW', isCaptain: pIdx === 0 })) : null
    };
  });

  const [fixtures, setFixtures] = useState(() => {
    const saved = localStorage.getItem('rkm_s2_fixtures');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
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

  const [finalMatch, setFinalMatch] = useState(() => {
    const saved = localStorage.getItem('rkm_s2_finalMatch');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return { id: 'Grand Final', team1: 'SF1 Winner', team2: 'SF2 Winner', score1: '', score2: '', scorers: [], assists: [], motm: '' };
  });

  const [sf1Match, setSf1Match] = useState(() => {
    const saved = localStorage.getItem('rkm_s2_sf1Match');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return { id: 'Semifinal 1', team1: 'Group A Topper', team2: 'Group B Runner-up', score1: '', score2: '', scorers: [], assists: [], motm: '' };
  });

  const [sf2Match, setSf2Match] = useState(() => {
    const saved = localStorage.getItem('rkm_s2_sf2Match');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return { id: 'Semifinal 2', team1: 'Group B Topper', team2: 'Group A Runner-up', score1: '', score2: '', scorers: [], assists: [], motm: '' };
  });

  const [goldenBallId] = useState(() => localStorage.getItem('rkm_s2_goldenBallId') || '');
  const [goldenBootId] = useState(() => localStorage.getItem('rkm_s2_goldenBootId') || '');
  const [goldenGlovesId] = useState(() => localStorage.getItem('rkm_s2_goldenGlovesId') || '');

  useEffect(() => {
    const handleStorageChange = () => {
      const savedFixtures = localStorage.getItem('rkm_s2_fixtures');
      if (savedFixtures) setFixtures(JSON.parse(savedFixtures));
      
      const savedSf1 = localStorage.getItem('rkm_s2_sf1Match');
      if (savedSf1) setSf1Match(JSON.parse(savedSf1));
      
      const savedSf2 = localStorage.getItem('rkm_s2_sf2Match');
      if (savedSf2) setSf2Match(JSON.parse(savedSf2));
      
      const savedFinal = localStorage.getItem('rkm_s2_finalMatch');
      if (savedFinal) setFinalMatch(JSON.parse(savedFinal));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getFixtureTeams = (fixtureIndex) => {
    const mappings = [[0, 2], [1, 3], [2, 4], [3, 5], [4, 0], [5, 1]];
    const map = mappings[fixtureIndex];
    if (map && teams.length >= 6) {
      return { team1: teams[map[0]]?.name, team2: teams[map[1]]?.name };
    }
    return { team1: `Team ${String.fromCharCode(65 + map[0])}`, team2: `Team ${String.fromCharCode(65 + map[1])}` };
  };

  const goldenBallPlayer = players.find(p => p.index === parseInt(goldenBallId, 10));
  const goldenBootPlayer = players.find(p => p.index === parseInt(goldenBootId, 10));
  const goldenGlovesPlayer = players.find(p => p.index === parseInt(goldenGlovesId, 10));

  const teamBgColors = ['bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500', 'bg-indigo-500'];

  const calculateStandings = () => {
    const initialStats = {};
    teams.forEach((team, idx) => {
      const group = idx % 2 === 0 ? 'A' : 'B';
      initialStats[team.name] = {
        name: team.name, group, color: teamBgColors[idx % teamBgColors.length],
        played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0
      };
    });

    fixtures.forEach((match, idx) => {
      const { score1, score2 } = match;
      const { team1, team2 } = getFixtureTeams(idx);
      if (score1 !== '' && score2 !== '' && score1 !== null && score2 !== null && initialStats[team1] && initialStats[team2]) {
        const s1 = parseInt(score1, 10);
        const s2 = parseInt(score2, 10);
        if (!isNaN(s1) && !isNaN(s2)) {
          initialStats[team1].played += 1; initialStats[team2].played += 1;
          initialStats[team1].goalsFor += s1; initialStats[team1].goalsAgainst += s2;
          initialStats[team2].goalsFor += s2; initialStats[team2].goalsAgainst += s1;

          if (s1 > s2) { initialStats[team1].won += 1; initialStats[team1].points += 3; initialStats[team2].lost += 1; } 
          else if (s1 < s2) { initialStats[team2].won += 1; initialStats[team2].points += 3; initialStats[team1].lost += 1; } 
          else { initialStats[team1].drawn += 1; initialStats[team1].points += 1; initialStats[team2].drawn += 1; initialStats[team2].points += 1; }
        }
      }
    });

    const standings = Object.values(initialStats).map(team => ({ ...team, goalDifference: team.goalsFor - team.goalsAgainst }));
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
  const isGroupStageComplete = fixtures.every(f => f.score1 !== '' && f.score2 !== '');
  const resolvedTopperA = groupA[0]?.name || 'Group A Topper';
  const resolvedRunnerA = groupA[1]?.name || 'Group A Runner-up';
  const resolvedTopperB = groupB[0]?.name || 'Group B Topper';
  const resolvedRunnerB = groupB[1]?.name || 'Group B Runner-up';

  const isSf1Complete = sf1Match.score1 !== '' && sf1Match.score2 !== '';
  const isSf2Complete = sf2Match.score1 !== '' && sf2Match.score2 !== '';

  const getWinner = (match, t1, t2) => {
    if (match.score1 === '' || match.score2 === '') return null;
    const s1 = parseInt(match.score1, 10);
    const s2 = parseInt(match.score2, 10);
    return s1 > s2 ? t1 : t2;
  };

  const resolvedSf1Winner = getWinner(sf1Match, resolvedTopperA, resolvedRunnerB) || 'SF1 Winner';
  const resolvedSf2Winner = getWinner(sf2Match, resolvedTopperB, resolvedRunnerA) || 'SF2 Winner';

  return (
    <div className="min-h-screen text-slate-50 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Container Layout */}
      <div className="text-center md:text-left mb-12">
        <span className="text-indigo-400 font-semibold tracking-wider text-sm uppercase">RKM LEGACY LEAGUE Season 2</span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-2">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-200 via-purple-300 to-indigo-100 antialiased" style={{ WebkitTextFillColor: 'transparent' }}>
            Tournament Details
          </span>
        </h1>
      </div>

      <SeasonButton activeSeason="s2" />

      {/* 📊 Stats / Highlight Grid Panel Block[cite: 8] */}
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

      {/* Team Rosters Header & Live Navigation Connector */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-3 mb-6">
          <h4 className="font-bold text-lg text-white">Participating Teams</h4>
          <Link
            to="/lottery"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-linear-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 uppercase tracking-wider"
          >
            <svg className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.774 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Go to Live Lottery Draft
          </Link>
        </div>
        <TeamCard teams={teams} />
      </div>

      {/* Standings Tables[cite: 8] */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="rounded-2xl bg-slate-900/30 border border-white/10 p-6 shadow-xl backdrop-blur-md">
          <h4 className="font-extrabold text-xl text-indigo-400 mb-4">GROUP A</h4>
          <table className="w-full text-left text-xs sm:text-sm font-mono">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 font-semibold font-sans">
                <th className="py-2 px-2 text-center w-8">Pos</th><th>Team</th><th className="py-2 text-center w-8">P</th><th className="py-2 text-center w-10">GD</th><th className="py-2 text-center w-10 text-indigo-400">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {groupA.map((team, idx) => (
                <tr key={team.name} className={`hover:bg-white/5 ${idx === 0 ? 'bg-indigo-500/5' : ''}`}>
                  <td className="py-3 px-2 text-center font-bold">
                    {/* Wrapped inside a flex layout container to keep position indicator elements aligned side-by-side cleanly */}
                    {idx === 0 ? (
                      <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                        <span>1</span>
                        <span>🏆</span>
                      </div>
                    ) : (
                      idx + 1
                    )}
                  </td>
                  <td className="py-3 px-2 font-semibold font-sans">{team.name}</td>
                  <td className="py-3 text-center">{team.played}</td>
                  <td className="py-3 text-center">{team.goalDifference}</td>
                  <td className="py-3 text-center font-bold text-indigo-400">{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl bg-slate-900/30 border border-white/10 p-6 shadow-xl backdrop-blur-md">
          <h4 className="font-extrabold text-xl text-purple-400 mb-4">GROUP B</h4>
          <table className="w-full text-left text-xs sm:text-sm font-mono">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 font-semibold font-sans">
                <th className="py-2 px-2 text-center w-8">Pos</th><th>Team</th><th className="py-2 text-center w-8">P</th><th className="py-2 text-center w-10">GD</th><th className="py-2 text-center w-10 text-purple-400">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {groupB.map((team, idx) => (
                <tr key={team.name} className={`hover:bg-white/5 ${idx === 0 ? 'bg-purple-500/5' : ''}`}>
                  <td className="py-3 px-2 text-center font-bold">
                    {/* Wrapped inside a flex layout container to keep position indicator elements aligned side-by-side cleanly */}
                    {idx === 0 ? (
                      <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                        <span>1</span>
                        <span>🏆</span>
                      </div>
                    ) : (
                      idx + 1
                    )}
                  </td>
                  <td className="py-3 px-2 font-semibold font-sans">{team.name}</td>
                  <td className="py-3 text-center">{team.played}</td>
                  <td className="py-3 text-center">{team.goalDifference}</td>
                  <td className="py-3 text-center font-bold text-purple-400">{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fixtures Timeline Section[cite: 8] */}
      <div className="bg-slate-900/20 border border-white/10 rounded-3xl p-6 md:p-8 mb-12">
        <h4 className="font-bold text-lg text-white border-b border-white/5 pb-3 mb-6">Fixture Schedule</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fixtures.map((fixture, index) => {
            const { team1: displayTeam1, team2: displayTeam2 } = getFixtureTeams(index);
            return (
              <div key={index} className="flex items-center justify-between bg-slate-950/60 border border-white/5 rounded-2xl p-4">
                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{fixture.id}</span>
                <div className="flex items-center gap-3 font-semibold text-xs sm:text-sm text-slate-200">
                  <span>{displayTeam1}</span>
                  {fixture.score1 !== '' && fixture.score2 !== '' ? (
                    <span className="text-sm font-extrabold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded font-mono">{fixture.score1} — {fixture.score2}</span>
                  ) : (
                    <span className="text-[10px] text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-1.5 py-0.5 rounded font-bold">VS</span>
                  )}
                  <span>{displayTeam2}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Playoffs Knockout Container */}
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Semifinal 1 */}
            <div className="bg-linear-to-r from-slate-900 to-indigo-950/30 border border-indigo-500/20 rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-3">
                <h5 className="font-bold text-white text-sm">Semifinal 1</h5>
                {!isGroupStageComplete ? (
                  <span className="px-3 py-1 bg-slate-900 border border-white/5 text-slate-500 text-[10px] font-bold rounded-lg uppercase">Locked</span>
                ) : (
                  <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-lg uppercase">Active</span>
                )}
              </div>
              <div className="flex flex-col gap-2 bg-slate-950/50 p-4 rounded-xl border border-white/5 text-sm font-semibold">
                <div className="flex justify-between items-center text-slate-200">
                  <span className="text-amber-400 text-xs">1A</span>
                  <span>{resolvedTopperA}</span>
                  <span className="font-mono bg-indigo-500/10 px-2 py-0.5 rounded text-indigo-400">{sf1Match.score1 !== '' ? sf1Match.score1 : '-'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-200">
                  <span className="text-purple-400 text-xs">2B</span>
                  <span>{resolvedRunnerB}</span>
                  <span className="font-mono bg-indigo-500/10 px-2 py-0.5 rounded text-indigo-400">{sf1Match.score2 !== '' ? sf1Match.score2 : '-'}</span>
                </div>
              </div>
            </div>

            {/* Semifinal 2 */}
            <div className="bg-linear-to-r from-slate-900 to-indigo-950/30 border border-indigo-500/20 rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-3">
                <h5 className="font-bold text-white text-sm">Semifinal 2</h5>
                {!isGroupStageComplete ? (
                  <span className="px-3 py-1 bg-slate-900 border border-white/5 text-slate-500 text-[10px] font-bold rounded-lg uppercase">Locked</span>
                ) : (
                  <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-lg uppercase">Active</span>
                )}
              </div>
              <div className="flex flex-col gap-2 bg-slate-950/50 p-4 rounded-xl border border-white/5 text-sm font-semibold">
                <div className="flex justify-between items-center text-slate-200">
                  <span className="text-purple-400 text-xs">1B</span>
                  <span>{resolvedTopperB}</span>
                  <span className="font-mono bg-indigo-500/10 px-2 py-0.5 rounded text-indigo-400">{sf2Match.score1 !== '' ? sf2Match.score1 : '-'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-200">
                  <span className="text-amber-400 text-xs">2A</span>
                  <span>{resolvedRunnerA}</span>
                  <span className="font-mono bg-indigo-500/10 px-2 py-0.5 rounded text-indigo-400">{sf2Match.score2 !== '' ? sf2Match.score2 : '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grand Final Card Container */}
          <div className="bg-linear-to-r from-indigo-950 to-purple-950 border border-purple-500/30 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h5 className="font-extrabold text-white text-base">Grand Final Match</h5>
              </div>
              
              {!(isSf1Complete && isSf2Complete) ? (
                <span className="px-4 py-2 bg-slate-900 border border-white/5 text-slate-500 text-xs font-bold rounded-xl tracking-wider">
                  Awaiting Finals
                </span>
              ) : (
                <div className="flex items-center gap-4 text-xs sm:text-sm font-bold text-slate-200">
                  <span className="text-amber-400 uppercase tracking-wide">{resolvedSf1Winner}</span>
                  {finalMatch.score1 !== '' && finalMatch.score2 !== '' ? (
                    <span className="text-base font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-1 rounded-xl font-mono">
                      {finalMatch.score1} — {finalMatch.score2}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-purple-500 text-white rounded-lg text-xs font-black tracking-widest">VS</span>
                  )}
                  <span className="text-amber-400 uppercase tracking-wide">{resolvedSf2Winner}</span>
                </div>
              )}
            </div>

            {/* Render Stats info for Grand Final if complete */}
            {(isSf1Complete && isSf2Complete) && (finalMatch.score1 !== '' || finalMatch.scorers?.length > 0) && (
              <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
                <div>
                  <span className="block font-bold text-slate-300 mb-1">⚽ Scorers:</span>
                  {finalMatch.scorers?.map((s, i) => <span key={i} className="inline-block bg-white/5 rounded px-2 py-0.5 mr-1 mb-1">⚽ {s.name}</span>) || 'None'}
                </div>
                <div>
                  <span className="block font-bold text-slate-300 mb-1">👟 Assists:</span>
                  {finalMatch.assists?.map((a, i) => <span key={i} className="inline-block bg-white/5 rounded px-2 py-0.5 mr-1 mb-1">👟 {a.name}</span>) || 'None'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tournament;