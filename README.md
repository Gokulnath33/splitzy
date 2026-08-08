# Splitzy — Real-Time Expense Splitter

A live, multi-user expense-splitting app (like Splitwise) built with the MERN
stack + Socket.IO. When anyone adds an expense, every group member's balance
updates instantly on their own screen — no refresh needed. Includes a
"settle up" feature that calculates the minimum number of payments needed to
clear all debts, a live progress dashboard, and personal payment
notifications.

## Features
- JWT authentication (signup/login)
- Groups with multiple members
- Add expenses, auto-split equally across the group
- Live balances that animate as they change (Framer Motion)
- Settle-up view using a debt-simplification algorithm (minimum transactions)
- **Live progress dashboard** — animated ring showing % of the group's debts
  settled, total spent, total settled, amount still pending
- **Personal real-time notifications** — when you mark a payment as paid,
  the recipient gets an instant toast notification wherever they are in the
  app ("Arun paid you ₹500 in Goa Trip")
- Live presence avatars (who's currently viewing a group)
- Animated page transitions and a custom landing page

## Tech
React (Vite) + Tailwind CSS v4 + Framer Motion · Node.js/Express · MongoDB
(Mongoose) · Socket.IO · JWT auth

## Project structure
```
splitzy/
  backend/     Express API + Socket.IO server + settle-up algorithm
  frontend/    React app (Vite) — landing page, auth, dashboard, group view
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env    # PowerShell: Copy-Item .env.example .env
```

Edit `.env`:
- `MONGO_URI` — local MongoDB works by default, or use a MongoDB Atlas URI
- `JWT_SECRET` — any long random string

Make sure MongoDB is running locally, then:

```bash
npm run dev
```

Server runs on http://localhost:5000

## 2. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
cp .env.example .env    # PowerShell: Copy-Item .env.example .env
npm run dev
```

Frontend runs on http://localhost:5173

## 3. Try the real-time features

1. Sign up as User A, create a group, add User B (sign up a second account
   first, in an incognito tab).
2. Both open the same group — you'll see live presence avatars.
3. In Tab A, add an expense. Watch Tab B's balances and progress ring update
   instantly, numbers animating to their new values.
4. In Tab A, click "Mark paid" on a settle-up row. Watch Tab B (logged in as
   the person who got paid) — a toast notification slides in immediately,
   even if they're on the Dashboard page, not the group page.

## How the split calculation works

1. Every expense is split equally across all group members.
2. Each member's balance = (total they've paid) − (their fair share of
   total group spending).
3. Positive balance = they're owed money. Negative = they owe money.
4. A greedy debt-simplification algorithm matches the biggest debtor with
   the biggest creditor repeatedly, minimizing the number of transactions
   needed to settle up. See `backend/utils/settleUp.js`.

## Deploying it live

**Important:** Socket.IO needs a server process that stays running to hold
WebSocket connections open. Vercel's serverless functions spin down between
requests, so they cannot host the backend. The working split is:

| Part | Host | Why |
|---|---|---|
| Frontend (React/Vite) | **Vercel** | Static build, deploys perfectly |
| Backend (Express + Socket.IO) | **Render** (or Railway/Fly.io) | Keeps a persistent process alive for WebSockets |
| Database | **MongoDB Atlas** | Free tier, works from anywhere |

### Deploy the backend to Render
1. Push this project to a GitHub repo.
2. On Render: New → Web Service → connect the repo → set root directory to
   `backend`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add environment variables: `MONGO_URI` (your Atlas connection string),
   `JWT_SECRET`, `CLIENT_URL` (your Vercel URL, added after step below),
   `PORT` (Render sets this automatically, you can leave it).
5. Deploy — note the Render URL, e.g. `https://splitzy-api.onrender.com`.

### Deploy the frontend to Vercel
1. On Vercel: New Project → import the same repo → set root directory to
   `frontend`.
2. Framework preset: Vite (auto-detected).
3. Add environment variables: `VITE_API_URL` = `https://splitzy-api.onrender.com/api`,
   `VITE_SOCKET_URL` = `https://splitzy-api.onrender.com`.
4. Deploy — Vercel gives you a URL like `https://splitzy.vercel.app`.
5. Go back to Render and update `CLIENT_URL` to this Vercel URL, then
   redeploy the backend so CORS allows requests from it.

### MongoDB Atlas
1. Create a free cluster at mongodb.com/atlas.
2. Create a database user and allow network access from anywhere (0.0.0.0/0)
   for simplicity, or Render's specific IPs for tighter security.
3. Copy the connection string into `MONGO_URI` on Render.

## Resume bullet

> Built Splitzy, a real-time expense-splitting web app (React, Node.js,
> Express, Socket.IO, MongoDB) enabling groups to log shared expenses with
> balances and a live progress dashboard updating instantly across all
> members' screens; implemented a debt-simplification algorithm, personal
> real-time payment notifications, JWT authentication, and a Framer
> Motion-animated UI. Deployed on Vercel (frontend) and Render (backend).

## Stretch goals
- Custom (unequal) splits per expense, not just equal split
- Expense categories with icons + a spending breakdown chart
- Email notification fallback for offline users
- Multi-currency support
