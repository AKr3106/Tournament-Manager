import app from "./backend/src/app.js";
import connectDB from "./backend/src/db/db.js";

// Initialize database connection immediately when serverless instance boots up
connectDB();

export default app;