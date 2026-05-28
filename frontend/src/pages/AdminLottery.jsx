import { useState, useEffect } from 'react';

const API_BASE = "http://localhost:3000/api";

const AdminLottery = () => {
  // Database lists
  const [allPlayers, setAllPlayers] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lottery State
  const [lotteryState, setLotteryState] = useState({
    status: "idle",
    selectedPlayers: [],
    playersPerTeam: 0,
    draftResults: {},
    draftLog: [],
    currentPick: null,
    draftPool: []
  });

  // UI Setup State: track selected players in ordered array (for captains)
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [playersPerTeamInput, setPlayersPerTeamInput] = useState(2);
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");
  const [filterPosition, setFilterPosition] = useState("ALL");
  const [selectedSlotToLoad, setSelectedSlotToLoad] = useState("");

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all players
        const playersRes = await fetch(`${API_BASE}/players`, { credentials: "include" });
        const playersData = await playersRes.json();
        if (playersData.success) {
          setAllPlayers(playersData.players);
        }

        // Fetch all teams
        const teamsRes = await fetch(`${API_BASE}/teams`, { credentials: "include" });
        const teamsData = await teamsRes.json();
        if (teamsData.success) {
          setAllTeams(teamsData.teams);
        }

        // Fetch slots
        const slotsRes = await fetch(`${API_BASE}/slots`, { credentials: "include" });
        const slotsData = await slotsRes.json();
        if (slotsData.success) {
          setSlots(slotsData.slots);
        }

        // Fetch lottery state
        const stateRes = await fetch(`${API_BASE}/lottery/state`, { credentials: "include" });
        const stateData = await stateRes.json();
        if (stateData.success && stateData.state) {
          setLotteryState(stateData.state);
          setPlayersPerTeamInput(stateData.state.playersPerTeam || 2);
          
          // Pre-populate selection if state is not idle
          if (stateData.state.status !== "idle") {
            setSelectedPlayers(stateData.state.selectedPlayers || []);
          }
        }
      } catch (err) {
        console.error("Error loading admin lottery data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Poll state if lottery is running
  useEffect(() => {
    let intervalId;
    if (lotteryState.status === "running") {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/lottery/state`, { credentials: "include" });
          const data = await res.json();
          if (data.success && data.state) {
            setLotteryState(data.state);
          }
          // Also fetch slots to keep status updated
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
  }, [lotteryState.status]);

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
    const filtered = filteredPlayersToSelect;
    setSelectedPlayers(prev => {
      return prev.filter(p => !filtered.some(f => f.index === p.index));
    });
  };

  const handleSetupDraft = async () => {
    if (selectedPlayers.length > 0 && selectedPlayers.length < allTeams.length) {
      alert(`If assigning captains, please select at least ${allTeams.length} players (1 captain for each of the ${allTeams.length} teams). Or select 0 players to skip captains.`);
      return;
    }
    if (allTeams.length < 2) {
      alert("At least 2 teams are required in the system to run a lottery.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/lottery/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedPlayers: selectedPlayers,
          playersPerTeam: playersPerTeamInput
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
        setSelectedSlotToLoad(""); // Reset
        
        // Refresh slots to get updated statuses
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

  const handleDrawNext = async () => {
    try {
      const res = await fetch(`${API_BASE}/lottery/draw`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setLotteryState(data.state);
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
        
        // Refresh slots to get updated statuses
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

  // Filter players list for selection
  const filteredPlayersToSelect = allPlayers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(playerSearchQuery.toLowerCase());
    const matchesPosition = filterPosition === "ALL" || p.position === filterPosition;
    return matchesSearch && matchesPosition;
  });

  // UI Helpers
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

  const teamColors = [
    'from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-amber-500 to-orange-500',
    'from-emerald-500 to-teal-500', 'from-rose-500 to-red-500', 'from-indigo-500 to-violet-500',
    'from-sky-500 to-blue-500', 'from-lime-500 to-green-500'
  ];

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

  const totalDrafted = Object.values(lotteryState.draftResults || {}).reduce((sum, arr) => sum + (arr ? arr.length : 0), 0);
  const pendingSlots = slots.filter(s => s.status !== "completed");

  return (
    <div className="space-y-8">
      {/* Active Phase Controls */}
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
              <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Tournament Lottery Management
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Configure the lottery pool, start the live draft, and assign players to teams.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {lotteryState.status === "setup" && (
              <button
                onClick={handleStartDraft}
                className="px-5 py-2.5 rounded-xl bg-linear-to-r from-pink-500 to-rose-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Draft
              </button>
            )}

            {lotteryState.status === "running" && lotteryState.draftPool.length === 0 && (
              <div className="flex gap-2">
                <select
                  value={selectedSlotToLoad}
                  onChange={(e) => setSelectedSlotToLoad(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Select Slot to Load --</option>
                  {pendingSlots.map(s => (
                    <option key={s.index} value={s.index}>{s.name} ({s.players.length} players)</option>
                  ))}
                </select>
                <button
                  onClick={handleLoadSlot}
                  disabled={!selectedSlotToLoad}
                  className="px-5 py-2.5 rounded-xl bg-linear-to-r from-blue-500 to-cyan-600 text-white font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Load Slot
                </button>
              </div>
            )}

            {lotteryState.status === "running" && lotteryState.draftPool.length > 0 && (
              <button
                onClick={handleDrawNext}
                className="px-5 py-2.5 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2 animate-pulse"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Draw Next ({lotteryState.draftPool ? lotteryState.draftPool.length : 0} left in pool)
              </button>
            )}

            {lotteryState.status !== "idle" && (
              <button
                onClick={handleResetDraft}
                className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 font-semibold text-sm transition-all duration-300 cursor-pointer"
              >
                Reset Draft
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SETUP PHASE INTERFACE */}
      {lotteryState.status === "idle" && (
        <div className="bg-slate-900/20 border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
          <h3 className="text-lg font-bold text-white">Draft Pool Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Players per Team Config */}
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-5 space-y-3">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Max Players Per Team
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={playersPerTeamInput}
                onChange={(e) => setPlayersPerTeamInput(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <p className="text-[11px] text-slate-500">
                Number of players to draw into each team before the draft completes.
              </p>
            </div>

            {/* Selection Summary */}
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-5 space-y-2 flex flex-col justify-between">
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Summary
                </span>
                <div className="mt-3 space-y-1 text-sm text-slate-300 font-mono">
                  <div>Teams available: <strong className="text-indigo-400">{allTeams.length}</strong></div>
                  <div>Selected Captains: <strong className="text-pink-400">{selectedPlayers.length}</strong></div>
                  <div>Draft targets: <strong className="text-emerald-400">{allTeams.length * playersPerTeamInput} slots</strong></div>
                </div>
              </div>
            </div>

            {/* Launch Setup */}
            <div className="flex flex-col justify-center items-center bg-slate-950/20 border border-dashed border-white/10 rounded-xl p-5 space-y-2">
              <button
                onClick={handleSetupDraft}
                disabled={allTeams.length < 2}
                className="w-full py-3 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Save & Initialize Draft
              </button>
              <span className="text-[10px] text-slate-400 text-center">
                * Select Captains below, or leave empty if no Captains.
              </span>
            </div>
          </div>

          {/* Player Selection List */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-white text-sm">Select Captains ({selectedPlayers.length} selected)</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  The first {allTeams.length} clicked players will be set as Captains in order. Others will be ignored here. Use Slot Manager for the rest.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search player name..."
                  value={playerSearchQuery}
                  onChange={(e) => setPlayerSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />

                {/* Filter Position */}
                <select
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="ALL">All Positions</option>
                  <option value="FW">Forwards</option>
                  <option value="DF">Defenders</option>
                  <option value="GK">Goalkeepers</option>
                </select>

                <button
                  onClick={handleSelectAll}
                  className="text-xs bg-slate-900 border border-white/5 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Select Filtered
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="text-xs bg-slate-900 border border-white/5 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Deselect Filtered
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-2">
              {filteredPlayersToSelect.map((player) => {
                const selectedIndex = selectedPlayers.findIndex(p => p.index === player.index);
                const isSelected = selectedIndex !== -1;
                
                let captainOf = null;
                if (isSelected && selectedIndex < allTeams.length && allTeams[selectedIndex]) {
                  captainOf = allTeams[selectedIndex]['team-name'];
                }

                return (
                  <div
                    key={player.index}
                    onClick={() => handleTogglePlayer(player)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                      isSelected
                        ? captainOf
                          ? "bg-amber-500/10 border-amber-500/40 text-white shadow-md shadow-amber-500/5"
                          : "bg-indigo-500/10 border-indigo-500/40 text-white"
                        : "bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/20 hover:bg-slate-950/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isSelected 
                          ? captainOf
                            ? "bg-amber-500 border-amber-500 text-slate-950"
                            : "bg-indigo-500 border-indigo-500 text-white"
                          : "border-slate-500"
                      }`}>
                        {isSelected && (
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs font-semibold ${isSelected ? "text-slate-100" : "text-slate-400"}`}>
                          {player.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">#{String(player.index).padStart(2, '0')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      {captainOf ? (
                        <span className="text-[9px] bg-amber-500/20 border border-amber-500/30 text-amber-300 font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                          ★ C: {captainOf}
                        </span>
                      ) : (
                        isSelected && (
                          <span className="text-[9px] bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold px-1.5 py-0.5 rounded-md">
                            #{selectedIndex + 1}
                          </span>
                        )
                      )}
                      {posBadge(player.position)}
                    </div>
                  </div>
                );
              })}

              {filteredPlayersToSelect.length === 0 && (
                <div className="col-span-full py-8 text-center text-xs text-slate-500 italic border border-dashed border-white/5 rounded-xl">
                  No players match search criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SHUFFLED READY STATE (SETUP) */}
      {lotteryState.status === "setup" && (
        <div className="bg-linear-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 rounded-2xl p-6 text-center space-y-4">
          <svg className="w-12 h-12 mx-auto text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <div>
            <h3 className="text-lg font-bold text-white">Draft Setup Complete!</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Captains assigned. Ready to start the draft. You can load slots once running.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleStartDraft}
              className="px-6 py-2.5 rounded-xl bg-linear-to-r from-pink-500 to-rose-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 cursor-pointer"
            >
              Start Live Lottery
            </button>
            <button
              onClick={handleResetDraft}
              className="px-6 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 font-bold text-sm transition-all duration-300 cursor-pointer"
            >
              Back / Reset
            </button>
          </div>
        </div>
      )}

      {/* STATS ROW */}
      {lotteryState.status !== "idle" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Pool Size', value: lotteryState.draftPool ? lotteryState.draftPool.length : 0, color: 'text-indigo-400' },
            { label: 'Teams', value: allTeams.length, color: 'text-purple-400' },
            { label: 'Per Team', value: lotteryState.playersPerTeam, color: 'text-pink-400' },
            { label: 'Drafted', value: totalDrafted, color: 'text-emerald-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/30 border border-white/5 rounded-xl p-4 text-center">
              <span className={`block text-2xl font-extrabold ${stat.color}`}>{stat.value}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* CURRENT PICK DISPLAY */}
      {lotteryState.currentPick && (
        <div className="bg-linear-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6 text-center animate-pulse">
          <p className="text-xs text-indigo-400 uppercase tracking-wider font-bold mb-2">Drafted Pick</p>
          <p className="text-2xl font-extrabold text-white">{lotteryState.currentPick.player.name}</p>
          <p className="text-sm text-slate-400 mt-1">
            assigned to → <strong className="text-indigo-400">{lotteryState.currentPick.team["team-name"]}</strong>
          </p>
        </div>
      )}

      {/* LIVE TEAMS / RESULTS GRID */}
      {lotteryState.status !== "idle" && (
        <div>
          <h3 className="text-lg font-bold text-white mb-5">Draft Results</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {allTeams.map((team, idx) => {
              const roster = getDraftResults(team.index);
              return (
                <div key={team.index} className="bg-slate-900/30 border border-white/10 rounded-2xl overflow-hidden">
                  <div className={`h-1.5 bg-linear-to-r ${teamColors[idx % teamColors.length]} opacity-70`}></div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-white text-sm">{team['team-name']}</h4>
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
      )}

      {/* DRAFT LOG */}
      {lotteryState.draftLog && lotteryState.draftLog.length > 0 && (
        <div className="bg-slate-900/20 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Draft Log
            </h3>
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
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
  );
};

export default AdminLottery;
