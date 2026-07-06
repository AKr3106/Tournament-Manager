import express from "express";
import { Fixture } from "../models/fixture.model.js";

const router = express.Router();

// Define default structure for a new season
const DEFAULT_MATCHES = [
    { id: "Match 1", shortId: "M1", team1: "Team 1", team2: "Team 3" },
    { id: "Match 2", shortId: "M2", team1: "Team 2", team2: "Team 4" },
    { id: "Match 3", shortId: "M3", team1: "Team 3", team2: "Team 5" },
    { id: "Match 4", shortId: "M4", team1: "Team 4", team2: "Team 6" },
    { id: "Match 5", shortId: "M5", team1: "Team 5", team2: "Team 1" },
    { id: "Match 6", shortId: "M6", team1: "Team 6", team2: "Team 2" },
    { id: "Semifinal 1", shortId: "SF 1", team1: "Winner M1", team2: "Winner M2" },
    { id: "Semifinal 2", shortId: "SF 2", team1: "Winner M3", team2: "Winner M4" },
    { id: "Grand Final", shortId: "FINAL", team1: "Winner SF1", team2: "Winner SF2" }
];

// GET /api/fixtures/:season
router.get("/:season", async (req, res) => {
    try {
        const { season } = req.params;
        let fixtures = await Fixture.find({ season });

        // If no fixtures exist for this season, or it's missing the new M5/M6 matches, create them
        if (fixtures.length < DEFAULT_MATCHES.length) {
            for (const match of DEFAULT_MATCHES) {
                const exists = fixtures.find(f => f.id === match.id);
                if (!exists) {
                    const newMatch = await Fixture.create({ ...match, season });
                    fixtures.push(newMatch);
                }
            }
        }

        res.status(200).json({ success: true, data: fixtures });
    } catch (error) {
        console.error("Error fetching fixtures:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// POST /api/fixtures/update
router.post("/update", async (req, res) => {
    try {
        const { season, id, ...updateData } = req.body;
        
        if (!season || !id) {
            return res.status(400).json({ success: false, message: "Missing season or match id" });
        }

        const fixture = await Fixture.findOneAndUpdate(
            { season, id },
            { $set: updateData },
            { new: true, upsert: true } // Create if doesn't exist just in case
        );

        res.status(200).json({ success: true, data: fixture });
    } catch (error) {
        console.error("Error updating fixture:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

export default router;
