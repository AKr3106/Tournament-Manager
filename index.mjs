import app from "./backend/src/app.js";
import connectDB from "./backend/src/db/db.js";

export default async (req, res) => {
    // 1. Ensure the database is awake and connected
    await connectDB();

    // 2. Forward the serverless request into your Express application
    return app(req, res);
};
