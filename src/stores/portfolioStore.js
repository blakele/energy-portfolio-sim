import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_STOCKS, DEFAULT_BENCHMARK } from '../config/portfolio.js';
import { computeDynamicPresets, DEFAULT_PRESET } from '../config/presets.js';

const initialPresets = computeDynamicPresets(DEFAULT_STOCKS);
const defaultAllocations = initialPresets[DEFAULT_PRESET] || {};

export const usePortfolioStore = create(
  persist(
    (set, get) => ({
      // Portfolio definition
      stocks: [...DEFAULT_STOCKS],
      benchmark: { ...DEFAULT_BENCHMARK },
      setupComplete: false,
      quickStartDismissed: false,

      // Allocation state
      investmentAmount: 100000,
      allocations: { ...defaultAllocations },
      shares: {},  // { symbol: shareCount } — user-entered share counts
      selectedPreset: DEFAULT_PRESET,
      stopLossConfig: {},

      // --- Stock CRUD ---
      addStock: (stockDef) =>
        set(state => {
          if (state.stocks.some(s => s.symbol === stockDef.symbol)) return state;
          const newStocks = [...state.stocks, stockDef];
          return {
            stocks: newStocks,
            allocations: { ...state.allocations, [stockDef.symbol]: 0 },
          };
        }),

      removeStock: (symbol) =>
        set(state => {
          const newStocks = state.stocks.filter(s => s.symbol !== symbol);
          const { [symbol]: _alloc, ...restAlloc } = state.allocations;
          const { [symbol]: _sh, ...restShares } = state.shares;
          const { [symbol]: _sl, ...restSL } = state.stopLossConfig;
          return {
            stocks: newStocks,
            allocations: restAlloc,
            shares: restShares,
            stopLossConfig: restSL,
            selectedPreset: null,
          };
        }),

      updateStock: (symbol, updates) =>
        set(state => ({
          stocks: state.stocks.map(s =>
            s.symbol === symbol ? { ...s, ...updates } : s
          ),
        })),

      setBenchmark: (benchmarkDef) => set({ benchmark: benchmarkDef }),

      completeSetup: () => set({ setupComplete: true }),
      dismissQuickStart: () => set({ quickStartDismissed: true }),

      resetPortfolio: () =>
        set({
          stocks: [...DEFAULT_STOCKS],
          benchmark: { ...DEFAULT_BENCHMARK },
          allocations: { ...defaultAllocations },
          shares: {},
          selectedPreset: DEFAULT_PRESET,
          setupComplete: false,
          quickStartDismissed: false,
          stopLossConfig: {},
        }),

      // --- Allocation actions ---
      setAllocation: (symbol, pct) =>
        set(state => ({
          allocations: { ...state.allocations, [symbol]: Math.max(0, Math.min(100, pct)) },
          selectedPreset: null,
        })),

      applyPreset: (name) =>
        set(state => {
          const presets = computeDynamicPresets(state.stocks);
          const preset = presets[name];
          if (!preset) return state;
          return {
            allocations: { ...preset },
            selectedPreset: name,
          };
        }),

      setInvestmentAmount: (amount) => set({ investmentAmount: amount }),

      // --- Share-based entry ---
      setShares: (symbol, count) =>
        set(state => ({
          shares: { ...state.shares, [symbol]: Math.max(0, count) },
        })),

      applyShareAllocations: (prices) =>
        set(state => {
          const { shares, stocks } = state;
          let totalValue = 0;
          const values = {};
          for (const stock of stocks) {
            const count = shares[stock.symbol] || 0;
            const price = prices[stock.symbol] || stock.entryPrice;
            const val = count * price;
            values[stock.symbol] = val;
            totalValue += val;
          }
          if (totalValue === 0) return state;
          const allocations = {};
          for (const stock of stocks) {
            allocations[stock.symbol] = Math.round(((values[stock.symbol] || 0) / totalValue) * 1000) / 10;
          }
          // Fix rounding to exactly 100%
          const sum = Object.values(allocations).reduce((a, b) => a + b, 0);
          const diff = 100 - sum;
          if (diff !== 0) {
            const maxKey = Object.entries(allocations).sort((a, b) => b[1] - a[1])[0]?.[0];
            if (maxKey) allocations[maxKey] = Math.round((allocations[maxKey] + diff) * 10) / 10;
          }
          // Also update investmentAmount to match total portfolio value
          return { allocations, investmentAmount: Math.round(totalValue), selectedPreset: null };
        }),

      normalize: () =>
        set(state => {
          const total = Object.values(state.allocations).reduce((a, b) => a + b, 0);
          if (total === 0) return state;
          const factor = 100 / total;
          const normalized = {};
          Object.entries(state.allocations).forEach(([k, v]) => {
            normalized[k] = Math.round(v * factor * 10) / 10;
          });
          const diff = 100 - Object.values(normalized).reduce((a, b) => a + b, 0);
          const maxKey = Object.entries(normalized).sort((a, b) => b[1] - a[1])[0][0];
          normalized[maxKey] = Math.round((normalized[maxKey] + diff) * 10) / 10;
          return { allocations: normalized };
        }),

      getTotalAllocation: () =>
        Object.values(get().allocations).reduce((a, b) => a + b, 0),

      getInvestedAmount: (symbol) => {
        const { investmentAmount, allocations } = get();
        return investmentAmount * ((allocations[symbol] || 0) / 100);
      },

      setStopLoss: (symbol, stopLossPct, takeProfitPct) =>
        set(state => ({
          stopLossConfig: {
            ...state.stopLossConfig,
            [symbol]: { stopLossPct, takeProfitPct },
          },
        })),

      removeStopLoss: (symbol) =>
        set(state => {
          const { [symbol]: _, ...rest } = state.stopLossConfig;
          return { stopLossConfig: rest };
        }),
    }),
    {
      name: 'energy-sim-portfolio',
      version: 4,
      migrate: (persisted, version) => {
        if (version === 0 || version === 1 || version === undefined) {
          persisted = {
            ...persisted,
            stocks: [...DEFAULT_STOCKS],
            benchmark: { ...DEFAULT_BENCHMARK },
            setupComplete: true,
          };
          version = 2;
        }
        if (version === 2) {
          persisted = {
            ...persisted,
            quickStartDismissed: true,
          };
          version = 3;
        }
        if (version === 3) {
          // v3 → v4: add shares field
          persisted = {
            ...persisted,
            shares: {},
          };
        }
        return persisted;
      },
    }
  )
);
