# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Energy x AI Portfolio Simulator — a personal investment research tool for tracking a concentrated portfolio of 11 energy/AI-infrastructure stocks against SPY. Built around the thesis that AI datacenter buildout drives energy demand, making energy stocks undervalued relative to tech.

## Commands

- `npm run dev` — Start Vite dev server (required for Yahoo Finance proxy and fundamentals middleware)
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build

No test framework or linter is configured.

## Architecture

**Single-page React 19 app** (plain JSX, no TypeScript, no router). Four tabs managed via state in `App.jsx`: Dashboard, Allocations, Analysis, Catalysts.

### Dual-API Data Flow

1. **Finnhub** (user provides API key, stored in `localStorage['finnhub_api_key']`): live quotes and historical candles. 60 calls/min free tier.
2. **Yahoo Finance** (no key needed, two mechanisms in `vite.config.js`):
   - `/api/yahoo/*` — Vite proxy rewriting to `query1.finance.yahoo.com` for chart/candle data
   - `/api/yahoo-fundamentals` — Custom Vite dev-server middleware using `yahoo-finance2` Node library for PE, EPS, dividends, market cap, etc.

**Both Yahoo mechanisms only work during `npm run dev`** — they are Vite dev-server features, not available in production builds.

### State Management

Zustand stores in `src/stores/` are thin data containers. Business logic lives in hooks (`src/hooks/`) and pure computation modules (`src/analysis/`). Only `portfolioStore` persists to localStorage (key: `energy-sim-portfolio`); all other stores are ephemeral.

### Key Layers

- **`src/config/`** — Portfolio definition (`portfolio.js`: 11 stocks + SPY with static entry prices, tiers, sectors), allocation presets (`presets.js`), catalyst dates (`catalysts.js`)
- **`src/services/`** — API clients (`finnhub.js`, `yahoo.js`, `fundamentals.js`), orchestrator (`priceService.js`), localStorage cache with TTLs (`cache.js`), daily snapshot persistence (`snapshots.js`)
- **`src/analysis/`** — Pure functions: `backtest.js` (replay daily prices), `riskMetrics.js` (Sharpe, Sortino, Beta, Alpha, MaxDD), `correlation.js` (Pearson matrix), `sectorAttribution.js`
- **`src/hooks/`** — `usePrices` (fetch quotes on mount + 5-min interval during market hours), `useFundamentals` (fetch once, 24h cached), `useBacktest` (on-demand historical analysis), `useSnapshots` (auto-record daily), `useMarketStatus`
- **`src/components/`** — Organized by tab: `dashboard/`, `allocations/`, `analysis/`, `catalysts/`, plus `layout/` and `shared/`

### Caching

All fetched data is cached in localStorage with TTLs (quotes: 5 min, history: 24h, fundamentals: 24h). Cache keys prefixed `esim_`.

### Design System

Dark theme with CSS custom properties in `src/index.css`. Tailwind CSS v4 (uses `@import "tailwindcss"` syntax, no `tailwind.config.js`). Monospace font stack (JetBrains Mono, SF Mono, Fira Code). Tier colors: Tier 1 = amber, Tier 2 = blue, Tier 3 = purple.

### Analysis Tab (On-Demand)

User clicks "Load Historical Data" which fetches 1 year of daily OHLCV for all 12 symbols via Yahoo proxy (300ms delay between calls for rate limiting), then computes backtest, risk metrics, drawdown, correlation matrix, and sector attribution.
