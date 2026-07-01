# 🏆 RKM Legacy League – Tournament Manager

A full-stack web application for managing the **RKM Legacy League** — a private football tournament. It handles player registration, team drafting via a live lottery system, slot booking, and season archiving.

---

## ✨ Features

- 🔐 **Authentication** — Sign up / Sign in with JWT-based auth (stored in HTTP-only cookies). Role-based access (`user` / `admin`).
- 👤 **User Profiles** — Each user has a profile showing their linked player and team.
- 🎲 **Live Lottery Draft** — Randomized player-to-team lottery system with real-time state tracking across sessions.
- 🗓️ **Slot Manager** — Book and manage match/event slots.
- 🏅 **Tournament Pages** — Dedicated pages for Season 1 (archived) and Season 2 (live). Features a dynamic bracket, live group standings, and knockout rounds.
- ⚽ **Match Stats & Events** — Detailed logging of Goalscorers, Assists, and Man of the Match (MOTM), displayed in collapsible fixture cards.
- 🎯 **Penalty Shootouts** — Native tie-breaker support for knockout matches with automatic progression logic.
- 🏆 **Champions Banner & Global Awards** — Dynamic declaration of tournament winners and tracking for the Golden Ball, Golden Boot, and Golden Gloves.
- 🛠️ **Admin Panel & Match Manager** — Full control over players, teams, and lottery management. Includes a dedicated Match Manager workspace to log scores, stats, and awards.
- 🌙 **Theme Toggle** — Dark/Night and Light/Day modes, persisted in `localStorage`.
- 📱 **Fully Responsive** — Optimised for mobile, tablet, and desktop screens.

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|---|---|
| React (Vite) | UI framework |
| React Router DOM | Client-side routing |
| Tailwind CSS v4 | Styling & responsive design |
| Vanilla CSS | Custom theme overrides |

### Backend
| Tech | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| cookie-parser | HTTP-only cookie management |
| dotenv | Environment variable management |
| cors | Cross-origin request handling |

---

## 📁 Project Structure

```
Tournament-Manager/
├── backend/
│   ├── scripts/
│   │   └── migrate_players.js   # Database migration and utility scripts
│   └── src/
│       ├── app.js               # Express app setup, middleware, and routes
│       ├── db/
│       │   └── db.js            # MongoDB connection
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── player.controller.js
│       │   ├── team.controller.js
│       │   ├── lottery.controller.js
│       │   └── slot.controller.js
│       ├── models/
│       │   ├── user.model.js    # User schema (name, email, role, playerName, myTeam)
│       │   ├── players.model.js # Player schema (index, name, position: FW/DF/GK)
│       │   ├── teams.model.js   # Team schema
│       │   ├── lottery.model.js # Lottery state schema
│       │   └── slot.model.js    # Slot booking schema
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── player.route.js
│       │   ├── team.route.js
│       │   ├── lottery.route.js
│       │   └── slot.route.js
│       └── middleware/          # Auth and role-check middleware
│
└── frontend/
    └── src/
        ├── App.jsx              # Routes and layout wrapper
        ├── index.css            # Global styles, theme overrides, scrollbar removal
        ├── components/
        │   ├── Navbar.jsx       # Responsive nav with theme toggle and mobile drawer
        │   ├── Hero.jsx
        │   ├── TeamCard.jsx
        │   ├── PlayerCard.jsx
        │   ├── SeasonButton.jsx
        │   ├── AnimatedBackground.jsx
        │   └── ...
        └── pages/
            ├── Tournament.jsx   # Season 2 (live) tournament page
            ├── TournamentS1.jsx # Season 1 (archived, hardcoded) tournament page
            ├── Lottery.jsx      # Live lottery draft viewer
            ├── AdminLottery.jsx # Admin lottery control panel
            ├── Admin.jsx        # Admin management (players, teams, slots)
            ├── SlotManager.jsx  # Slot booking management
            ├── Players.jsx      # All-players listing
            ├── Profile.jsx      # User profile page
            ├── SignIn.jsx
            ├── CreateAccount.jsx
            ├── Rules.jsx
            ├── About.jsx
            └── Footer.jsx
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/Tournament-Manager.git
cd Tournament-Manager
```

### 2. Configure environment variables

Create a `.env` file in the `backend/` directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/rkm-legacy-league
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

### 3. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Run the development servers

```bash
# In one terminal – start backend (port 3000)
cd backend
npm run dev

# In another terminal – start frontend (port 5173)
cd frontend
npm run dev
```

Open your browser at **http://localhost:5173**

---

## 🔌 API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/signin` | Sign in and get JWT cookie |
| `POST` | `/api/auth/signout` | Sign out (clear cookie) |
| `GET` | `/api/players` | Get all players |
| `POST` | `/api/players` | Add a new player (admin) |
| `PUT` | `/api/players/:id` | Update player details (admin) |
| `GET` | `/api/teams` | Get all teams |
| `POST` | `/api/teams` | Add a new team (admin) |
| `GET` | `/api/lottery/state` | Get current lottery state |
| `POST` | `/api/lottery/start` | Start the lottery (admin) |
| `POST` | `/api/lottery/draw` | Draw next player (admin) |
| `GET` | `/api/slots` | Get all slots |
| `POST` | `/api/slots` | Book a slot |

---

## 🏅 Season History

### Season 1 — Archived
| # | Team |
|---|---|
| 1 | Dream Makers |
| 2 | Goal Digger FC |
| 3 | Gladiator FC |
| 4 | Victorious Five |
| 5 | Pancha Pandav |
| 6 | Atletico FC |

> 🏆 **Champions:** Victorious Five (won on penalties vs Goal Digger FC — 0–0 FT, 3–2 Pen)

### Season 2 — Ongoing
Live team drafting via the Lottery Draft system. 6 teams participate, each with 5 players drafted randomly.

---

## 👥 Roles

| Role | Capabilities |
|---|---|
| `user` | View tournament, players, own profile, watch lottery |
| `admin` | All of the above + manage players/teams, run lottery, manage slots |

---

## 📜 License

This project is private and intended for internal use by the RKM Legacy League community.
