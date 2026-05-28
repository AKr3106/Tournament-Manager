import Slot from "../models/slot.model.js";

// @desc    Get all slots
// @route   GET /api/slots
// @access  Protected
export const getSlots = async (req, res) => {
    try {
        const slots = await Slot.find({}).sort({ index: 1 });
        res.status(200).json({
            success: true,
            slots,
        });
    } catch (error) {
        console.error("Error fetching slots:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch slots",
            error: error.message,
        });
    }
};

// @desc    Create a new slot
// @route   POST /api/slots
// @access  Protected (Admin only)
export const createSlot = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Please provide a slot name",
            });
        }

        const lastSlot = await Slot.findOne().sort({ index: -1 });
        const nextIndex = lastSlot ? lastSlot.index + 1 : 1;

        const slot = await Slot.create({
            index: nextIndex,
            name: name.trim(),
            players: [],
            status: "pending"
        });

        res.status(201).json({
            success: true,
            slot,
        });
    } catch (error) {
        console.error("Error creating slot:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create slot",
            error: error.message,
        });
    }
};

// @desc    Update a slot (name or players)
// @route   PUT /api/slots/:index
// @access  Protected (Admin only)
export const updateSlot = async (req, res) => {
    try {
        const { index } = req.params;
        const { name, players, status } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (players !== undefined) updateData.players = players;
        if (status !== undefined) updateData.status = status;

        const slot = await Slot.findOneAndUpdate(
            { index: Number(index) },
            updateData,
            { new: true }
        );

        if (!slot) {
            return res.status(404).json({
                success: false,
                message: `Slot with index ${index} not found`,
            });
        }

        res.status(200).json({
            success: true,
            slot,
        });
    } catch (error) {
        console.error("Error updating slot:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update slot",
            error: error.message,
        });
    }
};

// @desc    Delete a slot
// @route   DELETE /api/slots/:index
// @access  Protected (Admin only)
export const deleteSlot = async (req, res) => {
    try {
        const { index } = req.params;

        const slot = await Slot.findOneAndDelete({ index: Number(index) });

        if (!slot) {
            return res.status(404).json({
                success: false,
                message: `Slot with index ${index} not found`,
            });
        }

        res.status(200).json({
            success: true,
            message: "Slot deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting slot:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete slot",
            error: error.message,
        });
    }
};
