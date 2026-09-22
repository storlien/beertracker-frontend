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
- **/** — Leaderboard (top 50 cards by total spent, real-time)
- **/users** — User management (CRUD for admins)
- **/cards/:cardId** — Card detail view
- **/admin** — Admin dashboard (sync status, stats)
- **/login** — Email/password login + Abakus OAuth placeholder

## Setup

### 1. Configure Firebase
Edit `src/firebase.ts` and replace the placeholder config with your actual Firebase project config (from Firebase Console → Project Settings → General → Your apps → SDK config):
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "beertracker-f62bb.firebaseapp.com",
  projectId: "beertracker-f62bb",
  // ...
};
```

### 2. Install & run dev server
```bash
npm install
npm run dev
```

### 3. Production build
```bash
npm run build
```

## Docker
```bash
docker build -t beertracker-frontend .
docker run -p 8080:80 beertracker-frontend
```

Or with docker-compose:
```bash
docker-compose up -d
```

## Features
- Dark mode default
- Mobile-first responsive design
- Real-time Firestore listeners for cards, users, sync state
- Admin panel with protected routes
- Toast notifications via Sonner

## Environment Variables
Unlike the backend, this frontend embeds Firebase config directly. For a real deployment, copy `.env.example` to `.env`.
