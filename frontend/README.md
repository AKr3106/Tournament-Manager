# RKM Legacy League - Tournament Manager (Frontend)

This is the frontend application for the **RKM Legacy League - Tournament Manager**, a comprehensive web application designed to manage custom sports tournaments, track live match statistics, and handle dynamic team lotteries.

Built with React and Vite, the application features a modern, responsive, and gaming-inspired UI using Tailwind CSS.

## 🌟 Key Features

* **Live Leaderboards**: Real-time tracking of top scorers (Golden Boot) and top assist providers. Data automatically synchronizes across the application as match stats are updated.
* **Match Control Manager**: An exclusive Admin dashboard to record match scores, assign goalscorers, track assists, and declare the Man of the Match.
* **Automated Tournament Lottery**: An admin tool to randomly draft registered players into designated teams, complete with dynamic team assignments and live draft logging.
* **Tournament Standings**: Auto-calculating league tables based on match results, displaying points, goal differences, and group standings.
* **Season Archiving**: Built-in logic to support multiple seasons (e.g., Season 1 Archive vs. Season 2 Live tracking).
* **Player & Team Browsing**: Interactive galleries allowing users to filter and search through the registered draft pool and active team rosters.
* **Dark/Light Theme**: A highly polished, esports-themed aesthetic with a toggleable dark mode (persisted via local storage).

## 🛠️ Technology Stack

* **Framework:** [React 18](https://react.dev/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS v3](https://tailwindcss.com/)
* **Routing:** [React Router v6](https://reactrouter.com/)
* **State Management & Persistence:** React Hooks (`useState`, `useEffect`) and HTML5 `localStorage` (for immediate cross-tab synchronization of match states).

## 🚀 Getting Started

### Prerequisites

* Node.js (v16+ recommended)
* npm or yarn

### Installation

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application should now be running on `http://localhost:5173`.

### Backend Connection
The frontend expects a Node.js backend to provide core entity data (like registered players and predefined teams). Ensure your backend server is running and that the `API_BASE` endpoint (configured in `src/api.js` or `.env`) points to the correct URL (typically `http://localhost:5000`).

## 📂 Project Structure

* `/src/pages`: Main view components (e.g., `Leaderboard.jsx`, `Admin.jsx`, `Tournament.jsx`, `Players.jsx`).
* `/src/components`: Reusable UI elements (e.g., `Navbar.jsx`, `MatchManager.jsx`, `PlayerCard.jsx`).
* `App.jsx`: Main application routing and layout wrapper.
* `api.js`: Configuration for backend API endpoints.

## 🔐 Admin Access
Certain routes (`/admin`, `/lottery`) are protected and require the user to be logged in with an `admin` role. Authentication state is stored in `localStorage` under the `user` key.

---
*Built for the RKM Legacy League.*
