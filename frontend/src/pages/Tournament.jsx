import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import TeamCard from '../components/TeamCard';
import SeasonButton from '../components/SeasonButton';
import API_BASE from '../api';

const Tournament = () => {
  const [players, setPlayers] = useState([]);
  const [dbTeams, setDbTeams] = useState([]);
  const [draftResults, setDraftResults] = useState({});
  const [lotteryStatus, setLotteryStatus] = useState('idle');
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [expandedMatchId, setExpandedMatchId] = useState(null);

  // Fixtures State
  const [fixtures, setFixtures] = useState([]);
  const [sf1Match, setSf1Match] = useState({ id: 'Semifinal 1', team1: 'Group A Topper', team2: 'Group B Runner-up', score1: '', score2: '', penaltyScore1: '', penaltyScore2: '', coinTossWinner: '', goals: [], motm: '' });
  const [sf2Match, setSf2Match] = useState({ id: 'Semifinal 2', team1: 'Group B Topper', team2: 'Group A Runner-up', score1: '', score2: '', penaltyScore1: '', penaltyScore2: '', coinTossWinner: '', goals: [], motm: '' });
  const [finalMatch, setFinalMatch] = useState({ id: 'Grand Final', team1: 'SF1 Winner', team2: 'SF2 Winner', score1: '', score2: '', penaltyScore1: '', penaltyScore2: '', coinTossWinner: '', goals: [], motm: '' });

  // Global Awards State
  const [ballAward, setBallAward] = useState('');
  const [bootAward, setBootAward] = useState('');
  const [glovesAward, setGlovesAward] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersRes, teamsRes, lotteryRes, fixturesRes] = await Promise.all([
          fetch(`${API_BASE}/players`),
          fetch(`${API_BASE}/teams`),
          fetch(`${API_BASE}/lottery/state`, { credentials: "include" }).catch(() => null),
          fetch(`${API_BASE}/fixtures/s2`)
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

        const fixturesData = await fixturesRes.json();
        if (fixturesData.success) {
          const allFixtures = fixturesData.data;
          const groupFixtures = allFixtures.filter(f => f.id.startsWith('Match'));
          setFixtures(groupFixtures.length > 0 ? groupFixtures : []);
          
          const s1 = allFixtures.find(f => f.id === 'Semifinal 1');
          const s2 = allFixtures.find(f => f.id === 'Semifinal 2');
          const fin = allFixtures.find(f => f.id === 'Grand Final');
          
          if (s1) setSf1Match(s1);
          if (s2) setSf2Match(s2);
          if (fin) setFinalMatch(fin);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();

    // Initialize Global Awards Sync
    setBallAward(localStorage.getItem('rkm_s2_goldenBallName') || '');
    setBootAward(localStorage.getItem('rkm_s2_goldenBootName') || '');
    setGlovesAward(localStorage.getItem('rkm_s2_goldenGlovesName') || '');
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

  const getFixtureTeams = (fixtureIndex) => {
    const mappings = [[0, 2], [1, 3], [2, 4], [3, 5], [4, 0], [5, 1]];
    const map = mappings[fixtureIndex];
    if (map && teams.length >= 6) {
      return { team1: teams[map[0]]?.name, team2: teams[map[1]]?.name };
    }
    return { team1: `Team ${String.fromCharCode(65 + (map?.[0] || 0))}`, team2: `Team ${String.fromCharCode(65 + (map?.[1] || 1))}` };
  };

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
  const hasGroupStageStarted = fixtures.some(f => f.score1 !== '' && f.score2 !== '' && f.score1 !== null && f.score2 !== null);
  const resolvedTopperA = groupA[0]?.name || 'Group A Topper';
  const resolvedRunnerA = groupA[1]?.name || 'Group A Runner-up';
  const resolvedTopperB = groupB[0]?.name || 'Group B Topper';
  const resolvedRunnerB = groupB[1]?.name || 'Group B Runner-up';

  const isSf1Complete = sf1Match.score1 !== '' && sf1Match.score2 !== '';
  const isSf2Complete = sf2Match.score1 !== '' && sf2Match.score2 !== '';

  const getWinner = (match, t1, t2) => {
    if (!match || match.score1 === '' || match.score2 === '') return null;
    const s1 = parseInt(match.score1, 10);
    const s2 = parseInt(match.score2, 10);
    if (s1 > s2) return t1;
    if (s1 < s2) return t2;
    if (match.penaltyScore1 !== undefined && match.penaltyScore2 !== undefined && match.penaltyScore1 !== '' && match.penaltyScore2 !== '') {
      const p1 = parseInt(match.penaltyScore1, 10);
      const p2 = parseInt(match.penaltyScore2, 10);
      if (p1 > p2) return t1;
      if (p1 < p2) return t2;
    }
    if (match.coinTossWinner && match.coinTossWinner !== '') {
      return match.coinTossWinner;
    }
    return null;
  };

  const resolvedSf1Winner = getWinner(sf1Match, resolvedTopperA, resolvedRunnerB) || 'TBD';
  const resolvedSf2Winner = getWinner(sf2Match, resolvedTopperB, resolvedRunnerA) || 'TBD';

  const renderStatsDropdown = (match, isPlayed) => {
    if (!isPlayed) {
      return (
        <div className="text-center text-slate-400 text-xs py-2">
          📊 Match stats will be available once the game is complete.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs sm:text-sm">
        <div className="bg-slate-950/50 border border-white/5 rounded-xl p-3 md:col-span-8">
          <h5 className="font-bold text-slate-300 mb-2 flex items-center gap-2">
            <span>⚽</span> Goals & Assists
          </h5>
          {match.goals && match.goals.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {match.goals.map((g, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-white/5 px-3 py-2 rounded-lg border border-white/5 text-slate-300">
                  <span className="text-[10px] mt-0.5">⚽</span> 
                  <div className="flex flex-col">
                    <strong className="text-white font-semibold text-xs sm:text-sm">{g.scorer}</strong>
                    {g.assist && g.assist !== 'None' && (
                      <span className="text-indigo-400 text-[11px] sm:text-xs font-medium mt-1 flex items-center gap-1">
                        <span>👟</span> {g.assist}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">No goals recorded</p>
          )}
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex flex-col justify-center text-center md:col-span-4">
          <h5 className="font-bold text-amber-500/70 mb-1 text-[10px] uppercase tracking-widest">Man of the Match</h5>
          {match.motm ? (
            <div className="text-amber-400 font-bold flex items-center justify-center gap-2 text-sm">
               {match.motm}
            </div>
          ) : (
            <p className="text-amber-500/40 italic">Not assigned yet</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen text-slate-50 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center md:text-left mb-12">
        <span className="text-indigo-400 font-semibold tracking-wider text-sm uppercase">RKM LEGACY LEAGUE Season 2</span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-2">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-200 via-purple-300 to-indigo-100 antialiased" style={{ WebkitTextFillColor: 'transparent' }}>
            Tournament Details
          </span>
        </h1>
      </div>

      <SeasonButton activeSeason="s2" />

      {/* Highlights Grid */}
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

      {/* Team Rosters Header */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-3 mb-6">
          <h4 className="font-bold text-lg text-white">Participating Teams</h4>
          <Link
            to="/lottery"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-linear-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 uppercase tracking-wider"
          >
            Go to Live Lottery Draft
          </Link>
        </div>
        <TeamCard teams={teams} />
      </div>

      {/* Standings Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Group A Table */}
        <div className="rounded-2xl bg-slate-900/30 border border-white/10 p-6 shadow-xl backdrop-blur-md">
          <h4 className="font-extrabold text-xl text-indigo-400 mb-4">GROUP A</h4>
          <table className="w-full text-left text-xs sm:text-sm font-mono">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 font-semibold font-sans">
                <th className="py-2 px-2 text-center w-8">Pos</th><th>Team</th><th className="py-2 text-center w-8">P</th><th className="py-2 w-10 text-right">GD</th><th className="py-2 w-10 text-indigo-400 text-right">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {groupA.map((team, idx) => (
                <tr key={team.name} className={`hover:bg-white/5 ${idx === 0 ? 'bg-indigo-500/5' : ''}`}>
                  <td className="py-3 px-2 text-center font-bold">
                    {idx === 0 ? <div className="flex items-center justify-center gap-1 whitespace-nowrap"><span>1</span><span>🏆</span></div> : idx + 1}
                  </td>
                  <td className="py-3 px-2 font-semibold font-sans">{team.name}</td>
                  <td className="py-3 text-center">{team.played}</td>
                  <td className="py-3 text-right">{team.goalDifference}</td>
                  <td className="py-3 text-right font-bold text-indigo-400">{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Group B Table */}
        <div className="rounded-2xl bg-slate-900/30 border border-white/10 p-6 shadow-xl backdrop-blur-md">
          <h4 className="font-extrabold text-xl text-purple-400 mb-4">GROUP B</h4>
          <table className="w-full text-left text-xs sm:text-sm font-mono">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 font-semibold font-sans">
                <th className="py-2 px-2 text-center w-8">Pos</th><th>Team</th><th className="py-2 text-center w-8">P</th><th className="py-2 text-center w-10 ">GD</th><th className="py-2 w-10 text-purple-400 text-right">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {groupB.map((team, idx) => (
                <tr key={team.name} className={`hover:bg-white/5 ${idx === 0 ? 'bg-purple-500/5' : ''}`}>
                  <td className="py-3 px-2 text-center font-bold">
                    {idx === 0 ? <div className="flex items-center justify-center gap-1 whitespace-nowrap"><span>1</span><span>🏆</span></div> : idx + 1}
                  </td>
                  <td className="py-3 px-2 font-semibold font-sans">{team.name}</td>
                  <td className="py-3 text-center">{team.played}</td>
                  <td className="py-3 text-right">{team.goalDifference}</td>
                  <td className="py-3 text-right font-bold text-purple-400">{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fixtures Timeline Section */}
      <div className="bg-slate-900/20 border border-white/10 rounded-3xl p-2 sm:p-6 md:p-8 mb-12">
        <h4 className="font-bold text-lg text-white border-b border-white/5 pb-3 mb-6">Fixture Schedule</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {fixtures.map((fixture, index) => {
            const { team1: displayTeam1, team2: displayTeam2 } = getFixtureTeams(index);
            const isExpanded = expandedMatchId === fixture.id;
            const isPlayed = fixture.score1 !== '' && fixture.score2 !== '';

            return (
              <div key={index} className="flex flex-col bg-slate-950/60 border border-white/5 rounded-2xl overflow-hidden self-start w-full">
                {/* Mobile View Badge Left of Box */}
                <div className="sm:hidden px-3 pt-2.5 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                    {fixture.shortId || fixture.id.replace('Match ', 'M')}
                  </span>
                  <div 
                    onClick={() => setExpandedMatchId(isExpanded ? null : fixture.id)}
                    className="text-slate-400 p-1"
                  >
                    <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div 
                  className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-white/5 transition-colors w-full gap-2 sm:gap-4"
                  onClick={() => setExpandedMatchId(isExpanded ? null : fixture.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Desktop/Tablet Badge Remains Inside */}
                    <span className="hidden sm:inline-block shrink-0 text-center whitespace-nowrap text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                      {fixture.shortId || fixture.id.replace('Match ', 'M')}
                    </span>
                    
                    <div className="flex items-center font-semibold text-xs sm:text-sm text-slate-200 flex-1 min-w-0 gap-1 sm:gap-3">
                      <span className="flex-1 text-right wrap-break-words whitespace-normal">{displayTeam1}</span>
                      <div className="shrink-0 mx-0.5 sm:mx-1">
                        {isPlayed ? (
                          <span className="text-[11px] sm:text-sm font-extrabold text-indigo-400 bg-indigo-500/10 px-1.5 sm:px-2.5 py-0.5 rounded font-mono whitespace-nowrap flex flex-col items-center">
                            <span>{fixture.score1} — {fixture.score2}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">VS</span>
                        )}
                      </div>
                      <span className="flex-1 text-left wrap-break-words whitespace-normal">{displayTeam2}</span>
                    </div>
                  </div>

                  <div className="hidden sm:block text-slate-400 shrink-0">
                    <svg className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-3 sm:p-4 border-t border-white/5 bg-slate-900/50 transition-all">
                    {renderStatsDropdown(fixture, isPlayed)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Playoffs Knockout Containers */}
        <div className="mt-8 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Semifinal 1 Accordion Row */}
            <div className="flex flex-col bg-slate-950/60 border border-indigo-500/20 rounded-2xl overflow-hidden self-start w-full">
              {/* Mobile View Badge Left of Box */}
              <div className="sm:hidden px-3 pt-2.5 flex justify-between items-center">
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">SF 1</span>
                <div 
                  onClick={() => setExpandedMatchId(expandedMatchId === 'sf1' ? null : 'sf1')}
                  className="text-slate-400 p-1"
                >
                  <svg className={`w-4 h-4 transition-transform duration-300 ${expandedMatchId === 'sf1' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div 
                className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-white/5 transition-colors w-full gap-2 sm:gap-4"
                onClick={() => setExpandedMatchId(expandedMatchId === 'sf1' ? null : 'sf1')}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="hidden sm:block shrink-0">
                    <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">SF 1</span>
                  </div>
                  
                  <div className="flex items-center font-semibold text-xs sm:text-sm text-slate-200 flex-1 min-w-0 gap-1 sm:gap-3">
                    <span className="flex-1 text-right wrap-break-words whitespace-normal">{resolvedTopperA}</span>
                    <div className="shrink-0 mx-0.5 sm:mx-1">
                      <span className="font-mono bg-indigo-500/10 px-1.5 sm:px-2 py-0.5 rounded text-indigo-400 text-[11px] sm:text-xs flex flex-col items-center">
                        <span className="flex flex-row items-center gap-1 whitespace-nowrap">
                          <span>{sf1Match.score1 !== '' ? `${sf1Match.score1} — ${sf1Match.score2}` : 'VS'}</span>
                          {sf1Match.score1 !== '' && sf1Match.penaltyScore1 !== undefined && sf1Match.penaltyScore2 !== undefined && sf1Match.penaltyScore1 !== '' && sf1Match.penaltyScore2 !== '' && (
                            <span className="text-[9px] sm:text-[10px] text-purple-300">({sf1Match.penaltyScore1}-{sf1Match.penaltyScore2} PK)</span>
                          )}
                        </span>
                        {sf1Match.coinTossWinner && sf1Match.coinTossWinner !== '' && (
                           <span className="text-[9px] sm:text-[10px] text-amber-400 mt-1 whitespace-nowrap bg-amber-900/30 px-1 py-0.5 rounded">[Decided via Coin Toss]</span>
                        )}
                      </span>
                    </div>
                    <span className="flex-1 text-left wrap-break-words whitespace-normal">{resolvedRunnerB}</span>
                  </div>
                </div>
                
                <svg className={`hidden sm:block w-5 h-5 shrink-0 text-slate-400 transition-transform ${expandedMatchId === 'sf1' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {expandedMatchId === 'sf1' && (
                <div className="p-3 sm:p-4 border-t border-white/5 bg-slate-900/50">
                  {renderStatsDropdown(sf1Match, isSf1Complete)}
                </div>
              )}
            </div>

            {/* Semifinal 2 Accordion Row */}
            <div className="flex flex-col bg-slate-950/60 border border-indigo-500/20 rounded-2xl overflow-hidden self-start w-full">
              {/* Mobile View Badge Left of Box */}
              <div className="sm:hidden px-3 pt-2.5 flex justify-between items-center">
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">SF 2</span>
                <div 
                  onClick={() => setExpandedMatchId(expandedMatchId === 'sf2' ? null : 'sf2')}
                  className="text-slate-400 p-1"
                >
                  <svg className={`w-4 h-4 transition-transform duration-300 ${expandedMatchId === 'sf2' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div 
                className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-white/5 transition-colors w-full gap-2 sm:gap-4"
                onClick={() => setExpandedMatchId(expandedMatchId === 'sf2' ? null : 'sf2')}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="hidden sm:block shrink-0">
                    <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">SF 2</span>
                  </div>
                  
                  <div className="flex items-center font-semibold text-xs sm:text-sm text-slate-200 flex-1 min-w-0 gap-1 sm:gap-3">
                    <span className="flex-1 text-right wrap-break-words whitespace-normal">{resolvedTopperB}</span>
                    <div className="shrink-0 mx-0.5 sm:mx-1">
                      <span className="font-mono bg-indigo-500/10 px-1.5 sm:px-2 py-0.5 rounded text-indigo-400 text-[11px] sm:text-xs flex flex-col items-center">
                        <span className="flex flex-row items-center gap-1 whitespace-nowrap">
                          <span>{sf2Match.score1 !== '' ? `${sf2Match.score1} — ${sf2Match.score2}` : 'VS'}</span>
                          {sf2Match.score1 !== '' && sf2Match.penaltyScore1 !== undefined && sf2Match.penaltyScore2 !== undefined && sf2Match.penaltyScore1 !== '' && sf2Match.penaltyScore2 !== '' && (
                            <span className="text-[9px] sm:text-[10px] text-purple-300">({sf2Match.penaltyScore1}-{sf2Match.penaltyScore2} PK)</span>
                          )}
                        </span>
                        {sf2Match.coinTossWinner && sf2Match.coinTossWinner !== '' && (
                           <span className="text-[9px] sm:text-[10px] text-amber-400 mt-1 whitespace-nowrap bg-amber-900/30 px-1 py-0.5 rounded">[Decided via Coin Toss]</span>
                        )}
                      </span>
                    </div>
                    <span className="flex-1 text-left wrap-break-words whitespace-normal">{resolvedRunnerA}</span>
                  </div>
                </div>
                
                <svg className={`hidden sm:block w-5 h-5 shrink-0 text-slate-400 transition-transform ${expandedMatchId === 'sf2' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {expandedMatchId === 'sf2' && (
                <div className="p-3 sm:p-4 border-t border-white/5 bg-slate-900/50">
                  {renderStatsDropdown(sf2Match, isSf2Complete)}
                </div>
              )}
            </div>
          </div>

          {/* Grand Final Accordion Container */}
          <div className="flex flex-col bg-linear-to-r from-indigo-950 to-purple-950 border border-purple-500/30 rounded-2xl overflow-hidden w-full">
            {/* Mobile View Badge Left of Box */}
            <div className="sm:hidden px-3 pt-2.5 flex justify-between items-center">
              <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 tracking-wider whitespace-nowrap">FINAL</span>
              <div 
                onClick={() => setExpandedMatchId(expandedMatchId === 'final' ? null : 'final')}
                className="text-slate-400 p-1"
              >
                <svg className={`w-4 h-4 transition-transform duration-300 ${expandedMatchId === 'final' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div 
              className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-white/5 transition-colors w-full gap-2 sm:gap-4"
              onClick={() => setExpandedMatchId(expandedMatchId === 'final' ? null : 'final')}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="hidden sm:block shrink-0">
                  <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 tracking-wider whitespace-nowrap">FINAL</span>
                </div>
                
                <div className="flex items-center font-bold text-xs sm:text-sm text-slate-200 flex-1 min-w-0 gap-1 sm:gap-3">
                  <span className="flex-1 text-right wrap-break-words whitespace-normal">{resolvedSf1Winner}</span>
                  <div className="shrink-0 mx-0.5 sm:mx-1">
                    <span className="font-mono bg-purple-500/20 border border-purple-500/30 px-2 sm:px-3 py-0.5 rounded text-purple-300 text-xs sm:text-sm flex flex-col items-center">
                      <span className="flex flex-row items-center gap-1 whitespace-nowrap">
                        <span>{finalMatch.score1 !== '' && finalMatch.score2 !== '' ? `${finalMatch.score1} — ${finalMatch.score2}` : 'VS'}</span>
                        {finalMatch.score1 !== '' && finalMatch.penaltyScore1 !== undefined && finalMatch.penaltyScore2 !== undefined && finalMatch.penaltyScore1 !== '' && finalMatch.penaltyScore2 !== '' && (
                          <span className="text-[9px] sm:text-[10px] text-amber-300">({finalMatch.penaltyScore1}-{finalMatch.penaltyScore2} PK)</span>
                        )}
                      </span>
                      {finalMatch.coinTossWinner && finalMatch.coinTossWinner !== '' && (
                         <span className="text-[9px] sm:text-[10px] text-amber-400 mt-1 whitespace-nowrap bg-amber-900/30 px-1 py-0.5 rounded">[Decided via Coin Toss]</span>
                      )}
                    </span>
                  </div>
                  <span className="flex-1 text-left wrap-break-words whitespace-normal">{resolvedSf2Winner}</span>
                </div>
              </div>
              
              <svg className={`hidden sm:block w-5 h-5 shrink-0 text-slate-400 transition-transform ${expandedMatchId === 'final' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {expandedMatchId === 'final' && (
              <div className="p-3 sm:p-4 border-t border-white/10 bg-slate-950/40">
                {renderStatsDropdown(finalMatch, isSf1Complete && isSf2Complete && finalMatch.score1 !== '')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Champions Banner */}
      {finalMatch.score1 !== '' && getWinner(finalMatch, resolvedSf1Winner, resolvedSf2Winner) && (
        <div className="bg-linear-to-r from-amber-500/20 via-yellow-600/10 to-amber-500/20 border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-amber-500/10 mb-8 mt-12 animate-fade-in mx-auto max-w-3xl">
          <div className="text-4xl sm:text-5xl mb-3 animate-bounce">🏆</div>
          <div className="text-amber-500 font-bold text-xs tracking-widest uppercase mb-2">RKM LEGACY LEAGUE SEASON 2 CHAMPIONS</div>
          <div className="text-2xl sm:text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-linear-to-r from-yellow-200 via-amber-400 to-yellow-100 drop-shadow-md uppercase tracking-wide whitespace-normal px-2">
            {getWinner(finalMatch, resolvedSf1Winner, resolvedSf2Winner)}
          </div>
        </div>
      )}

      {/* Tournament-Wide Awards Display Box */}
      {(ballAward || bootAward || glovesAward) && (
        <div className="mt-12 bg-slate-900/30 border border-white/10 rounded-3xl p-4 sm:p-6 md:p-8 relative overflow-hidden backdrop-blur-md">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <h4 className="font-extrabold text-xl text-white mb-6 tracking-wide border-b border-white/5 pb-3">
            🏆 Tournament Trophies & Awards
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950/50 border border-amber-500/10 rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-center">
              <span className="text-2xl sm:text-3xl mb-2">🏆</span>
              <span className="text-[10px] font-bold text-amber-500 tracking-widest uppercase">Golden Ball (MVP)</span>
              <span className="text-sm sm:text-base font-extrabold text-white mt-2 whitespace-normal max-w-full">{ballAward || 'Not Awarded'}</span>
            </div>
            <div className="bg-slate-950/50 border border-orange-500/10 rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-center">
              <span className="text-2xl sm:text-3xl mb-2">🔥</span>
              <span className="text-[10px] font-bold text-orange-500 tracking-widest uppercase">Golden Boot (Top Scorer)</span>
              <span className="text-sm sm:text-base font-extrabold text-white mt-2 whitespace-normal max-w-full">{bootAward || 'Not Awarded'}</span>
            </div>
            <div className="bg-slate-950/50 border border-purple-500/10 rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-center">
              <span className="text-2xl sm:text-3xl mb-2">🧤</span>
              <span className="text-[10px] font-bold text-purple-400 tracking-widest uppercase">Golden Gloves (Best GK)</span>
              <span className="text-sm sm:text-base font-extrabold text-white mt-2 whitespace-normal max-w-full">{glovesAward || 'Not Awarded'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tournament;