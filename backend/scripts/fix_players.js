import mongoose from "mongoose";
import dotenv from "dotenv";
import Player from "../src/models/players.model.js";
import Slot from "../src/models/slot.model.js";
import Lottery from "../src/models/lottery.model.js";
import connectDB from "../src/db/db.js";

dotenv.config({ path: ".env" });

const fixLottery = async () => {
    await connectDB();
    console.log("Fixing Lotteries...");
    const players = await Player.find({});
    
    const playerMap = new Map();
    players.forEach(p => playerMap.set(p.index, p._id));
    
    // Also map name just in case
    const nameMap = new Map();
    players.forEach(p => nameMap.set(p.name, p._id));
    const anubhab = players.find(p => p.name === "Anubhab Mandal");
    if (anubhab) {
        nameMap.set("Adwitiya Bandyopadhyay", anubhab._id);
        nameMap.set("Adwitiyo Bandyopadhyay", anubhab._id);
    }

    const getPlayerId = (playerObj) => {
        if (!playerObj) return null;
        if (mongoose.Types.ObjectId.isValid(playerObj) && typeof playerObj !== 'object') return playerObj;
        if (playerObj._id && mongoose.Types.ObjectId.isValid(playerObj._id)) return playerObj._id;
        if (playerObj.index !== undefined && playerMap.has(playerObj.index)) {
            return playerMap.get(playerObj.index);
        }
        if (playerObj.name && nameMap.has(playerObj.name)) {
            return nameMap.get(playerObj.name);
        }
        return null;
    };

    const lotteries = await Lottery.find({});
    for (const lottery of lotteries) {
        let changed = false;

        if (lottery.draftResults) {
            for (const [teamIdx, roster] of lottery.draftResults.entries()) {
                const newRoster = roster.map(p => {
                    const pid = getPlayerId(p);
                    if (pid) return pid;
                    return p;
                });
                lottery.draftResults.set(teamIdx, newRoster);
                changed = true;
            }
        }

        if (lottery.draftPool && lottery.draftPool.length > 0) {
            lottery.draftPool = lottery.draftPool.map(p => getPlayerId(p) || p);
            changed = true;
        }

        if (lottery.draftLog && lottery.draftLog.length > 0) {
            lottery.draftLog = lottery.draftLog.map(log => {
                let pid = null;
                if (typeof log.player === 'string') {
                    let name = log.player.replace(" (Captain)", "");
                    pid = nameMap.get(name);
                } else {
                    pid = getPlayerId(log.player);
                }
                const logObj = typeof log.toObject === 'function' ? log.toObject() : log;
                return { ...logObj, player: pid || logObj.player };
            });
            changed = true;
        }

        if (lottery.currentPick && lottery.currentPick.player) {
            const pid = getPlayerId(lottery.currentPick.player);
            if (pid) {
                lottery.currentPick.player = pid;
                changed = true;
            }
        }

        if (changed) {
            lottery.markModified("draftResults");
            lottery.markModified("draftPool");
            lottery.markModified("draftLog");
            lottery.markModified("currentPick");
            await lottery.save();
            console.log("Saved lottery: " + lottery._id);
        }
    }
    
    console.log("Fixing Slots...");
    const slots = await Slot.find({});
    for (const slot of slots) {
        let sChanged = false;
        const newPlayers = slot.players.map(p => {
             const pid = getPlayerId(p);
             if (pid) { sChanged = true; return pid; }
             return p;
        });
        if (sChanged) {
             slot.players = newPlayers;
             await slot.save();
             console.log("Saved slot: " + slot.name);
        }
    }

    console.log("Done");
    process.exit(0);
};

fixLottery().catch(console.error);
