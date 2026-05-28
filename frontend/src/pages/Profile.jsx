import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerCard from '../components/PlayerCard';

const Profile = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return parsed.name || '';
      } catch {
        return '';
      }
    }
    return '';
  });
  const [editPlayerName, setEditPlayerName] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return parsed.playerName || '';
      } catch {
        return '';
      }
    }
    return '';
  });
  const [editPhone, setEditPhone] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return parsed.phonenumber || '';
      } catch {
        return '';
      }
    }
    return '';
  });
  const [editMyTeam, setEditMyTeam] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return parsed.myTeam || '';
      } catch {
        return '';
      }
    }
    return '';
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    const fetchData = async () => {
      try {
        const [playersRes, teamsRes] = await Promise.all([
          fetch("http://localhost:3000/api/players"),
          fetch("http://localhost:3000/api/teams")
        ]);
        const playersData = await playersRes.json();
        const teamsData = await teamsRes.json();

        if (playersData.success) {
          setPlayers(playersData.players);
        }
        if (teamsData.success) {
          setTeams(teamsData.teams);
        }
      } catch (err) {
        console.error("Error fetching profile details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          phonenumber: editPhone.trim(),
          playerName: editPlayerName.trim(),
          myTeam: editMyTeam.trim()
        }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Error updating profile details");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-slate-400 text-sm font-semibold">Loading Profile...</span>
        </div>
      </div>
    );
  }

  // Find player matching current user's playerName
  const pName = currentUser?.playerName || '';
  const matchedPlayer = players.find(p => p.name.toLowerCase().trim() === pName.toLowerCase().trim());

  // Determine Season 1 team (calculated by static chunk slices of 5 players per team)
  let season1Team = null;
  let isSeason1Captain = false;
  if (matchedPlayer) {
    const sortedPlayers = [...players].sort((a, b) => a.index - b.index);
    const playerIdx = sortedPlayers.findIndex(p => p.index === matchedPlayer.index);
    if (playerIdx !== -1 && teams.length > 0) {
      const teamIdx = Math.floor(playerIdx / 5);
      if (teamIdx >= 0 && teamIdx < teams.length) {
        season1Team = teams[teamIdx]['team-name'];
      }
      isSeason1Captain = [1, 6, 11, 16, 21, 26].includes(matchedPlayer.index);
    }
  }

  // Determine Season 2 team (retrieved from localStorage 'rkm_admin_draft')
  let season2Team = null;
  let isSeason2Captain = false;
  if (matchedPlayer && teams.length > 0) {
    const savedDraft = localStorage.getItem('rkm_admin_draft');
    if (savedDraft) {
      try {
        const draftResults = JSON.parse(savedDraft);
        const teamIdx = Object.keys(draftResults).find(tIdx => {
          const teamPlayers = draftResults[tIdx] || [];
          return teamPlayers.some(p => p.index === matchedPlayer.index);
        });
        if (teamIdx) {
          const teamObj = teams.find(t => String(t.index) === String(teamIdx));
          if (teamObj) {
            season2Team = teamObj['team-name'];
            // First player drafted to a team is typically the captain
            const teamPlayers = draftResults[teamIdx] || [];
            if (teamPlayers.length > 0 && teamPlayers[0].index === matchedPlayer.index) {
              isSeason2Captain = true;
            }
          }
        }
      } catch (e) {
        console.error("Error parsing Season 2 draft results:", e);
      }
    }
  }

  return (
    <div className="min-h-screen text-slate-50 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center md:text-left mb-10 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <span className="text-indigo-400 font-semibold tracking-wider text-sm uppercase">User Area</span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-2">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-200 via-purple-300 to-indigo-100 antialiased" style={{ WebkitTextFillColor: 'transparent' }}>
            My Profile
          </span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Side: Account Info */}
        <div className="md:col-span-1 bg-slate-900/40 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-6 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl"></div>
          
          <div className="flex flex-col items-center text-center pb-4 border-b border-white/5">
            <div className="w-20 h-20 rounded-full bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg mb-4">
              {currentUser?.name?.slice(0, 1).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-white">{currentUser?.name}</h2>
            <span className="text-xs text-slate-500 font-mono mt-0.5">Role: {currentUser?.role?.toUpperCase()}</span>
          </div>

          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Email Address</span>
                <span className="text-sm text-slate-200 font-medium break-all">{currentUser?.emailid}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Mobile Number</span>
                <span className="text-sm text-slate-200 font-medium">{currentUser?.phonenumber || 'Not Added'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Player Name Link</span>
                <span className="text-sm text-indigo-400 font-semibold">{currentUser?.playerName || 'None Linked'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">My Team</span>
                <span className="text-sm text-indigo-400 font-semibold">{currentUser?.myTeam || 'Not Selected'}</span>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="w-full mt-2 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white font-semibold text-xs transition-all duration-300 cursor-pointer text-center"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Email (Fixed)</label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.emailid}
                  className="w-full bg-slate-950/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 focus:border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                  placeholder="Enter Username"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Mobile Number</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 focus:border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                  placeholder="10-digit number"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Player Name Link</label>
                <input
                  type="text"
                  required
                  value={editPlayerName}
                  onChange={(e) => setEditPlayerName(e.target.value)}
                  disabled={!!currentUser?.playerName}
                  className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 ${
                    currentUser?.playerName
                      ? 'bg-slate-950/40 border-white/5 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-950 border-white/10 focus:border-indigo-500/50 text-slate-200 focus:ring-indigo-500/30'
                  }`}
                  placeholder="Enter Real Name"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">My Team</label>
                <select
                  value={editMyTeam}
                  onChange={(e) => setEditMyTeam(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 focus:border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                >
                  <option value="">Select a team (optional)</option>
                  {teams.map(t => (
                    <option key={t.index} value={t['team-name']}>{t['team-name']}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold text-xs hover:shadow-md cursor-pointer disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(currentUser.name || '');
                    setEditPlayerName(currentUser.playerName || '');
                    setEditPhone(currentUser.phonenumber || '');
                    setEditMyTeam(currentUser.myTeam || '');
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-950 border border-white/10 text-slate-400 hover:text-white font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Side: Player Card and Tournament Stats */}
        <div className="md:col-span-2 space-y-6">
          {matchedPlayer ? (
            <>
              {/* Linked Player Card */}
              <div className="bg-slate-900/20 border border-white/5 rounded-3xl p-6">
                <h3 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Linked Player Card
                </h3>
                <div className="max-w-xs mx-auto md:mx-0">
                  <PlayerCard player={matchedPlayer} />
                </div>
              </div>

              {/* Tournament History */}
              <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-md relative overflow-hidden">
                <h3 className="text-lg font-bold text-white mb-6">Tournament History</h3>
                <div className="space-y-4">
                  {/* Season 1 Entry */}
                  <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-white/5 rounded-2xl">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-200">RKM Legacy League Season 1</span>
                      <span className="text-xs text-slate-500 mt-0.5">Format: Round Robin League</span>
                    </div>
                    <div className="text-right">
                      {season1Team ? (
                        <div className="flex flex-col items-end">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {season1Team}
                          </span>
                          {season1Team === "Victorious Five" && (
                            <span className="text-[10px] font-extrabold text-amber-400 mt-1 uppercase tracking-wider flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm0 0H4v5a8 8 0 008 8h0a8 8 0 008-8V8h-8z" />
                              </svg>
                              Champion
                            </span>
                          )}
                          {season1Team === "Goal Digger FC" && (
                            <span className="text-[10px] font-extrabold text-slate-300 mt-1 uppercase tracking-wider">
                              🥈 Runner-Up
                            </span>
                          )}
                          {isSeason1Captain && (
                            <span className="text-[9px] font-extrabold text-indigo-300 mt-0.5 uppercase tracking-wider">Captain</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600 italic">Not Participated</span>
                      )}
                    </div>
                  </div>

                  {/* Season 2 Entry */}
                  <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-white/5 rounded-2xl">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-200">RKM Legacy League Season 2</span>
                      <span className="text-xs text-slate-500 mt-0.5">Format: Lottery Draft Draw</span>
                    </div>
                    <div className="text-right">
                      {season2Team ? (
                        <div className="flex flex-col items-end">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {season2Team}
                          </span>
                          {isSeason2Captain && (
                            <span className="text-[9px] font-extrabold text-amber-400 mt-1 uppercase tracking-wider">Captain</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600 italic">Awaiting Draft / Pending</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-900/30 border border-white/10 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center">
              <svg className="w-16 h-16 text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-bold text-slate-400 mb-2">No Player Record Found</h3>
              <p className="text-sm text-slate-600 max-w-md">
                We couldn't find a player named <strong className="text-slate-400">"{pName || 'None Linked'}"</strong> in our tournament draft registry. 
                {pName ? (
                  <span> Please ensure your Player Name is linked correctly and spelled exactly as it appears in the players pool list.</span>
                ) : (
                  <span> Please click "Edit Profile / Link Player" on the left and enter your registered tournament Player Name to link your stats.</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
