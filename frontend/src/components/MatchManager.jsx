import { useState, useEffect } from 'react';
import API_BASE from '../api';

export default function MatchManager() {
  const [selectedSeason, setSelectedSeason] = useState('s2');
  const [players, setPlayers] = useState([]);
  const [dbTeams, setDbTeams] = useState([]);
  const [fixtures, setFixtures] = useState([
    { id: 'Match 1', group: 'A', team1: 'Team A', team2: 'Team C', score1: '', score2: '', scorers: [], assists: [], motm: '' },
    { id: 'Match 2', group: 'B', team1: 'Team B', team2: 'Team D', score1: '', score2: '', scorers: [], assists: [], motm: '' },
    { id: 'Match 3', group: 'A', team1: 'Team C', team2: 'Team E', score1: '', score2: '', scorers: [], assists: [], motm: '' },
    { id: 'Match 4', group: 'B', team1: 'Team D', team2: 'Team F', score1: '', score2: '', scorers: [], assists: [], motm: '' },
    { id: 'Match 5', group: 'A', team1: 'Team E', team2: 'Team A', score1: '', score2: '', scorers: [], assists: [], motm: '' },
    { id: 'Match 6', group: 'B', team1: 'Team F', team2: 'Team B', score1: '', score2: '', scorers: [], assists: [], motm: '' }
  ]);

  const [sf1Match, setSf1Match] = useState({
    id: 'Semifinal 1', team1: 'Group A Topper', team2: 'Group B Runner-up', score1: '', score2: '', scorers: [], assists: [], motm: ''
  });

  const [sf2Match, setSf2Match] = useState({
    id: 'Semifinal 2', team1: 'Group B Topper', team2: 'Group A Runner-up', score1: '', score2: '', scorers: [], assists: [], motm: ''
  });

  const [finalMatch, setFinalMatch] = useState({
    id: 'Grand Final', team1: 'SF1 Winner', team2: 'SF2 Winner', score1: '', score2: '', scorers: [], assists: [], motm: ''
  });

  const [goldenBallId, setGoldenBallId] = useState('');
  const [goldenBootId, setGoldenBootId] = useState('');
  const [goldenGlovesId, setGoldenGlovesId] = useState('');
  
  const [selectedMatchIdx, setSelectedMatchIdx] = useState(0);
  const [selectedScorer, setSelectedScorer] = useState('');
  const [selectedAssistant, setSelectedAssistant] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/players`)
      .then(res => res.json())
      .then(data => data.success && setPlayers(data.players))
      .catch(err => console.error(err));

    fetch(`${API_BASE}/teams`)
      .then(res => res.json())
      .then(data => data.success && setDbTeams(data.teams))
      .catch(err => console.error(err));

    const keyPrefix = `rkm_${selectedSeason}`;
    const savedFixtures = localStorage.getItem(`${keyPrefix}_fixtures`);
    if (savedFixtures) setFixtures(JSON.parse(savedFixtures));

    const savedSf1 = localStorage.getItem(`${keyPrefix}_sf1Match`);
    if (savedSf1) setSf1Match(JSON.parse(savedSf1));

    const savedSf2 = localStorage.getItem(`${keyPrefix}_sf2Match`);
    if (savedSf2) setSf2Match(JSON.parse(savedSf2));

    const savedFinal = localStorage.getItem(`${keyPrefix}_finalMatch`);
    if (savedFinal) setFinalMatch(JSON.parse(savedFinal));

    setGoldenBallId(localStorage.getItem(`${keyPrefix}_goldenBallId`) || '');
    setGoldenBootId(localStorage.getItem(`${keyPrefix}_goldenBootId`) || '');
    setGoldenGlovesId(localStorage.getItem(`${keyPrefix}_goldenGlovesId`) || '');
  }, [selectedSeason]);

  const getFixtureTeams = (fixtureIndex) => {
    const mappings = [[0, 2], [1, 3], [2, 4], [3, 5], [4, 0], [5, 1]];
    const map = mappings[fixtureIndex];
    const defaultTeamNames = ['Team A', 'Team B', 'Team C', 'Team D', 'Team E', 'Team F'];
    const resolvedTeams = dbTeams.length >= 6 ? dbTeams.sort((a,b) => a.index - b.index) : [];

    return {
      team1: resolvedTeams[map[0]]?.teamName || resolvedTeams[map[0]]?.['team-name'] || defaultTeamNames[map[0]],
      team2: resolvedTeams[map[1]]?.teamName || resolvedTeams[map[1]]?.['team-name'] || defaultTeamNames[map[1]]
    };
  };

  const isGroupStageComplete = fixtures.every(f => f.score1 !== '' && f.score2 !== '' && f.score1 !== null && f.score2 !== null);

  const getToppers = () => {
    const initialStats = {};
    const defaultTeamNames = ['Team A', 'Team B', 'Team C', 'Team D', 'Team E', 'Team F'];
    
    defaultTeamNames.forEach((name, idx) => {
      const resolvedName = dbTeams.find(t => t.index === idx + 1)?.teamName || dbTeams.find(t => t.index === idx + 1)?.['team-name'] || name;
      initialStats[resolvedName] = { name: resolvedName, group: idx % 2 === 0 ? 'A' : 'B', points: 0, goalDifference: 0, goalsFor: 0 };
    });

    fixtures.forEach((match, idx) => {
      const { score1, score2 } = match;
      const { team1, team2 } = getFixtureTeams(idx);
      if (score1 !== '' && score2 !== '' && initialStats[team1] && initialStats[team2]) {
        const s1 = parseInt(score1, 10);
        const s2 = parseInt(score2, 10);
        initialStats[team1].goalsFor += s1;
        initialStats[team2].goalsFor += s2;
        initialStats[team1].goalDifference += (s1 - s2);
        initialStats[team2].goalDifference += (s2 - s1);
        if (s1 > s2) initialStats[team1].points += 3;
        else if (s1 < s2) initialStats[team2].points += 3;
        else { initialStats[team1].points += 1; initialStats[team2].points += 1; }
      }
    });

    const sortTeams = (a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.name.localeCompare(b.name);
    };

    const list = Object.values(initialStats);
    const groupA = list.filter(t => t.group === 'A').sort(sortTeams);
    const groupB = list.filter(t => t.group === 'B').sort(sortTeams);
    
    const topperA = groupA[0]?.name || 'Group A Topper';
    const runnerA = groupA[1]?.name || 'Group A Runner-up';
    const topperB = groupB[0]?.name || 'Group B Topper';
    const runnerB = groupB[1]?.name || 'Group B Runner-up';
    return { topperA, runnerA, topperB, runnerB };
  };

  const { topperA, runnerA, topperB, runnerB } = getToppers();

  const isSf1Complete = sf1Match.score1 !== '' && sf1Match.score2 !== '';
  const isSf2Complete = sf2Match.score1 !== '' && sf2Match.score2 !== '';

  const getWinner = (match, t1, t2) => {
    if (match.score1 === '' || match.score2 === '') return null;
    const s1 = parseInt(match.score1, 10);
    const s2 = parseInt(match.score2, 10);
    return s1 > s2 ? t1 : t2;
  };

  const resolvedSf1Winner = getWinner(sf1Match, topperA, runnerB) || 'SF1 Winner';
  const resolvedSf2Winner = getWinner(sf2Match, topperB, runnerA) || 'SF2 Winner';

  const isSelectedSf1 = selectedMatchIdx === 6;
  const isSelectedSf2 = selectedMatchIdx === 7;
  const isSelectedFinal = selectedMatchIdx === 8;
  
  const currentMatch = isSelectedSf1 ? { ...sf1Match, team1: topperA, team2: runnerB }
    : isSelectedSf2 ? { ...sf2Match, team1: topperB, team2: runnerA }
    : isSelectedFinal ? { ...finalMatch, team1: resolvedSf1Winner, team2: resolvedSf2Winner } 
    : { ...fixtures[selectedMatchIdx], team1: getFixtureTeams(selectedMatchIdx).team1, team2: getFixtureTeams(selectedMatchIdx).team2 };

  const saveFixturesToSystem = (updatedFixtures = fixtures, updatedSf1 = sf1Match, updatedSf2 = sf2Match, updatedFinal = finalMatch) => {
    const keyPrefix = `rkm_${selectedSeason}`;
    localStorage.setItem(`${keyPrefix}_fixtures`, JSON.stringify(updatedFixtures));
    localStorage.setItem(`${keyPrefix}_sf1Match`, JSON.stringify(updatedSf1));
    localStorage.setItem(`${keyPrefix}_sf2Match`, JSON.stringify(updatedSf2));
    localStorage.setItem(`${keyPrefix}_finalMatch`, JSON.stringify(updatedFinal));
    
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('local-ui-storage-update'));
  };

  const commitScoresClick = () => {
    saveFixturesToSystem();
    alert(`Match records committed for ${selectedSeason.toUpperCase()} successfully!`);
  };

  const saveAwardsToSystem = () => {
    const keyPrefix = `rkm_${selectedSeason}`;
    localStorage.setItem(`${keyPrefix}_goldenBallId`, goldenBallId);
    localStorage.setItem(`${keyPrefix}_goldenBootId`, goldenBootId);
    localStorage.setItem(`${keyPrefix}_goldenGlovesId`, goldenGlovesId);
    
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('local-ui-storage-update'));
    alert(`Individual Awards locked for ${selectedSeason.toUpperCase()} successfully!`);
  };

  const updateMatchScore = (field, val) => {
    const numVal = val === '' ? '' : parseInt(val, 10);
    if (isSelectedSf1) {
      setSf1Match(prev => ({ ...prev, [field]: numVal }));
    } else if (isSelectedSf2) {
      setSf2Match(prev => ({ ...prev, [field]: numVal }));
    } else if (isSelectedFinal) {
      setFinalMatch(prev => ({ ...prev, [field]: numVal }));
    } else {
      const updated = [...fixtures];
      updated[selectedMatchIdx][field] = numVal;
      setFixtures(updated);
    }
  };

  const addStatLine = (type, playerIndex) => {
    if (!playerIndex) return;
    const playerObj = players.find(p => p.index === parseInt(playerIndex, 10));
    if (!playerObj) return;

    if (isSelectedSf1) {
      const updated = { ...sf1Match };
      if (!updated[type]) updated[type] = [];
      updated[type].push({ index: playerObj.index, name: playerObj.name });
      setSf1Match(updated);
    } else if (isSelectedSf2) {
      const updated = { ...sf2Match };
      if (!updated[type]) updated[type] = [];
      updated[type].push({ index: playerObj.index, name: playerObj.name });
      setSf2Match(updated);
    } else if (isSelectedFinal) {
      const updated = { ...finalMatch };
      if (!updated[type]) updated[type] = [];
      updated[type].push({ index: playerObj.index, name: playerObj.name });
      setFinalMatch(updated);
    } else {
      const updated = [...fixtures];
      if (!updated[selectedMatchIdx][type]) updated[selectedMatchIdx][type] = [];
      updated[selectedMatchIdx][type].push({ index: playerObj.index, name: playerObj.name });
      setFixtures(updated);
    }
  };

  const removeStatLine = (type, statItemIdx) => {
    if (isSelectedSf1) {
      const updated = { ...sf1Match };
      updated[type].splice(statItemIdx, 1);
      setSf1Match(updated);
    } else if (isSelectedSf2) {
      const updated = { ...sf2Match };
      updated[type].splice(statItemIdx, 1);
      setSf2Match(updated);
    } else if (isSelectedFinal) {
      const updated = { ...finalMatch };
      updated[type].splice(statItemIdx, 1);
      setFinalMatch(updated);
    } else {
      const updated = [...fixtures];
      updated[selectedMatchIdx][type].splice(statItemIdx, 1);
      setFixtures(updated);
    }
  };

  const resetMatchStats = () => {
    const matchName = currentMatch.id;
    const confirmReset = window.confirm(`Reset data for ${matchName}?`);
    if (!confirmReset) return;

    if (isSelectedSf1) {
      const cleared = { id: 'Semifinal 1', team1: 'Group A Topper', team2: 'Group B Runner-up', score1: '', score2: '', scorers: [], assists: [], motm: '' };
      setSf1Match(cleared);
      saveFixturesToSystem(fixtures, cleared, sf2Match, finalMatch);
    } else if (isSelectedSf2) {
      const cleared = { id: 'Semifinal 2', team1: 'Group B Topper', team2: 'Group A Runner-up', score1: '', score2: '', scorers: [], assists: [], motm: '' };
      setSf2Match(cleared);
      saveFixturesToSystem(fixtures, sf1Match, cleared, finalMatch);
    } else if (isSelectedFinal) {
      const cleared = { id: 'Grand Final', team1: 'SF1 Winner', team2: 'SF2 Winner', score1: '', score2: '', scorers: [], assists: [], motm: '' };
      setFinalMatch(cleared);
      saveFixturesToSystem(fixtures, sf1Match, sf2Match, cleared);
    } else {
      const updated = [...fixtures];
      updated[selectedMatchIdx] = { ...updated[selectedMatchIdx], score1: '', score2: '', scorers: [], assists: [], motm: '' };
      setFixtures(updated);
      saveFixturesToSystem(updated, sf1Match, sf2Match, finalMatch);
    }
    alert(`${matchName} records cleared.`);
  };

  return (
    <div className="space-y-6">
      {/* Local Season Controller Selection Hook */}
      <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/5 max-w-xs mb-2">
        <button type="button" disabled className="flex-1 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-900/20 border border-dashed border-white/5 rounded-lg cursor-not-allowed">
          🔒 Season 1
        </button>
        <button type="button" onClick={() => setSelectedSeason('s2')} className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition ${selectedSeason === 's2' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'}`}>
          Season 2 (Live)
        </button>
      </div>

      <div className="bg-slate-900/20 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Match Control Manager ({selectedSeason.toUpperCase()})</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Match List Sidebar */}
          <div className="space-y-2 border-b md:border-b-0 md:border-r border-white/5 pb-4 md:pb-0 md:pr-4">
            <label className="block text-xs text-slate-400 font-bold uppercase mb-2">Group Stage Fixtures</label>
            {fixtures.map((m, idx) => {
              const names = getFixtureTeams(idx);
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMatchIdx(idx)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold block transition cursor-pointer ${
                    selectedMatchIdx === idx ? 'bg-indigo-600 border-indigo-400 text-white shadow-md' : 'bg-slate-950/60 border-white/5 text-slate-300'
                  }`}
                >
                  {m.id}: {names.team1} vs {names.team2}
                </button>
              );
            })}

            <label className="block text-xs text-slate-400 font-bold uppercase mt-6 mb-2">Playoffs Knockout</label>
            <div className="space-y-2">
              <button
                onClick={() => isGroupStageComplete && setSelectedMatchIdx(6)}
                disabled={!isGroupStageComplete}
                className={`w-full text-center p-3 rounded-xl border text-xs font-bold block transition cursor-pointer ${
                  !isGroupStageComplete ? 'opacity-40 bg-slate-950/20 border-dashed border-white/5 text-slate-600 cursor-not-allowed' :
                  selectedMatchIdx === 6 ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg' : 'bg-linear-to-r from-indigo-900/40 to-indigo-800/40 border-indigo-500/20 text-indigo-300'
                }`}
              >
                SF1: 1A vs 2B {isGroupStageComplete ? '(Active)' : '(Locked)'}
              </button>

              <button
                onClick={() => isGroupStageComplete && setSelectedMatchIdx(7)}
                disabled={!isGroupStageComplete}
                className={`w-full text-center p-3 rounded-xl border text-xs font-bold block transition cursor-pointer ${
                  !isGroupStageComplete ? 'opacity-40 bg-slate-950/20 border-dashed border-white/5 text-slate-600 cursor-not-allowed' :
                  selectedMatchIdx === 7 ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg' : 'bg-linear-to-r from-indigo-900/40 to-indigo-800/40 border-indigo-500/20 text-indigo-300'
                }`}
              >
                SF2: 1B vs 2A {isGroupStageComplete ? '(Active)' : '(Locked)'}
              </button>

              <button
                onClick={() => isSf1Complete && isSf2Complete && setSelectedMatchIdx(8)}
                disabled={!(isSf1Complete && isSf2Complete)}
                className={`w-full text-center p-3 rounded-xl border text-xs font-bold block transition cursor-pointer ${
                  !(isSf1Complete && isSf2Complete) ? 'opacity-40 bg-slate-950/20 border-dashed border-white/5 text-slate-600 cursor-not-allowed' :
                  selectedMatchIdx === 8 ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-lg' : 'bg-linear-to-r from-amber-900/40 to-orange-900/40 border-amber-500/20 text-amber-300'
                }`}
              >
                🏆 Grand Final {(isSf1Complete && isSf2Complete) ? '(Active)' : '(Locked)'}
              </button>
            </div>
          </div>

          {/* Active Updating Workspace Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-950/40 p-5 rounded-xl border border-white/5">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4 pb-2 border-b border-white/5">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
                  Modifying: {currentMatch.id}
                </h3>
                <button type="button" onClick={resetMatchStats} className="px-2.5 py-1 text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold rounded-md hover:bg-rose-500 hover:text-white transition cursor-pointer">
                  🔄 Reset Match
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">{currentMatch.team1} Goals</label>
                  <input
                    type="number" min="0" value={currentMatch.score1}
                    onChange={(e) => updateMatchScore('score1', e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-sm focus:outline-none text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">{currentMatch.team2} Goals</label>
                  <input
                    type="number" min="0" value={currentMatch.score2}
                    onChange={(e) => updateMatchScore('score2', e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-sm focus:outline-none text-white font-mono"
                  />
                </div>
              </div>

              {/* Advanced Multi-Stats Input Logs - Refactored for permanent inline row display on Tablet viewports */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
                {/* Goalscorers Row Block */}
                <div className="flex flex-col gap-2">
                  <label className="block text-xs text-slate-300 font-bold uppercase tracking-wide">⚽ Goalscorers</label>
                  <div className="flex items-center gap-2 w-full">
                    <select 
                      value={selectedScorer} 
                      onChange={(e) => setSelectedScorer(e.target.value)} 
                      className="flex-1 min-w-0 bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="">Select Scorer...</option>
                      {players.map(p => <option key={p.index} value={p.index}>{p.name}</option>)}
                    </select>
                    <button 
                      onClick={() => { addStatLine('scorers', selectedScorer); setSelectedScorer(''); }} 
                      className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold tracking-wide shrink-0 transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto mt-1">
                    {currentMatch.scorers?.map((s, i) => (
                      <div key={i} className="flex items-center justify-between bg-rose-500/5 border border-rose-500/10 px-2.5 py-1.5 rounded-lg text-xs text-rose-400">
                        <span>⚽ {s.name}</span>
                        <button onClick={() => removeStatLine('scorers', i)} className="text-slate-500 hover:text-rose-400 font-bold px-1 cursor-pointer">✕</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assists Row Block */}
                <div className="flex flex-col gap-2">
                  <label className="block text-xs text-slate-300 font-bold uppercase tracking-wide">👟 Assists</label>
                  <div className="flex items-center gap-2 w-full">
                    <select 
                      value={selectedAssistant} 
                      onChange={(e) => setSelectedAssistant(e.target.value)} 
                      className="flex-1 min-w-0 bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="">Select Provider...</option>
                      {players.map(p => <option key={p.index} value={p.index}>{p.name}</option>)}
                    </select>
                    <button 
                      onClick={() => { addStatLine('assists', selectedAssistant); setSelectedAssistant(''); }} 
                      className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold tracking-wide shrink-0 transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto mt-1">
                    {currentMatch.assists?.map((a, i) => (
                      <div key={i} className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1.5 rounded-lg text-xs text-emerald-400">
                        <span>👟 {a.name}</span>
                        <button onClick={() => removeStatLine('assists', i)} className="text-slate-500 hover:text-emerald-400 font-bold px-1 cursor-pointer">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5">
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Man of the Match</label>
                <select
                  value={currentMatch.motm || ''}
                  onChange={(e) => {
                    if (isSelectedSf1) {
                      setSf1Match(prev => ({ ...prev, motm: e.target.value }));
                    } else if (isSelectedSf2) {
                      setSf2Match(prev => ({ ...prev, motm: e.target.value }));
                    } else if (isSelectedFinal) {
                      setFinalMatch(prev => ({ ...prev, motm: e.target.value }));
                    } else {
                      const updated = [...fixtures];
                      updated[selectedMatchIdx].motm = e.target.value;
                      setFixtures(updated);
                    }
                  }}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="">Select MOTM...</option>
                  {players.map(p => <option key={p.index} value={p.name}>{p.name}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={commitScoresClick}
              className="w-full py-3 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 font-bold text-sm text-white hover:opacity-90 shadow-lg transition cursor-pointer"
            >
              Save Match Records & Scores
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: GLOBAL TOURNAMENT TROPHIES */}
      <div className="bg-slate-900/20 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-2">Tournament-Wide Awards ({selectedSeason.toUpperCase()})</h2>
        <div className="bg-slate-950/40 p-5 rounded-xl border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs text-amber-400 font-bold mb-2 uppercase">🏆 Golden Ball</label>
            <select value={goldenBallId} onChange={(e) => setGoldenBallId(e.target.value)} className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-lg text-white focus:outline-none cursor-pointer">
              <option value="">Choose Player...</option>
              {players.map(p => <option key={p.index} value={p.index}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-amber-400 font-bold mb-2 uppercase">🔥 Golden Boot</label>
            <select value={goldenBootId} onChange={(e) => setGoldenBootId(e.target.value)} className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-lg text-white focus:outline-none cursor-pointer">
              <option value="">Choose Player...</option>
              {players.map(p => <option key={p.index} value={p.index}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-amber-400 font-bold mb-2 uppercase">🧤 Golden Gloves</label>
            <select value={goldenGlovesId} onChange={(e) => setGoldenGlovesId(e.target.value)} className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-lg text-white focus:outline-none cursor-pointer">
              <option value="">Choose Player...</option>
              {players.map(p => <option key={p.index} value={p.index}>{p.name}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={saveAwardsToSystem} className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition cursor-pointer">
            Lock & Save Golden Trophies
          </button>
        </div>
      </div>
    </div>
  );
}