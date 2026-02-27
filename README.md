# Portfolio Simulator

A personal investment research tool for building and tracking a custom stock portfolio against a benchmark. Analyze allocations, run backtests, compute risk metrics, and get signal-based insights — all in the browser.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Get a free Finnhub API key

Sign up at [finnhub.io/register](https://finnhub.io/register) — the free tier (60 calls/min) is all you need.

### 3. Start the dev server

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### 4. Enter your API key

The app will prompt you for your Finnhub key on first visit. It's stored in your browser's localStorage and only sent to Finnhub.

### 5. Build your portfolio

Add stocks by typing ticker symbols (e.g. AAPL, MSFT, TSLA). Each stock gets:

- **Entry price** — your cost basis (defaults to current market price)
- **Tier** — 1 (highest conviction), 2 (strong), or 3 (speculative)
- **Sector** — for grouping in analysis

Or click **"Load Energy Portfolio Template"** to start with a pre-built 11-stock energy/infrastructure portfolio.

## Features

### Dashboard
Live quotes, portfolio value, total return vs benchmark, daily P&L, weighted P/E, dividend yield, and signal health for every stock.

### Allocations
Set target allocation percentages per stock with sliders. Apply dynamic presets:
- **Equal Weight** — 100/N to each stock
- **Tier Weighted** — Tier 1 gets 3x, Tier 2 gets 2x, Tier 3 gets 1x
- **Conviction Focus** — only Tier 1+2 stocks, Tier 3 zeroed

Use **Manage Stocks** to add, remove, or edit stocks at any time.

### Analysis
Click "Load Historical Data" to fetch 1 year of daily prices, then view:
- Backtest (portfolio vs benchmark value over time)
- Risk metrics (Sharpe, Sortino, Beta, Alpha, Max Drawdown)
- Correlation matrix
- Sector and tier attribution

### Signals
Technical analysis for each stock:
- RSI(14), 50/200-day moving averages, golden/death crosses
- Composite BUY/HOLD/SELL score
- Rebalance drift detection
- Stop-loss and take-profit alerts
- AI-style insights panel with actionable suggestions

### Catalysts
Upcoming earnings dates and events for stocks in your portfolio.

## Managing Your Portfolio

You can modify your portfolio at any time from the **Allocations** tab:

1. Click **Manage Stocks** to expand the stock manager
2. **Add** — type a ticker, pick from search results or press Enter
3. **Edit** — change sector, tier, or entry price inline
4. **Remove** — click the × button next to any stock

Changes take effect immediately across all tabs.

## Tech Stack

- React 19 (Vite, plain JSX)
- Zustand for state management (persisted to localStorage)
- Tailwind CSS v4 (dark theme)
- Recharts for charts
- Finnhub API for live quotes and historical candles
- Yahoo Finance (via Vite dev-server proxy) for fundamentals

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (required for Yahoo Finance proxy) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |

## Notes

- All data is stored locally in your browser — nothing is sent to any server except Finnhub and Yahoo Finance for market data
- Yahoo Finance fundamentals (P/E, dividends, market cap) only work during `npm run dev` since they use a Vite dev-server middleware
- Existing users upgrading from the hardcoded version will have their 11 energy stocks auto-migrated
