# InvestMitra — Smart Trading Platform

InvestMitra is a mobile‑first trading simulator with a clean UI, sensible defaults, and an optional live market data toggle. It’s designed to feel like a real brokerage app without asking you for real money.

## Highlights
- Virtual portfolio with cash balance, orders, positions, P&L, and brokerage fees
- Realistic market data simulation (with optional live quotes via Alpha Vantage)
- Trading workflow: market/limit orders, buy/sell validation, and feedback toasts
- Dashboard, Portfolio, Trading, AI Insights, Learn, and Leaderboard pages
- Dark mode, keyboard‑accessible navigation, responsive layout
- Local persistence via localStorage
- Small Express API for demos and health checks

## Tech Stack
- React 18 + TypeScript + Vite 7
- Tailwind CSS + shadcn/ui‑style components (Radix UI under the hood)
- React Router 6, TanStack Query
- Netlify Functions (serverless), Alpha Vantage proxy for quotes
- Express (mounted in dev via Vite middleware, served in prod build)
- Vitest for unit tests, Zod for validation

## Monorepo-ish Layout (key paths)
- client/ — app code (components, pages, hooks, styles)
  - components/ui/* — UI primitives
  - pages/* — route pages
  - hooks/* — data, trading, utilities
- server/ — Express server used locally and for “node” start
- netlify/functions/ — serverless functions (api.ts, market.ts)
- shared/ — shared types between client/server

## Getting Started
Prerequisites: Node 18+, pnpm 10+

Install dependencies:

```bash
pnpm install
```

Start dev server (Vite + Express middleware):

```bash
pnpm dev
```

Build for production (SPA + server bundle):

```bash
pnpm build
```

Run the production server locally (serves dist/spa and exposes /api):

```bash
pnpm start
```

Run tests and type checks:

```bash
pnpm test
pnpm typecheck
```

Format code:

```bash
pnpm format.fix
```

## Environment Variables
- VITE_USE_LIVE_DATA: "true" to enable live quotes (default is disabled). Example in an .env file:

```ini
VITE_USE_LIVE_DATA=false
```

- ALPHA_VANTAGE_KEY: Required only if live data is enabled in production via Netlify Functions. Set this in Netlify project settings (Build & deploy → Environment → Environment variables). No need to commit this key.
- PING_MESSAGE: Optional, customizes `/api/ping` response.

## API Overview
Dev (via Vite + Express middleware) and Prod (via Node server or Netlify):
- GET /api/ping → { message: string }
- GET /api/demo → { message: string }

Netlify Function for quotes (used when VITE_USE_LIVE_DATA=true):
- GET /.netlify/functions/market?symbol=RELIANCE
  - Requires `ALPHA_VANTAGE_KEY` on Netlify
  - Responds with `{ ok, symbol, price, change, changePercent, lastUpdate }` or a helpful message when not configured

## Scripts
- pnpm dev — start Vite dev server (port 8080)
- pnpm build — build client (dist/spa) and server (dist/server)
- pnpm start — run the node server (serves SPA and /api)
- pnpm test — run unit tests with Vitest
- pnpm typecheck — run TypeScript in type‑check mode
- pnpm format.fix — format with Prettier

## Live Data Notes
- Live quotes are fetched through `netlify/functions/market.ts` to work around CORS and rate limits.
- Local dev typically runs with simulated data. Live quotes are intended for deployed environments where the Netlify Function is available.

## Deployment
Netlify (recommended):
- `netlify.toml` is included. It builds the SPA and deploys serverless functions.
- Set `ALPHA_VANTAGE_KEY` in Netlify environment variables if you want live quotes.
- After deploy, `/api/*` routes and `/.netlify/functions/*` are available.

Other hosts:
- `pnpm build && pnpm start` runs an Express server that serves `dist/spa` and `/api` endpoints.
- For serverless platforms other than Netlify, you’ll need to port `netlify/functions/market.ts` to their function format.

## Testing Checklist
- Pages resize nicely from 320px up
- Theme toggle works (light/dark)
- Basic navigation via keyboard and mobile menu
- Place buy/sell orders updates portfolio and cash
- Refresh persists portfolio (localStorage)

## License
No license file is included. If you plan to open‑source this project, add a LICENSE (MIT, Apache‑2.0, etc.).

---
If you spot something rough around the edges, open an issue or PR. Happy trading (safely)! 🚀
