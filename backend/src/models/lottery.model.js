import mongoose from "mongoose";

const lotterySchema = new mongoose.Schema(
    {
        status: {
            type: String,
            required: true,
            enum: ["idle", "setup", "running", "complete"],
            default: "idle",
        },
        selectedPlayers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Player'
            }
        ],
        selectedTeams: [
            {
                type: mongoose.Schema.Types.Mixed,
            }
        ],
        playersPerTeam: {
            type: Number,
            default: 0,
        },
        draftResults: {
            type: Map,
            of: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
            default: {},
        },
        draftLog: [
            {
                player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
                team: String,
                timestamp: { type: Date, default: Date.now }
            }
        ],
        currentPick: {
            type: {
                player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
                team: mongoose.Schema.Types.Mixed
            },
            default: null
        },
        draftPool: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
    },
    {
        timestamps: true,
    }
);

const Lottery = mongoose.model("Lottery", lotterySchema);

export default Lottery;
