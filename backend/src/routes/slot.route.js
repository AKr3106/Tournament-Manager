import express from "express";
import { getSlots, createSlot, updateSlot, deleteSlot } from "../controllers/slot.controller.js";
import { protect, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getSlots);
router.post("/", protect, admin, createSlot);
router.put("/:index", protect, admin, updateSlot);
router.delete("/:index", protect, admin, deleteSlot);

export default router;
