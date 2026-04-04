# Bolão dos Bolões — Developer Guide

## What this is

A Brazilian football World Cup prediction/betting pool (bolão). Users predict scores for every group-stage match and earn points based on accuracy. Built for WC2018 (Russia), reused for WC2022 (Qatar), now being refreshed for WC2026 (USA/Canada/Mexico).

## Running locally

```bash
pnpm install      # requires Node 18 (nvm use 18)
pnpm start        # dev server at http://localhost:5173
pnpm build        # production build → /dist
```

No `.env` file is needed. Firebase config is hardcoded in `src/index.jsx` (project: `worldcup-27dc4`).

**Important:** macOS has a case-insensitive filesystem. Entry point is `src/index.jsx`, app shell is `src/App.jsx`. Do NOT create `src/Index.jsx` or `src/app.jsx` — they would collide.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, MUI v5, React Router 6 |
| Database | Firebase 10 Realtime Database (compat API) |
| Auth | Firebase Auth (Google OAuth) |
| Hosting | Firebase Hosting |
| Viz | D3 v7, React Move v6 |
| Dates | dayjs |

## Database structure

All data lives under a **root node** that identifies the tournament year:

```
wc18/   ← 2018 data (read-only, historical)
wc22/   ← 2022 data (current active)
wc26/   ← 2026 data (to be created — do NOT touch wc18 or wc22)
```

The root node is set in `src/constants.js` → `DATABASE_ROOT_NODE`.

Under each root:
```
{root}/master/gabarito/{matchId} = {h, a}   ← official results (admin-only)
{root}/{userId}/{gameId}/{matchId} = {h, a, pts}  ← user bids
{root}/pins/{userId}/{gameId}    ← pinned games
```

## Key source files

| File | Purpose |
|---|---|
| `src/index.jsx` | Entry point — Firebase init, React 18 createRoot |
| `src/App.jsx` | App shell — BrowserRouter, NavBar, Routes |
| `src/constants.js` | Active DB root node, legacy root constants |
| `src/data.json` | Current tournament (wc22): teams + groups + matches |
| `src/data2018.json` | 2018 historical data |
| `src/Bid.jsx` | User bidding interface; iterates groups A-H |
| `src/GroupView.jsx` | Renders one group's matches; reads from `data.json` |
| `src/Leaderboard3.jsx` | Real-time leaderboard; scoring engine |
| `src/Master.jsx` | Admin panel to enter official results |
| `src/parse.js` | CLI utility to re-generate group data from raw fixtures |

## Scoring rules

| Points | Condition |
|---|---|
| 8 | Exact score (home and away goals correct) |
| 5 | Correct goal difference |
| 3 | Correct result direction (win/draw/loss) |
| 0 | Wrong |

## Admin access

The `/master` route is restricted to a hardcoded email list in `Master.js`:
- `alexandre.eisenmann@gmail.com`
- `ricardoke@gmail.com`
- `joao@idst.com.br`
- `felipe.lara19@gmail.com`

## WC2026 key differences

- **48 teams** (up from 32)
- **12 groups A–L** (up from 8 groups A–H), each with 4 teams
- **72 group-stage matches** (up from 48)
- New root node: `wc26`
- New data file: create `src/data26.json` (do not modify `data.json`)
- Several new countries may need flag SVGs in `src/flags/4x3/`

## Database rules

`database.rules.json` — public read, write requires auth. No changes needed for WC26.
