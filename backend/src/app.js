import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import playerRouter from "./routes/player.route.js";
import teamRouter from "./routes/team.route.js";
import lotteryRouter from "./routes/lottery.route.js";
import slotRouter from "./routes/slot.route.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.status(200).json({
        message :"Server is running successfully!"
    })   
})

// Auth routes
app.use("/api/auth", authRouter);

// Players, Teams, Lottery and Slots routes
app.use("/api/players", playerRouter);
app.use("/api/teams", teamRouter);
app.use("/api/lottery", lotteryRouter);
app.use("/api/slots", slotRouter);

export default app;