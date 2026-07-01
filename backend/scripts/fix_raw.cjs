const { MongoClient } = require('mongodb');
require('dotenv').config();

const fixDb = async () => {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();

    const players = await db.collection('players').find({}).toArray();
    const playerMap = new Map();
    const nameMap = new Map();

    players.forEach(p => {
        playerMap.set(p.index, p._id);
        nameMap.set(p.name, p._id);
    });
    
    // Explicit overrides
    const anubhab = players.find(p => p.name === "Anubhab Mandal" || p.name.includes("Anubhab"));
    if (anubhab) {
        nameMap.set("Adwitiya Bandyopadhyay", anubhab._id);
        nameMap.set("Adwitiyo Bandyopadhyay", anubhab._id);
    }

    const getPlayerId = (obj) => {
        if (!obj) return null;
        if (obj._bsontype === 'ObjectId') return obj;
        if (typeof obj === 'string' && obj.length === 24) return obj; 
        if (obj.index !== undefined && playerMap.has(obj.index)) return playerMap.get(obj.index);
        if (obj.name && nameMap.has(obj.name)) return nameMap.get(obj.name);
        return null;
    };

    const lotteries = await db.collection('lotteries').find({}).toArray();
    for (const lottery of lotteries) {
        const update = { $set: {} };

        if (lottery.draftResults) {
            const newDR = {};
            for (const [teamIdx, roster] of Object.entries(lottery.draftResults)) {
                newDR[teamIdx] = roster.map(p => getPlayerId(p) || p._id || p);
            }
            update.$set.draftResults = newDR;
        }

        if (lottery.draftPool) {
            update.$set.draftPool = lottery.draftPool.map(p => getPlayerId(p) || p._id || p);
        }

        if (lottery.selectedPlayers) {
            update.$set.selectedPlayers = lottery.selectedPlayers.map(p => getPlayerId(p) || p._id || p);
        }

        if (lottery.draftLog) {
            update.$set.draftLog = lottery.draftLog.map(log => {
                let pid = null;
                if (typeof log.player === 'string') {
                    let name = log.player.replace(" (Captain)", "");
                    pid = nameMap.get(name);
                } else {
                    pid = getPlayerId(log.player);
                }
                
                let finalPlayer = pid;
                if (!finalPlayer) {
                    if (log.player && typeof log.player === 'object') finalPlayer = log.player._id || log.player;
                    else finalPlayer = log.player;
                }
                return { ...log, player: finalPlayer };
            });
        }

        if (lottery.currentPick && lottery.currentPick.player) {
            let cpPid = getPlayerId(lottery.currentPick.player);
            if (!cpPid) {
                 if (typeof lottery.currentPick.player === 'object') cpPid = lottery.currentPick.player._id || lottery.currentPick.player;
                 else cpPid = lottery.currentPick.player;
            }
            update.$set["currentPick.player"] = cpPid;
        }

        if (Object.keys(update.$set).length > 0) {
            await db.collection('lotteries').updateOne({ _id: lottery._id }, update);
            console.log("Updated lottery:", lottery._id);
        }
    }

    const slots = await db.collection('slots').find({}).toArray();
    for (const slot of slots) {
        if (slot.players) {
            const newPlayers = slot.players.map(p => getPlayerId(p) || p._id || p);
            await db.collection('slots').updateOne({ _id: slot._id }, { $set: { players: newPlayers } });
            console.log("Updated slot:", slot.name);
        }
    }

    console.log("Done via raw MongoDB driver.");
    process.exit(0);
};

fixDb().catch(console.error);
