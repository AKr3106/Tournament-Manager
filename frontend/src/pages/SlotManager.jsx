import React, { useState, useEffect } from 'react';

const SlotManager = () => {
    const [slots, setSlots] = useState([]);
    const [players, setPlayers] = useState([]);
    const [newSlotName, setNewSlotName] = useState('');
    const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);

    // Fetch slots and players
    const fetchData = async () => {
        try {
            const slotsRes = await fetch("http://localhost:3000/api/slots", { credentials: "include" });
            const slotsData = await slotsRes.json();
            if (slotsData.success) {
                setSlots(slotsData.slots);
            }

            const playersRes = await fetch("http://localhost:3000/api/players", { credentials: "include" });
            const playersData = await playersRes.json();
            if (playersData.success) {
                setPlayers(playersData.players);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateSlot = async () => {
        if (!newSlotName.trim()) return;
        try {
            const res = await fetch("http://localhost:3000/api/slots", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newSlotName }),
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) {
                setSlots([...slots, data.slot]);
                setNewSlotName('');
            } else {
                alert(data.message || "Failed to create slot");
            }
        } catch (error) {
            console.error("Error creating slot:", error);
        }
    };

    const handleDeleteSlot = async (index) => {
        if (!window.confirm("Are you sure you want to delete this slot?")) return;
        try {
            const res = await fetch(`http://localhost:3000/api/slots/${index}`, {
                method: "DELETE",
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) {
                setSlots(slots.filter(s => s.index !== index));
                if (selectedSlotIndex === index) {
                    setSelectedSlotIndex(null);
                }
            } else {
                alert(data.message || "Failed to delete slot");
            }
        } catch (error) {
            console.error("Error deleting slot:", error);
        }
    };

    const handleAssignPlayer = async (player) => {
        if (selectedSlotIndex === null) {
            alert("Please select a slot first");
            return;
        }

        const slot = slots.find(s => s.index === selectedSlotIndex);
        if (!slot) return;

        const updatedPlayers = [...slot.players, player];

        try {
            const res = await fetch(`http://localhost:3000/api/slots/${selectedSlotIndex}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ players: updatedPlayers }),
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) {
                setSlots(slots.map(s => s.index === selectedSlotIndex ? data.slot : s));
            } else {
                alert(data.message || "Failed to update slot");
            }
        } catch (error) {
            console.error("Error assigning player:", error);
        }
    };

    const handleRemovePlayer = async (playerIndex) => {
        if (selectedSlotIndex === null) return;
        
        const slot = slots.find(s => s.index === selectedSlotIndex);
        if (!slot) return;

        const updatedPlayers = slot.players.filter(p => p.index !== playerIndex);

        try {
            const res = await fetch(`http://localhost:3000/api/slots/${selectedSlotIndex}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ players: updatedPlayers }),
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) {
                setSlots(slots.map(s => s.index === selectedSlotIndex ? data.slot : s));
            } else {
                alert(data.message || "Failed to update slot");
            }
        } catch (error) {
            console.error("Error removing player:", error);
        }
    };

    // Calculate unassigned players
    const assignedPlayerIds = slots.flatMap(s => s.players.map(p => p.index));
    const unassignedPlayers = players.filter(p => !assignedPlayerIds.includes(p.index));

    const selectedSlot = slots.find(s => s.index === selectedSlotIndex);

    // Helper for position badge
    const posBadge = (pos) => {
        const styles = {
            FW: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            DF: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            GK: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        };
        return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${styles[pos] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                {pos}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-200">Slot Manager</h2>
                    <p className="text-sm text-slate-400">Group players into slots for the draft lottery</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Slots List & Creation */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                        <h3 className="font-semibold text-slate-300 mb-3">Create Slot</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSlotName}
                                onChange={(e) => setNewSlotName(e.target.value)}
                                placeholder="e.g. Marquee Players"
                                className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500"
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateSlot()}
                            />
                            <button
                                onClick={handleCreateSlot}
                                disabled={!newSlotName.trim()}
                                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 max-h-[500px] overflow-y-auto custom-scrollbar">
                        <h3 className="font-semibold text-slate-300 mb-3">Available Slots ({slots.length})</h3>
                        {slots.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-4">No slots created yet</p>
                        ) : (
                            <div className="space-y-2">
                                {slots.map(slot => (
                                    <div 
                                        key={slot.index}
                                        onClick={() => setSelectedSlotIndex(slot.index)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${
                                            selectedSlotIndex === slot.index 
                                                ? 'bg-blue-500/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                                                : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-600'
                                        }`}
                                    >
                                        <div>
                                            <div className="font-medium text-slate-200">{slot.name}</div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                {slot.players.length} players • {slot.status}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteSlot(slot.index); }}
                                            className="text-slate-500 hover:text-red-400 p-1"
                                            title="Delete Slot"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle Column: Selected Slot Players */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 h-full flex flex-col">
                        <div className="mb-4">
                            <h3 className="font-semibold text-slate-300">
                                {selectedSlot ? `${selectedSlot.name} Players (${selectedSlot.players.length})` : 'Select a slot'}
                            </h3>
                            {selectedSlot && (
                                <p className="text-xs text-slate-400 mt-1">Click a player to remove them from this slot</p>
                            )}
                        </div>

                        {!selectedSlot ? (
                            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                                Select a slot from the left to view/edit its players.
                            </div>
                        ) : selectedSlot.players.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm border-2 border-dashed border-slate-700/50 rounded-xl">
                                No players assigned to this slot yet.
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                                {selectedSlot.players.map(player => (
                                    <div 
                                        key={player.index}
                                        onClick={() => handleRemovePlayer(player.index)}
                                        className="bg-slate-900/50 border border-slate-700/50 p-2 rounded-lg flex items-center justify-between cursor-pointer hover:bg-red-500/10 hover:border-red-500/30 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-500 font-mono text-xs">#{String(player.index).padStart(2, '0')}</span>
                                            <span className="text-slate-300 text-sm">{player.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {posBadge(player.position)}
                                            <svg className="w-4 h-4 text-slate-600 group-hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Unassigned Players */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 h-full flex flex-col">
                        <div className="mb-4">
                            <h3 className="font-semibold text-slate-300">Unassigned Players ({unassignedPlayers.length})</h3>
                            <p className="text-xs text-slate-400 mt-1">Click a player to add to selected slot</p>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                            {unassignedPlayers.map(player => (
                                <div 
                                    key={player.index}
                                    onClick={() => handleAssignPlayer(player)}
                                    className={`bg-slate-900/50 border border-slate-700/50 p-2 rounded-lg flex items-center justify-between transition-colors ${
                                        selectedSlot 
                                            ? 'cursor-pointer hover:bg-emerald-500/10 hover:border-emerald-500/30' 
                                            : 'opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-500 font-mono text-xs">#{String(player.index).padStart(2, '0')}</span>
                                        <span className="text-slate-300 text-sm">{player.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {posBadge(player.position)}
                                        {selectedSlot && (
                                            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SlotManager;