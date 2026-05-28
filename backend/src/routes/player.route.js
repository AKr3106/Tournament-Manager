import express from "express";
import { getPlayers, createPlayer, deletePlayer, updatePlayer } from "../controllers/player.controller.js";
import { protect, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getPlayers);
router.post("/", protect, admin, createPlayer);
router.put("/:index", protect, admin, updatePlayer);
router.delete("/:index", protect, admin, deletePlayer);

export default router;
