// Central API base URL
// In development: calls local backend at localhost:3000
// In production (Vercel): calls relative /api which routes to the serverless backend
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export default API_BASE;
