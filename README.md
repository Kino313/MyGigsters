# MyGigsters – Rewards & Benefits Engine (Demo)

Minimal end‑to‑end demo of an embedded rewards/benefits engine for a gig platform:

- Worker: Dashboard KPIs, Activity upload/filter, Benefits claim
- Admin: Rules list/create/toggle/preview, Users search, Audit logs, Recompute

This repo contains a React + Vite frontend (TypeScript) and a Node.js + Express backend (TypeScript) with MongoDB via Mongoose.

## Quick Start

Prerequisites
- Node.js 18+
- MongoDB Atlas connection string (or local MongoDB)

1) Clone and install
```
git clone <your-repo-url>
cd mygigsters-demo
npm install
```

2) Environment
- Frontend: copy `.env.example` to `.env` and set API base if needed
```
cp .env.example .env
# VITE_API_BASE=http://localhost:3000/api
```
- Backend: in `server/`, copy `.env.example` to `.env` and set your Mongo URI
```
cd server
npm install
cp .env.example .env
# MONGO_URI=... (Atlas)   CORS_ORIGIN=http://localhost:5173   PORT=3000
```

3) Seed and run backend
```
cd server
npm run seed
npm run dev
# API: http://localhost:3000/api   Health: GET /api/health
```

4) Run frontend (separate terminal)
```
cd mygigsters-demo
npm run dev
# App: http://localhost:5173
```

## Scripts
- Frontend: `npm run dev` | `npm run build` | `npm run preview` | `npm run lint`
- Backend (server/): `npm run dev` | `npm run seed`

## Project Structure
```
.
├─ public/                 # static assets (logo, icons)
├─ src/                    # React app (TypeScript)
│  ├─ api/                 # API client wrapper
│  ├─ components/          # UI components (Card, Modal, Toast, etc.)
│  ├─ pages/               # Screens (Login, Worker, Admin)
│  ├─ context/             # Role context
│  └─ ...
├─ server/                 # Express API (TypeScript)
│  ├─ src/
│  │  ├─ config/db.ts      # Mongo connection
│  │  ├─ models/           # User, Activity, Rule, Benefit, AuditLog
│  │  ├─ routes/           # /api/worker/*  /api/admin/*
│  │  ├─ services/         # evaluator, seed
│  │  └─ index.ts          # app entry
│  └─ .env.example
├─ .env.example            # frontend env example
├─ .gitignore              # ignores node_modules, builds, env, latex artifacts
├─ package.json            # frontend scripts and deps
└─ README.md
```

## Environment Variables
- Frontend (`.env`)
  - `VITE_API_BASE` (default `http://localhost:3000/api`)
- Backend (`server/.env`)
  - `MONGO_URI` – MongoDB Atlas connection string
  - `CORS_ORIGIN` – Allowed frontend origin (default `http://localhost:5173`)
  - `PORT` – Server port (default `3000`)


## Acknowledgements
React, Vite, TailwindCSS, Express, MongoDB, Mongoose, date-fns, recharts.
