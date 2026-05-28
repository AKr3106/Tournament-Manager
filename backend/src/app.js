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

// List of allowed origins for your API
const allowedOrigins = [
    "http://localhost:5173", // Local frontend development port
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow server-to-server requests or requests with no origin (like Postman/Curl)
        if (!origin) return callback(null, true);
        
        // Dynamically accept your production Vercel URL or any Vercel preview branch deployment
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
            return callback(null, true);
        } else {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
    },
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.status(200).json({
        message: "Server is running successfully!"
    });
});

// Auth routes
app.use("/api/auth", authRouter);

// Players, Teams, Lottery and Slots routes
app.use("/api/players", playerRouter);
app.use("/api/teams", teamRouter);
app.use("/api/lottery", lotteryRouter);
app.use("/api/slots", slotRouter);

export default app;