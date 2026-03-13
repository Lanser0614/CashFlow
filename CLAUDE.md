# CashFlow 101 — Project Guide

Browser-based implementation of Robert Kiyosaki's Cash Flow 101 board game. Russian UI. Local multiplayer (1–6 players) + online multiplayer with video streaming. Status: **complete and functional**.

## Quick Start

```bash
# Full stack (recommended)
docker compose up --build
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# NATS Dashboard: http://localhost:8282

# Frontend only (local dev)
cd apps/frontend && npm run dev   # port 5173

# Backend only (local dev)
cd apps/backend
composer install && php artisan migrate && php artisan serve
```

Package manager: **npm** (not pnpm).

## Architecture

Monorepo with two apps and infrastructure services:

```
apps/frontend/   — React 19 + Vite 7 + TypeScript + Tailwind CSS 3 + Zustand 5
apps/backend/    — Laravel 10 (PHP 8.2) + MySQL 8.4
docker/          — Dockerfiles for frontend, backend, Janus, NATS
docker-compose.yml
```

**Docker services:**

| Service | Port | Purpose |
|---------|------|---------|
| Frontend (Vite) | 5173 | React dev server |
| Backend (Laravel) | 8000 | REST API |
| MySQL | 3306 | Primary database |
| NATS | 4222 | Real-time pub/sub (online rooms) |
| Janus Gateway | 8188 | WebRTC video streaming |
| NATS Dashboard | 8282 | NATS monitoring UI |

---

## Frontend

### Key Files

| File | Purpose |
|------|---------|
| `src/store/gameStore.ts` | **All core game logic** (~1049 lines, Zustand store) |
| `src/utils/playerStats.ts` | `computePlayerStats()` — derives all financial metrics; `canExitRatRace()` |
| `src/data/professions.ts` | 11 professions with full financial statements |
| `src/data/board.ts` | 24 Rat Race + 16 Fast Track space definitions |
| `src/data/smallDeals.ts` | Small deal cards |
| `src/data/bigDeals.ts` | Big deal cards |
| `src/data/doodads.ts` | Doodad (unexpected expense) cards |
| `src/data/marketCards.ts` | Market/stock cards |
| `src/components/screens/GameScreen.tsx` | Main game screen — 3-column layout (270px \| flex \| 270px) |
| `src/components/board/GameBoard.tsx` | SVG board (500×500 viewBox) |
| `src/components/cards/CardModal.tsx` | Deal / Doodad / Market card modals |
| `src/components/finance/FinancialStatement.tsx` | 3-tab financial report |
| `src/components/screens/AuthScreen.tsx` | Login / register UI |
| `src/components/screens/LobbyScreen.tsx` | Online lobby (create/join rooms) |
| `src/store/authStore.ts` | Auth state (login, register, token) |
| `src/store/roomStore.ts` | Online room state |
| `src/store/streamStore.ts` | Video streaming state |
| `src/services/api.ts` | HTTP client (Bearer token auth) |
| `src/services/natsClient.ts` | NATS.ws connection |
| `src/services/janusService.ts` | Janus WebRTC integration |

### Screens Flow
`AuthScreen` → `ModeSelectScreen` → `SetupScreen` → `GameScreen` → `WinScreen`
Online path: `AuthScreen` → `LobbyScreen` → `WaitingRoom` → `GameScreen`

### Styling
- Tailwind CSS 3. Use `.btn-primary` for dice button, `.btn-ghost` for "Next Player".
- Board SVG is 520×520px at 1280px viewport (scale 1.04×).
- Player pawns: `r=8` circles, player number label at `cy=-18`.
- Player colors: indigo, amber, red, green, pink, teal.

---

## Backend

### API Routes (`routes/api.php`)

**Public:**
- `POST /api/register`, `POST /api/login`

**Protected (Sanctum Bearer token):**
- `GET/POST /api/games` — list/save game state
- `GET/PUT/DELETE /api/games/{id}` — retrieve/update/delete save
- `GET/POST /api/results` — game results
- `POST /api/rooms` — create online room (generates 6-char code)
- `GET /api/rooms/{code}` — get room info
- `POST /api/rooms/{code}/join|leave|ready|start` — room lifecycle
- `PATCH /api/rooms/{code}/player` — update player (profession, name)
- `GET /api/rooms/{code}/state` — fetch game state
- `POST /api/rooms/{code}/action` — submit turn action
- `POST/GET/DELETE /api/rooms/{code}/video-room` — Janus room management

### Controllers

| File | Purpose |
|------|---------|
| `app/Http/Controllers/AuthController.php` | Register, login, logout, user info |
| `app/Http/Controllers/GameController.php` | Save/load/delete game states |
| `app/Http/Controllers/RoomController.php` | Online multiplayer rooms (339 lines) |
| `app/Http/Controllers/StreamController.php` | Janus video room management |

### Models

| Model | Key Fields |
|-------|-----------|
| `User` | `id`, `name`, `username`, `password` |
| `GameRoom` | `code` (6-char), `host_user_id`, `status`, `game_state` (JSON), `state_version`, `janus_room_id` |
| `GameRoomPlayer` | `player_index`, `player_name`, `profession_id`, `color`, `ready` |
| `GameSave` | `name`, `game_state` (JSON), `player_count`, `turn_number` |
| `GameResult` | `winner_name`, `player_names` (JSON), `duration` |

### Services

| Service | Purpose |
|---------|---------|
| `app/Services/NatsPublisher.php` | `publish()`, `roomEvent()` — pub/sub via NATS |
| `app/Services/JanusService.php` | Janus WebRTC room creation & management |

### Migrations
Located in `database/migrations/`. Key tables: `users`, `game_saves`, `game_results`, `game_rooms`, `game_room_players`, `room_participants`, `room_messages`.

---

## Game Logic

### Board
- **Rat Race:** 24 spaces — 6 payday, 3 deal, 2 small_deal, 1 big_deal, 6 doodad, 3 market, 2 baby, 1 downsize, 1 charity (approximate distribution).
- **Fast Track:** 16 spaces. Dream positions at indices [3, 7, 10, 13].

### Turn Flow
`roll dice` → `move step-by-step` → `resolve space` → `handle card modal` → `end turn`

### Win Conditions
- **Rat Race exit:** `passiveIncome >= totalExpenses` → move to Fast Track position 0.
- **Fast Track win:** land on own dream position OR cash >= $50,000.

### Financial Model
- `computePlayerStats()` in `src/utils/playerStats.ts` derives all computed stats.
- Assets: cash, stocks, real estate, businesses, speculation.
- Liabilities: home mortgage, car loan, credit cards, school loan, RE mortgages, business loans.
- Passive income = real estate cashflow + business cashflow + dividends.

---

## Critical Notes (Bug-prone Areas)

1. **Real estate `monthlyCashflow` is NET** (mortgage already deducted). Do NOT add `re.monthlyMortgage` to `statement.mortgage` when buying — this was a past bug.

2. **Payday is collected twice:** once when landing on the space AND once when passing through it (step-by-step movement loop).

3. **`addLog()` returns `any`** — intentional, avoids Zustand type conflicts. Do not change this.

4. **Online sync:** `syncFromServer()` in `gameStore.ts` replaces local state with server state. Be careful not to call it in local-only game mode.

5. **NATS subjects format:** `room.{CODE}.{event}` — e.g., `room.ABC123.dice_rolled`.

6. **Room codes** use uppercase alphanumeric excluding `0`, `O`, `I`, `1` to avoid confusion.

---

## Types

All TypeScript types are in `src/types/`:
- `game.ts` — `GameState`, `GameMode`, turn phases
- `player.ts` — `Player`, `PlayerStats`, `SetupPlayer`
- `cards.ts` — `SmallDeal`, `BigDeal`, `Doodad`, `MarketCard`
- `board.ts` — `BoardSpace`
- `profession.ts` — `ProfessionCard`
