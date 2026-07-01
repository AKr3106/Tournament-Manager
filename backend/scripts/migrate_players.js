import mongoose from "mongoose";
import dotenv from "dotenv";
import Player from "../src/models/players.model.js";
import Slot from "../src/models/slot.model.js";
import Lottery from "../src/models/lottery.model.js";
import connectDB from "../src/db/db.js";

dotenv.config({ path: ".env" });

const migrate = async () => {
    await connectDB();

    console.log("Fetching all players...");
    const players = await Player.find({});
    
    // Create a mapping from player index and name to ObjectId
    const playerMap = new Map();
    const nameMap = new Map();
    players.forEach(p => {
        playerMap.set(p.index, p._id);
        nameMap.set(p.name, p._id);
    });
    
    // Specifically handle the name mismatch issue:
    const anubhab = players.find(p => p.name === "Anubhab Mandal");
    if (anubhab) {
        nameMap.set("Adwitiya Bandyopadhyay", anubhab._id);
    }

    const getPlayerId = (playerObj) => {
        if (!playerObj) return null;
        if (mongoose.Types.ObjectId.isValid(playerObj)) return playerObj;
        if (playerObj.index !== undefined && playerMap.has(playerObj.index)) {
            return playerMap.get(playerObj.index);
        }
        if (playerObj.name && nameMap.has(playerObj.name)) {
            return nameMap.get(playerObj.name);
        }
        return null;
    };

    console.log("Migrating Slots (Fixtures)...");
    const slots = await Slot.find({});
    for (const slot of slots) {
        let changed = false;
        const newPlayers = [];
        for (const p of slot.players) {
            const pid = getPlayerId(p);
            if (pid && typeof p === 'object' && !mongoose.Types.ObjectId.isValid(p)) {
                newPlayers.push(pid);
                changed = true;
            } else if (mongoose.Types.ObjectId.isValid(p)) {
                 newPlayers.push(p);
            } else {
                 newPlayers.push(p);
            }
        }
        if (changed) {
            await Slot.updateOne({ _id: slot._id }, { $set: { players: newPlayers } });
            console.log(`Updated Slot: ${slot.name}`);
        }
    }

    console.log("Migrating Lotteries...");
    const lotteries = await Lottery.find({});
    for (const lottery of lotteries) {
        let updateRequired = false;
        const updateDoc = { $set: {} };

        if (lottery.selectedPlayers && lottery.selectedPlayers.length > 0) {
            const newSP = lottery.selectedPlayers.map(p => getPlayerId(p) || p);
            if (newSP.some((p, i) => p !== lottery.selectedPlayers[i])) {
                updateDoc.$set.selectedPlayers = newSP;
                updateRequired = true;
            }
        }

        if (lottery.draftPool && lottery.draftPool.length > 0) {
            const newDP = lottery.draftPool.map(p => getPlayerId(p) || p);
            if (newDP.some((p, i) => p !== lottery.draftPool[i])) {
                updateDoc.$set.draftPool = newDP;
                updateRequired = true;
            }
        }

        if (lottery.draftLog && lottery.draftLog.length > 0) {
            const newDL = lottery.draftLog.map(log => {
                let pid = null;
                if (typeof log.player === 'string') {
                    let name = log.player.replace(" (Captain)", "");
                    pid = nameMap.get(name);
                } else {
                    pid = getPlayerId(log.player);
                }
                const logObj = log.toObject ? log.toObject() : log;
                return { ...logObj, player: pid || logObj.player };
            });
            updateDoc.$set.draftLog = newDL;
            updateRequired = true; 
        }

        if (lottery.currentPick && lottery.currentPick.player) {
            const pid = getPlayerId(lottery.currentPick.player);
            if (pid && typeof lottery.currentPick.player === 'object' && !mongoose.Types.ObjectId.isValid(lottery.currentPick.player)) {
                updateDoc.$set["currentPick.player"] = pid;
                updateRequired = true;
            }
        }

        if (lottery.draftResults) {
            const newDR = {};
            let drChanged = false;
            for (const [teamIdx, roster] of lottery.draftResults.entries()) {
                const newRoster = roster.map(p => getPlayerId(p) || p);
                newDR[teamIdx] = newRoster;
                if (newRoster.some((p, i) => p !== roster[i])) drChanged = true;
            }
            if (drChanged) {
                updateDoc.$set.draftResults = newDR;
                updateRequired = true;
            }
        }

        if (updateRequired) {
            await Lottery.updateOne({ _id: lottery._id }, updateDoc);
            console.log(`Updated Lottery: ${lottery._id}`);
        }
    }
    console.log("Migration complete!");
    process.exit(0);
};

migrate().catch(console.error);
