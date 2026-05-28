import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
    {
        index: {
            type: Number,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: [true, "Player name is required"],
            trim: true,
        },
        position: {
            type: String,
            required: [true, "Position is required"],
            enum: ["FW", "DF", "GK"],
        },
    },
    {
        timestamps: true,
    }
);

const Player = mongoose.model("Player", playerSchema);

export default Player;
