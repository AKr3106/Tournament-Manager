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

  // UI Setup State
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [playersPerTeamInput, setPlayersPerTeamInput] = useState(2);
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");
  const [filterPosition, setFilterPosition] = useState("ALL");
  const [selectedSlotToLoad, setSelectedSlotToLoad] = useState("");

  // Fetch initial data
  useEffect(() => {
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
          setPlayersPerTeamInput(stateData.state.playersPerTeam || 2);
          
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
              Tournament Lottery Management
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

            {lotteryState.status === "running" && lotteryState?.draftPool?.length === 0 && (
              <div className="flex gap-2">
                <select
                  value={selectedSlotToLoad}
                  onChange={(e) => setSelectedSlotToLoad(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
                >
                  <option value="">-- Select Slot to Load --</option>
                  {pendingSlots.map(s => (
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

            {lotteryState.status === "running" && lotteryState?.draftPool?.length > 0 && (
              <button
                onClick={handleDrawNext}
                className="px-5 py-2.5 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2 animate-pulse cursor-pointer"
              >
                Draw Next ({lotteryState.draftPool ? lotteryState.draftPool.length : 0} left)
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

      {/* SETUP PHASE INTERFACE */}
      {lotteryState.status === "idle" && (
        <div className="bg-slate-900/20 border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
          <h3 className="text-lg font-bold text-white">Draft Pool Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              />
            </div>

            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-5 space-y-2">
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Summary</span>
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

          {/* Fixed Selection Order Fix without sorting index */}
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
                          return [...prev, team]; // Removed explicit .sort() to preserve click ordering sequence
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

          {/* Players Roster selection components layout */}
          <div className="space-y-4 border-t border-white/5 pt-6">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-white text-sm">Select Captains ({selectedPlayers.length})</h4>
              <input
                type="text"
                placeholder="Search..."
                value={playerSearchQuery}
                onChange={(e) => setPlayerSearchQuery(e.target.value)}
                className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
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
                    <div>
                      <p className="text-xs font-semibold">{player.name}</p>
                      {captainOf && <span className="text-[10px] text-amber-400 font-bold">★ {captainOf}</span>}
                    </div>
                    {posBadge(player.position)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* RENDER DRAFT LOGS AND RESULTS */}
      {lotteryState.status !== "idle" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {selectedTeams.map((team, idx) => {
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