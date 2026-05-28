import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
    {
        index: {
            type: Number,
            required: true,
            unique: true,
        },
        teamName: {
            type: String,
            required: [true, "Team name is required"],
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Team = mongoose.model("Team", teamSchema);

export default Team;
