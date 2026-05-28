import { useState, useEffect } from 'react'
import AdminLottery from './AdminLottery';
import SlotManager from './SlotManager';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('players');

  // ─── Player Management State ───
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPosition, setNewPlayerPosition] = useState('FW');
  const [editingPlayerIndex, setEditingPlayerIndex] = useState(null);
  const [editingPlayerName, setEditingPlayerName] = useState('');

  // ─── Team Management State ───
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [editingTeamIndex, setEditingTeamIndex] = useState(null);
  const [editingTeamName, setEditingTeamName] = useState('');

  // ─── Lottery Draft State ───
  const [draftResults, setDraftResults] = useState({});

  // Fetch players and teams from backend database on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const playersRes = await fetch("http://localhost:3000/api/players");
        const playersData = await playersRes.json();
        if (playersData.success) {
          setPlayers(playersData.players);
        }

        const teamsRes = await fetch("http://localhost:3000/api/teams");
        const teamsData = await teamsRes.json();
        if (teamsData.success) {
          setTeams(teamsData.teams);
        }

        const lotteryRes = await fetch("http://localhost:3000/api/lottery/state", { credentials: "include" });
        const lotteryData = await lotteryRes.json();
        if (lotteryData.success && lotteryData.state) {
          setDraftResults(lotteryData.state.draftResults || {});
        }
      } catch (err) {
        console.error("Error fetching data from database:", err);
      }
    };
    fetchData();
  }, []);

  // ─── Player Handlers ───
  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) return;
    try {
      const res = await fetch("http://localhost:3000/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPlayerName.trim(),
          position: newPlayerPosition
        }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setPlayers(prev => [...prev, data.player]);
        setNewPlayerName('');
      } else {
        alert(data.message || "Failed to add player");
      }
    } catch (err) {
      console.error("Error adding player:", err);
      alert("Error adding player to database");
    }
  };

  const handleRemovePlayer = async (index, playerName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete player "${playerName}"?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:3000/api/players/${index}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setPlayers(prev => prev.filter(p => p.index !== index));
      } else {
        alert(data.message || "Failed to remove player");
      }
    } catch (err) {
      console.error("Error deleting player:", err);
      alert("Error removing player from database");
    }
  };

  const handleSavePlayerName = async (index) => {
    if (!editingPlayerName.trim()) return;

    const originalPlayer = players.find(p => p.index === index);
    if (originalPlayer && originalPlayer.name === editingPlayerName.trim()) {
      setEditingPlayerIndex(null);
      return;
    }

    const confirmUpdate = window.confirm(`Are you sure you want to change player name from "${originalPlayer ? originalPlayer.name : ''}" to "${editingPlayerName.trim()}"?`);
    if (!confirmUpdate) return;

    try {
      const res = await fetch(`http://localhost:3000/api/players/${index}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingPlayerName.trim() }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setPlayers(prev => prev.map(p => p.index === index ? data.player : p));
        setEditingPlayerIndex(null);
      } else {
        alert(data.message || "Failed to update player name");
      }
    } catch (err) {
      console.error("Error updating player name:", err);
      alert("Error updating player name in database");
    }
  };

  // ─── Team Handlers ───
  const handleAddTeam = async () => {
    if (!newTeamName.trim()) return;
    try {
      const res = await fetch("http://localhost:3000/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "team-name": newTeamName.trim()
        }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setTeams(prev => [...prev, data.team]);
        setNewTeamName('');
      } else {
        alert(data.message || "Failed to add team");
      }
    } catch (err) {
      console.error("Error adding team:", err);
      alert("Error adding team to database");
    }
  };

  const handleRemoveTeam = async (index, teamName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete team "${teamName}"?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:3000/api/teams/${index}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setTeams(prev => prev.filter(t => t.index !== index));
        const updated = { ...draftResults };
        delete updated[index];
        setDraftResults(updated);
      } else {
        alert(data.message || "Failed to remove team");
      }
    } catch (err) {
      console.error("Error deleting team:", err);
      alert("Error removing team from database");
    }
  };

  const handleSaveTeamName = async (index) => {
    if (!editingTeamName.trim()) return;

    const originalTeam = teams.find(t => t.index === index);
    if (originalTeam && originalTeam['team-name'] === editingTeamName.trim()) {
      setEditingTeamIndex(null);
      return;
    }

    const confirmUpdate = window.confirm(`Are you sure you want to change team name from "${originalTeam ? originalTeam['team-name'] : ''}" to "${editingTeamName.trim()}"?`);
    if (!confirmUpdate) return;

    try {
      const res = await fetch(`http://localhost:3000/api/teams/${index}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "team-name": editingTeamName.trim() }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setTeams(prev => prev.map(t => t.index === index ? data.team : t));
        setEditingTeamIndex(null);
      } else {
        alert(data.message || "Failed to update team name");
      }
    } catch (err) {
      console.error("Error updating team name:", err);
      alert("Error updating team name in database");
    }
  };


  // Position badge helper
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

  const tabs = [
    { id: 'players', label: 'Players', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { id: 'teams', label: 'Teams', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )},
    { id: 'lottery', label: 'Live Lottery', icon: (
      <svg className="w-4 h-4 text-red-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="12" cy="12" r="5" fill="currentColor"/>
      </svg>
    )},
    { id: 'slots', label: 'Slot Manager', icon: (
      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    )},
  ];

  // Team color palette for the draft cards
  const teamColors = [
    'from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-amber-500 to-orange-500',
    'from-emerald-500 to-teal-500', 'from-rose-500 to-red-500', 'from-indigo-500 to-violet-500',
    'from-sky-500 to-blue-500', 'from-lime-500 to-green-500'
  ];

  return (
    <>
      <div className="min-h-screen text-slate-50 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center md:text-left mb-10 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <span className="text-indigo-400 font-semibold tracking-wider text-sm uppercase">Organizer Dashboard</span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-2">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-200 via-purple-300 to-indigo-100 antialiased" style={{ WebkitTextFillColor: 'transparent' }}>
            Admin Panel
          </span>
        </h1>
        <p className="text-slate-400 mt-3 max-w-2xl text-base leading-relaxed">
          Manage players and configure teams from this control centre.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex p-1 bg-slate-900/60 border border-white/5 rounded-xl gap-1 mb-10 max-w-lg">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* TAB: PLAYERS                                */}
      {/* ═══════════════════════════════════════════ */}
      {activeTab === 'players' && (
        <div className="space-y-8">
          {/* Add Player Form */}
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Player
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                placeholder="Player name..."
                className="flex-1 bg-slate-950/60 border border-white/10 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
              />
              <select
                value={newPlayerPosition}
                onChange={(e) => setNewPlayerPosition(e.target.value)}
                className="bg-slate-950/60 border border-white/10 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 cursor-pointer"
              >
                <option value="FW">Forward (FW)</option>
                <option value="DF">Defender (DF)</option>
                <option value="GK">Goalkeeper (GK)</option>
              </select>
              <button
                onClick={handleAddPlayer}
                disabled={!newPlayerName.trim()}
                className="px-6 py-2.5 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none cursor-pointer"
              >
                Add Player
              </button>
            </div>
          </div>

          {/* Player Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Players', value: players.length, color: 'text-indigo-400' },
              { label: 'Forwards', value: players.filter(p => p.position === 'FW').length, color: 'text-rose-400' },
              { label: 'Defenders', value: players.filter(p => p.position === 'DF').length, color: 'text-emerald-400' },
              { label: 'Goalkeepers', value: players.filter(p => p.position === 'GK').length, color: 'text-amber-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-900/30 border border-white/5 rounded-xl p-4 text-center">
                <span className={`block text-2xl font-extrabold ${stat.color}`}>{stat.value}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Player List */}
          <div className="bg-slate-900/20 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Registered Players ({players.length})</h3>
            </div>
            {players.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <svg className="w-12 h-12 mx-auto text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-slate-600 text-sm">No players registered yet. Add your first player above.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {players.map((player) => (
                  <div key={player.index} className="flex items-center justify-between px-6 py-3.5 hover:bg-white/2 transition-colors group">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-slate-600 w-8">#{String(player.index).padStart(2, '0')}</span>
                      <div className="w-9 h-9 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center text-indigo-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        {editingPlayerIndex === player.index ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingPlayerName}
                              onChange={(e) => setEditingPlayerName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSavePlayerName(player.index);
                                if (e.key === 'Escape') setEditingPlayerIndex(null);
                              }}
                              className="bg-slate-950 border border-indigo-500/50 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSavePlayerName(player.index)}
                              className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 cursor-pointer text-xs font-bold"
                              title="Save name"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingPlayerIndex(null)}
                              className="w-6 h-6 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-slate-700 cursor-pointer text-xs font-bold"
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <span className="font-semibold text-sm text-slate-200">{player.name}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {posBadge(player.position)}
                      {editingPlayerIndex !== player.index && (
                        <>
                          <button
                            onClick={() => {
                              setEditingPlayerIndex(player.index);
                              setEditingPlayerName(player.name);
                            }}
                            className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 hover:bg-indigo-500/20 transition-all duration-200 cursor-pointer"
                            title="Edit name"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRemovePlayer(player.index, player.name)}
                            className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 hover:bg-rose-500/20 transition-all duration-200 cursor-pointer"
                            title="Remove player"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* TAB: TEAMS                                  */}
      {/* ═══════════════════════════════════════════ */}
      {activeTab === 'teams' && (
        <div className="space-y-8">
          {/* Add Team Form */}
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Team
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTeam()}
                placeholder="Team name..."
                className="flex-1 bg-slate-950/60 border border-white/10 focus:border-purple-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
              />
              <button
                onClick={handleAddTeam}
                disabled={!newTeamName.trim()}
                className="px-6 py-2.5 rounded-xl bg-linear-to-r from-purple-500 to-pink-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none cursor-pointer"
              >
                Add Team
              </button>
            </div>
          </div>

          {/* Teams Grid */}
          {teams.length === 0 ? (
            <div className="bg-slate-900/20 border border-white/10 rounded-2xl px-6 py-16 text-center">
              <svg className="w-12 h-12 mx-auto text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-slate-600 text-sm">No teams created yet. Add your first team above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {teams.map((team, idx) => (
                <div key={team.index} className="relative group bg-slate-900/30 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-linear-to-r ${teamColors[idx % teamColors.length]} opacity-60`}></div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 mr-2">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold font-mono">Team {team.index}</span>
                      {editingTeamIndex === team.index ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="text"
                            value={editingTeamName}
                            onChange={(e) => setEditingTeamName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveTeamName(team.index);
                              if (e.key === 'Escape') setEditingTeamIndex(null);
                            }}
                            className="w-full bg-slate-950 border border-purple-500/50 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveTeamName(team.index)}
                            className="shrink-0 w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 cursor-pointer text-xs font-bold"
                            title="Save name"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setEditingTeamIndex(null)}
                            className="shrink-0 w-6 h-6 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-slate-700 cursor-pointer text-xs font-bold"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <h3 className="text-lg font-bold text-white mt-1">{team['team-name']}</h3>
                      )}
                    </div>
                    {editingTeamIndex !== team.index && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingTeamIndex(team.index);
                            setEditingTeamName(team['team-name']);
                          }}
                          className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 hover:bg-indigo-500/20 transition-all duration-200 cursor-pointer"
                          title="Edit name"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRemoveTeam(team.index, team['team-name'])}
                          className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 hover:bg-rose-500/20 transition-all duration-200 cursor-pointer"
                          title="Remove team"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Show drafted players if any */}
                  {draftResults[team.index] && draftResults[team.index].length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                      {draftResults[team.index].map((player, pIdx) => (
                        <div key={player.index} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-mono">#{String(player.index).padStart(2, '0')}</span>
                            <span className={`text-slate-300 ${pIdx === 0 ? 'font-bold' : ''}`}>
                              {player.name} {pIdx === 0 && <span className="text-amber-400 text-[10px]">(C)</span>}
                            </span>
                          </div>
                          {posBadge(player.position)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* ═══════════════════════════════════════════ */}
      {/* TAB: LOTTERY                                */}
      {/* ═══════════════════════════════════════════ */}
      {activeTab === 'lottery' && (
        <AdminLottery />
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* TAB: SLOTS                                  */}
      {/* ═══════════════════════════════════════════ */}
      {activeTab === 'slots' && (
        <SlotManager />
      )}

      </div>
    </>
  )
}

export default Admin