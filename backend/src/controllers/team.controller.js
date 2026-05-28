import Team from "../models/teams.model.js";

// @desc    Get all teams
// @route   GET /api/teams
// @access  Public
export const getTeams = async (req, res) => {
    try {
        const teams = await Team.find({}).sort({ index: 1 });
        
        // Format teams to match frontend "team-name" key expectation
        const formattedTeams = teams.map(t => ({
            index: t.index,
            "team-name": t.teamName,
            _id: t._id,
            createdAt: t.createdAt,
        }));

        res.status(200).json({
            success: true,
            teams: formattedTeams,
        });
    } catch (error) {
        console.error("Error fetching teams:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch teams",
            error: error.message,
        });
    }
};

// @desc    Create a new team
// @route   POST /api/teams
// @access  Protected (Admin only)
export const createTeam = async (req, res) => {
    try {
        // Accept both teamName and team-name from body
        const teamNameVal = req.body.teamName || req.body["team-name"];

        if (!teamNameVal) {
            return res.status(400).json({
                success: false,
                message: "Please provide a team name",
            });
        }

        // Auto-calculate the next sequential index
        const lastTeam = await Team.findOne().sort({ index: -1 });
        const nextIndex = lastTeam ? lastTeam.index + 1 : 1;

        const team = await Team.create({
            index: nextIndex,
            teamName: teamNameVal.trim(),
        });

        // Format response
        const formattedTeam = {
            index: team.index,
            "team-name": team.teamName,
            _id: team._id,
        };

        res.status(201).json({
            success: true,
            team: formattedTeam,
        });
    } catch (error) {
        console.error("Error creating team:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create team",
            error: error.message,
        });
    }
};

// @desc    Delete a team by sequential index
// @route   DELETE /api/teams/:index
// @access  Protected (Admin only)
export const deleteTeam = async (req, res) => {
    try {
        const { index } = req.params;

        const team = await Team.findOneAndDelete({ index: Number(index) });

        if (!team) {
            return res.status(404).json({
                success: false,
                message: `Team with index ${index} not found`,
            });
        }

        res.status(200).json({
            success: true,
            message: "Team deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting team:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete team",
            error: error.message,
        });
    }
};

// @desc    Update a team by sequential index
// @route   PUT /api/teams/:index
// @access  Protected (Admin only)
export const updateTeam = async (req, res) => {
    try {
        const { index } = req.params;
        const teamNameVal = req.body.teamName || req.body["team-name"];

        if (!teamNameVal) {
            return res.status(400).json({
                success: false,
                message: "Please provide a team name",
            });
        }

        const team = await Team.findOneAndUpdate(
            { index: Number(index) },
            { teamName: teamNameVal.trim() },
            { new: true }
        );

        if (!team) {
            return res.status(404).json({
                success: false,
                message: `Team with index ${index} not found`,
            });
        }

        // Format response
        const formattedTeam = {
            index: team.index,
            "team-name": team.teamName,
            _id: team._id,
        };

        res.status(200).json({
            success: true,
            team: formattedTeam,
        });
    } catch (error) {
        console.error("Error updating team:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update team",
            error: error.message,
        });
    }
};
