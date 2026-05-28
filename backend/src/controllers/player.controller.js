import Player from "../models/players.model.js";

// @desc    Get all players
// @route   GET /api/players
// @access  Public
export const getPlayers = async (req, res) => {
    try {
        const players = await Player.find({}).sort({ index: 1 });
        res.status(200).json({
            success: true,
            players,
        });
    } catch (error) {
        console.error("Error fetching players:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch players",
            error: error.message,
        });
    }
};

// @desc    Create a new player
// @route   POST /api/players
// @access  Protected (Admin only)
export const createPlayer = async (req, res) => {
    try {
        const { name, position } = req.body;

        if (!name || !position) {
            return res.status(400).json({
                success: false,
                message: "Please provide both name and position",
            });
        }

        // Auto-calculate the next sequential index
        const lastPlayer = await Player.findOne().sort({ index: -1 });
        const nextIndex = lastPlayer ? lastPlayer.index + 1 : 1;

        const player = await Player.create({
            index: nextIndex,
            name: name.trim(),
            position,
        });

        res.status(201).json({
            success: true,
            player,
        });
    } catch (error) {
        console.error("Error creating player:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create player",
            error: error.message,
        });
    }
};

// @desc    Delete a player by sequential index
// @route   DELETE /api/players/:index
// @access  Protected (Admin only)
export const deletePlayer = async (req, res) => {
    try {
        const { index } = req.params;

        const player = await Player.findOneAndDelete({ index: Number(index) });

        if (!player) {
            return res.status(404).json({
                success: false,
                message: `Player with index ${index} not found`,
            });
        }

        res.status(200).json({
            success: true,
            message: "Player deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting player:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete player",
            error: error.message,
        });
    }
};

// @desc    Update a player by sequential index
// @route   PUT /api/players/:index
// @access  Protected (Admin only)
export const updatePlayer = async (req, res) => {
    try {
        const { index } = req.params;
        const { name, position } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Please provide a name",
            });
        }

        const updateData = { name: name.trim() };
        if (position) {
            updateData.position = position;
        }

        const player = await Player.findOneAndUpdate(
            { index: Number(index) },
            updateData,
            { new: true }
        );

        if (!player) {
            return res.status(404).json({
                success: false,
                message: `Player with index ${index} not found`,
            });
        }

        res.status(200).json({
            success: true,
            player,
        });
    } catch (error) {
        console.error("Error updating player:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update player",
            error: error.message,
        });
    }
};
