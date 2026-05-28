import Lottery from "../models/lottery.model.js";
import Team from "../models/teams.model.js";
import Slot from "../models/slot.model.js";

// Helper to get or create the lottery singleton
const getOrCreateLottery = async () => {
    let state = await Lottery.findOne();
    if (!state) {
        state = await Lottery.create({
            status: "idle",
            selectedPlayers: [],
            selectedTeams: [],
            playersPerTeam: 0,
            draftResults: {},
            draftLog: [],
            currentPick: null,
            draftPool: []
        });
    }
    return state;
};

// @desc    Get current lottery state
// @route   GET /api/lottery/state
// @access  Protected (any logged-in user)
export const getLotteryState = async (req, res) => {
    try {
        const state = await getOrCreateLottery();
        res.status(200).json({
            success: true,
            state
        });
    } catch (error) {
        console.error("Error fetching lottery state:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch lottery state",
            error: error.message
        });
    }
};

// @desc    Setup lottery (selects captains, initializes teams)
// @route   POST /api/lottery/setup
// @access  Protected (Admin only)
export const setupLottery = async (req, res) => {
    try {
        const { selectedPlayers, playersPerTeam, selectedTeams } = req.body;

        if (!selectedPlayers || !Array.isArray(selectedPlayers)) {
            return res.status(400).json({
                success: false,
                message: "Please select players for the lottery pool (captains)"
            });
        }

        const count = Number(playersPerTeam);
        if (isNaN(count) || count <= 0) {
            return res.status(400).json({
                success: false,
                message: "Please specify a valid number of players per team"
            });
        }

        // Get teams to participate
        let teamsToUse = [];
        if (selectedTeams && Array.isArray(selectedTeams) && selectedTeams.length >= 2) {
            teamsToUse = selectedTeams;
        } else {
            // Default to all teams in DB
            const dbTeams = await Team.find({}).sort({ index: 1 });
            teamsToUse = dbTeams.map(t => ({
                index: t.index,
                teamName: t.teamName,
                "team-name": t.teamName,
                _id: t._id
            }));
        }

        if (teamsToUse.length < 2) {
            return res.status(400).json({
                success: false,
                message: "At least 2 teams are required to run the lottery"
            });
        }

        const numTeams = teamsToUse.length;
        if (selectedPlayers.length > 0 && selectedPlayers.length < numTeams) {
            return res.status(400).json({
                success: false,
                message: `Please select at least ${numTeams} players (one captain for each of the ${numTeams} teams) if you want to assign captains.`
            });
        }

        const state = await getOrCreateLottery();
        state.status = "setup";
        state.selectedPlayers = selectedPlayers;
        state.selectedTeams = teamsToUse;
        state.playersPerTeam = count;
        state.draftLog = [];
        state.currentPick = null;
        state.draftPool = []; // Empty pool, waiting for slots

        // Initialize draft results with captains pre-assigned to their teams
        const initialResults = new Map();
        teamsToUse.forEach((t, idx) => {
            const teamIndexStr = String(t.index);
            const teamName = t.teamName || t['team-name'] || `Team ${t.index}`;
            if (selectedPlayers.length > 0) {
                initialResults.set(teamIndexStr, [selectedPlayers[idx]]);
                state.draftLog.push({
                    player: `${selectedPlayers[idx].name} (Captain)`,
                    team: teamName,
                    timestamp: new Date()
                });
            } else {
                initialResults.set(teamIndexStr, []);
            }
        });
        
        state.draftResults = initialResults;

        // Mark all Mixed/Map fields as modified so Mongoose persists them
        state.markModified("selectedPlayers");
        state.markModified("selectedTeams");
        state.markModified("draftPool");
        state.markModified("draftResults");
        state.markModified("draftLog");
        state.markModified("currentPick");

        await state.save();

        res.status(200).json({
            success: true,
            state
        });
    } catch (error) {
        console.error("Error setting up lottery:", error);
        res.status(500).json({
            success: false,
            message: "Failed to set up lottery",
            error: error.message
        });
    }
};

// @desc    Load a slot into the lottery pool
// @route   POST /api/lottery/load-slot
// @access  Protected (Admin only)
export const loadSlot = async (req, res) => {
    try {
        const { slotIndex } = req.body;

        if (slotIndex === undefined) {
            return res.status(400).json({
                success: false,
                message: "Please provide a slot index"
            });
        }

        const slot = await Slot.findOne({ index: Number(slotIndex) });
        if (!slot) {
            return res.status(404).json({
                success: false,
                message: "Slot not found"
            });
        }

        if (!slot.players || slot.players.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Slot has no players assigned"
            });
        }

        const state = await getOrCreateLottery();
        if (state.status === "idle") {
            return res.status(400).json({
                success: false,
                message: "Lottery is not set up. Please set up the lottery first."
            });
        }

        // Shuffle the slot's players
        const shuffledPlayers = [...slot.players].sort(() => Math.random() - 0.5);

        // Append to current pool
        state.draftPool = [...state.draftPool, ...shuffledPlayers];
        state.status = "running";

        // Mark slot as completed
        slot.status = "completed";
        await slot.save();

        state.markModified("draftPool");
        await state.save();

        res.status(200).json({
            success: true,
            state
        });
    } catch (error) {
        console.error("Error loading slot:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load slot",
            error: error.message
        });
    }
};

// @desc    Start lottery
// @route   POST /api/lottery/start
// @access  Protected (Admin only)
export const startLottery = async (req, res) => {
    try {
        const state = await Lottery.findOne();
        if (!state || state.status !== "setup") {
            return res.status(400).json({
                success: false,
                message: "Lottery is not set up. Please set up the lottery first."
            });
        }

        state.status = "running";
        await state.save();

        res.status(200).json({
            success: true,
            state
        });
    } catch (error) {
        console.error("Error starting lottery:", error);
        res.status(500).json({
            success: false,
            message: "Failed to start lottery",
            error: error.message
        });
    }
};

// @desc    Draw next player (round-robin assignment)
// @route   POST /api/lottery/draw
// @access  Protected (Admin only)
export const drawNextPlayer = async (req, res) => {
    try {
        const state = await Lottery.findOne();
        if (!state || state.status !== "running") {
            return res.status(400).json({
                success: false,
                message: "Lottery is not running"
            });
        }

        if (!state.draftPool || state.draftPool.length === 0) {
            // Keep it running but clear the current pick
            state.currentPick = null;
            state.markModified("currentPick");
            await state.save();
            return res.status(200).json({ success: true, state });
        }

        const player = state.draftPool[0];

        // Use selectedTeams from state if present, otherwise fetch from DB
        let teams = [];
        if (state.selectedTeams && Array.isArray(state.selectedTeams) && state.selectedTeams.length >= 2) {
            teams = state.selectedTeams.map(t => ({
                index: t.index,
                teamName: t.teamName || t['team-name'] || `Team ${t.index}`,
                "team-name": t.teamName || t['team-name'] || `Team ${t.index}`,
                _id: t._id
            }));
        } else {
            const dbTeams = await Team.find({}).sort({ index: 1 });
            teams = dbTeams.map(t => ({
                index: t.index,
                teamName: t.teamName,
                "team-name": t.teamName,
                _id: t._id
            }));
        }

        if (teams.length < 2) {
            return res.status(400).json({
                success: false,
                message: "At least 2 teams are required"
            });
        }

        // Round robin: find team with fewest players that still has slots
        const teamOrder = teams
            .map(t => {
                const roster = state.draftResults.get(String(t.index)) || [];
                return {
                    index: t.index,
                    teamName: t.teamName,
                    count: roster.length
                };
            })
            .filter(t => t.count < state.playersPerTeam)
            .sort((a, b) => a.count - b.count || a.index - b.index);

        if (teamOrder.length === 0) {
            state.status = "complete";
            state.currentPick = null;
            state.markModified("currentPick");
            await state.save();
            return res.status(200).json({ success: true, state });
        }

        const targetTeam = teamOrder[0];

        // Remove the drawn player from the pool (reassign whole array so Mongoose sees the change)
        state.draftPool = state.draftPool.slice(1);

        // Add player to the target team's roster
        const currentRoster = state.draftResults.get(String(targetTeam.index)) || [];
        currentRoster.push(player);
        state.draftResults.set(String(targetTeam.index), currentRoster);

        // Log the pick
        state.draftLog.push({
            player: player.name,
            team: targetTeam.teamName,
            timestamp: new Date()
        });

        // Set current pick for live animation
        state.currentPick = {
            player,
            team: {
                index: targetTeam.index,
                "team-name": targetTeam.teamName
            }
        };

        // CRITICAL: mark all Mixed/Map fields as modified so Mongoose saves them
        state.markModified("draftPool");
        state.markModified("draftResults");
        state.markModified("draftLog");
        state.markModified("currentPick");

        await state.save();

        res.status(200).json({ success: true, state });
    } catch (error) {
        console.error("Error drawing player:", error);
        res.status(500).json({
            success: false,
            message: "Failed to draw next player",
            error: error.message
        });
    }
};

// @desc    Reset lottery back to idle
// @route   POST /api/lottery/reset
// @access  Protected (Admin only)
export const resetLottery = async (req, res) => {
    try {
        const state = await getOrCreateLottery();
        state.status = "idle";
        state.selectedPlayers = [];
        state.playersPerTeam = 0;
        state.draftResults = new Map();
        state.draftLog = [];
        state.currentPick = null;
        state.draftPool = [];

        state.markModified("selectedPlayers");
        state.markModified("draftPool");
        state.markModified("draftResults");
        state.markModified("draftLog");
        state.markModified("currentPick");

        await state.save();

        // Also reset all slots to "pending"
        await Slot.updateMany({}, { status: "pending" });

        res.status(200).json({ success: true, state });
    } catch (error) {
        console.error("Error resetting lottery:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reset lottery",
            error: error.message
        });
    }
};
