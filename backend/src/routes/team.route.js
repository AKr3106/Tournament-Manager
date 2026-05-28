import express from "express";
import { getTeams, createTeam, deleteTeam, updateTeam } from "../controllers/team.controller.js";
import { protect, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getTeams);
router.post("/", protect, admin, createTeam);
router.put("/:index", protect, admin, updateTeam);
router.delete("/:index", protect, admin, deleteTeam);

export default router;
