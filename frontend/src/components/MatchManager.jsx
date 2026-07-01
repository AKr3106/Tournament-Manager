import { useState, useEffect } from 'react';
import API_BASE from '../api';

const MatchManager = () => {
  const [fixtures, setFixtures] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState('Match 1');

  // Active Workspace Modifying State
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');
  const [penaltyScore1, setPenaltyScore1] = useState('');
  const [penaltyScore2, setPenaltyScore2] = useState('');
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
    // Sync base tournament structures
    const storedFixtures = localStorage.getItem('rkm_s2_fixtures');
    if (storedFixtures) {
      setFixtures(JSON.parse(storedFixtures));
    } else {
      const defaultFixtures = [
        { id: 'Match 1', team1: 'Team A', team2: 'Team C', group: 'A', score1: '', score2: '', goals: [], motm: '' },
        { id: 'Match 2', team1: 'Team B', team2: 'Team D', group: 'B', score1: '', score2: '', goals: [], motm: '' },
        { id: 'Match 3', team1: 'Team C', team2: 'Team E', group: 'A', score1: '', score2: '', goals: [], motm: '' },
        { id: 'Match 4', team1: 'Team D', team2: 'Team F', group: 'B', score1: '', score2: '', goals: [], motm: '' },
        { id: 'Match 5', team1: 'Team E', team2: 'Team A', group: 'A', score1: '', score2: '', goals: [], motm: '' },
        { id: 'Match 6', team1: 'Team F', team2: 'Team B', group: 'B', score1: '', score2: '', goals: [], motm: '' }
      ];
      setFixtures(defaultFixtures);
      localStorage.setItem('rkm_s2_fixtures', JSON.stringify(defaultFixtures));
    }

    const loadKnockouts = () => {
      const sf1 = localStorage.getItem('rkm_s2_sf1Match');
      const sf2 = localStorage.getItem('rkm_s2_sf2Match');
      const final = localStorage.getItem('rkm_s2_finalMatch');
      if (sf1) setSf1Match(JSON.parse(sf1));
      else setSf1Match({ id: 'Semifinal 1', score1: '', score2: '', penaltyScore1: '', penaltyScore2: '', goals: [], motm: '' });
      if (sf2) setSf2Match(JSON.parse(sf2));
      else setSf2Match({ id: 'Semifinal 2', score1: '', score2: '', penaltyScore1: '', penaltyScore2: '', goals: [], motm: '' });
      if (final) setFinalMatch(JSON.parse(final));
      else setFinalMatch({ id: 'Grand Final', score1: '', score2: '', penaltyScore1: '', penaltyScore2: '', goals: [], motm: '' });
    };
    loadKnockouts();

    // Load Saved Golden Trophies
    setGoldenBall(localStorage.getItem('rkm_s2_goldenBallName') || '');
    setGoldenBoot(localStorage.getItem('rkm_s2_goldenBootName') || '');
    setGoldenGloves(localStorage.getItem('rkm_s2_goldenGlovesName') || '');

    const fetchPlayers = async () => {
      try {
        const res = await fetch(`${API_BASE}/players`);
        const data = await res.json();
        if (data.success) setPlayers(data.players);
      } catch (err) {
        console.error("Error fetching roster context names:", err);
      }
    };
    fetchPlayers();
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

  const handleSaveWorkspaceData = () => {
    if (selectedMatchId === 'Semifinal 1') {
      const updated = { ...sf1Match, score1, score2, penaltyScore1, penaltyScore2, goals, motm };
      setSf1Match(updated);
      localStorage.setItem('rkm_s2_sf1Match', JSON.stringify(updated));
    } else if (selectedMatchId === 'Semifinal 2') {
      const updated = { ...sf2Match, score1, score2, penaltyScore1, penaltyScore2, goals, motm };
      setSf2Match(updated);
      localStorage.setItem('rkm_s2_sf2Match', JSON.stringify(updated));
    } else if (selectedMatchId === 'Grand Final') {
      const updated = { ...finalMatch, score1, score2, penaltyScore1, penaltyScore2, goals, motm };
      setFinalMatch(updated);
      localStorage.setItem('rkm_s2_finalMatch', JSON.stringify(updated));
    } else {
      const updatedFixtures = fixtures.map(f =>
        f.id === selectedMatchId ? { ...f, score1, score2, goals, motm } : f
      );
      setFixtures(updatedFixtures);
      localStorage.setItem('rkm_s2_fixtures', JSON.stringify(updatedFixtures));
    }
    alert(`Records saved successfully for ${selectedMatchId}!`);
    window.dispatchEvent(new Event('storage'));
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
    setGoals([]);
    setMotm('');
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Menu Panel */}
        <div className="lg:col-span-1 bg-slate-950/40 border border-white/5 p-4 rounded-2xl space-y-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase">Group Stage Fixtures</span>
            <div className="flex flex-col gap-1 mt-2">
              {fixtures.map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedMatchId(f.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedMatchId === f.id ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 bg-white/2 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f.id}: {f.team1} vs {f.team2}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-white/5">
            <span className="text-[10px] font-bold tracking-wider text-purple-400 uppercase">Playoffs Knockout</span>
            <div className="flex flex-col gap-1 mt-2">
              {['Semifinal 1', 'Semifinal 2', 'Grand Final'].map(id => (
                <button
                  key={id}
                  onClick={() => setSelectedMatchId(id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedMatchId === id ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'text-slate-400 bg-white/2 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🏆 {id}
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
              <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Team 1 Score</label>
              <input type="number" value={score1} onChange={e => setScore1(e.target.value)} placeholder="0" className="w-full bg-slate-950 border border-white/10 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Team 2 Score</label>
              <input type="number" value={score2} onChange={e => setScore2(e.target.value)} placeholder="0" className="w-full bg-slate-950 border border-white/10 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none" />
            </div>
          </div>

          {/* Penalty Shootout Conditional Block */}
          {['Semifinal 1', 'Semifinal 2', 'Grand Final'].includes(selectedMatchId) && score1 === score2 && score1 !== '' && (
            <div className="bg-purple-900/20 border border-purple-500/20 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">🎯 Penalty Shootout (Tie-Breaker)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Team 1 PKs</label>
                  <input type="number" value={penaltyScore1} onChange={e => setPenaltyScore1(e.target.value)} placeholder="0" className="w-full bg-slate-950 border border-purple-500/30 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Team 2 PKs</label>
                  <input type="number" value={penaltyScore2} onChange={e => setPenaltyScore2(e.target.value)} placeholder="0" className="w-full bg-slate-950 border border-purple-500/30 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none" />
                </div>
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
                  {players.map(p => <option key={p.index} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Assist Provider</label>
                <select value={activeAssist} onChange={e => setActiveAssist(e.target.value)} className="w-full bg-slate-950 border border-white/10 text-xs rounded-xl px-3 py-2 text-slate-300 focus:outline-none">
                  <option value="None">None (Unassisted)</option>
                  {players.map(p => <option key={p.index} value={p.name}>{p.name}</option>)}
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
              {players.map(p => <option key={p.index} value={p.name}>{p.name}</option>)}
            </select>
          </div>

          {/* Save Workspace Action */}
          <button onClick={handleSaveWorkspaceData} className="w-full py-3 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 font-extrabold text-sm tracking-wide text-white hover:shadow-lg transition-all duration-300">
            Save Match Records & Scores
          </button>
        </div>
      </div>

      {/* Verbatim Render Section mapping image_18ae9f.png layout */}
      <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
        <h3 className="text-lg font-bold text-white tracking-wide">Tournament-Wide Awards (S2)</h3>
        <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-2">🏆 GOLDEN BALL</label>
              <select value={goldenBall} onChange={e => setGoldenBall(e.target.value)} className="w-full bg-slate-950 border border-white/10 text-xs rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none cursor-pointer">
                <option value="">Choose Player...</option>
                {players.map(p => <option key={p.index} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-2">🔥 GOLDEN BOOT</label>
              <select value={goldenBoot} onChange={e => setGoldenBoot(e.target.value)} className="w-full bg-slate-950 border border-white/10 text-xs rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none cursor-pointer">
                <option value="">Choose Player...</option>
                {players.map(p => <option key={p.index} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2">🧤 GOLDEN GLOVES</label>
              <select value={goldenGloves} onChange={e => setGoldenGloves(e.target.value)} className="w-full bg-slate-950 border border-white/10 text-xs rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none cursor-pointer">
                <option value="">Choose Player...</option>
                {players.map(p => <option key={p.index} value={p.name}>{p.name}</option>)}
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