import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Slot name is required"],
            trim: true,
        },
        index: {
            type: Number,
            required: true,
            unique: true,
        },
        players: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Player'
            }
        ],
        status: {
            type: String,
            enum: ["pending", "completed"],
            default: "pending"
        }
    },
    {
        timestamps: true,
    }
);

const Slot = mongoose.model("Slot", slotSchema);

export default Slot;
