import express from "express";
import {
    getLotteryState,
    setupLottery,
    startLottery,
    drawNextPlayer,
    resetLottery,
    loadSlot
} from "../controllers/lottery.controller.js";
import { protect, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/state", protect, getLotteryState);
router.post("/setup", protect, admin, setupLottery);
router.post("/start", protect, admin, startLottery);
router.post("/draw", protect, admin, drawNextPlayer);
router.post("/reset", protect, admin, resetLottery);
router.post("/load-slot", protect, admin, loadSlot);

export default router;
