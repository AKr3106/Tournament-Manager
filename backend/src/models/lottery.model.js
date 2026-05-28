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
                type: mongoose.Schema.Types.Mixed,
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
            of: [mongoose.Schema.Types.Mixed],
            default: {},
        },
        draftLog: [
            {
                player: String,
                team: String,
                timestamp: { type: Date, default: Date.now }
            }
        ],
        currentPick: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        draftPool: [mongoose.Schema.Types.Mixed],
    },
    {
        timestamps: true,
    }
);

const Lottery = mongoose.model("Lottery", lotterySchema);

export default Lottery;
