// index.js
module.exports = async (req, res) => {
    // 1. Dynamically import your modern ES Modules to bypass Vercel's strict compiler
    const { default: app } = await import("./backend/src/app.js");
    const { default: connectDB } = await import("./backend/src/db/db.js");

    // 2. Ensure the database is awake and connected
    await connectDB();

    // 3. Forward the serverless request into your Express application
    return app(req, res);
};