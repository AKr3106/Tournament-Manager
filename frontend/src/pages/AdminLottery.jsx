import { useState, useEffect, useRef } from 'react';
import API_BASE from '../api';

// ─── Slot-machine roll animation (pure, no component closure) ───────────────
function runRollAnimation(pool, finalPlayer, setRollingName, setIsRolling, onComplete) {
  // Interval ladder: starts at 45ms, decays to ~530ms for suspense
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

const AdminLottery = () => {
  // Local Season State Configured Specifically for this sub-panel
  const [selectedSeason, setSelectedSeason] = useState('s2');

  // Database lists
  const [allPlayers, setAllPlayers] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lottery State
  const [lotteryState, setLotteryState] = useState({
    status: "idle",
    selectedPlayers: [],
    playersPerTeam: 6, // Hardcoded default fallback
    draftResults: {},
    draftLog: [],
    currentPick: null,
    draftPool: []
  });

  // UI Setup State
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");
  const [filterPosition, setFilterPosition] = useState("ALL");
  const [selectedSlotToLoad, setSelectedSlotToLoad] = useState("");

  // Fixed unchangeable max player assignment metric rules configuration
  const MAX_PLAYERS_PER_TEAM = 6;

  // ─── Animation State ─────────────────────────────────────────────────────
  const [isRolling, setIsRolling] = useState(false);
  const [rollingName, setRollingName] = useState('');
  const [fadingOutId, setFadingOutId] = useState(null);
  const [visiblePool, setVisiblePool] = useState([]);
  const isRollingRef = useRef(false); // ref for use inside async/interval closures

  // Fetch initial data (Re-runs safely if modular seasons expand)
  useEffect(() => {
    if (selectedSeason === 's1') {
      setAllPlayers([]);
      setAllTeams([]);
      setSlots([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const playersRes = await fetch(`${API_BASE}/players`, { credentials: "include" });
        const playersData = await playersRes.json();
        if (playersData.success) {
          setAllPlayers(playersData.players);
        }

        const teamsRes = await fetch(`${API_BASE}/teams`, { credentials: "include" });
        const teamsData = await teamsRes.json();
        if (teamsData.success) {
          setAllTeams(teamsData.teams);
          setSelectedTeams(teamsData.teams); // default to all
        }

        const slotsRes = await fetch(`${API_BASE}/slots`, { credentials: "include" });
        const slotsData = await slotsRes.json();
        if (slotsData.success) {
          setSlots(slotsData.slots);
        }

        const stateRes = await fetch(`${API_BASE}/lottery/state`, { credentials: "include" });
        const stateData = await stateRes.json();
        if (stateData.success && stateData.state) {
          setLotteryState(stateData.state);
          
          if (stateData.state.status !== "idle") {
            setSelectedPlayers(stateData.state.selectedPlayers || []);
            if (stateData.state.selectedTeams && stateData.state.selectedTeams.length > 0) {
              setSelectedTeams(stateData.state.selectedTeams);
            }
          }
        }
      } catch (err) {
        console.error("Error loading admin lottery data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSeason]);

  // Poll state if lottery is running — skip if animation is active
  useEffect(() => {
    let intervalId;
    if (lotteryState.status === "running" && selectedSeason === 's2') {
      intervalId = setInterval(async () => {
        try {
          if (isRollingRef.current) return; // don't interrupt active animation
          const res = await fetch(`${API_BASE}/lottery/state`, { credentials: "include" });
          const data = await res.json();
          if (data.success && data.state) {
            setLotteryState(data.state);
          }
          const slotsRes = await fetch(`${API_BASE}/slots`, { credentials: "include" });
          const slotsData = await slotsRes.json();
          if (slotsData.success) {
            setSlots(slotsData.slots);
          }
        } catch (err) {
          console.error("Error polling lottery state:", err);
        }
      }, 2000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [lotteryState.status, selectedSeason]);

  // Sync visiblePool with draftPool only when not animating
  useEffect(() => {
    if (!isRolling) {
      setVisiblePool(lotteryState.draftPool || []);
    }
  }, [lotteryState.draftPool, isRolling]);

  // Handlers
  const handleTogglePlayer = (player) => {
    setSelectedPlayers(prev => {
      const exists = prev.some(p => p.index === player.index);
      if (exists) {
        return prev.filter(p => p.index !== player.index);
      } else {
        return [...prev, player];
      }
    });
  };

  const handleSelectAll = () => {
    const filtered = filteredPlayersToSelect;
    setSelectedPlayers(prev => {
      const next = [...prev];
      filtered.forEach(p => {
        if (!next.some(x => x.index === p.index)) {
          next.push(p);
        }
      });
      return next;
    });
  };

  const handleDeselectAll = () => {
    setSelectedPlayers(prev => {
      return prev.filter(p => !filteredPlayersToSelect.some(f => f.index === p.index));
    });
  };

  const handleSetupDraft = async () => {
    if (selectedTeams.length < 2) {
      alert("Please select at least 2 teams to participate in the lottery.");
      return;
    }
    if (selectedPlayers.length > 0 && selectedPlayers.length < selectedTeams.length) {
      alert(`If assigning captains, please select at least ${selectedTeams.length} players (1 captain for each of the ${selectedTeams.length} selected teams). Or select 0 players to skip captains.`);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/lottery/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedPlayers: selectedPlayers,
          selectedTeams: selectedTeams,
          playersPerTeam: MAX_PLAYERS_PER_TEAM, // Pass the strict locked value here securely
          season: selectedSeason
        }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setLotteryState(data.state);
      } else {
        alert(data.message || "Failed to set up draft");
      }
    } catch (err) {
      console.error("Error setting up draft:", err);
      alert("An error occurred during draft setup.");
    }
  };

  const handleStartDraft = async () => {
    try {
      const res = await fetch(`${API_BASE}/lottery/start`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setLotteryState(data.state);
      } else {
        alert(data.message || "Failed to start draft");
      }
    } catch (err) {
      console.error("Error starting draft:", err);
    }
  };

  const handleLoadSlot = async () => {
    if (!selectedSlotToLoad) return;
    try {
      const res = await fetch(`${API_BASE}/lottery/load-slot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotIndex: Number(selectedSlotToLoad) }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setLotteryState(data.state);
        setSelectedSlotToLoad(""); 
        
        const slotsRes = await fetch(`${API_BASE}/slots`, { credentials: "include" });
        const slotsData = await slotsRes.json();
        if (slotsData.success) {
          setSlots(slotsData.slots);
        }
      } else {
        alert(data.message || "Failed to load slot");
      }
    } catch (err) {
      console.error("Error loading slot:", err);
    }
  };

  // ─── Draw Next: triggers slot-machine animation then applies result ────────
  const handleDrawNext = async () => {
    if (isRolling) return;
    try {
      const res = await fetch(`${API_BASE}/lottery/draw`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        const pickedPlayer = data.state.currentPick?.player;
        if (!pickedPlayer) {
          setLotteryState(data.state);
          return;
        }
        // Snapshot current pool (still contains the picked player)
        const poolSnapshot = visiblePool.length > 0 ? [...visiblePool] : [...(lotteryState.draftPool || [])];
        setIsRolling(true);
        isRollingRef.current = true;

        runRollAnimation(poolSnapshot, pickedPlayer, setRollingName, setIsRolling, () => {
          isRollingRef.current = false;
          // Fade out the picked player card
          setFadingOutId(pickedPlayer.index);
          setTimeout(() => {
            setVisiblePool(prev => prev.filter(p => p.index !== pickedPlayer.index));
            setFadingOutId(null);
            setLotteryState(data.state); // apply full server state after animation
          }, 500);
        });
      } else {
        alert(data.message || "Failed to draw player");
      }
    } catch (err) {
      console.error("Error drawing player:", err);
    }
  };

  const handleResetDraft = async () => {
    if (!window.confirm("Are you sure you want to reset the lottery? All current assignments will be lost.")) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/lottery/reset`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setLotteryState(data.state);
        setSelectedPlayers([]);
        setRollingName('');
        setIsRolling(false);
        isRollingRef.current = false;
        setFadingOutId(null);
        setVisiblePool([]);
        
        const slotsRes = await fetch(`${API_BASE}/slots`, { credentials: "include" });
        const slotsData = await slotsRes.json();
        if (slotsData.success) {
          setSlots(slotsData.slots);
        }
      } else {
        alert(data.message || "Failed to reset draft");
      }
    } catch (err) {
      console.error("Error resetting draft:", err);
    }
  };

  const filteredPlayersToSelect = allPlayers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(playerSearchQuery.toLowerCase());
    const matchesPosition = filterPosition === "ALL" || p.position === filterPosition;
    return matchesSearch && matchesPosition;
  });

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-slate-400 text-sm">Loading lottery settings...</span>
      </div>
    );
  }

  const getDraftResults = (teamIndex) => {
    if (!lotteryState.draftResults) return [];
    return lotteryState.draftResults[String(teamIndex)] || [];
  };

  return (
    <div className="space-y-6">
      
      {/* Local Switcher Block: Standardized Placement inside this view */}
      <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/5 max-w-xs mb-2">
        <button 
          type="button" 
          disabled 
          className="flex-1 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-900/20 border border-dashed border-white/5 rounded-lg cursor-not-allowed"
        >
          🔒 Season 1
        </button>
        <button 
          type="button" 
          onClick={() => setSelectedSeason('s2')} 
          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition ${
            selectedSeason === 's2' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'
          }`}
        >
          Season 2 (Live)
        </button>
      </div>

      {/* ─── Control Bar ────────────────────────────────────────────────────── */}
      <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-pink-400 font-semibold tracking-wider text-xs uppercase bg-pink-500/10 px-2.5 py-1 rounded-md border border-pink-500/20">
                Phase: {lotteryState.status.toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-3 flex items-center gap-2">
              Tournament Lottery Management ({selectedSeason.toUpperCase()})
            </h2>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {lotteryState.status === "setup" && (
              <button
                onClick={handleStartDraft}
                className="px-5 py-2.5 rounded-xl bg-linear-to-r from-pink-500 to-rose-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 flex items-center gap-2 cursor-pointer"
              >
                Start Draft
              </button>
            )}

            {/* Load Slot — only show when pool is empty and not rolling */}
            {lotteryState.status === "running" && lotteryState?.draftPool?.length === 0 && !isRolling && (
              <div className="flex gap-2">
                <select
                  value={selectedSlotToLoad}
                  onChange={(e) => setSelectedSlotToLoad(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
                >
                  <option value="">-- Select Slot to Load --</option>
                  {slots.filter(s => s.status !== "completed").map(s => (
                    <option key={s.index} value={s.index}>{s.name} ({s.players.length} players)</option>
                  ))}
                </select>
                <button
                  onClick={handleLoadSlot}
                  disabled={!selectedSlotToLoad}
                  className="px-5 py-2.5 rounded-xl bg-linear-to-r from-blue-500 to-cyan-600 text-white font-semibold text-sm disabled:opacity-50"
                >
                  Load Slot
                </button>
              </div>
            )}

            {/* Draw Next — disabled while rolling, shows spinner + count */}
            {lotteryState.status === "running" && (visiblePool.length > 0 || isRolling) && (
              <button
                onClick={handleDrawNext}
                disabled={isRolling}
                className={`px-5 py-2.5 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${!isRolling ? 'animate-pulse' : ''}`}
              >
                {isRolling ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block shrink-0"></span>
                    Rolling...
                  </>
                ) : (
                  `Draw Next (${visiblePool.length} left)`
                )}
              </button>
            )}

            {lotteryState.status !== "idle" && (
              <button
                onClick={handleResetDraft}
                className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white text-sm transition-all cursor-pointer"
              >
                Reset Draft
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── SETUP PHASE INTERFACE ───────────────────────────────────────────── */}
      {lotteryState.status === "idle" && (
        <div className="bg-slate-900/20 border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
          <h3 className="text-lg font-bold text-white">Draft Pool Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Locked, Unchangeable Max Players layout container element card slot */}
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-5 space-y-3 select-none">
              <label className="block text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Max Players Per Team
              </label>
              <div className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-2.5 text-indigo-400 font-mono font-bold text-base shadow-inner">
                {MAX_PLAYERS_PER_TEAM} <span className="text-xs font-sans text-slate-500 font-normal ml-1.5">(Locked League Rule)</span>
              </div>
            </div>

            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-5 space-y-2">
              <span className="block text-xs font-semibold text-slate-400 tracking-wider uppercase">Summary</span>
              <div className="mt-3 space-y-1 text-sm text-slate-300 font-mono">
                <div>Teams available: <strong className="text-indigo-400">{allTeams.length}</strong></div>
                <div>Participating Teams: <strong className="text-blue-400">{selectedTeams.length}</strong></div>
                <div>Selected Captains: <strong className="text-pink-400">{selectedPlayers.length}</strong></div>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center bg-slate-950/20 border border-dashed border-white/10 rounded-xl p-5">
              <button
                onClick={handleSetupDraft}
                disabled={selectedTeams.length < 2}
                className="w-full py-3 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 text-white font-bold disabled:opacity-40 cursor-pointer"
              >
                Save & Initialize Draft
              </button>
            </div>
          </div>

          {/* Team Selection List */}
          <div className="space-y-4 border-t border-white/5 pt-6">
            <h4 className="font-bold text-white text-sm">Select Participating Teams ({selectedTeams.length})</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-2">
              {allTeams.map((team) => {
                const isSelected = selectedTeams.some(t => t.index === team.index);
                return (
                  <div
                    key={team.index}
                    onClick={() => {
                      setSelectedTeams(prev => {
                        const exists = prev.some(t => t.index === team.index);
                        if (exists) {
                          return prev.filter(t => t.index !== team.index);
                        } else {
                          return [...prev, team];
                        }
                      });
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected ? "bg-blue-500/10 border-blue-500/40 text-white" : "bg-slate-950/40 border-white/5 text-slate-400"
                    }`}
                  >
                    <span>{team.teamName || team['team-name']}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Players Roster Area */}
          <div className="space-y-4">
            {/* Responsive and container-safe flex row structure for search filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/5 pt-6">
              <h4 className="font-bold text-white text-sm whitespace-nowrap">
                Select Captains ({selectedPlayers.length})
              </h4>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-2 shrink-0">
                  <button type="button" onClick={handleSelectAll} className="text-[10px] bg-white/5 text-slate-300 font-bold px-2 py-1 rounded border border-white/10 hover:bg-white/10 cursor-pointer">All</button>
                  <button type="button" onClick={handleDeselectAll} className="text-[10px] bg-white/5 text-slate-300 font-bold px-2 py-1 rounded border border-white/10 hover:bg-white/10 cursor-pointer">None</button>
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={playerSearchQuery}
                  onChange={(e) => setPlayerSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none w-full max-w-40 sm:max-w-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-1">
              {filteredPlayersToSelect.map((player) => {
                const selectedIndex = selectedPlayers.findIndex(p => p.index === player.index);
                const isSelected = selectedIndex !== -1;
                let captainOf = isSelected && selectedTeams[selectedIndex] ? (selectedTeams[selectedIndex].teamName || selectedTeams[selectedIndex]['team-name']) : null;

                return (
                  <div
                    key={player.index}
                    onClick={() => handleTogglePlayer(player)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                      isSelected ? "bg-indigo-500/10 border-indigo-500/40 text-white" : "bg-slate-950/40 border-white/5 text-slate-400"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-1">
                      <p className="text-xs font-semibold truncate">{player.name}</p>
                      {captainOf && <span className="text-[10px] text-amber-400 font-bold block truncate">★ {captainOf}</span>}
                    </div>
                    {posBadge(player.position)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── LOTTERY DRUM ROLL CARD ──────────────────────────────────────────── */}
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

      {/* ─── DRAFT POOL BOARD ────────────────────────────────────────────────── */}
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

      {/* ─── RENDER DRAFT LOGS AND RESULTS ───────────────────────────────────── */}
      {lotteryState.status !== "idle" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {selectedTeams.map((team) => {
            const roster = getDraftResults(team.index);
            return (
              <div key={team.index} className="bg-slate-900/30 border border-white/10 rounded-2xl p-5">
                <h4 className="font-bold text-white mb-2">{team.teamName || team['team-name']}</h4>
                <div className="space-y-2">
                  {roster.map((player, pIdx) => (
                    <div key={player.index} className="bg-slate-950/40 p-2 rounded text-xs flex justify-between text-slate-200">
                      <span>{player.name} {pIdx === 0 && <span className="text-amber-400 font-bold">(C)</span>}</span>
                      {posBadge(player.position)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
    </div>
  );
};

export default AdminLottery;