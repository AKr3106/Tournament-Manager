import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import playerRouter from "./routes/player.route.js";
import teamRouter from "./routes/team.route.js";
import lotteryRouter from "./routes/lottery.route.js";
import slotRouter from "./routes/slot.route.js";
import fixtureRouter from "./routes/fixture.route.js";

dotenv.config();

const app = express();

// Allowed absolute origins for your API
const allowedOrigins = [
    "http://localhost:5173",                          // Local frontend development port
    "https://tournament-manager-xi-beige.vercel.app" // Your main production Vercel URL
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow server-to-server requests or requests with no origin (like Postman/Curl)
        if (!origin) return callback(null, true);
        
        // Match explicit domains or check for Vercel preview branch URLs securely
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
            // This returns the EXACT matching domain back to the browser, satisfying 'credentials: true'
            return callback(null, true);
        } else {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
    },
    credentials: true, // Crucial for passing cookies/sessions across serverless boundaries
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
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
app.use("/api/fixtures", fixtureRouter);

export default app;