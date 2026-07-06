import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
    scorer: { type: String, required: true },
    assist: { type: String, default: "" }
}, { _id: false });

const fixtureSchema = new mongoose.Schema({
    season: {
        type: String,
        required: true,
        index: true
    },
    id: {
        type: String,
        required: true
    },
    shortId: {
        type: String,
        default: ""
    },
    team1: {
        type: String,
        default: ""
    },
    team2: {
        type: String,
        default: ""
    },
    score1: {
        type: String,
        default: ""
    },
    score2: {
        type: String,
        default: ""
    },
    penaltyScore1: {
        type: String,
        default: ""
    },
    penaltyScore2: {
        type: String,
        default: ""
    },
    coinTossWinner: {
        type: String,
        default: ""
    },
    motm: {
        type: String,
        default: ""
    },
    goals: {
        type: [goalSchema],
        default: []
    }
}, { timestamps: true });

// Prevent duplicate matches per season
fixtureSchema.index({ season: 1, id: 1 }, { unique: true });

export const Fixture = mongoose.model("Fixture", fixtureSchema);
