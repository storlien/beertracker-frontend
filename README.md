# BeerTracker Frontend

React 18 + TypeScript + Vite + Tailwind CSS frontend for the BeerTracker card transaction tracker.

## Stack
- React 18 + TypeScript
- Vite
- Tailwind CSS 3 (dark theme)
- Firebase JS SDK v10 (Firestore, Auth)
- React Router v6
- Zustand (UI state)
- Lucide icons

## Pages
- **/** — Leaderboard (top 100 cards by total spent, real-time)
- **/users** — User management (CRUD for admins)
- **/cards/:cardId** — Card detail view
- **/admin** — Admin dashboard (sync status, stats)
- **/login** — Email/password login + Abakus OAuth placeholder

## Setup

### 1. Environment variables
Copy `.env.example` to `.env` and fill in your Firebase API key:

```bash
cp .env.example .env
```

Get the `VITE_FIREBASE_API_KEY` value from Firebase Console → Project Settings → General → Your apps → SDK config.

### 2. Local dev server
```bash
npm install
npm run dev
```
The dev server runs at **http://localhost:5173**.

### 3. Production build
```bash
npm run build
```

## Docker

Build and start the container (uses port **8080**):

```bash
docker compose up -d --build
```

Access the app at **http://localhost:8080**.

To stop:
```bash
docker compose down
```

To view logs:
```bash
docker compose logs -f
```

## Features
- Dark mode default
- Mobile-first responsive design
- Real-time Firestore listeners for cards, users, sync state
- Admin panel with protected routes
- Toast notifications via Sonner
