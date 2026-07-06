import { useState, useEffect } from 'react';
import API_BASE from '../api';

const MatchManager = () => {
  const [fixtures, setFixtures] = useState([]);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState('Match 1');

  // Active Workspace Modifying State
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');
  const [penaltyScore1, setPenaltyScore1] = useState('');
  const [penaltyScore2, setPenaltyScore2] = useState('');
  const [coinTossWinner, setCoinTossWinner] = useState('');
  const [goals, setGoals] = useState([]); // [{ scorer: 'Name', assist: 'Name' }]
  const [motm, setMotm] = useState('');

  // Dropdown Form Selectors
  const [activeScorer, setActiveScorer] = useState('');
  const [activeAssist, setActiveAssist] = useState('None');

  // Secondary Knockout States
  const [sf1Match, setSf1Match] = useState(null);
  const [sf2Match, setSf2Match] = useState(null);
  const [finalMatch, setFinalMatch] = useState(null);

  // Tournament-Wide Awards State
  const [goldenBall, setGoldenBall] = useState('');
  const [goldenBoot, setGoldenBoot] = useState('');
  const [goldenGloves, setGoldenGloves] = useState('');

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const res = await fetch(`${API_BASE}/fixtures/s2`);
        const data = await res.json();
        if (data.success) {
          const allFixtures = data.data;
          const groupFixtures = allFixtures.filter(f => f.id.startsWith('Match'));
          setFixtures(groupFixtures);
          
          const s1 = allFixtures.find(f => f.id === 'Semifinal 1');
          const s2 = allFixtures.find(f => f.id === 'Semifinal 2');
          const fin = allFixtures.find(f => f.id === 'Grand Final');
          
          if (s1) setSf1Match(s1);
          else setSf1Match({ id: 'Semifinal 1', team1: 'Winner M1', team2: 'Winner M2', score1: '', score2: '', penaltyScore1: '', penaltyScore2: '', coinTossWinner: '', goals: [], motm: '' });
          
          if (s2) setSf2Match(s2);
          else setSf2Match({ id: 'Semifinal 2', team1: 'Winner M3', team2: 'Winner M4', score1: '', score2: '', penaltyScore1: '', penaltyScore2: '', coinTossWinner: '', goals: [], motm: '' });
          
          if (fin) setFinalMatch(fin);
          else setFinalMatch({ id: 'Grand Final', team1: 'Winner SF1', team2: 'Winner SF2', score1: '', score2: '', penaltyScore1: '', penaltyScore2: '', coinTossWinner: '', goals: [], motm: '' });
        }
      } catch (err) {
        console.error("Error fetching fixtures:", err);
      }
    };
    fetchFixtures();

    // Load Saved Golden Trophies
    setGoldenBall(localStorage.getItem('rkm_s2_goldenBallName') || '');
    setGoldenBoot(localStorage.getItem('rkm_s2_goldenBootName') || '');
    setGoldenGloves(localStorage.getItem('rkm_s2_goldenGlovesName') || '');

    const fetchPlayersAndTeams = async () => {
      try {
        const [pRes, tRes, lotteryRes] = await Promise.all([
          fetch(`${API_BASE}/players`),
          fetch(`${API_BASE}/teams`),
          fetch(`${API_BASE}/lottery/state`, { credentials: "include" }).catch(() => null)
        ]);
        const pData = await pRes.json();
        const tData = await tRes.json();
        
        if (pData.success) {
          // Sort players alphabetically before setting state so all options follow the order cleanly
          const alphabeticalPlayers = [...pData.players].sort((a, b) => 
            a.name.localeCompare(b.name)
          );
          setPlayers(alphabeticalPlayers);
        }
        
        if (tData.success) setTeams(tData.data || tData.teams || []);
        if (lotteryRes) {
          const lData = await lotteryRes.json();
          if (lData.success && lData.state) setSelectedTeams(lData.state.selectedTeams || []);
        }
      } catch (err) {
        console.error("Error fetching players and teams:", err);
      }
    };
    fetchPlayersAndTeams();
  }, []);

  useEffect(() => {
    let current = null;
    if (selectedMatchId === 'Semifinal 1') current = sf1Match;
    else if (selectedMatchId === 'Semifinal 2') current = sf2Match;
    else if (selectedMatchId === 'Grand Final') current = finalMatch;
    else current = fixtures.find(f => f.id === selectedMatchId);

    if (current) {
      setScore1(current.score1 !== undefined ? current.score1 : '');
      setScore2(current.score2 !== undefined ? current.score2 : '');
      setPenaltyScore1(current.penaltyScore1 !== undefined ? current.penaltyScore1 : '');
      setPenaltyScore2(current.penaltyScore2 !== undefined ? current.penaltyScore2 : '');
      setCoinTossWinner(current.coinTossWinner !== undefined ? current.coinTossWinner : '');
      setGoals(current.goals || []);
      setMotm(current.motm || '');
      setActiveScorer('');
      setActiveAssist('None');
    }
  }, [selectedMatchId, fixtures, sf1Match, sf2Match, finalMatch]);

  const handleAddGoalEvent = () => {
    if (!activeScorer) {
      alert("Please select a Goal Scorer first!");
      return;
    }
    const newGoal = { scorer: activeScorer, assist: activeAssist };
    setGoals(prev => [...prev, newGoal]);
    setActiveScorer('');
    setActiveAssist('None');
  };

  const handleRemoveGoalEvent = (idxToRemove) => {
    setGoals(prev => prev.filter((_, i) => i !== idxToRemove));
  };

  const handleSaveWorkspaceData = async () => {
    const payload = {
      season: 's2',
      id: selectedMatchId,
      score1,
      score2,
      penaltyScore1,
      penaltyScore2,
      coinTossWinner,
      goals,
      motm
    };

    try {
      const res = await fetch(`${API_BASE}/fixtures/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        const updated = data.data;
        if (selectedMatchId === 'Semifinal 1') setSf1Match(updated);
        else if (selectedMatchId === 'Semifinal 2') setSf2Match(updated);
        else if (selectedMatchId === 'Grand Final') setFinalMatch(updated);
        else {
          setFixtures(fixtures.map(f => f.id === selectedMatchId ? updated : f));
        }
        alert(`Records saved successfully for ${selectedMatchId}!`);
      }
    } catch (err) {
      console.error("Error saving match:", err);
      alert("Failed to save match data.");
    }
  };

  const handleSaveGlobalAwards = () => {
    localStorage.setItem('rkm_s2_goldenBallName', goldenBall);
    localStorage.setItem('rkm_s2_goldenBootName', goldenBoot);
    localStorage.setItem('rkm_s2_goldenGlovesName', goldenGloves);
    alert("Tournament-Wide Awards saved and locked!");
    window.dispatchEvent(new Event('storage'));
  };

  const handleResetGlobalAwards = () => {
    if (!window.confirm("Reset Tournament-Wide Awards?")) return;
    setGoldenBall('');
    setGoldenBoot('');
    setGoldenGloves('');
    localStorage.setItem('rkm_s2_goldenBallName', '');
    localStorage.setItem('rkm_s2_goldenBootName', '');
    localStorage.setItem('rkm_s2_goldenGlovesName', '');
    window.dispatchEvent(new Event('storage'));
  };

  const handleResetMatch = () => {
    if (!window.confirm(`Reset all stats and inputs for ${selectedMatchId}?`)) return;
    setScore1('');
    setScore2('');
    setPenaltyScore1('');
    setPenaltyScore2('');
    setCoinTossWinner('');
    setGoals([]);
    setMotm('');
  };

  const isKnockout = ['Semifinal 1', 'Semifinal 2', 'Grand Final'].includes(selectedMatchId);
  const showCoinToss = isKnockout && 
    score1 !== '' && score2 !== '' && parseInt(score1) === parseInt(score2) && 
    penaltyScore1 !== '' && penaltyScore2 !== '' && parseInt(penaltyScore1) === parseInt(penaltyScore2);

  // Round-Robin Match index layout mappings[cite: 1]
  const matchIndexMappings = [[0, 2], [1, 3], [2, 4], [3, 5], [4, 0], [5, 1]];

  const displayTeams = teams.length > 0
    ? (selectedTeams.length > 0
      ? [...teams].filter(dt => selectedTeams.some(st => st.index === dt.index)).sort((a, b) => a.index - b.index)
      : [...teams].filter(dt => dt.index >= 1 && dt.index <= 6).sort((a, b) => a.index - b.index))
    : [];

  const getDynamicTeamName = (teamIndex) => {
    if (displayTeams && displayTeams.length > teamIndex) {
      return displayTeams[teamIndex].name || displayTeams[teamIndex].teamName || displayTeams[teamIndex]['team-name'] || `Team ${teamIndex + 1}`;
    }
    return `Team ${teamIndex + 1}`;
  };

  // Calculate Group Standings and Winners for Playoffs
  const calculateStandings = () => {
    const initialStats = {};
    displayTeams.forEach((team, idx) => {
      const group = idx % 2 === 0 ? 'A' : 'B';
      const safeName = team.name || team.teamName || team['team-name'] || `Team ${idx + 1}`;
      initialStats[safeName] = { name: safeName, group, points: 0, goalsFor: 0, goalsAgainst: 0 };
    });

    fixtures.forEach((match, idx) => {
      if (match.score1 !== '' && match.score2 !== '' && match.score1 !== null && match.score2 !== null) {
        const { team1, team2 } = matchIndexMappings[idx] ? 
          { team1: getDynamicTeamName(matchIndexMappings[idx][0]), team2: getDynamicTeamName(matchIndexMappings[idx][1]) } : 
          { team1: match.team1, team2: match.team2 };
        
        if (initialStats[team1] && initialStats[team2]) {
          const s1 = parseInt(match.score1, 10);
          const s2 = parseInt(match.score2, 10);
          initialStats[team1].goalsFor += s1; initialStats[team1].goalsAgainst += s2;
          initialStats[team2].goalsFor += s2; initialStats[team2].goalsAgainst += s1;
          if (s1 > s2) initialStats[team1].points += 3;
          else if (s1 < s2) initialStats[team2].points += 3;
          else { initialStats[team1].points += 1; initialStats[team2].points += 1; }
        }
      }
    });

    const sortTeams = (a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const gdA = a.goalsFor - a.goalsAgainst; const gdB = b.goalsFor - b.goalsAgainst;
      if (gdB !== gdA) return gdB - gdA;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.name.localeCompare(b.name);
    };

    const standings = Object.values(initialStats);
    return {
      groupA: standings.filter(t => t.group === 'A').sort(sortTeams),
      groupB: standings.filter(t => t.group === 'B').sort(sortTeams)
    };
  };

  const { groupA, groupB } = calculateStandings();
  const resolvedTopperA = groupA[0]?.name || 'Group A Topper';
  const resolvedRunnerA = groupA[1]?.name || 'Group A Runner-up';
  const resolvedTopperB = groupB[0]?.name || 'Group B Topper';
  const resolvedRunnerB = groupB[1]?.name || 'Group B Runner-up';

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
    if (match.coinTossWinner && match.coinTossWinner !== '') return match.coinTossWinner;
    return null;
  };

  const resolvedSf1Winner = getWinner(sf1Match, resolvedTopperA, resolvedRunnerB) || 'SF1 Winner';
  const resolvedSf2Winner = getWinner(sf2Match, resolvedTopperB, resolvedRunnerA) || 'SF2 Winner';

  // Get dynamic names for current selected workspace match display labels
  let currentTeam1 = 'Team 1';
  let currentTeam2 = 'Team 2';
  if (selectedMatchId === 'Semifinal 1') { 
    currentTeam1 = resolvedTopperA; 
    currentTeam2 = resolvedRunnerB; 
  } else if (selectedMatchId === 'Semifinal 2') { 
    currentTeam1 = resolvedTopperB; 
    currentTeam2 = resolvedRunnerA; 
  } else if (selectedMatchId === 'Grand Final') { 
    currentTeam1 = resolvedSf1Winner; 
    currentTeam2 = resolvedSf2Winner; 
  } else {
    const fIndex = fixtures.findIndex(fx => fx.id === selectedMatchId);
    if (fIndex !== -1 && matchIndexMappings[fIndex]) {
      currentTeam1 = getDynamicTeamName(matchIndexMappings[fIndex][0]);
      currentTeam2 = getDynamicTeamName(matchIndexMappings[fIndex][1]);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Menu Panel */}
        <div className="lg:col-span-1 bg-slate-950/40 border border-white/5 p-4 rounded-2xl space-y-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase">Group Stage Fixtures</span>
            <div className="flex flex-col gap-1 mt-2">
              {fixtures.map((f, idx) => {
                let t1 = f.team1;
                let t2 = f.team2;
                if (matchIndexMappings[idx]) {
                  t1 = getDynamicTeamName(matchIndexMappings[idx][0]);
                  t2 = getDynamicTeamName(matchIndexMappings[idx][1]);
                }
                const shortLabel = f.shortId || f.id.replace('Match ', 'M');
                
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedMatchId(f.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedMatchId === f.id ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 bg-white/2 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {shortLabel}: {t1} vs {t2}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-white/5">
            <span className="text-[10px] font-bold tracking-wider text-purple-400 uppercase">Playoffs Knockout</span>
            <div className="flex flex-col gap-1 mt-2">
              {[
                { id: 'Semifinal 1', label: 'SF 1' },
                { id: 'Semifinal 2', label: 'SF 2' },
                { id: 'Grand Final', label: 'FINAL' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedMatchId(item.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedMatchId === item.id ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'text-slate-400 bg-white/2 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🏆 {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Workspace Form */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-sm font-black tracking-widest text-indigo-400 uppercase">Modifying: {selectedMatchId}</h3>
            <button onClick={handleResetMatch} className="px-3 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 font-bold text-xs hover:bg-rose-500 hover:text-white transition-colors">
              🔄 Reset Match
            </button>
          </div>

          {/* Score Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">{currentTeam1} Score</label>
              <input type="number" value={score1} onChange={e => setScore1(e.target.value)} placeholder="0" className="w-full bg-slate-950 border border-white/10 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">{currentTeam2} Score</label>
              <input type="number" value={score2} onChange={e => setScore2(e.target.value)} placeholder="0" className="w-full bg-slate-950 border border-white/10 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none" />
            </div>
          </div>

          {/* Penalty Shootout Conditional Block */}
          {isKnockout && score1 === score2 && score1 !== '' && (
            <div className="bg-purple-900/20 border border-purple-500/20 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">🎯 Penalty Shootout (Tie-Breaker)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">{currentTeam1} PKs</label>
                  <input type="number" value={penaltyScore1} onChange={e => setPenaltyScore1(e.target.value)} placeholder="0" className="w-full bg-slate-950 border border-purple-500/30 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">{currentTeam2} PKs</label>
                  <input type="number" value={penaltyScore2} onChange={e => setPenaltyScore2(e.target.value)} placeholder="0" className="w-full bg-slate-950 border border-purple-500/30 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* Coin Toss Winner Conditional Block */}
          {showCoinToss && (
            <div className="bg-amber-900/20 border border-amber-500/20 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">🪙 Sudden Death Coin Toss</h4>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Coin Toss Winner</label>
                <select value={coinTossWinner} onChange={e => setCoinTossWinner(e.target.value)} className="w-full bg-slate-950 border border-amber-500/30 focus:border-amber-500 text-xs rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none">
                  <option value="">Select Winner...</option>
                  <option value={currentTeam1}>{currentTeam1}</option>
                  <option value={currentTeam2}>{currentTeam2}</option>
                </select>
              </div>
            </div>
          )}

          {/* Dynamic Connected Goal Event Selector Block */}
          <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">⚽ Log Goal Event</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Goal Scorer</label>
                <select value={activeScorer} onChange={e => setActiveScorer(e.target.value)} className="w-full bg-slate-950 border border-white/10 text-xs rounded-xl px-3 py-2 text-slate-300 focus:outline-none">
                  <option value="">Select Scorer...</option>
                  {players.map(p => <option key={p.index || p._id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Assist Provider</label>
                <select value={activeAssist} onChange={e => setActiveAssist(e.target.value)} className="w-full bg-slate-950 border border-white/10 text-xs rounded-xl px-3 py-2 text-slate-300 focus:outline-none">
                  <option value="None">None (Unassisted)</option>
                  {players.map(p => <option key={p.index || p._id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleAddGoalEvent} className="w-full py-2 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500 text-indigo-400 hover:text-white font-bold text-xs rounded-xl transition-all">
              + Add Goal Entry to Log
            </button>
          </div>

          {/* Live List of Logged Goals */}
          {goals.length > 0 && (
            <div className="space-y-2">
              <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Logged Goals for this Match</label>
              <div className="grid grid-cols-1 gap-2">
                {goals.map((g, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-950/60 border border-white/5">
                    <span className="text-slate-300">
                      ⚽ Scorer: <strong className="text-white">{g.scorer}</strong> 
                      {g.assist !== 'None' ? <> — 👟 Assist: <strong className="text-indigo-400">{g.assist}</strong></> : <span className="text-slate-500 italic"> (Unassisted)</span>}
                    </span>
                    <button onClick={() => handleRemoveGoalEvent(idx)} className="text-rose-400 hover:text-rose-600 font-bold px-2 py-0.5">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Man Of the Match Selection */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">🏆 Man of the Match</label>
            <select value={motm} onChange={e => setMotm(e.target.value)} className="w-full bg-slate-950 border border-white/10 text-xs rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none">
              <option value="">Select MVP...</option>
              {players.map(p => <option key={p.index || p._id} value={p.name}>{p.name}</option>)}
            </select>
          </div>

          {/* Save Workspace Action */}
          <button onClick={handleSaveWorkspaceData} className="w-full py-3 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 font-extrabold text-sm tracking-wide text-white hover:shadow-lg transition-all duration-300">
            Save Match Records & Scores
          </button>
        </div>
      </div>

      {/* Awards Section */}
      <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
        <h3 className="text-lg font-bold text-white tracking-wide">Tournament-Wide Awards (S2)</h3>
        <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-2">🏆 GOLDEN BALL</label>
              <select value={goldenBall} onChange={e => setGoldenBall(e.target.value)} className="w-full bg-slate-950 border border-white/10 text-xs rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none cursor-pointer">
                <option value="">Choose Player...</option>
                {players.map(p => <option key={p.index || p._id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-2">🔥 GOLDEN BOOT</label>
              <select value={goldenBoot} onChange={e => setGoldenBoot(e.target.value)} className="w-full bg-slate-950 border border-white/10 text-xs rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none cursor-pointer">
                <option value="">Choose Player...</option>
                {players.map(p => <option key={p.index || p._id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2">🧤 GOLDEN GLOVES</label>
              <select value={goldenGloves} onChange={e => setGoldenGloves(e.target.value)} className="w-full bg-slate-950 border border-white/10 text-xs rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none cursor-pointer">
                <option value="">Choose Player...</option>
                {players.map(p => <option key={p.index || p._id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={handleResetGlobalAwards} className="px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 font-bold text-xs hover:bg-rose-500 hover:text-white transition-colors">
              Reset Awards
            </button>
            <button onClick={handleSaveGlobalAwards} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/10 active:scale-[0.98] transition-all">
              Lock & Save Golden Trophies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchManager;