import { useState, useEffect } from 'react'
import AdminLottery from './AdminLottery';
import SlotManager from './SlotManager';
import MatchManager from '../components/MatchManager'; 
import API_BASE from '../api';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('players');

  // ─── Player Management State ───
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPosition, setNewPlayerPosition] = useState('FW');
  const [editingPlayerIndex, setEditingPlayerIndex] = useState(null);
  const [editingPlayerName, setEditingPlayerName] = useState('');
  const [editingPlayerPosition, setEditingPlayerPosition] = useState('FW');

  // ─── Team Management State ───
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [editingTeamIndex, setEditingTeamIndex] = useState(null);
  const [editingTeamName, setEditingTeamName] = useState('');

  // ─── Lottery Draft State ───
  const [draftResults, setDraftResults] = useState({});

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
        if (teamsData.success) setTeams(teamsData.teams);

        if (lotteryRes) {
          const lotteryData = await lotteryRes.json();
          if (lotteryData.success && lotteryData.state) {
            setDraftResults(lotteryData.state.draftResults || {});
          }
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
      const res = await fetch(`${API_BASE}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPlayerName.trim(), position: newPlayerPosition }),
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
    }
  };

  const handleRemovePlayer = async (index, playerName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete player "${playerName}"?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_BASE}/players/${index}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setPlayers(prev => prev.filter(p => p.index !== index));
      } else {
        alert(data.message || "Failed to remove player");
      }
    } catch (err) {
      console.error("Error deleting player:", err);
    }
  };

  const handleSavePlayer = async (index) => {
    if (!editingPlayerName.trim()) return;
    const originalPlayer = players.find(p => p.index === index);
    if (originalPlayer && originalPlayer.name === editingPlayerName.trim() && originalPlayer.position === editingPlayerPosition) {
      setEditingPlayerIndex(null);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/players/${index}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingPlayerName.trim(), position: editingPlayerPosition }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setPlayers(prev => prev.map(p => p.index === index ? data.player : p));
        setEditingPlayerIndex(null);
      }
    } catch (err) {
      console.error("Error updating player name:", err);
    }
  };

  // ─── Team Handlers ───
  const handleAddTeam = async () => {
    if (!newTeamName.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "team-name": newTeamName.trim() }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setTeams(prev => [...prev, data.team]);
        setNewTeamName('');
      }
    } catch (err) {
      console.error("Error adding team:", err);
    }
  };

  const handleRemoveTeam = async (index, teamName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete team "${teamName}"?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_BASE}/teams/${index}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setTeams(prev => prev.filter(t => t.index !== index));
      }
    } catch (err) {
      console.error("Error deleting team:", err);
    }
  };

  const handleSaveTeamName = async (index) => {
    if (!editingTeamName.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/teams/${index}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "team-name": editingTeamName.trim() }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setTeams(prev => prev.map(t => t.index === index ? data.team : t));
        setEditingTeamIndex(null);
      }
    } catch (err) {
      console.error("Error updating team name:", err);
    }
  };

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
    { id: 'matches', label: 'Match Manager', icon: (
      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )},
  ];

  const teamColors = [
    'from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-amber-500 to-orange-500',
    'from-emerald-500 to-teal-500', 'from-rose-500 to-red-500', 'from-indigo-500 to-violet-500'
  ];

  return (
    <div className="min-h-screen text-slate-50 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Container */}
      <div className="text-center md:text-left mb-10 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <span className="text-indigo-400 font-semibold tracking-wider text-sm uppercase">Organizer Dashboard</span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-2">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-200 via-purple-300 to-indigo-100 antialiased" style={{ WebkitTextFillColor: 'transparent' }}>
            Admin Panel
          </span>
        </h1>
      </div>

      {/* Navigation Tab Menu Element Bar */}
      <div className="flex p-1 bg-slate-900/60 border border-white/5 rounded-xl gap-1 mb-10 max-w-2xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── TAB Content Panels ─── */}
      {activeTab === 'players' && (
        <div className="space-y-8">
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">Add New Player</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                placeholder="Player name..."
                className="flex-1 bg-slate-950/60 border border-white/10 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"
              />
              <select
                value={newPlayerPosition}
                onChange={(e) => setNewPlayerPosition(e.target.value)}
                className="bg-slate-950/60 border border-white/10 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="FW">Forward (FW)</option>
                <option value="DF">Defender (DF)</option>
                <option value="GK">Goalkeeper (GK)</option>
              </select>
              <button onClick={handleAddPlayer} disabled={!newPlayerName.trim()} className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white font-semibold text-sm disabled:opacity-40 cursor-pointer">
                Add Player
              </button>
            </div>
          </div>

          <div className="bg-slate-900/20 border border-white/10 rounded-2xl overflow-hidden">
            <div className="divide-y divide-white/5">
              {players.map((player) => (
                <div key={player.index} className="flex items-center justify-between px-6 py-3.5 group hover:bg-white/2 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-slate-600 w-8">#{String(player.index).padStart(2, '0')}</span>
                    {editingPlayerIndex === player.index ? (
                      <div className="flex items-center gap-2">
                        <input type="text" value={editingPlayerName} onChange={(e) => setEditingPlayerName(e.target.value)} className="bg-slate-950 border border-indigo-500/50 rounded px-2 py-1 text-xs text-white" />
                        <select value={editingPlayerPosition} onChange={(e) => setEditingPlayerPosition(e.target.value)} className="bg-slate-950 border border-indigo-500/50 rounded px-2 py-1 text-xs text-white">
                          <option value="FW">FW</option><option value="DF">DF</option><option value="GK">GK</option>
                        </select>
                        <button onClick={() => handleSavePlayer(player.index)} className="text-emerald-400 font-bold px-1 cursor-pointer">✓</button>
                        <button onClick={() => setEditingPlayerIndex(null)} className="text-slate-400 font-bold px-1 cursor-pointer">✕</button>
                      </div>
                    ) : (
                      <span className="font-semibold text-sm text-slate-200">{player.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {posBadge(player.position)}
                    {editingPlayerIndex !== player.index && (
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button 
                          onClick={() => { setEditingPlayerIndex(player.index); setEditingPlayerName(player.name); setEditingPlayerPosition(player.position || 'FW'); }} 
                          className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 hover:bg-indigo-50 hover:text-white transition-all duration-200 cursor-pointer"
                          title="Edit Player"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleRemovePlayer(player.index, player.name)} 
                          className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-200 cursor-pointer"
                          title="Remove Player"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'teams' && (
        <div className="space-y-8">
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <h2 className="text-xl font-bold text-white mb-6">Add New Team</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input type="text" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="Team name..." className="flex-1 bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none" />
              <button onClick={handleAddTeam} disabled={!newTeamName.trim()} className="px-6 py-2.5 rounded-xl bg-purple-500 text-white font-semibold text-sm disabled:opacity-40 cursor-pointer">Add Team</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {teams.map((team, idx) => (
              <div key={team.index} className="relative group bg-slate-900/30 border border-white/10 rounded-2xl p-6 overflow-hidden hover:border-white/20 transition-all duration-300">
                <div className={`absolute top-0 left-0 w-full h-1 bg-linear-to-r ${teamColors[idx % teamColors.length]} opacity-60`}></div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-500 font-mono">Team {team.index}</span>
                    {editingTeamIndex === team.index ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input type="text" value={editingTeamName} onChange={(e) => setEditingTeamName(e.target.value)} className="w-full bg-slate-950 border border-purple-500/50 rounded px-2 py-1 text-xs text-white" />
                        <button onClick={() => handleSaveTeamName(team.index)} className="text-emerald-400 font-bold cursor-pointer">✓</button>
                        <button onClick={() => setEditingTeamIndex(null)} className="text-slate-400 font-bold cursor-pointer">✕</button>
                      </div>
                    ) : (
                      <h3 className="text-lg font-bold text-white mt-1">{team['team-name']}</h3>
                    )}
                  </div>
                  {editingTeamIndex !== team.index && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button 
                        onClick={() => { setEditingTeamIndex(team.index); setEditingTeamName(team['team-name']); }} 
                        className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 hover:bg-indigo-50 hover:text-white transition-all duration-200 cursor-pointer"
                        title="Edit Team Name"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleRemoveTeam(team.index, team['team-name'])} 
                        className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-200 cursor-pointer"
                        title="Delete Team"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'lottery' && <AdminLottery />}
      {activeTab === 'slots' && <SlotManager />}
      {activeTab === 'matches' && <MatchManager />}
    </div>
  );
};

export default Admin;